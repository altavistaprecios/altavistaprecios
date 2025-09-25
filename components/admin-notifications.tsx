'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export function AdminNotifications() {
  const [pendingCount, setPendingCount] = useState(0)
  const [recentSignups, setRecentSignups] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchPendingUsers()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_profiles',
        },
        (payload) => {
          fetchPendingUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPendingUsers = async () => {
    // Get all users and filter for pending ones
    const { data, error } = await supabase
      .rpc('get_all_user_profiles')

    if (!error && data) {
      const pendingUsers = data
        .filter(user => user.status === 'pending')
        .slice(0, 5)
      setPendingCount(pendingUsers.length)
      setRecentSignups(pendingUsers)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Pending Approvals</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentSignups.length === 0 ? (
          <DropdownMenuItem disabled>
            No pending approvals
          </DropdownMenuItem>
        ) : (
          <>
            {recentSignups.map((user) => (
              <DropdownMenuItem key={user.id} asChild>
                <Link href="/admin/users">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="font-medium">{user.company_name || 'Unknown Company'}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleString()}
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/users" className="text-center w-full">
                View all pending users
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}