import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface InvoiceItem {
  description: string
  quantity: number
  amount: number
  total: number
}

interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  fromName: string
  fromEmail: string
  fromAddress: string
  fromCity: string
  fromCountry: string
  toName: string
  toAddress: string
  toCity: string
  toCountry: string
  toEmail?: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  vatRate: number
  vatAmount: number
  total: number
  paymentDetails?: string
  note?: string
  status?: 'paid' | 'pending' | 'overdue'
}

interface InvoicePDFProps {
  invoice: InvoiceData
  locale?: string
  translations: InvoicePdfTranslations
}

interface InvoicePdfTranslations {
  title: string
  number: string
  date: string
  dueDate: string
  from: string
  to: string
  description: string
  quantity: string
  amount: string
  total: string
  subtotal: string
  discount: string
  vat: string
  paymentDetails: string
  note: string
  status: Record<'paid' | 'pending' | 'overdue', string>
}

// Compact, space-efficient styles with Geist Mono for numbers
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#000000',
    fontFamily: 'Helvetica',
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  invoiceDetails: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    color: '#a1a1aa',
    width: 100,
  },
  value: {
    fontSize: 10,
    fontFamily: 'Courier',
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  addressBlock: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 9,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 9,
    marginBottom: 1,
  },
  table: {
    marginTop: 16,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #27272a',
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tableColDesc: {
    flex: 3,
    fontSize: 10,
  },
  tableColQty: {
    flex: 0.5,
    fontSize: 10,
    fontFamily: 'Courier',
    textAlign: 'right',
  },
  tableColAmount: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Courier',
    textAlign: 'right',
  },
  tableColTotal: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Courier',
    textAlign: 'right',
  },
  tableHeaderText: {
    fontSize: 9,
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  summarySection: {
    alignSelf: 'flex-end',
    width: 200,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#a1a1aa',
  },
  summaryValue: {
    fontSize: 10,
    fontFamily: 'Courier',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1pt solid #27272a',
    paddingTop: 6,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: '1pt solid #27272a',
  },
  footerSection: {
    marginBottom: 8,
  },
  footerLabel: {
    fontSize: 9,
    color: '#a1a1aa',
    marginBottom: 2,
  },
  footerText: {
    fontSize: 9,
    fontFamily: 'Courier',
  },
})

export const InvoicePDFTemplate: React.FC<InvoicePDFProps> = ({
  invoice,
  locale = 'en',
  translations,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return '#16a34a'
      case 'overdue':
        return '#dc2626'
      case 'pending':
      default:
        return '#eab308'
    }
  }

  const numberLocale = locale === 'es' ? 'es-ES' : 'en-US'
  const currencyFormatter = new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formatCurrency = (value: number) => currencyFormatter.format(value)

  const statusLabel = invoice.status ? translations.status[invoice.status] ?? invoice.status : undefined
  const vatLabel = translations.vat.replace('{percentage}', invoice.vatRate.toString())

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{invoice.fromName}</Text>
          </View>
          {invoice.status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
              <Text style={styles.statusText}>{statusLabel ?? invoice.status}</Text>
            </View>
          )}
        </View>

        {/* Invoice Title & Details */}
        <Text style={styles.invoiceTitle}>{translations.title}</Text>

        <View style={styles.invoiceDetails}>
          <Text style={styles.label}>{translations.number}:</Text>
          <Text style={styles.value}>{invoice.invoiceNumber}</Text>
        </View>
        <View style={styles.invoiceDetails}>
          <Text style={styles.label}>{translations.date}:</Text>
          <Text style={styles.value}>{invoice.invoiceDate}</Text>
        </View>
        <View style={styles.invoiceDetails}>
          <Text style={styles.label}>{translations.dueDate}:</Text>
          <Text style={styles.value}>{invoice.dueDate}</Text>
        </View>

        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>{translations.from}</Text>
            <Text style={styles.addressName}>{invoice.fromName}</Text>
            <Text style={styles.addressLine}>{invoice.fromEmail}</Text>
            <Text style={styles.addressLine}>{invoice.fromAddress}</Text>
            <Text style={styles.addressLine}>{invoice.fromCity}</Text>
            <Text style={styles.addressLine}>{invoice.fromCountry}</Text>
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>{translations.to}</Text>
            <Text style={styles.addressName}>{invoice.toName}</Text>
            {invoice.toEmail && <Text style={styles.addressLine}>{invoice.toEmail}</Text>}
            <Text style={styles.addressLine}>{invoice.toAddress}</Text>
            <Text style={styles.addressLine}>{invoice.toCity}</Text>
            <Text style={styles.addressLine}>{invoice.toCountry}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColDesc, styles.tableHeaderText]}>{translations.description}</Text>
            <Text style={[styles.tableColQty, styles.tableHeaderText]}>{translations.quantity}</Text>
            <Text style={[styles.tableColAmount, styles.tableHeaderText]}>{translations.amount}</Text>
            <Text style={[styles.tableColTotal, styles.tableHeaderText]}>{translations.total}</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableColDesc}>{item.description}</Text>
              <Text style={styles.tableColQty}>{item.quantity}</Text>
              <Text style={styles.tableColAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.tableColTotal}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{translations.subtotal}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>

          {invoice.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{translations.discount}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(invoice.discount)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{vatLabel}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoice.vatAmount)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{translations.total}</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {invoice.paymentDetails && (
            <View style={styles.footerSection}>
              <Text style={styles.footerLabel}>{translations.paymentDetails}</Text>
              <Text style={styles.footerText}>{invoice.paymentDetails}</Text>
            </View>
          )}

          {invoice.note && (
            <View style={styles.footerSection}>
              <Text style={styles.footerLabel}>{translations.note}</Text>
              <Text style={styles.footerText}>{invoice.note}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
