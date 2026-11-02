import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Save } from 'lucide-react'
import { catalogApi } from '../catalog/catalogApi'
import { loadsApi } from './api/loadsApi'
import { useLoad, myLoadsQueryKey, loadsQueryKey } from './hooks/useLoads'
import type { CreateLoadPayload } from './types'
import logoLight from '../../assets/img/logo-light.png'

type FormState = {
  title: string; description: string; cargo_type_id: string
  from_country_id: string; from_location_id: string; from_address: string
  to_country_id: string; to_location_id: string; to_address: string
  pickup_from: string; pickup_to: string; delivery_by: string
  weight_kg: string; volume_m3: string; pallets: string
  required_vehicle_type_id: string; needs_refrigeration: boolean
  temp_min: string; temp_max: string; is_hazardous: boolean
  notes: string; price: string; currency: string; price_negotiable: boolean
  publish: boolean
}

const emptyForm: FormState = {
  title: '', description: '', cargo_type_id: '',
  from_country_id: '', from_location_id: '', from_address: '',
  to_country_id: '', to_location_id: '', to_address: '',
  pickup_from: '', pickup_to: '', delivery_by: '',
  weight_kg: '', volume_m3: '', pallets: '',
  required_vehicle_type_id: '', needs_refrigeration: false,
  temp_min: '', temp_max: '', is_hazardous: false,
  notes: '', price: '', currency: 'AZN', price_negotiable: true, publish: false,
}

export default function LoadFormPage() {
  const { id } = useParams()
  const loadId = id ? Number(id) : null
  const isEditing = loadId !== null && Number.isFinite(loadId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loadQuery = useLoad(isEditing ? loadId : null)
  const countries = useQuery({ queryKey: ['catalog', 'countries'], queryFn: catalogApi.countries })
  const cargoTypes = useQuery({ queryKey: ['catalog', 'cargo-types'], queryFn: catalogApi.cargoTypes })
  const vehicleTypes = useQuery({ queryKey: ['catalog', 'vehicle-types'], queryFn: catalogApi.vehicleTypes })
  const [form, setForm] = useState<FormState>(emptyForm)
  const fromLocations = useQuery({
    queryKey: ['catalog', 'locations', form.from_country_id],
    queryFn: () => catalogApi.locations(Number(form.from_country_id)),
    enabled: Boolean(form.from_country_id),
  })
  const toLocations = useQuery({
    queryKey: ['catalog', 'locations', form.to_country_id],
    queryFn: () => catalogApi.locations(Number(form.to_country_id)),
    enabled: Boolean(form.to_country_id),
  })

  useEffect(() => {
    const load = loadQuery.data?.data
    if (!load) return
    setForm({
      title: load.title ?? '', description: load.description ?? '', cargo_type_id: String(load.cargo_type_id ?? ''),
      from_country_id: String(load.from_country_id), from_location_id: String(load.from_location_id ?? ''), from_address: load.from_address ?? '',
      to_country_id: String(load.to_country_id), to_location_id: String(load.to_location_id ?? ''), to_address: load.to_address ?? '',
      pickup_from: load.pickup_from ?? '', pickup_to: load.pickup_to ?? '', delivery_by: load.delivery_by ?? '',
      weight_kg: String(load.weight_kg ?? ''), volume_m3: String(load.volume_m3 ?? ''), pallets: String(load.pallets ?? ''),
      required_vehicle_type_id: String(load.required_vehicle_type_id ?? ''), needs_refrigeration: Boolean(load.needs_refrigeration),
      temp_min: String(load.temp_min ?? ''), temp_max: String(load.temp_max ?? ''), is_hazardous: Boolean(load.is_hazardous),
      notes: load.notes ?? '', price: String(load.price ?? ''), currency: load.currency ?? 'AZN',
      price_negotiable: Boolean(load.price_negotiable), publish: false,
    })
  }, [loadQuery.data])

  const mutation = useMutation({
    mutationFn: (payload: CreateLoadPayload) => isEditing ? loadsApi.update(loadId!, payload) : loadsApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: loadsQueryKey }),
        queryClient.invalidateQueries({ queryKey: myLoadsQueryKey }),
      ])
      navigate('/my/loads', { replace: true })
    },
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: CreateLoadPayload = {
      title: form.title.trim(), description: form.description.trim() || null,
      cargo_type_id: form.cargo_type_id ? Number(form.cargo_type_id) : null,
      from_country_id: Number(form.from_country_id), from_location_id: form.from_location_id ? Number(form.from_location_id) : null,
      from_address: form.from_address.trim() || null,
      to_country_id: Number(form.to_country_id), to_location_id: form.to_location_id ? Number(form.to_location_id) : null,
      to_address: form.to_address.trim() || null,
      pickup_from: form.pickup_from, pickup_to: form.pickup_to || null, delivery_by: form.delivery_by || null,
      weight_kg: Number(form.weight_kg), volume_m3: form.volume_m3 ? Number(form.volume_m3) : null,
      pallets: form.pallets ? Number(form.pallets) : null,
      required_vehicle_type_id: form.required_vehicle_type_id ? Number(form.required_vehicle_type_id) : null,
      needs_refrigeration: form.needs_refrigeration, temp_min: form.temp_min ? Number(form.temp_min) : null,
      temp_max: form.temp_max ? Number(form.temp_max) : null, is_hazardous: form.is_hazardous,
      notes: form.notes.trim() || null, price: form.price ? Number(form.price) : null,
      currency: form.price ? form.currency : null, price_negotiable: form.price_negotiable,
      publish: form.publish,
    }
    mutation.mutate(payload)
  }

  const loading = countries.isLoading || cargoTypes.isLoading || vehicleTypes.isLoading || (isEditing && loadQuery.isLoading)
  const apiError = mutation.error as { response?: { data?: { message?: string; errors?: Record<string, string[]>; error?: { message?: string } } } } | null
  const errorMessage = apiError?.response?.data?.error?.message
    ?? (apiError?.response?.data?.errors ? Object.values(apiError.response.data.errors).flat().join(' ') : undefined)
    ?? apiError?.response?.data?.message
    ?? (mutation.isError ? 'Yadda saxlamaq mümkün olmadı. Məlumatları yoxlayın.' : '')

  return (
    <div className="app-shell" data-theme="light">
      <aside className="sidebar form-sidebar">
        <Link to="/" className="brand-lockup" aria-label="Yoldaş ana səhifə"><img className="brand-logo" src={logoLight} alt="Yoldaş" /></Link>
        <nav className="sidebar-scroll">
          <Link className="side-link" to="/my/loads"><ArrowLeft size={18} /> Mənim elanlarım</Link>
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar"><div className="page-title"><h1>{isEditing ? 'Elanı redaktə et' : 'Yeni yük elanı'}</h1></div></header>
        <main className="content-area">
          <section className="form-page">
            <div className="form-page-heading"><div><span className="overline">LOAD MANAGEMENT</span><h2>{isEditing ? 'Elan məlumatlarını yeniləyin' : 'Yeni yük elanı yaradın'}</h2><p>Yük haqqında dəqiq məlumat daxil edin. Məbləğlər serverdə yoxlanılır.</p></div><Link to="/my/loads" className="outline-action">Geri qayıt</Link></div>
            {loading ? <div className="my-loads-state">Məlumatlar yüklənir…</div> : loadQuery.isError ? <div className="my-loads-state">Elanı əldə etmək mümkün olmadı.</div> : (
              <form className="data-form" onSubmit={submit}>
                <section className="data-form-section"><h3>Ümumi məlumat</h3>
                  <label className="data-field data-field-wide"><span>Elan başlığı *</span><input required maxLength={200} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Məsələn: Bakı – Tbilisi, 20 ton yük" /></label>
                  <label className="data-field data-field-wide"><span>Təsvir</span><textarea maxLength={5000} rows={3} value={form.description} onChange={e => set('description', e.target.value)} /></label>
                  <label className="data-field"><span>Yük kateqoriyası</span><select value={form.cargo_type_id} onChange={e => set('cargo_type_id', e.target.value)}><option value="">Seçilməyib</option>{(cargoTypes.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                </section>
                <section className="data-form-section"><h3>Marşrut</h3>
                  <div className="data-form-grid">
                    <label className="data-field"><span>Yükləmə ölkəsi *</span><select required value={form.from_country_id} onChange={e => { const selected = countries.data?.find(country => country.id === Number(e.target.value)); set('from_country_id', e.target.value); set('from_location_id', ''); if (!form.price && selected?.default_currency) set('currency', selected.default_currency) }}><option value="">Ölkə seçin</option>{(countries.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                    <label className="data-field"><span>Yükləmə şəhəri</span><select value={form.from_location_id} onChange={e => set('from_location_id', e.target.value)} disabled={!form.from_country_id}><option value="">Şəhər seçin</option>{(fromLocations.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                    <label className="data-field data-field-wide"><span>Yükləmə ünvanı</span><input maxLength={255} value={form.from_address} onChange={e => set('from_address', e.target.value)} /></label>
                    <label className="data-field"><span>Çatdırılma ölkəsi *</span><select required value={form.to_country_id} onChange={e => { set('to_country_id', e.target.value); set('to_location_id', '') }}><option value="">Ölkə seçin</option>{(countries.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                    <label className="data-field"><span>Çatdırılma şəhəri</span><select value={form.to_location_id} onChange={e => set('to_location_id', e.target.value)} disabled={!form.to_country_id}><option value="">Şəhər seçin</option>{(toLocations.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                    <label className="data-field data-field-wide"><span>Çatdırılma ünvanı</span><input maxLength={255} value={form.to_address} onChange={e => set('to_address', e.target.value)} /></label>
                  </div>
                </section>
                <section className="data-form-section"><h3>Yük və tarixlər</h3>
                  <div className="data-form-grid">
                    <label className="data-field"><span>Yükləmə başlanğıcı *</span><input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.pickup_from} onChange={e => set('pickup_from', e.target.value)} /></label>
                    <label className="data-field"><span>Yükləmə sonu</span><input type="date" min={form.pickup_from || undefined} value={form.pickup_to} onChange={e => set('pickup_to', e.target.value)} /></label>
                    <label className="data-field"><span>Çatdırılma tarixi</span><input type="date" min={form.pickup_from || undefined} value={form.delivery_by} onChange={e => set('delivery_by', e.target.value)} /></label>
                    <label className="data-field"><span>Çəki (kq) *</span><input type="number" min="1" step="0.01" required value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} /></label>
                    <label className="data-field"><span>Həcm (m³)</span><input type="number" min="0.01" step="0.01" value={form.volume_m3} onChange={e => set('volume_m3', e.target.value)} /></label>
                    <label className="data-field"><span>Palet sayı</span><input type="number" min="1" step="1" value={form.pallets} onChange={e => set('pallets', e.target.value)} /></label>
                    <label className="data-field"><span>Tələb olunan nəqliyyat</span><select value={form.required_vehicle_type_id} onChange={e => set('required_vehicle_type_id', e.target.value)}><option value="">Fərq etmir</option>{(vehicleTypes.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                  </div>
                  <div className="data-checkbox-row"><label><input type="checkbox" checked={form.needs_refrigeration} onChange={e => set('needs_refrigeration', e.target.checked)} /> Soyuducu tələb olunur</label><label><input type="checkbox" checked={form.is_hazardous} onChange={e => set('is_hazardous', e.target.checked)} /> Təhlükəli yük</label></div>
                  {form.needs_refrigeration && <div className="data-form-grid"><label className="data-field"><span>Minimum temperatur (°C)</span><input type="number" step="0.1" value={form.temp_min} onChange={e => set('temp_min', e.target.value)} /></label><label className="data-field"><span>Maksimum temperatur (°C)</span><input type="number" step="0.1" value={form.temp_max} onChange={e => set('temp_max', e.target.value)} /></label></div>}
                  <label className="data-field data-field-wide"><span>Xüsusi qeydlər</span><textarea rows={3} maxLength={3000} value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
                </section>
                <section className="data-form-section"><h3>Qiymət və dərc</h3>
                  <div className="data-form-grid">
                    <label className="data-field"><span>Qiymət</span><input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="Boş saxlanıla bilər" /></label>
                    <label className="data-field"><span>Valyuta</span><select value={form.currency} onChange={e => set('currency', e.target.value)}>{Array.from(new Set([form.currency, ...(countries.data ?? []).flatMap(country => country.default_currency ? [country.default_currency] : [])])).map(currency => <option key={currency} value={currency}>{currency}</option>)}</select></label>
                  </div>
                  <div className="data-checkbox-row"><label><input type="checkbox" checked={form.price_negotiable} onChange={e => set('price_negotiable', e.target.checked)} /> Qiymət müzakirə oluna bilər</label>{!isEditing && <label><input type="checkbox" checked={form.publish} onChange={e => set('publish', e.target.checked)} /> Yadda saxladıqdan sonra dərc et</label>}</div>
                </section>
                {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
                <div className="data-form-actions"><Link to="/my/loads" className="outline-action">Ləğv et</Link><button className="primary-button" type="submit" disabled={mutation.isPending || !form.from_country_id || !form.to_country_id}>{mutation.isPending ? 'Yadda saxlanılır…' : <><Save size={16} /> {isEditing ? 'Dəyişiklikləri saxla' : 'Elanı yadda saxla'}</>}</button></div>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
