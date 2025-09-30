import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

import { ensureCatalogPDFFonts } from '@/lib/pdf/register-fonts'
import type { ProductForPDF } from '@/lib/pdf/generate-catalog-pdf'

ensureCatalogPDFFonts()

const palette = {
  page: '#050505',
  card: '#111113',
  border: '#27272a',
  accent: '#16a34a',
  accentText: '#052e16',
  textPrimary: '#f4f4f5',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  rowAlt: '#0c0c0f',
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 32,
    paddingHorizontal: 32,
    backgroundColor: palette.page,
    color: palette.textPrimary,
    fontFamily: 'Geist Sans',
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 10,
    border: `1pt solid ${palette.border}`,
    padding: 28,
    paddingBottom: 80,
    position: 'relative',
    minHeight: 690,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  brandBlock: {
    flex: 1,
    marginRight: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 9,
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusBadge: {
    backgroundColor: palette.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 8,
    fontFamily: 'Geist Mono',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: palette.accentText,
  },
  metaSection: {
    flexDirection: 'row',
    marginBottom: 22,
    borderTop: `1pt solid ${palette.border}`,
    borderBottom: `1pt solid ${palette.border}`,
  },
  metaItem: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    borderRight: `1pt solid ${palette.border}`,
  },
  metaItemLast: {
    paddingRight: 0,
    borderRight: '0pt',
  },
  metaLabel: {
    fontSize: 7,
    color: palette.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 9,
    fontFamily: 'Geist Mono',
    color: palette.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    border: `1pt solid ${palette.border}`,
    padding: 12,
    backgroundColor: '#09090b',
  },
  statCardSpacing: {
    marginLeft: 16,
  },
  statLabel: {
    fontSize: 7,
    color: palette.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Geist Mono',
  },
  tableWrapper: {
    borderRadius: 12,
    border: `1pt solid ${palette.border}`,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottom: `1pt solid ${palette.border}`,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottom: `1pt solid ${palette.border}`,
  },
  tableRowAlt: {
    backgroundColor: palette.rowAlt,
  },
  tableHeaderText: {
    fontSize: 7,
    color: palette.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  colCode: {
    flex: 1,
  },
  colProduct: {
    flex: 3,
  },
  colNumeric: {
    flex: 1,
    textAlign: 'right',
  },
  colStatus: {
    flex: 1,
    textAlign: 'right',
  },
  codeText: {
    fontFamily: 'Geist Mono',
    fontSize: 8,
    color: palette.textMuted,
  },
  productCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: '#18181b',
    objectFit: 'cover',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 9,
    marginBottom: 1,
  },
  productMeta: {
    fontFamily: 'Geist Mono',
    fontSize: 7,
    color: palette.textMuted,
  },
  numericText: {
    fontFamily: 'Geist Mono',
    fontSize: 8,
  },
  faintText: {
    color: palette.textSubtle,
  },
  statusPill: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: '#14532d',
  },
  statusInactive: {
    backgroundColor: '#3f3f46',
  },
  statusText: {
    fontSize: 7,
    fontFamily: 'Geist Mono',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statusTextActive: {
    color: '#dcfce7',
  },
  statusTextInactive: {
    color: '#f4f4f5',
  },
  emptyState: {
    padding: 32,
    textAlign: 'center',
    fontSize: 9,
    color: palette.textSubtle,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
    borderTop: `1pt solid ${palette.border}`,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: palette.textSubtle,
  },
})

interface CatalogPdfTranslations {
  title: string
  subtitle: string
  generatedOn: string
  header: {
    client: string
    category: string
    generated: string
    general: string
  }
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
  table: {
    code: string
    product: string
    status: string
  }
  status: {
    active: string
    inactive: string
  }
  footer: {
    brand: string
    pagination: string
  }
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
  const formatCurrency = (value: number) => currencyFormatter.format(value)

  const resolvedCategoryTitle = categoryTitle ?? ''
  const resolvedClientName = clientName ?? translations.header.general
  const subtitleText = translations.subtitle.replace(
    '{categoryTitle}',
    resolvedCategoryTitle || translations.header.general
  )
  const metaItems = [
    {
      label: translations.header.client,
      value: resolvedClientName,
    },
    {
      label: translations.header.category,
      value: resolvedCategoryTitle || translations.header.general,
    },
    {
      label: translations.header.generated,
      value: formattedDate,
    },
  ]

  const totalProducts = products.length
  const totalSavings = products.reduce((sum, p) => sum + (p.savings || 0), 0)
  const discountEntries = products.filter((p) => p.discount_percentage)
  const avgDiscount =
    discountEntries.length > 0
      ? discountEntries.reduce((sum, p) => sum + (p.discount_percentage || 0), 0) /
        discountEntries.length
      : 0

  const stats = [
    {
      label: translations.statsTotalProducts,
      value: totalProducts.toString(),
    },
    totalSavings > 0
      ? {
          label: translations.statsTotalSavings,
          value: formatCurrency(totalSavings),
        }
      : null,
    avgDiscount > 0
      ? {
          label: translations.statsAvgDiscount,
          value: `${avgDiscount.toFixed(1)}%`,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  const badgeText = clientName ? translations.header.client : translations.header.general

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          <View style={styles.headerTop}>
            <View style={styles.brandBlock}>
              <Text style={styles.brandTitle}>{translations.title}</Text>
              <Text style={styles.brandSubtitle}>{subtitleText}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{badgeText}</Text>
            </View>
          </View>

          <View style={styles.metaSection}>
            {metaItems.map((item, index) => {
              const metaStyle =
                index === metaItems.length - 1
                  ? [styles.metaItem, styles.metaItemLast]
                  : styles.metaItem

              return (
                <View
                  key={`${item.label}-${index}`}
                  style={metaStyle}
                >
                  <Text style={styles.metaLabel}>{item.label}</Text>
                  <Text style={styles.metaValue}>{item.value}</Text>
                </View>
              )
            })}
          </View>

          {stats.length > 0 && (
            <View style={styles.statsRow}>
              {stats.map((stat, index) => {
                const statStyle = index > 0 ? [styles.statCard, styles.statCardSpacing] : styles.statCard

                return (
                  <View
                    key={`${stat.label}-${index}`}
                    style={statStyle}
                  >
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                )
              })}
            </View>
          )}

          {products.length === 0 ? (
            <Text style={styles.emptyState}>{translations.empty}</Text>
          ) : (
            <View style={styles.tableWrapper}>
              <View style={styles.tableHeaderRow}>
                <View style={styles.colCode}>
                  <Text style={styles.tableHeaderText}>{translations.table.code}</Text>
                </View>
                <View style={styles.colProduct}>
                  <Text style={styles.tableHeaderText}>{translations.table.product}</Text>
                </View>
                <View style={styles.colNumeric}>
                  <Text style={styles.tableHeaderText}>{translations.price.base}</Text>
                </View>
                <View style={styles.colNumeric}>
                  <Text style={styles.tableHeaderText}>{translations.price.custom}</Text>
                </View>
                <View style={styles.colNumeric}>
                  <Text style={styles.tableHeaderText}>{translations.price.discount}</Text>
                </View>
                <View style={styles.colNumeric}>
                  <Text style={styles.tableHeaderText}>{translations.price.savings}</Text>
                </View>
                <View style={styles.colStatus}>
                  <Text style={styles.tableHeaderText}>{translations.table.status}</Text>
                </View>
              </View>

              {products.map((product, index) => {
                const customPrice =
                  product.custom_price !== undefined && product.custom_price > 0
                    ? formatCurrency(product.custom_price)
                    : '—'
                const discountValue =
                  product.discount_percentage !== undefined && product.discount_percentage > 0
                    ? `${product.discount_percentage.toFixed(1)}%`
                    : '—'
                const savingsValue =
                  product.savings !== undefined && product.savings > 0
                    ? formatCurrency(product.savings)
                    : '—'
                const statusStyle = product.is_active ? styles.statusActive : styles.statusInactive
                const statusTextStyle = product.is_active
                  ? [styles.statusText, styles.statusTextActive]
                  : [styles.statusText, styles.statusTextInactive]
                const statusLabel = product.is_active
                  ? translations.status.active
                  : translations.status.inactive
                const rowStyle = index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : [styles.tableRow]
                const customTextStyle =
                  customPrice === '—' ? [styles.numericText, styles.faintText] : [styles.numericText]
                const discountTextStyle =
                  discountValue === '—' ? [styles.numericText, styles.faintText] : [styles.numericText]
                const savingsTextStyle =
                  savingsValue === '—' ? [styles.numericText, styles.faintText] : [styles.numericText]

                return (
                  <View
                    key={product.id || `${product.code}-${index}`}
                    style={rowStyle}
                  >
                    <View style={styles.colCode}>
                      <Text style={styles.codeText}>{product.code}</Text>
                    </View>
                    <View style={styles.colProduct}>
                      <View style={styles.productCell}>
                        {product.image_url ? (
                          <Image style={styles.productThumb} src={product.image_url} />
                        ) : null}
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>{product.name}</Text>
                          {product.category_name ? (
                            <Text style={styles.productMeta}>{product.category_name}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                    <View style={styles.colNumeric}>
                      <Text style={styles.numericText}>{formatCurrency(product.base_price_usd)}</Text>
                    </View>
                    <View style={styles.colNumeric}>
                      <Text style={customTextStyle}>
                        {customPrice}
                      </Text>
                    </View>
                    <View style={styles.colNumeric}>
                      <Text style={discountTextStyle}>
                        {discountValue}
                      </Text>
                    </View>
                    <View style={styles.colNumeric}>
                      <Text style={savingsTextStyle}>
                        {savingsValue}
                      </Text>
                    </View>
                    <View style={styles.colStatus}>
                      <View style={[styles.statusPill, statusStyle]}>
                        <Text style={statusTextStyle}>{statusLabel}</Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{translations.footer.brand}</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) => {
                const currentPage =
                  typeof pageNumber === 'number' && Number.isFinite(pageNumber) && pageNumber > 0
                    ? pageNumber
                    : 1
                const totalPageCount =
                  typeof totalPages === 'number' && Number.isFinite(totalPages) && totalPages > 0
                    ? totalPages
                    : currentPage

                return translations.footer.pagination
                  .replace('{page}', currentPage.toString())
                  .replace('{total}', totalPageCount.toString())
              }}
              fixed
            />
          </View>
        </View>
      </Page>
    </Document>
  )
}

interface CatalogPDFProps {
  products: ProductForPDF[]
  clientName?: string
  categoryTitle?: string
  locale?: string
  translations: CatalogPdfTranslations
}
