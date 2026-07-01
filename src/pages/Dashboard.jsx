import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getRecentVisits } from '../api/visits.js'
import { getParts } from '../api/parts.js'
import { getCustomer, getCustomers, getStatistics } from '../api/customers.js'
import { Users, Car, Wrench, Package, AlertTriangle, ClipboardPlus } from 'lucide-react'

export default function Dashboard() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [recentVisits, setRecentVisits] = useState([])
  const [currency, setCurrency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setCurrency(localStorage.getItem('bm_currency') || 'EGP')
    }
    
    window.addEventListener('bm-settings-updated', handleSettingsUpdate)
    window.addEventListener('storage', handleSettingsUpdate)
    return () => {
      window.removeEventListener('bm-settings-updated', handleSettingsUpdate)
      window.removeEventListener('storage', handleSettingsUpdate)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const summaryData = await getStatistics(token)
        // Map backend keys to frontend keys
        const mappedSummary = {
          total_customers: summaryData.totalCustomers,
          total_cars: summaryData.totalCars,
          total_services: summaryData.totalServices,
          total_parts: summaryData.totalParts,
        }
        setSummary(mappedSummary)
      } catch (err) {
        console.error('Failed to load stats', err)
        // Set mock summary if needed
        setSummary({ total_customers: 0, total_cars: 0, total_services:0, total_parts:0 })
      }
      
      try {
        const parts = await getParts(token)
        // Note: parts API might not have low stock, so we'll skip that for now
        setLowStock([])
      } catch (err) {
        console.error('Failed to load parts', err)
        setLowStock([])
      }

      // Recent visits might not be available yet, so we'll show empty
      setRecentVisits([])
    }
    load()
  }, [token])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          label="Total customers" 
          value={summary?.total_customers} 
          icon={Users} 
          color="bg-blue-500"
        />
        <StatCard 
          label="Total cars" 
          value={summary?.total_cars} 
          icon={Car} 
          color="bg-green-500"
        />
        <StatCard 
          label="Total services" 
          value={summary?.total_services} 
          icon={Wrench} 
          color="bg-purple-500"
        />
        <StatCard 
          label="Total parts" 
          value={summary?.total_parts} 
          icon={Package} 
          color="bg-orange-500"
        />
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="text-amber-800 font-medium mb-1">Low Stock Alert</p>
            <p className="text-amber-700 text-sm">
              {lowStock.length} part{lowStock.length > 1 ? 's' : ''} running low:{' '}
              {lowStock.map((p) => `${p.name} (${p.stock_quantity} left)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick actions</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ClipboardPlus size={16} />
                New Order
              </button>
              <button
                onClick={() => navigate('/customers', { state: { openAddModal: true } })}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
              >
                + Add New Customer
              </button>
              <button
                onClick={() => navigate('/customers')}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
              >
                View All Customers
              </button>
              <button
                onClick={() => navigate('/inventory')}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
              >
                Manage Inventory
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-700">Recent Invoices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Customer</th>
                    <th className="px-6 py-3 text-left font-medium">Car</th>
                    <th className="px-6 py-3 text-left font-medium">Total</th>
                    <th className="px-6 py-3 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{v.customer_name}</td>
                      <td className="px-6 py-4 text-slate-600">{v.car_model}</td>
                      <td className="px-6 py-4 text-slate-600">{currency}{v.total}</td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {new Date(v.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showOrderModal && (
        <NewOrderModal
          token={token}
          onClose={() => setShowOrderModal(false)}
          onStart={(customerId, carId) => navigate(`/service-order/${customerId}/${carId}`)}
          onAddCustomer={() => navigate('/customers', { state: { openAddModal: true } })}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`${color} rounded-lg p-3 text-white`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value ?? '-'}</p>
        </div>
      </div>
    </div>
  )
}

function NewOrderModal({ token, onClose, onStart, onAddCustomer }) {
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [carId, setCarId] = useState('')
  const [customerDetails, setCustomerDetails] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCustomers() {
      // API CALL: GET /customers?search=...
      const data = await getCustomers(token, search)
      setCustomers(data)

      const currentCustomerStillVisible = data.some((customer) => String(customer.id) === String(customerId))
      if (!currentCustomerStillVisible) {
        const firstCustomer = data[0]
        setCustomerId(firstCustomer ? String(firstCustomer.id) : '')
        setCarId(firstCustomer?.cars?.[0] ? String(firstCustomer.cars[0].id) : '')
      }
    }
    loadCustomers()
  }, [search])

  useEffect(() => {
    async function loadCustomerDetails() {
      if (!customerId) {
        setCustomerDetails(null)
        return
      }

      // API CALL: GET /customers/:id
      const data = await getCustomer(token, customerId)
      setCustomerDetails(data)
    }
    loadCustomerDetails()
  }, [customerId, token])

  const selectedCustomer = customerDetails || customers.find((customer) => String(customer.id) === String(customerId))
  const selectedCar = selectedCustomer?.cars?.find((car) => String(car.id) === String(carId))

  function updateCustomer(nextCustomerId) {
    const customer = customers.find((item) => String(item.id) === String(nextCustomerId))
    setCustomerId(nextCustomerId)
    setCarId(customer?.cars?.[0] ? String(customer.cars[0].id) : '')
    setError('')
  }

  function handleStart() {
    if (!selectedCustomer || !selectedCar) {
      setError('Choose a customer and car first')
      return
    }
    onStart(selectedCustomer.id, selectedCar.id)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-xl">
        <h2 className="text-base font-medium mb-4">Start new order</h2>

        <div className="mb-3">
          <label className="block text-xs text-slate-500 mb-1">Find customer</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, plate, or engine"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => updateCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Car</label>
            <select
              value={carId}
              onChange={(e) => {
                setCarId(e.target.value)
                setError('')
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              disabled={!selectedCustomer?.cars?.length}
            >
              {selectedCustomer?.cars?.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.make} {car.model} ({car.plate_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCustomer && selectedCar ? (
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 text-sm">
              <InfoRow label="Customer" value={selectedCustomer.name} />
              <InfoRow label="Phone" value={selectedCustomer.phone} />
              <InfoRow label="Last visit" value={selectedCustomer.last_visit ?? '-'} />
              <InfoRow label="Total cars" value={selectedCustomer.cars?.length ?? 0} />
              <InfoRow label="Make" value={selectedCar.make} />
              <InfoRow label="Year" value={selectedCar.year} />
              <InfoRow label="Model" value={selectedCar.model} />
              <InfoRow label="Color" value={selectedCar.color} />
              <InfoRow label="Plate" value={selectedCar.plate_number} />
              <InfoRow label="Chassis (VIN)" value={selectedCar.chassis_number} />
              <InfoRow label="Engine number" value={selectedCar.engine_number} />
            </div>
            <div className="p-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Visit history</p>
              {selectedCustomer.visits?.length ? (
                <div className="space-y-2">
                  {selectedCustomer.visits.slice(0, 3).map((visit) => (
                    <div key={visit.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{new Date(visit.created_at).toLocaleDateString()}</span>
                      <span className="font-medium text-slate-800">{visit.total}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No visits yet</p>
              )}
            </div>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-500 mb-4">
            No customer found. Add the customer first, then start the order.
          </div>
        )}

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex justify-between gap-2">
          <button
            onClick={() => {
              onClose()
              onAddCustomer()
            }}
            className="px-4 py-2 text-sm border border-slate-300 rounded-md"
          >
            Add customer
          </button>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 rounded-md">
              Cancel
            </button>
            <button onClick={handleStart} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">
              Start order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="p-3 border-b border-slate-100 odd:md:border-r">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="font-medium text-slate-800 break-words">{value}</p>
    </div>
  )
}
