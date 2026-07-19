import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetCars } from './mockData.js'

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/cars?search=...
// search matches make, model, plate number, engine number, owner name, or owner phone.
// EXPECTED RESPONSE: { message, cars: [ { carId, customerId, make, model, year,
//   plateNumber, engineNumber, bodyNumber, customer: { name, phoneNumber } }, ... ] }
// ------------------------------------------------------------------------------
export async function getCars(token, search = '') {
  if (USE_MOCK) return mockGetCars(search)

  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    const data = await apiRequest(`/cars${query}`, { token })

    return (data?.cars ?? []).map(normalizeCar)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}
function normalizeCar(car) {
  return {
    id: car.carId,
    customerId: car.customerId,
    make: car.make,
    model: car.model,
    year: car.year,
    plate_number: car.plateNumber,
    engine_number: car.engineNumber,
    chassis_number: car.bodyNumber,
    customer: car.customer,
  }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: DELETE /api/cars/:carId
// ------------------------------------------------------------------------------
export function deleteCar(token, carId) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  return apiRequest(`/cars/${carId}`, { method: 'DELETE', token })
}

// ------------------------------------------------------------------------------
// API ENDPOINT: POST /api/cars
// EXPECTED BODY: { customerId, make, model, year, plateNumber, engineNumber, bodyNumber }
// customerId goes in the BODY, not the URL.
// ------------------------------------------------------------------------------
export function addCar(token, customerId, payload) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  return apiRequest(`/cars`, {
    method: 'POST',
    token,
    body: {
      customerId: Number(customerId),
      make: payload.make,
      model: payload.model,
      year: Number(payload.year),
      plateNumber: payload.plate_number,
      engineNumber: payload.engine_number,
      bodyNumber: payload.chassis_number,
    },
  })
}