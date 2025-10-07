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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || 'db52bce9-fcdf-4903-ae24-17838b304640';
    
    // Debug info
    const debugInfo: any = {
      cwd: process.cwd(),
      token,
      sharedLinksFile: SHARED_LINKS_FILE,
      platform: process.platform
    };

    // Read shared links
    try {
      const data = await fs.readFile(SHARED_LINKS_FILE, 'utf-8');
      const sharedLinks: SharedLink[] = JSON.parse(data);
      debugInfo.sharedLinks = sharedLinks;
      
      const sharedLink = sharedLinks.find(link => 
        link.token === token && 
        link.isActive &&
        (!link.expiresAt || new Date(link.expiresAt) > new Date())
      );
      
      debugInfo.foundLink = sharedLink;
      
      if (sharedLink) {
        const basePath = path.join(process.cwd(), 'public', sharedLink.folderPath);
        const resolvedBasePath = path.resolve(basePath);
        
        debugInfo.paths = {
          folderPath: sharedLink.folderPath,
          basePath,
          resolvedBasePath
        };
        
        // Check if directory exists
        try {
          await fs.access(resolvedBasePath);
          debugInfo.directoryExists = true;
          
          // List files
          const files = await fs.readdir(resolvedBasePath, { withFileTypes: true });
          debugInfo.files = files.map(f => ({
            name: f.name,
            isDirectory: f.isDirectory()
          }));
        } catch (error) {
          debugInfo.directoryExists = false;
          debugInfo.accessError = (error as Error).message;
        }
      }
    } catch (error) {
      debugInfo.fileReadError = (error as Error).message;
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}