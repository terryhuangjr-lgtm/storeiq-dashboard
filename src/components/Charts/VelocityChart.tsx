import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ProductPerformance } from '../../lib/types'

interface VelocityChartProps {
  data: ProductPerformance[]
}

const VelocityChart = ({ data }: VelocityChartProps) => {
  const getPatternColor = (pattern: ProductPerformance['pattern']) => {
    switch (pattern) {
      case 'BESTSELLER': return '#10B981'
      case 'SEASONAL': return '#F59E0B'
      case 'NEW LAUNCH': return '#3B82F6'
      case 'DECLINING': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? '#10B981' : '#EF4444'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? '▲' : '▼'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const change = payload[0].payload.changePercent || 0
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-gray-600 text-sm">Units: {payload[0].value}</p>
          <p className="text-sm" style={{ color: getChangeColor(change) }}>
            {getChangeIcon(change)} {Math.abs(change)}% vs prev period
          </p>
        </div>
      )
    }
    return null
  }

  const CustomBar = ({ x, y, width, height, payload }: any) => {
    const changeColor = getChangeColor(payload.changePercent || 0)
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={4}
          ry={4}
          fill={getPatternColor(payload.pattern)}
        />
        {payload.changePercent !== undefined && (
          <text
            x={x + width / 2}
            y={y - 6}
            textAnchor="middle"
            fontSize={10}
            fill={changeColor}
          >
            {getChangeIcon(payload.changePercent)} {Math.abs(payload.changePercent)}%
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
            shape={<CustomBar />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default VelocityChart