import { api } from '../../lib/api'

export interface Country {
  id: number
  iso2: string
  name: string
  default_currency: string | null
}

export interface Location {
  id: number
  country_id: number
  name: string
  lat: number | null
  lng: number | null
}

export interface LoadVehicleType {
  id: number
  name: string
  category: string
  capacity_m3: number | null
  image_path: string
}

export interface LoadVehicleType {
  id: number
  name: string
  category: string
  capacity_m3: number | null
  image_path: string
}

export interface NamedCatalogItem {
  id: number
  name: string
  is_refrigerated?: boolean
}

export interface CatalogPage<T> {
  data: T[]
  links?: Record<string, string | null>
  meta?: { current_page: number; last_page: number; total: number }
}

export const catalogApi = {
  async countries(): Promise<Country[]> {
    const { data } = await api.get<{ data: Country[] }>('/catalog/countries')
    return data.data
  },
  async locations(countryId: number): Promise<Location[]> {
    const { data } = await api.get<CatalogPage<Location>>('/catalog/locations', {
      params: { country_id: countryId, per_page: 100 },
    })
    return data.data
  },
  async cargoTypes(): Promise<NamedCatalogItem[]> {
    const { data } = await api.get<{ data: NamedCatalogItem[] }>('/catalog/cargo-types')
    return data.data
  },
  async vehicleTypes(): Promise<NamedCatalogItem[]> {
    const { data } = await api.get<{ data: NamedCatalogItem[] }>('/catalog/vehicle-types')
    return data.data
  },
  async loadVehicleTypes(): Promise<LoadVehicleType[]> {
    const { data } = await api.get<{ data: LoadVehicleType[] }>('/catalog/load-vehicle-types')
    return data.data
  },
}
