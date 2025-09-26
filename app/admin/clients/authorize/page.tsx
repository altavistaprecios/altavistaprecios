'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  contact_name: z.string().min(2, 'Contact name must be at least 2 characters'),
  discount_tier: z.string().transform(Number),
})

export default function AuthorizeClientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      company_name: '',
      contact_name: '',
      discount_tier: '0',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || error.message || 'Failed to send authorization')
      }

      toast.success('Client pre-authorized successfully')
      form.reset()

      // Redirect back to clients page
      setTimeout(() => {
        router.push('/admin/clients')
      }, 1500)
    } catch (error) {
      console.error('Failed to pre-authorize client:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to pre-authorize client')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/clients')}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pre-authorize Client</h1>
          <p className="text-muted-foreground">
            Pre-authorize a new client to access the platform
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Enter the details of the client you want to pre-authorize. An invitation
            will be sent by email for them to complete their registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="client@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The email address where the invitation will be sent
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
                        placeholder="Vision Optics"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The client's company name
                    </FormDescription>
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
                    <FormDescription>
                      The contact person's name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a discount level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">No discount (0%)</SelectItem>
                        <SelectItem value="5">Level 1 (5%)</SelectItem>
                        <SelectItem value="10">Level 2 (10%)</SelectItem>
                        <SelectItem value="15">Level 3 (15%)</SelectItem>
                        <SelectItem value="20">Level 4 (20%)</SelectItem>
                        <SelectItem value="25">Level 5 (25%)</SelectItem>
                        <SelectItem value="30">Level 6 (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The discount percentage applied to catalog prices
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Send Authorization'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/clients')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}