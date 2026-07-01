import { useState } from 'react'

// Validation functions
function validateOnlyLetters(value) {
  const regex = /^[a-zA-Z\u0600-\u06FF\s]*$/
  return regex.test(value)
}

function validateOnlyNumbers(value) {
  const regex = /^[0-9\s]*$/
  return regex.test(value)
}

function validateLettersAndNumbers(value) {
  const regex = /^[a-zA-Z0-9\u0600-\u06FF\s]*$/
  return regex.test(value)
}

export default function AddCustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    car: { make: '', year: '', model: '', plate_number: '', chassis_number: '', engine_number: '' },
  })
  const [errors, setErrors] = useState({})

  function update(field, value) {
    let isValid = true
    
    // Validate on input
    if (field === 'name') {
      isValid = validateOnlyLetters(value)
    } else if (field === 'phone') {
      isValid = validateOnlyNumbers(value)
    }
    
    if (isValid) {
      setForm((f) => ({ ...f, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
    } else {
      setErrors((prev) => ({ ...prev, [field]: `Invalid ${field}` }))
    }
  }
  
  function updateCar(field, value) {
    let isValid = true
    
    if (field === 'make') {
      isValid = validateOnlyLetters(value)
    } else if (field === 'year') {
      isValid = validateOnlyNumbers(value)
    } else if (['model', 'plate_number', 'chassis_number', 'engine_number'].includes(field)) {
      isValid = validateLettersAndNumbers(value)
    }
    
    if (isValid) {
      setForm((f) => ({ ...f, car: { ...f.car, [field]: value } }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
    } else {
      setErrors((prev) => ({ ...prev, [field]: `Invalid ${field}` }))
    }
  }

  function handleSave() {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Full name is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!form.car.make.trim()) newErrors.make = 'Car make is required'
    if (!form.car.year.trim()) newErrors.year = 'Car year is required'
    if (!form.car.model.trim()) newErrors.model = 'Car model is required'
    if (!form.car.plate_number.trim()) newErrors.plate_number = 'Plate number is required'
    if (!form.car.chassis_number.trim()) newErrors.chassis_number = 'Chassis number (VIN) is required'
    if (!form.car.engine_number.trim()) newErrors.engine_number = 'Engine number is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-base font-medium mb-4">Add customer and car</h2>

        <Field 
          label="Full name (letters only)" 
          value={form.name} 
          onChange={(v) => update('name', v)} 
          error={errors.name}
        />
        <Field 
          label="Phone number (numbers only)" 
          value={form.phone} 
          onChange={(v) => update('phone', v)} 
          error={errors.phone}
        />
        <Field 
          label="Address" 
          value={form.address} 
          onChange={(v) => update('address', v)} 
          error={errors.address}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Car make (letters only)"
            value={form.car.make}
            onChange={(v) => updateCar('make', v)}
            error={errors.make}
          />
          <Field
            label="Car year (numbers only)"
            value={form.car.year}
            onChange={(v) => updateCar('year', v)}
            error={errors.year}
          />
        </div>
        
        <Field 
          label="Car model (letters and numbers)" 
          value={form.car.model} 
          onChange={(v) => updateCar('model', v)} 
          error={errors.model}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field 
            label="Plate number (letters and numbers)" 
            value={form.car.plate_number} 
            onChange={(v) => updateCar('plate_number', v)} 
            error={errors.plate_number}
          />
          <Field
            label="Engine number (letters and numbers)"
            value={form.car.engine_number}
            onChange={(v) => updateCar('engine_number', v)} 
            error={errors.engine_number}
          />
        </div>
        
        <Field
          label="Chassis number (VIN) (letters and numbers)"
          value={form.car.chassis_number}
          onChange={(v) => updateCar('chassis_number', v)} 
          error={errors.chassis_number}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md">
            Save customer
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, error }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md text-sm ${error ? 'border-red-500' : 'border-slate-300'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
