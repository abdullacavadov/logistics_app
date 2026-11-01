import { useMyLoads, usePublishLoad, useCancelLoad, useArchiveLoad } from './hooks/useLoads'
import type { LoadStatus } from './types'

const statusLabels: Record<LoadStatus, string> = {
  draft: 'Qaralama',
  published: 'Dərc olunub',
  has_applications: 'Müraciətlər var',
  agreed: 'Razılaşdırılıb',
  in_transit: 'Daşınır',
  completed: 'Tamamlanıb',
  cancelled: 'Ləğv edilib',
  archived: 'Arxivdə',
}

export default function MyLoadsPage() {
  const loads = useMyLoads({ per_page: 50 })
  const publish = usePublishLoad()
  const cancel = useCancelLoad()
  const archive = useArchiveLoad()

  return (
    <main className="content-area">
      <div className="results-heading">
        <div>
          <span className="overline">LOAD MANAGEMENT</span>
          <h2>Mənim elanlarım</h2>
        </div>
      </div>
      {loads.isLoading ? (
        <div className="no-results"><strong>Elanlar yüklənir…</strong></div>
      ) : loads.isError ? (
        <div className="no-results"><strong>Elanları yükləmək mümkün olmadı</strong><span>Server cavabını yoxlayın.</span></div>
      ) : loads.data.data.length === 0 ? (
        <div className="no-results"><strong>Hələ elanınız yoxdur</strong><span>Yaratdığınız yük elanları burada görünəcək.</span></div>
      ) : (
        <div className="listing-grid">
          {loads.data.data.map((load) => (
            <article className="listing-card" key={load.id}>
              <div className="listing-top">
                <span className="listing-id">LA-{load.id}</span>
                <span className="source">{statusLabels[load.status]}</span>
              </div>
              <div className="route-row" style={{ cursor: 'default' }}>
                <div className="route-end"><span><strong>{load.from_name}</strong><small>Yükləmə</small></span></div>
                <div className="route-track">→</div>
                <div className="route-end destination"><span><strong>{load.to_name}</strong><small>Təyinat</small></span></div>
              </div>
              <div className="listing-specs">
                <span>{load.title}</span>
                <span>{(Number(load.weight_kg) / 1000).toLocaleString('az-AZ')} ton</span>
                <span>{load.pickup_from}</span>
              </div>
              <div className="listing-footer">
                <div><small>Qiymət</small><strong className="price">{load.price === null ? 'Razılaşma ilə' : `${Number(load.price).toLocaleString('az-AZ')} ${load.currency ?? ''}`}</strong></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {load.status === 'draft' && <button className="outline-action" disabled={publish.isPending} onClick={() => publish.mutate(load.id)}>Dərc et</button>}
                  {['draft', 'published', 'has_applications', 'agreed'].includes(load.status) && <button className="outline-action" disabled={cancel.isPending} onClick={() => cancel.mutate(load.id)}>Ləğv et</button>}
                  {['draft', 'published', 'completed', 'cancelled'].includes(load.status) && <button className="outline-action" disabled={archive.isPending} onClick={() => archive.mutate(load.id)}>Arxivlə</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
