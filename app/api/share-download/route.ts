import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface SharedLink {
  id: string;
  token: string;
  folderPath: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdBy: string;
  description?: string;
}

const SHARED_LINKS_FILE = path.join(process.cwd(), 'data', 'shared-links.json');

async function getSharedLinks(): Promise<SharedLink[]> {
  try {
    const data = await fs.readFile(SHARED_LINKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const filePath = searchParams.get('path') || '';

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Tìm shared link bằng token
    const sharedLinks = await getSharedLinks();
    const sharedLink = sharedLinks.find(link => 
      link.token === token && 
      link.isActive &&
      (!link.expiresAt || new Date(link.expiresAt) > new Date())
    );

    if (!sharedLink) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 404 }
      );
    }

    // Xây dựng đường dẫn đầy đủ
    const basePath = path.join(process.cwd(), 'public', sharedLink.folderPath);
    const fullPath = path.join(basePath, filePath);

    // Kiểm tra bảo mật
    const resolvedPath = path.resolve(fullPath);
    const resolvedBasePath = path.resolve(basePath);
    
    const normalizedResolvedPath = path.normalize(resolvedPath);
    const normalizedResolvedBasePath = path.normalize(resolvedBasePath);
    
    if (!normalizedResolvedPath.startsWith(normalizedResolvedBasePath)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Kiểm tra file có tồn tại không
    try {
      await fs.access(normalizedResolvedPath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const stats = await fs.stat(normalizedResolvedPath);
    
    if (stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Cannot download directory' },
        { status: 400 }
      );
    }

    // Đọc file và trả về
    const fileBuffer = await fs.readFile(normalizedResolvedPath);
    const fileName = path.basename(normalizedResolvedPath);
    
    // Xác định Content-Type dựa trên extension
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    };

    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}