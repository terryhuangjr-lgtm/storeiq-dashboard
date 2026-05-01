import { useState, useEffect } from 'react'
import { AlertCircle, AlertTriangle, Package, TrendingDown, ShoppingCart, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AlertData {
  id: string
  alert_type: string
  severity: string
  title: string
  description: string
  product_name: string
  variant: string | null
  value: number
  is_acknowledged: boolean
  is_resolved: boolean
  created_at: string
}

export default function InventoryAlerts() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all')
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastScan, setLastScan] = useState<string>('')
  const [acknowledging, setAcknowledging] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data: storeData } = await supabase
          .from('stores').select('id').limit(1).single()
        const currentStoreId = storeData?.id || '00000000-0000-0000-0000-000000000001'

        const { data: alertsData } = await supabase
          .from('alerts').select('*').eq('store_id', currentStoreId)
          .eq('is_acknowledged', false).order('severity', { ascending: false })

        if (alertsData && alertsData.length > 0) {
          setAlerts(alertsData)
          const times = alertsData.map(a => a.created_at).filter(Boolean).sort().reverse()
          if (times.length > 0) {
            const d = new Date(times[0])
            setLastScan(d.toLocaleDateString('en-US', { 
              weekday: 'short', month: 'short', day: 'numeric',
              hour: 'numeric', minute: '2-digit'
            }))
          }
        } else {
          setAlerts([])
        }
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching inventory alerts:', err)
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  const handleAcknowledge = async (alertId: string) => {
    setAcknowledging(alertId)
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_acknowledged: true })
        .eq('id', alertId)
      
      if (error) {
        console.error('Error acknowledging alert:', error.message)
        return
      }
      
      setAlerts(prev => prev.filter(a => a.id !== alertId))
    } catch (err: any) {
      console.error('Error acknowledging alert:', err.message)
    } finally {
      setAcknowledging(null)
    }
  }

  const handleAcknowledgeAll = async () => {
    const unacked = stockoutAlerts.filter(a => filter === 'all' || a.severity === filter)
    for (const alert of unacked) {
      await handleAcknowledge(alert.id)
    }
  }

  // Separate stockout/dead/overstock
  const stockoutAlerts = alerts.filter(a => a.alert_type === 'stockout_risk')
  const deadAlerts = alerts.filter(a => a.alert_type === 'dead_inventory' || a.alert_type === 'overstock')
  const otherAlerts = alerts.filter(a => a.alert_type !== 'stockout_risk' && a.alert_type !== 'dead_inventory' && a.alert_type !== 'overstock')

  const summary = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    dead: deadAlerts.length,
  }

  const filteredStockout = filter === 'all'
    ? stockoutAlerts
    : stockoutAlerts.filter(a => a.severity === filter)

  // Parse days remaining from description
  const extractDays = (desc: string): number | null => {
    const match = desc.match(/(\d+)\s*days?\s*of\s*stock/)
    return match ? parseInt(match[1]) : null
  }

  const extractReorderQty = (desc: string): number | null => {
    const match = desc.match(/Reorder\s*(\d+)\s*units?/)
    return match ? parseInt(match[1]) : null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Alerts</h1>
          <p className="text-gray-500 mt-1">Real-time stock levels and reorder recommendations</p>
        </div>
        {lastScan && (
          <div className="text-sm text-gray-500">Last scan: {lastScan}</div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-critical/10 rounded-xl p-4 border border-critical/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-critical/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-critical">{summary.critical}</p>
              <p className="text-sm text-gray-500">CRITICAL stock</p>
            </div>
          </div>
        </div>
        <div className="bg-danger/10 rounded-xl p-4 border border-danger/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-danger">{summary.high}</p>
              <p className="text-sm text-gray-500">HIGH priority</p>
            </div>
          </div>
        </div>
        <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{summary.medium}</p>
              <p className="text-sm text-gray-500">MEDIUM priority</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{summary.dead}</p>
              <p className="text-sm text-gray-500">Dead / Overstock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Alerts Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reorder Recommendations</h2>
            <p className="text-sm text-gray-500 mt-1">Products running low — calculated from real sales velocity</p>
          </div>
          <div className="flex items-center gap-2">
            {filteredStockout.length > 0 && (
              <button
                onClick={handleAcknowledgeAll}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Acknowledge All
              </button>
            )}
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">All Status</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Severity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Variant</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">In Stock</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Days Left</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Reorder Qty</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500" colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStockout.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No {filter !== 'all' ? filter + ' ' : ''}reorder alerts right now
                  </td>
                </tr>
              )}
              {filteredStockout.map((item) => {
                const daysLeft = extractDays(item.description)
                const reorderQty = extractReorderQty(item.description)
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        item.severity === 'critical' ? 'bg-critical text-white' :
                        item.severity === 'high' ? 'bg-danger text-white' :
                        'bg-warning text-white'
                      }`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.title}</div>
                    </td>
                    <td className="py-4 px-4">
                      {item.variant ? (
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                          {item.variant}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold text-lg ${
                        item.value <= 10 ? 'text-critical' :
                        item.value <= 30 ? 'text-danger' :
                        item.value <= 60 ? 'text-warning' :
                        'text-gray-900'
                      }`}>
                        {item.value}
                      </span>
                      <div className="text-xs text-gray-400">units</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {daysLeft !== null ? (
                        <>
                          <span className={`font-bold text-lg ${
                            daysLeft <= 10 ? 'text-critical' :
                            daysLeft <= 20 ? 'text-danger' :
                            daysLeft <= 30 ? 'text-warning' :
                            'text-gray-900'
                          }`}>
                            {daysLeft}
                          </span>
                          <div className="text-xs text-gray-400">days</div>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {reorderQty !== null ? (
                        <span className="font-semibold text-gray-900">{reorderQty}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        daysLeft !== null && daysLeft <= 10
                          ? 'bg-critical/10 text-critical'
                          : daysLeft !== null && daysLeft <= 20
                          ? 'bg-danger/10 text-danger'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Order {reorderQty || '?'} units
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <button
                        onClick={() => handleAcknowledge(item.id)}
                        disabled={acknowledging === item.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {acknowledging === item.id ? '...' : 'Seen'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead / Overstock Inventory */}
      {deadAlerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Dead & Overstock Inventory</h2>
          <p className="text-sm text-gray-500 mb-6">Items with low or zero velocity — consider promotions</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Variant</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Issue</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Suggested Action</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deadAlerts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{item.product_name}</td>
                    <td className="py-4 px-4">
                      {item.variant ? (
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                          {item.variant}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-lg text-gray-900">{item.value}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {item.alert_type === 'dead_inventory'
                          ? 'No sales in 30+ days'
                          : 'Excess stock relative to demand'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        item.alert_type === 'dead_inventory'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.alert_type === 'dead_inventory' ? 'Flash Sale' : 'Promo / Bundle'}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <button
                        onClick={() => handleAcknowledge(item.id)}
                        disabled={acknowledging === item.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {acknowledging === item.id ? '...' : 'Seen'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
