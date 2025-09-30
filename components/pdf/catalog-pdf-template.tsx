import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

import type { ProductForPDF } from '@/lib/pdf/generate-catalog-pdf'

// Create styles inspired by zinc theme
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2pt solid #27272a',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 4,
  },
  clientInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f4f4f5',
    borderRadius: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 4,
  },
  generatedDate: {
    fontSize: 10,
    color: '#71717a',
  },
  productGrid: {
    marginTop: 20,
  },
  productCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    border: '1pt solid #e4e4e7',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 4,
  },
  productName: {
    fontSize: 11,
    color: '#52525b',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#e4e4e7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 9,
    color: '#3f3f46',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  pricingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1pt solid #e4e4e7',
  },
  priceColumn: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 9,
    color: '#71717a',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#18181b',
  },
  customPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: 'bold',
  },
  savingsText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTop: '1pt solid #e4e4e7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#71717a',
  },
  emptyState: {
    textAlign: 'center',
    padding: 40,
    color: '#71717a',
    fontSize: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    marginLeft: 12,
    borderRadius: 4,
    objectFit: 'cover',
  },
  statsBar: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1pt solid #e4e4e7',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: '#71717a',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
  },
})

interface CatalogPdfTranslations {
  title: string
  subtitle: string
  generatedOn: string
  statsTotalProducts: string
  statsTotalSavings: string
  statsAvgDiscount: string
  empty: string
  price: {
    base: string
    custom: string
    discount: string
    savings: string
  }
  footer: {
    brand: string
    pagination: string
  }
}

interface CatalogPDFProps {
  products: ProductForPDF[]
  clientName?: string
  categoryTitle?: string
  locale?: string
  translations: CatalogPdfTranslations
}

export const CatalogPDFTemplate: React.FC<CatalogPDFProps> = ({
  products,
  clientName,
  categoryTitle,
  locale = 'en',
  translations,
}) => {
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US'
  const formattedDate = new Intl.DateTimeFormat(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
  const numberLocale = dateLocale
  const currencyFormatter = new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const resolvedCategoryTitle = categoryTitle ?? ''
  const subtitleText = translations.subtitle.replace('{categoryTitle}', resolvedCategoryTitle || translations.title)
  const generatedText = translations.generatedOn.replace('{date}', formattedDate)
  const formatCurrency = (value: number) => currencyFormatter.format(value)

  // Calculate summary statistics
  const totalProducts = products.length
  const totalSavings = products.reduce((sum, p) => sum + (p.savings || 0), 0)
  const avgDiscount =
    products.filter(p => p.discount_percentage).length > 0
      ? products.reduce((sum, p) => sum + (p.discount_percentage || 0), 0) /
        products.filter(p => p.discount_percentage).length
      : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{translations.title}</Text>
          <Text style={styles.headerSubtitle}>{subtitleText}</Text>

          {clientName && (
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.generatedDate}>{generatedText}</Text>
            </View>
          )}
        </View>

        {/* Summary Statistics */}
        {totalProducts > 0 && (
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{translations.statsTotalProducts}</Text>
              <Text style={styles.statValue}>{totalProducts}</Text>
            </View>
            {totalSavings > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{translations.statsTotalSavings}</Text>
                <Text style={styles.statValue}>{formatCurrency(totalSavings)}</Text>
              </View>
            )}
            {avgDiscount > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{translations.statsAvgDiscount}</Text>
                <Text style={styles.statValue}>{avgDiscount.toFixed(1)}%</Text>
              </View>
            )}
          </View>
        )}

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {products.length === 0 ? (
            <Text style={styles.emptyState}>{translations.empty}</Text>
          ) : (
            products.map((product, index) => (
              <View key={product.id || index} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productCode}>{product.code}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                    {product.category_name && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{product.category_name}</Text>
                      </View>
                    )}
                  </View>
                  {product.image_url && (
                    <Image
                      style={styles.productImage}
                      src={product.image_url}
                    />
                  )}
                </View>

                <View style={styles.pricingSection}>
                  <View style={styles.priceColumn}>
                    <Text style={styles.priceLabel}>{translations.price.base}</Text>
                    <Text style={styles.priceValue}>
                      {formatCurrency(product.base_price_usd)}
                    </Text>
                  </View>

                  {product.custom_price !== undefined && product.custom_price > 0 && (
                    <View style={styles.priceColumn}>
                      <Text style={styles.priceLabel}>{translations.price.custom}</Text>
                      <Text style={styles.customPrice}>
                        {formatCurrency(product.custom_price)}
                      </Text>
                    </View>
                  )}

                  {product.discount_percentage !== undefined &&
                    product.discount_percentage > 0 && (
                      <View style={styles.priceColumn}>
                        <Text style={styles.priceLabel}>{translations.price.discount}</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            {product.discount_percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    )}

                  {product.savings !== undefined && product.savings > 0 && (
                    <View style={styles.priceColumn}>
                      <Text style={styles.priceLabel}>{translations.price.savings}</Text>
                      <Text style={styles.savingsText}>
                        {formatCurrency(product.savings)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{translations.footer.brand}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              translations.footer.pagination
                .replace('{page}', pageNumber.toString())
                .replace('{total}', totalPages.toString())
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  )
}
