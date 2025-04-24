"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Pencil, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DocumentResponseListProps {
  documentId: number
}

export default function DocumentResponseList({ documentId }: DocumentResponseListProps) {
  // Dữ liệu mẫu
  const [responses, setResponses] = useState([
    {
      id: 1,
      content:
        "Kính gửi UBND tỉnh, Phòng Kế hoạch - Tài chính đã nghiên cứu và xây dựng kế hoạch triển khai thực hiện các nhiệm vụ được giao theo Kế hoạch số 123/KH-UBND. Kính đề nghị UBND tỉnh xem xét và cho ý kiến chỉ đạo.",
      createdAt: "20/04/2023",
      createdBy: "Nguyễn Văn B",
      status: "pending_approval",
      attachments: [
        { name: "Kế hoạch triển khai.docx", size: "1.8MB" },
        { name: "Phụ lục kèm theo.xlsx", size: "0.9MB" },
      ],
      managerComment: "",
    },
    {
      id: 2,
      content:
        "Kính gửi UBND tỉnh, Phòng Kế hoạch - Tài chính xin báo cáo tiến độ thực hiện các nhiệm vụ được giao theo Kế hoạch số 123/KH-UBND. Hiện tại, chúng tôi đã hoàn thành 70% khối lượng công việc và dự kiến sẽ hoàn thành đúng tiến độ.",
      createdAt: "25/04/2023",
      createdBy: "Nguyễn Văn B",
      status: "rejected",
      attachments: [{ name: "Báo cáo tiến độ.docx", size: "1.5MB" }],
      managerComment: "Cần bổ sung thêm thông tin về kinh phí thực hiện và đánh giá hiệu quả.",
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return <Badge variant="outline">Chờ phê duyệt</Badge>
      case "approved":
        return <Badge variant="success">Đã phê duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Yêu cầu chỉnh sửa</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const handleDelete = (id: number) => {
    setResponses(responses.filter((response) => response.id !== id))
  }

  return (
    <div className="space-y-4">
      {responses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground">Chưa có văn bản trả lời nào</p>
          </CardContent>
        </Card>
      ) : (
        responses.map((response) => (
          <Card key={response.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Văn bản trả lời #{response.id}</CardTitle>
                {getStatusBadge(response.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>
                  <span className="text-muted-foreground">Người tạo:</span> {response.createdBy}
                </span>
                <span>
                  <span className="text-muted-foreground">Ngày tạo:</span> {response.createdAt}
                </span>
              </div>
              <Separator />
              <div>
                <p className="whitespace-pre-line">{response.content}</p>
              </div>
              {response.attachments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tệp đính kèm</p>
                    <div className="space-y-2">
                      {response.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">{file.size}</span>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {response.managerComment && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Ý kiến của Thủ trưởng</p>
                    <div className="rounded-md bg-muted p-3">
                      <p className="text-sm">{response.managerComment}</p>
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-end space-x-2">
                {response.status === "rejected" && (
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa văn bản trả lời này? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(response.id)}>Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
