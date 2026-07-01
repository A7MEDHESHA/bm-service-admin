import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getShopName } from '../../config/branding.js'

export default function Quotation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [shopName, setShopName] = useState(getShopName)
  const [currency, setCurrency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        No order data - go back and build a quotation first.
        <button onClick={() => navigate('/customers')} className="ml-2 text-blue-600 underline">
          Go to customers
        </button>
      </div>
    )
  }

  const { customer, car, services, parts, subtotal, discount, discountAmount, total } = state

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl print-area">
        <p className="text-center font-bold text-lg mb-1">{shopName}</p>
        <p className="text-center text-sm text-slate-500 mb-1">Quotation - not a final invoice</p>
        <p className="text-center text-xs text-slate-400 mb-6">{new Date().toLocaleString()}</p>

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
          <Section title="Services" items={services.map((s) => [s.name, s.price])} currency={currency} />
          <Section title="Spare parts" items={parts.map((p) => [`${p.name} x${p.quantity}`, p.quantity * p.unit_price])} currency={currency} />
        </div>

        <div className="border-t border-slate-100 mt-3 pt-4 text-sm space-y-2">
          <Row label="Subtotal" value={subtotal} currency={currency} />
          <Row label={`Discount (${discount}%)`} value={-discountAmount} currency={currency} />
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Estimated total</span>
            <span>{currency}{total.toFixed(2)}</span>
          </div>
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

function Section({ title, items, currency }) {
  if (items.length === 0) return null
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-slate-700 mb-2">{title}</p>
      {items.map(([name, price], i) => (
        <div key={i} className="flex justify-between text-sm mb-1">
          <span>{name}</span>
          <span>{currency}{price.toFixed(2)}</span>
        </div>
      ))}
    </div>
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
