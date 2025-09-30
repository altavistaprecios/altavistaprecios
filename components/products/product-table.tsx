'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { DataTableShell } from '@/components/ui/data-table-shell'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  Search,
  Plus,
  Download,
  Upload,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  DollarSign
} from 'lucide-react'
import type { Product } from '@/lib/models/product'
import { useTranslations, useFormatter } from 'next-intl'

interface ProductTableProps {
  products: Product[]
  categories?: Array<{ id: string; name: string }>
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onBulkDelete?: (productIds: string[]) => void
  onAddProduct?: () => void
  viewToggle?: React.ReactNode
  showExportButton?: boolean
}

export function ProductTable({
  products,
  categories = [],
  onEdit,
  onDelete,
  onBulkDelete,
  onAddProduct,
  viewToggle,
  showExportButton = true,
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([])
  const [filter, setFilter] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'code'>('name')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const t = useTranslations('productTable')
  const formatter = useFormatter()

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const searchLower = filter.toLowerCase()
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.code.toLowerCase().includes(searchLower)
      )
    })
  }, [products, filter])

  // Sort products
  const sortedProducts = React.useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sortBy) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'code':
          aVal = a.code
          bVal = b.code
          break
        case 'price':
          aVal = a.base_price_usd
          bVal = b.base_price_usd
          break
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredProducts, sortBy, sortOrder])

  // Paginate products
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return sortedProducts.slice(start, start + rowsPerPage)
  }, [sortedProducts, currentPage, rowsPerPage])

  const totalPages = Math.ceil(sortedProducts.length / rowsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    }
  }

  const handleSort = (column: 'name' | 'price' | 'code') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const formatPrice = (price: number) => formatter.number(price, { style: 'currency', currency: 'USD' })

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    const category = categories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">{t('emptyTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('emptyDescription')}</p>
        <Button className="mt-4" onClick={onAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          {t('emptyAction')}
        </Button>
      </div>
    )
  }

  return (
    <DataTableShell
      filters={
        <>
          <div className="flex w-full flex-col gap-2 sm:max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('filterPlaceholder')}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-9 w-full pl-8"
              />
            </div>
            {selectedProducts.length > 0 && onBulkDelete && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {t('bulkSelected', { count: selectedProducts.length })}
                </span>
                <Button size="sm" variant="outline" aria-label={t('bulkEditAria')}>
                  {t('bulkEdit')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBulkDelete?.(selectedProducts)}
                  aria-label={t('bulkDeleteAria')}
                >
                  {t('bulkDelete')}
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {viewToggle}
          </div>
        </>
      }
      toolbar={
        <>
          {onAddProduct ? (
            <>
              <Button size="sm" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                {t('import')}
              </Button>
              {showExportButton ? (
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {t('export')}
                </Button>
              ) : null}
              <Button size="sm" onClick={onAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addProduct')}
              </Button>
            </>
          ) : showExportButton ? (
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('export')}
            </Button>
          ) : null}
        </>
      }
      footerLeft={
        <div className="flex-1 text-sm text-muted-foreground">
          {t('footerSelected', { selected: selectedProducts.length, total: sortedProducts.length })}
        </div>
      }
      footerRight={
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">{t('rowsPerPage')}</p>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {t('paginationLabel', { page: currentPage, total: totalPages || 1 })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label={t('aria.first')}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label={t('aria.previous')}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label={t('aria.next')}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label={t('aria.last')}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      }
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
          <TableRow>
            <TableHead className="w-12 px-2">
              <Checkbox
                checked={
                  selectedProducts.length === paginatedProducts.length &&
                  paginatedProducts.length > 0
                }
                onCheckedChange={(value) => handleSelectAll(!!value)}
                aria-label={t('aria.selectAll')}
              />
            </TableHead>
            <TableHead
              className="w-32 cursor-pointer"
              onClick={() => handleSort('code')}
              aria-sort={
                sortBy === 'code'
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              <div className="flex items-center">
                {t('columns.code')}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead
              className="min-w-[200px] cursor-pointer"
              onClick={() => handleSort('name')}
              aria-sort={
                sortBy === 'name'
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              <div className="flex items-center">
                {t('columns.name')}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead
              className="w-32 cursor-pointer"
              onClick={() => handleSort('price')}
              aria-sort={
                sortBy === 'price'
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              <div className="flex items-center">
                {t('columns.basePrice')}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="min-w-[250px]">{t('columns.category')}</TableHead>
            <TableHead className="w-24">{t('columns.status')}</TableHead>
            {(onEdit || onDelete) && <TableHead className="w-20 text-right">{t('columns.actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={(onEdit || onDelete) ? 7 : 6} className="h-24 text-center text-muted-foreground">
                {t('emptyTable')}
              </TableCell>
            </TableRow>
          ) : (
            paginatedProducts.map((product) => (
              <TableRow
                key={product.id}
                data-state={
                  selectedProducts.includes(product.id) ? 'selected' : undefined
                }
              >
                <TableCell className="w-12 px-2">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(product.id, checked as boolean)
                    }
                    aria-label={t('aria.selectProduct', { product: product.name })}
                  />
                </TableCell>
                <TableCell className="w-32 font-medium">{product.code}</TableCell>
                <TableCell className="min-w-[200px]">{product.name}</TableCell>
                <TableCell className="w-32">{formatPrice(product.base_price_usd)}</TableCell>
                <TableCell className="min-w-[250px]">
                  {getCategoryName(product.category_id) ? (
                    <Badge variant="secondary" className="max-w-full">
                      {getCategoryName(product.category_id)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="w-24">
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? t('status.active') : t('status.inactive')}
                  </Badge>
                </TableCell>
                {(onEdit || onDelete) && (
                  <TableCell className="w-20 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('aria.openRowMenu')}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('menu.title')}</DropdownMenuLabel>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            {onDelete ? (
                              <Edit className="mr-2 h-4 w-4" />
                            ) : (
                              <DollarSign className="mr-2 h-4 w-4" />
                            )}
                            {onDelete ? t('menu.edit') : t('menu.setPrice')}
                          </DropdownMenuItem>
                        )}
                        {onEdit && onDelete && <DropdownMenuSeparator />}
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('menu.delete')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  )
}
