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

async function test() {
    console.log("Testing apiRequest('/customers')...");
    try {
        const customers = await apiRequest('/customers');
        console.log("customers:", customers);
        console.log("Array.isArray(customers):", Array.isArray(customers));
        console.log("customers.length:", customers.length);

        console.log("\nTesting apiRequest('/cars')...");
        const cars = await apiRequest('/cars');
        console.log("cars:", cars);
        console.log("Array.isArray(cars):", Array.isArray(cars));
        console.log("cars.length:", cars.length);

    } catch (e) {
        console.error("ERROR:", e);
    }
}

test();
