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
import type { LucideIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLocale, useTranslations } from 'next-intl'

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

type StatusConfig = {
  variant: 'default' | 'secondary' | 'destructive'
  icon: LucideIcon
  label: string
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
  const locale = useLocale()
  const t = useTranslations('adminRegistrations')
  const commonT = useTranslations('common')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .rpc('get_all_registration_requests')

    if (error) {
      toast({
        title: t('toast.errorTitle'),
        description: t('toast.fetchError'),
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
          title: t('toast.partialSuccessTitle'),
          description: data.warning,
          variant: 'default',
        })
      } else {
        toast({
          title: t('toast.successTitle'),
          description: t('toast.approveSuccess'),
        })
      }

      // Refresh the list to show updated status
      await fetchRequests()
      setSelectedRequest(null)
      setActionType(null)

    } catch (error) {
      console.error('Error approving registration:', error)
      toast({
        title: t('toast.errorTitle'),
        description: error instanceof Error ? error.message : t('toast.approveError'),
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
        title: t('toast.errorTitle'),
        description: t('toast.rejectError'),
        variant: 'destructive',
      })
    } else {
      toast({
        title: t('toast.successTitle'),
        description: t('toast.rejectSuccess'),
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

  const formatDate = (value: string) => new Date(value).toLocaleDateString(locale)

  const getStatusBadge = (status: string, approvedAt?: string | null) => {
    // For approved status, always show "Email Sent" since approval triggers email
    if (status === 'approved') {
      return (
        <Badge variant="default" className="gap-1">
          <Mail className="h-3 w-3" />
          {t('status.emailSent')}
        </Badge>
      )
    }

    const variants: Record<string, StatusConfig> = {
      pending: { variant: 'secondary', icon: Clock, label: t('status.pending') },
      rejected: { variant: 'destructive', icon: XCircle, label: t('status.rejected') },
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
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {commonT('refresh')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 lg:px-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending">
              {t('tabs.pending', { count: requests.filter(r => r.status === 'pending').length })}
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t('tabs.approved', { count: requests.filter(r => r.status === 'approved').length })}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t('tabs.rejected', { count: requests.filter(r => r.status === 'rejected').length })}
            </TabsTrigger>
            <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab}>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.company')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.phone')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.requested')}</TableHead>
                  <TableHead>{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {t('table.loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('table.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.company_name}
                      </TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.phone || t('table.notAvailable')}</TableCell>
                      <TableCell>{getStatusBadge(request.status, request.approved_at)}</TableCell>
                      <TableCell>
                        {formatDate(request.created_at)}
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
                                {t('actions.approveInvite')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setActionType('reject')
                                }}
                              >
                                {t('actions.reject')}
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <span className="text-sm text-muted-foreground">
                              {request.approved_at
                                ? t('status.approvedOn', { date: formatDate(request.approved_at) })
                                : t('status.approved')}
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
              {actionType === 'approve' && t('dialog.approveTitle')}
              {actionType === 'reject' && t('dialog.rejectTitle')}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  {actionType === 'approve' && (
                    <>
                      {t.rich('dialog.approveDescription', {
                        email: selectedRequest.email,
                        company: selectedRequest.company_name,
                        strong: (chunks) => <strong>{chunks}</strong>,
                      })}
                    </>
                  )}
                  {actionType === 'reject' && (
                    <>
                      {t.rich('dialog.rejectDescription', {
                        email: selectedRequest.email,
                        company: selectedRequest.company_name,
                        strong: (chunks) => <strong>{chunks}</strong>,
                      })}
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">{t('dialog.rejectLabel')}</Label>
                <Textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('dialog.rejectPlaceholder')}
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
              {commonT('cancel')}
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'outline'}
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={(actionType === 'reject' && !rejectReason) || processing}
            >
              {processing ? commonT('processing') : (
                <>
                  {actionType === 'approve' && t('actions.approveInviteDialog')}
                  {actionType === 'reject' && t('actions.reject')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
