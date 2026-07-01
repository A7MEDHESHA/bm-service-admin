const BASE_URL = "http://localhost:3000/api";

async function test() {
  console.log("Testing GET /customers...");
  const customersRes = await fetch(`${BASE_URL}/customers`);
  const customers = await customersRes.json();
  console.log("Customers raw:", customers);
  
  console.log("Testing GET /cars...");
  const carsRes = await fetch(`${BASE_URL}/cars`);
  const cars = await carsRes.json();
  console.log("Cars raw:", cars);
}

test();
