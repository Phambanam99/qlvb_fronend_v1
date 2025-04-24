import { Card, CardContent } from "@/components/ui/card"

interface DocumentProcessingHistoryProps {
  documentId: number
}

export default function DocumentProcessingHistory({ documentId }: DocumentProcessingHistoryProps) {
  // Dữ liệu mẫu
  const history = [
    {
      id: 1,
      action: "Tiếp nhận văn bản",
      actor: "Lê Thị D (Văn thư)",
      timestamp: "15/04/2023 09:30",
      description: "Văn bản đã được tiếp nhận và vào sổ văn bản đến.",
      status: "completed",
    },
    {
      id: 2,
      action: "Trình Thủ trưởng",
      actor: "Lê Thị D (Văn thư)",
      timestamp: "15/04/2023 10:15",
      description: "Văn bản đã được trình lên Thủ trưởng xin ý kiến chỉ đạo.",
      status: "completed",
    },
    {
      id: 3,
      action: "Thủ trưởng có ý kiến",
      actor: "Trần Văn E (Thủ trưởng)",
      timestamp: "16/04/2023 08:45",
      description: "Giao Phòng Kế hoạch - Tài chính chủ trì, phối hợp với các phòng liên quan tham mưu xử lý.",
      status: "completed",
    },
    {
      id: 4,
      action: "Chuyển xử lý",
      actor: "Lê Thị D (Văn thư)",
      timestamp: "16/04/2023 09:30",
      description: "Chuyển văn bản đến Phòng Kế hoạch - Tài chính để xử lý theo ý kiến chỉ đạo của Thủ trưởng.",
      status: "completed",
    },
    {
      id: 5,
      action: "Chỉ huy phòng phân công",
      actor: "Phạm Văn F (Trưởng phòng KH-TC)",
      timestamp: "16/04/2023 14:00",
      description:
        "Phân công Nguyễn Văn B và Trần Hương C phối hợp xử lý văn bản. Yêu cầu báo cáo kết quả trước ngày 20/04/2023.",
      status: "completed",
    },
    {
      id: 6,
      action: "Cán bộ xử lý",
      actor: "Nguyễn Văn B (Chuyên viên KH-TC)",
      timestamp: "19/04/2023 16:30",
      description: "Đã hoàn thành xử lý văn bản và gửi lại Trưởng phòng xem xét.",
      status: "completed",
    },
    {
      id: 7,
      action: "Chỉ huy phòng yêu cầu chỉnh sửa",
      actor: "Phạm Văn F (Trưởng phòng KH-TC)",
      timestamp: "20/04/2023 09:15",
      description: "Yêu cầu bổ sung thêm thông tin về kinh phí thực hiện và đánh giá hiệu quả.",
      status: "completed",
    },
    {
      id: 8,
      action: "Cán bộ chỉnh sửa",
      actor: "Nguyễn Văn B (Chuyên viên KH-TC)",
      timestamp: "20/04/2023 15:45",
      description: "Đã chỉnh sửa, bổ sung thông tin theo yêu cầu và gửi lại Trưởng phòng.",
      status: "completed",
    },
    {
      id: 9,
      action: "Chỉ huy phòng phê duyệt",
      actor: "Phạm Văn F (Trưởng phòng KH-TC)",
      timestamp: "21/04/2023 10:30",
      description: "Đã phê duyệt và trình lên Thủ trưởng xem xét.",
      status: "completed",
    },
    {
      id: 10,
      action: "Thủ trưởng xem xét",
      actor: "Trần Văn E (Thủ trưởng)",
      timestamp: "22/04/2023 08:30",
      description: "Thủ trưởng đã xem xét và phê duyệt văn bản trả lời.",
      status: "completed",
    },
    {
      id: 11,
      action: "Chuyển văn thư",
      actor: "Lê Thị D (Văn thư)",
      timestamp: "22/04/2023 10:00",
      description: "Văn bản đã được chuyển cho văn thư để ban hành và lưu trữ.",
      status: "current",
    },
    {
      id: 12,
      action: "Ban hành văn bản",
      actor: "Lê Thị D (Văn thư)",
      timestamp: "22/04/2023 14:30",
      description: "Văn bản trả lời đã được ban hành và gửi đi.",
      status: "pending",
    },
  ]

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "completed":
        return <div className="h-2 w-2 rounded-full bg-green-500" />
      case "current":
        return <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      case "pending":
        return <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
      default:
        return <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6">
            {history.map((item) => (
              <div key={item.id} className="relative pl-8">
                <div className="absolute left-0 top-2 h-6 w-6 rounded-full border bg-background flex items-center justify-center">
                  {getStatusIndicator(item.status)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${item.status === "current" ? "text-primary" : ""}`}>{item.action}</p>
                    <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.actor}</p>
                  <p className="text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
