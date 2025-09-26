'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table-optics'
import { DataTableSkeleton } from '@/components/products/data-table-skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductForm } from '@/components/products/product-form'
import { Product } from '@/lib/models/product'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'

export default function MonofocalesFutureXPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: allProducts = [], isLoading: productsLoading } = useProducts()

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  // Filter products for Future-X categories
  const futureXCategories = React.useMemo(() => {
    return categories.filter(c =>
      c.slug === 'monofocales-future-x-stock' ||
      c.slug === 'monofocales-future-x-laboratory'
    )
  }, [categories])

  const products = React.useMemo(() => {
    const stockCategory = categories.find((c) => c.slug === 'monofocales-future-x-stock')
    const labCategory = categories.find((c) => c.slug === 'monofocales-future-x-laboratory')

    return allProducts.filter((p) =>
      p.category_id === stockCategory?.id || p.category_id === labCategory?.id
    )
  }, [allProducts, categories])

  const handleCreateProduct = async (data: Product) => {
    await createMutation.mutateAsync(data)
    setDialogOpen(false)
    setSelectedProduct(undefined)
  }

  const handleUpdateProduct = async (data: Product) => {
    if (!selectedProduct?.id) return

    await updateMutation.mutateAsync({ id: selectedProduct.id, data })
    setDialogOpen(false)
    setSelectedProduct(undefined)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    await deleteMutation.mutateAsync(id)
  }

  const loading = productsLoading || categoriesLoading

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-4 lg:px-6 pb-4">
          <div>
            <h1 className="text-2xl font-bold">MONOFOCALES FUTURE-X</h1>
            <p className="text-muted-foreground">Stock and Laboratory Lens Management</p>
          </div>
          <Button disabled>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        <DataTableSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 lg:px-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold">MONOFOCALES FUTURE-X</h1>
          <p className="text-muted-foreground">Gestión de Lentes de Stock y Laboratorio</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      <DataTable
        data={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        productType="future-x"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Update product details'
                : 'Enter details for the new Future-X product'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            categories={futureXCategories}
            onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => {
              setDialogOpen(false)
              setSelectedProduct(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}