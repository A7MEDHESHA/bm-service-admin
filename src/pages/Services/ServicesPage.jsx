import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getServices, createService, updateService } from '../../api/services.js'

export default function ServicesPage() {
  const { token } = useAuth()
  const [services, setServices] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [confirmingRemoveId, setConfirmingRemoveId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', price: '' })
  const [currency, setCurrency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')

  async function load() {
    // API CALL: GET /services
    const data = await getServices(token)
    setServices(data)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(service) {
    setEditingId(service.id)
    setForm({ name: service.name, price: service.price })
  }

  async function saveEdit() {
    // API CALL: PUT /services/:id - this is how the admin changes a price
    await updateService(token, editingId, { name: form.name, price: parseFloat(form.price), active: true })
    setEditingId(null)
    load()
  }

  async function saveNew() {
    // API CALL: POST /services
    await createService(token, { name: form.name, price: parseFloat(form.price) })
    setAdding(false)
    setForm({ name: '', price: '' })
    load()
  }

  async function removeService(service) {
    // API CALL: PUT /services/:id with active:false - keeps history intact,
    // just stops it from showing up for new orders
    await updateService(token, service.id, { name: service.name, price: service.price, active: false })
    setConfirmingRemoveId(null)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Services</h1>
        <button
          onClick={() => {
            setAdding(true)
            setForm({ name: '', price: '' })
          }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md"
        >
          + Add service
        </button>
      </div>

      <table className="w-full text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Price</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {adding && (
            <tr className="border-t border-slate-100 bg-blue-50/40">
              <td className="p-2">
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Service name"
                  className="w-full px-2 py-1 border border-slate-300 rounded-md"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-24 px-2 py-1 border border-slate-300 rounded-md"
                />
              </td>
              <td className="p-2 text-right space-x-3">
                <button onClick={saveNew} className="text-blue-600 text-xs">
                  Save
                </button>
                <button onClick={() => setAdding(false)} className="text-slate-500 text-xs">
                  Cancel
                </button>
              </td>
            </tr>
          )}

          {services.filter((s) => s.active !== false).map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              {editingId === s.id ? (
                <>
                  <td className="p-2">
                    <input
                      autoFocus
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-2 py-1 border border-slate-300 rounded-md"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className="w-24 px-2 py-1 border border-slate-300 rounded-md"
                    />
                  </td>
                  <td className="p-2 text-right space-x-3">
                    <button onClick={saveEdit} className="text-blue-600 text-xs">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-500 text-xs">
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-slate-500">{currency}{s.price}</td>
                  <td className="p-3 text-right space-x-3">
                    {confirmingRemoveId === s.id ? (
                      <>
                        <span className="text-xs text-slate-500">Remove this service?</span>
                        <button onClick={() => removeService(s)} className="text-red-500 text-xs">
                          Yes, remove
                        </button>
                        <button onClick={() => setConfirmingRemoveId(null)} className="text-slate-500 text-xs">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(s)} className="text-blue-600 text-xs">
                          Edit price
                        </button>
                        <button onClick={() => setConfirmingRemoveId(s.id)} className="text-red-500 text-xs">
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}