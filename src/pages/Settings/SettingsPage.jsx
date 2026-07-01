import { useState } from 'react'
import { getShopName } from '../../config/branding.js'

export default function SettingsPage() {
  const [shopName, setShopName] = useState(getShopName)
  const [shopAddress, setShopAddress] = useState(() => localStorage.getItem('bm_shop_address') || '')
  const [shopPhone, setShopPhone] = useState(() => localStorage.getItem('bm_shop_phone') || '')
  const [currency, setCurrency] = useState(() => localStorage.getItem('bm_currency') || 'EGP')
  const [receiptFooter, setReceiptFooter] = useState(() => localStorage.getItem('bm_receipt_footer') || '')
  const [saved, setSaved] = useState(false)

  function save() {
    localStorage.setItem('bm_shop_name', shopName)
    localStorage.setItem('bm_shop_address', shopAddress)
    localStorage.setItem('bm_shop_phone', shopPhone)
    localStorage.setItem('bm_currency', currency)
    localStorage.setItem('bm_receipt_footer', receiptFooter)
    
    // Dispatch a custom event to notify other components of settings changed
    window.dispatchEvent(new CustomEvent('bm-settings-updated'))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="w-full">
      <h1 className="text-lg font-medium mb-6">Settings</h1>

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-medium mb-4 text-slate-700">Shop Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Shop name</label>
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Phone number</label>
            <input
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-1">Address</label>
          <textarea
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-medium mb-4 text-slate-700">Inventory & Receipts</h2>
        
        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-1">Currency</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            placeholder="$"
          />
        </div>
        
        <div>
          <label className="block text-xs text-slate-500 mb-1">Receipt Footer Text</label>
          <textarea
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            placeholder="Thank you for your business!"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md">
          Save Changes
        </button>
        {saved && <span className="text-sm text-green-600">✓ Saved successfully</span>}
      </div>
    </div>
  )
}
