import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetServices, mockCreateService, mockUpdateService } from './mockData.js'

function normalizeService(s) {
  return {
    id: s.serviceId,
    name: s.name,
    description: s.description,
    price: Number(s.price),
    estimated_duration: s.estimatedDuration,
    active: s.isActive,
  }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/services
// ------------------------------------------------------------------------------
export async function getServices(token) {
  if (USE_MOCK) return mockGetServices()
  const data = await apiRequest('/services', { token })
  const list = data?.services ?? []
  return list.map(normalizeService)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/services/:id
// ------------------------------------------------------------------------------
export async function getService(token, id) {
  if (USE_MOCK) return null
  const data = await apiRequest(`/services/${id}`, { token })
  return data?.service ? normalizeService(data.service) : null
}

// ------------------------------------------------------------------------------
// API ENDPOINT: POST /api/services
// ⚠️ Response is the RAW service object, not wrapped like other endpoints.
// EXPECTED BODY: { name, description?, price, estimatedDuration?, isActive? }
// ------------------------------------------------------------------------------
export async function createService(token, payload) {
  if (USE_MOCK) return mockCreateService(payload)
  const result = await apiRequest('/services', {
    method: 'POST',
    token,
    body: {
      name: payload.name,
      description: payload.description || undefined,
      price: Number(payload.price),
      estimatedDuration: payload.estimated_duration !== undefined ? Number(payload.estimated_duration) : undefined,
      isActive: payload.active ?? true,
    },
  })
  return normalizeService(result)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: PUT /api/services/:id
// EXPECTED BODY: { name?, description?, price?, estimatedDuration?, isActive? }
// ------------------------------------------------------------------------------
export async function updateService(token, id, payload) {
  if (USE_MOCK) return mockUpdateService(id, payload)
  const data = await apiRequest(`/services/${id}`, {
    method: 'PUT',
    token,
    body: {
      name: payload.name,
      description: payload.description,
      price: payload.price !== undefined ? Number(payload.price) : undefined,
      estimatedDuration: payload.estimated_duration !== undefined ? Number(payload.estimated_duration) : undefined,
      isActive: payload.active,
    },
  })
  return normalizeService(data.service)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: DELETE /api/services/:id
// ------------------------------------------------------------------------------
export function deleteService(token, id) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  return apiRequest(`/services/${id}`, { method: 'DELETE', token })
}