import { Navigate, Route, Routes } from 'react-router-dom'
import MarketplacePage from '../features/marketplace/pages/MarketplacePage'
import { pagePaths } from '../features/marketplace/config/navigation'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import RequireAuth from '../features/auth/RequireAuth'
import MyLoadsPage from '../features/loads/MyLoadsPage'
import LoadFormPage from '../features/loads/LoadFormPage'
import LoadDetailsPage from '../features/loads/LoadDetailsPage'
import LoadsMapPage from '../features/loads/map/LoadsMapPage'
import VehiclesPage from '../features/vehicles/VehiclesPage'
import OffersPage from '../features/offers/OffersPage'
import SubscriptionPage from '../features/subscriptions/SubscriptionPage'
import AdminSubscriptionPlansPage from '../features/subscriptions/AdminSubscriptionPlansPage'
import AssignmentsPage from '../features/assignments/AssignmentsPage'
import DriverOffersPage from '../features/assignments/DriverOffersPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/my/loads" element={<RequireAuth><MyLoadsPage /></RequireAuth>} />
      <Route path="/loads/new" element={<RequireAuth><LoadFormPage /></RequireAuth>} />
      <Route path="/loads/map" element={<LoadsMapPage />} />
      <Route path="/map" element={<Navigate to="/loads/map" replace />} />
      <Route path="/loads/:id" element={<LoadDetailsPage />} />
      <Route path="/loads/:id/edit" element={<RequireAuth><LoadFormPage /></RequireAuth>} />
      <Route path="/my/vehicles" element={<RequireAuth><VehiclesPage /></RequireAuth>} />
      <Route path="/my/offers" element={<RequireAuth><OffersPage /></RequireAuth>} />
      <Route path="/my/assignments" element={<RequireAuth><AssignmentsPage /></RequireAuth>} />
      <Route path="/drivers/offers" element={<RequireAuth><DriverOffersPage /></RequireAuth>} />
      <Route path="/pricing-analytics" element={<SubscriptionPage />} />
      <Route path="/admin/subscription-plans" element={<RequireAuth><AdminSubscriptionPlansPage /></RequireAuth>} />
      {Object.values(pagePaths).filter((path) => path !== '/loads/map' && path !== '/my/loads' && path !== '/my/offers' && path !== '/pricing-analytics').map((path) => (
        <Route key={path} path={path} element={<MarketplacePage />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
