import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetServices, mockCreateService, mockUpdateService } from './mockData.js'

// ------------------------------------------------------------------------------
// Backend API endpoint: GET /services
// ------------------------------------------------------------------------------
export async function getServices(token) {
  if (USE_MOCK) return mockGetServices()
  
  const data = await apiRequest('/services', { token })
  return data.map(service => ({
    id: service.service_id,
    name: service.description,
    price: service.price,
    active: true
  }))
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
// Backend API endpoint: PUT /services/:id
// ------------------------------------------------------------------------------
export async function updateService(token, id, payload) {
  if (USE_MOCK) return mockUpdateService(id, payload)
  
  const backendPayload = {
    description: payload.name,
    price: payload.price
  }
  
  return await apiRequest(`/services/${id}`, { method: 'PUT', body: backendPayload, token })
}
