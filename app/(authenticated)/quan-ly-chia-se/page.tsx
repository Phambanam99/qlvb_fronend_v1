"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Share2,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  Folder,
  AlertCircle
} from "lucide-react";

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

export default function PublicShareManagement() {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    folderPath: '',
    description: '',
    expiresIn: 'unlimited' // mặc định không giới hạn
  });

  useEffect(() => {
    fetchSharedLinks();
  }, []);

  const fetchSharedLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public-share');
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setSharedLinks(data.links || []);
        } else {
          setSharedLinks([]);
        }
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to fetch shared links');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách link chia sẻ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSharedLink = async () => {
    if (!formData.folderPath.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đường dẫn thư mục",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const payload = {
        folderPath: formData.folderPath.trim(),
        description: formData.description.trim() || undefined,
        expiresIn: formData.expiresIn && formData.expiresIn !== 'unlimited' ? parseInt(formData.expiresIn) : undefined
      };

      const response = await fetch('/api/public-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          toast({
            title: "Thành công",
            description: "Đã tạo link chia sẻ thành công",
          });
          
          // Copy link to clipboard
          if (data.shareUrl) {
            navigator.clipboard.writeText(data.shareUrl);
            toast({
              title: "Đã sao chép",
              description: "Link chia sẻ đã được sao chép vào clipboard",
            });
          }

          setDialogOpen(false);
          setFormData({ folderPath: '', description: '', expiresIn: 'unlimited' });
          fetchSharedLinks();
        } else {
          throw new Error('Empty response from server');
        }
      } else {
        const errorText = await response.text();
        let errorMessage = 'Failed to create shared link';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          console.error('API Error Text:', errorText);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo link chia sẻ",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteSharedLink = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa link chia sẻ này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/public-share?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã xóa link chia sẻ",
        });
        fetchSharedLinks();
      } else {
        throw new Error('Failed to delete shared link');
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa link chia sẻ",
        variant: "destructive",
      });
    }
  };

  const copyShareUrl = (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Đã sao chép",
      description: "Link chia sẻ đã được sao chép vào clipboard",
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const isExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (link: SharedLink) => {
    if (!link.isActive) {
      return <Badge variant="secondary">Đã tắt</Badge>;
    }
    
    if (isExpired(link.expiresAt)) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }
    
    return <Badge variant="default">Hoạt động</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý chia sẻ file</h1>
          <p className="text-gray-600">Tạo và quản lý các link chia sẻ file public</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo link chia sẻ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo link chia sẻ mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folderPath">Đường dẫn thư mục *</Label>
                <Input
                  id="folderPath"
                  placeholder="Ví dụ: documents/shared hoặc uploads/public"
                  value={formData.folderPath}
                  onChange={(e) => setFormData({ ...formData, folderPath: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Đường dẫn tương đối từ thư mục public/
                </p>
              </div>
              
              <div>
                <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả về nội dung được chia sẻ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="expiresIn">Thời hạn (tùy chọn)</Label>
                <Select
                  value={formData.expiresIn}
                  onValueChange={(value) => setFormData({ ...formData, expiresIn: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời hạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Không giới hạn</SelectItem>
                    <SelectItem value="1">1 ngày</SelectItem>
                    <SelectItem value="7">7 ngày</SelectItem>
                    <SelectItem value="30">30 ngày</SelectItem>
                    <SelectItem value="90">90 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button onClick={createSharedLink} disabled={creating}>
                  {creating ? "Đang tạo..." : "Tạo link"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shared Links List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Danh sách link chia sẻ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : sharedLinks.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Chưa có link chia sẻ nào</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo link đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thư mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-blue-500" />
                        /{link.folderPath}
                      </div>
                    </TableCell>
                    <TableCell>
                      {link.description || (
                        <span className="text-gray-400 italic">Không có mô tả</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(link)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(link.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {link.expiresAt ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(link.expiresAt)}
                          {isExpired(link.expiresAt) && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Vĩnh viễn</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyShareUrl(link.token)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/share/${link.token}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSharedLink(link.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}