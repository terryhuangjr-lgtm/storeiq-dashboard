import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import ActivityFeed from '../components/ActivityFeed'
import type { ActivityLog } from '../lib/types'
import { supabase, isDemoMode } from '../lib/supabase'

const ITEMS_PER_PAGE = 20

export default function ActivityLog() {
  const [filter, setFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: storeData, error: storeError } = await supabase
          .from('stores').select('id').limit(1).single()
        if (storeError) throw storeError
        const currentStoreId = storeData?.id

        let query = supabase
          .from('activity_log').select('*', { count: 'exact' })
          .eq('store_id', currentStoreId)
          .order('created_at', { ascending: false })

        if (filter !== 'all') {
          query = query.eq('status', filter)
        }

        const { count, error: countError } = await query
        if (countError) throw countError
        setTotalCount(count || 0)

        const from = (currentPage - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1
        query = query.range(from, to)

        const { data, error } = await query
        if (error) throw error

        if (data && data.length > 0) {
          setActivities(data)
        } else if (isDemoMode) {
          setActivities(getDemoActivities())
          setTotalCount(getDemoActivities().length)
        }
      } catch (err: any) {
        console.error('Error fetching activities:', err)
        if (isDemoMode) {
          setActivities(getDemoActivities())
          setTotalCount(getDemoActivities().length)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [filter, currentPage])

  const getDemoActivities = (): ActivityLog[] => [
    {
      id: '1', store_id: '1',
      action: 'Generated Sales Velocity Report',
      summary: 'Analyzed 234 Superare fight gear products for velocity trends',
      details: 'Top categories: Boxing Gloves (+23%), Training Gear (+12%), Apparel (+8%)',
      status: 'success', created_at: '2026-04-26T10:30:00Z',
    },
    {
      id: '2', store_id: '1',
      action: 'Updated Reorder Alerts',
      summary: 'Identified 23 fight gear products below reorder threshold',
      details: 'Top priority: Supergel V Gloves (5 pairs remaining)',
      status: 'warning', created_at: '2026-04-26T09:15:00Z',
    },
    {
      id: '3', store_id: '1',
      action: 'Customer Segmentation Analysis',
      summary: 'Updated RFM segments for 3,421 boxing customers',
      details: '156 professional fighters moved to Champions segment',
      status: 'success', created_at: '2026-04-25T16:45:00Z',
    },
    {
      id: '4', store_id: '1',
      action: 'Refund Pattern Detection',
      summary: 'Detected unusual refund spike in Boxing Gloves category',
      details: '12% increase vs. 30-day average. Sizing issues with leather gloves.',
      status: 'error', created_at: '2026-04-25T14:20:00Z',
    },
    {
      id: '5', store_id: '1',
      action: 'Generated Dead Inventory Report',
      summary: 'Identified $8,940 in stagnant fight gear inventory',
      details: '47 products stagnant for 90+ days. Flash sale recommended for Legacy collection.',
      status: 'success', created_at: '2026-04-24T15:45:00Z',
    },
    {
      id: '6', store_id: '1',
      action: 'Processed Automated Reorders',
      summary: 'Submitted 15 purchase orders for fight gear to suppliers',
      details: 'Total value: $45,670. Expected delivery: 5-7 business days.',
      status: 'success', created_at: '2026-04-24T11:30:00Z',
    },
    {
      id: '7', store_id: '1',
      action: 'Discount Performance Analysis',
      summary: 'Analyzed Q1 discount campaigns for boxing equipment',
      details: 'BOGO promotions showing 4.3x ROI on glove bundles. Recommend strategy shift.',
      status: 'success', created_at: '2026-04-23T14:00:00Z',
    },
    {
      id: '8', store_id: '1',
      action: 'Mobile App User Review',
      summary: 'Analyzed mobile engagement for Superare app users',
      details: 'DAU up 34% MoM. Push notification open rate: 67%.',
      status: 'success', created_at: '2026-04-23T10:30:00Z',
    },
    {
      id: '9', store_id: '1',
      action: 'Competitor Price Monitoring',
      summary: 'Checked pricing across 15 fight gear competitors',
      details: '342 price changes detected. 78% of Superare products competitively priced.',
      status: 'success', created_at: '2026-04-22T16:00:00Z',
    },
    {
      id: '10', store_id: '1',
      action: 'Email Campaign Performance',
      summary: 'Q1 email marketing analysis for boxing community',
      details: 'Open rate: 34.2%. Revenue generated: $89,450. Top: Championship Collection launch.',
      status: 'success', created_at: '2026-04-22T12:30:00Z',
    },
    {
      id: '11', store_id: '1',
      action: 'Returns Analysis Complete',
      summary: 'Q1 return patterns analyzed for fight gear',
      details: 'Leather headgear return rate: 8.2%. Enhanced sizing guides recommended.',
      status: 'error', created_at: '2026-04-21T17:45:00Z',
    },
    {
      id: '12', store_id: '1',
      action: 'Loyalty Program Review',
      summary: 'Analyzed 2,847 Superare Fight Club members',
      details: 'Active members: 66.5%. ROI: 4.2x. Diamond tier recommended for pros.',
      status: 'success', created_at: '2026-04-21T10:15:00Z',
    },
    {
      id: '13', store_id: '1',
      action: 'Seasonal Forecast Updated',
      summary: 'Q2 demand forecast for boxing equipment generated',
      details: 'Expected revenue: $1.45M. Training gear (+45%) leading growth.',
      status: 'success', created_at: '2026-04-20T15:20:00Z',
    },
    {
      id: '14', store_id: '1',
      action: 'Content Marketing Review',
      summary: 'Q1 blog performance for fight gear content',
      details: '24 posts generated 30,000+ visits. Technique guides performing best.',
      status: 'success', created_at: '2026-04-20T09:30:00Z',
    },
    {
      id: '15', store_id: '1',
      action: 'Abandoned Cart Recovery',
      summary: 'Sent recovery emails for 847 abandoned boxing gear carts',
      details: 'Recovery rate: 12.4%. $15,230 recovered. Recommend frequency increase.',
      status: 'success', created_at: '2026-04-19T17:30:00Z',
    },
    {
      id: '16', store_id: '1',
      action: 'Supplier Price Updates',
      summary: 'Updated pricing for 156 fight gear products',
      details: 'Average increase: 3.2%. 23 leather glove products flagged for margin review.',
      status: 'warning', created_at: '2026-04-19T14:00:00Z',
    },
    {
      id: '17', store_id: '1',
      action: 'Inventory Sync Completed',
      summary: 'Synced 2,847 Superare products with Shopify',
      details: '56 discrepancies detected. 12 sync conflicts resolved.',
      status: 'success', created_at: '2026-04-18T16:30:00Z',
    },
    {
      id: '18', store_id: '1',
      action: 'Customer LTV Recalculation',
      summary: 'Updated lifetime value for boxing customer segments',
      details: 'Champions avg LTV: $2,840. At-Risk recoverable: $15,420.',
      status: 'success', created_at: '2026-04-18T10:45:00Z',
    },
    {
      id: '19', store_id: '1',
      action: 'Product Description Updates',
      summary: 'Optimized 234 fight gear product descriptions',
      details: 'SEO improvements: +23% keyword density. Expected traffic: +18%.',
      status: 'success', created_at: '2026-04-17T11:15:00Z',
    },
    {
      id: '20', store_id: '1',
      action: 'Generated Cohort Analysis',
      summary: 'Multi-month cohort retention for boxing customers',
      details: 'January cohort: 72% month-1 retention. Mobile users: +23% retention.',
      status: 'success', created_at: '2026-04-15T14:20:00Z',
    },
  ]

  const filteredActivities = activities.filter(activity => {
    if (searchTerm === '') return true
    return (
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.summary.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
        <h1 className="text-2xl font-bold text-gray-900">Agent Activity Log</h1>
        <p className="text-gray-500 mt-1">Every action Hermes has taken for your store</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <ActivityFeed activities={paginatedActivities} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} activities
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}