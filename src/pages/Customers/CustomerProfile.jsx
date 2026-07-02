import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trash2, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCustomer, deleteCustomer } from '../../api/customers.js'
import { deleteCar } from '../../api/cars.js'

export default function CustomerProfile() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      // API CALL: GET /customers/:id
      const data = await getCustomer(token, id)
      setCustomer(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteCustomer() {
    const confirmed = window.confirm(
      `Delete customer ${customer.name}? This will also delete all their cars.`,
    )
    if (!confirmed) return

    try {
      setError('')
      await deleteCustomer(token, id)
      navigate('/customers')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteCar(car) {
    const confirmed = window.confirm(
      `Delete ${car.make} ${car.model} (${car.plate_number})?`,
    )
    if (!confirmed) return

    try {
      setError('')
      await deleteCar(token, car.id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (!customer) return <p className="text-sm text-slate-500">Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/customers')} className="text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-medium">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-sm px-3 py-2 rounded-md disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleDeleteCustomer}
            className="inline-flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-2 rounded-md"
          >
            <Trash2 size={16} />
            Delete customer
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <h2 className="text-sm font-medium mb-2">Cars</h2>
      <div className="space-y-2 mb-6">
        {customer.cars.map((car) => (
          <div key={car.id} className="bg-white border border-slate-200 rounded-md p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">
                {car.make} {car.model}
              </p>
              <p className="text-xs text-slate-500">
                Year {car.year} - Plate {car.plate_number} - Chassis {car.chassis_number} - Engine {car.engine_number}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(`/service-order/${customer.id}/${car.id}`)} className="text-blue-600 text-xs">
                New order
              </button>
              <button
                onClick={() => handleDeleteCar(car)}
                className="text-red-600"
                title="Delete car"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-medium mb-2">Visit history</h2>
      <div className="space-y-2">
        {customer.visits?.map((v) => (
          <div key={v.id} className="bg-white border border-slate-200 rounded-md p-3 flex justify-between text-sm">
            <span className="text-slate-500">{new Date(v.created_at).toLocaleDateString()}</span>
            <span className="font-medium">${v.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
