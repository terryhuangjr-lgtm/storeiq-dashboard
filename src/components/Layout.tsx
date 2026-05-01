import { useState, useEffect } from 'react'
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom'
import { Store, LayoutDashboard, TrendingUp, AlertCircle, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import StoreSelector from './StoreSelector'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()

  // Auth guard: redirect to login if no session and not in demo mode
  useEffect(() => {
    const isDemo = localStorage.getItem('storeiq_demo') === 'true'
    if (!session && !isDemo) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/overview' },
    { icon: TrendingUp, label: 'Sales Intelligence', to: '/sales' },
    { icon: AlertCircle, label: 'Inventory Alerts', to: '/inventory', badge: 5 },
    { icon: Users, label: 'Customer Insights', to: '/customers' },
    { icon: FileText, label: 'All Reports', to: '/reports' },
    { icon: LogOut, label: 'Agent Activity Log', to: '/activity' },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-white/10">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">StoreIQ</h1>
              <p className="text-sidebarText text-xs">Analytics Dashboard</p>
            </div>
          </div>

          {/* Store Selector */}
          <div className="p-4 border-b border-white/10">
            <StoreSelector />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sidebarText text-sm font-medium
                    transition-all duration-200 relative group
                    ${isActive 
                      ? 'bg-white text-sidebarActive font-semibold' 
                      : 'hover:bg-white/5 hover:text-white'
                    }
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                  )}
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-sidebarActive' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-danger text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Account Section */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebarText text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebarText text-sm font-medium hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">StoreIQ</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <Header />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-text">Good morning, Superare</h1>
        <span className="px-3 py-1 bg-success/10 text-success text-sm font-medium rounded-full">
          Live
        </span>
      </div>
      <div className="flex items-center gap-6 text-sm text-secondary">
        <span>Last updated: Today at 2:30 PM</span>
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Hermes last ran: 15 minutes ago
        </span>
      </div>
    </div>
  )
}