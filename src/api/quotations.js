import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'

function normalizeLine(line) {
    return {
        id: line.quotationLineId,
        type: line.type,
        partId: line.partId,
        serviceId: line.serviceId,
        description: line.description,
        quantity: Number(line.quantity),
        unit_price: Number(line.unitPrice),
        discount: Number(line.discount),
        line_total: Number(line.lineTotal),
    }
}

function normalizeQuotation(q) {
    return {
        id: q.quotationId,
        customerId: q.customerId,
        carId: q.carId,
        subtotal: Number(q.subtotal),
        discount: Number(q.discount),
        total: Number(q.total),
        status: q.status,
        notes: q.notes,
        lines: Array.isArray(q.lines) ? q.lines.map(normalizeLine) : [],
    }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: POST /api/quotations
// EXPECTED BODY: { customerId, carId, discount?, notes? }
// ⚠️ Response is the RAW quotation object, not wrapped.
// ------------------------------------------------------------------------------
export async function createQuotation(token, payload) {
    if (USE_MOCK) return { id: Date.now(), ...payload, subtotal: 0, total: 0, status: 'Draft', lines: [] }
    const result = await apiRequest('/quotations', {
        method: 'POST',
        token,
        body: {
            customerId: Number(payload.customerId),
            carId: Number(payload.carId),
            discount: payload.discount ? Number(payload.discount) : undefined,
            notes: payload.notes || undefined,
        },
    })
    return normalizeQuotation(result)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/quotations
// ⚠️ Backend returns 404 (not an empty array) when there are no matches.
// This is handled below and converted into an empty array.
// ------------------------------------------------------------------------------
export async function getQuotations(token, filters = {}) {
  if (USE_MOCK) return []
  try {
    const params = new URLSearchParams()
    if (filters.customerId) params.set('customerId', filters.customerId)
    if (filters.carId) params.set('carId', filters.carId)
    if (filters.status) params.set('status', filters.status)
    const query = params.toString() ? `?${params.toString()}` : ''
    const data = await apiRequest(`/quotations${query}`, { token })
    const list = data?.quotations ?? []
    return list.map(normalizeQuotation)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}
// ------------------------------------------------------------------------------
// API ENDPOINT: PUT /api/quotations/:id
// EXPECTED BODY: { discount?, status?, notes? }
// ------------------------------------------------------------------------------
export async function updateQuotation(token, id, payload) {
    if (USE_MOCK) return { success: true }
    const data = await apiRequest(`/quotations/${id}`, {
        method: 'PUT',
        token,
        body: payload,
    })
    return normalizeQuotation(data.quotation)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: PUT /api/quotations/:id/approve
// Approves quotation, consumes matching part inventory quantities server-side.
// ------------------------------------------------------------------------------
export function approveQuotation(token, id) {
    if (USE_MOCK) return Promise.resolve({ success: true })
    return apiRequest(`/quotations/${id}/approve`, { method: 'PUT', token })
}

// ------------------------------------------------------------------------------
// API ENDPOINT: DELETE /api/quotations/:id
// ------------------------------------------------------------------------------
export function deleteQuotation(token, id) {
    if (USE_MOCK) return Promise.resolve({ success: true })
    return apiRequest(`/quotations/${id}`, { method: 'DELETE', token })
}

// ------------------------------------------------------------------------------
// API ENDPOINT: POST /api/quotations/add-line
// EXPECTED BODY: { quotationId, type: "PART"|"SERVICE", partId?, serviceId?, quantity, discount? }
// Use this (NOT /api/quotation-lines directly) - this one recalculates quotation
// totals and merges duplicate lines automatically.
// ------------------------------------------------------------------------------
export async function addQuotationLine(token, payload) {
    if (USE_MOCK) return { success: true }
    const result = await apiRequest('/quotations/add-line', {
        method: 'POST',
        token,
        body: {
            quotationId: Number(payload.quotationId),
            type: payload.type,
            partId: payload.partId ? Number(payload.partId) : undefined,
            serviceId: payload.serviceId ? Number(payload.serviceId) : undefined,
            quantity: Number(payload.quantity),
            discount: payload.discount ? Number(payload.discount) : undefined,
        },
    })
    return normalizeQuotation(result)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: DELETE /api/quotations/delete-line/:id
// Recalculates quotation totals after removing the line.
// ------------------------------------------------------------------------------
export function deleteQuotationLine(token, lineId) {
    if (USE_MOCK) return Promise.resolve({ success: true })
    return apiRequest(`/quotations/delete-line/${lineId}`, { method: 'DELETE', token })
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/quotations/quotation-pdf/:id
// Returns structured data (quotation + customer + car + lines) for building
// a printable receipt/quotation view in the browser.
// ⚠️ GET /api/quotations/:id/pdf exists on the backend but currently does NOT
// return the actual PDF file - only a success message. Not usable yet.
// ------------------------------------------------------------------------------
export async function getQuotationPrintData(token, id) {
    if (USE_MOCK) return null
    const data = await apiRequest(`/quotations/quotation-pdf/${id}`, { token })
    const raw = data?.quotationPdfData
    if (!raw) return null
    return {
        quotation: normalizeQuotation(raw.quotation),
        customer: {
            id: raw.customer.customerId,
            name: raw.customer.name,
            phone: raw.customer.phoneNumber,
            address: raw.customer.address,
        },
        car: {
            id: raw.car.carId,
            make: raw.car.make,
            model: raw.car.model,
            year: raw.car.year,
            plate_number: raw.car.plateNumber,
            chassis_number: raw.car.bodyNumber,
            engine_number: raw.car.engineNumber,
        },
        lines: (raw.quotationLines || []).map(normalizeLine),
    }
}