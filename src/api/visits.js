import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockCreateVisit, mockGetVisit, mockGetDashboardSummary, mockGetRecentVisits } from './mockData.js'

// ------------------------------------------------------------------------------
// WHEN YOUR BACKEND IS READY, MAKE SURE THIS ENDPOINT MATCHES YOUR BACKEND!
// API ENDPOINT: POST /visits
// USES: Save a finished service order as a receipt
// EXPECTED REQUEST BODY: { customer_id, car_id, services: [{ id, name, price }], parts: [{ id, name, unit_price, quantity }], discount_percent }
// EXPECTED RESPONSE: Full visit/receipt object with id, created_at, customer, car, services, parts, subtotal, discount_amount, total
// ------------------------------------------------------------------------------
export function createVisit(token, payload) {
  // TEMPORARY: Always use mock data for now
  return mockCreateVisit(payload)
  // if (USE_MOCK) return mockCreateVisit(payload)
  // return apiRequest('/visits', { method: 'POST', body: payload, token })
}

// ------------------------------------------------------------------------------
// WHEN YOUR BACKEND IS READY, MAKE SURE THIS ENDPOINT MATCHES YOUR BACKEND!
// API ENDPOINT: GET /visits/:id
// USES: Fetch a saved receipt for reprinting
// EXPECTED RESPONSE: Full visit/receipt object (same as POST /visits response)
// ------------------------------------------------------------------------------
export function getVisit(token, id) {
  // TEMPORARY: Always use mock data for now
  return mockGetVisit(id)
  // if (USE_MOCK) return mockGetVisit(id)
  // return apiRequest(`/visits/${id}`, { token })
}

// ------------------------------------------------------------------------------
// WHEN YOUR BACKEND IS READY, MAKE SURE THIS ENDPOINT MATCHES YOUR BACKEND!
// API ENDPOINT: GET /dashboard/summary
// EXPECTED RESPONSE: { total_customers: number, total_cars: number, total_services: number, total_parts: number }
// ------------------------------------------------------------------------------
export function getDashboardSummary(token) {
  // TEMPORARY: Always use mock data for now
  return mockGetDashboardSummary()
  // if (USE_MOCK) return mockGetDashboardSummary()
  // return apiRequest('/dashboard/summary', { token })
}

// ------------------------------------------------------------------------------
// WHEN YOUR BACKEND IS READY, MAKE SURE THIS ENDPOINT MATCHES YOUR BACKEND!
// API ENDPOINT: GET /visits/recent?limit=5
// USES: Get recent invoices for Dashboard
// EXPECTED RESPONSE: Array of recent visit objects (simplified version for table)
// ------------------------------------------------------------------------------
export function getRecentVisits(token, limit = 5) {
  // TEMPORARY: Always use mock data for now
  return mockGetRecentVisits(limit)
  // if (USE_MOCK) return mockGetRecentVisits(limit)
  // return apiRequest(`/visits/recent?limit=${limit}`, { token })
}
