import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low'
  status?: 'success' | 'warning' | 'error'
}

const AlertBadge = ({ severity, status }: AlertBadgeProps) => {
  const config = {
    critical: { bg: 'bg-critical/10', text: 'text-critical', border: 'border-critical/20', icon: AlertCircle, label: 'Critical' },
    high: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20', icon: AlertTriangle, label: 'High' },
    medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', icon: Info, label: 'Medium' },
    low: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: CheckCircle, label: 'Low' },
  }[severity]

  const StatusIcon = status === 'error' ? AlertTriangle : status === 'warning' ? Info : CheckCircle

  const statusConfig = {
    error: { bg: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle, label: 'Error' },
    warning: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Info, label: 'Warning' },
    success: { bg: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Success' },
  }[status || 'success']

  if (status) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg}`}>
        <StatusIcon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

export default AlertBadge