import { useEffect, useState, type FormEvent } from 'react'
import PhoneNumberField, { normalizePhoneNumber } from './PhoneNumberField'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Package, Truck } from 'lucide-react'
import { useAuth, useLogin } from './hooks/useAuth'
import type { ApiError } from '../../lib/api'
import logoLight from '../../assets/img/logo-light.png'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone')
  const [phoneCountryIso2, setPhoneCountryIso2] = useState('AZ')
  const [phoneError, setPhoneError] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    const normalizedLogin = loginMode === 'phone' ? normalizePhoneNumber(login, phoneCountryIso2) : login.trim()
    if (loginMode === 'phone' && !normalizedLogin) {
      setPhoneError('Düzgün telefon nömrəsi daxil edin.')
      return
    }
    setPhoneError('')
    try {
      await loginMutation.mutateAsync({ login: normalizedLogin ?? login.trim(), password })
    } catch {
      // Mutation error is rendered below.
    }
  }

  const error = loginMutation.error as AxiosError<ApiError> | null
  const errorMessage = error?.response?.data?.error?.message
    ?? error?.response?.data?.message
    ?? (loginMutation.isError ? 'Giriş zamanı xəta baş verdi. Məlumatları yoxlayın.' : '')

  return (
    <main className="auth-page" data-theme="light">
      <div className="auth-visual">
        <Link to="/" className="auth-brand" aria-label="Yoldaş ana səhifə">
          <img src={logoLight} alt="Yoldaş" />
        </Link>
        <div className="auth-visual-copy">
          <span className="auth-eyebrow">LOGISTICS, CONNECTED</span>
          <h1>Daşınmalarınızı<br /><em>daha ağıllı</em> idarə edin.</h1>
          <p>Yük sahibləri və daşıyıcılar üçün vahid logistika platforması.</p>
          <div className="auth-feature-list">
            <span><Package size={18} /> Yükləri kəşf edin və idarə edin</span>
            <span><Truck size={18} /> Etibarlı daşıyıcılarla əlaqə qurun</span>
          </div>
        </div>
        <div className="auth-visual-footer">© {new Date().getFullYear()} LogisticsApp. Bütün hüquqlar qorunur.</div>
      </div>
      <section className="auth-panel">
        <div className="auth-mobile-brand">
          <Link to="/"><img src={logoLight} alt="Yoldaş" /></Link>
        </div>
        <div className="auth-form-wrap">
          <span className="auth-eyebrow">XOŞ GƏLMİSİNİZ</span>
          <h2>Hesaba daxil olun</h2>
          <p className="auth-subtitle">Davam etmək üçün hesab məlumatlarınızı daxil edin.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-login-method" role="group" aria-label="Giriş üsulu">
              <button type="button" className={loginMode === 'phone' ? 'active' : ''} onClick={() => { setLoginMode('phone'); setLogin(''); setPhoneError('') }}>Telefon</button>
              <button type="button" className={loginMode === 'email' ? 'active' : ''} onClick={() => { setLoginMode('email'); setLogin(''); setPhoneError('') }}>E-poçt</button>
            </div>
            {loginMode === 'phone' ? (
              <label className="auth-field">
                <span>Telefon nömrəsi</span>
                <div className="auth-input-wrap auth-phone-input-wrap">
                  <PhoneNumberField countryIso2={phoneCountryIso2} value={login} onCountryChange={iso2 => { setPhoneCountryIso2(iso2); setLogin(''); setPhoneError('') }} onChange={value => { setLogin(value); setPhoneError('') }} autoComplete="tel" />
                </div>
                {phoneError && <small className="auth-error">{phoneError}</small>}
              </label>
            ) : (
              <label className="auth-field">
                <span>E-poçt</span>
                <div className="auth-input-wrap"><Mail size={18} /><input type="email" autoComplete="username" required value={login} onChange={event => setLogin(event.target.value)} placeholder="name@example.com" /></div>
              </label>
            )}
            <label className="auth-field">
              <span>Şifrə</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input autoComplete="current-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Şifrənizi daxil edin" />
                <button className="auth-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
            <button className="auth-submit" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Daxil olunur…' : 'Daxil ol'} <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">Hesabınız yoxdur? <Link to="/register">Qeydiyyatdan keçin</Link></p>
          <Link to="/" className="auth-back-link">Elanlara baxmağa davam et</Link>
        </div>
      </section>
    </main>
  )
}
