import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCustomer } from '../../api/customers.js'

export default function CustomerProfile() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)

  useEffect(() => {
    async function load() {
      // API CALL: GET /customers/:id
      const data = await getCustomer(token, id)
      setCustomer(data)
    }
    load()
  }, [id])

  if (!customer) return <p className="text-sm text-slate-500">Loading...</p>

  return (
    <div>
      <h1 className="text-lg font-medium mb-1">{customer.name}</h1>
      <p className="text-sm text-slate-500 mb-6">{customer.phone}</p>

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
            <button onClick={() => navigate(`/service-order/${customer.id}/${car.id}`)} className="text-blue-600 text-xs">
              New order
            </button>
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
