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
import { CheckCircle, XCircle, Clock, Ban, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type UserProfile = {
  id: string
  email: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  company_name: string | null
  phone: string | null
  created_at: string
  approved_at: string | null
  approved_by: string | null
  user_created_at?: string
  last_sign_in_at?: string | null
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)

    // Use the RPC function to get all user profiles as admin
    const { data, error } = await supabase
      .rpc('get_all_user_profiles')

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      })
      console.error('Error fetching users:', error)
    } else {
      setUsers(data || [])
    }

    setLoading(false)
  }

  const handleStatusUpdate = async () => {
    if (!selectedUser || !actionType) return

    const newStatus = actionType === 'approve' ? 'approved' :
                     actionType === 'reject' ? 'rejected' : 'suspended'

    // Use the RPC function to update user status
    const { data, error } = await supabase
      .rpc('update_user_status', {
        target_user_id: selectedUser.id,
        new_status: newStatus,
        rejection_reason: actionType === 'reject' ? rejectReason : null
      })

    if (error) {
      toast({
        title: 'Error',
        description: `Failed to ${actionType} user`,
        variant: 'destructive',
      })
      console.error('Error updating user status:', error)
    } else {
      toast({
        title: 'Success',
        description: `User ${actionType}d successfully`,
      })
      fetchUsers()
      setSelectedUser(null)
      setActionType(null)
      setRejectReason('')
    }
  }

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true
    return user.status === activeTab
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      suspended: { variant: 'outline', icon: Ban },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage client registrations and account status
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({users.filter(u => u.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({users.filter(u => u.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({users.filter(u => u.status === 'rejected').length})
            </TabsTrigger>
            <TabsTrigger value="suspended">
              Suspended ({users.filter(u => u.status === 'suspended').length})
            </TabsTrigger>
            <TabsTrigger value="all">All Users</TabsTrigger>
          </TabsList>

          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.company_name || 'N/A'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setActionType('approve')
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setActionType('reject')
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {user.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user)
                                setActionType('suspend')
                              }}
                            >
                              Suspend
                            </Button>
                          )}
                          {user.status === 'suspended' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedUser(user)
                                setActionType('approve')
                              }}
                            >
                              Reactivate
                            </Button>
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
        open={!!selectedUser && !!actionType}
        onOpenChange={() => {
          setSelectedUser(null)
          setActionType(null)
          setRejectReason('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve User'}
              {actionType === 'reject' && 'Reject User'}
              {actionType === 'suspend' && 'Suspend User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  {actionType === 'approve' && `Are you sure you want to approve ${selectedUser.email}?`}
                  {actionType === 'reject' && `Please provide a reason for rejecting ${selectedUser.email}.`}
                  {actionType === 'suspend' && `Are you sure you want to suspend ${selectedUser.email}?`}
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
                setSelectedUser(null)
                setActionType(null)
                setRejectReason('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleStatusUpdate}
              disabled={actionType === 'reject' && !rejectReason}
            >
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'suspend' && 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}