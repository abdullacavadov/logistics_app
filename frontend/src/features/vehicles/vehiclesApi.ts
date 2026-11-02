import { api } from '../../lib/api'

export interface Vehicle {
  id: number
  user_id: number
  company_id: number | null
  vehicle_type_id: number
  name: string
  brand: string | null
  model: string | null
  capacity_kg: number
  capacity_m3: number | null
  body_type: string | null
  is_refrigerated: boolean
  reg_country_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type VehiclePayload = Omit<Vehicle, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'> & {
  name: string
  vehicle_type_id: number
  capacity_kg: number
}

export const vehiclesApi = {
  async list(): Promise<Vehicle[]> {
    const { data } = await api.get<{ data: Vehicle[] }>('/vehicles')
    return data.data
  },
  async create(payload: VehiclePayload): Promise<Vehicle> {
    const { data } = await api.post<{ data: Vehicle }>('/vehicles', payload)
    return data.data
  },
  async update(id: number, payload: Partial<VehiclePayload>): Promise<Vehicle> {
    const { data } = await api.put<{ data: Vehicle }>(`/vehicles/${id}`, payload)
    return data.data
  },
  async remove(id: number): Promise<void> {
    await api.delete(`/vehicles/${id}`)
  },
}
