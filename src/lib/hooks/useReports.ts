import { useQuery } from '@tanstack/react-query'
import { http } from '@/shared/http'
import { ReportCard } from '@/shared/types'

export const useReports = () => {
  return useQuery<ReportCard>({
    queryKey: ['reports'],
    queryFn: async () =>
      await http.get<ReportCard>('/api/reports').then((res) => res.data),
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
  })
}
