import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'

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
    <div className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          {icon || <TrendingUp className="w-6 h-6 text-primary" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 text-sm font-semibold ${
            trend.isUp ? 'text-success' : 'text-danger'
          }`}>
            {trend.isUp ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.isUp ? '+' : '-'}{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-3xl font-bold text-text">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
    </div>
  )
}
