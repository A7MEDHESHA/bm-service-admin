import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetCars } from './mockData.js'

// ------------------------------------------------------------------------------
// WHEN YOUR BACKEND IS READY, MAKE SURE THIS ENDPOINT MATCHES YOUR BACKEND!
// API ENDPOINT: GET /cars?search=...
// EXPECTED REQUEST: query parameter "search" (optional, for filtering cars)
// EXPECTED RESPONSE: Array of car objects, each with { id, model, color, plate_number, chassis_number, customer_id, customer_name }
// ------------------------------------------------------------------------------
export function getCars(token, search = '') {
  if (USE_MOCK) return mockGetCars(search)
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiRequest(`/cars${query}`, { token })
}
