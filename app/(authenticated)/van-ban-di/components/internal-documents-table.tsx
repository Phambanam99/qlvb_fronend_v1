"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UrgencyBadge } from "@/components/urgency-badge";
import { UrgencyLevel, migrateFromOldUrgency } from "@/lib/types/urgency";
import { InternalDocument } from "@/lib/api/internalDocumentApi";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteInternalDocument } from "@/lib/api/internalDocumentApi";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface InternalDocumentsTableProps {
  documents: InternalDocument[];
  isLoading: boolean;
  universalReadStatus: any;
  onDocumentClick: (doc: InternalDocument) => void;
  onDeleted?: () => void; // callback after successful delete
}

// @ts-ignore
export function InternalDocumentsTable({
  documents,
  isLoading,
  universalReadStatus,
  onDocumentClick,
  onDeleted,
}: InternalDocumentsTableProps) {

  const { user } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Chưa xác định";

      const date = new Date(dateString);

      // Check if date is valid and not the epoch (1970-01-01)
      if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
        return "Chưa xác định";
      }

      return date.toLocaleDateString("vi-VN");
    } catch {
      return "Chưa xác định";
    }
  };

  const getUrgencyBadge = (urgencyLevel: UrgencyLevel | string) => {
    // For migration compatibility, handle old priority values
    let level: UrgencyLevel;
    if (
      typeof urgencyLevel === "string" &&
      ["NORMAL", "HIGH", "URGENT"].includes(urgencyLevel)
    ) {
      level = migrateFromOldUrgency(urgencyLevel);
    } else {
      level = urgencyLevel as UrgencyLevel;
    }

    return <UrgencyBadge level={level} size="sm" />;
  };

  //recipients ở đây là string nên nếu chuỗi dài hơn 10 thì cắt bớt và thêm "..."
  //nếu không có recipients thì trả về "Chưa có người nhận"
  //nếu có recipients thì trả về recipients
  const getRecipientSummary = (recipients: InternalDocument["recipients"]) => {
    if (!recipients) return "Chưa có người nhận";

    let text: string;

    if (Array.isArray(recipients)) {
      if (recipients.length === 0) return "Chưa có người nhận";
      text = recipients
          .map((r: any) => r?.departmentName || r?.userName || r?.name || "")
          .filter(Boolean)
          .join(", ");
    } else {
      text = String(recipients);
    }

    return text || "Chưa có người nhận";
  };

  const handleDelete = async (e: React.MouseEvent, doc: InternalDocument) => {
    e.stopPropagation();
    if (deletingId) return; // prevent concurrent
    const confirmed = window.confirm(`Bạn có chắc muốn xóa văn bản số "${doc.documentNumber}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;
    try {
      setDeletingId(doc.id);
      await deleteInternalDocument(doc.id);
      toast({
        title: "Đã xóa",
        description: `Xóa văn bản ${doc.documentNumber} thành công.`,
      });
      onDeleted?.();
    } catch (error: any) {
      toast({
        title: "Lỗi xóa văn bản",
        description: error?.response?.data?.message || "Không thể xóa văn bản. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-accent/50">
            <TableRow>
              <TableHead style={{ width: '4.1667%' }}>STT</TableHead>
              <TableHead style={{ width: '4.1667' }}>Số vb</TableHead>
              <TableHead style={{ width: '58.333%' }}>Tiêu đề</TableHead>
              <TableHead style={{ width: '12.5%' }} className="hidden md:table-cell">Người nhận</TableHead>
              <TableHead style={{ width: '4.1667%' }}>Độ khẩn</TableHead>
              <TableHead style={{ width: '4.1667%' }}></TableHead>
              <TableHead style={{ width: '8.333%' }} className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length > 0 ? (
              documents.map((doc, index) => {
                const isRead = doc.isRead;
                return (
                  <TableRow
                    key={doc.id}
                    className={`hover:bg-accent/30 cursor-pointer ${
                      !isRead
                        ? "bg-blue-50/50 border-l-4 border-l-blue-500 text-red-600"
                        : "text-foreground"
                    }`}
                    onClick={() => onDocumentClick(doc)}
                  >
                    <TableCell style={{ width: '4.1667%' }} className="text-center text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell style={{ width: '4.1667%' }} className="font-medium">
                      {doc.documentNumber}
                    </TableCell>
                    <TableCell style={{ width: '58.333%' }}>
                      <div className="flex items-center gap-2">
                        {!isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        <span className={!isRead ? "font-semibold" : ""}>
                          {doc.title}
                        </span>
                      </div>
                    </TableCell>
                    {/* <TableCell style={{ width: '4.1667%' }} className="hidden lg:table-cell">
                      {doc.documentType}
                    </TableCell> */}
                    <TableCell style={{ width: '4.1667%' }} className="hidden md:table-cell">
                      {getRecipientSummary(doc.recipientNames)}
                    </TableCell>
                    <TableCell style={{ width: '4.1667%' }}>{getUrgencyBadge(doc.priority || "NORMAL")}</TableCell>
                    <TableCell style={{ width: '4.1667%' }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`${
                          isRead
                            ? "text-green-600 hover:text-green-700"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   universalReadStatus.toggleReadStatus(
                        //     doc.id,
                        //     "OUTGOING_INTERNAL"
                        //   );
                        // }}
                      >
                        {isRead ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell style={{ width: '8.333%' }} className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50 hover:text-blue-600 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Navigate to edit page with document number
                                  window.location.href = `/van-ban-di/cap-nhat/noi-bo/${doc.id}`;
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Chỉnh sửa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {user?.id === doc.senderId && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === doc.id}
                                  className="hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0 text-red-600"
                                  onClick={(e) => handleDelete(e, doc)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{deletingId === doc.id ? "Đang xóa..." : "Xóa"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {/* <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-primary/10 hover:text-primary h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDocumentClick(doc);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Chi tiết</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider> */}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {documents.length === 0 && !isLoading
                    ? "Chưa có văn bản nội bộ nào"
                    : "Không có văn bản nào phù hợp với điều kiện tìm kiếm"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
