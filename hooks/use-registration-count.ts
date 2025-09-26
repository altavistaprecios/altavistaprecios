'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRegistrationCount() {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('registration_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (!error && count !== null) {
        setPendingCount(count)
      }
      setLoading(false)
    }

    fetchCount()

    // Set up real-time subscription
    const channel = supabase
      .channel('registration-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registration_requests'
        },
        (payload) => {
          // Re-fetch count on any change
          fetchCount()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { pendingCount, loading }
}