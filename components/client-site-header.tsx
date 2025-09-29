'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download } from 'lucide-react'
import { toast } from 'sonner'

interface ClientSiteHeaderProps {
  title?: string
}

export function ClientSiteHeader({ title = "Client Portal" }: ClientSiteHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')

  // Update search value when URL params change
  useEffect(() => {
    setSearchValue(searchParams.get('q') || '')
  }, [searchParams])

  // Create URL with search params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    // Update URL with search params
    const queryString = createQueryString('q', value)
    router.push(pathname + (queryString ? `?${queryString}` : ''))
  }

  // Handle export catalog
  const handleExportCatalog = async () => {
    try {
      // Determine which products to export based on current page
      let categoryFilter = ''

      if (pathname.includes('monofocales-future-x')) {
        categoryFilter = 'future-x'
      } else if (pathname.includes('monofocales-terminados')) {
        categoryFilter = 'terminados'
      }

      // Fetch products with filter
      const response = await fetch(`/api/products${categoryFilter ? `?category=${categoryFilter}` : ''}`)
      const data = await response.json()

      // Convert to CSV
      const products = data.products || data.data || []
      if (products.length === 0) {
        toast.error('No products to export')
        return
      }

      const csv = [
        ['Code', 'Name', 'Category', 'Base Price (USD)', 'Stock', 'Status'],
        ...products.map((p: any) => [
          p.code,
          p.name,
          p.category_name || '',
          p.base_price_usd,
          p.stock_quantity || 0,
          p.is_active ? 'Active' : 'Inactive'
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `catalog_${categoryFilter || 'all'}_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Catalog exported successfully')
    } catch (error) {
      console.error('Failed to export catalog:', error)
      toast.error('Failed to export catalog')
    }
  }

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>

        {/* Global Search and Export - only show on product pages */}
        {(pathname.includes('/client/products') ||
          pathname.includes('/client/monofocales')) && (
          <>
            <div className="ml-auto flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter products..."
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-9 w-full pl-8"
                />
              </div>

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCatalog}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Catalog
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}