import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { useAuth, useLogin } from './hooks/useAuth'
import type { ApiError } from '../../lib/api'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const auth = useAuth()
  const loginMutation = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  useEffect(() => {
    if (auth.data?.data.user) navigate(destination || '/', { replace: true })
  }, [auth.data, destination, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await loginMutation.mutateAsync({ login: login.trim(), password })
    } catch {
      // Mutation error is rendered below.
    }
  }

  const error = loginMutation.error as AxiosError<ApiError> | null
  const errorMessage = error?.response?.data?.error?.message
    ?? error?.response?.data?.message
    ?? (loginMutation.isError ? 'Giriş zamanı xəta baş verdi. Məlumatları yoxlayın.' : '')

  return (
    <main className="auth-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section className="auth-card" style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 20, background: 'var(--surface, #fff)', border: '1px solid var(--border, #e5e7eb)' }}>
        <span className="overline">LOGISTICSAPP</span>
        <h1 style={{ margin: '12px 0 8px' }}>Hesaba daxil ol</h1>
        <p style={{ marginBottom: 24, color: 'var(--muted, #6b7280)' }}>Telefon nömrəsi və ya e-poçt ünvanı ilə daxil olun.</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Telefon və ya e-poçt</span>
            <input autoComplete="username" required value={login} onChange={(event) => setLogin(event.target.value)} placeholder="+994… / name@example.com" />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Şifrə</span>
            <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Şifrəniz" />
          </label>
          {errorMessage && <p role="alert" style={{ color: '#dc2626', margin: 0 }}>{errorMessage}</p>}
          <button className="primary-button full-width" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Daxil olunur…' : 'Daxil ol'}
          </button>
        </form>
        <button type="button" className="text-action" style={{ marginTop: 18 }} onClick={() => navigate('/')}>Elanlara qayıt</button>
      </section>
    </main>
  )
}
