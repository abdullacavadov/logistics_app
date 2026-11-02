import { Navigate, Route, Routes } from 'react-router-dom'
import MarketplacePage from '../features/marketplace/pages/MarketplacePage'
import { pagePaths } from '../features/marketplace/config/navigation'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import RequireAuth from '../features/auth/RequireAuth'
import MyLoadsPage from '../features/loads/MyLoadsPage'
import LoadFormPage from '../features/loads/LoadFormPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/my/loads" element={<RequireAuth><MyLoadsPage /></RequireAuth>} />
      <Route path="/loads/new" element={<RequireAuth><LoadFormPage /></RequireAuth>} />
      <Route path="/loads/:id/edit" element={<RequireAuth><LoadFormPage /></RequireAuth>} />
      {Object.values(pagePaths).filter((path) => path !== '/my/loads').map((path) => (
        <Route key={path} path={path} element={<MarketplacePage />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
