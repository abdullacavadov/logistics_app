import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/hooks/useAuth'
import { subscriptionsApi } from './subscriptionsApi'

export default function SubscriptionPage() {
  const auth = useAuth()
  const roles = auth.data?.data.roles ?? []
  const isCarrier = roles.includes('carrier')
  const isAdmin = roles.includes('admin')
  const plans = useQuery({ queryKey: ['subscription-plans', 'carrier'], queryFn: () => subscriptionsApi.plans() })
  const current = useQuery({ queryKey: ['my-subscription'], queryFn: subscriptionsApi.mine, enabled: isCarrier })
  const quote = useQuery({ queryKey: ['subscription-quote'], queryFn: subscriptionsApi.quote, enabled: isCarrier })

  const quoteError = quote.error as { response?: { data?: { error?: { message?: string }; message?: string } } } | null
  const quoteErrorText = quoteError?.response?.data?.error?.message ?? quoteError?.response?.data?.message

  return (
    <div className="app-shell" data-theme="light"><div className="workspace">
      <header className="topbar"><div className="page-title"><h1>Tariflər və abunəlik</h1></div>{isAdmin && <Link to="/admin/subscription-plans" className="outline-action">Tarifləri idarə et</Link>}</header>
      <main className="content-area"><section className="form-page">
        <div className="form-page-heading"><div><span className="overline">SUBSCRIPTION</span><h2>Ölkəyə uyğun daşıyıcı tarifi</h2><p>Tarif administrator tərəfindən təyin edilir və bir nəqliyyat vasitəsi üçün aylıq hesablanır.</p></div></div>
        {isCarrier && <section className="my-loads-stats">
          <article><div><small>Abunəlik statusu</small><strong>{current.isLoading ? '—' : current.data?.is_active ? 'Aktiv' : 'Aktiv deyil'}</strong></div></article>
          <article><div><small>Növbəti ödəniş tarixi</small><strong>{String(current.data?.subscription?.next_payment_at ?? '—')}</strong></div></article>
          <article><div><small>Avtomatik yenilənmə</small><strong>{current.data?.subscription?.auto_renew ? 'Aktiv' : 'Deaktiv'}</strong></div></article>
        </section>}
        {isCarrier && <section className="my-loads-section">
          <div className="my-loads-section-heading"><div><h3>Hesabınız üçün qiymət hesablaması</h3><p>Aktiv nəqliyyat vasitələrinin sayı və qeydiyyat ölkəsi üzrə hesablanır.</p></div><button className="my-loads-refresh" onClick={() => quote.refetch()} disabled={quote.isFetching}>Yenilə</button></div>
          {quote.isLoading ? <div className="my-loads-state">Tarif hesablanır…</div> : quote.isError ? <div className="my-loads-state"><strong>Qiyməti hesablamaq mümkün olmadı</strong><p>{quoteErrorText ?? 'Əvvəlcə aktiv nəqliyyat vasitəsi əlavə edin və ölkəniz üçün tarifin təyin edildiyini yoxlayın.'}</p></div> : quote.data && <article className="my-load-card"><div className="my-load-card-main"><h4>{quote.data.vehicle_count} nəqliyyat vasitəsi · {quote.data.duration_months} ay</h4><div className="my-load-meta"><span>Bir vasitə: {quote.data.unit_price.toLocaleString('az-AZ')} {quote.data.currency}</span><span>Endirim: {quote.data.discount.toLocaleString('az-AZ')} {quote.data.currency}</span></div></div><div className="my-load-card-aside"><small>Yekun məbləğ</small><strong>{quote.data.total.toLocaleString('az-AZ')} {quote.data.currency}</strong></div></article>}
          <p className="auth-subtitle">Ödəniş provayderinin recurring/token inteqrasiyası təsdiqlənmədiyi üçün bu səhifə hazırda yalnız qiymət və status göstərir; ödəniş başlatmır.</p>
        </section>}
        <section className="my-loads-section"><div className="my-loads-section-heading"><div><h3>Aktiv ölkə tarifləri</h3><p>Qiymətlər admin panelindən idarə olunur.</p></div><button className="my-loads-refresh" onClick={() => plans.refetch()} disabled={plans.isFetching}>Yenilə</button></div>
          {plans.isLoading ? <div className="my-loads-state">Tariflər yüklənir…</div> : plans.isError ? <div className="my-loads-state">Tarifləri əldə etmək mümkün olmadı.</div> : !plans.data?.length ? <div className="my-loads-state">Hələ aktiv daşıyıcı tarifi təyin edilməyib.</div> : <div className="my-loads-list">{plans.data.map(plan => <article className="my-load-card" key={plan.id}><div className="my-load-card-main"><h4>{plan.country_name} ({plan.iso2})</h4><div className="my-load-meta"><span>{Number(plan.unit_price).toLocaleString('az-AZ')} {plan.currency} / vasitə</span><span>{plan.duration_months} ay</span></div></div></article>)}</div>}
        </section>
      </section></main>
    </div></div>
  )
}
