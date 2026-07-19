import { apiRequest } from './client.js'
import { USE_MOCK } from './config.js'

function normalizeInvoice(inv) {
  return {
    id: inv.invoiceId,
    quotationId: inv.quotationId,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status,
    issuedAt: inv.issuedAt,
    paidAt: inv.paidAt,
    notes: inv.notes,
  }
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/invoices
// Response shape: { success, data: [...] }
// ------------------------------------------------------------------------------
export async function getInvoices(token) {
  if (USE_MOCK) return []
  try {
    const data = await apiRequest('/invoices', { token })
    const list = data?.data ?? []
    return list.map(normalizeInvoice)
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}
// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/invoices/:id
// ------------------------------------------------------------------------------
export async function getInvoice(token, id) {
  if (USE_MOCK) return null
  const data = await apiRequest(`/invoices/${id}`, { token })
  return data?.data ? normalizeInvoice(data.data) : null
}

// ------------------------------------------------------------------------------
// API ENDPOINT: POST /api/invoices
// EXPECTED BODY: { quotationId, notes? }
// Only works if the quotation status is already "Approved".
// ------------------------------------------------------------------------------
export async function createInvoice(token, quotationId, notes) {
  if (USE_MOCK) return { id: Date.now(), quotationId, status: 'Unpaid' }
  const data = await apiRequest('/invoices', {
    method: 'POST',
    token,
    body: { quotationId: Number(quotationId), notes: notes || undefined },
  })
  return normalizeInvoice(data.data)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: PATCH /api/invoices/:id
// EXPECTED BODY: { status?, paidAt?, notes? }
// ------------------------------------------------------------------------------
export async function updateInvoice(token, id, payload) {
  if (USE_MOCK) return { success: true }
  const data = await apiRequest(`/invoices/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  })
  return normalizeInvoice(data.data)
}

// ------------------------------------------------------------------------------
// API ENDPOINT: DELETE /api/invoices/:id
// ------------------------------------------------------------------------------
export function deleteInvoice(token, id) {
  if (USE_MOCK) return Promise.resolve({ success: true })
  return apiRequest(`/invoices/${id}`, { method: 'DELETE', token })
}

// ------------------------------------------------------------------------------
// API ENDPOINT: GET /api/invoices/invoice-pdf/:id
// Returns structured data (invoice + quotation + customer + car + lines) for
// building a printable invoice view in the browser.
// ⚠️ GET /api/invoices/:id/pdf exists but only returns a success message,
// not the actual PDF file - same limitation as the quotation PDF endpoint.
// ------------------------------------------------------------------------------
export async function getInvoicePrintData(token, id) {
  if (USE_MOCK) return null
  const data = await apiRequest(`/invoices/invoice-pdf/${id}`, { token })
  const raw = data?.invoicePdfData
  if (!raw) return null
  return {
    invoice: normalizeInvoice(raw.invoice),
    quotation: {
      id: raw.quotation.quotationId,
      subtotal: Number(raw.quotation.subtotal),
      discount: Number(raw.quotation.discount),
      total: Number(raw.quotation.total),
      status: raw.quotation.status,
    },
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
    lines: (raw.quotationLines || []).map((line) => ({
      id: line.quotationLineId,
      description: line.description,
      quantity: Number(line.quantity),
      unit_price: Number(line.unitPrice),
      line_total: Number(line.lineTotal),
    })),
  }
}