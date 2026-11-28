import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MyWorkspaceSidebar } from '../marketplace/components/MyWorkspaceSidebar'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

type Assignment = {
  id: number; load_id: number; driver_user_id: number; status: string; initiated_by: string
  load_title: string; driver_name: string; shipper_name: string; vehicle_name: string | null
  viewer_role: 'driver' | 'shipper'
}
type Application = {
  id: number; load_id: number; carrier_id: number; status: string; price: number | null
  currency: string | null; message: string | null; load_title: string; carrier_name: string
  viewer_role: 'driver' | 'shipper'
}
type Location = { latitude: string; longitude: string; accuracy_m: string | null; recorded_at: string }

const statusLabels: Record<string, string> = {
  pending: 'Gözləyir', accepted: 'Qəbul edilib', assigned: 'Sürücü təyin edilib',
  loading: 'Yüklənir', in_transit: 'Yoldadır', delivered: 'Çatdırılıb',
  completed: 'Tamamlanıb', rejected: 'Rədd edilib', cancelled: 'Ləğv edilib',
}

export default function AssignmentsPage() {
  const client = useQueryClient()
  const [gpsAssignment, setGpsAssignment] = useState<number | null>(null)
  const watchId = useRef<number | null>(null)
  const assignments = useQuery({
    queryKey: ['my-assignments'],
    queryFn: async () => (await api.get<{ data: Assignment[] }>('/my/assignments')).data.data,
    refetchInterval: 15000,
  })
  const applications = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => (await api.get<{ data: Application[] }>('/my/applications')).data.data,
    refetchInterval: 15000,
  })
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ['my-assignments'] })
    await client.invalidateQueries({ queryKey: ['my-applications'] })
  }
  const respond = useMutation({
    mutationFn: async ({ id, decision }: { id: number; decision: 'accept' | 'reject' }) => api.post(`/assignments/${id}/respond`, { decision }),
    onSuccess: refresh,
  })
  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: number; decision: 'accept' | 'reject' }) => api.post(`/applications/${id}/decision`, { decision }),
    onSuccess: refresh,
  })
  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => api.post(`/assignments/${id}/status`, { status }),
    onSuccess: refresh,
  })
  const [locations, setLocations] = useState<Record<number, Location | null>>({})

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
  }, [])

  const loadLocation = useCallback(async (id: number) => {
    try {
      const response = await api.get<{ data: Location }>(`/assignments/${id}/location`)
      setLocations(current => ({ ...current, [id]: response.data.data }))
    } catch {
      setLocations(current => ({ ...current, [id]: null }))
    }
  }, [])


  useEffect(() => {
    assignments.data?.filter(item => item.viewer_role === 'shipper' && ['assigned', 'loading', 'in_transit', 'delivered'].includes(item.status)).forEach(item => { void loadLocation(item.id) })
  }, [assignments.data, loadLocation])
  function toggleGps(id: number) {
    if (gpsAssignment === id) {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
      setGpsAssignment(null)
      return
    }
    if (!navigator.geolocation) {
      window.alert('Bu brauzer geolokasiyanı dəstəkləmir.')
      return
    }
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    const idRef = id
    watchId.current = navigator.geolocation.watchPosition(async position => {
      try {
        await api.post(`/assignments/${idRef}/location`, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy_m: position.coords.accuracy,
          recorded_at: new Date(position.timestamp).toISOString(),
        })
      } catch {
        // Permission, network and assignment-state errors are shown by the next user action.
      }
    }, error => {
      window.alert(error.message || 'GPS koordinatını almaq mümkün olmadı.')
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
      setGpsAssignment(null)
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 })
    setGpsAssignment(id)
  }

  return (
    <div className="app-shell" data-theme="light"><MyWorkspaceSidebar />
      <div className="workspace">
        <header className="topbar"><div className="page-title"><h1>Sifarişlər və müraciətlər</h1></div><div className="my-load-actions"><Link className="outline-action" to="/my/vehicles">Vasitəm</Link><Link className="outline-action" to="/my/offers">Marşrut təkliflərim</Link></div></header>
        <main className="content-area"><section className="form-page">
          <div className="form-page-heading"><div><span className="overline">DRIVER & SHIPPER WORKSPACE</span><h2>Sifarişlərim</h2><p>Sürücü sifarişləri, yük müraciətləri və GPS izləmə.</p></div></div>
          {assignments.isLoading ? <div className="my-loads-state">Sifarişlər yüklənir…</div> : assignments.isError ? <div className="my-loads-state">Sifarişləri əldə etmək mümkün olmadı.</div> : !assignments.data?.length ? <div className="my-loads-state">Hələ sifariş yoxdur.</div> : <div className="my-loads-list">
            {assignments.data.map(item => <article className="my-load-card" key={item.id}>
              <div className="my-load-card-main"><div className="my-load-card-top"><span className="my-load-id">ORD-{item.id}</span><span className="my-load-status status-published">{statusLabels[item.status] ?? item.status}</span></div>
                <h4>{item.load_title}</h4><div className="my-load-meta"><span>{item.viewer_role === 'driver' ? 'Yük sahibi: ' + item.shipper_name : 'Sürücü: ' + item.driver_name}</span><span>{item.vehicle_name ?? 'Nəqliyyat vasitəsi'}</span><span>{item.initiated_by === 'shipper' ? 'Yük sahibinin sifarişi' : 'Sürücü müraciəti'}</span></div>
                {item.viewer_role === 'shipper' && ['assigned', 'loading', 'in_transit', 'delivered'].includes(item.status) && <div className="my-load-meta"><button className="outline-action" onClick={() => loadLocation(item.id)}>GPS məlumatını yenilə</button>{locations[item.id] && <><span>{Number(locations[item.id]?.latitude).toFixed(5)}, {Number(locations[item.id]?.longitude).toFixed(5)}</span><a href={`https://www.google.com/maps?q=${locations[item.id]?.latitude},${locations[item.id]?.longitude}`} target="_blank" rel="noreferrer">Xəritədə aç</a></>}</div>}
              </div>
              <div className="my-load-actions">
                {item.viewer_role === 'driver' && item.initiated_by === 'shipper' && item.status === 'pending' && <><button className="primary-button" onClick={() => respond.mutate({ id: item.id, decision: 'accept' })}>Qəbul et</button><button className="outline-action is-danger" onClick={() => respond.mutate({ id: item.id, decision: 'reject' })}>Rədd et</button></>}
                {item.viewer_role === 'shipper' && item.initiated_by === 'shipper' && item.status === 'pending' && <button className="outline-action is-danger" onClick={() => changeStatus.mutate({ id: item.id, status: 'cancelled' })}>Sifarişi geri götür</button>}
                {item.viewer_role === 'driver' && item.status === 'accepted' && <button className="primary-button" onClick={() => changeStatus.mutate({ id: item.id, status: 'assigned' })}>Sifarişi təyin et</button>}
                {item.viewer_role === 'driver' && item.status === 'assigned' && <button className="primary-button" onClick={() => changeStatus.mutate({ id: item.id, status: 'loading' })}>Yükləməyə başla</button>}
                {item.viewer_role === 'driver' && ['assigned', 'loading', 'in_transit'].includes(item.status) && <button className="outline-action" onClick={() => toggleGps(item.id)}>{gpsAssignment === item.id ? 'GPS-i dayandır' : 'GPS paylaş'}</button>}
                {item.viewer_role === 'driver' && item.status === 'loading' && <button className="primary-button" onClick={() => changeStatus.mutate({ id: item.id, status: 'in_transit' })}>Yola çıxdım</button>}
                {item.viewer_role === 'driver' && item.status === 'in_transit' && <button className="primary-button" onClick={() => changeStatus.mutate({ id: item.id, status: 'delivered' })}>Çatdırıldı</button>}
                {item.viewer_role === 'shipper' && item.status === 'delivered' && <button className="primary-button" onClick={() => changeStatus.mutate({ id: item.id, status: 'completed' })}>Tamamlanmanı təsdiqlə</button>}
              </div>
            </article>)}
          </div>}
          <section className="my-loads-section"><div className="my-loads-section-heading"><div><h3>Yük müraciətləri</h3><p>Sürücünün göndərdiyi müraciətlər və sizə gələn müraciətlər</p></div><button className="my-loads-refresh" onClick={() => applications.refetch()} disabled={applications.isFetching}>Yenilə</button></div>
            {applications.isLoading ? <div className="my-loads-state">Müraciətlər yüklənir…</div> : applications.isError ? <div className="my-loads-state">Müraciətləri əldə etmək mümkün olmadı.</div> : !applications.data?.length ? <div className="my-loads-state">Müraciət yoxdur.</div> : <div className="my-loads-list">{applications.data.map(app => <article className="my-load-card" key={app.id}><div className="my-load-card-main"><div className="my-load-card-top"><span className="my-load-id">APP-{app.id}</span><span className="my-load-status status-published">{statusLabels[app.status] ?? app.status}</span></div><h4>{app.load_title}</h4><div className="my-load-meta"><span>{app.viewer_role === 'shipper' ? 'Sürücü: ' + app.carrier_name : 'Müraciətiniz'}</span><span>{app.price == null ? 'Qiymət razılaşma ilə' : Number(app.price).toLocaleString('az-AZ') + ' ' + (app.currency ?? '')}</span></div>{app.message && <p>{app.message}</p>}</div>
              {app.viewer_role === 'shipper' && app.status === 'pending' && <div className="my-load-actions"><button className="primary-button" onClick={() => decide.mutate({ id: app.id, decision: 'accept' })}>Təsdiqlə</button><button className="outline-action is-danger" onClick={() => decide.mutate({ id: app.id, decision: 'reject' })}>Rədd et</button></div>}
            </article>)}</div>}
          </section>
          {(respond.isError || decide.isError || changeStatus.isError) && <p className="auth-error" role="alert">Əməliyyat tamamlanmadı. Sifariş statusunu və icazələri yoxlayın.</p>}
          <p className="form-hint">GPS paylaşımı üçün HTTPS bağlantısı və brauzer icazəsi tələb olunur. Brauzer arxa planda olduqda daimi izləmə zəmanətli deyil.</p>
        </section></main>
      </div>
    </div>
  )
}
