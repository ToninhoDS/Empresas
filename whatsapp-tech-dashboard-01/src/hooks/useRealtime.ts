import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export function useRealtime(channel: string, event: string, callback: (payload: any) => void) {
  useEffect(() => {
    const subscription = supabase
      .channel(channel)
      .on('postgres_changes', {
        event: event,
        schema: 'public',
      }, callback)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          toast({
            title: 'Conectado',
            description: 'Você está recebendo atualizações em tempo real.',
          })
        }
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [channel, event, callback])
} 