import { api } from '../../lib/api'

export interface VehicleOffer {
  id: number
  user_id: number
  vehicle_id: number
  from_country_id: number
  from_location_id: number | null
  to_country_id: number
  to_location_id: number | null
  available_from: string
  available_to: string
  price: number | string | null
  currency: string | null
  terms: string | null
  status: 'draft' | 'active' | 'applied' | 'agreed' | 'busy' | 'completed' | 'cancelled' | 'expired'
}

export interface OfferPayload {
  vehicle_id: number
  from_country_id: number
  from_location_id?: number | null
  to_country_id: number
  to_location_id?: number | null
  available_from: string
  available_to: string
  price?: number | null
  currency?: string | null
  terms?: string | null
  activate?: boolean
}

export const offersApi = {
  async mine(): Promise<VehicleOffer[]> {
    const { data } = await api.get<{ data: { data: VehicleOffer[] } }>('/my/offers')
    return data.data.data
  },
  async create(payload: OfferPayload): Promise<VehicleOffer> {
    const { data } = await api.post<{ data: VehicleOffer }>('/offers', payload)
    return data.data
  },
  async update(id: number, payload: Partial<OfferPayload>): Promise<VehicleOffer> {
    const { data } = await api.put<{ data: VehicleOffer }>(`/offers/${id}`, payload)
    return data.data
  },
  async activate(id: number): Promise<void> {
    await api.post(`/offers/${id}/activate`)
  },
  async cancel(id: number): Promise<void> {
    await api.post(`/offers/${id}/cancel`)
  },
}
