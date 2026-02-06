import { NextRequest, NextResponse } from 'next/server';
import { getAllTrackedPaths, addTrackedPath } from '@/lib/db';

export async function GET() {
  try {
    const paths = getAllTrackedPaths();
    return NextResponse.json({ trackedPaths: paths });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tracked paths', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: pathStr, label, directoryConfigId } = body;

    if (!pathStr || !label) {
      return NextResponse.json({ error: 'path and label are required' }, { status: 400 });
    }

    const trackedPath = addTrackedPath(pathStr, label, directoryConfigId);
    return NextResponse.json({ trackedPath }, { status: 201 });
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Path is already being tracked' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Failed to add tracked path', details: message },
      { status: 500 }
    );
  }
}
