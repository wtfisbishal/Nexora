 

import { NextRequest, NextResponse } from 'next/server';
import metrics from '@/lib/metrics';

export async function GET(req: NextRequest) { 
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const snapshot = await metrics.getSnapshot();
  return NextResponse.json(snapshot, { status: 200 });
}
