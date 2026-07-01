import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCars } from '../../api/cars.js'
import { addCar, deleteCustomerCar, getCustomers } from '../../api/customers.js'

export default function CarsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    // API CALL: GET /cars?search=...
    const data = await getCars(token, search)
    setCars(data)
  }

  useEffect(() => {
    load()
  }, [search])

  async function handleAddCar(customerId, payload) {
    // API CALL: POST /customers/:id/cars
    await addCar(token, customerId, payload)
    setShowAddModal(false)
    load()
  }

  async function handleDeleteCar(car) {
    const confirmed = window.confirm(
      `Delete ${car.make} ${car.model} (${car.plate_number}) from ${car.customer_name}? This will not delete the customer.`,
    )
    if (!confirmed) return

    try {
      setError('')
      // API CALL: DELETE /customers/:customerId/cars/:carId
      await deleteCustomerCar(token, car.customer_id, car.id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Cars</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by plate, model, engine, or owner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm w-72"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-md"
          >
            <Plus size={16} />
            Add car
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <table className="w-full text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="p-3">Car</th>
            <th className="p-3">Year</th>
            <th className="p-3">Plate</th>
            <th className="p-3">Chassis (VIN)</th>
            <th className="p-3">Engine</th>
            <th className="p-3">Owner</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((c) => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="p-3 font-medium">
                {c.make} {c.model}
              </td>
              <td className="p-3 text-slate-500">{c.year}</td>
              <td className="p-3 text-slate-500">{c.plate_number}</td>
              <td className="p-3 text-slate-500">{c.chassis_number}</td>
              <td className="p-3 text-slate-500">{c.engine_number}</td>
              <td className="p-3 text-slate-500">{c.customer_name}</td>
              <td className="p-3 text-right">
                <div className="flex justify-end items-center gap-3">
                  <button onClick={() => navigate(`/customers/${c.customer_id}`)} className="text-blue-600 text-xs">
                    View owner
                  </button>
                  <button
                    onClick={() => handleDeleteCar(c)}
                    className="inline-flex items-center justify-center text-red-600"
                    title="Delete car"
                    aria-label="Delete car"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {cars.length === 0 && (
            <tr>
              <td className="p-6 text-center text-slate-500" colSpan={7}>
                No cars found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAddModal && (
        <AddCarModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCar}
        />
      )}
    </div>
  )
}

function AddCarModal({ token, onClose, onSave }) {
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [form, setForm] = useState({
    make: '',
    year: '',
    model: '',
    plate_number: '',
    chassis_number: '',
    engine_number: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadCustomers() {
      // API CALL: GET /customers?search=...
      const data = await getCustomers(token, customerSearch)
      setCustomers(data)
      if (!customerId && data[0]) setCustomerId(String(data[0].id))
    }
    loadCustomers()
  }, [customerSearch])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleSave() {
    const nextErrors = {}
    if (!customerId) nextErrors.customerId = 'Choose an existing customer'
    if (!form.make.trim()) nextErrors.make = 'Make is required'
    if (!form.year.trim()) nextErrors.year = 'Year is required'
    if (!form.model.trim()) nextErrors.model = 'Model is required'
    if (!form.plate_number.trim()) nextErrors.plate_number = 'Plate number is required'
    if (!form.chassis_number.trim()) nextErrors.chassis_number = 'Chassis number is required'
    if (!form.engine_number.trim()) nextErrors.engine_number = 'Engine number is required'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      await onSave(customerId, form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-base font-medium mb-4">Add car to existing customer</h2>

        <Field
          label="Find customer"
          value={customerSearch}
          onChange={setCustomerSearch}
          placeholder="Search by name, phone, or plate"
        />

        <div className="mb-3">
          <label className="block text-xs text-slate-500 mb-1">Customer</label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value)
              setErrors((current) => ({ ...current, customerId: '' }))
            }}
            className={`w-full px-3 py-2 border rounded-md text-sm ${errors.customerId ? 'border-red-500' : 'border-slate-300'}`}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Make" value={form.make} onChange={(value) => update('make', value)} error={errors.make} />
          <Field label="Year" value={form.year} onChange={(value) => update('year', value)} error={errors.year} />
        </div>
        <Field label="Model" value={form.model} onChange={(value) => update('model', value)} error={errors.model} />
        <Field
          label="Plate number"
          value={form.plate_number}
          onChange={(value) => update('plate_number', value)}
          error={errors.plate_number}
        />
        <Field
          label="Chassis number (VIN)"
          value={form.chassis_number}
          onChange={(value) => update('chassis_number', value)}
          error={errors.chassis_number}
        />
        <Field
          label="Engine number"
          value={form.engine_number}
          onChange={(value) => update('engine_number', value)}
          error={errors.engine_number}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save car'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, error, placeholder = '' }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md text-sm ${error ? 'border-red-500' : 'border-slate-300'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
