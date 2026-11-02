import { api } from '../../lib/api'

export interface SubscriptionPlan {
  id: number
  kind: 'carrier' | 'business_place'
  country_id: number
  iso2?: string
  country_name?: string
  price?: number | string
  unit_price?: number | string
  currency: string
  duration_months: number
  is_active?: boolean
  effective_from: string
}

export interface SubscriptionQuote {
  plan_id: number
  country_id: number
  unit_price: number
  vehicle_count: number
  subtotal: number
  discount: number
  total: number
  currency: string
  duration_months: number
  payment_available: boolean
}

export const subscriptionsApi = {
  async plans(countryId?: number): Promise<SubscriptionPlan[]> {
    const { data } = await api.get<{ data: SubscriptionPlan[] }>('/subscription-plans', {
      params: countryId ? { country_id: countryId, kind: 'carrier' } : { kind: 'carrier' },
    })
    return data.data
  },
  async mine() {
    const { data } = await api.get<{ data: { subscription: Record<string, unknown> | null; is_active: boolean } }>('/my/subscription')
    return data.data
  },
  async quote(): Promise<SubscriptionQuote> {
    const { data } = await api.get<{ data: SubscriptionQuote }>('/subscription/quote')
    return data.data
  },
  async adminList(): Promise<SubscriptionPlan[]> {
    const { data } = await api.get<{ data: SubscriptionPlan[] }>('/admin/subscription-plans')
    return data.data
  },
  async createPlan(payload: { kind: 'carrier' | 'business_place'; country_id: number; price: number; currency: string; duration_months: number }): Promise<SubscriptionPlan> {
    const { data } = await api.post<{ data: SubscriptionPlan }>('/admin/subscription-plans', payload)
    return data.data
  },
}
