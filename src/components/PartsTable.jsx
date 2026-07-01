import { useState } from 'react'

export default function PartsTable({ parts, catalog, onQtyChange, onAdd, currency }) {
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState('custom')
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')

  function handleAdd() {
    if (selectedId === 'custom') {
      const price = parseFloat(customPrice)
      if (!customName.trim() || isNaN(price)) return
      onAdd({ name: customName.trim(), unit_price: price })
    } else {
      const match = catalog.find((p) => String(p.id) === selectedId)
      if (!match) return
      onAdd({ id: match.id, name: match.name, unit_price: match.unit_price })
    }
    setSelectedId('custom')
    setCustomName('')
    setCustomPrice('')
    setAdding(false)
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_56px_70px_60px] gap-2 text-xs text-slate-400 px-2 mb-1">
        <span>Part</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Unit</span>
        <span className="text-right">Line</span>
      </div>
      <div className="space-y-1 mb-2">
        {parts.map((p, i) => (
          <div
            key={p.id}
            className="grid grid-cols-[1fr_56px_70px_60px] gap-2 items-center px-2 py-1 border border-slate-200 rounded-md text-sm"
          >
            <span>{p.name}</span>
            <input
              type="number"
              min="1"
              value={p.quantity}
              onChange={(e) => onQtyChange(i, Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 px-1 py-1 border border-slate-300 rounded-md text-center"
            />
            <span className="text-right text-slate-500">{currency}{p.unit_price}</span>
            <span className="text-right font-medium">{currency}{(p.quantity * p.unit_price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="border border-slate-300 rounded-md p-3 space-y-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm"
          >
            <option value="custom">+ Custom part...</option>
            {catalog.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({currency}{p.unit_price})
              </option>
            ))}
          </select>

          {selectedId === 'custom' && (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Part name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 px-2 py-1 border border-slate-300 rounded-md text-sm"
              />
              <input
                type="number"
                placeholder="Unit price"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-24 px-2 py-1 border border-slate-300 rounded-md text-sm"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleAdd} className="text-xs text-blue-600">
              Add
            </button>
            <button
              onClick={() => {
                setAdding(false)
                setSelectedId('custom')
                setCustomName('')
                setCustomPrice('')
              }}
              className="text-xs text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs text-blue-600">
          + Add part
        </button>
      )}
    </div>
  )
}
