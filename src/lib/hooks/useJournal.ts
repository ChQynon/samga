import { useQuery } from '@tanstack/react-query'
import { http } from '@/shared/http'
import { Journal } from '@/shared/types'

export const useJournal = () => {
  return useQuery<Journal>({
    queryKey: ['journal'],
    queryFn: async () =>
      await http.get<Journal>('/api/journal').then((res) => res.data),
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2
  })
}
