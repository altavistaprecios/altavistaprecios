'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, RefreshCw, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type RegistrationRequest = {
  id: string
  email: string
  company_name: string
  phone: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejected_reason: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export default function RegistrationsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .rpc('get_all_registration_requests')

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch registration requests',
        variant: 'destructive',
      })
      console.error('Error fetching requests:', error)
    } else {
      setRequests(data || [])
    }

    setLoading(false)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    setProcessing(true)

    try {
      // Call the API route to handle approval
      const response = await fetch('/api/admin/approve-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          email: selectedRequest.email,
          company_name: selectedRequest.company_name,
          phone: selectedRequest.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve registration')
      }

      if (data.warning) {
        toast({
          title: 'Partial Success',
          description: data.warning,
          variant: 'default',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Registration approved! The user will receive an email to set up their password.',
        })
      }

      // Refresh the list to show updated status
      await fetchRequests()
      setSelectedRequest(null)
      setActionType(null)

    } catch (error) {
      console.error('Error approving registration:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve registration',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    setProcessing(true)

    // Update the registration request to rejected
    const { error } = await supabase
      .from('registration_requests')
      .update({
        status: 'rejected',
        rejected_reason: rejectReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedRequest.id)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Registration request rejected',
      })
      fetchRequests()
      setSelectedRequest(null)
      setActionType(null)
      setRejectReason('')
    }

    setProcessing(false)
  }

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true
    return request.status === activeTab
  })

  const getStatusBadge = (status: string, approvedAt?: string | null) => {
    // For approved status, check if it was approved recently (within last 24 hours)
    // and show "Email Sent" badge instead
    if (status === 'approved' && approvedAt) {
      const approvedDate = new Date(approvedAt)
      const now = new Date()
      const hoursSinceApproval = (now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60)

      // Show "Email Sent" for recently approved registrations
      if (hoursSinceApproval < 24) {
        return (
          <Badge variant="default" className="gap-1">
            <Mail className="h-3 w-3" />
            Email Sent
          </Badge>
        )
      }
    }

    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 lg:px-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Registration Requests</h1>
          <p className="text-muted-foreground">
            Review and approve new client registration requests
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 lg:px-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({requests.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({requests.filter(r => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({requests.filter(r => r.status === 'rejected').length})
            </TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading registration requests...
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No registration requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.company_name}
                      </TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.phone || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(request.status, request.approved_at)}</TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setActionType('approve')
                                }}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Approve & Invite
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setActionType('reject')
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <span className="text-sm text-muted-foreground">
                              Approved {request.approved_at && `on ${new Date(request.approved_at).toLocaleDateString()}`}
                            </span>
                          )}
                          {request.status === 'rejected' && request.rejected_reason && (
                            <span className="text-sm text-muted-foreground">
                              {request.rejected_reason}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedRequest && !!actionType}
        onOpenChange={() => {
          setSelectedRequest(null)
          setActionType(null)
          setRejectReason('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Registration & Send Invite'}
              {actionType === 'reject' && 'Reject Registration'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  {actionType === 'approve' && (
                    <>
                      Approving registration for <strong>{selectedRequest.email}</strong>
                      ({selectedRequest.company_name}). They will receive an email to set up their password.
                    </>
                  )}
                  {actionType === 'reject' && (
                    <>
                      Please provide a reason for rejecting the registration from{' '}
                      <strong>{selectedRequest.email}</strong> ({selectedRequest.company_name}).
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for rejection</Label>
                <Textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null)
                setActionType(null)
                setRejectReason('')
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={(actionType === 'reject' && !rejectReason) || processing}
            >
              {processing ? 'Processing...' : (
                <>
                  {actionType === 'approve' && 'Approve & Send Invite'}
                  {actionType === 'reject' && 'Reject'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}