'use client'

import * as React from 'react'
import { z } from 'zod'
import { ColumnDef } from '@tanstack/react-table'
import { UniversalDataTable, DragHandle } from '@/components/ui/universal-data-table'
import { TableConfig, TableBulkAction, TableTab } from '@/lib/table/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  MoreVertical,
  Plus,
  Mail,
  Building,
  User,
  Calendar,
  Package,
  ArrowUpDown,
  Download,
  UserPlus,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ClientInviteDialog } from '@/components/clients/invite-dialog'

const clientSchema = z.object({
  id: z.string(),
  email: z.string(),
  company_name: z.string(),
  contact_name: z.string(),
  role: z.string(),
  created_at: z.string(),
  last_sign_in_at: z.string().optional(),
  discount_tier: z.number().optional(),
  total_orders: z.number().optional(),
  active: z.boolean().optional(),
})

type ClientData = z.infer<typeof clientSchema>



function ClientDetailViewer({ client }: { client: ClientData }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {client.company_name}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{client.company_name}</SheetTitle>
          <SheetDescription>
            Client account details and settings
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <Label className="text-xs text-muted-foreground">Order Statistics</Label>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Total orders: {client.total_orders || 0}
                  </span>
                </div>
                {client.total_orders === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No order history available yet
                  </p>
                )}
              </div>
            </div>

            <form className="flex flex-col gap-4">
              <div className="grid gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="company">
                    <Building className="mr-1 inline h-4 w-4" />
                    Company Name
                  </Label>
                  <Input id="company" defaultValue={client.company_name} />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="contact">
                    <User className="mr-1 inline h-4 w-4" />
                    Contact Name
                  </Label>
                  <Input id="contact" defaultValue={client.contact_name} />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="email">
                    <Mail className="mr-1 inline h-4 w-4" />
                    Email Address
                  </Label>
                  <Input id="email" type="email" defaultValue={client.email} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="discount">Discount Tier (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={client.discount_tier || 0}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="status">Account Status</Label>
                  <Select defaultValue={client.active ? 'active' : 'invited'}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="invited">Invited</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <Label className="text-xs text-muted-foreground">Account Information</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined: {format(new Date(client.created_at), 'PPP')}</span>
                  </div>
                  {client.last_sign_in_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Last login: {format(new Date(client.last_sign_in_at), 'PPP')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Total orders: {client.total_orders || 0}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button
            className="w-full"
            onClick={() => {
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                loading: `Saving ${client.company_name}`,
                success: "Client settings saved",
                error: "Error saving client",
              })
            }}
          >
            Save Changes
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

interface ClientsTableProps {
  clients: ClientData[]
  loading?: boolean
  onInvite?: (data: any) => void
  onResendInvite?: (client: ClientData) => void
  onExport?: () => void
}

export function ClientsTable({
  clients,
  loading = false,
  onInvite,
  onResendInvite,
  onExport,
}: ClientsTableProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)

  const columns: ColumnDef<ClientData>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "company_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <ClientDetailViewer client={row.original} />
      },
      enableHiding: false,
    },
    {
      accessorKey: "contact_name",
      header: "Contact",
      cell: ({ row }) => row.original.contact_name,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "discount_tier",
      header: () => <div className="text-right">Discount</div>,
      cell: ({ row }) => {
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                loading: `Updating discount for ${row.original.company_name}`,
                success: "Discount updated",
                error: "Error updating discount",
              })
            }}
            className="flex justify-end"
          >
            <Label htmlFor={`${row.original.id}-discount`} className="sr-only">
              Discount
            </Label>
            <div className="flex items-center gap-1">
              <Input
                className="h-8 w-14 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
                defaultValue={row.original.discount_tier || 0}
                id={`${row.original.id}-discount`}
                type="number"
                min="0"
                max="100"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </form>
        )
      },
    },
    {
      accessorKey: "total_orders",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-end"
          >
            Orders
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-right">{row.original.total_orders || 0}</div>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'default' : 'secondary'}>
          {row.original.active ? 'Active' : 'Invited'}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => format(new Date(row.original.created_at), 'MMM d, yyyy'),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open client actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={() => toast.info('View client details')}>
              View details
            </DropdownMenuItem>
            {!row.original.active && (
              <DropdownMenuItem onSelect={() => onResendInvite?.(row.original)}>
                Resend invite
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => toast.info('Edit client settings')}>
              Edit settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => toast.info('Remove client')}
            >
              Remove client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const config: TableConfig<ClientData> = {
    columns,
    schema: clientSchema,
    enableDragAndDrop: true,
    enableSelection: true,
    enableInlineEdit: true,
    enableDetailView: true,
    defaultPageSize: 10,
  }

  const bulkActions: TableBulkAction<ClientData>[] = [
    {
      label: "Send Email",
      icon: Mail,
      onClick: (rows) => toast.info(`Send email to ${rows.length} clients`),
    },
    {
      label: "Update Discount",
      onClick: (rows) => toast.info(`Update discount for ${rows.length} clients`),
    },
  ]

  const activeCount = clients.filter(c => c.active).length
  const invitedCount = clients.filter(c => !c.active).length

  const tabs: TableTab[] = [
    {
      value: "all",
      label: "All Clients",
      badge: clients.length,
    },
    {
      value: "active",
      label: "Active",
      badge: activeCount,
    },
    {
      value: "invited",
      label: "Invited",
      badge: invitedCount,
    },
  ]

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    )
  }

  return (
    <>
      <UniversalDataTable
        data={clients}
        config={config}
        tabs={tabs}
        bulkActions={bulkActions}
        searchPlaceholder="Search clients by company, contact, or email..."
        heading={<h1 className="text-3xl font-bold tracking-tight">Clients</h1>}
        description="Manage your B2B client accounts and permissions"
        toolbar={
          <>
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Client
            </Button>
          </>
        }
      />

      <ClientInviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={(data) => {
          onInvite?.(data)
          setInviteDialogOpen(false)
        }}
      />
    </>
  )
}