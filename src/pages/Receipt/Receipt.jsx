import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getInvoicePrintData } from '../../api/invoices.js'
import { getShopName } from '../../config/branding.js'

export default function Receipt() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [shopName] = useState(getShopName)
  const [currency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')
  const [receiptFooter] = useState(() => localStorage.getItem('bm_receipt_footer') || '')

  useEffect(() => {
    async function load() {
      try {
        // API CALL: GET /invoices/invoice-pdf/:id
        const result = await getInvoicePrintData(token, id)
        if (!result) {
          setError('Invoice not found')
          return
        }
        setData(result)
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [id])

  if (error) return <p className="p-6 text-sm text-red-600">{error}</p>
  if (!data) return <p className="p-6 text-sm text-slate-500">Loading receipt...</p>

  const { invoice, quotation, customer, car, lines } = data

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl print-area">
        <p className="text-center font-bold text-lg mb-1">{shopName}</p>
        <p className="text-center text-xs text-slate-400 mb-1">Invoice {invoice.invoiceNumber}</p>
        <p className="text-center text-xs text-slate-400 mb-6">
          {new Date(invoice.issuedAt).toLocaleString()} - Status: {invoice.status}
        </p>

        <div className="mb-6 border-b border-slate-200 pb-6">
          <Row label="Customer Name:" value={customer.name} />
          <Row label="Phone:" value={customer.phone} />
          <Row label="Car Make:" value={car.make} />
          <Row label="Car Year:" value={car.year} />
          <Row label="Car Model:" value={car.model} />
          <Row label="Plate Number:" value={car.plate_number} />
          <Row label="Chassis Number:" value={car.chassis_number} />
          <Row label="Engine Number:" value={car.engine_number} />
        </div>

        <div className="mb-6">
          {lines.map((line) => (
            <div key={line.id} className="flex justify-between text-sm mb-1">
              <span>{line.description} x{line.quantity}</span>
              <span>{currency}{line.line_total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 mt-3 pt-4 text-sm space-y-2">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{currency}{quotation.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Discount</span>
            <span>-{currency}{quotation.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Total</span>
            <span>{currency}{quotation.total.toFixed(2)}</span>
          </div>
        </div>

        {receiptFooter && (
          <div className="border-t border-slate-100 mt-4 pt-4 text-xs text-slate-500 text-center">
            {receiptFooter}
          </div>
        )}

        <div className="no-print flex gap-4 mt-8">
          <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white rounded-md py-2 text-sm">
            Print
          </button>
          <button onClick={() => navigate('/customers')} className="flex-1 border border-slate-300 rounded-md py-2 text-sm">
            Back to customers
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm mb-2">
      <span className="text-slate-500 w-1/3">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}