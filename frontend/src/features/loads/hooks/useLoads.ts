import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { loadsApi } from '../api/loadsApi'
import type { CreateLoadPayload, LoadFilters } from '../types'

export const loadsQueryKey = ['loads'] as const
export const myLoadsQueryKey = ['my-loads'] as const

export function useLoads(filters: LoadFilters = {}) {
  return useQuery({
    queryKey: [...loadsQueryKey, filters],
    queryFn: () => loadsApi.list(filters),
  })
}

export function useLoad(id: number | null) {
  return useQuery({
    queryKey: [...loadsQueryKey, 'detail', id],
    queryFn: () => loadsApi.show(id as number),
    enabled: id !== null,
  })
}

export function useMyLoads(filters: Pick<LoadFilters, 'page' | 'per_page' | 'status'> = {}) {
  return useQuery({
    queryKey: [...myLoadsQueryKey, filters],
    queryFn: () => loadsApi.mine(filters),
  })
}

export function useCreateLoad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLoadPayload) => loadsApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loadsQueryKey }),
        queryClient.invalidateQueries({ queryKey: myLoadsQueryKey }),
      ])
    },
  })
}

function useLoadStatusMutation(action: (id: number) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: action,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loadsQueryKey }),
        queryClient.invalidateQueries({ queryKey: myLoadsQueryKey }),
      ])
    },
  })
}

export function usePublishLoad() {
  return useLoadStatusMutation(loadsApi.publish)
}

export function useCancelLoad() {
  return useLoadStatusMutation(loadsApi.cancel)
}

export function useArchiveLoad() {
  return useLoadStatusMutation(loadsApi.archive)
}
