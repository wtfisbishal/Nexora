'use server'
 
import prisma from "@/lib/prisma"; 
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { embeddingQueue } from "@/lib/queue";
import {
  embeddingJobsTotal,
  serverActionDurationSeconds,
  errorsTotal,
  aiModelCallsTotal,
} from '@/lib/prometheus';

export const generateEmbeddings = async (
    url: string,
    type: 'yt' | 'text' | 'web' | 'github',
    collecttion: string,
    mode: 'bot' | 'notebook',
    targetModelId?: string
) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id!;
    let name = "Untitled";

    if (!url && !collecttion && !type) {
        return "Invalid parameters"
    }
 
    if (type === 'github') 
        name = url.replace(/https:\/\/github\.com\//, '').replace(/\/$/, '').split('/').join('_');

    else if (type === 'yt') 
        name =  url.replace(/https:\/\/(www\.)?youtube\.com\/watch\?v=/, '').replace(/&.*$/, '');
    else if (type === 'web') 
        name =  url.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/').join('_');
    
    else if (type === 'text') name = `text_document`;

    // Track server action duration
    const endActionTimer = serverActionDurationSeconds.startTimer({ action: 'generateEmbeddings' });

    try {
        let model;

        if (targetModelId) {
             const existing = await prisma.models.findUnique({
                where: { id: targetModelId }
            });
            if (!existing || existing.userId !== userId) {
                throw new Error("Target model not found or unauthorized");
            }
             collecttion = existing.collection_name ?? collecttion;

             model = await prisma.models.update({
                where: { id: targetModelId },
                data: { status: 'PENDING' }
            });
        } else {
             model = await prisma.models.create({
                data: {
                    collection_name: collecttion,
                    source: type,
                    userId,
                    type: mode,
                    name: name,
                    status: 'PENDING'
                }
            });
        }

         await embeddingQueue.add('generate-embedding', {
            url,
            type,
            collectionName: collecttion,
            mode,
            userId,
            modelId: model.id
        });

        // Track AI embedding model call + job queued
        aiModelCallsTotal.inc({ provider: 'openai', model: 'text-embedding-3-small', operation: 'embed' });
        embeddingJobsTotal.inc({ type, status: 'queued' });
        endActionTimer();

        return JSON.parse(JSON.stringify(model));
    } catch (error) {
        errorsTotal.inc({ source: 'embedding_action', code: 'queue_failed' });
        endActionTimer();
        console.error("Error creating embedding job:", error);
        throw new Error("Failed to enqueue embedding job");
    }
}

 
export const LoadPdfEmbedingsFromBuffer = async (
    base64Pdf: string,
    fileName: string,
    mode: 'bot' | 'notebook',
    targetModelId?: string
) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id!;

    let collectionName = (session?.user.name ?? 'Nexora') + '_pdf_collection' + Date.now();
    let model;

    // Track server action duration
    const endActionTimer = serverActionDurationSeconds.startTimer({ action: 'LoadPdfEmbedingsFromBuffer' });

    if (targetModelId) {
        const existing = await prisma.models.findUnique({
            where: { id: targetModelId }
        });
        if (!existing || existing.userId !== userId) {
            endActionTimer();
            throw new Error("Target model not found or unauthorized");
        }
        collectionName = existing.collection_name ?? collectionName;

        model = await prisma.models.update({
            where: { id: targetModelId },
            data: { status: 'PENDING' }
        });
    } else {
        model = await prisma.models.create({
            data: {
                collection_name: collectionName,
                source: 'pdf',
                userId,
                type: mode,
                name: fileName ? fileName.replace(/\.pdf$/i, '') : 'Untitled PDF',
                status: 'PENDING'
            },
        });
    }

    console.log(base64Pdf, fileName);

    await embeddingQueue.add('generate-pdf-embedding', {
        type: 'pdf',
        collectionName,
        mode,
        userId,
        base64Pdf,
        fileName,
        modelId: model.id
    });

    // Track AI embedding model call + PDF job queued
    aiModelCallsTotal.inc({ provider: 'openai', model: 'text-embedding-3-small', operation: 'embed' });
    embeddingJobsTotal.inc({ type: 'pdf', status: 'queued' });
    endActionTimer();

    return JSON.parse(JSON.stringify(model));
}