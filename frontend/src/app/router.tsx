import { Navigate, Route, Routes } from 'react-router-dom'
import MarketplacePage from '../features/marketplace/pages/MarketplacePage'
import { pagePaths } from '../features/marketplace/config/navigation'

export function AppRouter() {
  return (
    <Routes>
      {Object.values(pagePaths).map((path) => (
        <Route key={path} path={path} element={<MarketplacePage />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
