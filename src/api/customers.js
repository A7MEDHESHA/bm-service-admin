import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetCustomers, mockGetCustomer, mockCreateCustomer } from './mockData.js'

function normalizeCustomer(c) {
  return {
    id: c.customerId,
    name: c.name,
    phone: c.phoneNumber,
    address: c.address,
    cars: [],
  }
}

function normalizeCar(car) {
  return {
    id: car.carId,
    make: car.make,
    model: car.model,
    year: car.year,
    plate_number: car.plateNumber,
    chassis_number: car.bodyNumber,
    engine_number: car.engineNumber,
  }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/customers?search=...
// ⚠️ Backend throws a 404-style NotFoundError when there are no matches
// (same pattern as quotations). Treated here as an empty array.
// ------------------------------------------------------------------------------
export async function getCustomers(token, search = '') {
  if (USE_MOCK) return mockGetCustomers(search)

  let customerList = []
  try {
    const query = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
    const data = await apiRequest(`/customers${query}`, { token })
    customerList = data?.customers ?? []
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }

  let carList = []
  try {
    const carsData = await apiRequest('/cars', { token })
    carList = carsData?.cars ?? []
  } catch (err) {
    if (err.status !== 404) throw err
    // 404 just means no cars exist yet - that's fine, customers can still show
  }

  const carsByCustomerId = new Map()
  for (const car of carList) {
    const cid = car.customerId
    if (!carsByCustomerId.has(cid)) carsByCustomerId.set(cid, [])
    carsByCustomerId.get(cid).push(normalizeCar(car))
  }

  return customerList.map((c) => {
    const normalized = normalizeCustomer(c)
    normalized.cars = carsByCustomerId.get(normalized.id) || []
    return normalized
  })
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/customers/id/:id
// ------------------------------------------------------------------------------
export async function getCustomer(token, id) {
  if (USE_MOCK) return mockGetCustomer(id)

  const data = await apiRequest(`/customers/id/${id}`, { token })
  const normalized = normalizeCustomer(data.customer)

  const carsData = await apiRequest('/cars', { token })
  const carList = carsData?.cars ?? []
  normalized.cars = carList
    .filter((car) => car.customerId === normalized.id)
    .map(normalizeCar)

  return normalized
}

// ------------------------------------------------------------------------------
// API ENDPOINT: POST /api/customers
// ⚠️ Response is the RAW customer object, not wrapped like other endpoints.
// EXPECTED BODY: { name, phoneNumber, address }
// ------------------------------------------------------------------------------
export async function createCustomer(token, payload) {
  if (USE_MOCK) return mockCreateCustomer(payload)

  const result = await apiRequest('/customers', {
    method: 'POST',
    token,
    body: {
      name: payload.name,
      phoneNumber: payload.phone,
      address: payload.address || '',
    },
  })
  return normalizeCustomer(result)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: PUT /api/customers/:id
// ------------------------------------------------------------------------------
export async function updateCustomer(token, customerId, payload) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  const data = await apiRequest(`/customers/${customerId}`, {
    method: 'PUT',
    token,
    body: {
      name: payload.name,
      phoneNumber: payload.phone,
      address: payload.address,
    },
  })
  return normalizeCustomer(data.customer)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: DELETE /api/customers/:id
// ------------------------------------------------------------------------------
export function deleteCustomer(token, customerId) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  return apiRequest(`/customers/${customerId}`, { method: 'DELETE', token })
}

// ------------------------------------------------------------------------------
// ⚠️ BACKEND TODO: no /customers/stats endpoint exists. Stubbed to zeros -
// Dashboard.jsx computes real counts client-side instead.
// ------------------------------------------------------------------------------
export async function getStatistics(token) {
  return { totalCustomers: 0, totalCars: 0, totalServices: 0, totalParts: 0 }
}