import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2, Truck } from 'lucide-react'
import { catalogApi } from '../catalog/catalogApi'
import { vehiclesApi, type Vehicle, type VehiclePayload } from './vehiclesApi'

const blank = { name: '', vehicle_type_id: '', brand: '', model: '', capacity_kg: '', capacity_m3: '', body_type: '', is_refrigerated: false, reg_country_id: '' }

export default function VehiclesPage() {
  const client = useQueryClient()
  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: vehiclesApi.list })
  const types = useQuery({ queryKey: ['catalog', 'vehicle-types'], queryFn: catalogApi.vehicleTypes })
  const countries = useQuery({ queryKey: ['catalog', 'countries'], queryFn: catalogApi.countries })
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<number | null>(null)
  const save = useMutation({
    mutationFn: (payload: VehiclePayload) => editing ? vehiclesApi.update(editing, payload) : vehiclesApi.create(payload),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['vehicles'] }); setForm(blank); setEditing(null) },
  })
  const remove = useMutation({
    mutationFn: vehiclesApi.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: ['vehicles'] }),
  })

  function edit(vehicle: Vehicle) {
    setEditing(vehicle.id)
    setForm({
      name: vehicle.name, vehicle_type_id: String(vehicle.vehicle_type_id), brand: vehicle.brand ?? '',
      model: vehicle.model ?? '', capacity_kg: String(vehicle.capacity_kg), capacity_m3: String(vehicle.capacity_m3 ?? ''),
      body_type: vehicle.body_type ?? '', is_refrigerated: Boolean(vehicle.is_refrigerated),
      reg_country_id: String(vehicle.reg_country_id ?? ''),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: VehiclePayload = {
      name: form.name.trim(), vehicle_type_id: Number(form.vehicle_type_id), brand: form.brand || null,
      model: form.model || null, capacity_kg: Number(form.capacity_kg),
      capacity_m3: form.capacity_m3 ? Number(form.capacity_m3) : null, body_type: form.body_type || null,
      is_refrigerated: form.is_refrigerated, reg_country_id: Number(form.reg_country_id), company_id: null,
    }
    save.mutate(payload)
  }

  const error = save.error as { response?: { data?: { message?: string; error?: { message?: string } } } } | null
  const errorText = error?.response?.data?.error?.message ?? error?.response?.data?.message ?? (save.isError ? 'Yadda saxlamaq mümkün olmadı.' : '')

  return (
    <div className="app-shell" data-theme="light">
      <div className="workspace">
        <header className="topbar"><div className="page-title"><h1>Nəqliyyat vasitələrim</h1></div><Link className="outline-action" to="/my/offers">Marşrut təkliflərim</Link></header>
        <main className="content-area">
          <section className="form-page">
            <div className="form-page-heading"><div><span className="overline">CARRIER WORKSPACE</span><h2>{editing ? 'Nəqliyyat vasitəsini redaktə et' : 'Nəqliyyat vasitəsi əlavə et'}</h2><p>Qeydiyyat ölkəsi tarif və abunəlik hesablamasında istifadə olunur.</p></div></div>
            <form className="data-form" onSubmit={submit}>
              <section className="data-form-section"><div className="data-form-grid">
                <label className="data-field"><span>Ad *</span><input required maxLength={120} value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="Volvo FH" /></label>
                <label className="data-field"><span>Nəqliyyat növü *</span><select required value={form.vehicle_type_id} onChange={e => setForm(s => ({ ...s, vehicle_type_id: e.target.value }))}><option value="">Seçin</option>{(types.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
                <label className="data-field"><span>Marka</span><input maxLength={60} value={form.brand} onChange={e => setForm(s => ({ ...s, brand: e.target.value }))} /></label>
                <label className="data-field"><span>Model</span><input maxLength={60} value={form.model} onChange={e => setForm(s => ({ ...s, model: e.target.value }))} /></label>
                <label className="data-field"><span>Daşıma qabiliyyəti (kq) *</span><input required type="number" min="1" max="1000000" value={form.capacity_kg} onChange={e => setForm(s => ({ ...s, capacity_kg: e.target.value }))} /></label>
                <label className="data-field"><span>Həcm (m³)</span><input type="number" min="0.01" step="0.01" value={form.capacity_m3} onChange={e => setForm(s => ({ ...s, capacity_m3: e.target.value }))} /></label>
                <label className="data-field"><span>Kuzov / qoşqu tipi</span><input maxLength={60} value={form.body_type} onChange={e => setForm(s => ({ ...s, body_type: e.target.value }))} /></label>
                <label className="data-field"><span>Qeydiyyat ölkəsi *</span><select required value={form.reg_country_id} onChange={e => setForm(s => ({ ...s, reg_country_id: e.target.value }))}><option value="">Ölkə seçin</option>{(countries.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              </div><div className="data-checkbox-row"><label><input type="checkbox" checked={form.is_refrigerated} onChange={e => setForm(s => ({ ...s, is_refrigerated: e.target.checked }))} /> Soyuducu avadanlıq var</label></div>
              {errorText && <p className="auth-error" role="alert">{errorText}</p>}
              <div className="data-form-actions">{editing && <button type="button" className="outline-action" onClick={() => { setForm(blank); setEditing(null) }}>Redaktədən çıx</button>}<button className="primary-button" type="submit" disabled={save.isPending || !types.data?.length || !countries.data?.length}>{save.isPending ? 'Saxlanılır…' : <><Plus size={16} /> {editing ? 'Dəyişiklikləri saxla' : 'Vasitə əlavə et'}</>}</button></div>
              </section>
            </form>
            <section className="my-loads-section"><div className="my-loads-section-heading"><div><h3>Qeydiyyatlı vasitələr</h3><p>{vehicles.data?.length ?? 0} aktiv vasitə</p></div></div>
              {vehicles.isLoading ? <div className="my-loads-state">Vasitələr yüklənir…</div> : vehicles.isError ? <div className="my-loads-state">Vasitələri əldə etmək mümkün olmadı.</div> : !vehicles.data?.length ? <div className="my-loads-state"><Truck size={28} /><strong>Hələ vasitə əlavə edilməyib</strong><p>İlk nəqliyyat vasitənizi yuxarıdakı formadan əlavə edin.</p></div> : <div className="my-loads-list">{vehicles.data.map(v => <article className="my-load-card" key={v.id}><div className="my-load-card-main"><div className="my-load-card-top"><span className="my-load-id">VEH-{v.id}</span><span className="my-load-status status-published">Aktiv</span></div><h4>{v.name}</h4><div className="my-load-meta"><span>{types.data?.find(t => t.id === v.vehicle_type_id)?.name ?? 'Nəqliyyat'}</span><span>{(Number(v.capacity_kg) / 1000).toLocaleString('az-AZ')} ton</span><span>{countries.data?.find(c => c.id === v.reg_country_id)?.name ?? 'Ölkə göstərilməyib'}</span>{v.is_refrigerated && <span>Soyuduculu</span>}</div></div><div className="my-load-actions"><button className="outline-action" onClick={() => edit(v)}><Pencil size={14} /> Redaktə</button><button className="icon-button" aria-label="Vasitəni deaktiv et" title="Vasitəni deaktiv et" disabled={remove.isPending} onClick={() => { if (window.confirm('Bu vasitəni deaktiv etmək istəyirsiniz?')) remove.mutate(v.id) }}><Trash2 size={17} /></button></div></article>)}</div>}
            </section>
          </section>
        </main>
      </div>
    </div>
  )
}
