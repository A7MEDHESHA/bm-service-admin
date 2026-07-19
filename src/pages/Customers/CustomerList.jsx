import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCustomers, createCustomer, deleteCustomer } from '../../api/customers.js'
import { addCar } from '../../api/cars.js'
import { getInvoices } from '../../api/invoices.js'
import { getQuotations } from '../../api/quotations.js'
import AddCustomerModal from '../../components/AddCustomerModal.jsx'
import { RefreshCw, Trash2 } from 'lucide-react'

export default function CustomerList() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(!!location.state?.openAddModal)
  const [carChoice, setCarChoice] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function load() {
    try {
      setIsRefreshing(true)
      const data = await getCustomers(token, search)

      const [invoices, quotations] = await Promise.all([
        getInvoices(token),
        getQuotations(token, {}),
      ])
      const quotationById = new Map(quotations.map((q) => [q.id, q]))

      const lastVisitByCustomerId = new Map()
      for (const inv of invoices) {
        const quotation = quotationById.get(inv.quotationId)
        if (!quotation) continue
        const existing = lastVisitByCustomerId.get(quotation.customerId)
        if (!existing || new Date(inv.issuedAt) > new Date(existing)) {
          lastVisitByCustomerId.set(quotation.customerId, inv.issuedAt)
        }
      }

      const withLastVisit = data.map((c) => ({
        ...c,
        last_visit: lastVisitByCustomerId.get(c.id)
          ? new Date(lastVisitByCustomerId.get(c.id)).toLocaleDateString()
          : null,
      }))

      setCustomers(withLastVisit)
    } catch (error) {
      console.error("CustomerList.load() - ERROR:", error);
      alert("Failed to load customers: " + error.message);
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, token])

  async function handleAdd(payload) {
    try {
      const customerResult = await createCustomer(token, payload);
      await addCar(token, customerResult.id, payload.car);
      setShowModal(false);
      load();
    } catch (err) {
      console.error("Error adding customer:", err);
      alert("Error saving customer: " + (err.message || "Unknown error"));
    }
  }

  async function handleDeleteCustomer(customer) {
    const confirmed = window.confirm(
      `Delete customer ${customer.name}? This will also delete all their cars.`
    )
    if (!confirmed) return
    try {
      await deleteCustomer(token, customer.id)
      load()
    } catch (err) {
      console.error("Error deleting customer:", err)
      alert("Error deleting customer: " + err.message)
    }
  }

  function startNewOrder(customer) {
    const carId = customer.cars.length > 1 ? carChoice[customer.id] || customer.cars[0].id : customer.cars[0].id
    navigate(`/service-order/${customer.id}/${carId}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by phone number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm w-72"
          />
          <button
            onClick={() => load()}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md">
          + Add customer
        </button>
      </div>

      <table className="w-full text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="p-3">Customer</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Car</th>
            <th className="p-3">Plate</th>
            <th className="p-3">Last visit</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const hasMultipleCars = c.cars && c.cars.length > 1
            return (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-slate-500">{c.phone}</td>
                <td className="p-3 text-slate-500">
                  {hasMultipleCars ? (
                    <select
                      value={carChoice[c.id] || c.cars[0].id}
                      onChange={(e) => setCarChoice((prev) => ({ ...prev, [c.id]: Number(e.target.value) }))}
                      className="border border-slate-200 rounded-md text-sm px-1 py-0.5"
                    >
                      {c.cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.make} {car.model} ({car.plate_number})
                        </option>
                      ))}
                    </select>
                  ) : (
                    c.cars && c.cars[0] ? `${c.cars[0].make} ${c.cars[0].model}`.trim() : ''
                  )}
                </td>
                <td className="p-3 text-slate-500">
                  {hasMultipleCars
                    ? c.cars.find((car) => car.id === (carChoice[c.id] || c.cars[0].id))?.plate_number
                    : c.cars && c.cars[0] ? c.cars[0].plate_number : ''}
                </td>
                <td className="p-3 text-slate-500">{c.last_visit ?? '-'}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => navigate(`/customers/${c.id}`)} className="text-blue-600 text-xs">
                    View
                  </button>
                  <button onClick={() => startNewOrder(c)} className="text-blue-600 text-xs">
                    New order
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(c)}
                    className="text-red-600"
                    title="Delete customer"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {showModal && <AddCustomerModal onClose={() => setShowModal(false)} onSave={handleAdd} />}
    </div>
  )
}