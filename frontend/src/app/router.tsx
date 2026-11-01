import { Navigate, Route, Routes } from 'react-router-dom'
import MarketplacePage from '../features/marketplace/pages/MarketplacePage'
import { pagePaths } from '../features/marketplace/config/navigation'
import LoginPage from '../features/auth/LoginPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {Object.values(pagePaths).map((path) => (
        <Route key={path} path={path} element={<MarketplacePage />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
