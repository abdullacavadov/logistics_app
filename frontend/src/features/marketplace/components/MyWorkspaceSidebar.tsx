import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MarketplaceSidebar } from './MarketplaceSidebar'
import { pagePaths } from '../config/navigation'

export function MyWorkspaceSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [theme] = useState<'light' | 'dark'>('light')
  const page = Object.entries(pagePaths).find(([, path]) => path === location.pathname)?.[0] ?? 'Bütün elanlar'
  return <MarketplaceSidebar theme={theme} page={page} onNavigate={(label) => navigate(pagePaths[label] ?? '/')} />
}
