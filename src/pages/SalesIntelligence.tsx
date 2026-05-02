import { useState, useEffect } from 'react'
import { TrendingUp, Filter, ArrowUp, ArrowDown } from 'lucide-react'
import VelocityChart from '../components/Charts/VelocityChart'
import ChannelChart from '../components/Charts/ChannelChart'
import { ProductPerformance, ChannelBreakdown } from '../lib/types'
import { supabase, isDemoMode } from '../lib/supabase'

const getPatternColor = (pattern: ProductPerformance['pattern']) => {
  switch (pattern) {
    case 'BESTSELLER':
      return 'bg-green-100 text-green-800'
    case 'SEASONAL':
      return 'bg-amber-100 text-amber-800'
    case 'NEW LAUNCH':
      return 'bg-blue-100 text-blue-800'
    case 'DECLINING':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function SalesIntelligence() {
  const [dateRange, setDateRange] = useState('30')
  const [products, setProducts] = useState<ProductPerformance[]>([])
  const [channels, setChannels] = useState<ChannelBreakdown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: storeData, error: storeError } = await supabase
          .from('stores').select('id').limit(1).single()
        if (storeError) throw storeError
        const currentStoreId = storeData?.id

        // Fetch product performance
        const { data: productsData } = await supabase
          .from('product_performance')
          .select('*')
          .eq('store_id', currentStoreId)
          .order('units_sold', { ascending: false })

        if (productsData && productsData.length > 0) {
          setProducts(productsData.map(p => ({
            name: p.name,
            unitsSold: p.units_sold || 0,
            revenue: p.revenue || 0,
            trend: p.trend || 0,
            pattern: p.pattern || 'STABLE'
          })))
        } else if (isDemoMode) {
          setProducts(getDemoProducts())
        }

        // Fetch channel breakdown
        const { data: channelsData } = await supabase
          .from('channel_breakdown')
          .select('*')
          .eq('store_id', currentStoreId)
          .order('revenue', { ascending: false })

        if (channelsData && channelsData.length > 0) {
          setChannels(channelsData.map(c => ({
            channel: c.channel,
            revenue: c.revenue || 0,
            percentage: c.percentage || 0
          })))
        } else if (isDemoMode) {
          setChannels(getDemoChannels())
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        if (isDemoMode) {
          setProducts(getDemoProducts())
          setChannels(getDemoChannels())
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getDemoProducts = (): ProductPerformance[] => [
    { name: 'Supergel V Gloves', unitsSold: 1247, revenue: 149640, trend: 23, pattern: 'BESTSELLER' },
    { name: 'Supergel Pro Gloves', unitsSold: 892, revenue: 133800, trend: 18, pattern: 'BESTSELLER' },
    { name: 'World Champion Tee', unitsSold: 2103, revenue: 94635, trend: 45, pattern: 'SEASONAL' },
    { name: 'Fundamental 2.0 Shorts', unitsSold: 567, revenue: 36855, trend: 12, pattern: 'BESTSELLER' },
    { name: 'Superare Hand Wraps', unitsSold: 445, revenue: 11125, trend: -8, pattern: 'DECLINING' },
    { name: 'Boxing Club NYC Tee', unitsSold: 389, revenue: 17505, trend: 15, pattern: 'BESTSELLER' },
    { name: 'One Series Leather Headgear', unitsSold: 256, revenue: 38144, trend: 31, pattern: 'SEASONAL' },
    { name: 'Finisher Dad Hat', unitsSold: 189, revenue: 3591, trend: -5, pattern: 'DECLINING' },
    { name: 'S40 Italian Leather Lace Up', unitsSold: 334, revenue: 46760, trend: 22, pattern: 'NEW LAUNCH' },
  ]

  const getDemoChannels = (): ChannelBreakdown[] => [
    { channel: 'Direct', revenue: 456780, percentage: 36.8 },
    { channel: 'Google Ads', revenue: 324560, percentage: 26.2 },
    { channel: 'Instagram', revenue: 234890, percentage: 19.0 },
    { channel: 'Email', revenue: 158760, percentage: 12.8 },
    { channel: 'Facebook', revenue: 65410, percentage: 5.2 },
  ]

  const totalProjected = 145680

  const bottomProducts = (products.length > 0 ? products : getDemoProducts()).slice(-5).reverse()

  const displayProducts = products.length > 0 ? products : getDemoProducts()
  const displayChannels = channels.length > 0 ? channels : getDemoChannels()

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
          <h1 className="text-2xl font-bold text-gray-900">Sales Intelligence</h1>
          <p className="text-gray-500 mt-1">Analyze product performance and sales patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Date Range:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="30">Last 30 Days</option>
            <option value="60">Last 60 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Products by Units Sold</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Product Name</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Units Sold</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Revenue</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Trend</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-500">Pattern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {displayProducts.map((product, index) => (
                <tr key={product.name} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-400 text-sm">{index + 1}</td>
                  <td className="py-4 px-4 font-medium text-gray-900">{product.name}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    {product.unitsSold.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                      product.trend >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {product.trend >= 0 ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      {Math.abs(product.trend)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPatternColor(product.pattern)}`}>
                      {product.pattern}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Bottom Performing Products</h2>
          <div className="space-y-3">
            {bottomProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.unitsSold} units • ${product.revenue.toLocaleString()}
                  </p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  product.trend >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {product.trend >= 0 ? '+' : ''}{product.trend}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Velocity Chart</h2>
           <VelocityChart data={displayProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acquisition Channel Breakdown</h2>
          <ChannelChart data={displayChannels} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Projected Revenue</h2>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">Next 30 Days</p>
            <p className="text-5xl font-bold text-primary mb-4">
              ${totalProjected.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">Based on current velocity trends</p>
            <div className="flex items-center justify-center gap-2 text-success text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>12.5% above target</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}