import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Kiểm tra thư mục data
    const dataDir = path.join(process.cwd(), 'data');
    
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Kiểm tra thư mục public/shared-documents
    const sharedDir = path.join(process.cwd(), 'public', 'shared-documents');
    let sharedDirExists = false;
    try {
      const stats = await fs.stat(sharedDir);
      sharedDirExists = stats.isDirectory();
    } catch {
      sharedDirExists = false;
    }

    // Kiểm tra file shared-links.json
    const sharedLinksFile = path.join(dataDir, 'shared-links.json');
    let sharedLinksExists = false;
    try {
      await fs.access(sharedLinksFile);
      sharedLinksExists = true;
    } catch {
      // Tạo file mới với array rỗng
      await fs.writeFile(sharedLinksFile, '[]');
      sharedLinksExists = true;
    }

    return NextResponse.json({
      success: true,
      status: 'System ready',
      checks: {
        dataDirectory: true,
        sharedDirectory: sharedDirExists,
        sharedLinksFile: sharedLinksExists
      },
      paths: {
        dataDir,
        sharedDir,
        sharedLinksFile
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}