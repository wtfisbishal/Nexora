 
import { Worker, Job } from 'bullmq';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import { YoutubeTranscript } from 'youtube-transcript';
import {
  embeddingJobsTotal,
  embeddingDurationSeconds,
  errorsTotal,
  pushMetricsToGateway,
} from '../lib/prometheus';
 
dotenv.config({ path: '.env' });
 
import prisma from '../lib/prisma';
 
const isDev = process.env.NODE_ENV !== 'production';
function log(level: string, msg: string, meta?: object) {
  const entry = { ts: new Date().toISOString(), level, msg, ...meta };
  if (isDev) {
    console.log(`[${level.toUpperCase()}] ${msg}`, meta ?? '');
  } else {
    console.log(JSON.stringify(entry));
  }
}

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY,
});

const qclient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const useTls = process.env.REDIS_TLS === 'true';

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL, tls: useTls ? {} : undefined }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      tls: useTls ? {} : undefined,
    };


const MAX_GITHUB_FILES = parseInt(process.env.MAX_GITHUB_FILES || '300');
const MAX_PDF_SIZE_MB = parseInt(process.env.MAX_PDF_SIZE_MB || '20');

async function loadGithubRepo(url: string, token: string): Promise<Document[]> {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  const [, owner, repo] = match;
 
  let treeData: { tree: { type: string; path: string; url: string }[] } | null = null;
  for (const branch of ['main', 'master']) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      treeData = await res.json();
      break;
    }
  }
  if (!treeData) throw new Error('Could not fetch repo tree for main or master branch');

  const blobs = treeData.tree.filter((f) => f.type === 'blob');

  //  reject repos that are too large
  if (blobs.length > MAX_GITHUB_FILES) {
    throw new Error(
      `Repo has ${blobs.length} files which exceeds the limit of ${MAX_GITHUB_FILES}. ` +
      `Set MAX_GITHUB_FILES env var to increase this limit.`
    );
  }

  const ignorePatterns = [
    /\.md$/,
    /node_modules/,
    /dist/,
    /build/,
    /tests?/,
    /\.github/,
    /\.vscode/,
    /yarn\.lock/,
    /package-lock\.json/,
    /\.(png|jpe?g|gif|svg|ico|webp|woff2?|ttf|eot)$/i,
    /\.(min\.js|min\.css)$/,
  ];

  const docs: Document[] = [];

  // Process files in batches of 10 to avoid overwhelming GitHub API
  const BATCH_SIZE = 10;
  const filtered = blobs.filter((f) => !ignorePatterns.some((p) => p.test(f.path)));

  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (file) => {
        const fileRes = await fetch(file.url, { headers: { Authorization: `Bearer ${token}` } });
        if (!fileRes.ok) return null;
        const fileData = await fileRes.json();
        if (fileData.encoding === 'base64') {
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          return new Document({ pageContent: content, metadata: { source: file.path } });
        }
        return null;
      })
    );
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        docs.push(result.value);
      }
    }
  }

  return docs;
}

async function loadWebpage(url: string): Promise<Document[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000); // 15s timeout
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    // Remove scripts, styles, nav, footer 
    $('script, style, nav, footer, header, [role="navigation"]').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return [new Document({ pageContent: text, metadata: { source_url: url, source_type: 'web' } })];
  } finally {
    clearTimeout(timeout);
  }
}

async function splitAndEmbed(docs: Document[], collectionName: string, chunkSize = 1000, chunkOverlap = 200) {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  const splitDocs = await splitter.splitDocuments(docs);
  if (!splitDocs.length) throw new Error('No content to embed after splitting');
  await QdrantVectorStore.fromDocuments(splitDocs, embeddings, { client: qclient, collectionName });
}
 
interface EmbeddingJobData {
  url: string;
  type: 'github' | 'yt' | 'web' | 'text' | 'pdf';
  collectionName: string;
  mode: 'bot' | 'notebook';
  userId?: string;
  base64Pdf?: string;
  fileName?: string;
  modelId: string;
}

const worker = new Worker<EmbeddingJobData>(
  'embedding-queue',
  async (job: Job<EmbeddingJobData>) => {
    const { url, type, collectionName, modelId, base64Pdf, fileName } = job.data;

    log('info', `Processing job`, { jobId: job.id, modelId, type });
    const startTime = Date.now();

    // Start Prometheus histogram timer for this job
    const endPromTimer = embeddingDurationSeconds.startTimer({ type });

    try {
      let docs: Document[] = [];

      if (type === 'github') {
        if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN env var is not set');
        docs = await loadGithubRepo(url, process.env.GITHUB_TOKEN);
        await splitAndEmbed(docs, collectionName, 1200, 200);

      } else if (type === 'yt') {
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        if (!transcript?.length) throw new Error('No transcript found for this video');
        const text = transcript.map((t) => t.text).join(' ');
        docs = [new Document({ pageContent: text, metadata: { source: url, source_type: 'youtube' } })];
        await splitAndEmbed(docs, collectionName, 1000, 200);

      } else if (type === 'web') {
        docs = await loadWebpage(url);
        await splitAndEmbed(docs, collectionName, 1000, 200);

      } else if (type === 'text') {
        docs = [new Document({ pageContent: url, metadata: { source_type: 'text' } })];
        await splitAndEmbed(docs, collectionName, 1000, 200);

      } else if (type === 'pdf') {
        if (!base64Pdf) throw new Error('base64Pdf is required for PDF jobs');
        const pdfBuffer = Buffer.from(base64Pdf, 'base64');
        const sizeMB = pdfBuffer.length / (1024 * 1024);
        if (sizeMB > MAX_PDF_SIZE_MB) {
          throw new Error(`PDF size ${sizeMB.toFixed(1)}MB exceeds limit of ${MAX_PDF_SIZE_MB}MB`);
        }
        const data = await pdfParse(pdfBuffer);
        if (!data.text?.trim()) throw new Error('Could not extract text from PDF');
        docs = [new Document({ pageContent: data.text, metadata: { source: fileName ?? 'document', source_type: 'pdf' } })];
        await splitAndEmbed(docs, collectionName, 1000, 200);
      } else {
        throw new Error(`Unknown job type: ${type}`);
      }
 
      await prisma.models.update({
        where: { id: modelId },
        data: { status: 'COMPLETED' },
      });

      const duration = Date.now() - startTime;
      log('info', `Job completed`, { jobId: job.id, modelId, type, durationMs: duration });

      // ── Prometheus: record success metrics ──────────────────────────────────
      endPromTimer();
      embeddingJobsTotal.inc({ type, status: 'completed' });
      // Push accumulated metrics to Pushgateway (fire-and-forget)
      pushMetricsToGateway('nexora_worker').catch(() => {});

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      log('error', `Job failed`, { jobId: job.id, modelId, type, error: message });

      // ── Prometheus: record failure metrics ──────────────────────────────────
      endPromTimer();
      embeddingJobsTotal.inc({ type, status: 'failed' });
      errorsTotal.inc({ source: 'embedding_worker', code: 'job_failed' });
      // Push accumulated metrics to Pushgateway (fire-and-forget)
      pushMetricsToGateway('nexora_worker').catch(() => {});

      await prisma.models.update({
        where: { id: modelId },
        data: { status: 'FAILED' },
      });

      throw error;  
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'), // process   to 5 jobs in parallel
  }
);

worker.on('completed', (job) => {
  log('info', `Job completed event`, { jobId: job.id });
});

worker.on('failed', (job, err) => {
  log('error', `Job failed event`, { jobId: job?.id, error: err.message });
});

worker.on('error', (err) => {
  log('error', 'Worker error', { error: err.message });
});

log('info', 'Embedding worker started' );
