import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
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
    const data = await fs.promises.readFile(SHARED_LINKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path') || '';

    // Tìm shared link bằng token
    const sharedLinks = await getSharedLinks();
    const sharedLink = sharedLinks.find(link => 
      link.token === token && 
      link.isActive &&
      (!link.expiresAt || new Date(link.expiresAt) > new Date())
    );

    if (!sharedLink) {
      return new NextResponse('Invalid or expired link', { status: 404 });
    }

    // Xây dựng đường dẫn đầy đủ
    const basePath = path.join(process.cwd(), 'public', sharedLink.folderPath);
    const fullPath = path.join(basePath, filePath);

    // Kiểm tra bảo mật
    const resolvedPath = path.resolve(fullPath);
    const resolvedBasePath = path.resolve(basePath);
    
    if (!resolvedPath.startsWith(resolvedBasePath)) {
      return new NextResponse('Access denied', { status: 403 });
    }

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(resolvedPath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stats = fs.statSync(resolvedPath);
    
    if (stats.isDirectory()) {
      return new NextResponse('Cannot download directory', { status: 400 });
    }

    // Đọc file và trả về
    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileName = path.basename(resolvedPath);
    
    // Xác định MIME type
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}