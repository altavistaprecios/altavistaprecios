import { pdf } from '@react-pdf/renderer'
import { InvoicePDFTemplate } from '@/components/pdf/invoice-pdf-template'

export interface InvoiceItem {
  description: string
  quantity: number
  amount: number
  total: number
}

export interface InvoiceData {
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

export interface GenerateInvoicePDFOptions {
  invoice: InvoiceData
  filename?: string
}

/**
 * Generate and download an invoice PDF
 */
export async function generateInvoicePDF({
  invoice,
  filename,
}: GenerateInvoicePDFOptions): Promise<void> {
  try {
    // Create the PDF document
    const pdfDoc = pdf(InvoicePDFTemplate({ invoice }))

    // Generate the blob
    const blob = await pdfDoc.toBlob()

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // Set filename
    const defaultFilename = `invoice_${invoice.invoiceNumber.replace(/\//g, '-')}_${
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
    console.error('Failed to generate invoice PDF:', error)
    throw new Error('Failed to generate invoice PDF')
  }
}

/**
 * Calculate invoice totals from items
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  vatRate: number = 25,
  discount: number = 0
): {
  subtotal: number
  discount: number
  vatAmount: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const afterDiscount = subtotal - discount
  const vatAmount = afterDiscount * (vatRate / 100)
  const total = afterDiscount + vatAmount

  return {
    subtotal,
    discount,
    vatAmount,
    total,
  }
}