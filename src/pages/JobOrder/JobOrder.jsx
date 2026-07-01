import { useLocation, useNavigate } from 'react-router-dom'
import { getShopName } from '../../config/branding.js'

export default function JobOrder() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const shopName = getShopName()

  if (!state) return <p className="p-6 text-sm text-slate-500">No customer selected.</p>

  const { customer, car } = state

  // Provide default values for missing car fields
  const carData = {
    make: car.make || 'N/A',
    year: car.year || 'N/A',
    model: car.model || 'N/A',
    plate_number: car.plate_number || 'N/A',
    chassis_number: car.chassis_number || 'N/A',
    engine_number: car.engine_number || 'N/A',
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200 rounded-lg p-8 w-full max-w-2xl print-area">
        <p className="text-center font-bold text-lg mb-1">{shopName}</p>
        <p className="text-center text-sm text-slate-500 mb-6">Job Order</p>

        <table className="w-full text-sm mb-6">
          <tbody>
            <Row label="Customer name" value={customer.name} />
            <Row label="Phone number" value={customer.phone} />
            <Row label="Car make" value={carData.make} />
            <Row label="Car year" value={carData.year} />
            <Row label="Car model" value={carData.model} />
            <Row label="Plate number" value={carData.plate_number} />
            <Row label="Chassis number (VIN)" value={carData.chassis_number} />
            <Row label="Engine number" value={carData.engine_number} />
          </tbody>
        </table>

        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">Mechanic Notes</p>
          <div 
            className="border border-slate-300 rounded-md p-4 space-y-6" 
            style={{ minHeight: '500px' }}
          >
            {/* More lines for notes */}
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
            <div className="border-b border-slate-200" />
          </div>
        </div>

        <div className="no-print flex gap-4">
          <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white rounded-md py-2 text-sm">
            Print
          </button>
          <button onClick={() => navigate(-1)} className="flex-1 border border-slate-300 rounded-md py-2 text-sm">
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <tr>
      <td className="text-slate-500 py-2 w-1/3">{label}</td>
      <td className="text-right font-medium py-2">{value}</td>
    </tr>
  )
}
