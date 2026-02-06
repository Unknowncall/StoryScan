import { NextRequest, NextResponse } from 'next/server';
import { getSnapshots } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pathIdsParam = searchParams.get('pathIds');
    const range = searchParams.get('range') || 'ALL';

    if (!pathIdsParam) {
      return NextResponse.json({ error: 'pathIds query parameter is required' }, { status: 400 });
    }

    const pathIds = pathIdsParam
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (pathIds.length === 0) {
      return NextResponse.json({ error: 'At least one valid pathId is required' }, { status: 400 });
    }

    const validRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];
    if (!validRanges.includes(range)) {
      return NextResponse.json(
        { error: `Invalid range. Must be one of: ${validRanges.join(', ')}` },
        { status: 400 }
      );
    }

    const snapshots = getSnapshots(pathIds, range);
    return NextResponse.json({ snapshots });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch snapshots', details: (error as Error).message },
      { status: 500 }
    );
  }
}
