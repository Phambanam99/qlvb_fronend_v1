"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PublicPortalApi from '@/lib/api/public-portal'
import type { PublicDocumentDTO } from '@/lib/api/public-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import Link from 'next/link'

export default function CategoryListingPage(){
  const params = useParams()
  const categoryId = Number(params?.id)
  const [docs, setDocs] = useState<PublicDocumentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (!categoryId || Number.isNaN(categoryId)) return
    const run = async () => {
      setLoading(true)
      try {
        const res = await PublicPortalApi.listByCategory(categoryId, { page, size })
        setDocs(res.content)
        setTotalPages(res.totalPages)
      } finally { setLoading(false) }
    }
    run()
  }, [categoryId, page, size])

  if (!categoryId || Number.isNaN(categoryId)) return <div className="p-4">Thiếu ID chuyên mục</div>

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Chuyên mục #{categoryId}</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map(d => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle className="line-clamp-2">
                <Link href={`/van-ban-chung/documents/${d.id}`} className="hover:underline">{d.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div>Số hiệu: {d.documentNumber || '-'}</div>
              <div>Loại: {d.type || '-'}</div>
              <div>Chuyên mục: {d.categoryNames?.join(', ') || '-'}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e)=>{e.preventDefault(); if(page>0) setPage(page-1)}} />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 py-2 text-sm select-none">Trang {page+1}/{Math.max(totalPages, 1)}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={(e)=>{e.preventDefault(); if(page+1<totalPages) setPage(page+1)}} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
