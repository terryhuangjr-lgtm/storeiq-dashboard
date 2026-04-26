import { FileText } from 'lucide-react'
import { Report } from '../lib/types'

interface ReportCardProps {
  report: Report
  onView: (report: Report) => void
  onDownload: (report: Report) => void
}

export default function ReportCard({ report, onView, onDownload }: ReportCardProps) {
  const typeNames: Record<Report['report_type'], string> = {
    sales_velocity: 'Sales Velocity',
    reorder_alerts: 'Smart Reorder Alerts',
    dead_inventory: 'Dead Inventory',
    cohort_analysis: 'Customer Cohort Analysis',
    discount_performance: 'Discount Performance',
    refund_analysis: 'Refund Analysis',
    customer_segments: 'Customer LTV Segmentation',
  }

  const typeIcons: Record<Report['report_type'], React.ReactNode> = {
    sales_velocity: <span className="text-blue-500 text-xl">📈</span>,
    reorder_alerts: <span className="text-green-500 text-xl">📦</span>,
    dead_inventory: <span className="text-red-500 text-xl">📉</span>,
    cohort_analysis: <span className="text-purple-500 text-xl">👥</span>,
    discount_performance: <span className="text-amber-500 text-xl">🏷️</span>,
    refund_analysis: <span className="text-pink-500 text-xl">💳</span>,
    customer_segments: <span className="text-cyan-500 text-xl">🎯</span>,
  }

  const previewText = report.content.split('\\n').slice(0, 3).join(' ').substring(0, 150) + '...'

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-primary/20">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          {typeIcons[report.report_type]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text text-lg mb-1">{typeNames[report.report_type]}</h3>
          <p className="text-secondary text-sm mb-3 line-clamp-2">{previewText}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Last generated:</span>
            <span className="font-medium">
              {new Date(report.generated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onView(report)}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View Full Report
            </button>
            <button
              onClick={() => onDownload(report)}
              className="px-4 py-2 border border-gray-200 text-secondary hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}