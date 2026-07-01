import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockLogin } from './mockData.js'

// ------------------------------------------------------------------------------
// WHEN YOUR BACKEND IS READY, MAKE SURE THIS ENDPOINT MATCHES YOUR BACKEND!
// API ENDPOINT: POST /auth/login
// EXPECTED REQUEST BODY: { email: string, password: string }
// EXPECTED RESPONSE: { token: string, user: { id: number, name: string, role: 'admin' | 'assistant' } }
// ------------------------------------------------------------------------------
export function login(email, password) {
  // If USE_MOCK is false, this line calls your real backend!
  if (USE_MOCK) return mockLogin(email, password)
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } })
}
