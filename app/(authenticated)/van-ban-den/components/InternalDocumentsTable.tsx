/**
 * Internal Documents Table Component
 * Displays internal documents in a clean table format
 */

import { Badge } from "@/components/ui/badge";
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

interface InternalDocumentsTableProps {
  documents: any[];
  onDocumentClick: (doc: any) => void;
  formatDate: (date: string | Date | null | undefined) => string;
}

export function InternalDocumentsTable({
  documents,
  onDocumentClick,
  formatDate,
}: InternalDocumentsTableProps) {
  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-accent/50">
            <TableRow>
              <TableHead>Số văn bản</TableHead>
              <TableHead>Ngày ký</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Người gửi</TableHead>
              <TableHead>Trạng thái đọc</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents && documents.length > 0 ? (
              documents.map((doc: any) => (
                <TableRow key={doc.id} className="hover:bg-accent/30">
                  <TableCell className="font-medium">
                    {doc.documentNumber}
                  </TableCell>
                  <TableCell>{formatDate(doc.signingDate)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {doc.title}
                  </TableCell>
                  <TableCell>{doc.senderName}</TableCell>
                  <TableCell>
                    <Badge variant={doc.isRead ? "default" : "outline"}>
                      {doc.isRead ? "Đã đọc" : "Chưa đọc"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDocumentClick(doc)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Chưa có văn bản nội bộ nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
