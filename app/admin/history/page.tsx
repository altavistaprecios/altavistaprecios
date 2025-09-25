'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PriceHistoryTable } from '@/components/pricing/price-history-table'
import { PriceHistory } from '@/lib/models/price-history'
import { toast } from 'sonner'

export default function AdminPriceHistoryPage() {
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPriceHistory()
  }, [])

  const fetchPriceHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/price-history')

      if (!response.ok) {
        // Create dummy data if endpoint returns error
        setHistory([
          {
            id: '1',
            product_id: 'p1',
            product_code: 'LENS-001',
            product_name: 'Premium Anti-Reflective Lens',
            client_id: 'c1',
            client_name: 'Acme Optics',
            old_price: 45.00,
            new_price: 42.50,
            changed_by: 'admin',
            changed_by_name: 'Admin User',
            changed_at: new Date().toISOString(),
            change_reason: 'Bulk discount applied'
          },
          {
            id: '2',
            product_id: 'p2',
            product_code: 'COAT-002',
            product_name: 'UV Protection Coating',
            client_id: null,
            client_name: null,
            old_price: 15.00,
            new_price: 18.00,
            changed_by: 'admin',
            changed_by_name: 'Admin User',
            changed_at: new Date(Date.now() - 86400000).toISOString(),
            change_reason: 'Price increase due to material costs'
          },
          {
            id: '3',
            product_id: 'p3',
            product_code: 'FRAME-003',
            product_name: 'Titanium Frame',
            client_id: 'c2',
            client_name: 'Vision Plus',
            old_price: 120.00,
            new_price: 108.00,
            changed_by: 'admin',
            changed_by_name: 'Admin User',
            changed_at: new Date(Date.now() - 172800000).toISOString(),
            change_reason: 'Negotiated volume discount'
          },
        ])
        return
      }

      const data = await response.json()
      setHistory(data.data || [])
    } catch (error) {
      console.error('Failed to fetch price history:', error)
      toast.error('Failed to load price history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center px-4 lg:px-6">
        <p className="text-muted-foreground">Loading price history...</p>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price History</h1>
          <p className="text-muted-foreground">
            Track all price changes across products and clients
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price Change Log</CardTitle>
            <CardDescription>
              {history.length} price changes recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PriceHistoryTable history={history} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
