'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Grid3x3,
  List,
  Download,
  Search,
  MoreVertical,
  DollarSign,
  Eye,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MockupFutureXPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [filter, setFilter] = useState('')

  // Mock data
  const products = [
    {
      id: '1',
      code: 'FGR54',
      name: 'Beta',
      base_price: 100.00,
      category: 'Future-X Stock',
      status: 'active'
    },
    {
      id: '2',
      code: 'TEST-MCP-002',
      name: 'Chrome MCP Test Product',
      base_price: 199.99,
      category: 'Future-X Laboratory',
      status: 'active'
    },
    {
      id: '3',
      code: 'FX-LAB-001',
      name: 'Premium AR Coating Lens',
      base_price: 349.99,
      category: 'Future-X Laboratory',
      status: 'active'
    },
    {
      id: '4',
      code: 'FX-STK-002',
      name: 'Standard Single Vision',
      base_price: 79.99,
      category: 'Future-X Stock',
      status: 'inactive'
    }
  ]

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.code.toLowerCase().includes(filter.toLowerCase())
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id))
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

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="px-6 pt-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/client">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/client/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Monofocales Future-X</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Enhanced Header */}
        <div className="px-6 space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Monofocales Future-X
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5">
              {filteredProducts.length} products
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Premium single vision lenses - Stock and Laboratory options
          </p>
        </div>

        <Separator className="mx-6" />

        {/* Main Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as 'grid' | 'list')}
                className="h-9"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view" className="h-9 px-3">
                  <Grid3x3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" className="h-9 px-3">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    Export Catalog
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download product catalog as CSV</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Product Table */}
          {viewMode === 'list' ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedProducts.length === filteredProducts.length &&
                          filteredProducts.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="font-medium">Product Code</TableHead>
                    <TableHead className="font-medium">Product Name</TableHead>
                    <TableHead className="font-medium text-right">Base Price</TableHead>
                    <TableHead className="font-medium">Category</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className={cn(
                        "group transition-colors",
                        index % 2 === 0 ? "bg-muted/20" : "bg-background",
                        "hover:bg-muted/40"
                      )}
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
                      <TableCell className="font-medium">
                        <span className="font-mono text-sm">{product.code}</span>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate max-w-[200px]">
                              {product.name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{product.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${product.base_price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.category.includes('Stock') ? 'default' : 'secondary'}
                          className="font-normal"
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.status === 'active' ? 'default' : 'outline'}
                          className={cn(
                            "font-normal",
                            product.status === 'active'
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                              : ""
                          )}
                        >
                          {product.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <DollarSign className="mr-2 h-4 w-4" />
                              Set Custom Price
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No products found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          ) : (
            /* Grid View */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-md transition-all hover:border-primary/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant={product.category.includes('Stock') ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {product.category}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Set Price
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground mb-1">
                        {product.code}
                      </p>
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-2xl font-bold">
                        ${product.base_price.toFixed(2)}
                      </span>
                      <Badge
                        variant={product.status === 'active' ? 'default' : 'outline'}
                        className={cn(
                          "font-normal text-xs",
                          product.status === 'active'
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                            : ""
                        )}
                      >
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selection Info */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Bulk Edit
                </Button>
                <Button size="sm" variant="outline">
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}