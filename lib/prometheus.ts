/**
 * lib/prometheus.ts
 *
 * Singleton Prometheus registry for Nexora.
 * All custom metrics are defined here and re-exported for use across the app
 * and the embedding worker (via Pushgateway).
 *
 * Metrics exposed: 
 *  - nexora_chat_requests_total          (Counter)   – chat request outcomes
 *  - nexora_chat_llm_duration_seconds    (Histogram) – LLM latency
 *  - nexora_embedding_jobs_total         (Counter)   – embedding job outcomes
 *  - nexora_embedding_duration_seconds   (Histogram) – embedding job duration
 *  - nexora_ai_model_calls_total         (Counter)   – all AI API calls
 *  - nexora_errors_total                 (Counter)   – application errors by source
 *  - nexora_server_action_duration_s     (Histogram) – Next.js server action latency
 *  - nexora_quota_exceeded_total         (Counter)   – monthly quota hits
 *  + default Node.js process metrics (CPU, memory, event loop lag, GC)
 */

import {
  Registry,
  Counter,
  Histogram,
  collectDefaultMetrics,
} from '@prometheus-io/client';

// ── Singleton registry ─────────────────────────────────────────────────────────
// We use a module-level singleton so that Next.js hot-reload doesn't create
// duplicate metric registrations.

const globalForPrometheus = globalThis as typeof globalThis & {
  _nexoraPromRegistry?: Registry;
};

function createRegistry(): Registry {
  const registry = new Registry();

  // Collect default Node.js process metrics (CPU, memory, GC, event loop)
  collectDefaultMetrics({ register: registry, prefix: 'nexora_process_' });

  return registry;
}

export const promRegistry: Registry =
  globalForPrometheus._nexoraPromRegistry ??
  (globalForPrometheus._nexoraPromRegistry = createRegistry());

//   Helper: safe metric registration  
// Guards against duplicate registrations during Next.js hot-reload in dev.
function safeRegister<T extends Counter<string> | Histogram<string>>(
  factory: () => T,
  name: string,
): T {
  const existing = promRegistry.getSingleMetric(name);
  if (existing) return existing as T;
  return factory();
}

// ── Chat metrics ───────────────────────────────────────────────────────────────

/** Count of chat requests labelled by model name and outcome status */
export const chatRequestsTotal = safeRegister(
  () =>
    new Counter({
      name: 'nexora_chat_requests_total',
      help: 'Total number of chat requests processed',
      labelNames: ['model', 'status'] as const,
      registers: [promRegistry],
    }),
  'nexora_chat_requests_total',
);

/** LLM response time distribution (seconds) */
export const chatLLMDurationSeconds = safeRegister(
  () =>
    new Histogram({
      name: 'nexora_chat_llm_duration_seconds',
      help: 'LLM call duration in seconds',
      labelNames: ['model'] as const,
      buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30],
      registers: [promRegistry],
    }),
  'nexora_chat_llm_duration_seconds',
);

// ── Embedding metrics ──────────────────────────────────────────────────────────

/** Embedding jobs labelled by source type and outcome status */
export const embeddingJobsTotal = safeRegister(
  () =>
    new Counter({
      name: 'nexora_embedding_jobs_total',
      help: 'Total embedding jobs by type and status',
      labelNames: ['type', 'status'] as const,
      registers: [promRegistry],
    }),
  'nexora_embedding_jobs_total',
);

/** Embedding job duration distribution (seconds) */
export const embeddingDurationSeconds = safeRegister(
  () =>
    new Histogram({
      name: 'nexora_embedding_duration_seconds',
      help: 'Embedding job processing duration in seconds',
      labelNames: ['type'] as const,
      buckets: [1, 5, 15, 30, 60, 120, 300, 600],
      registers: [promRegistry],
    }),
  'nexora_embedding_duration_seconds',
);

// ── AI model call metrics ──────────────────────────────────────────────────────

/** All AI API calls labelled by provider, model name, and operation type */
export const aiModelCallsTotal = safeRegister(
  () =>
    new Counter({
      name: 'nexora_ai_model_calls_total',
      help: 'Total AI API calls by provider, model, and operation',
      labelNames: ['provider', 'model', 'operation'] as const,
      registers: [promRegistry],
    }),
  'nexora_ai_model_calls_total',
);

// ── Error metrics ──────────────────────────────────────────────────────────────

/** Application errors labelled by originating source and error code/type */
export const errorsTotal = safeRegister(
  () =>
    new Counter({
      name: 'nexora_errors_total',
      help: 'Total application errors by source and error code',
      labelNames: ['source', 'code'] as const,
      registers: [promRegistry],
    }),
  'nexora_errors_total',
);

// ── Server action latency ──────────────────────────────────────────────────────

/** Next.js server action execution time distribution (seconds) */
export const serverActionDurationSeconds = safeRegister(
  () =>
    new Histogram({
      name: 'nexora_server_action_duration_seconds',
      help: 'Next.js server action execution duration in seconds',
      labelNames: ['action'] as const,
      buckets: [0.05, 0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [promRegistry],
    }),
  'nexora_server_action_duration_seconds',
);

// ── Quota metrics ──────────────────────────────────────────────────────────────

/** Count of times a user hit their monthly quota limit */
export const quotaExceededTotal = safeRegister(
  () =>
    new Counter({
      name: 'nexora_quota_exceeded_total',
      help: 'Total number of times users hit their monthly quota limit',
      labelNames: [] as const,
      registers: [promRegistry],
    }),
  'nexora_quota_exceeded_total',
);

// ── Pushgateway helper (used by embedding worker) ──────────────────────────────

/**
 * Push metrics from the embedding worker to the Prometheus Pushgateway.
 * Only call this from the worker process — not from Next.js.
 *
 * @param jobGroup  A label group name for the push (e.g. "embedding_worker")
 */
export async function pushMetricsToGateway(jobGroup = 'nexora_worker'): Promise<void> {
  const pushgatewayUrl = process.env.PUSHGATEWAY_URL;
  if (!pushgatewayUrl) return;

  try {
    const metricsText = await promRegistry.metrics();
    const url = `${pushgatewayUrl}/metrics/job/${jobGroup}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; version=0.0.4' },
      body: metricsText,
    });

    if (!res.ok) {
      console.warn(`[Prometheus] Pushgateway push failed: HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn('[Prometheus] Failed to push metrics to Pushgateway', err);
  }
}
