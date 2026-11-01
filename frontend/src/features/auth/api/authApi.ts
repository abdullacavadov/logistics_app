import { api, initializeCsrf } from '../../../lib/api'

export interface AuthUser {
  id: number
  name: string
  email: string | null
  phone: string | null
}

export interface AuthResponse {
  data: {
    user: AuthUser
    roles: string[]
  }
}

export interface RegisterPayload {
  name: string
  phone?: string
  email?: string
  password: string
  password_confirmation: string
  country_id: number
  role: 'shipper' | 'carrier' | 'business_owner'
  terms: boolean
}

export const authApi = {
  async login(payload: { login: string; password: string }): Promise<AuthResponse> {
    await initializeCsrf()
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await initializeCsrf()
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async me(): Promise<AuthResponse> {
    const { data } = await api.get<AuthResponse>('/auth/me')
    return data
  },

  async logout(): Promise<void> {
    await initializeCsrf()
    await api.post('/auth/logout')
  },
}
