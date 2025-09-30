import React from 'react'
import { pdf } from '@react-pdf/renderer'
import { CatalogPDFTemplate } from '@/components/pdf/catalog-pdf-template'

export interface ProductForPDF {
  id: string
  code: string
  name: string
  category_name?: string
  base_price_usd: number
  custom_price?: number
  discount_percentage?: number
  savings?: number
  image_url?: string | null
  is_active: boolean
}

export interface GenerateCatalogPDFOptions {
  products: ProductForPDF[]
  clientName?: string
  categoryTitle?: string
  filename?: string
  locale?: string
}

/**
 * Generate and download a PDF catalog with products and pricing
 */
export async function generateCatalogPDF({
  products,
  clientName,
  categoryTitle,
  filename,
  locale,
}: GenerateCatalogPDFOptions): Promise<void> {
  try {
    const documentLocale = locale || document.documentElement.lang || 'en'
    const normalizedLocale = documentLocale.startsWith('es') ? 'es' : 'en'
    const messages =
      normalizedLocale === 'es'
        ? (await import('@/messages/es.json')).default
        : (await import('@/messages/en.json')).default
    const pdfMessages = messages.pdf.catalog
    const resolvedCategoryTitle = categoryTitle ?? messages.nav.productCatalog

    // Create the PDF document
    const pdfDoc = pdf(
      React.createElement(CatalogPDFTemplate, {
        products,
        clientName,
        categoryTitle: resolvedCategoryTitle,
        locale: normalizedLocale,
        translations: pdfMessages,
      })
    )

    // Generate the blob
    const blob = await pdfDoc.toBlob()

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // Set filename
    const defaultFilename = `catalog_${categoryTitle?.toLowerCase().replace(/\s+/g, '_') || 'all'}_${
      new Date().toISOString().split('T')[0]
    }.pdf`
    link.download = filename || defaultFilename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw new Error('Failed to generate catalog PDF')
  }
}

/**
 * Prepare product data for PDF generation by combining product info with pricing
 */
export function prepareProductsForPDF(
  products: any[],
  clientPrices?: any[]
): ProductForPDF[] {
  return products.map((product) => {
    // Find client-specific pricing if available
    const clientPrice = clientPrices?.find((cp) => cp.product_id === product.id)

    // Calculate custom price and savings
    let customPrice: number | undefined
    let discountPercentage: number | undefined
    let savings: number | undefined

    if (clientPrice) {
      if (clientPrice.custom_price > 0) {
        const price = clientPrice.custom_price
        customPrice = price
        savings = product.base_price_usd - price
      } else if (clientPrice.discount_percentage > 0) {
        const percentage = clientPrice.discount_percentage
        discountPercentage = percentage
        const computedCustomPrice = product.base_price_usd * (1 - percentage / 100)
        customPrice = computedCustomPrice
        savings = product.base_price_usd - computedCustomPrice
      }
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      category_name: product.category_name || product.category?.name,
      base_price_usd: product.base_price_usd,
      custom_price: customPrice,
      discount_percentage: discountPercentage,
      savings: savings,
      image_url: product.image_url,
      is_active: product.is_active,
    }
  })
}
