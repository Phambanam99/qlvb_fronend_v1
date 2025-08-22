"use client"

import { useEffect, useState } from 'react'
import PublicPortalApi from '@/lib/api/public-portal'
import type { PublicCategoryDTO } from '@/lib/api/public-types'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function CategoryTree({ nodes }:{ nodes: PublicCategoryDTO[] }){
  return (
    <ul className="space-y-1">
      {nodes.map(n => (
        <li key={n.id}>
          <Link href={`/van-ban-chung/categories/${n.id}`} className="text-blue-600 hover:underline">{n.name}</Link>
          {n.children && n.children.length > 0 && (
            <div className="ml-6 border-l pl-3">
              <CategoryTree nodes={n.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function PublicCategoriesPage(){
  const [tree, setTree] = useState<PublicCategoryDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try { setTree(await PublicPortalApi.getCategoryTree()) }
      finally { setLoading(false) }
    }
    run()
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chuyên mục công văn</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? 'Đang tải...' : <CategoryTree nodes={tree} />}
        </CardContent>
      </Card>
    </div>
  )
}
