import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    isUp: boolean
  }
  icon?: React.ReactNode
  prefix?: string
  suffix?: string
}

export default function MetricCard({ 
  title, 
  value, 
  trend, 
  icon,
  prefix = '',
  suffix = ''
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          {icon || <TrendingUp className="w-6 h-6 text-primary" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isUp ? 'text-success' : 'text-danger'
          }`}>
            {trend.isUp ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            <span>{trend.isUp ? '+' : '-'}{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-secondary text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-text">
        {prefix}{value}{suffix}
      </p>
    </div>
  )
}