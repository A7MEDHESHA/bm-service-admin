import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getVisit } from '../../api/visits.js'
import { getShopName } from '../../config/branding.js'

export default function Receipt() {
  const { id } = useParams()
  const { state } = useLocation()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [visit, setVisit] = useState(state || null)
  const [shopName, setShopName] = useState(getShopName)
  const [currency, setCurrency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')
  const [receiptFooter, setReceiptFooter] = useState(() => localStorage.getItem('bm_receipt_footer') || '')

  useEffect(() => {
    if (visit) return
    async function load() {
      // API CALL: GET /visits/:id - only needed if this page is opened directly
      // (e.g. re-printing later) instead of right after "Confirm and print receipt"
      const data = await getVisit(token, id)
      setVisit(data)
    }
    load()
  }, [id])

  if (!visit) return <p className="p-6 text-sm text-slate-500">Loading receipt...</p>

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl print-area">
        <p className="text-center font-bold text-lg mb-1">{shopName}</p>
        <p className="text-center text-xs text-slate-400 mb-6">{new Date(visit.created_at).toLocaleString()}</p>
        
        <div className="mb-6 border-b border-slate-200 pb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 w-1/3">Customer Name:</span>
            <span className="font-medium">{visit.customer.name}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 w-1/3">Phone:</span>
            <span>{visit.customer.phone}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 w-1/3">Car Make:</span>
            <span>{visit.car.make}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 w-1/3">Car Year:</span>
            <span>{visit.car.year}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 w-1/3">Car Model:</span>
            <span>{visit.car.model}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 w-1/3">Plate Number:</span>
            <span>{visit.car.plate_number}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 w-1/3">Chassis Number:</span>
            <span>{visit.car.chassis_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 w-1/3">Engine Number:</span>
            <span>{visit.car.engine_number}</span>
          </div>
        </div>

        <div className="mb-6">
          {visit.services.map((s, i) => (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span>{s.name}</span>
              <span>{currency}{s.price}</span>
            </div>
          ))}
          {visit.parts.map((p, i) => (
            <div key={i} className="flex justify-between text-sm mb-1">
              <span>
                {p.name} x{p.quantity}
              </span>
              <span>{currency}{p.line_total}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 mt-3 pt-4 text-sm space-y-2">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{currency}{visit.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Discount ({visit.discount_percent}%)</span>
            <span>-{currency}{visit.discount_amount}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Total</span>
            <span>{currency}{visit.total}</span>
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
