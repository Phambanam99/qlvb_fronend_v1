"use client"

import { useEffect, useMemo, useState } from 'react'
import PublicPortalApi from '@/lib/api/public-portal'
import type { PublicCategoryDTO, PublicDocumentDTO } from '@/lib/api/public-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function PublicPortalPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<PublicDocumentDTO[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [year, setYear] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [issuingAgency, setIssuingAgency] = useState<string>('')
  const [categories, setCategories] = useState<PublicCategoryDTO[]>([])

  const fetchData = async () => {
    setLoading(true)
    try {
      // If a category is selected, use category endpoint to leverage backend filtering by category
      const res = selectedCategory
        ? await PublicPortalApi.listByCategory(selectedCategory, {
            q: query || undefined,
            page,
            size,
            year: year ? Number(year) : undefined,
            issuingAgency: issuingAgency || undefined,
          })
        : await PublicPortalApi.listDocuments({ 
        q: query || undefined, 
        page, 
        size, 
        year: year ? Number(year) : undefined,
        issuingAgency: issuingAgency || undefined,
      })
      setDocs(res.content)
      setTotalPages(res.totalPages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => {
    // preload categories for left filter
    (async () => {
      try { setCategories(await PublicPortalApi.getCategoryTree()) } catch {}
    })()
  }, [])

  const onSearch = async () => {
    setPage(0)
    await fetchData()
  }

  useEffect(() => {
    if (page !== 0) fetchData()
  }, [page])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Cổng công văn chung</h1>

      <div className="flex gap-2 items-center">
        <Input placeholder="Tìm kiếm tiêu đề" value={query} onChange={e=>setQuery(e.target.value)} />
        <Button onClick={onSearch}>Tìm</Button>
        <Button asChild variant="outline">
          <Link href="/van-ban-chung/upload">Tải lên công văn</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left filters */}
        <div className="md:col-span-1 space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Bộ lọc</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Năm</label>
                <Input placeholder="VD: 2025" value={year} onChange={e=>setYear(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Chuyên mục</label>
                <select className="w-full border rounded px-2 py-1"
                  value={selectedCategory ?? ''}
                  onChange={e=>setSelectedCategory(e.target.value? Number(e.target.value) : null)}>
                  <option value="">Tất cả</option>
                  {categories.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Đơn vị phát hành</label>
                <Input placeholder="Nhập tên đơn vị" value={issuingAgency} onChange={e=>setIssuingAgency(e.target.value)} />
              </div>
              <Button onClick={onSearch} className="w-full">Áp dụng</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right list as horizontal rows */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({length:6}).map((_,i)=>(<Skeleton key={i} className="h-20" />))}
            </div>
          ) : (
            <div className="divide-y">
              {docs.map(d => (
                <div key={d.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      <Link href={`/van-ban-chung/documents/${d.id}`} className="hover:underline">{d.title}</Link>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      <span>Số hiệu: {d.documentNumber || '-'}</span>
                      <span>Đơn vị: {d.issuingAgency || '-'}</span>
                      <span>Người tải lên: {d.uploaderName || '-'}</span>
                      <span>Tải xuống: {d.downloadCount ?? 0}</span>
                      <span>Chuyên mục: {d.categoryNames?.join(', ') || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

      <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e)=>{e.preventDefault(); if(page>0) setPage(page-1)}} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 py-2 text-sm select-none">Trang {page+1}/{Math.max(totalPages, 1)}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e)=>{e.preventDefault(); if(page+1 < totalPages) setPage(page+1)}} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      
    </div>
  )
}
