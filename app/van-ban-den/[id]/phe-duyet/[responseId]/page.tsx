"use client"

import { use } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ManagerApproval from "@/components/manager-approval"

export default function DocumentApprovalPage({
  params,
}: { params: { id: Promise<string>; responseId: Promise<string> } }) {
  // Sử dụng React.use để unwrap params
  const id = use(params.id)
  const responseId = use(params.responseId)

  const documentId = Number.parseInt(id)
  const responseIdNum = Number.parseInt(responseId)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10" asChild>
          <Link href={`/van-ban-den/${documentId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Phê duyệt văn bản trả lời</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <ManagerApproval documentId={documentId} responseId={responseIdNum} />
        </div>
        <div className="md:col-span-3">
          <div className="bg-primary/5 border rounded-md p-4">
            <h3 className="font-medium mb-2">Hướng dẫn phê duyệt văn bản</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  1
                </span>
                <span>Xem xét nội dung văn bản trả lời đã được Trưởng phòng phê duyệt</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  2
                </span>
                <span>Kiểm tra các tệp đính kèm (nếu có)</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  3
                </span>
                <span>Nhập ý kiến chỉ đạo hoặc lý do trả lại (nếu cần)</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  4
                </span>
                <span>
                  Chọn "Phê duyệt và ban hành" nếu đồng ý với nội dung, hoặc "Trả lại phòng" nếu cần phòng xử lý lại
                </span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Lưu ý:</span> Khi phê duyệt, văn bản sẽ được chuyển cho văn thư để ban
                hành và lưu trữ. Khi trả lại, phòng chuyên môn sẽ nhận được thông báo và ý kiến chỉ đạo của Thủ trưởng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
