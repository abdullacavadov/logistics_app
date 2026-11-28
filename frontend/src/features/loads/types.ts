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
  user_id?: number
  title: string
  description: string | null
  cargo_type_id: number | null
  from_country_id: number
  from_location_id: number | null
  from_location_name?: string | null
  from_country_name?: string | null
  from_country_iso2?: string | null
  from_name?: string | null
  from_lat?: number | string | null
  from_lng?: number | string | null
  to_country_id: number
  to_location_id: number | null
  to_location_name?: string | null
  to_country_name?: string | null
  to_country_iso2?: string | null
  to_name?: string | null
  to_lat?: number | string | null
  to_lng?: number | string | null
  pickup_from: string
  is_ready_for_loading: boolean
  weight_kg: number | string
  volume_m3: number | string | null
  needs_refrigeration?: boolean | number
  quantity?: number | null
  load_vehicle_type_id?: number | null
  is_hazardous: boolean
  price: number | string | null
  applications: 'web' | 'whatsapp' | 'telegram';
  currency: string | null
  price_negotiable: boolean
  status: LoadStatus
  created_at: string
  from_country_iso3?: string
  to_country_iso3?: string
  cargo_type_name?: string | null
  load_vehicle_type_name?: string | null
  shipper_name?: string | null
  source_name?: string | null
  source_url?: string | null
  source_profile_url?: string | null
  contact_name?: string | null
  contact_phone?: string | null
  contact_visible?: boolean | number
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
  min_weight?: number
  max_weight?: number
  min_volume?: number
  max_volume?: number
  is_hazardous?: boolean | 0 | 1
  needs_refrigeration?: boolean | 0 | 1
  created_from?: string
  created_to?: string
  map_point_key?: string
  pickup_date?: string
  date_from?: string
  date_to?: string
  load_vehicle_type_id?: number
  applications?: 'web' | 'whatsapp' | 'telegram'
  search?: string
  sort?: 'newest' | 'oldest'
  min_price?: number
  max_price?: number
  currency?: string
  status?: LoadStatus
  ids?: string
}

export interface CreateLoadPayload {
  title: string
  description?: string | null
  cargo_type_id: number
  from_country_id: number
  from_location_id?: number | null
  from_lat?: number | null
  from_lng?: number | null
  to_country_id: number
  to_location_id?: number | null
  to_lat?: number | null
  to_lng?: number | null
  pickup_from: string
  is_ready_for_loading?: boolean
  weight_kg: number
  volume_m3?: number | null
  quantity: number
  load_vehicle_type_id: number
  is_hazardous?: boolean
  price?: number | null
  currency?: string | null
  price_negotiable?: boolean
  applications?: 'web' | 'whatsapp' | 'telegram'
  publish?: boolean
}
