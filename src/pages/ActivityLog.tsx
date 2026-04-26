import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import ActivityFeed from '../components/ActivityFeed'
import type { ActivityLog } from '../lib/types'

const mockActivities: ActivityLog[] = [
  {
    id: '1',
    store_id: '1',
    action: 'Generated Sales Velocity Report',
    summary: 'Analyzed 1,247 products for velocity trends and identified top performers',
    details: 'Report covered March 1-31, 2026. Top product: Premium Wireless Headphones with 1,247 units sold. Identified 3 products needing immediate restock. Analysis took 2.3 seconds to complete.',
    status: 'success',
    created_at: '2026-04-26T10:30:00Z',
  },
  {
    id: '2',
    store_id: '1',
    action: 'Updated Reorder Alerts',
    summary: 'Scanned inventory levels and generated 23 reorder alerts',
    details: 'Critical alerts: Premium Wireless Headphones (5 units), iPhone 15 Pro Case (12 units). Auto-generated purchase orders for 15 items. Sent notifications to procurement team.',
    status: 'success',
    created_at: '2026-04-26T09:15:00Z',
  },
  {
    id: '3',
    store_id: '1',
    action: 'Customer Segmentation Analysis',
    summary: 'Updated RFM segments for 3,421 customers',
    details: '156 customers moved to Champions segment. 89 customers flagged as At-Risk. New customers in system: 423. Average LTV increased 12% compared to last quarter.',
    status: 'success',
    created_at: '2026-04-25T16:45:00Z',
  },
  {
    id: '4',
    store_id: '1',
    action: 'Refund Pattern Detection',
    summary: 'Detected unusual refund spike in Fashion category',
    details: 'Fashion category refunds up 18% vs 30-day average. Primary cause: sizing issues with Denim Jacket (size M). Recommend updating size chart and adding fit guidance.',
    status: 'error',
    created_at: '2026-04-25T14:20:00Z',
  },
  {
    id: '5',
    store_id: '1',
    action: 'Discount Performance Analysis',
    summary: 'Analyzed Q1 discount campaigns and ROI',
    details: 'BOGO promotions showing best ROI at 4.3x. Free shipping threshold at 6.6x ROI. Percentage discounts overused in electronics (-8% margin impact). Recommendation: Shift discount strategy.',
    status: 'success',
    created_at: '2026-04-25T11:30:00Z',
  },
  {
    id: '6',
    store_id: '1',
    action: 'Dead Inventory Report Generated',
    summary: 'Identified $8,940 in dead stock across 234 units',
    details: 'Top dead items: Vintage Bluetooth Speaker (34 units, 127 days), Old Model Phone Cases (78 units, 98 days). Recommended actions: Flash sale (50% off), bundle promotions, discontinue obsolete items.',
    status: 'warning',
    created_at: '2026-04-24T15:45:00Z',
  },
  {
    id: '7',
    store_id: '1',
    action: 'Cohort Analysis Completed',
    summary: 'Analyzed customer retention across 6-month cohorts',
    details: 'January 2026 cohort showing strongest retention (72% month 1). Mobile app users demonstrate 23% higher retention rate. Recommend expanding mobile app promotion campaigns.',
    status: 'success',
    created_at: '2026-04-24T09:20:00Z',
  },
  {
    id: '8',
    store_id: '1',
    action: 'Automated Reorder Processing',
    summary: 'Processed 47 purchase orders through supplier API',
    details: 'Successfully submitted 47 POs to suppliers. Total value: $127,450. Expected delivery: 5-7 business days. 3 orders failed (TechCorp API timeout) - flagged for manual review.',
    status: 'warning',
    created_at: '2026-04-23T16:30:00Z',
  },
  {
    id: '9',
    store_id: '1',
    action: 'Customer LTV Recalculation',
    summary: 'Updated lifetime value metrics for all customers',
    details: 'Champions segment LTV increased to $2,840 avg. At-Risk segment: 234 customers identified with estimated recoverable revenue of $15,420. New customer acquisition up 61% QoQ.',
    status: 'success',
    created_at: '2026-04-23T14:15:00Z',
  },
  {
    id: '10',
    store_id: '1',
    action: 'Inventory Sync Completed',
    summary: 'Synced 2,847 product variants with Shopify',
    details: 'Updated stock levels across all channels. Resolved 12 sync conflicts. Detected 56 discrepancies between local and Shopify inventory - flagged for review. Sync duration: 4.2 minutes.',
    status: 'success',
    created_at: '2026-04-23T08:45:00Z',
  },
  {
    id: '11',
    store_id: '1',
    action: 'Email Campaign Performance Review',
    summary: 'Analyzed Q1 email campaign performance metrics',
    details: 'Open rate: 34.2% (industry avg: 21.5%). Click-through rate: 8.7%. Revenue generated: $89,450. Best performing campaign: Spring Collection Launch (42% open rate). Recommend testing new subject line formats.',
    status: 'success',
    created_at: '2026-04-22T13:20:00Z',
  },
  {
    id: '12',
    store_id: '1',
    action: 'Supplier Price Update Processed',
    summary: 'Updated pricing for 156 products from 8 suppliers',
    details: 'Average price change: +3.2%. 23 products with significant increases (>10%) flagged for margin review. Auto-adjusted retail prices for 134 products. 22 products require manual review due to contract terms.',
    status: 'warning',
    created_at: '2026-04-22T11:00:00Z',
  },
  {
    id: '13',
    store_id: '1',
    action: 'Abandoned Cart Recovery Campaign',
    summary: 'Sent recovery emails to 847 abandoned carts',
    details: 'Recovery rate: 12.4% ($15,230 recovered). Average order value of recovered carts: $182. Best performing email template: Urgency + Social Proof (18% recovery rate). Recommend increasing email frequency.',
    status: 'success',
    created_at: '2026-04-21T17:30:00Z',
  },
  {
    id: '14',
    store_id: '1',
    action: 'Product Description Optimization',
    summary: 'Updated SEO and descriptions for 234 products',
    details: 'Improved keyword density by 23%. Added customer review snippets to 156 products. Generated unique meta descriptions. Expected traffic increase: 15-20% based on similar optimizations in past.',
    status: 'success',
    created_at: '2026-04-21T10:15:00Z',
  },
  {
    id: '15',
    store_id: '1',
    action: 'Returns Analysis Report',
    summary: 'Analyzed return patterns and reasons for Q1',
    details: 'Overall return rate: 8.4% (up from 6.2% last quarter). Fashion category driving increase (14.2% return rate). Primary reasons: sizing (45%), quality issues (23%), not as described (18%). Action plan: enhanced sizing guides, quality control checkpoints.',
    status: 'error',
    created_at: '2026-04-20T14:45:00Z',
  },
  {
    id: '16',
    store_id: '1',
    action: 'Mobile App User Engagement Review',
    summary: 'Analyzed mobile app user behavior and engagement metrics',
    details: 'Daily active users: 1,247 (up 34% MoM). Average session duration: 4.2 minutes. Push notification open rate: 67%. In-app purchase conversion: 12.4%. Recommend: add wishlist feature, implement loyalty card scanning.',
    status: 'success',
    created_at: '2026-04-20T09:30:00Z',
  },
  {
    id: '17',
    store_id: '1',
    action: 'Competitor Price Monitoring',
    summary: 'Monitored pricing across 15 key competitors',
    details: '342 price changes detected this week. Our prices competitive on 78% of products. 23 products priced 5-10% above market - flagged for review. 12 products positioned as premium (+15-20% above market) - within acceptable range for brand positioning.',
    status: 'success',
    created_at: '2026-04-19T16:00:00Z',
  },
  {
    id: '18',
    store_id: '1',
    action: 'Content Marketing Performance Report',
    summary: 'Blog and content performance analysis for Q1',
    details: 'Total blog posts: 24. Average traffic per post: 1,240 visits. Conversion rate from content: 3.2%. Top performing topic: "Sustainable Fashion Trends" (5,670 visits, 89 conversions). Recommend: double down on sustainability content.',
    status: 'success',
    created_at: '2026-04-19T12:30:00Z',
  },
  {
    id: '19',
    store_id: '1',
    action: 'Seasonal Demand Forecast Updated',
    summary: 'Updated Q2 demand forecasts based on historical data',
    details: 'Expected Q2 revenue: $1.45M (up 18% YoY). Peak categories: Spring Fashion (+45%), Outdoor Living (+38%), Gardening (+42%). Recommend: Increase inventory allocation for seasonal categories by 25%.',
    status: 'success',
    created_at: '2026-04-18T15:20:00Z',
  },
  {
    id: '20',
    store_id: '1',
    action: 'Loyalty Program Member Analysis',
    summary: 'Analyzed loyalty program effectiveness and member behavior',
    details: 'Total members: 2,847. Active members (30-day purchase): 1,892 (66.5%). Average spend per member: $420 vs $180 for non-members. Tier distribution: Gold 12%, Silver 28%, Bronze 60%. ROI: 4.2x. Recommend: add diamond tier for top 5% customers.',
    status: 'success',
    created_at: '2026-04-18T10:45:00Z',
  },
]

const ITEMS_PER_PAGE = 20

export default function ActivityLog() {
  const [filter, setFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesFilter = filter === 'all' || activity.status === filter
    const matchesSearch = searchTerm === '' || 
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.summary.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of{' '}
              {filteredActivities.length} activities
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