
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 15000,
})

/**
 * Initialize Laravel CSRF session.
 * Must use the same origin as all API requests.
 */

export async function initializeCsrf(): Promise<void> {
  await axios.get('/sanctum/csrf-cookie', {
    withCredentials: true,
    withXSRFToken: true,
    headers: {
      Accept: 'application/json',
    },
  })
}


export interface ApiError {
  error?: {
    code?: string
    message?: string
    details?: Record<string, string[]>
  }
  message?: string
}
