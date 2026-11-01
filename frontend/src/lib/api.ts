import axios from 'axios'

const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN ?? ''

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

/** Establish the Laravel CSRF cookie before a state-changing request. */
export async function initializeCsrf(): Promise<void> {
  await axios.get(`${backendOrigin}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: { Accept: 'application/json' },
  })
}

export interface ApiError {
  error?: { code?: string; message?: string; details?: Record<string, string[]> }
  message?: string
}
