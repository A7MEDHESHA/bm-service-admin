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

const sampleCustomer1 = {
  customer_id: 1,
  name: 'Ahmed',
  phone_Number: '01012345678',
  address: '1',
  created_at: '2026-06-28T17:17:42.000Z',
  updated_at: '2026-06-28T17:17:42.000Z'
};
console.log("Sample customer 1 after normalize:", normalizeCustomer(sampleCustomer1));

const sampleCar1 = {
  car_id: 1,
  fk_car_customer_id: 1,
  make: 'Honda',
  model: 'Sevec',
  year: 2008,
  body_number: 'A444s',
  engine_number: 'za44',
  plate_number: 'No1'
};
const normalizedCar = {
  id: sampleCar1.car_id,
  make: sampleCar1.make,
  model: sampleCar1.model,
  year: sampleCar1.year,
  chassis_number: sampleCar1.body_number,
  engine_number: sampleCar1.engine_number,
  plate_number: sampleCar1.plate_number
};
console.log("Sample car 1 after normalize:", normalizedCar);
