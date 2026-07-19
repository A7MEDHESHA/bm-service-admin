import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetParts, mockCreatePart, mockUpdatePart } from './mockData.js'

function normalizePart(p) {
  return {
    id: p.partId,
    name: p.name,
    description: p.description,
    unit_price: Number(p.sellingPrice),
    cost_price: Number(p.costPrice),
    stock_quantity: p.quantity,
    low_stock_threshold: p.minimumQuantity,
    active: true,
  }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/parts
// ------------------------------------------------------------------------------
export async function getParts(token) {
  if (USE_MOCK) return mockGetParts()
  try {
    const data = await apiRequest('/parts', { token })
    const list = data?.parts ?? []
    return list.map(normalizePart)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/parts/low-stock
// ------------------------------------------------------------------------------
export async function getLowStockParts(token) {
  if (USE_MOCK) return []
  try {
    const data = await apiRequest('/parts/low-stock', { token })
    const list = data?.parts ?? []
    return list.map(normalizePart)
  } catch (err) {
    // Either no low-stock parts (404) or the endpoint isn't deployed yet (500)
    return []
  }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: POST /api/parts
// EXPECTED BODY: { name, description?, sellingPrice, costPrice, quantity, minimumQuantity? }
// ------------------------------------------------------------------------------
export async function createPart(token, payload) {
  if (USE_MOCK) return mockCreatePart(payload)
  const result = await apiRequest('/parts', {
    method: 'POST',
    token,
    body: {
      name: payload.name,
      sellingPrice: Number(payload.unit_price),
      costPrice: Number(payload.cost_price ?? payload.unit_price),
      quantity: Number(payload.stock_quantity) || 0,
    },
  })
  return normalizePart(result)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: PUT /api/parts/:id
// EXPECTED BODY: { name?, description?, sellingPrice?, costPrice?, quantity?, minimumQuantity? }
// ------------------------------------------------------------------------------
export async function updatePart(token, id, payload) {
  if (USE_MOCK) return mockUpdatePart(id, payload)
  const data = await apiRequest(`/parts/${id}`, {
    method: 'PUT',
    token,
    body: {
      name: payload.name,
      sellingPrice: payload.unit_price !== undefined ? Number(payload.unit_price) : undefined,
      quantity: payload.stock_quantity !== undefined ? Number(payload.stock_quantity) : undefined,
    },
  })
  return normalizePart(data.part)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: DELETE /api/parts/:id
// ------------------------------------------------------------------------------
export function deletePart(token, id) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  return apiRequest(`/parts/${id}`, { method: 'DELETE', token })
}