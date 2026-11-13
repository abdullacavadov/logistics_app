export type LoadStatus =
  | 'draft'
  | 'pending_moderation'
  | 'rejected'
  | 'published'
  | 'has_applications'
  | 'agreed'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'archived'

export interface Load {
  id: number
  title: string
  description: string | null
  cargo_type_id: number | null
  from_country_id: number
  from_location_id: number | null
  from_location_name?: string | null
  from_address?: string | null
  from_country_name?: string | null
  from_country_iso2?: string | null
  from_name?: string | null
  from_lat?: number | string | null
  from_lng?: number | string | null
  from_lat?: number | string | null
  from_lng?: number | string | null
  to_country_id: number
  to_location_id: number | null
  to_location_name?: string | null
  to_address?: string | null
  to_country_name?: string | null
  to_country_iso2?: string | null
  to_name?: string | null
  to_lat?: number | string | null
  to_lng?: number | string | null
  to_lat?: number | string | null
  to_lng?: number | string | null
  pickup_from: string
  is_ready_for_loading: boolean
  weight_kg: number | string
  volume_m3: number | string | null
  pallets: number | null
  quantity?: number | null
  required_vehicle_type_id: number | null
  load_vehicle_type_id?: number | null
  is_hazardous: boolean
  price: number | string | null
  applications: 'web' | 'whatsapp';
  currency: string | null
  price_negotiable: boolean
  status: LoadStatus
  created_at: string
  from_country_name?: string
  from_country_iso2?: string
  from_country_iso3?: string
  from_name?: string
  to_country_name?: string
  to_country_iso2?: string
  to_country_iso3?: string
  to_name?: string
  cargo_type_name?: string | null
  vehicle_type_name?: string | null
  load_vehicle_type_name?: string | null
  shipper_name?: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export interface LoadFilters {
  page?: number
  per_page?: number
  from_country_id?: number
  from_location_id?: number
  to_country_id?: number
  to_location_id?: number
  cargo_type_id?: number
  required_vehicle_type_id?: number
  min_weight?: number
  max_weight?: number
  pickup_date?: string
  min_price?: number
  max_price?: number
  currency?: string
  status?: LoadStatus
}

export interface CreateLoadPayload {
  title: string
  description?: string | null
  cargo_type_id: number
  from_country_id: number
  from_location_id?: number | null
  from_address?: string | null
  from_lat?: number | null
  from_lng?: number | null
  to_country_id: number
  to_location_id?: number | null
  to_address?: string | null
  to_lat?: number | null
  to_lng?: number | null
  pickup_from: string
  is_ready_for_loading?: boolean
  weight_kg: number
  volume_m3?: number | null
  pallets?: number | null
  quantity: number
  required_vehicle_type_id?: number | null
  load_vehicle_type_id: number
  is_hazardous?: boolean
  price?: number | null
  currency?: string | null
  price_negotiable?: boolean
  publish?: boolean
}
