import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './hooks/useAuth'
import Login from './pages/Login'
import Overview from './pages/Overview'
import SalesIntelligence from './pages/SalesIntelligence'
import InventoryAlerts from './pages/InventoryAlerts'
import CustomerInsights from './pages/CustomerInsights'
import Reports from './pages/Reports'
import ActivityLog from './pages/ActivityLog'
import Layout from './components/Layout'
import { supabase } from './lib/supabase'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/sales" element={<SalesIntelligence />} />
            <Route path="/inventory" element={<InventoryAlerts />} />
            <Route path="/customers" element={<CustomerInsights />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/" element={<Navigate to="/overview" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>

        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'bg-white shadow-lg border border-gray-200',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App