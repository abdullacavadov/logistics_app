import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import type { AxiosError } from 'axios'
import { useAuth, useRegister } from './hooks/useAuth'
import type { RegisterPayload } from './api/authApi'
import logoLight from '../../assets/img/logo-light.png'

type RegisterErrors = { message?: string; errors?: Record<string, string[]>; error?: { message?: string } }

export default function RegisterPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const registerMutation = useRegister()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<RegisterPayload['role']>('shipper')
  const [terms, setTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (auth.data?.data.user) navigate('/', { replace: true })
  }, [auth.data, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: RegisterPayload = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      password,
      password_confirmation: passwordConfirmation,
      country_id: 1,
      role,
      terms,
    }
    try {
      await registerMutation.mutateAsync(payload)
      navigate('/', { replace: true })
    } catch {
      // Validation and API errors are rendered below.
    }
  }

  const error = registerMutation.error as AxiosError<RegisterErrors> | null
  const validationMessage = error?.response?.data?.errors
    ? Object.values(error.response.data.errors).flat()[0]
    : undefined
  const errorMessage = validationMessage ?? error?.response?.data?.error?.message
    ?? error?.response?.data?.message
    ?? (registerMutation.isError ? 'Qeydiyyat zamanı xəta baş verdi. Məlumatları yoxlayın.' : '')

  return (
    <main className="auth-page auth-page-register" data-theme="light">
      <div className="auth-visual">
        <Link to="/" className="auth-brand" aria-label="Yoldaş ana səhifə">
          <img src={logoLight} alt="Yoldaş" />
        </Link>
        <div className="auth-visual-copy">
          <span className="auth-eyebrow">YOUR LOGISTICS NETWORK</span>
          <h1>Logistika<br /><em>şəbəkəniz</em> bir addımda.</h1>
          <p>Hesab yaradın, elanları idarə edin və yeni tərəfdaşlıqlar qurun.</p>
        </div>
        <div className="auth-visual-footer">© {new Date().getFullYear()} LogisticsApp. Bütün hüquqlar qorunur.</div>
      </div>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><Link to="/"><img src={logoLight} alt="Yoldaş" /></Link></div>
        <div className="auth-form-wrap auth-form-wrap-wide">
          <span className="auth-eyebrow">LOGISTICSAPP-Ə QOŞULUN</span>
          <h2>Yeni hesab yaradın</h2>
          <p className="auth-subtitle">Başlamaq üçün məlumatlarınızı daxil edin.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Ad və soyad</span>
              <div className="auth-input-wrap"><UserRound size={18} /><input required maxLength={150} autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Adınız və soyadınız" /></div>
            </label>
            <div className="auth-form-row">
              <label className="auth-field">
                <span>Telefon <small>(ən azı biri tələb olunur)</small></span>
                <div className="auth-input-wrap"><Phone size={18} /><input type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+994 50 000 00 00" /></div>
              </label>
              <label className="auth-field">
                <span>E-poçt</span>
                <div className="auth-input-wrap"><Mail size={18} /><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /></div>
              </label>
            </div>
            <label className="auth-field">
              <span>Hesab növü</span>
              <select className="auth-select" value={role} onChange={e => setRole(e.target.value as RegisterPayload['role'])}>
                <option value="shipper">Yük sahibi</option>
                <option value="carrier">Daşıyıcı</option>
                <option value="business_owner">Biznes sahibi</option>
              </select>
            </label>
            <div className="auth-form-row">
              <label className="auth-field">
                <span>Şifrə</span>
                <div className="auth-input-wrap"><LockKeyhole size={18} /><input required minLength={8} autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 simvol" /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
              </label>
              <label className="auth-field">
                <span>Şifrənin təkrarı</span>
                <div className="auth-input-wrap"><LockKeyhole size={18} /><input required minLength={8} autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} placeholder="Şifrəni təkrarlayın" /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
              </label>
            </div>
            <label className="auth-terms">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} required />
              <span>Qeydiyyatdan keçməklə <Link to="/terms" target="_blank">İstifadə şərtlərini</Link> qəbul edirəm.</span>
            </label>
            {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
            <button className="auth-submit" type="submit" disabled={registerMutation.isPending || (!phone.trim() && !email.trim())}>
              {registerMutation.isPending ? 'Hesab yaradılır…' : 'Qeydiyyatı tamamla'} <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">Artıq hesabınız var? <Link to="/login">Daxil olun</Link></p>
        </div>
      </section>
    </main>
  )
}
