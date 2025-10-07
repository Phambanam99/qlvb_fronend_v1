import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subPath = searchParams.get('path') || '';
    
    const folderPath = 'shared-documents';
    const basePath = path.join(process.cwd(), 'public', folderPath);
    const fullPath = path.join(basePath, subPath);
    
    const resolvedPath = path.resolve(fullPath);
    const resolvedBasePath = path.resolve(basePath);
    
    const debugInfo = {
      platform: process.platform,
      cwd: process.cwd(),
      folderPath,
      subPath,
      basePath,
      fullPath,
      resolvedPath,
      resolvedBasePath,
      startsWithCheck: resolvedPath.startsWith(resolvedBasePath),
      normalizedResolvedPath: path.normalize(resolvedPath),
      normalizedResolvedBasePath: path.normalize(resolvedBasePath),
      normalizedStartsWithCheck: path.normalize(resolvedPath).startsWith(path.normalize(resolvedBasePath))
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}