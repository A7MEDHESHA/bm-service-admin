const OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

export default function DiscountSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`text-xs px-3 py-1 rounded-md border ${
            d === value ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600'
          }`}
        >
          {d}%
        </button>
      ))}
    </div>
  )
}
