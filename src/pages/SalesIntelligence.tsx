import { useState } from 'react'
import { TrendingUp, Filter, ArrowUp, ArrowDown } from 'lucide-react'
import VelocityChart from '../components/Charts/VelocityChart'
import ChannelChart from '../components/Charts/ChannelChart'
import { ProductPerformance, ChannelBreakdown } from '../lib/types'

const mockProducts: ProductPerformance[] = [
  { name: 'Premium Wireless Headphones', unitsSold: 1247, revenue: 149640, trend: 23, pattern: 'BESTSELLER' },
  { name: 'Smart Watch Series 5', unitsSold: 892, revenue: 133800, trend: 18, pattern: 'BESTSELLER' },
  { name: 'iPhone 15 Pro Case', unitsSold: 2103, revenue: 63090, trend: 45, pattern: 'SEASONAL' },
  { name: 'Laptop Stand Adjustable', unitsSold: 567, revenue: 28350, trend: 12, pattern: 'NEW LAUNCH' },
  { name: 'Wireless Charger Pad', unitsSold: 445, revenue: 22250, trend: -8, pattern: 'DECLINING' },
  { name: 'Bluetooth Earbuds Pro', unitsSold: 389, revenue: 38900, trend: 15, pattern: 'BESTSELLER' },
  { name: 'USB-C Hub 7-in-1', unitsSold: 334, revenue: 20040, trend: 22, pattern: 'NEW LAUNCH' },
  { name: 'Phone Camera Lens Kit', unitsSold: 278, revenue: 16680, trend: -5, pattern: 'DECLINING' },
  { name: 'Portable Power Bank 20k', unitsSold: 256, revenue: 25600, trend: 31, pattern: 'SEASONAL' },
  { name: 'Screen Protector Pack', unitsSold: 189, revenue: 5670, trend: -12, pattern: 'DECLINING' },
]

const mockChannels: ChannelBreakdown[] = [
  { channel: 'Direct', revenue: 456780, percentage: 36.8 },
  { channel: 'Google Ads', revenue: 324560, percentage: 26.2 },
  { channel: 'Instagram', revenue: 234890, percentage: 19.0 },
  { channel: 'Email', revenue: 158760, percentage: 12.8 },
  { channel: 'Facebook', revenue: 65410, percentage: 5.2 },
]

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

  const totalProjected = 145680

  const bottomProducts = mockProducts.slice(-5).reverse()

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
              {mockProducts.map((product, index) => (
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
          <VelocityChart data={mockProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acquisition Channel Breakdown</h2>
          <ChannelChart data={mockChannels} />
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