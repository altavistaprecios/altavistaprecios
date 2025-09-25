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

interface ProductTableProps {
  products: Product[]
  categories?: Array<{ id: string; name: string }>
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onBulkDelete?: (productIds: string[]) => void
  onAddProduct?: () => void
}

export function ProductTable({
  products,
  categories = [],
  onEdit,
  onDelete,
  onBulkDelete,
  onAddProduct
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([])
  const [filter, setFilter] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'code'>('name')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    const category = categories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm text-muted-foreground">Add your first product to get started</p>
        <Button className="mt-4" onClick={onAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    )
  }

  return (
    <DataTableShell
      filters={
        <div className="flex w-full flex-col gap-2 sm:max-w-lg">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter products..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 w-full pl-8"
            />
          </div>
          {selectedProducts.length > 0 && onBulkDelete && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <Button size="sm" variant="outline" aria-label="Bulk edit">
                Bulk Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkDelete?.(selectedProducts)}
                aria-label="Bulk delete"
              >
                Bulk Delete
              </Button>
            </div>
          )}
        </div>
      }
      toolbar={
        onAddProduct ? (
          <>
            <Button size="sm" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Products
            </Button>
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Catalog
            </Button>
            <Button size="sm" onClick={onAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Catalog
          </Button>
        )
      }
      footerLeft={
        <div className="text-sm text-muted-foreground">
          {selectedProducts.length} of {sortedProducts.length} row(s) selected.
        </div>
      }
      footerRight={
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
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
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Go to next page"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Go to last page"
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
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  selectedProducts.length === paginatedProducts.length &&
                  paginatedProducts.length > 0
                }
                onCheckedChange={(value) => handleSelectAll(!!value)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('code')}
              aria-sort={
                sortBy === 'code'
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              Product Code
              <ArrowUpDown className="ml-2 inline h-4 w-4" />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('name')}
              aria-sort={
                sortBy === 'name'
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              Product Name
              <ArrowUpDown className="ml-2 inline h-4 w-4" />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('price')}
              aria-sort={
                sortBy === 'price'
                  ? sortOrder === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              Base Price
              <ArrowUpDown className="ml-2 inline h-4 w-4" />
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            {(onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={(onEdit || onDelete) ? 7 : 6} className="h-24 text-center text-muted-foreground">
                No products found
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
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(product.id, checked as boolean)
                    }
                    aria-label={`Select ${product.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatPrice(product.base_price_usd)}</TableCell>
                <TableCell>
                  {getCategoryName(product.category_id) ? (
                    <Badge variant="secondary">
                      {getCategoryName(product.category_id)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            {onDelete ? (
                              <Edit className="mr-2 h-4 w-4" />
                            ) : (
                              <DollarSign className="mr-2 h-4 w-4" />
                            )}
                            {onDelete ? 'Edit' : 'Set Price'}
                          </DropdownMenuItem>
                        )}
                        {onEdit && onDelete && <DropdownMenuSeparator />}
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
