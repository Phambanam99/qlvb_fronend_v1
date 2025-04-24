"use client"

import { use } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DepartmentHeadReview from "@/components/department-head-review"

export default function DocumentReviewPage({
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
        <h1 className="text-2xl font-bold tracking-tight text-primary">Xem xét văn bản trả lời</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <DepartmentHeadReview documentId={documentId} responseId={responseIdNum} />
        </div>
        <div className="md:col-span-3">
          <div className="bg-primary/5 border rounded-md p-4">
            <h3 className="font-medium mb-2">Hướng dẫn xem xét văn bản</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  1
                </span>
                <span>Xem xét nội dung văn bản trả lời do cán bộ soạn thảo</span>
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
                <span>Nhập ý kiến chỉ đạo hoặc yêu cầu chỉnh sửa (nếu cần)</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  4
                </span>
                <span>
                  Chọn "Phê duyệt và trình lên" nếu đồng ý với nội dung, hoặc "Yêu cầu chỉnh sửa" nếu cần cán bộ chỉnh
                  sửa lại
                </span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Lưu ý:</span> Khi phê duyệt, văn bản sẽ được trình lên Thủ trưởng xem xét.
                Khi yêu cầu chỉnh sửa, cán bộ sẽ nhận được thông báo và ý kiến chỉ đạo của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
