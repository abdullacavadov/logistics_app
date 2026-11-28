import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MyWorkspaceSidebar } from '../marketplace/components/MyWorkspaceSidebar'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { Load } from '../loads/types'

type DriverOffer = {
  id: number; user_id: number; driver_name: string; vehicle_name: string; vehicle_id: number
  from_country_id: number; to_country_id: number; from_location_id: number | null; to_location_id: number | null
  available_from: string; available_to: string; price: number | null; currency: string | null
  price_negotiable: boolean; capacity_kg: number; capacity_m3: number | null; quantity: number; load_vehicle_type_id: number | null; load_vehicle_type_name: string | null; is_refrigerated: boolean
}

export default function DriverOffersPage() {
  const [params] = useSearchParams()
  const loadId = Number(params.get('load_id'))
  const client = useQueryClient()
  const load = useQuery({
    queryKey: ['load-for-driver-offers', loadId],
    queryFn: async () => (await api.get<{ data: Load }>(`/loads/${loadId}`)).data.data,
    enabled: Number.isInteger(loadId) && loadId > 0,
  })
  const offers = useQuery({
    queryKey: ['driver-offers-for-load', loadId, load.data?.pickup_from],
    queryFn: async () => (await api.get<{ data: DriverOffer[] }>('/offers', {
      params: {
        from_country_id: load.data?.from_country_id,
        to_country_id: load.data?.to_country_id,
        date: load.data?.pickup_from,
        per_page: 50,
      },
    })).data.data,
    enabled: Boolean(load.data),
  })
  const send = useMutation({
    mutationFn: (vehicle_offer_id: number) => api.post(`/loads/${loadId}/driver-offers`, { vehicle_offer_id }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['my-assignments'] })
      window.alert('Sifariş sürücüyə göndərildi.')
    },
  })
  const candidates = useMemo(() => (offers.data ?? []).filter(offer =>
    Number(offer.capacity_kg) >= Number(load.data?.weight_kg)
    && (load.data?.volume_m3 == null || offer.capacity_m3 == null || Number(offer.capacity_m3) >= Number(load.data.volume_m3))
    && (!load.data?.needs_refrigeration || offer.is_refrigerated)
    && (!load.data?.load_vehicle_type_id || Number(offer.load_vehicle_type_id) === Number(load.data.load_vehicle_type_id))
  ), [offers.data, load.data])

  if (!Number.isInteger(loadId) || loadId < 1) return <div className="app-shell"><div className="workspace"><main className="content-area"><div className="my-loads-state">Yük ID-si göstərilməyib.</div></main></div></div>

  return (
    <div className="app-shell" data-theme="light"><MyWorkspaceSidebar /><div className="workspace">
      <header className="topbar"><div className="page-title"><h1>Sürücü seçimi</h1></div><Link className="outline-action" to={`/loads/${loadId}`}>Elana qayıt</Link></header>
      <main className="content-area"><section className="form-page">
        <div className="form-page-heading"><div><span className="overline">DRIVER MARKETPLACE</span><h2>{load.data?.title ?? 'Yük üzrə sürücülər'}</h2><p>Yükün marşrutu və yükləmə tarixinə uyğun aktiv sürücü təklifləri.</p></div></div>
        {load.isLoading ? <div className="my-loads-state">Yük məlumatları yüklənir…</div> : load.isError || !load.data ? <div className="my-loads-state">Yük tapılmadı və ya bu elana giriş yoxdur.</div> : offers.isLoading ? <div className="my-loads-state">Sürücü təklifləri yüklənir…</div> : offers.isError ? <div className="my-loads-state">Sürücü təkliflərini əldə etmək mümkün olmadı.</div> : !candidates.length ? <div className="my-loads-state">Bu yükün tarix və tutum tələblərinə uyğun aktiv sürücü təklifi tapılmadı.</div> : <div className="my-loads-list">
          {candidates.map(offer => <article className="my-load-card" key={offer.id}><div className="my-load-card-main">
            <div className="my-load-card-top"><span className="my-load-id">OFR-{offer.id}</span><span className="my-load-status status-published">Aktiv</span></div>
            <h4>{offer.driver_name}</h4><div className="my-load-route"><strong>{offer.vehicle_name}</strong></div>
            <div className="my-load-meta"><span>{offer.available_from} – {offer.available_to}</span><span>{(Number(offer.capacity_kg) / 1000).toLocaleString('az-AZ')} ton</span><span>{offer.capacity_m3 ? `${offer.capacity_m3} m³` : 'Həcm göstərilməyib'}</span><span>{offer.is_refrigerated ? 'Soyuduculu' : 'Soyuducusuz'}</span><span>{offer.quantity ?? 1} nəqliyyat vasitəsi</span><span>{offer.load_vehicle_type_name ?? 'Yük yeri növü göstərilməyib'}</span></div>
            <div className="my-load-meta"><strong>{offer.price_negotiable || offer.price == null ? 'Qiymət razılaşma ilə' : `${Number(offer.price).toLocaleString('az-AZ')} ${offer.currency ?? ''}`}</strong></div>
          </div><div className="my-load-actions"><button className="primary-button" disabled={send.isPending} onClick={() => send.mutate(offer.id)}>Sifariş göndər</button></div></article>)}
        </div>}
        {send.isError && <p className="auth-error" role="alert">Sifarişi göndərmək mümkün olmadı. Yükün statusunu və sürücünün mövcudluğunu yoxlayın.</p>}
      </section></main>
    </div></div>
  )
}
