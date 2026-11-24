import { api } from '../../../lib/api'
import type { CreateLoadPayload, Load, LoadFilters, PaginatedResponse } from '../types'

export interface LoadMapPoint {
  key: string
  from_location_id: number | null
  from_country_id: number
  from_name: string
  from_address: string | null
  from_country_name: string
  from_country_iso2: string | null
  lat: number | null
  lng: number | null
  load_ids: number[]
  count: number
  destinations: { name: string; country_name: string; country_iso2: string | null; count: number }[]
  vehicles: { name: string; count: number }[]
}

function toQuery(filters: LoadFilters): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  return params
}

export const loadsApi = {
  async mapPoints(): Promise<LoadMapPoint[]> {
    const { data } = await api.get<{ data: LoadMapPoint[] }>('/loads/map-points')
    return data.data
  },

  async list(filters: LoadFilters = {}): Promise<PaginatedResponse<Load>> {
    const { data } = await api.get<PaginatedResponse<Load>>('/loads', {
      params: toQuery(filters),
    })
    return data
  },

  async show(id: number): Promise<{ data: Load }> {
    const { data } = await api.get<{ data: Load }>(`/loads/${id}`)
    return data
  },

  async mine(filters: Pick<LoadFilters, 'page' | 'per_page' | 'status'> = {}): Promise<PaginatedResponse<Load>> {
    const { data } = await api.get<PaginatedResponse<Load>>('/my/loads', {
      params: toQuery(filters),
    })
    return data
  },

  async create(payload: CreateLoadPayload): Promise<{ data: Load }> {
    const { data } = await api.post<{ data: Load }>('/loads', payload)
    return data
  },

  async update(id: number, payload: Partial<CreateLoadPayload>): Promise<{ data: Load }> {
    const { data } = await api.put<{ data: Load }>(`/loads/${id}`, payload)
    return data
  },

  async publish(id: number): Promise<{ data: { id: number; status: string; matches: number } }> {
    const { data } = await api.post<{ data: { id: number; status: string; matches: number } }>(`/loads/${id}/publish`)
    return data
  },

  async cancel(id: number): Promise<{ data: { id: number; status: string } }> {
    const { data } = await api.post<{ data: { id: number; status: string } }>(`/loads/${id}/cancel`)
    return data
  },

  async archive(id: number): Promise<{ data: { id: number; status: string } }> {
    const { data } = await api.post<{ data: { id: number; status: string } }>(`/loads/${id}/archive`)
    return data
  },
}
