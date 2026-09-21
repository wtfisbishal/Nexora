/**
 * app/api/metrics/route.ts
 *
 * Prometheus scrape endpoint for Nexora.
 *
 * Security: Protected by a Bearer token (METRICS_TOKEN env var).
 * Prometheus is configured to send this token in the Authorization header.
 *
 * Content-Type: text/plain; version=0.0.4  (Prometheus text exposition format)
 *
 * Usage (manual verification):
 *   curl -H "Authorization: Bearer $METRICS_TOKEN" http://localhost:3000/api/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { promRegistry } from '@/lib/prometheus';

export const dynamic = 'force-dynamic'; // Never cache this route

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── Auth check ─────────────────────────────────────────────────────────────
  const metricsToken = process.env.METRICS_TOKEN;

  if (metricsToken) {
    const authHeader = req.headers.get('authorization') ?? '';
    const providedToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : '';

    if (providedToken !== metricsToken) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Bearer realm="Nexora Metrics"' },
      });
    }
  } else {
    // Warn if running in production without a token — metrics will be public
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[Prometheus] METRICS_TOKEN is not set. ' +
          'The /api/metrics endpoint is publicly accessible. ' +
          'Set METRICS_TOKEN in your environment to secure it.',
      );
    }
  }

  // ── Scrape metrics ─────────────────────────────────────────────────────────
  try {
    const [metricsText, contentType] = await Promise.all([
      promRegistry.metrics(),
      Promise.resolve(promRegistry.contentType),
    ]);

    return new NextResponse(metricsText, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[Prometheus] Failed to collect metrics', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
