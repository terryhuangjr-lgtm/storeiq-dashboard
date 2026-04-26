import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, AlertCircle, TrendingUp, Package, Users } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import RevenueChart from '../components/Charts/RevenueChart'
import AlertBadge from '../components/AlertBadge'
import { ActivityLog } from '../lib/types'
import ActivityFeed from '../components/ActivityFeed'
import { supabase, isDemoMode } from '../lib/supabase'

export default function Overview() {
  const [metrics, setMetrics] = useState({
    revenue_today: 45230,
    orders_today: 127,
    revenue_7day: 298540,
    orders_7day: 892,
    revenue_30day: 1245670,
    orders_30day: 3421,
    top_product: 'Premium Wireless Headphones',
    avg_order_value: 89.50,
    new_customers: 45,
    returning_customers: 218,
  })

  const [revenueData, setRevenueData] = useState([
    { date: 'Apr 1', revenue: 32450 },
    { date: 'Apr 4', revenue: 41230 },
    { date: 'Apr 7', revenue: 38920 },
    { date: 'Apr 10', revenue: 45670 },
    { date: 'Apr 13', revenue: 42180 },
    { date: 'Apr 16', revenue: 48950 },
    { date: 'Apr 19', revenue: 52340 },
    { date: 'Apr 22', revenue: 47820 },
    { date: 'Apr 25', revenue: 51230 },
  ])

  const [activities, setActivities] = useState<ActivityLog[]>([
    {
      id: '1',
      store_id: '1',
      action: 'Generated Sales Velocity Report',
      summary: 'Analyzed 234 Superare fight gear products for velocity trends',
      details: 'Top categories: Boxing Gloves (+23%), Training Gear (+12%), Apparel (+8%)',
      status: 'success',
      created_at: '2026-04-26T10:30:00Z',
    },
    {
      id: '2',
      store_id: '1',
      action: 'Updated Reorder Alerts',
      summary: 'Identified 23 fight gear products below reorder threshold',
      details: 'Top priority: Supergel V Gloves (5 pairs remaining)',
      status: 'warning',
      created_at: '2026-04-26T09:15:00Z',
    },
    {
      id: '3',
      store_id: '1',
      action: 'Customer Segmentation Analysis',
      summary: 'Updated RFM segments for 3,421 boxing customers',
      details: '156 professional fighters moved to Champions segment',
      status: 'success',
      created_at: '2026-04-25T16:45:00Z',
    },
    {
      id: '4',
      store_id: '1',
      action: 'Refund Pattern Detection',
      summary: 'Detected unusual refund spike in Boxing Gloves category',
      details: '12% increase vs. 30-day average. Sizing issues with leather gloves.',
      status: 'error',
      created_at: '2026-04-25T14:20:00Z',
    },
  ])

  const [alerts, setAlerts] = useState([
    {
      id: '1',
      severity: 'critical' as const,
      title: 'Stockout Risk: Supergel V Gloves',
      description: 'Only 5 pairs remaining. Projected stockout in 3 days.',
      product_name: 'Supergel V Gloves',
      value: 5,
      is_resolved: false,
    },
    {
      id: '2',
      severity: 'high' as const,
      title: 'Dead Stock: Legacy Tee',
      description: '47 units stagnant for 90+ days',
      product_name: 'Legacy Tee',
      value: 47,
      is_resolved: false,
    },
    {
      id: '3',
      severity: 'medium' as const,
      title: 'High Return Rate: Leather Headgear',
      description: 'Fit complaints up 18% this week',
      product_name: 'One Series Leather Headgear',
      value: 18,
      is_resolved: false,
    },
    {
      id: '4',
      severity: 'low' as const,
      title: 'At-Risk: VIP Fighter Segment',
      description: '23 professional fighters showing reduced engagement',
      product_name: undefined,
      value: 23,
      is_resolved: false,
    },
  ])

  useEffect(() => {
    if (isDemoMode) {
      setMetrics({
        revenue_today: 45230,
        orders_today: 127,
        revenue_7day: 298540,
        orders_7day: 892,
        revenue_30day: 1245670,
        orders_30day: 3421,
        top_product: 'Supergel V Gloves',
        avg_order_value: 89.50,
        new_customers: 45,
        returning_customers: 218,
      })
    }
  }, [])

  const resolveAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_resolved: true } : a))
  }

  const activeAlerts = alerts.filter(a => !a.is_resolved)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Revenue"
          value={`$${metrics.revenue_today.toLocaleString()}`}
          trend={{ value: 12, isUp: true }}
          prefix="$"
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Orders Today"
          value={metrics.orders_today}
          trend={{ value: 8, isUp: true }}
          prefix=""
          icon={<Package className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Avg Order Value"
          value={metrics.avg_order_value}
          trend={{ value: 5, isUp: true }}
          prefix="$"
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
        />
        <MetricCard
          title="Active Alerts"
          value={activeAlerts.length}
          trend={{ value: 3, isUp: false }}
          prefix=""
          icon={<AlertCircle className="w-6 h-6 text-primary" />}
        />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Last 30 Days</h2>
        <RevenueChart data={revenueData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Alerts</h2>
            <div className="space-y-4">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <AlertBadge severity={alert.severity} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      {alert.product_name && (
                        <span className="text-sm text-gray-500">
                          ({alert.product_name})
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{alert.description}</p>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <p className="text-gray-500 text-center py-8">No active alerts</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <ActivityFeed activities={activities.slice(0, 5)} />
            <a href="/activity" className="text-primary text-sm font-medium hover:underline mt-4 inline-block">
              View all activity →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}