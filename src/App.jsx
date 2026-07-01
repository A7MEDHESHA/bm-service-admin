import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CustomerList from './pages/Customers/CustomerList.jsx'
import CustomerProfile from './pages/Customers/CustomerProfile.jsx'
import CarsPage from './pages/Cars/CarsPage.jsx'
import ServicesPage from './pages/Services/ServicesPage.jsx'
import InventoryPage from './pages/Inventory/InventoryPage.jsx'
import SettingsPage from './pages/Settings/SettingsPage.jsx'
import ServiceOrder from './pages/ServiceOrder/ServiceOrder.jsx'
import Quotation from './pages/Quotation/Quotation.jsx'
import JobOrder from './pages/JobOrder/JobOrder.jsx'
import Receipt from './pages/Receipt/Receipt.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* Pages with the sidebar */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/service-order/:customerId/:carId" element={<ServiceOrder />} />
        </Route>

        {/* Print-only pages, full screen, no sidebar */}
        <Route path="/quotation" element={<Quotation />} />
        <Route path="/job-order" element={<JobOrder />} />
        <Route path="/receipt/:id" element={<Receipt />} />
      </Route>
    </Routes>
  )
}
