import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChannelBreakdown } from '../../lib/types'

interface ChannelChartProps {
  data: ChannelBreakdown[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const ChannelChart = ({ data }: ChannelChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-1">{payload[0].payload.channel}</p>
          <p className="text-gray-600 text-sm">
            Revenue: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            {payload[0].payload.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
           <Pie
             data={data}
             cx="50%"
             cy="50%"
             innerRadius={60}
             outerRadius={80}
             paddingAngle={5}
             dataKey="revenue"
             nameKey="channel"
           >
             {data.map((entry, index) => (
               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
             ))}
           </Pie>
           <Tooltip content={<CustomTooltip />} />
           <Legend 
             verticalAlign="bottom" 
             height={36}
             iconType="circle"
             formatter={(value: string) => <span className="text-gray-600 text-sm">{value}</span>}
           />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ChannelChart