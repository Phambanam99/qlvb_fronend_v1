"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { outgoingDocumentsAPI } from "@/lib/api/outgoingDocuments";
import { useToast } from "@/components/ui/use-toast";
import { useOutgoingDocuments } from "@/lib/store";
import { getStatusBadgeInfo } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface OutgoingDocument {
  id: number | string;
  number: string;
  title: string;
  sentDate: string;
  recipient: string;
  status: string;
}

export default function OutgoingDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();
  const { outgoingDocuments, loading, setOutgoingDocuments, setLoading } =
    useOutgoingDocuments();
  const { user, isAuthenticated } = useAuth();

  // Tách hàm fetchDocuments ra khỏi useEffect để có thể gọi ở nhiều nơi
  const fetchDocuments = async (page = currentPage, size = pageSize) => {
    try {
      // Luôn đặt trạng thái loading trước khi gọi API
      setLoading(true);
      console.log("Fetching outgoing documents with pagination:", {
        page,
        size,
      });

      // Gọi API với tham số phân trang
      const response = await outgoingDocumentsAPI.getAllDocuments(page, size);

      // Kiểm tra và xử lý dữ liệu một cách rõ ràng
      if (response && response.documents) {
        console.log("Raw API response:", response);

        // Chuyển đổi documents rõ ràng và gán vào state
        const formattedDocuments = response.documents.map((doc) => ({
          id: doc.id,
          number: doc.number || "Chưa có số",
          title: doc.title || "Không có tiêu đề",
          sentDate: doc.sentDate || "Chưa ban hành",
          recipient: doc.recipient || "Chưa xác định",
          status: doc.status || "draft",
        }));

        console.log("Processed documents for UI:", formattedDocuments);

        // Gọi action set documents
        setOutgoingDocuments(formattedDocuments);

        // Cập nhật thông tin phân trang
        if (response.totalElements !== undefined) {
          setTotalItems(response.totalElements);
        } else if (response.numberOfElements !== undefined) {
          setTotalItems(response.numberOfElements);
        } else {
          setTotalItems(response.documents.length + page * size);
        }

        if (response.totalPages !== undefined) {
          setTotalPages(response.totalPages);
        } else {
          const estimatedTotalPages =
            response.documents.length < size ? page + 1 : page + 2;
          setTotalPages(estimatedTotalPages);
        }

        console.log(
          "Fetched documents:",
          response.documents.length,
          "Total items:",
          totalItems
        );
      } else {
        console.error("Invalid response format:", response);
        throw new Error("Không thể tải dữ liệu văn bản đi");
      }
    } catch (error) {
      console.error("Error fetching outgoing documents:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu văn bản đi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      // Đảm bảo giao diện được cập nhật ngay cả khi có lỗi
      setOutgoingDocuments([]);
    } finally {
      // Đảm bảo luôn tắt loading
      setLoading(false);
    }
  };

  // Tăng cường việc tải dữ liệu
  useEffect(() => {
    // Không thực hiện gọi API nếu chưa có thông tin người dùng
    if (!user) {
      console.log("Văn bản đi: Chưa có thông tin người dùng, chờ tải...");
      return;
    }

    console.log("Văn bản đi: User đã tải xong, có thể tải dữ liệu", {
      userId: user.id,
      isAuthenticated,
      roles: user?.roles,
    });

    // Đặt trang về 0 khi lọc thay đổi
    setCurrentPage(0);

    // Thêm timeout nhỏ để đảm bảo state đã được cập nhật
    setTimeout(() => {
      console.log("Văn bản đi: Đang tải dữ liệu lần đầu...");
      fetchDocuments(0, pageSize);
    }, 50);
  }, [user?.id, statusFilter]); // Phụ thuộc vào user.id thay vì toàn bộ user để tránh render lại không cần thiết

  // Xử lý khi thay đổi trang
  useEffect(() => {
    // Chỉ gọi khi thay đổi trang và không phải là lần đầu tải
    if (user && (currentPage > 0 || pageSize !== 10)) {
      console.log("Văn bản đi: Đang tải dữ liệu theo trang...", {
        currentPage,
        pageSize,
      });
      const controller = new AbortController();
      fetchDocuments(currentPage, pageSize);
      return () => controller.abort();
    }
  }, [currentPage, pageSize, user?.id]);

  // Lọc dữ liệu
  const filteredDocuments = outgoingDocuments.filter((doc) => {
    // Lọc theo tìm kiếm
    const matchesSearch =
      doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipient.toLowerCase().includes(searchQuery.toLowerCase());

    // Lọc theo trạng thái
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badgeInfo = getStatusBadgeInfo(status);
    return <Badge variant={badgeInfo.variant}>{badgeInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (outgoingDocuments.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-amber-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Không có văn bản nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Chưa có văn bản đi nào trong hệ thống
          </p>
          <Button asChild className="mt-4">
            <Link href="/van-ban-di/them-moi">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-primary">Văn bản đi</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi các văn bản đi
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm văn bản..."
              className="pl-10 w-full border-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="pending_approval">Chờ phê duyệt</SelectItem>
              <SelectItem value="approved">Đã phê duyệt</SelectItem>
              <SelectItem value="sent">Đã gửi</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/van-ban-di/them-moi" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Danh sách văn bản đi</CardTitle>
          <CardDescription>
            Danh sách các văn bản đi đã được tạo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-accent/50">
              <TableRow>
                <TableHead>Số văn bản</TableHead>
                <TableHead className="hidden md:table-cell">Ngày gửi</TableHead>
                <TableHead>Trích yếu</TableHead>
                <TableHead className="hidden md:table-cell">Nơi nhận</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-accent/30">
                    <TableCell className="font-medium">{doc.number}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.sentDate}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {doc.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {doc.recipient}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary"
                        asChild
                      >
                        <Link href={`/van-ban-di/${doc.id}`}>Chi tiết</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Không có văn bản nào phù hợp với điều kiện tìm kiếm
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
