import { useState } from 'react'

export default function ServiceChecklist({ services, selected, onToggle, onAdd, currency }) {
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const filtered = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  function handleAdd() {
    const parsedPrice = parseFloat(price)
    if (!name.trim() || isNaN(parsedPrice)) return
    onAdd({ name: name.trim(), price: parsedPrice })
    setName('')
    setPrice('')
    setAdding(false)
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search services"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-md text-sm"
      />
      <div className="space-y-1 max-h-48 overflow-y-auto mb-2">
        {filtered.map((s) => (
          <label
            key={s.id}
            className="flex justify-between items-center px-3 py-2 border border-slate-200 rounded-md text-sm cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <input type="checkbox" checked={!!selected[s.id]} onChange={() => onToggle(s)} />
              {s.name}
            </span>
            <span className="text-slate-500">{currency}{s.price}</span>
          </label>
        ))}
      </div>

      {adding ? (
        <div className="border border-slate-300 rounded-md p-3 space-y-2">
          <input
            autoFocus
            type="text"
            placeholder="Service name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-28 px-2 py-1 border border-slate-300 rounded-md text-sm"
          />
          <div className="flex gap-3">
            <button onClick={handleAdd} className="text-xs text-blue-600">
              Add
            </button>
            <button
              onClick={() => {
                setAdding(false)
                setName('')
                setPrice('')
              }}
              className="text-xs text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs text-blue-600">
          + Add custom service
        </button>
      )}
    </div>
  )
}
