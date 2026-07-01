import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'

export default function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-slate-50 min-h-screen p-6">
        <Outlet />
      </main>
    </div>
  )
}
