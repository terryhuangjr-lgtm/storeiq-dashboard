import { FileText, Download } from 'lucide-react'
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
    sales_velocity: <span className="text-xl">📈</span>,
    reorder_alerts: <span className="text-xl">📦</span>,
    dead_inventory: <span className="text-xl">📉</span>,
    cohort_analysis: <span className="text-xl">👥</span>,
    discount_performance: <span className="text-xl">🏷️</span>,
    refund_analysis: <span className="text-xl">💳</span>,
    customer_segments: <span className="text-xl">🎯</span>,
  }

  const previewText = report.content.split('\\n').slice(0, 3).join(' ').substring(0, 120) + '...'

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            {typeIcons[report.report_type]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{typeNames[report.report_type]}</h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{previewText}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <span>Generated</span>
          <span className="font-medium text-gray-500 tabular-nums">
            {new Date(report.generated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(report)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-white py-2 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            View Report
          </button>
          <button
            onClick={() => onDownload(report)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}