'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, Mail, Check } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters'),
  discount_tier: z.number().min(0).max(100).optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface ClientInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (data: InviteFormData) => Promise<void>
}

export function ClientInviteDialog({
  open,
  onOpenChange,
  onInvite
}: ClientInviteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      company_name: '',
      contact_name: '',
      discount_tier: 0,
    },
  })

  const handleSubmit = async (data: InviteFormData) => {
    try {
      setIsLoading(true)
      await onInvite(data)
      setInviteSent(true)
      setTimeout(() => {
        onOpenChange(false)
        form.reset()
        setInviteSent(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to send invite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New Client</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new client. They'll receive a link to set up their account.
          </DialogDescription>
        </DialogHeader>

        {inviteSent ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 dark:bg-emerald-900 dark:bg-emerald-950 p-3 mb-4">
              <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400 dark:text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-center font-medium">Invitation Sent!</p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              The client will receive an email with setup instructions.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="client@company.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The client's business email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Optics Inc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Smith"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional default discount percentage for this client
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}