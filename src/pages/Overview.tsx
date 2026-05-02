import { useState, useEffect, useCallback } from 'react'
import { ArrowUp, ArrowDown, AlertCircle, TrendingUp, Package, RefreshCw, Database, CheckCircle, ArrowRight, Activity } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import RevenueChart from '../components/Charts/RevenueChart'
import AlertBadge from '../components/AlertBadge'
import { ActivityLog } from '../lib/types'
import ActivityFeed from '../components/ActivityFeed'
import { Link } from 'react-router-dom'
import { supabase, isDemoMode } from '../lib/supabase'

const SYNC_API = 'https://jettmissioncontrol.com/api/storeiq-sync'

export default function Overview() {
  const [metrics, setMetrics] = useState({
    revenue_today: 0,
    orders_today: 0,
    revenue_7day: 0,
    orders_7day: 0,
    revenue_30day: 0,
    orders_30day: 0,
    top_product: 'Loading...',
    avg_order_value: 0,
    new_customers: 0,
    returning_customers: 0,
  })
  const [revenueData, setRevenueData] = useState([{ date: 'Loading...', revenue: 0 }])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [storeId, setStoreId] = useState<string>('')

  // Generate random demo metrics with slight variance
  const generateFreshDemo = useCallback(() => {
    const base = 42000 + Math.floor(Math.random() * 12000)
    const orders = Math.floor(base / 85) + Math.floor(Math.random() * 20)
    const weekMultiplier = 6.2 + Math.random() * 1.2
    const monthMultiplier = 27 + Math.random() * 4

    const demoProducts = [
      'Supergel V Gloves', 'Supergel Pro Gloves', 'World Champion Tee',
      'S40 Italian Leather Gloves', 'Superare Hand Wraps',
    ]
    const topProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)]

    setMetrics({
      revenue_today: base,
      orders_today: orders,
      revenue_7day: Math.round(base * weekMultiplier),
      orders_7day: Math.floor(orders * weekMultiplier * 0.9),
      revenue_30day: Math.round(base * monthMultiplier),
      orders_30day: Math.floor(orders * monthMultiplier * 0.95),
      top_product: topProduct,
      avg_order_value: 78 + Math.random() * 30,
      new_customers: Math.floor(Math.random() * 15) + 3,
      returning_customers: Math.floor(Math.random() * 30) + 10,
    })

    // Generate 30-day revenue curve
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const dayRevenue = base * (0.7 + Math.random() * 0.6) + (isWeekend ? 15000 : 0)
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(dayRevenue),
      })
    }
    setRevenueData(days)

    const alertTemplates = [
      { severity: 'critical' as const, title: 'Stockout Risk: Supergel V Gloves', desc: 'Only 5 pairs remaining. Projected stockout in 3 days.', product: 'Supergel V Gloves', val: 5 },
      { severity: 'high' as const, title: 'Dead Stock: Legacy Tee', desc: `${Math.floor(30 + Math.random() * 40)} units stagnant for 90+ days`, product: 'Legacy Tee', val: Math.floor(40 + Math.random() * 30) },
      { severity: 'medium' as const, title: 'High Return Rate: Leather Headgear', desc: 'Fit complaints up 18% this week', product: 'One Series Leather Headgear', val: 18 },
      { severity: 'low' as const, title: 'At-Risk: VIP Fighter Segment', desc: `${Math.floor(15 + Math.random() * 20)} professional fighters showing reduced engagement`, product: undefined, val: Math.floor(15 + Math.random() * 20) },
    ]
    setAlerts(alertTemplates.map((a, i) => ({
      id: `alert-${Date.now()}-${i}`, ...a, is_resolved: false,
    })))

    const actionTemplates = [
      { action: 'Generated Sales Velocity Report', summary: `Analyzed Superare inventory for velocity trends`, details: 'Boxing Gloves (+23%), Training Gear (+12%), Apparel (+8%)', status: 'success' as const },
      { action: 'Updated Reorder Alerts', summary: `Identified ${Math.floor(12 + Math.random() * 20)} products below reorder threshold`, details: 'Top priority: Supergel V Gloves', status: 'warning' as const },
      { action: 'Customer Segmentation Analysis', summary: `Updated RFM segments for ${Math.floor(3000 + Math.random() * 1000)} boxing customers`, details: 'Champions segment growing', status: 'success' as const },
      { action: 'Refreshed Overview Dashboard', summary: 'Pulled latest Shopify metrics for real-time view', details: 'All KPIs up to date', status: 'success' as const },
    ]
    setActivities(actionTemplates.map((a, i) => ({
      id: `act-${Date.now()}-${i}`, store_id: storeId, ...a, created_at: new Date().toISOString(),
    })))
  }, [storeId])

  const fetchData = useCallback(async () => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from('stores').select('id').limit(1).single()
      if (storeError) throw storeError
      const currentStoreId = storeData?.id
      setStoreId(currentStoreId)

      const { data: metricsData } = await supabase
        .from('metrics').select('*').eq('store_id', currentStoreId)
        .order('metric_date', { ascending: false }).limit(1).single()
      if (metricsData) {
        setMetrics({
          revenue_today: metricsData.revenue_today || 0,
          orders_today: metricsData.orders_today || 0,
          revenue_7day: metricsData.revenue_7day || 0,
          orders_7day: metricsData.orders_7day || 0,
          revenue_30day: metricsData.revenue_30day || 0,
          orders_30day: metricsData.orders_30day || 0,
          top_product: metricsData.top_product || 'N/A',
          avg_order_value: metricsData.avg_order_value || 0,
          new_customers: metricsData.new_customers || 0,
          returning_customers: metricsData.returning_customers || 0,
        })
      }

      const { data: revenueRaw } = await supabase
        .from('metrics').select('metric_date, revenue_today')
        .eq('store_id', currentStoreId).order('metric_date', { ascending: true }).limit(30)
      if (revenueRaw && revenueRaw.length > 0) {
        setRevenueData(revenueRaw.map(d => ({ date: d.metric_date, revenue: d.revenue_today || 0 })))
      }

      const { data: alertsData } = await supabase
        .from('alerts').select('*').eq('store_id', currentStoreId)
        .eq('is_acknowledged', false).order('created_at', { ascending: false })
      if (alertsData) setAlerts(alertsData)

      const { data: activityData } = await supabase
        .from('activity_log').select('*').eq('store_id', currentStoreId)
        .order('created_at', { ascending: false }).limit(5)
      if (activityData) setActivities(activityData)

      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    } catch (err: any) {
      console.error('Supabase fetch failed, using demo data:', err.message)
      // Fallback to demo data if Supabase is unavailable
      generateFreshDemo()
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    }
  }, [generateFreshDemo])

  // Initial load
  useEffect(() => {
    const doInit = async () => {
      await fetchData()
      setLoading(false)
    }
    doInit()
  }, [fetchData])

  // Demo mode fallback after initial load
  useEffect(() => {
    if (!loading && isDemoMode) {
      const timer = setTimeout(() => {
        if (activities.length === 0 && alerts.length === 0 && metrics.revenue_today === 0) {
          generateFreshDemo()
          setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, isDemoMode, activities.length, alerts.length, metrics.revenue_today, generateFreshDemo])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncMessage('Syncing from Shopify...')
    try {
      const res = await fetch(SYNC_API, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncMessage('Sync complete! Refreshing data...')
        await fetchData()
        setSyncMessage('Data updated!')
        setTimeout(() => setSyncMessage(null), 3000)
      } else {
        setSyncMessage(`Sync failed: ${data.error}`)
        setTimeout(() => setSyncMessage(null), 5000)
      }
    } catch (err: any) {
      setSyncMessage(`Connection error: ${err.message}`)
      setTimeout(() => setSyncMessage(null), 5000)
    }
    setIsSyncing(false)
  }

  const acknowledgeAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_acknowledged: true })
        .eq('id', id)
      if (!error) {
        setAlerts(alerts.filter(a => a.id !== id))
      }
    } catch (err) {
      // Fallback: just remove from local state
      setAlerts(alerts.filter(a => a.id !== id))
    }
  }
  const activeAlerts = alerts.filter(a => !a.is_acknowledged)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh + Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            {syncMessage ? (
              <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                <Database className="w-3.5 h-3.5 animate-pulse" />
                {syncMessage}
              </span>
            ) : lastUpdated ? (
              <span className="inline-flex items-center gap-1.5 text-gray-400">
                <span className="w-1.5 h-1.5 bg-success rounded-full" />
                Last updated: Today at {lastUpdated}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-gray-400">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse" />
                Loading data...
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm font-medium"
          >
            <Database className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isSyncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:bg-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Today's Revenue" value={`$${metrics.revenue_today.toLocaleString()}`}
          trend={{ value: 12, isUp: true }} prefix=""
          icon={<TrendingUp className="w-6 h-6 text-primary" />} />
        <MetricCard title="Orders Today" value={metrics.orders_today}
          trend={{ value: 8, isUp: true }} prefix=""
          icon={<Package className="w-6 h-6 text-primary" />} />
        <MetricCard title="Avg Order Value" value={`$${Number(metrics.avg_order_value).toFixed(2)}`}
          trend={{ value: 5, isUp: true }} prefix=""
          icon={<TrendingUp className="w-6 h-6 text-primary" />} />
        <MetricCard title="Active Alerts" value={activeAlerts.length}
          trend={{ value: 3, isUp: false }} prefix=""
          icon={<AlertCircle className="w-6 h-6 text-primary" />} />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Revenue Last 30 Days</h2>
          {lastUpdated && (
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              Refreshed {lastUpdated}
            </span>
          )}
        </div>
        <RevenueChart data={revenueData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
              {activeAlerts.length > 0 && (
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {activeAlerts.length} active
                </span>
              )}
            </div>
            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="group flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <AlertBadge severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
                      {alert.product_name && <span className="text-xs text-gray-400 truncate">({alert.product_name})</span>}
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{alert.description}</p>
                    <button onClick={() => acknowledgeAlert(alert.id)}
                      className="text-primary text-xs font-medium hover:text-primary/80 transition-colors">
                      Dismiss →
                    </button>
                  </div>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No active alerts</p>
                  <p className="text-gray-400 text-xs mt-1">Everything looks good</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            <ActivityFeed activities={activities} />
            {activities.length > 0 && (
              <Link to="/activity" className="group inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors mt-4">
                View all activity
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            {activities.length === 0 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No activity yet</p>
                <p className="text-gray-400 text-xs mt-1">Agent actions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
