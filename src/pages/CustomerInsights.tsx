import { useState, useEffect } from 'react'
import { Crown, TrendingUp, AlertTriangle, Users, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { RFMSegment } from '../lib/types'
import { supabase, isDemoMode } from '../lib/supabase'

const mockSegments: RFMSegment[] = [
  {
    segment: 'Champions',
    count: 156,
    revenuePercentage: 32.5,
    avgLTV: 2840,
    color: '#10B981',
  },
  {
    segment: 'Loyal',
    count: 289,
    revenuePercentage: 28.2,
    avgLTV: 1680,
    color: '#3B82F6',
  },
  {
    segment: 'At-Risk',
    count: 234,
    revenuePercentage: 18.7,
    avgLTV: 920,
    color: '#F59E0B',
  },
  {
    segment: 'Lost',
    count: 187,
    revenuePercentage: 12.3,
    avgLTV: 340,
    color: '#EF4444',
  },
  {
    segment: 'New',
    count: 423,
    revenuePercentage: 5.8,
    avgLTV: 280,
    color: '#8B5CF6',
  },
  {
    segment: 'One-Time',
    count: 192,
    revenuePercentage: 2.5,
    avgLTV: 120,
    color: '#6B7280',
  },
]

const mockTopCustomers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    totalOrders: 47,
    lifetimeValue: 4280,
    lastOrder: '2026-04-24',
    segment: 'Champions',
  },
  {
    name: 'Michael Chen',
    email: 'm.chen@email.com',
    totalOrders: 38,
    lifetimeValue: 3920,
    lastOrder: '2026-04-23',
    segment: 'Champions',
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    totalOrders: 32,
    lifetimeValue: 2840,
    lastOrder: '2026-04-25',
    segment: 'Loyal',
  },
  {
    name: 'David Kim',
    email: 'david.k@email.com',
    totalOrders: 28,
    lifetimeValue: 2150,
    lastOrder: '2026-04-20',
    segment: 'Loyal',
  },
  {
    name: 'Jessica Williams',
    email: 'jessica.w@email.com',
    totalOrders: 24,
    lifetimeValue: 1890,
    lastOrder: '2026-04-18',
    segment: 'At-Risk',
  },
]

const mockCohortData: { month: string; new: number; returning: number }[] = [
  { month: 'Dec 2025', new: 245, returning: 189 },
  { month: 'Jan 2026', new: 312, returning: 234 },
  { month: 'Feb 2026', new: 278, returning: 267 },
  { month: 'Mar 2026', new: 356, returning: 298 },
  { month: 'Apr 2026', new: 289, returning: 412 },
]

const getSegmentColor = (segment: string) => {
  const seg = mockSegments.find(s => s.segment === segment)
  return seg ? seg.color : '#6B7280'
}

export default function CustomerInsights() {
  const [segments, setSegments] = useState<RFMSegment[]>(mockSegments)
  const [customers, setCustomers] = useState<any[]>(mockTopCustomers)
  const [cohortData, setCohortData] = useState<{ month: string; new: number; returning: number }[]>(mockCohortData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: storeData, error: storeError } = await supabase
          .from('stores').select('id').limit(1).single()
        if (storeError) throw storeError
        const currentStoreId = storeData?.id

        // Fetch customer segments
        const { data: segmentsData } = await supabase
          .from('customer_segments')
          .select('*')
          .eq('store_id', currentStoreId)
          .order('avg_ltv', { ascending: false })

        if (segmentsData && segmentsData.length > 0) {
          setSegments(segmentsData)
        }

        // Fetch customers
        const { data: customersData } = await supabase
          .from('customers')
          .select('*')
          .eq('store_id', currentStoreId)
          .order('lifetime_value', { ascending: false })
          .limit(5)

        if (customersData && customersData.length > 0) {
          setCustomers(customersData)
        }

        // Fetch cohort data
        const { data: cohortData } = await supabase
          .from('cohort_data')
          .select('*')
          .eq('store_id', currentStoreId)
          .order('month')

        if (cohortData && cohortData.length > 0) {
          setCohortData(cohortData)
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Insights</h1>
        <p className="text-gray-500 mt-1">Understand your customer segments and behavior patterns</p>
      </div>

      {/* At-Risk Alert Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-amber-800">Customer Churn Risk Detected</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              <AlertTriangle className="w-3 h-3" />
              High Priority
            </span>
          </div>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-amber-900 tabular-nums">234 customers</span> are showing at-risk behavior — last purchase was 60-90 days ago.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Estimated recoverable revenue: <span className="font-semibold text-warning tabular-nums">$15,420</span>
          </p>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 transition-colors">
            <Download className="w-4 h-4" />
            Export At-Risk List
          </button>
        </div>
      </div>

      {/* Segment Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {mockSegments.map((segment) => (
          <div key={segment.segment} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-3 h-3 rounded-full ring-2 ring-offset-1" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="font-semibold text-gray-900 text-sm">{segment.segment}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Customers</span>
                <span className="font-semibold text-gray-900 tabular-nums">{segment.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">% of Revenue</span>
                <span className="font-semibold text-gray-900 tabular-nums">{segment.revenuePercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Avg LTV</span>
                <span className="font-semibold text-gray-900 tabular-nums">${segment.avgLTV.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Top Customers by Lifetime Value</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Orders</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lifetime Value</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Order</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockTopCustomers.map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-gray-500 text-sm">{customer.email}</td>
                  <td className="py-3.5 px-5 text-right font-medium text-gray-900 text-sm tabular-nums">{customer.totalOrders}</td>
                  <td className="py-3.5 px-5 text-right font-semibold text-gray-900 text-sm tabular-nums">
                    ${customer.lifetimeValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 text-right text-gray-500 text-sm tabular-nums">
                    {new Date(customer.lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-5">
                    <span 
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: `${getSegmentColor(customer.segment)}15`,
                        color: getSegmentColor(customer.segment)
                      }}
                    >
                      {customer.segment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Month by Month Cohort Analysis</h2>
        </div>
        <div className="flex items-center justify-center h-72 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-gray-400 font-medium">Interactive cohort chart visualization</p>
            <p className="text-sm text-gray-300 mt-1.5">New vs Returning customers by month ({cohortData.length} months)</p>
          </div>
        </div>
      </div>
    </div>
  )
}