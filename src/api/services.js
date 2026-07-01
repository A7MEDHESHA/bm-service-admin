import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetServices, mockCreateService, mockUpdateService } from './mockData.js'

// ------------------------------------------------------------------------------
// Backend API endpoint: GET /services (ask your friend to add this!)
// ------------------------------------------------------------------------------
export async function getServices(token) {
  if (USE_MOCK) return mockGetServices()
  
  // For now, use mock data since backend doesn't have GET /api/services yet
  return mockGetServices()
}

// ------------------------------------------------------------------------------
// Backend API endpoint: POST /services
// Backend expects: { description, price }
// ------------------------------------------------------------------------------
export async function createService(token, payload) {
  if (USE_MOCK) return mockCreateService(payload)
  
  const backendPayload = {
    description: payload.name,
    price: payload.price
  }
  
  const result = await apiRequest('/services', { method: 'POST', body: backendPayload, token })
  
  return {
    id: result.service_id,
    name: payload.name,
    price: payload.price,
    active: true
  }
}

// ------------------------------------------------------------------------------
// Backend API endpoint: PUT /services/:id (ask your friend to add this!)
// ------------------------------------------------------------------------------
export async function updateService(token, id, payload) {
  // For now, use mock data since backend doesn't have PUT /api/services yet
  return mockUpdateService(id, payload)
}
