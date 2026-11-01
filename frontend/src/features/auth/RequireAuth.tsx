import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import type { PropsWithChildren } from 'react'

export default function RequireAuth({ children }: PropsWithChildren) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) {
    return <main className="placeholder-page"><p>Hesab yoxlanılır…</p></main>
  }

  if (auth.isError) {
    return <main className="placeholder-page"><p>Autentifikasiya serverinə qoşulmaq mümkün olmadı.</p></main>
  }

  if (!auth.data?.data.user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
