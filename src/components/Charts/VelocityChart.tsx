import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ProductPerformance } from '../../lib/types'

interface VelocityChartProps {
  data: ProductPerformance[]
}

export default function VelocityChart({ data }: VelocityChartProps) {
  const getPatternColor = (pattern: ProductPerformance['pattern']) => {
    switch (pattern) {
      case 'BESTSELLER': return '#10B981'
      case 'SEASONAL': return '#F59E0B'
      case 'NEW LAUNCH': return '#3B82F6'
      case 'DECLINING': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-gray-600 text-sm">Units: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="unitsSold" 
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Bar 
                key={`bar-${index}`}
                dataKey="unitsSold"
                fill={getPatternColor(entry.pattern)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}