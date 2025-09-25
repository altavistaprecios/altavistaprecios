'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table-optics'
import { DataTableSkeleton } from '@/components/products/data-table-skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductForm } from '@/components/products/product-form'
import { Product } from '@/lib/models/product'
import { Button } from '@/components/ui/button'
import { PlusIcon, Grid3x3Icon } from 'lucide-react'
import { SpecificationsView } from '@/components/products/specifications-view'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'

export default function MonofocalesTerminadosPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined)
  const [showSpecGrid, setShowSpecGrid] = React.useState(false)

  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: allProducts = [], isLoading: productsLoading } = useProducts()

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  // Filter products for ClearView category
  const clearViewCategories = React.useMemo(() => {
    return categories.filter(c => c.slug === 'monofocales-terminados')
  }, [categories])

  const products = React.useMemo(() => {
    const clearViewCategory = categories.find((c) => c.slug === 'monofocales-terminados')
    return allProducts.filter((p) => p.category_id === clearViewCategory?.id)
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
    if (!confirm('¿Está seguro de eliminar este producto?')) return
    await deleteMutation.mutateAsync(id)
  }

  const loading = productsLoading || categoriesLoading

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-4 lg:px-6 pb-4">
          <div>
            <h1 className="text-2xl font-bold">MONOFOCALES TERMINADOS</h1>
            <p className="text-muted-foreground">CLEARVIEW 1.60 DuraVision con Tratamientos DuraVision® y material BlueGuard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Grid3x3Icon className="mr-2 h-4 w-4" />
              Ver Especificaciones Técnicas
            </Button>
            <Button disabled>
              <PlusIcon className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </div>
        <DataTableSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 lg:px-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold">MONOFOCALES TERMINADOS</h1>
          <p className="text-muted-foreground">CLEARVIEW 1.60 DuraVision con Tratamientos DuraVision® y material BlueGuard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSpecGrid(!showSpecGrid)}>
            <Grid3x3Icon className="mr-2 h-4 w-4" />
            {showSpecGrid ? 'Ver Productos' : 'Ver Especificaciones Técnicas'}
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {showSpecGrid ? (
        <SpecificationsView />
      ) : (
        <DataTable
          data={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          productType="clearview"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Actualice los detalles del producto ClearView'
                : 'Ingrese los detalles del nuevo producto ClearView'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            categories={clearViewCategories}
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