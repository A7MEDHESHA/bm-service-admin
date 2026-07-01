// Fake data that lives only in memory - resets every time you refresh the
// page. Good enough to click through every screen before the real backend
// exists. Shapes here match exactly what the real API is supposed to return
// (see backend-spec.md), so swapping USE_MOCK to false later needs zero
// changes anywhere else in the app.

let customers = [
  {
    id: 1,
    name: 'Ahmed Saleh',
    phone: '010 1234 5678',
    last_visit: '2026-06-20',
    cars: [
      {
        id: 1,
        make: 'BMW',
        year: '2021',
        model: '320i',
        plate_number: 'ABC 1234',
        chassis_number: 'WBA3A5C50DF123456',
        engine_number: 'ENG320123',
      },
    ],
    visits: [{ id: 101, created_at: '2026-06-20T10:00:00Z', total: 35 }],
  },
  {
    id: 2,
    name: 'Mona Tarek',
    phone: '011 9876 5432',
    last_visit: '2026-06-18',
    cars: [
      {
        id: 2,
        make: 'BMW',
        year: '2022',
        model: 'X5',
        plate_number: 'XYZ 9012',
        chassis_number: 'WBAXY5C50DF998877',
        engine_number: 'ENGX5998',
      },
    ],
    visits: [{ id: 102, created_at: '2026-06-18T09:30:00Z', total: 55 }],
  },
  {
    id: 3,
    name: 'Karim Adel',
    phone: '012 5566 7788',
    last_visit: '2026-06-02',
    cars: [
      {
        id: 3,
        make: 'BMW',
        year: '2020',
        model: '520d',
        plate_number: 'DEF 5566',
        chassis_number: 'WBADEF50DF112233',
        engine_number: 'ENG520112',
      },
      {
        id: 4,
        make: 'BMW',
        year: '2023',
        model: 'M3',
        plate_number: 'GHI 7788',
        chassis_number: 'WBAGHI50DF445566',
        engine_number: 'ENGM3445',
      },
    ],
    visits: [{ id: 103, created_at: '2026-06-02T10:00:00Z', total: 120 }],
  },
]

let services = [
  { id: 1, name: 'Engine oil change', price: 15 },
  { id: 2, name: 'Oil filter change', price: 20 },
  { id: 3, name: 'Air filter replacement', price: 12 },
  { id: 4, name: 'Brake pad inspection', price: 10 },
  { id: 5, name: 'AC system check', price: 18 },
  { id: 6, name: 'Engine diagnostics', price: 25 },
]

let parts = [
  { id: 1, name: 'Oil filter', unit_price: 8, stock_quantity: 4, low_stock_threshold: 5 },
  { id: 2, name: 'Engine oil 5L', unit_price: 35, stock_quantity: 12, low_stock_threshold: 5 },
  { id: 3, name: 'Brake pads', unit_price: 25, stock_quantity: 2, low_stock_threshold: 5 },
  { id: 4, name: 'Air filter', unit_price: 14, stock_quantity: 9, low_stock_threshold: 5 },
]

let nextCustomerId = 4
let nextCarId = 5
let nextVisitId = 104

function delay(value) {
  // Tiny fake delay so loading states actually render, just like a real call
  return new Promise((resolve) => setTimeout(() => resolve(value), 250))
}

function customerListShape(c) {
  // GET /customers returns the full cars array too (not just one "primary"
  // car) so the frontend can ask "which car?" when a customer has more than one.
  return { id: c.id, name: c.name, phone: c.phone, last_visit: c.last_visit, car: c.cars[0], cars: c.cars }
}

// Flat list of finished invoices across ALL customers, newest first - this
// is what the Dashboard's "Recent invoices" table reads from. It's separate
// from each customer's own .visits list (which only holds that one
// customer's history).
let recentVisits = [
  { id: 101, customer_name: 'Ahmed Saleh', car_model: 'BMW 320i', total: 35, created_at: '2026-06-20T10:00:00Z' },
  { id: 102, customer_name: 'Mona Tarek', car_model: 'BMW X5', total: 55, created_at: '2026-06-18T09:30:00Z' },
  { id: 103, customer_name: 'Karim Adel', car_model: 'BMW 520d', total: 120, created_at: '2026-06-02T10:00:00Z' },
]

export function mockLogin(email, password) {
  return delay({ token: 'mock-token', user: { id: 1, name: 'Omar Admin', role: 'admin' } })
}

export function mockGetCustomers(search = '') {
  const term = search.toLowerCase()
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.cars.some(
        (car) =>
          car.plate_number.toLowerCase().includes(term) ||
          car.chassis_number.toLowerCase().includes(term) ||
          car.engine_number.toLowerCase().includes(term) ||
          car.make.toLowerCase().includes(term) ||
          car.model.toLowerCase().includes(term),
      ),
  )
  return delay(filtered.map(customerListShape))
}

export function mockGetCustomer(id) {
  const c = customers.find((c) => String(c.id) === String(id))
  return delay(c)
}

export function mockGetCars(search = '') {
  const term = search.toLowerCase()
  const allCars = customers.flatMap((c) =>
    c.cars.map((car) => ({ ...car, customer_id: c.id, customer_name: c.name })),
  )
  const filtered = allCars.filter(
    (car) =>
      car.make.toLowerCase().includes(term) ||
      car.model.toLowerCase().includes(term) ||
      car.plate_number.toLowerCase().includes(term) ||
      car.chassis_number.toLowerCase().includes(term) ||
      car.engine_number.toLowerCase().includes(term) ||
      car.customer_name.toLowerCase().includes(term),
  )
  return delay(filtered)
}

export function mockCreateCustomer(payload) {
  const customer = {
    id: nextCustomerId++,
    name: payload.name,
    phone: payload.phone,
    last_visit: null,
    cars: [{ 
      id: nextCarId++, 
      make: payload.car.make, 
      year: payload.car.year, 
      model: payload.car.model, 
      plate_number: payload.car.plate_number, 
      chassis_number: payload.car.chassis_number,
      engine_number: payload.car.engine_number
    }],
    visits: [],
  }
  customers.push(customer)
  return delay(customer)
}

export function mockAddCar(customerId, payload) {
  const customer = customers.find((c) => String(c.id) === String(customerId))
  const car = { 
    id: nextCarId++, 
    make: payload.make, 
    year: payload.year, 
    model: payload.model, 
    plate_number: payload.plate_number, 
    chassis_number: payload.chassis_number,
    engine_number: payload.engine_number
  }
  customer.cars.push(car)
  return delay(car)
}

export function mockDeleteCustomerCar(customerId, carId) {
  const customer = customers.find((c) => String(c.id) === String(customerId))
  customer.cars = customer.cars.filter((car) => String(car.id) !== String(carId))
  return delay({ success: true })
}

let nextServiceId = 7
let nextPartId = 5

export function mockGetServices() {
  return delay(services)
}

export function mockCreateService(payload) {
  const service = { id: nextServiceId++, name: payload.name, price: payload.price, active: true }
  services.push(service)
  return delay(service)
}

export function mockUpdateService(id, payload) {
  const service = services.find((s) => s.id === id)
  Object.assign(service, payload)
  if (payload.active === false) {
    services = services.filter((s) => s.id !== id) // hide inactive ones from the list, like the real backend would
  }
  return delay(service)
}

export function mockGetParts() {
  return delay(parts)
}

export function mockCreatePart(payload) {
  const part = {
    id: nextPartId++,
    name: payload.name,
    unit_price: payload.unit_price,
    stock_quantity: payload.stock_quantity || 0,
    active: true,
  }
  parts.push(part)
  return delay(part)
}

export function mockUpdatePart(id, payload) {
  const part = parts.find((p) => p.id === id)
  Object.assign(part, payload)
  if (payload.active === false) {
    parts = parts.filter((p) => p.id !== id)
  }
  return delay(part)
}

export function mockCreateVisit(payload) {
  const subtotal =
    payload.services.reduce((sum, s) => sum + s.price, 0) +
    payload.parts.reduce((sum, p) => sum + p.quantity * p.unit_price, 0)
  const discount_amount = subtotal * (payload.discount_percent / 100)
  const total = subtotal - discount_amount

  const customer = customers.find((c) => c.id === payload.customer_id)
  const car = customer.cars.find((c) => c.id === payload.car_id)

  const visit = {
    id: nextVisitId++,
    created_at: new Date().toISOString(),
    customer: { id: customer.id, name: customer.name, phone: customer.phone },
    car: {
      make: car.make,
      year: car.year,
      model: car.model,
      plate_number: car.plate_number,
      chassis_number: car.chassis_number,
      engine_number: car.engine_number,
    },
    services: payload.services.map((s) => ({
      name: services.find((svc) => svc.id === s.service_id)?.name || 'Custom service',
      price: s.price,
    })),
    parts: payload.parts.map((p) => ({
      name: parts.find((part) => part.id === p.part_id)?.name || 'Custom part',
      quantity: p.quantity,
      unit_price: p.unit_price,
      line_total: p.quantity * p.unit_price,
    })),
    subtotal,
    discount_percent: payload.discount_percent,
    discount_amount,
    total,
  }

  customer.visits.push({ id: visit.id, created_at: visit.created_at, total: visit.total })
  customer.last_visit = visit.created_at.slice(0, 10)

  recentVisits.unshift({
    id: visit.id,
    customer_name: customer.name,
    car_model: `${car.make} ${car.model}`,
    total,
    created_at: visit.created_at,
  })

  return delay(visit)
}

export function mockGetRecentVisits(limit = 5) {
  return delay(recentVisits.slice(0, limit))
}

export function mockGetVisit(id) {
  // In mock mode the receipt is always passed via route state right after
  // creating it, so this is rarely hit - returns null if the page is
  // opened directly without that state.
  return delay(null)
}

export function mockGetDashboardSummary() {
  return delay({
    total_customers: customers.length,
    total_cars: customers.reduce((sum, c) => sum + c.cars.length, 0),
    total_services: services.length,
    total_parts: parts.length,
  })
}
