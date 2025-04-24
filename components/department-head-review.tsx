"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
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

interface DepartmentHeadReviewProps {
  documentId: number
  responseId: number
}

export default function DepartmentHeadReview({ documentId, responseId }: DepartmentHeadReviewProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dữ liệu mẫu
  const response = {
    id: responseId,
    content:
      "Kính gửi UBND tỉnh, Phòng Kế hoạch - Tài chính đã nghiên cứu và xây dựng kế hoạch triển khai thực hiện các nhiệm vụ được giao theo Kế hoạch số 123/KH-UBND. Kính đề nghị UBND tỉnh xem xét và cho ý kiến chỉ đạo.",
    createdAt: "20/04/2023",
    createdBy: "Nguyễn Văn B",
    attachments: [
      { name: "Kế hoạch triển khai.docx", size: "1.8MB" },
      { name: "Phụ lục kèm theo.xlsx", size: "0.9MB" },
    ],
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert("Đã phê duyệt và trình lên Thủ trưởng!")
  }

  const handleReject = async () => {
    if (!comments.trim()) {
      alert("Vui lòng nhập ý kiến chỉ đạo trước khi yêu cầu chỉnh sửa!")
      return
    }

    setIsSubmitting(true)
    // Giả lập gửi dữ liệu
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert("Đã gửi yêu cầu chỉnh sửa cho cán bộ!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem xét văn bản trả lời</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Văn bản trả lời</Label>
            <Badge variant="outline">Chờ phê duyệt</Badge>
          </div>
          <div className="rounded-md border p-4 bg-accent/30">
            <div className="flex justify-between text-sm mb-2">
              <span>
                <span className="text-muted-foreground">Người tạo:</span> {response.createdBy}
              </span>
              <span>
                <span className="text-muted-foreground">Ngày tạo:</span> {response.createdAt}
              </span>
            </div>
            <p className="whitespace-pre-line">{response.content}</p>
            {response.attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Tệp đính kèm</p>
                <div className="space-y-1">
                  {response.attachments.map((file, index) => (
                    <div key={index} className="text-sm">
                      {file.name} ({file.size})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">Ý kiến chỉ đạo</Label>
          <Textarea
            id="comments"
            placeholder="Nhập ý kiến chỉ đạo hoặc yêu cầu chỉnh sửa..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              <XCircle className="mr-2 h-4 w-4" /> Yêu cầu chỉnh sửa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận yêu cầu chỉnh sửa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn yêu cầu cán bộ chỉnh sửa văn bản này? Hãy đảm bảo đã nhập đầy đủ ý kiến chỉ đạo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleApprove} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-4 w-4" /> Phê duyệt và trình lên
        </Button>
      </CardFooter>
    </Card>
  )
}
