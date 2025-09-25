'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table'
import { DataTableSkeleton } from '@/components/products/data-table-skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductForm } from '@/components/products/product-form'
import { Product } from '@/lib/models/product'
import { ProductCategory } from '@/lib/models/product-category'
import { toast } from 'sonner'

// Transform products to match the DataTable schema
function transformProductsToTableData(products: Product[]) {
  return products.map((product, index) => ({
    id: index + 1,
    header: product.name,
    type: product.category_id || 'Product',
    status: product.is_active ? 'Active' : 'Inactive',
    target: product.base_price_usd.toString(),
    limit: '999', // Stock or any other field
    reviewer: product.code,
  }))
}

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<ProductCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      setProducts(productsData.products || [])
      setCategories(categoriesData.categories || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (data: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create product')

      const newProduct = await response.json()
      setProducts([...products, newProduct.product])
      setDialogOpen(false)
      setSelectedProduct(undefined)
      toast.success('Product created successfully')
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error('Failed to create product')
    }
  }

  const handleUpdateProduct = async (data: Product) => {
    try {
      const response = await fetch(`/api/products/${selectedProduct?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update product')

      const updatedProduct = await response.json()
      setProducts(products.map(p =>
        p.id === selectedProduct?.id ? updatedProduct.product : p
      ))
      setDialogOpen(false)
      setSelectedProduct(undefined)
      toast.success('Product updated successfully')
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error('Failed to update product')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <DataTableSkeleton />
      </div>
    )
  }

  // Transform products to match the DataTable format
  const tableData = transformProductsToTableData(products)

  return (
    <div className="flex flex-1 flex-col">
      <DataTable data={tableData} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Update the product details below'
                : 'Enter the details for the new product'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            categories={categories}
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