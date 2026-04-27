import { useState, useEffect } from 'react'
import { Crown, TrendingUp, AlertTriangle, Users, ArrowUp, ArrowDown } from 'lucide-react'
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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-warning mb-2">⚠️ Customer Churn Risk</h3>
          <p className="text-gray-700 mb-3">
            <span className="font-medium">234 customers</span> are showing at-risk behavior — last purchase was 60-90 days ago.
          </p>
          <p className="text-gray-600 text-sm mb-4">
            Estimated recoverable revenue: <span className="font-semibold text-warning">$15,420</span>
          </p>
          <button className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors">
            Export List
          </button>
        </div>
      </div>

      {/* Segment Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {mockSegments.map((segment) => (
          <div key={segment.segment} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="font-medium text-gray-900 text-sm">{segment.segment}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Customers</span>
                <span className="font-semibold text-gray-900">{segment.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">% of Revenue</span>
                <span className="font-semibold text-gray-900">{segment.revenuePercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Avg LTV</span>
                <span className="font-semibold text-gray-900">${segment.avgLTV.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Customers by Lifetime Value</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Email</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Total Orders</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Lifetime Value</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Last Order</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTopCustomers.map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{customer.name}</td>
                  <td className="py-4 px-4 text-gray-600">{customer.email}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">{customer.totalOrders}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    ${customer.lifetimeValue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getSegmentColor(customer.segment)}20`,
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Month by Month Cohort Analysis</h2>
        <div className="flex items-center justify-center h-80 text-gray-400">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Interactive cohort chart visualization</p>
            <p className="text-sm mt-2">New vs Returning customers by month ({cohortData.length} months)</p>
          </div>
        </div>
      </div>
    </div>
  )
}