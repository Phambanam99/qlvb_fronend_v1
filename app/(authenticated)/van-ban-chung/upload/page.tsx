"use client"

import { useEffect, useState } from 'react'
import PublicPortalApi from '@/lib/api/public-portal'
import type { PublicCategoryDTO } from '@/lib/api/public-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation';

function CategoryCheckboxTree({ nodes, selected, toggle, onAddChild }:{ nodes: PublicCategoryDTO[]; selected: Set<number>; toggle:(id:number)=>void; onAddChild:(parentId:number)=>void }){
  return (
    <ul className="space-y-1">
      {nodes.map(node => (
        <li key={node.id}>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={selected.has(node.id)} onChange={()=>toggle(node.id)} />
              <span>{node.name}</span>
            </label>
            <button type="button" className="text-xs text-blue-600 hover:underline" onClick={()=>onAddChild(node.id)}>+ Thêm</button>
          </div>
          {node.children && node.children.length > 0 && (
            <div className="ml-6 border-l pl-3">
              <CategoryCheckboxTree nodes={node.children} selected={selected} toggle={toggle} onAddChild={onAddChild} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function PublicUploadPage() {
  const router = useRouter(); 
  const [title, setTitle] = useState('')
  const [uploaderName, setUploaderName] = useState('')
  const [uploaderEmail, setUploaderEmail] = useState('')
  const [issuingAgency, setIssuingAgency] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [categories, setCategories] = useState<PublicCategoryDTO[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    const run = async () => {
      try {
        const tree = await PublicPortalApi.getCategoryTree()
        setCategories(tree)
      } catch (e) {
        console.error(e)
      }
    }
    run()
  }, [])

  const refreshTree = async () => {
    const tree = await PublicPortalApi.getCategoryTree()
    setCategories(tree)
  }

  const toggle = (id:number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const onSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'Vui lòng nhập tiêu đề', variant: 'destructive' })
      return
    }
    if (files.length === 0) {
      toast({ title: 'Vui lòng chọn ít nhất 1 tệp', variant: 'destructive' })
      return
    }
    setSubmitting(true)
  try {
      const res = await PublicPortalApi.uploadDocument({
        title,
        files,
        categoryIds: Array.from(selected),

  issuingAgency: issuingAgency || undefined,
  documentNumber: documentNumber || undefined,
    onProgress: (p) => setProgress(p),
      })
      toast({ title: 'Tải lên thành công', variant: 'success' })
      // Optionally redirect to detail
      router.push(`/van-ban-chung/documents/${res.id}`)
    } catch (e:any) {
      toast({ title: 'Tải lên thất bại', description: e?.response?.data?.message || String(e), variant: 'destructive' })
    } finally {
      setSubmitting(false)
      setProgress(0)
    }
  }

  const onAddRoot = async () => {
    const name = window.prompt('Tên chuyên mục mới (gốc):')
    if (!name) return
    try {
      await PublicPortalApi.createCategory({ name })
      await refreshTree()
      toast({ title: 'Đã thêm chuyên mục', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Thêm chuyên mục thất bại', description: e?.response?.data?.message || String(e), variant: 'destructive' })
    }
  }

  const onAddChild = async (parentId:number) => {
    const name = window.prompt('Tên chuyên mục con mới:')
    if (!name) return
    try {
      await PublicPortalApi.createCategory({ name, parentId })
      await refreshTree()
      toast({ title: 'Đã thêm chuyên mục con', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Thêm chuyên mục con thất bại', description: e?.response?.data?.message || String(e), variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tải lên công văn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nhập tiêu đề" />
              </div>
              <div className="space-y-2">
                <Label>Đơn vị phát hành</Label>
                <Input value={issuingAgency} onChange={e=>setIssuingAgency(e.target.value)} placeholder="Sở/Ban/Ngành" />
              </div>
              <div className="space-y-2">
                <Label>Số tài liệu</Label>
                <Input value={documentNumber} onChange={e=>setDocumentNumber(e.target.value)} placeholder="VD: 123/QĐ-UBND" />
              </div>

              <div className="space-y-2">
                <Label>Tệp đính kèm</Label>
                <Input type="file" multiple onChange={(e)=> setFiles(Array.from(e.target.files || []))} />
              </div>
              <div className="space-y-2">
                <Button disabled={submitting} onClick={onSubmit}>{submitting ? 'Đang gửi...' : 'Gửi'}</Button>
                {submitting && (
                  <div className="text-sm text-muted-foreground">
                    Đang tải lên: {progress}%
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Chọn chuyên mục</Label>
                <button type="button" className="text-sm text-blue-600 hover:underline" onClick={onAddRoot}>+ Thêm gốc</button>
              </div>
              <div className="mt-2 border rounded p-3 max-h-[420px] overflow-auto">
                <CategoryCheckboxTree nodes={categories} selected={selected} toggle={toggle} onAddChild={onAddChild} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
