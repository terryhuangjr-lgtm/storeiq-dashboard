import { useState, useEffect } from 'react'
import { FileText, Download, Database, Loader2 } from 'lucide-react'
import ReportCard from '../components/ReportCard'
import { Report, ReportType } from '../lib/types'
import { supabase } from '../lib/supabase'

const SYNC_API = 'https://jettmissioncontrol.com/api/storeiq-sync'

const reportTypeLabels: Record<ReportType, string> = {
  sales_velocity: 'Sales Velocity Report',
  reorder_alerts: 'Smart Reorder Alerts',
  dead_inventory: 'Dead Inventory Analysis',
  cohort_analysis: 'Customer Cohort Analysis',
  discount_performance: 'Discount Performance',
  refund_analysis: 'Refund Analysis',
  customer_segments: 'Customer LTV Segmentation',
}

const reportTypeEmojis: Record<ReportType, string> = {
  sales_velocity: '📊',
  reorder_alerts: '⚠️',
  dead_inventory: '📦',
  cohort_analysis: '👥',
  discount_performance: '🏷️',
  refund_analysis: '🔄',
  customer_segments: '🎯',
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [storeId, setStoreId] = useState<string>('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data: storeData } = await supabase
          .from('stores').select('id').limit(1).single()
        const currentStoreId = storeData?.id || '1'
        setStoreId(currentStoreId)

        const { data: reportsData } = await supabase
          .from('reports').select('*').eq('store_id', currentStoreId)
          .order('generated_at', { ascending: false })

        if (reportsData && reportsData.length > 0) {
          setReports(reportsData)
        }
      } catch (err: any) {
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMessage('Syncing Shopify data to generate reports...')
    try {
      const res = await fetch(SYNC_API, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncMessage('Sync complete! Refreshing reports...')
        // Re-fetch reports from Supabase
        const { data: reportsData } = await supabase
          .from('reports').select('*').eq('store_id', storeId || '1')
          .order('generated_at', { ascending: false })
        if (reportsData) setReports(reportsData)
        setSyncMessage('Reports updated!')
        setTimeout(() => setSyncMessage(null), 3000)
      } else {
        setSyncMessage(`Sync failed: ${data.error}`)
        setTimeout(() => setSyncMessage(null), 5000)
      }
    } catch (err: any) {
      setSyncMessage(`Connection error: ${err.message}`)
      setTimeout(() => setSyncMessage(null), 5000)
    }
    setSyncing(false)
  }

  const handleView = (report: Report) => {
    setSelectedReport(report)
  }

  const handleDownload = (report: Report) => {
    const element = document.createElement('a')
    const file = new Blob([report.content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${report.report_type}_${report.generated_at.split('T')[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getReportTypeLabel = (type: ReportType): string => reportTypeLabels[type]

  const formatReportContent = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return '<br />'
        // Headers (all caps lines)
        if (trimmed === trimmed.toUpperCase() && trimmed.length > 5) {
          return `<h3 class="text-sm font-bold text-gray-800 mt-3 mb-1">${trimmed}</h3>`
        }
        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('  - ')) {
          return `<li class="text-sm text-gray-600 ml-4">${trimmed.replace(/^  - /, '').replace(/^- /, '')}</li>`
        }
        // Numbered items
        if (/^\d+\./.test(trimmed)) {
          return `<div class="text-sm font-medium text-gray-700 mt-2">${trimmed}</div>`
        }
        // Recommendation lines
        if (trimmed.startsWith('Recommendation:')) {
          return `<div class="text-sm text-primary mt-1">💡 ${trimmed}</div>`
        }
        // Warning/alert lines
        if (trimmed.startsWith('⚠️')) {
          return `<div class="text-sm text-amber-700 font-medium mt-1">${trimmed}</div>`
        }
        // Arrow trends
        if (trimmed.includes('↗️') || trimmed.includes('↘️') || trimmed.includes('→')) {
          return `<div class="text-sm text-gray-600 ml-2">${trimmed}</div>`
        }
        // Regular paragraph
        return `<p class="text-sm text-gray-600 mt-1">${trimmed}</p>`
      })
      .join('\n')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Archive</h1>
          <p className="text-gray-500 mt-1">
            {syncMessage ? (
              <span className="text-primary font-medium">{syncMessage}</span>
            ) : (
              'Real-time reports generated from your Shopify data'
            )}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <Database className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Generating...' : 'Sync & Generate Reports'}
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onView={handleView}
            onDownload={handleDownload}
          />
        ))}
        {reports.length === 0 && (
          <div className="col-span-full text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No reports yet</h3>
            <p className="text-gray-400 mb-6">Click "Sync & Generate Reports" to pull live data from Shopify</p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Database className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Generating...' : 'Sync & Generate Reports'}
            </button>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getReportTypeLabel(selectedReport.report_type)}
                </h2>
                <p className="text-gray-500 mt-1">
                  Generated: {new Date(selectedReport.generated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedReport)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatReportContent(selectedReport.content) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
