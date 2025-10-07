"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  File,
  FileText,
  Folder,
  Image,
  Music,
  Video,
  Archive,
  Code,
  Database,
  FileSpreadsheet,
  Presentation,
  Home,
  ChevronRight,
  Calendar,
  Clock
} from "lucide-react";
import Link from "next/link";

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: string;
  extension?: string;
}

interface ShareInfo {
  description?: string;
  createdAt: string;
  expiresAt?: string;
}

interface DirectoryData {
  type: 'directory';
  path: string;
  files: FileItem[];
  shareInfo: ShareInfo;
}

export default function PublicSharePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const currentPath = searchParams.get('path') || '';
  
  const [data, setData] = useState<DirectoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [token, currentPath]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `/api/share-content?token=${token}${currentPath ? `&path=${encodeURIComponent(currentPath)}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch data';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          console.error('API Error:', errorText);
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (result.type === 'directory') {
        setData(result);
      } else {
        // Nếu là file, tự động tải xuống
        window.open(result.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') return <Folder className="h-5 w-5 text-blue-500" />;
    
    const ext = file.extension?.toLowerCase();
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.bmp':
      case '.svg':
        return <Image className="h-5 w-5 text-green-500" />;
      case '.mp4':
      case '.avi':
      case '.mov':
      case '.wmv':
      case '.flv':
        return <Video className="h-5 w-5 text-purple-500" />;
      case '.mp3':
      case '.wav':
      case '.flac':
      case '.aac':
        return <Music className="h-5 w-5 text-pink-500" />;
      case '.pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case '.doc':
      case '.docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case '.xls':
      case '.xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case '.ppt':
      case '.pptx':
        return <Presentation className="h-5 w-5 text-orange-500" />;
      case '.zip':
      case '.rar':
      case '.7z':
      case '.tar':
      case '.gz':
        return <Archive className="h-5 w-5 text-yellow-600" />;
      case '.js':
      case '.ts':
      case '.jsx':
      case '.tsx':
      case '.html':
      case '.css':
      case '.json':
      case '.xml':
        return <Code className="h-5 w-5 text-indigo-500" />;
      case '.sql':
      case '.db':
      case '.sqlite':
        return <Database className="h-5 w-5 text-gray-600" />;
      case '.txt':
      case '.md':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const buildBreadcrumbs = () => {
    if (!currentPath) return [];
    
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    for (let i = 0; i < parts.length; i++) {
      const path = parts.slice(0, i + 1).join('/');
      breadcrumbs.push({
        name: parts[i],
        path
      });
    }
    
    return breadcrumbs;
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      window.location.href = `/share/${token}?path=${encodeURIComponent(newPath)}`;
    } else {
      // Tải file
      const downloadUrl = `/api/share-content?token=${token}&path=${encodeURIComponent(currentPath ? `${currentPath}/${file.name}` : file.name)}&download=true`;
      window.open(downloadUrl, '_blank');
    }
  };

  const handleDownload = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = `/api/share-content?token=${token}&path=${encodeURIComponent(currentPath ? `${currentPath}/${file.name}` : file.name)}&download=true`;
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Lỗi</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Không có dữ liệu</p>
      </div>
    );
  }

  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">
                📁 Thư mục chia sẻ
              </CardTitle>
              {data.shareInfo.description && (
                <p className="text-muted-foreground mt-2">
                  {data.shareInfo.description}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4" />
                <span>Tạo: {formatDate(data.shareInfo.createdAt)}</span>
              </div>
              {data.shareInfo.expiresAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Hết hạn: {formatDate(data.shareInfo.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
            <Home className="h-4 w-4" />
            <Link 
              href={`/share/${token}`}
              className="text-primary hover:underline"
            >
              Gốc
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Link 
                  href={`/share/${token}?path=${encodeURIComponent(crumb.path)}`}
                  className="text-primary hover:underline"
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </div>

          {/* File list */}
          <div className="space-y-2">
            {data.files.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Thư mục trống</p>
              </div>
            ) : (
              <>
                {data.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getFileIcon(file)}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{file.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{file.type === 'directory' ? 'Thư mục' : formatFileSize(file.size)}</span>
                          <span>{formatDate(file.modifiedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {file.type === 'directory' ? (
                        <Badge variant="secondary">
                          <Folder className="h-3 w-3 mr-1" />
                          Thư mục
                        </Badge>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDownload(file, e)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Tải xuống
                          </Button>
                          <Badge variant="outline">
                            {file.extension?.toUpperCase() || 'FILE'}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}