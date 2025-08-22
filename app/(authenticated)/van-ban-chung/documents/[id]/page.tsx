"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PublicPortalApi from '@/lib/api/public-portal'
import type { PublicDocumentDetailDTO, PublicDownloadLogDTO } from '@/lib/api/public-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PublicDocumentDetailPage() {
  const params = useParams()
  const id = Number(params?.id)
  const [doc, setDoc] = useState<PublicDocumentDetailDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<PublicDownloadLogDTO[] | null>(null)

  useEffect(() => {
    if (!id || Number.isNaN(id)) return
    const run = async () => {
      setLoading(true)
      try {
        const res = await PublicPortalApi.getDocumentDetail(id)
        setDoc(res)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  useEffect(() => {
    if (!id || Number.isNaN(id)) return
    ;(async () => {
      try {
        const res = await PublicPortalApi.getDownloadLogs(id, { page: 0, size: 10 })
        setLogs(res?.content ?? [])
      } catch {
        setLogs(null)
      }
    })()
  }, [id])

  if (!id || Number.isNaN(id)) return <div className="p-4">Thiếu ID hợp lệ</div>
  if (loading) return <div className="p-4">Đang tải...</div>
  if (!doc) return <div className="p-4">Không tìm thấy tài liệu</div>

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{doc.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>Số hiệu: {doc.documentNumber || '-'}</div>
          <div>Đơn vị phát hành: {doc.issuingAgency || '-'}</div>
          <div>Người tải lên: {doc.uploaderName || '-'}</div>
          <div>Lượt tải xuống: {doc.downloadCount ?? 0}</div>
          <div>Loại: {doc.type || '-'}</div>
          <div>Chuyên mục: {doc.categoryNames?.join(', ') || '-'}</div>
          <div>Ngày công bố: {doc.publishedAt ? new Date(doc.publishedAt).toLocaleString() : '-'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tệp đính kèm</CardTitle>
        </CardHeader>
        <CardContent>
          {doc.attachments && doc.attachments.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {doc.attachments.map(att => (
                <li key={att.id}>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() =>
                      PublicPortalApi.downloadAttachment(
                        id,
                        att.id,
                        att.originalFilename || undefined
                      )
                    }
                  >
                    {att.originalFilename || `Tệp #${att.id}`} ({att.contentType || 'unknown'})
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">Chưa có tệp đính kèm.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nhật ký tải xuống gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <ul className="text-sm text-muted-foreground space-y-1">
              {logs.map((l) => (
                <li key={l.id}>
                  {new Date(l.downloadedAt).toLocaleString()} — {l.userName || 'Ẩn danh'} {l.ipAddress ? `(${l.ipAddress})` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm">Chưa có lượt tải xuống.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
