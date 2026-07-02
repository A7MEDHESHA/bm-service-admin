import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetParts, mockCreatePart, mockUpdatePart } from './mockData.js'

// ------------------------------------------------------------------------------
// Backend API endpoint: GET /parts
// Backend returns: [ [ { part_id, description, price, quantity }, ... ] ]
// ------------------------------------------------------------------------------
export async function getParts(token) {
  if (USE_MOCK) return mockGetParts()
  
  const rawParts = await apiRequest('/parts', { token })
  const partsList = Array.isArray(rawParts) ? (Array.isArray(rawParts[0]) ? rawParts[0] : rawParts) : []
  
  return partsList.map(p => ({
    id: p.part_id,
    name: p.description,
    unit_price: p.price,
    stock_quantity: p.quantity,
    active: true
  }))
}

export async function getLowStockParts(token) {
  if (USE_MOCK) return []
  
  const rawParts = await apiRequest('/parts/low-stock', { token })
  const partsList = Array.isArray(rawParts) ? (Array.isArray(rawParts[0]) ? rawParts[0] : rawParts) : []
  
  return partsList.map(p => ({
    id: p.part_id,
    name: p.description,
    unit_price: p.price,
    stock_quantity: p.quantity,
    active: true
  }))
}

// ------------------------------------------------------------------------------
// Backend API endpoint: POST /parts
// Backend expects: { description, price, quantity }
// ------------------------------------------------------------------------------
export async function createPart(token, payload) {
  if (USE_MOCK) return mockCreatePart(payload)
  
  const backendPayload = {
    description: payload.name,
    price: payload.unit_price,
    quantity: payload.stock_quantity
  }
  
  const result = await apiRequest('/parts', { method: 'POST', body: backendPayload, token })
  
  return {
    id: result.insertId,
    name: payload.name,
    unit_price: payload.unit_price,
    stock_quantity: payload.stock_quantity,
    active: true
  }
}

// ------------------------------------------------------------------------------
// Backend API endpoint: PUT /parts/update/:id
// Backend expects: { partId, description, price, quantity }
// ------------------------------------------------------------------------------
export async function updatePart(token, id, payload) {
  if (USE_MOCK) return mockUpdatePart(id, payload)
  
  const currentPart = (await getParts(token)).find(p => p.id === Number(id))
  
  const backendPayload = {
    partId: id,
    description: payload.name ?? currentPart?.name,
    price: payload.unit_price ?? currentPart?.unit_price,
    quantity: payload.stock_quantity ?? currentPart?.stock_quantity
  }
  
  await apiRequest(`/parts/update/${id}`, { method: 'PUT', body: backendPayload, token })
  
  return {
    id: Number(id),
    name: backendPayload.description,
    unit_price: backendPayload.price,
    stock_quantity: backendPayload.quantity,
    active: true
  }
}
