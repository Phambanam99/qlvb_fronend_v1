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

async function getFileList(dirPath: string): Promise<any[]> {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const fileList = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      const stats = await fs.stat(filePath);

      if (file.isDirectory()) {
        fileList.push({
          name: file.name,
          type: 'directory',
          size: 0,
          modifiedAt: stats.mtime.toISOString()
        });
      } else {
        fileList.push({
          name: file.name,
          type: 'file',
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
          extension: path.extname(file.name).toLowerCase()
        });
      }
    }

    return fileList.sort((a, b) => {
      // Thư mục trước, file sau
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params?.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subPath = searchParams.get('path') || '';

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
    const fullPath = path.join(basePath, subPath);

    // Kiểm tra bảo mật - không cho phép truy cập ra ngoài thư mục được chia sẻ
    const resolvedPath = path.resolve(fullPath);
    const resolvedBasePath = path.resolve(basePath);
    
    // Sử dụng path.normalize để đảm bảo tương thích với Windows
    const normalizedResolvedPath = path.normalize(resolvedPath);
    const normalizedResolvedBasePath = path.normalize(resolvedBasePath);
    
    if (!normalizedResolvedPath.startsWith(normalizedResolvedBasePath)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Kiểm tra đường dẫn có tồn tại không
    try {
      await fs.access(normalizedResolvedPath);
    } catch {
      return NextResponse.json(
        { error: 'Path not found' },
        { status: 404 }
      );
    }

    const stats = await fs.stat(normalizedResolvedPath);

    if (stats.isDirectory()) {
      // Trả về danh sách file trong thư mục
      const files = await getFileList(normalizedResolvedPath);
      
      return NextResponse.json({
        type: 'directory',
        path: subPath,
        files,
        shareInfo: {
          description: sharedLink.description,
          createdAt: sharedLink.createdAt,
          expiresAt: sharedLink.expiresAt
        }
      });
    } else {
      // Trả về thông tin file
      return NextResponse.json({
        type: 'file',
        name: path.basename(normalizedResolvedPath),
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
        downloadUrl: `/api/public-share/${token}/download?path=${encodeURIComponent(subPath)}`
      });
    }

  } catch (error) {
    console.error('Error accessing shared content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}