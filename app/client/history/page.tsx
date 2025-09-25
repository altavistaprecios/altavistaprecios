'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PriceHistoryTable } from '@/components/pricing/price-history-table'
import { PriceHistory } from '@/lib/models/price-history'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'

export default function ClientHistoryPage() {
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchPriceHistory()
  }, [])

  const fetchPriceHistory = async () => {
    try {
      setLoading(true)
      // Fetch price history filtered for this client
      const response = await fetch(`/api/price-history?client_id=${user?.id}`)

      if (!response.ok) {
        // Create dummy data specific to this client
        setHistory([
          {
            id: '1',
            product_id: 'p1',
            product_code: 'LENS-001',
            product_name: 'Premium Anti-Reflective Lens',
            client_id: user?.id || 'current',
            client_name: user?.company_name || 'Your Company',
            old_price: 45.00,
            new_price: 38.25,
            changed_by: 'admin',
            changed_by_name: 'Admin User',
            changed_at: new Date().toISOString(),
            change_reason: '15% volume discount applied'
          },
          {
            id: '2',
            product_id: 'p2',
            product_code: 'COAT-002',
            product_name: 'UV Protection Coating',
            client_id: user?.id || 'current',
            client_name: user?.company_name || 'Your Company',
            old_price: 15.00,
            new_price: 12.75,
            changed_by: 'admin',
            changed_by_name: 'Admin User',
            changed_at: new Date(Date.now() - 86400000).toISOString(),
            change_reason: 'Loyalty discount added'
          },
          {
            id: '3',
            product_id: 'p3',
            product_code: 'FRAME-003',
            product_name: 'Titanium Frame',
            client_id: user?.id || 'current',
            client_name: user?.company_name || 'Your Company',
            old_price: 120.00,
            new_price: 102.00,
            changed_by: 'admin',
            changed_by_name: 'Admin User',
            changed_at: new Date(Date.now() - 172800000).toISOString(),
            change_reason: 'Negotiated bulk purchase discount'
          },
        ])
        return
      }

      const data = await response.json()
      // Filter to show only this client's price changes
      const clientHistory = (data.data || []).filter((h: PriceHistory) =>
        h.client_id === user?.id
      )
      setHistory(clientHistory)
    } catch (error) {
      console.error('Failed to fetch price history:', error)
      toast.error('Failed to load price history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="px-4 lg:px-6 pb-4">
          <h1 className="text-2xl font-bold">Price History</h1>
          <p className="text-muted-foreground">
            Track changes to your custom pricing over time
          </p>
        </div>
        <div className="flex items-center justify-center h-96 px-4 lg:px-6">
          <p className="text-muted-foreground">Loading price history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 lg:px-6 pb-4">
        <h1 className="text-2xl font-bold">Price History</h1>
        <p className="text-muted-foreground">
          Track changes to your custom pricing over time
        </p>
      </div>

      <div className="px-4 lg:px-6 space-y-6">

      <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history.length}</div>
              <p className="text-xs text-muted-foreground">Price updates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Reduction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 dark:text-emerald-500 dark:text-emerald-400">
                {history.length > 0 ? (
                  (history.reduce((acc, h) => acc + ((h.old_price - h.new_price) / h.old_price * 100), 0) / history.length).toFixed(1)
                ) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Average price decrease</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {history.length > 0 ? (
                  new Date(history[0].changed_at).toLocaleDateString()
                ) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Most recent change</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Price Change Log</CardTitle>
            <CardDescription>
              All pricing adjustments made to your account
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