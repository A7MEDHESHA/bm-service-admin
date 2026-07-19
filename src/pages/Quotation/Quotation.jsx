import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getQuotationPrintData } from '../../api/quotations.js'
import { getShopName } from '../../config/branding.js'
import { approveQuotation } from '../../api/quotations.js'
import { createInvoice, getInvoices } from '../../api/invoices.js'

export default function Quotation() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [shopName] = useState(getShopName)
  const [currency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')

  useEffect(() => {
    async function load() {
      try {
        const result = await getQuotationPrintData(token, id)
        setData(result)
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [id])

  const [actionLoading, setActionLoading] = useState(false)
const [actionError, setActionError] = useState('')
const [existingInvoiceId, setExistingInvoiceId] = useState(null)

useEffect(() => {
  async function checkInvoice() {
    if (!data || data.quotation.status !== 'Approved') return
    const invoices = await getInvoices(token)
    const match = invoices.find((inv) => inv.quotationId === data.quotation.id)
    if (match) setExistingInvoiceId(match.id)
  }
  checkInvoice()
}, [data])

async function handleApprove() {
  setActionError('')
  setActionLoading(true)
  try {
    await approveQuotation(token, quotation.id)
    const result = await getQuotationPrintData(token, id)
    setData(result)
  } catch (err) {
    setActionError(err.message)
  } finally {
    setActionLoading(false)
  }
}

async function handleCreateInvoice() {
  setActionError('')
  setActionLoading(true)
  try {
    const invoice = await createInvoice(token, quotation.id)
    setExistingInvoiceId(invoice.id)
    navigate(`/receipt/${invoice.id}`)
  } catch (err) {
    setActionError(err.message)
  } finally {
    setActionLoading(false)
  }
}

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-600">
        {error}
        <button onClick={() => navigate('/customers')} className="ml-2 text-blue-600 underline">
          Go to customers
        </button>
      </div>
    )
  }

  if (!data) return <p className="p-6 text-sm text-slate-500">Loading quotation...</p>

  const { quotation, customer, car, lines } = data

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl print-area">
        <p className="text-center font-bold text-lg mb-1">{shopName}</p>
        <p className="text-center text-sm text-slate-500 mb-1">Quotation - not a final invoice</p>
        <p className="text-center text-xs text-slate-400 mb-6">Status: {quotation.status}</p>

        <table className="w-full text-sm mb-6 border-b border-slate-200 pb-6">
          <tbody>
            <InfoRow label="Customer name" value={customer.name} />
            <InfoRow label="Phone number" value={customer.phone} />
            <InfoRow label="Car make" value={car.make} />
            <InfoRow label="Car year" value={car.year} />
            <InfoRow label="Car model" value={car.model} />
            <InfoRow label="Plate number" value={car.plate_number} />
            <InfoRow label="Chassis number (VIN)" value={car.chassis_number} />
            <InfoRow label="Engine number" value={car.engine_number} />
          </tbody>
        </table>

        <div className="mb-6">
          {lines.map((line) => (
            <div key={line.id} className="flex justify-between text-sm mb-1">
              <span>{line.description} x{line.quantity}</span>
              <span>{currency}{line.line_total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 mt-3 pt-4 text-sm space-y-2">
          <Row label="Subtotal" value={quotation.subtotal} currency={currency} />
          <Row label="Discount" value={-quotation.discount} currency={currency} />
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Estimated total</span>
            <span>{currency}{quotation.total.toFixed(2)}</span>
          </div>
        </div>
          
          {actionError && <p className="text-sm text-red-600 mb-3">{actionError}</p>}

<div className="no-print flex gap-4 mb-4">
  {quotation.status === 'Draft' && (
    <button
      onClick={handleApprove}
      disabled={actionLoading}
      className="flex-1 bg-green-600 text-white rounded-md py-2 text-sm disabled:opacity-50"
    >
      {actionLoading ? 'Approving...' : 'Approve Quotation'}
    </button>
  )}
  {quotation.status === 'Approved' && !existingInvoiceId && (
    <button
      onClick={handleCreateInvoice}
      disabled={actionLoading}
      className="flex-1 bg-blue-600 text-white rounded-md py-2 text-sm disabled:opacity-50"
    >
      {actionLoading ? 'Creating...' : 'Create Invoice'}
    </button>
  )}
  {existingInvoiceId && (
    <button
      onClick={() => navigate(`/receipt/${existingInvoiceId}`)}
      className="flex-1 border border-slate-300 rounded-md py-2 text-sm"
    >
      View Invoice
    </button>
  )}
</div>
        

        <div className="no-print flex gap-4 mt-8">
          <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white rounded-md py-2 text-sm">
            Print
          </button>
          <button onClick={() => navigate(-1)} className="flex-1 border border-slate-300 rounded-md py-2 text-sm">
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <tr>
      <td className="text-slate-500 py-2 w-1/3">{label}</td>
      <td className="text-right font-medium py-2 break-words">{value || '-'}</td>
    </tr>
  )
}

function Row({ label, value, currency }) {
  return (
    <div className="flex justify-between text-slate-500">
      <span>{label}</span>
      <span>{currency}{value.toFixed(2)}</span>
    </div>
  )
}