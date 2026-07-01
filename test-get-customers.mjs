import fetch from "node-fetch";
// Simulate api/client.js
const BASE_URL = "http://localhost:3000/api";
async function apiRequest(path, { method = 'GET', body, token } = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong, please try again.');
    }
    return data;
}

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

// Simulate getCustomers
async function getCustomers(token, search = '') {
  
  console.log("=== getCustomers called ===");
  console.log("  token:", token);
  console.log("  search:", search);
  
  // First get all customers from backend
  const rawCustomers = await apiRequest('/customers', { token })
  console.log("  Raw customers from backend (rawCustomers):", rawCustomers)
  console.log("  typeof rawCustomers:", typeof rawCustomers);
  console.log("  Array.isArray(rawCustomers):", Array.isArray(rawCustomers));
  
  // Backend might return an array where first element is the actual rows
  const customerList = Array.isArray(rawCustomers) ? (Array.isArray(rawCustomers[0]) ? rawCustomers[0] : rawCustomers) : []
  console.log("  Processed customerList:", customerList);
  console.log("  customerList.length:", customerList.length);
  
  // Then for each customer, get their cars
  const customers = await Promise.all(
    customerList.map(async (c) => {
      console.log("  Processing customer c:", c);
      const normalizedCustomer = normalizeCustomer(c)
      console.log("  Normalized customer:", normalizedCustomer);
      
      // Get cars for this customer
      try {
        const allCars = await apiRequest('/cars', { token })
        console.log("  All cars from backend:", allCars);
        const carList = Array.isArray(allCars) ? (Array.isArray(allCars[0]) ? allCars[0] : allCars) : []
        console.log("  Processed carList:", carList);
        
        normalizedCustomer.cars = carList
          .filter(car => car.fk_car_customer_id === normalizedCustomer.id)
          .map(car => ({
            id: car.car_id,
            make: car.make,
            model: car.model,
            year: car.year,
            chassis_number: car.body_number, // backend uses body_number for chassis
            engine_number: car.engine_number,
            plate_number: car.plate_number
          }))
          
        console.log("  normalizedCustomer.cars after processing:", normalizedCustomer.cars);
      } catch (err) {
        console.error('  Error fetching cars for customer:', err);
      }
      
      return normalizedCustomer
    })
  )
  
  console.log("Final customers array:", customers);
  return customers
}

async function test() {
    try {
        const customers = await getCustomers();
        console.log("\n=== Test Complete ===");
        console.log("Returned customers:", customers);
    } catch (e) {
        console.error("ERROR:", e);
    }
}

test();
