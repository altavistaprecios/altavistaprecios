'use client'

import * as React from 'react'
import { DataTable } from '@/components/data-table'
import { ClientInviteDialog } from '@/components/clients/invite-dialog'
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

// Transform clients to match the DataTable schema
function transformClientsToTableData(clients: Client[]) {
  return clients.map((client, index) => ({
    id: index + 1,
    header: client.company_name,
    type: client.role || 'Client',
    status: client.active ? 'Active' : 'Invited',
    target: (client.discount_tier || 0).toString(),
    limit: (client.total_orders || 0).toString(),
    reviewer: client.contact_name,
  }))
}

export default function AdminClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)

  React.useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/clients')

      if (!response.ok) {
        // Create dummy data if endpoint doesn't exist yet
        setClients([
          {
            id: '1',
            email: 'client1@example.com',
            company_name: 'Acme Optics',
            contact_name: 'John Smith',
            role: 'client',
            created_at: new Date().toISOString(),
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
            created_at: new Date().toISOString(),
            discount_tier: 15,
            total_orders: 42,
            active: true,
          },
        ])
        return
      }

      const data = await response.json()
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
      const response = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to send invitation')

      toast.success('Invitation sent successfully')
      setInviteDialogOpen(false)
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center px-4 lg:px-6">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    )
  }

  // Transform clients to match the DataTable format
  const tableData = transformClientsToTableData(clients)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DataTable data={tableData} />

      <ClientInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={handleInviteClient}
      />
    </div>
  )
}
