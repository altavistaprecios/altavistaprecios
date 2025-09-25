'use client'

import * as React from 'react'
import { z } from 'zod'
import { ColumnDef } from '@tanstack/react-table'
import { UniversalDataTable, DragHandle } from '@/components/ui/universal-data-table'
import { TableConfig, TableAction, TableBulkAction, TableTab } from '@/lib/table/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  Plus,
  Download,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/lib/models/product'

const productSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  base_price_usd: z.number(),
  category_id: z.string().nullable(),
  is_active: z.boolean(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

type ProductData = z.infer<typeof productSchema>

function ProductDetailViewer({ product }: { product: ProductData }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {product.name}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>
            Product code: {product.code}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="product-code">Product Code</Label>
              <Input id="product-code" defaultValue={product.code} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="product-name">Product Name</Label>
              <Input id="product-name" defaultValue={product.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="base-price">Base Price (USD)</Label>
                <Input
                  id="base-price"
                  type="number"
                  defaultValue={product.base_price_usd}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={product.is_active ? 'active' : 'inactive'}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={product.category_id || 'uncategorized'}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  <SelectItem value="frames">Frames</SelectItem>
                  <SelectItem value="lenses">Lenses</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={product.description || ''}
                placeholder="Enter product description..."
              />
            </div>
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button
            className="w-full"
            onClick={() => {
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                loading: `Saving ${product.name}`,
                success: "Product saved successfully",
                error: "Error saving product",
              })
            }}
          >
            Save Changes
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

interface ProductTableV2Props {
  products: Product[]
  categories?: Array<{ id: string; name: string }>
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onBulkDelete?: (productIds: string[]) => void
  onAddProduct?: () => void
  onImport?: () => void
  onExport?: () => void
}

export function ProductTableV2({
  products,
  categories = [],
  onEdit,
  onDelete,
  onBulkDelete,
  onAddProduct,
  onImport,
  onExport,
}: ProductTableV2Props) {
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

  const columns: ColumnDef<ProductData>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.code}</div>
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <ProductDetailViewer product={row.original} />
      },
      enableHiding: false,
    },
    {
      accessorKey: "base_price_usd",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Base Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                loading: `Updating price for ${row.original.name}`,
                success: "Price updated",
                error: "Error updating price",
              })
            }}
          >
            <Label htmlFor={`${row.original.id}-price`} className="sr-only">
              Price
            </Label>
            <Input
              className="h-8 w-24 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
              defaultValue={formatPrice(row.original.base_price_usd)}
              id={`${row.original.id}-price`}
            />
          </form>
        )
      },
    },
    {
      accessorKey: "category_id",
      header: "Category",
      cell: ({ row }) => {
        const categoryName = getCategoryName(row.original.category_id)
        return categoryName ? (
          <Badge variant="secondary">{categoryName}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onEdit?.(row.original as Product)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(row.original as Product)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const config: TableConfig<ProductData> = {
    columns,
    schema: productSchema,
    enableDragAndDrop: true,
    enableSelection: true,
    enableInlineEdit: true,
    enableDetailView: true,
    defaultPageSize: 10,
  }

  const bulkActions: TableBulkAction<ProductData>[] = [
    {
      label: "Bulk Edit",
      onClick: (rows) => toast.info(`Edit ${rows.length} products`),
    },
    {
      label: "Bulk Delete",
      onClick: (rows) => onBulkDelete?.(rows.map(r => r.id)),
      variant: "destructive",
    },
  ]

  const tabs: TableTab[] = [
    {
      value: "all",
      label: "All Products",
      badge: products.length,
    },
    {
      value: "active",
      label: "Active",
      badge: products.filter(p => p.is_active).length,
    },
    {
      value: "inactive",
      label: "Inactive",
      badge: products.filter(p => !p.is_active).length,
    },
  ]

  return (
    <UniversalDataTable
      data={products as ProductData[]}
      config={config}
      tabs={tabs}
      bulkActions={bulkActions}
      searchPlaceholder="Search products by name or code..."
      heading={<h1 className="text-3xl font-bold tracking-tight">Products</h1>}
      description="Manage your product catalog"
      toolbar={
        <>
          <Button size="sm" variant="outline" onClick={onImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button size="sm" variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={onAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </>
      }
    />
  )
}