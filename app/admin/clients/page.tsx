'use client'

import * as React from 'react'
import { ClientsTable } from '@/components/clients/clients-table'
import { toast } from 'sonner'

interface Client {
  id: string
  email: string
  company_name: string
  contact_name: string
  role: string
  created_at: string
  last_sign_in_at?: string
  discount_tier?: number
  total_orders?: number
  active?: boolean
}

export default function AdminClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/clients')

      if (!response.ok) {
        // Create dummy data if endpoint doesn't exist yet - showing only active clients
        setClients([
          {
            id: '1',
            email: 'client1@example.com',
            company_name: 'Acme Optics',
            contact_name: 'John Smith',
            role: 'client',
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
            last_sign_in_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            discount_tier: 10,
            total_orders: 25,
            active: true,
          },
          {
            id: '2',
            email: 'client2@example.com',
            company_name: 'Vision Plus',
            contact_name: 'Jane Doe',
            role: 'client',
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
            last_sign_in_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            discount_tier: 15,
            total_orders: 42,
            active: true,
          },
          {
            id: '3',
            email: 'client3@example.com',
            company_name: 'LensCrafters Pro',
            contact_name: 'Michael Johnson',
            role: 'client',
            created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
            last_sign_in_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            discount_tier: 20,
            total_orders: 87,
            active: true,
          },
          {
            id: '4',
            email: 'client4@example.com',
            company_name: 'Optical Solutions Inc',
            contact_name: 'Sarah Williams',
            role: 'client',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            last_sign_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            discount_tier: 5,
            total_orders: 12,
            active: true,
          },
          {
            id: '5',
            email: 'client5@example.com',
            company_name: 'Clear View Optics',
            contact_name: 'Robert Brown',
            role: 'client',
            created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
            last_sign_in_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            discount_tier: 25,
            total_orders: 156,
            active: true,
          },
        ])
        return
      }

      const data = await response.json()
      // Filter to show only active/approved clients
      const activeClients = (data.data || []).filter((client: Client) => client.active === true)
      setClients(activeClients)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteClient = async (data: any) => {
    try {
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to send invitation')

      toast.success('Invitation sent successfully')
      fetchClients() // Refresh the list
    } catch (error) {
      console.error('Failed to invite client:', error)
      toast.error('Failed to send invitation')
      throw error
    }
  }

  const handleResendInvite = async (client: Client) => {
    try {
      const response = await fetch('/api/auth/invite/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: client.email }),
      })

      if (!response.ok) throw new Error('Failed to resend invitation')

      toast.success('Invitation resent successfully')
    } catch (error) {
      console.error('Failed to resend invite:', error)
      toast.error('Failed to resend invitation')
    }
  }

  const handleExport = async () => {
    toast.info('Exporting client data...')
    // Implement CSV export logic here
    const csv = [
      ['Company', 'Contact', 'Email', 'Discount', 'Orders', 'Status', 'Joined'].join(','),
      ...clients.map(c => [
        c.company_name,
        c.contact_name,
        c.email,
        `${c.discount_tier || 0}%`,
        c.total_orders || 0,
        c.active ? 'Active' : 'Invited',
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Client data exported')
  }

  return (
    <div className="flex flex-1 flex-col">
      <ClientsTable
        clients={clients}
        loading={loading}
        onInvite={handleInviteClient}
        onResendInvite={handleResendInvite}
        onExport={handleExport}
      />
    </div>
  )
}
