import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Car, Wrench, Package, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'
import { getShopName } from '../config/branding.js'
import logo from '../assets/mekawy-logo.png'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/cars', label: 'Cars', icon: Car },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [shopName, setShopName] = useState(getShopName)

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setShopName(getShopName())
    }
    
    window.addEventListener('bm-settings-updated', handleSettingsUpdate)
    window.addEventListener('storage', handleSettingsUpdate)
    return () => {
      window.removeEventListener('bm-settings-updated', handleSettingsUpdate)
      window.removeEventListener('storage', handleSettingsUpdate)
    }
  }, [])

  return (
    <aside className="w-56 bg-slate-900 text-slate-200 flex flex-col h-screen">
     <div className="px-4 py-5">
  <img src={logo} alt="Mekawy Bavarian Motor Works" className="w-full h-auto max-h-16 object-contain" />
</div>

      <nav className="flex-1 px-2 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-slate-400 mb-2">{user?.role}</p>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  )
}
