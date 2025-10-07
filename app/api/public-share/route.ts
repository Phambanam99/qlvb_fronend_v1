import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Interface cho shared link
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

// File lưu trữ shared links (trong thực tế nên dùng database)
const SHARED_LINKS_FILE = path.join(process.cwd(), 'data', 'shared-links.json');

// Đảm bảo thư mục data tồn tại
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  return dataDir;
}

// Đọc shared links từ file
async function getSharedLinks(): Promise<SharedLink[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(SHARED_LINKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Lưu shared links vào file
async function saveSharedLinks(links: SharedLink[]) {
  await ensureDataDirectory();
  await fs.writeFile(SHARED_LINKS_FILE, JSON.stringify(links, null, 2));
}

// POST - Tạo shared link mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderPath, expiresIn, description } = body;

    if (!folderPath) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    // Kiểm tra folder có tồn tại không
    const fullPath = path.join(process.cwd(), 'public', folderPath);
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Path is not a directory' 
          },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { 
          success: false,
          error: 'Folder not found' 
        },
        { status: 404 }
      );
    }

    const sharedLinks = await getSharedLinks();
    const token = uuidv4();
    const id = uuidv4();
    
    let expiresAt;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString();
    }

    const newLink: SharedLink = {
      id,
      token,
      folderPath,
      createdAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
      createdBy: 'admin', // Trong thực tế lấy từ session
      description
    };

    sharedLinks.push(newLink);
    await saveSharedLinks(sharedLinks);

    // Tạo URL chia sẻ
    const shareUrl = `${request.nextUrl.origin}/share/${token}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      token,
      id,
      expiresAt
    }, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Error creating shared link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Lấy danh sách shared links
export async function GET() {
  try {
    const sharedLinks = await getSharedLinks();
    
    // Lọc bỏ các link đã hết hạn
    const activeLinks = sharedLinks.filter(link => {
      if (!link.isActive) return false;
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return false;
      }
      return true;
    });

    return NextResponse.json({ 
      success: true,
      links: activeLinks || [] 
    });
  } catch (error) {
    console.error('Error fetching shared links:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        links: []
      },
      { status: 500 }
    );
  }
}

// DELETE - Xóa shared link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const sharedLinks = await getSharedLinks();
    const linkIndex = sharedLinks.findIndex(link => link.id === id);

    if (linkIndex === -1) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    sharedLinks[linkIndex].isActive = false;
    await saveSharedLinks(sharedLinks);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shared link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}