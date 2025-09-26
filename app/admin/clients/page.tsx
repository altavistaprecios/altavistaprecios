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
        throw new Error('Failed to fetch clients')
      }

      const data = await response.json()
      console.log('Clients API response:', data)
      // Show all clients (both approved and pending)
      setClients(data.data || [])
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteClient = async (data: any) => {
    try {
      const response = await fetch('/api/auth/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create client')

      toast.success('Client created successfully')
      fetchClients() // Refresh the list
    } catch (error) {
      console.error('Failed to create client:', error)
      toast.error('Failed to create client')
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
