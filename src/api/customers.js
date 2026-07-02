import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'
import { mockGetCustomers, mockGetCustomer, mockCreateCustomer, mockAddCar, mockDeleteCustomerCar } from './mockData.js'

// Helper to normalize backend customer data
function normalizeCustomer(customer) {
  return {
    id: customer.customer_id,
    name: customer.name,
    phone: customer.phone_Number,
    address: customer.address,
    // We'll add cars separately
    cars: []
  }
}

// Helper function to fetch cars for a given set of customer IDs
async function fetchCarsForCustomers(token, customerIds) {
  const allCars = await apiRequest('/cars', { token });
  const carList = Array.isArray(allCars) ? (Array.isArray(allCars[0]) ? allCars[0] : allCars) : [];

  // Create a map of customer id to cars
  const customerCarsMap = new Map();
  for (const car of carList) {
    const cId = car.fk_car_customer_id;
    if (!customerCarsMap.has(cId)) customerCarsMap.set(cId, []);
    customerCarsMap.get(cId).push({
      id: car.car_id,
      make: car.make,
      model: car.model,
      year: car.year,
      plate_number: car.plate_number,
      chassis_number: car.body_number,
      engine_number: car.engine_number
    });
  }
  return customerCarsMap;
}

// ------------------------------------------------------------------------------
// Backend API endpoint: GET /api/customers?search=...
// ------------------------------------------------------------------------------
export async function getCustomers(token, search = '') {
  if (USE_MOCK) return mockGetCustomers(search)
  
  console.log("=== getCustomers called ===");
  console.log("  token:", token);
  console.log("  search:", search);
  
  // Build URL with search query parameter if needed
  let url = '/customers'
  if (search && search.trim()) {
    url += `?search=${encodeURIComponent(search.trim())}`
  }
  
  // Get customers from backend with optional search
  const rawCustomers = await apiRequest(url, { token });
  const customerList = Array.isArray(rawCustomers) ? (Array.isArray(rawCustomers[0]) ? rawCustomers[0] : rawCustomers) : [];
  
  console.log("  Customers from backend (customerList):", customerList);
  
  // Get all cars once and assign them to customers
  const customerCarsMap = await fetchCarsForCustomers(token, customerList.map(c => c.customer_id));
  
  // Map each customer to add their cars
  const customers = customerList.map(c => {
    console.log("  Processing customer c:", c);
    const normalizedCustomer = normalizeCustomer(c);
    normalizedCustomer.cars = customerCarsMap.get(normalizedCustomer.id) || [];
    console.log("  Normalized customer with cars:", normalizedCustomer);
    return normalizedCustomer;
  });
  
  console.log("Final customers array:", customers);
  return customers
}

// ------------------------------------------------------------------------------
// Backend API endpoint: GET /api/customers/id/:customerId
// ------------------------------------------------------------------------------
export async function getCustomer(token, id) {
  if (USE_MOCK) return mockGetCustomer(id)
  
  console.log("Fetching customer with id:", id)
  // Get customer from backend
  const rawCustomer = await apiRequest(`/customers/id/${id}`, { token })
  console.log("Raw customer:", rawCustomer)
  
  // Handle the case where backend returns an array
  const customerData = Array.isArray(rawCustomer) ? rawCustomer[0] : rawCustomer
  const normalizedCustomer = normalizeCustomer(customerData)
  
  // Get cars for this customer
  try {
    const allCars = await apiRequest('/cars', { token })
    const carList = Array.isArray(allCars) ? (Array.isArray(allCars[0]) ? allCars[0] : allCars) : []
    
    normalizedCustomer.cars = carList
      .filter(car => car.fk_car_customer_id === normalizedCustomer.id)
      .map(car => ({
        id: car.car_id,
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color || '',
        plate_number: car.plate_number,
        chassis_number: car.body_number,
        engine_number: car.engine_number
      }))
  } catch (err) {
    console.error('Failed to fetch cars for customer:', err)
  }
  
  return normalizedCustomer
}

// ------------------------------------------------------------------------------
// Backend API endpoint: POST /api/customers
// Backend expects: { name, phone, address }
// Backend returns: { message, insertId }
// ------------------------------------------------------------------------------
export async function createCustomer(token, payload) {
  if (USE_MOCK) return mockCreateCustomer(payload)
  console.log("Creating customer with payload:", payload)
  // Backend expects name, phone, address
  const backendPayload = {
    name: payload.name,
    phone: payload.phone,
    address: payload.address || ''
  }
  console.log("Backend customer payload:", backendPayload)
  const result = await apiRequest('/customers', { method: 'POST', body: backendPayload, token })
  console.log("Customer creation result:", result)
  return { id: result.insertId } // Return the new customer ID
}

// ------------------------------------------------------------------------------
// Backend API endpoint: POST /api/cars/:customerId
// Backend expects: { customerId, make, model, year, body_number, engine_number, plate_number }
// ------------------------------------------------------------------------------
export async function addCar(token, customerId, payload) {
  if (USE_MOCK) return mockAddCar(customerId, payload)
  
  console.log("Adding car with payload:", payload)
  // Backend expects: customerId, make, model, year, body_number, engine_number, plate_number
  const backendPayload = {
    customerId: customerId,
    make: payload.make,
    model: payload.model,
    year: payload.year,
    body_number: payload.chassis_number, // map frontend chassis_number to backend body_number
    engine_number: payload.engine_number,
    plate_number: payload.plate_number
  }
  console.log("Backend car payload:", backendPayload)
  
  const result = await apiRequest(`/cars/${customerId}`, { method: 'POST', body: backendPayload, token })
  console.log("Car creation result:", result)
  return result
}

// ------------------------------------------------------------------------------
// Backend API endpoint: (TBD) DELETE /customers/:customerId/cars/:carId
// ------------------------------------------------------------------------------
export function deleteCustomerCar(token, customerId, carId) {
  if (USE_MOCK) return mockDeleteCustomerCar(customerId, carId)
  // Backend doesn't have this yet, but we'll keep the function
  return apiRequest(`/customers/${customerId}/cars/${carId}`, { method: 'DELETE', token })
}

// ------------------------------------------------------------------------------
// Backend API endpoint: GET /api/customers/stats
// ------------------------------------------------------------------------------
export async function getStatistics(token) {
  if (USE_MOCK) {
    // Fallback mock stats
    return {
      totalCustomers: 0,
      totalCars: 0,
      totalServices: 0,
      totalParts: 0
    }
  }
  return await apiRequest('/customers/stats', { token })
}

// ------------------------------------------------------------------------------
// Backend API endpoint: DELETE /api/customers/:customerId
// ------------------------------------------------------------------------------
export function deleteCustomer(token, customerId) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  return apiRequest(`/customers/${customerId}`, { method: 'DELETE', token })
}
