import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import ReportCard from '../components/ReportCard'
import { Report, ReportType } from '../lib/types'
import { supabase, isDemoMode } from '../lib/supabase'

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data: storeData, error: storeError } = await supabase
          .from('stores').select('id').limit(1).single()
        if (storeError) throw storeError
        const currentStoreId = storeData?.id

        const { data: reportsData, error: reportsError } = await supabase
          .from('reports').select('*').eq('store_id', currentStoreId)
          .order('generated_at', { ascending: false })

        if (reportsData && reportsData.length > 0) {
          setReports(reportsData)
        } else if (isDemoMode) {
          setReports(getDemoReports())
        }
      } catch (err: any) {
        console.error('Error fetching reports:', err)
        if (isDemoMode) {
          setReports(getDemoReports())
        }
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const getDemoReports = (): Report[] => [
    {
      id: '1', store_id: '1', report_type: 'sales_velocity',
      content: `SALES VELOCITY REPORT\n\nPeriod: March 1 - March 31, 2026\n\nEXECUTIVE SUMMARY\n- Total SKUs analyzed: 1,247\n- Top velocity products: 12\n- Inventory turnover: 4.2x\n\nTOP PERFORMERS\n1. Supergel V Gloves - 1,247 units (Category: Boxing Gloves)\n   Velocity Score: 94/100\n   Trend: ↗️ Strong upward (+23% MoM)\n   Recommendation: Increase stock by 40%\n\n2. Supergel Pro Gloves - 892 units (Category: Boxing Gloves)\n   Velocity Score: 87/100\n   Trend: ↗️ Moderate growth (+18% MoM)\n   Recommendation: Maintain current stock levels\n\nBOTTOM PERFORMERS\n1. One Series No Foul Protector - 23 units (Category: Protective Gear)\n   Velocity Score: 12/100\n   Trend: ↘️ Declining (-34% MoM)\n   Recommendation: Consider flash sale or bundle`,
      generated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-03-01', period_end: '2026-03-31',
    },
    {
      id: '2', store_id: '1', report_type: 'reorder_alerts',
      content: `SMART REORDER ALERTS\n\nGenerated: April 15, 2026\n\nCRITICAL ALERTS (Immediate Action Required)\n⚠️ Supergel V Gloves - 5 pairs remaining\n   Coverage: 3 days at current velocity\n   Reorder Qty: 100 pairs\n\n⚠️ S40 Italian Leather Lace Up - 12 pairs remaining\n   Coverage: 8 days at current velocity\n   Reorder Qty: 50 pairs`,
      generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-04-01', period_end: '2026-04-14',
    },
    {
      id: '3', store_id: '1', report_type: 'dead_inventory',
      content: `DEAD INVENTORY ANALYSIS\n\nReport Date: April 10, 2026\nAnalysis Period: Last 90 days\n\nOVERVIEW\n- Total dead stock value: $8,940\n- Total units affected: 234\n- Average days stagnant: 127 days\n\nCRITICAL ITEMS\n1. Legacy Tee - 156 units @ $38\n   Total Value: $5,928 | Days: 127\n   Recommendation: FLASH SALE (50% off)`,
      generated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-12', period_end: '2026-04-10',
    },
    {
      id: '4', store_id: '1', report_type: 'cohort_analysis',
      content: `CUSTOMER COHORT ANALYSIS\n\nPeriod: January 1 - March 31, 2026\n\nEXECUTIVE SUMMARY\n- New fighters registered: 1,456\n- Average retention rate: 34.2%\n- Revenue from cohorts: $234,560\n\nJANUARY 2026 COHORT\n- New registrations: 312\n- Month 1 retention: 72% | Revenue: $58,920\n- Month 2 retention: 58% | Revenue: $46,720`,
      generated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2025-12-01', period_end: '2026-03-31',
    },
    {
      id: '5', store_id: '1', report_type: 'discount_performance',
      content: `DISCOUNT PERFORMANCE ANALYSIS\n\nPeriod: Q1 2026\n\nEXECUTIVE SUMMARY\n- Total discount value: $45,670\n- Orders with discounts: 1,847\n- Revenue impact: +$23,450 incremental\n\nDISCOUNT TYPES\n1. BOGO bundles | ROI: 4.3x\n2. Free shipping | ROI: 6.6x\n3. Percentage off | ROI: 2.8x`,
      generated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-01', period_end: '2026-03-31',
    },
    {
      id: '6', store_id: '1', report_type: 'refund_analysis',
      content: `REFUND ANALYSIS REPORT\n\nPeriod: Q1 2026\n\nEXECUTIVE SUMMARY\n- Total refunds: $18,450 (2.1% of revenue)\n- Refund rate: Boxing Gloves 4.2%\n\nCATEGORY BREAKDOWN\n1. Boxing Gloves: 4.2% ($8,940)\n2. Protective Gear: 3.5% ($3,240)\n3. Apparel: 2.8% ($2,880)\n\nRECOMMENDATIONS\n1. Implement sizing guide for gloves\n2. Enhance fit descriptions for headgear`,
      generated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-01', period_end: '2026-03-31',
    },
    {
      id: '7', store_id: '1', report_type: 'customer_segments',
      content: `CUSTOMER LTV SEGMENTATION REPORT\n\nTotal Fighters: 3,421\n\nSEGMENT BREAKDOWN\n\n1. CHAMPIONS (Pro Fighters)\n   - Count: 156\n   - Avg LTV: $2,840\n   - Revenue: 32.5%\n\n2. LOYAL (Regulars)\n   - Count: 289\n   - Avg LTV: $1,680\n   - Revenue: 28.2%\n\n3. AT-RISK\n   - Count: 234\n   - Recoverable: $15,420`,
      generated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2025-04-01', period_end: '2026-04-01',
    },
  ]

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

  const getReportTypeLabel = (type: ReportType): string => {
    const labels: Record<ReportType, string> = {
      sales_velocity: 'Sales Velocity Report',
      reorder_alerts: 'Smart Reorder Alerts',
      dead_inventory: 'Dead Inventory Analysis',
      cohort_analysis: 'Customer Cohort Analysis',
      discount_performance: 'Discount Performance',
      refund_analysis: 'Refund Analysis',
      customer_segments: 'Customer LTV Segmentation',
    }
    return labels[type]
  }

  // Clean report formatting
  const formatReportContent = (text: string) => {
    return text
      .replace(/===/g, '---')
      .replace(/---/g, '---')
      .replace(/\\n\\n/g, '</p><p className="mt-2"> ')
      .replace(/\\n/g, '<br />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports Archive</h1>
        <p className="text-gray-500 mt-1">Browse and download generated analytics reports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onView={handleView}
            onDownload={handleDownload}
          />
        ))}
      </div>
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
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50/50 rounded-lg text-sm">
              <div className="prose prose-sm max-w-none space-y-3" dangerouslySetInnerHTML={{__html: formatReportContent(selectedReport.content)}} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}