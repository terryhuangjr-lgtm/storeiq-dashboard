import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low'
  status?: 'success' | 'warning' | 'error'
}

export default function AlertBadge({ severity, status }: AlertBadgeProps) {
  const config = {
    critical: { bg: 'bg-critical', text: 'text-critical', icon: AlertCircle, label: 'CRITICAL' },
    high: { bg: 'bg-danger', text: 'text-danger', icon: AlertTriangle, label: 'HIGH' },
    medium: { bg: 'bg-warning', text: 'text-warning', icon: Info, label: 'MEDIUM' },
    low: { bg: 'bg-blue-500', text: 'text-blue-500', icon: CheckCircle, label: 'LOW' },
  }[severity]

  const StatusIcon = status === 'error' ? AlertTriangle : status === 'warning' ? Info : CheckCircle

  return (
    <div className="flex items-center gap-2">
      {status ? (
        <span className={`
          flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
          ${status === 'error' ? 'bg-red-100 text-red-700' : 
            status === 'warning' ? 'bg-amber-100 text-amber-700' : 
            'bg-green-100 text-green-700'}
        `}>
          <StatusIcon className="w-3 h-3" />
          {status === 'error' ? 'Error' : status === 'warning' ? 'Warning' : 'Success'}
        </span>
      ) : (
        <span className={`${config.bg} ${config.text} px-2 py-0.5 rounded text-xs font-bold`}>
          {config.label}
        </span>
      )}
    </div>
  )
}