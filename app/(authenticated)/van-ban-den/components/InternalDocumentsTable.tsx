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
import { Eye } from "lucide-react";
import { Check } from "lucide-react";

interface InternalDocumentsTableProps {
  documents: any[];
  onDocumentClick: (doc: any) => void;
  formatDate: (date: string | Date | null | undefined) => string;
  // Read status props - like in văn bản đi
  universalReadStatus?: any;
  onReadStatusToggle?: (docId: number) => void;
  getReadStatus?: (docId: number) => boolean;
}

export function InternalDocumentsTable({
  documents,
  onDocumentClick,
  formatDate,
  universalReadStatus,
  onReadStatusToggle,
  getReadStatus,
}: InternalDocumentsTableProps) {
  // console.log("Rendering InternalDocumentsTable with documents:", documents);
  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-accent/50">
            <TableRow>
              <TableHead style={{ width: '2.1667%' }}>STT</TableHead>
              <TableHead style={{ width: '4.3334%' }}>Số văn bản</TableHead>
              <TableHead style={{ width: '4.3334%' }}>Ngày gửi</TableHead>
              <TableHead style={{ width: '79%' }}>Tiêu đề</TableHead>
              <TableHead style={{ width: '4.1667%' }}></TableHead>
              {/* <TableHead style={{ width: '4.1667%' }}>Thao tác</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents && documents.length > 0 ? (
              documents.map((doc: any, index: number) => {
                // console.log("Document:", doc);
                // FIX: Use backend data as primary source, frontend state for real-time updates
                const frontendStatus = getReadStatus ? getReadStatus(doc.id) : undefined;
                const isRead =  doc.isRead;
                  
                return (
                  <TableRow 
                    key={doc.id} 
                    className={`hover:bg-accent/30 cursor-pointer ${
                      !isRead
                        ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => onDocumentClick(doc)}
                  >
                    <TableCell style={{ width: '4.1667%' }} className="text-center text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell style={{ width: '8.5%' }} className="font-medium">
                      {doc.documentNumber}
                    </TableCell>
                    <TableCell style={{ width: '8.5%' }}>
                      {formatDate(doc.createdAt)}
                    </TableCell>
                    <TableCell style={{ width: '75%' }}>
                      <div className="flex items-center gap-2">
                        {!isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        <span className={!isRead ? "font-semibold" : ""}>
                          {doc.title}
                        </span>
                      </div>
                    </TableCell>

                  <TableCell style={{ width: '4.1667%' }}>
                    {universalReadStatus && getReadStatus ? (
                      // Use Button for read status toggle like văn bản đi
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`${
                          isRead
                            ? "text-green-600 hover:text-green-700"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                      >
                        {isRead ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    ) : (
                      // Fallback to Badge for backward compatibility
                      <Badge variant={isRead ? "default" : "outline"}>
                        {isRead ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Badge>
                    )}
                  </TableCell>
                  {/* <TableCell style={{ width: '4.1667%' }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDocumentClick(doc)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell> */}
                </TableRow>
              );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
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
