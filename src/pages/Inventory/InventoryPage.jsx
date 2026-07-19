import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getParts, createPart, updatePart } from '../../api/parts.js'

export default function InventoryPage() {
  const { token } = useAuth()
  const [parts, setParts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [restockingId, setRestockingId] = useState(null)
  const [restockQty, setRestockQty] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', unit_price: '', stock_quantity: '' })
  const [currency, setCurrency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')

  async function load() {
    // API CALL: GET /parts
    const data = await getParts(token)
    setParts(data)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(part) {
    setEditingId(part.id)
    setForm({ name: part.name, unit_price: part.unit_price, stock_quantity: part.stock_quantity })
  }

  async function saveEdit() {
    // API CALL: PUT /parts/:id - this is how the admin changes a part's price
    await updatePart(token, editingId, {
      name: form.name,
      unit_price: parseFloat(form.unit_price),
      stock_quantity: parseInt(form.stock_quantity, 10),
      active: true,
    })
    setEditingId(null)
    load()
  }

  async function saveNew() {
    // API CALL: POST /parts
    await createPart(token, {
      name: form.name,
      unit_price: parseFloat(form.unit_price),
      stock_quantity: parseInt(form.stock_quantity, 10) || 0,
    })
    setAdding(false)
    setForm({ name: '', unit_price: '', stock_quantity: '' })
    load()
  }

  async function saveRestock(part) {
    const addQty = parseInt(restockQty, 10)
    if (!addQty || isNaN(addQty)) return
    // API CALL: PUT /parts/:id - this is how the admin adds quantity to stock
    await updatePart(token, part.id, {
      name: part.name,
      unit_price: part.unit_price,
      stock_quantity: part.stock_quantity + addQty,
      active: true,
    })
    setRestockingId(null)
    setRestockQty('')
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Inventory</h1>
        <button
          onClick={() => {
            setAdding(true)
            setForm({ name: '', unit_price: '', stock_quantity: '' })
          }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md"
        >
          + Add part
        </button>
      </div>

      <table className="w-full text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="p-3">Part</th>
            <th className="p-3">Unit price</th>
            <th className="p-3">In stock</th>
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
                  placeholder="Part name"
                  className="w-full px-2 py-1 border border-slate-300 rounded-md"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={form.unit_price}
                  onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
                  placeholder="0.00"
                  className="w-20 px-2 py-1 border border-slate-300 rounded-md"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                  placeholder="0"
                  className="w-16 px-2 py-1 border border-slate-300 rounded-md"
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

          {parts.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              {editingId === p.id ? (
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
                      value={form.unit_price}
                      onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
                      className="w-20 px-2 py-1 border border-slate-300 rounded-md"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={form.stock_quantity}
                      onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded-md"
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
              ) : restockingId === p.id ? (
                <>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-slate-500">{currency}{p.unit_price}</td>
                  <td className="p-2">
                    <input
                      autoFocus
                      type="number"
                      placeholder="Qty arrived"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded-md"
                    />
                  </td>
                  <td className="p-2 text-right space-x-3">
                    <button onClick={() => saveRestock(p)} className="text-blue-600 text-xs">
                      Add to stock
                    </button>
                    <button
                      onClick={() => {
                        setRestockingId(null)
                        setRestockQty('')
                      }}
                      className="text-slate-500 text-xs"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-slate-500">{currency}{p.unit_price}</td>
                  <td className={`p-3 ${p.stock_quantity < (p.low_stock_threshold || 5) ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                    {p.stock_quantity}
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <button
                      onClick={() => {
                        setRestockingId(p.id)
                        setRestockQty('')
                      }}
                      className="text-blue-600 text-xs"
                    >
                      + Restock
                    </button>
                    <button onClick={() => startEdit(p)} className="text-blue-600 text-xs">
                      Edit
                    </button>
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