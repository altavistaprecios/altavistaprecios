'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, Suspense } from 'react'
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download } from 'lucide-react'
import { toast } from 'sonner'
import { generateCatalogPDF, prepareProductsForPDF } from '@/lib/pdf/generate-catalog-pdf'
import { useAuth } from '@/lib/hooks/use-auth'
import { useTranslations } from 'next-intl'

interface ClientSiteHeaderProps {
  title?: string
}

function ClientSiteHeaderContent({ title }: ClientSiteHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')
  const [isExporting, setIsExporting] = useState(false)
  const { user } = useAuth()
  const t = useTranslations('clientHeader')
  const resolvedTitle = title ?? t('defaultTitle')

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
      setIsExporting(true)

      // Determine which products to export based on current page
      let categoryFilter = ''
      let categoryTitle = t('pdf.defaultTitle')

      if (pathname.includes('monofocales-future-x')) {
        categoryFilter = 'future-x'
        categoryTitle = t('pdf.futureX')
      } else if (pathname.includes('monofocales-terminados')) {
        categoryFilter = 'terminados'
        categoryTitle = t('pdf.terminados')
      } else if (pathname.includes('/client/products')) {
        categoryTitle = t('pdf.allProducts')
      }

      // Fetch products and client prices
      const [productsRes, pricesRes] = await Promise.all([
        fetch(`/api/products${categoryFilter ? `?category=${categoryFilter}` : ''}`),
        fetch('/api/client-prices'),
      ])

      const productsData = await productsRes.json()
      const pricesData = await pricesRes.json()

      const products = productsData.products || productsData.data || []
      const clientPrices = pricesData.data || []

      if (products.length === 0) {
        toast.error(t('export.empty'))
        return
      }

      // Filter only active products
      const activeProducts = products.filter((p: any) => p.is_active)

      // Prepare products with pricing data
      const productsForPDF = prepareProductsForPDF(activeProducts, clientPrices)

      // Generate PDF
      await generateCatalogPDF({
        products: productsForPDF,
        clientName: user?.company_name || user?.email,
        categoryTitle,
      })

      toast.success(t('export.success'))
    } catch (error) {
      console.error('Failed to export catalog:', error)
      toast.error(t('export.error'))
    } finally {
      setIsExporting(false)
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
        <h1 className="text-base font-medium">{resolvedTitle}</h1>

        {/* Global Search and Export - only show on product pages */}
        {(pathname.includes('/client/products') ||
          pathname.includes('/client/monofocales')) && (
          <>
            <div className="ml-auto flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
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
                disabled={isExporting}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? t('export.generating') : t('export.cta')}
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

// Export wrapper component with Suspense boundary
export function ClientSiteHeader(props: ClientSiteHeaderProps) {
  return (
    <Suspense fallback={<ClientSiteHeaderFallback {...props} />}>
      <ClientSiteHeaderContent {...props} />
    </Suspense>
  )
}

function ClientSiteHeaderFallback({ title }: ClientSiteHeaderProps) {
  const t = useTranslations('clientHeader')
  const resolvedTitle = title ?? t('defaultTitle')

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{resolvedTitle}</h1>
      </div>
    </header>
  )
}
