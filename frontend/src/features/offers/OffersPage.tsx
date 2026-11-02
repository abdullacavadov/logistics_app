import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Truck } from 'lucide-react'
import { catalogApi } from '../catalog/catalogApi'
import { vehiclesApi } from '../vehicles/vehiclesApi'
import { offersApi, type OfferPayload, type VehicleOffer } from './offersApi'

const blank = { vehicle_id: '', from_country_id: '', from_location_id: '', to_country_id: '', to_location_id: '', available_from: '', available_to: '', price: '', currency: 'AZN', terms: '', activate: true }
const statusLabel: Record<VehicleOffer['status'], string> = { draft: 'Qaralama', active: 'Aktiv', applied: 'Müraciət var', agreed: 'Razılaşdırılıb', busy: 'Məşğuldur', completed: 'Tamamlanıb', cancelled: 'Ləğv edilib', expired: 'Müddəti bitib' }

export default function OffersPage() {
  const client = useQueryClient()
  const offers = useQuery({ queryKey: ['my-offers'], queryFn: offersApi.mine })
  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: vehiclesApi.list })
  const countries = useQuery({ queryKey: ['catalog', 'countries'], queryFn: catalogApi.countries })
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<number | null>(null)
  const fromLocations = useQuery({ queryKey: ['catalog', 'locations', form.from_country_id], queryFn: () => catalogApi.locations(Number(form.from_country_id)), enabled: Boolean(form.from_country_id) })
  const toLocations = useQuery({ queryKey: ['catalog', 'locations', form.to_country_id], queryFn: () => catalogApi.locations(Number(form.to_country_id)), enabled: Boolean(form.to_country_id) })

  const refresh = async () => { await client.invalidateQueries({ queryKey: ['my-offers'] }); await client.invalidateQueries({ queryKey: ['vehicles'] }) }
  const save = useMutation({
    mutationFn: (payload: OfferPayload) => editing ? offersApi.update(editing, payload) : offersApi.create(payload),
    onSuccess: async () => { await refresh(); setForm(blank); setEditing(null) },
  })
  const activate = useMutation({ mutationFn: offersApi.activate, onSuccess: refresh })
  const cancel = useMutation({ mutationFn: offersApi.cancel, onSuccess: refresh })

  function edit(offer: VehicleOffer) {
    setEditing(offer.id)
    setForm({ vehicle_id: String(offer.vehicle_id), from_country_id: String(offer.from_country_id), from_location_id: String(offer.from_location_id ?? ''), to_country_id: String(offer.to_country_id), to_location_id: String(offer.to_location_id ?? ''), available_from: offer.available_from, available_to: offer.available_to, price: String(offer.price ?? ''), currency: offer.currency ?? 'AZN', terms: offer.terms ?? '', activate: offer.status === 'active' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: OfferPayload = {
      vehicle_id: Number(form.vehicle_id), from_country_id: Number(form.from_country_id),
      from_location_id: form.from_location_id ? Number(form.from_location_id) : null,
      to_country_id: Number(form.to_country_id), to_location_id: form.to_location_id ? Number(form.to_location_id) : null,
      available_from: form.available_from, available_to: form.available_to,
      price: form.price ? Number(form.price) : null, currency: form.price ? form.currency : null,
      terms: form.terms.trim() || null, activate: form.activate,
    }
    save.mutate(payload)
  }

  const error = save.error as { response?: { data?: { message?: string; error?: { message?: string } } } } | null
  const errorText = error?.response?.data?.error?.message ?? error?.response?.data?.message ?? (save.isError ? 'Təklifi yadda saxlamaq mümkün olmadı.' : '')

  return (
    <div className="app-shell" data-theme="light">
      <div className="workspace">
        <header className="topbar"><div className="page-title"><h1>Marşrutlarım</h1></div><Link className="outline-action" to="/my/vehicles">Nəqliyyat vasitələrim</Link></header>
        <main className="content-area"><section className="form-page">
          <div className="form-page-heading"><div><span className="overline">CARRIER WORKSPACE</span><h2>{editing ? 'Təklifi redaktə et' : 'Yeni daşıma təklifi'}</h2><p>Boş nəqliyyat vasitənizin marşrutunu və mövcud tarixlərini paylaşın.</p></div></div>
          {vehicles.isLoading || countries.isLoading ? <div className="my-loads-state">Məlumatlar yüklənir…</div> : !vehicles.data?.length ? <div className="my-loads-state"><Truck size={30} /><strong>Əvvəlcə nəqliyyat vasitəsi əlavə edin</strong><p>Daşıma təklifi yaratmaq üçün aktiv vasitəniz olmalıdır.</p><Link className="primary-button" to="/my/vehicles">Nəqliyyat vasitəsi əlavə et</Link></div> : (
            <form className="data-form" onSubmit={submit}><section className="data-form-section"><div className="data-form-grid">
              <label className="data-field"><span>Nəqliyyat vasitəsi *</span><select required value={form.vehicle_id} onChange={e => setForm(s => ({ ...s, vehicle_id: e.target.value }))}><option value="">Vasitə seçin</option>{(vehicles.data ?? []).map(v => <option key={v.id} value={v.id}>{v.name} · {(Number(v.capacity_kg) / 1000).toLocaleString('az-AZ')} ton</option>)}</select></label>
              <label className="data-field"><span>Başlanğıc ölkə *</span><select required value={form.from_country_id} onChange={e => { const selected = countries.data?.find(country => country.id === Number(e.target.value)); setForm(s => ({ ...s, from_country_id: e.target.value, from_location_id: '', currency: selected?.default_currency ?? s.currency })) }}><option value="">Ölkə seçin</option>{(countries.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              <label className="data-field"><span>Başlanğıc şəhər</span><select value={form.from_location_id} disabled={!form.from_country_id} onChange={e => setForm(s => ({ ...s, from_location_id: e.target.value }))}><option value="">Şəhər seçin</option>{(fromLocations.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              <label className="data-field"><span>Təyinat ölkəsi *</span><select required value={form.to_country_id} onChange={e => setForm(s => ({ ...s, to_country_id: e.target.value, to_location_id: '' }))}><option value="">Ölkə seçin</option>{(countries.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              <label className="data-field"><span>Təyinat şəhəri</span><select value={form.to_location_id} disabled={!form.to_country_id} onChange={e => setForm(s => ({ ...s, to_location_id: e.target.value }))}><option value="">Şəhər seçin</option>{(toLocations.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              <label className="data-field"><span>Mövcudluq başlanğıcı *</span><input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.available_from} onChange={e => setForm(s => ({ ...s, available_from: e.target.value }))} /></label>
              <label className="data-field"><span>Mövcudluq sonu *</span><input type="date" required min={form.available_from || new Date().toISOString().slice(0, 10)} value={form.available_to} onChange={e => setForm(s => ({ ...s, available_to: e.target.value }))} /></label>
              <label className="data-field"><span>Qiymət</span><input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(s => ({ ...s, price: e.target.value }))} /></label>
              <label className="data-field"><span>Valyuta</span><select value={form.currency} onChange={e => setForm(s => ({ ...s, currency: e.target.value }))}>{Array.from(new Set([form.currency, ...(countries.data ?? []).flatMap(country => country.default_currency ? [country.default_currency] : [])])).map(currency => <option key={currency} value={currency}>{currency}</option>)}</select></label>
              <label className="data-field data-field-wide"><span>Əlavə şərtlər</span><textarea rows={3} maxLength={3000} value={form.terms} onChange={e => setForm(s => ({ ...s, terms: e.target.value }))} /></label>
            </div>{!editing && <div className="data-checkbox-row"><label><input type="checkbox" checked={form.activate} onChange={e => setForm(s => ({ ...s, activate: e.target.checked }))} /> Yadda saxladıqdan sonra aktiv et</label></div>}
            {errorText && <p className="auth-error" role="alert">{errorText}</p>}
            <div className="data-form-actions">{editing && <button type="button" className="outline-action" onClick={() => { setForm(blank); setEditing(null) }}>Ləğv et</button>}<button type="submit" className="primary-button" disabled={save.isPending}>{save.isPending ? 'Saxlanılır…' : <><Plus size={16} /> {editing ? 'Dəyişiklikləri saxla' : 'Təklif yarat'}</>}</button></div>
            </section></form>
          )}
          <section className="my-loads-section"><div className="my-loads-section-heading"><div><h3>Təkliflərim</h3><p>{offers.data?.length ?? 0} təklif</p></div><button className="my-loads-refresh" onClick={() => offers.refetch()} disabled={offers.isFetching}>Yenilə</button></div>
            {offers.isLoading ? <div className="my-loads-state">Təkliflər yüklənir…</div> : offers.isError ? <div className="my-loads-state">Təklifləri əldə etmək mümkün olmadı.</div> : !offers.data?.length ? <div className="my-loads-state">Hələ daşıma təklifiniz yoxdur.</div> : <div className="my-loads-list">{offers.data.map(offer => <article className="my-load-card" key={offer.id}><div className="my-load-card-main"><div className="my-load-card-top"><span className="my-load-id">OFR-{offer.id}</span><span className="my-load-status status-published">{statusLabel[offer.status]}</span></div><h4>{vehicles.data?.find(v => v.id === offer.vehicle_id)?.name ?? 'Nəqliyyat vasitəsi'}</h4><div className="my-load-route"><strong>{countries.data?.find(x => x.id === offer.from_country_id)?.name ?? '—'}</strong><span>→</span><strong>{countries.data?.find(x => x.id === offer.to_country_id)?.name ?? '—'}</strong></div><div className="my-load-meta"><span>{offer.available_from} – {offer.available_to}</span><span>{offer.price === null ? 'Qiymət razılaşma ilə' : `${Number(offer.price).toLocaleString('az-AZ')} ${offer.currency ?? ''}`}</span></div></div><div className="my-load-actions">{['draft', 'active'].includes(offer.status) && <button className="outline-action" onClick={() => edit(offer)}><Pencil size={14} /> Redaktə</button>}{offer.status === 'draft' && <button className="outline-action" disabled={activate.isPending} onClick={() => activate.mutate(offer.id)}>Aktiv et</button>}{['draft', 'active', 'applied'].includes(offer.status) && <button className="outline-action is-danger" disabled={cancel.isPending} onClick={() => cancel.mutate(offer.id)}>Ləğv et</button>}</div></article>)}</div>}
          </section>
        </section></main>
      </div>
    </div>
  )
}
