import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, type AuthResponse, type RegisterPayload } from '../api/authApi'

export const authQueryKey = ['auth', 'me'] as const

async function getCurrentUser(): Promise<AuthResponse | null> {
  try {
    return await authApi.me()
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status === 401 || status === 419) return null
    }
    throw error
  }
}

/** Resolves the current Sanctum session once and shares it through React Query. */
export function useAuth() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      queryClient.setQueryData(authQueryKey, response)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(authQueryKey, response)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      queryClient.setQueryData(authQueryKey, null)
      await queryClient.invalidateQueries()
    },
  })
}
