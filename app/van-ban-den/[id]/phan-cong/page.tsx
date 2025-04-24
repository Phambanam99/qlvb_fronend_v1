"use client"

import { use } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DepartmentHeadAssignment from "@/components/department-head-assignment"

export default function DocumentAssignmentPage({ params }: { params: { id: Promise<string> } }) {
  // Sử dụng React.use để unwrap params
  const id = use(params.id)
  const documentId = Number.parseInt(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10" asChild>
          <Link href={`/van-ban-den/${documentId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Phân công xử lý văn bản</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <DepartmentHeadAssignment documentId={documentId} />
        </div>
        <div className="md:col-span-3">
          <div className="bg-primary/5 border rounded-md p-4">
            <h3 className="font-medium mb-2">Hướng dẫn phân công xử lý</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  1
                </span>
                <span>Chọn một hoặc nhiều cán bộ để phân công xử lý văn bản</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  2
                </span>
                <span>Thiết lập thời hạn xử lý văn bản</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  3
                </span>
                <span>Nhập ý kiến chỉ đạo và yêu cầu cụ thể đối với cán bộ được phân công</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 mt-0.5">
                  4
                </span>
                <span>Nhấn "Phân công" để hoàn tất việc phân công xử lý văn bản</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Lưu ý:</span> Sau khi phân công, cán bộ được chọn sẽ nhận được thông báo
                và có thể bắt đầu xử lý văn bản.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
