import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { catalogApi } from '../catalog/catalogApi'
import { useAuth } from '../auth/hooks/useAuth'
import { subscriptionsApi } from './subscriptionsApi'

export default function AdminSubscriptionPlansPage() {
  const client = useQueryClient()
  const auth = useAuth()
  const isAdmin = auth.data?.data.roles.includes('admin') ?? false
  const countries = useQuery({ queryKey: ['catalog', 'countries'], queryFn: catalogApi.countries })
  const plans = useQuery({ queryKey: ['admin', 'subscription-plans'], queryFn: subscriptionsApi.adminList, enabled: isAdmin })
  const [form, setForm] = useState({ kind: 'carrier' as 'carrier' | 'business_place', country_id: '', price: '', currency: 'USD', duration_months: '1' })
  const save = useMutation({
    mutationFn: subscriptionsApi.createPlan,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['admin', 'subscription-plans'] }),
        client.invalidateQueries({ queryKey: ['subscription-plans'] }),
      ])
      setForm(current => ({ ...current, price: '' }))
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save.mutate({
      kind: form.kind,
      country_id: Number(form.country_id),
      price: Number(form.price),
      currency: form.currency.toUpperCase(),
      duration_months: Number(form.duration_months),
    })
  }

  if (auth.isLoading) return <div className="app-shell"><main className="content-area">İstifadəçi məlumatları yüklənir…</main></div>
  if (!isAdmin) return <div className="app-shell"><main className="content-area"><section className="form-page"><h2>Giriş məhdudlaşdırılıb</h2><p>Bu bölmə yalnız administrator üçündür.</p><Link to="/" className="outline-action">Ana səhifəyə qayıt</Link></section></main></div>

  const error = save.error as { response?: { data?: { message?: string; error?: { message?: string } } } } | null
  const errorText = error?.response?.data?.error?.message ?? error?.response?.data?.message ?? (save.isError ? 'Tarifi yadda saxlamaq mümkün olmadı.' : '')

  return (
    <div className="app-shell" data-theme="light"><div className="workspace">
      <header className="topbar"><div className="page-title"><h1>Abunəlik tarifləri</h1></div><Link to="/" className="outline-action">Platformaya qayıt</Link></header>
      <main className="content-area"><section className="form-page">
        <div className="form-page-heading"><div><span className="overline">ADMINISTRATION</span><h2>Ölkə üzrə tarif idarəetməsi</h2><p>Tarif bir nəqliyyat vasitəsi üçün aylıq qiymətdir. Yeni qiymət əvvəlki planı deaktiv edir, tarixçə saxlanılır.</p></div></div>
        <form className="data-form" onSubmit={submit}><section className="data-form-section"><div className="data-form-grid">
          <label className="data-field"><span>Tarif növü *</span><select value={form.kind} onChange={e => setForm(s => ({ ...s, kind: e.target.value as 'carrier' | 'business_place' }))}><option value="carrier">Daşıyıcı</option><option value="business_place">Biznes məkanı</option></select></label>
          <label className="data-field"><span>Ölkə *</span><select required value={form.country_id} onChange={e => { const selected = countries.data?.find(x => x.id === Number(e.target.value)); setForm(s => ({ ...s, country_id: e.target.value, currency: selected?.default_currency ?? s.currency })) }}><option value="">Ölkə seçin</option>{(countries.data ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label className="data-field"><span>Bir vasitə üçün qiymət *</span><input required type="number" min="0" max="999999999" step="0.01" value={form.price} onChange={e => setForm(s => ({ ...s, price: e.target.value }))} /></label>
          <label className="data-field"><span>Valyuta *</span><input required minLength={3} maxLength={3} value={form.currency} onChange={e => setForm(s => ({ ...s, currency: e.target.value.toUpperCase() }))} /></label>
          <label className="data-field"><span>Müddət (ay) *</span><input required type="number" min="1" max="12" value={form.duration_months} onChange={e => setForm(s => ({ ...s, duration_months: e.target.value }))} /></label>
        </div>
        {errorText && <p className="auth-error" role="alert">{errorText}</p>}
        <div className="data-form-actions"><button type="submit" className="primary-button" disabled={save.isPending || !form.country_id || !form.price}>{save.isPending ? 'Yadda saxlanılır…' : <><Plus size={16} /> Yeni tarif versiyası yarat</>}</button></div>
        </section></form>
        <section className="my-loads-section"><div className="my-loads-section-heading"><div><h3>Tarif tarixçəsi</h3><p>{plans.data?.length ?? 0} tarif qeydi</p></div><button className="my-loads-refresh" onClick={() => plans.refetch()} disabled={plans.isFetching}>Yenilə</button></div>
          {plans.isLoading ? <div className="my-loads-state">Tariflər yüklənir…</div> : plans.isError ? <div className="my-loads-state">Tarifləri əldə etmək mümkün olmadı.</div> : <div className="my-loads-list">{(plans.data ?? []).map(plan => <article className="my-load-card" key={plan.id}><div className="my-load-card-main"><div className="my-load-card-top"><span className="my-load-id">PLAN-{plan.id}</span><span className={`my-load-status ${plan.is_active ? 'status-published' : 'status-archived'}`}>{plan.is_active ? 'Aktiv' : 'Tarixçə'}</span></div><h4>{plan.country_name} · {plan.kind === 'carrier' ? 'Daşıyıcı' : 'Biznes məkanı'}</h4><div className="my-load-meta"><span>{Number(plan.price).toLocaleString('az-AZ')} {plan.currency} / vasitə</span><span>{plan.duration_months} ay</span><span>{new Date(plan.effective_from).toLocaleDateString('az-AZ')}</span></div></div></article>)}</div>}
        </section>
      </section></main>
    </div></div>
  )
}
