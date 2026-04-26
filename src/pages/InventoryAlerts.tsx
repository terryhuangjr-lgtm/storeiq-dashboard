import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Package, TrendingDown, AlertTriangle } from 'lucide-react'
import AlertBadge from '../components/AlertBadge'
import { supabase, isDemoMode } from '../lib/supabase'

interface InventoryItem {
  id: string
  product: string
  variant: string
  stock: number
  daysRemaining: number
  reorderQty: number
  status: 'critical' | 'high' | 'medium' | 'low'
}

interface DeadItem {
  id: string
  product: string
  units: number
  daysStagnant: number
  idleValue: number
  recommendation: 'Flash Sale' | 'Bundle' | 'Discontinue'
}

export default function InventoryAlerts() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'overstock'>('all')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [deadItems, setDeadItems] = useState<DeadItem[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: storeData, error: storeError } = await supabase
          .from('stores').select('id').limit(1).single()
        if (storeError) throw storeError
        const currentStoreId = storeData?.id

        const { data: alertsData } = await supabase
          .from('alerts').select('*').eq('store_id', currentStoreId)
          .eq('is_resolved', false).order('severity')
        if (alertsData) setAlerts(alertsData)

        if ((!alertsData || alertsData.length === 0) && isDemoMode) {
          setTimeout(() => {
            setItems([
              { id: '1', product: 'Supergel V Gloves', variant: 'Black', stock: 5, daysRemaining: 3, reorderQty: 100, status: 'critical' },
              { id: '2', product: 'S40 Italian Leather Lace Up', variant: 'Brown', stock: 12, daysRemaining: 8, reorderQty: 50, status: 'critical' },
              { id: '3', product: 'Supergel Pro Gloves', variant: 'Blue', stock: 8, daysRemaining: 12, reorderQty: 75, status: 'high' },
              { id: '4', product: 'Fundamental 2.0 Shorts', variant: 'Black', stock: 45, daysRemaining: 35, reorderQty: 100, status: 'medium' },
              { id: '5', product: 'Superare Hand Wraps', variant: 'White', stock: 67, daysRemaining: 42, reorderQty: 200, status: 'medium' },
              { id: '6', product: 'Boxing Club NYC Tee', variant: 'Red', stock: 89, daysRemaining: 58, reorderQty: 300, status: 'medium' },
            ])
            setDeadItems([
              { id: '1', product: 'Legacy Tee', units: 156, daysStagnant: 127, idleValue: 5928, recommendation: 'Flash Sale' },
              { id: '2', product: 'One Series No Foul Protector', units: 34, daysStagnant: 127, idleValue: 3026, recommendation: 'Bundle' },
            ])
            setLoading(false)
          }, 300)
        } else {
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        if (isDemoMode) {
          setTimeout(() => {
            setItems([
              { id: '1', product: 'Supergel V Gloves', variant: 'Black', stock: 5, daysRemaining: 3, reorderQty: 100, status: 'critical' },
              { id: '2', product: 'S40 Italian Leather Lace Up', variant: 'Brown', stock: 12, daysRemaining: 8, reorderQty: 50, status: 'critical' },
              { id: '3', product: 'Supergel Pro Gloves', variant: 'Blue', stock: 8, daysRemaining: 12, reorderQty: 75, status: 'high' },
              { id: '4', product: 'Fundamental 2.0 Shorts', variant: 'Black', stock: 45, daysRemaining: 35, reorderQty: 100, status: 'medium' },
              { id: '5', product: 'Superare Hand Wraps', variant: 'White', stock: 67, daysRemaining: 42, reorderQty: 200, status: 'medium' },
              { id: '6', product: 'Boxing Club NYC Tee', variant: 'Red', stock: 89, daysRemaining: 58, reorderQty: 300, status: 'medium' },
            ])
            setDeadItems([
              { id: '1', product: 'Legacy Tee', units: 156, daysStagnant: 127, idleValue: 5928, recommendation: 'Flash Sale' },
              { id: '2', product: 'One Series No Foul Protector', units: 34, daysStagnant: 127, idleValue: 3026, recommendation: 'Bundle' },
            ])
            setLoading(false)
          }, 300)
        } else {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [])

  const summary = {
    critical: alerts.filter(a => a.severity === 'critical').length || 2,
    high: alerts.filter(a => a.severity === 'high').length || 2,
    medium: alerts.filter(a => a.severity === 'medium').length || 2,
    overstock: 3,
  }

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical': return 'bg-critical text-white'
      case 'high': return 'bg-danger text-white'
      case 'medium': return 'bg-warning text-white'
      case 'low': return 'bg-blue-500 text-white'
    }
  }

  const getRecommendationColor = (rec: DeadItem['recommendation']) => {
    switch (rec) {
      case 'Flash Sale': return 'bg-amber-100 text-amber-800'
      case 'Bundle': return 'bg-blue-100 text-blue-800'
      case 'Discontinue': return 'bg-red-100 text-red-800'
    }
  }

  const filteredItems = filter === 'all' ? items : items.filter(i => i.status === filter)

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
          <p className="text-gray-500 mt-1">Monitor stock levels and dead inventory</p>
        </div>
        <div className="text-sm text-gray-500">Last scan: Today at 2:30 PM</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-critical/10 rounded-xl p-4 border border-critical/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-critical/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-critical">{summary.critical}</p>
              <p className="text-sm text-gray-500">CRITICAL items</p>
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
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{summary.overstock}</p>
              <p className="text-sm text-gray-500">OVERSTOCK items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
          <div className="flex items-center gap-2">
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
              <option value="overstock">Overstock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Variant</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Stock</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Days Left</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Reorder Qty</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(alerts.length > 0 ? alerts : filteredItems).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    {item.severity ? (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        item.severity === 'critical' ? 'bg-critical text-white' :
                        item.severity === 'high' ? 'bg-danger text-white' :
                        item.severity === 'medium' ? 'bg-warning text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {(item.severity || item.status).toUpperCase()}
                      </span>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-900">{item.product_name || item.product}</td>
                  <td className="py-4 px-4 text-gray-600">{item.variant || '-'}</td>
                  <td className="py-4 px-4 text-center font-medium text-gray-900">{item.value || item.stock}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-medium ${
                      (item.daysRemaining || 0) < 30
                        ? 'text-danger'
                        : (item.daysRemaining || 0) < 60
                        ? 'text-warning'
                        : 'text-success'
                    }`}>
                      {item.daysRemaining || '-'} days
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-medium text-gray-900">{item.reorderQty || '-'}</td>
                  <td className="py-4 px-4 text-center">
                    <button className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                      Create PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Dead Inventory Alert</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Product</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Units</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Days Stagnant</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Idle Value</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-500">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deadItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{item.product}</td>
                  <td className="py-4 px-4 text-center text-gray-600">{item.units}</td>
                  <td className="py-4 px-4 text-center text-gray-600">{item.daysStagnant} days</td>
                  <td className="py-4 px-4 text-right font-medium text-danger">${item.idleValue.toLocaleString()}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(item.recommendation)}`}>
                      {item.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}