import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServices } from '../../api/services.js'
import { getParts } from '../../api/parts.js'
import { getCustomer } from '../../api/customers.js'
import { createVisit } from '../../api/visits.js'
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

  useEffect(() => {
    async function load() {
      // API CALL: GET /customers/:id - customer and full car details for the header
      const customerData = await getCustomer(token, customerId)
      setCustomer(customerData)

      // API CALL: GET /services - catalog with prices, for the checklist
      const servicesData = await getServices(token)
      setServices(servicesData)

      // API CALL: GET /parts - catalog with prices, for the "Add part" dropdown
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
    const custom = { id: `custom-${Date.now()}`, name: newService.name, price: newService.price }
    setServices((s) => [...s, custom])
    setSelectedServices((s) => ({ ...s, [custom.id]: custom }))
  }

  function addPart(newPart) {
    setParts((p) => [
      ...p,
      { id: newPart.id || `custom-${Date.now()}`, name: newPart.name, unit_price: newPart.unit_price, quantity: 1 },
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

  function handleQuotation() {
    // No backend call - a quotation is just a printable estimate built from
    // whatever is currently checked. Nothing is saved.
    navigate('/quotation', {
      state: { customer, car, services: serviceList, parts, subtotal, discount, discountAmount, total },
    })
  }

  function handleJobOrder() {
    // No backend call either - the job order only needs customer + car info,
    // which is already loaded on this page.
    navigate('/job-order', { state: { customer, car } })
  }

  async function handleConfirm() {
    setSaving(true)
    try {
      // API CALL: POST /visits - the ONLY action that actually saves the order
      const visit = await createVisit(token, {
        customer_id: customer.id,
        car_id: car.id,
        services: serviceList.map((s) => ({ service_id: s.id, price: s.price })),
        parts: parts.map((p) => ({ part_id: p.id, quantity: p.quantity, unit_price: p.unit_price })),
        discount_percent: discount,
      })
      navigate(`/receipt/${visit.id}`, { state: visit })
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
              {car.make} {car.model}, {car.color} - year {car.year} - plate {car.plate_number}
            </p>
            <p className="text-xs text-slate-500">
              chassis {car.chassis_number} - engine {car.engine_number}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={handleQuotation} className="flex-1 text-sm border border-slate-300 rounded-md py-2">
            Create quotation
          </button>
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
          {saving ? 'Saving...' : 'Confirm and print receipt'}
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
