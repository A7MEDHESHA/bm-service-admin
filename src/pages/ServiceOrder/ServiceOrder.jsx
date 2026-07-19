import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServices } from '../../api/services.js'
import { getParts } from '../../api/parts.js'
import { getCustomer } from '../../api/customers.js'
import { createQuotation, addQuotationLine, updateQuotation } from '../../api/quotations.js'
import ServiceChecklist from '../../components/ServiceChecklist.jsx'
import PartsTable from '../../components/PartsTable.jsx'
import DiscountSelector from '../../components/DiscountSelector.jsx'

export default function ServiceOrder() {
  const { customerId, carId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [currency, setCurrency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')

  const [customer, setCustomer] = useState(null)
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState({})
  const [parts, setParts] = useState([])
  const [partsCatalog, setPartsCatalog] = useState([])
  const [discount, setDiscount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const customerData = await getCustomer(token, customerId)
      setCustomer(customerData)
      const servicesData = await getServices(token)
      setServices(servicesData)
      const partsData = await getParts(token)
      setPartsCatalog(partsData)
    }
    load()
  }, [customerId])

  const car = customer?.cars.find((c) => String(c.id) === carId)

  function toggleService(service) {
    setSelectedServices((prev) => {
      const copy = { ...prev }
      if (copy[service.id]) delete copy[service.id]
      else copy[service.id] = service
      return copy
    })
  }

  function addCustomService(newService) {
    // ⚠️ Backend services must already exist in the catalog (POST /api/services)
    // to be added as a real quotation line. A purely ad-hoc custom service
    // cannot be saved via add-line since it requires a real serviceId.
    const custom = { id: `custom-${Date.now()}`, name: newService.name, price: newService.price, isCustom: true }
    setServices((s) => [...s, custom])
    setSelectedServices((s) => ({ ...s, [custom.id]: custom }))
  }

  function addPart(newPart) {
    setParts((p) => [
      ...p,
      { id: newPart.id, name: newPart.name, unit_price: newPart.unit_price, quantity: 1 },
    ])
  }

  function updateQty(index, qty) {
    setParts((p) => p.map((part, i) => (i === index ? { ...part, quantity: qty } : part)))
  }

  const serviceList = Object.values(selectedServices)
  const subtotal =
    serviceList.reduce((sum, s) => sum + s.price, 0) +
    parts.reduce((sum, p) => sum + p.quantity * p.unit_price, 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount

  // ------------------------------------------------------------------------
  // Builds the quotation on the backend for real: creates the quotation,
  // then adds each selected service/part as a line (skips any custom/ad-hoc
  // service that has no real serviceId, since the backend requires one).
  // ------------------------------------------------------------------------
  async function buildQuotationOnBackend() {
  // Create with discount 0 first - lines will be added incrementally next,
  // and setting the real discount too early can make an intermediate
  // subtotal (before all lines exist) go negative and get rejected.
  const quotation = await createQuotation(token, {
    customerId: customer.id,
    carId: car.id,
    discount: 0,
  })

  for (const s of serviceList) {
    if (s.isCustom) continue // no real serviceId - can't be saved as a line
    await addQuotationLine(token, {
      quotationId: quotation.id,
      type: 'SERVICE',
      serviceId: s.id,
      quantity: 1,
    })
  }

  for (const p of parts) {
    await addQuotationLine(token, {
      quotationId: quotation.id,
      type: 'PART',
      partId: p.id,
      quantity: p.quantity,
    })
  }

  // Now that the full subtotal exists, apply the real discount - this
  // triggers one final recalculation against the complete subtotal.
  if (discountAmount > 0) {
    await updateQuotation(token, quotation.id, { discount: discountAmount })
  }

  return quotation.id
}
  function handleJobOrder() {
    // Job order creation is not yet wired up on the backend (commented out
    // server-side). This stays a client-side printable preview only, using
    // customer + car info already loaded on this page.
    navigate('/job-order', { state: { customer, car } })
  }

  async function handleConfirm() {
    setError('')
    setSaving(true)
    try {
      const quotationId = await buildQuotationOnBackend()
      navigate(`/quotation/${quotationId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!customer || !car) return <p className="text-sm text-slate-500">Loading...</p>

  return (
    <div className="grid grid-cols-[1.3fr_1fr] gap-6 max-w-4xl">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-medium">
            {customer.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </div>
          <div>
            <p className="text-sm font-medium">{customer.name}</p>
            <p className="text-xs text-slate-500">
              {car.make} {car.model} - year {car.year} - plate {car.plate_number}
            </p>
            <p className="text-xs text-slate-500">
              chassis {car.chassis_number} - engine {car.engine_number}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex gap-2 mb-4">
          <button onClick={handleJobOrder} className="flex-1 text-sm border border-slate-300 rounded-md py-2">
            Create job order
          </button>
        </div>

        <p className="text-xs font-medium text-slate-500 mb-2">Services</p>
        <ServiceChecklist
          services={services}
          selected={selectedServices}
          onToggle={toggleService}
          onAdd={addCustomService}
          currency={currency}
        />

        <p className="text-xs font-medium text-slate-500 mt-4 mb-2">Spare parts</p>
        <PartsTable parts={parts} catalog={partsCatalog} onQtyChange={updateQty} onAdd={addPart} currency={currency} />

        <p className="text-xs font-medium text-slate-500 mt-4 mb-2">Discount</p>
        <DiscountSelector value={discount} onChange={setDiscount} />

        <div className="mt-4 pt-3 border-t border-slate-100 text-sm space-y-1">
          <Row label="Subtotal" value={subtotal} currency={currency} />
          <Row label={`Discount (${discount}%)`} value={-discountAmount} currency={currency} />
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-slate-500">Total</span>
            <span className="text-xl font-medium">{currency}{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={saving}
          className="w-full mt-4 bg-blue-600 text-white rounded-md py-2 text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save order & review quotation'}
        </button>
      </div>
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