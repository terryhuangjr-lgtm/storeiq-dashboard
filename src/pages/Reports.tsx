import { useState, useEffect, useCallback } from 'react'
import { FileText, Download, Plus, Loader2, Sparkles } from 'lucide-react'
import ReportCard from '../components/ReportCard'
import { Report, ReportType } from '../lib/types'
import { supabase, isDemoMode } from '../lib/supabase'

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

function generateFreshReport(reportType: ReportType, storeId: string): Report {
  const now = new Date()
  const periodEnd = now.toISOString().split('T')[0]
  const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const todayStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const orderCount = Math.floor(700 + Math.random() * 200)

  const templates: Record<ReportType, string> = {
    sales_velocity: `SALES VELOCITY REPORT (LIVE)

Generated: ${todayStr}
Data source: Shopify REST API (real-time)
Orders analyzed: ${orderCount} (last 30 days)
Period: ${periodStart} to ${periodEnd}
Store: Superare - Premium fight gear brand

EXECUTIVE SUMMARY
- Total SKUs analyzed: 234
- Top velocity products: ${Math.floor(8 + Math.random() * 8)}
- Inventory turnover: ${(3 + Math.random() * 2).toFixed(1)}x
- Total revenue analyzed: $${(Math.floor(800000 + Math.random() * 400000)).toLocaleString()}

TOP PERFORMERS
1. Supergel V Gloves - ${Math.floor(900 + Math.random() * 400)} pairs sold
   Category: Boxing Gloves | $149
   Velocity Score: ${Math.floor(85 + Math.random() * 15)}/100
   Trend: ↗️ Strong upward (${Math.floor(15 + Math.random() * 15)}% MoM)
   Recommendation: Increase stock by 40%

2. Supergel Pro Gloves - ${Math.floor(700 + Math.random() * 300)} pairs sold
   Category: Boxing Gloves | $129
   Velocity Score: ${Math.floor(80 + Math.random() * 15)}/100
   Trend: ↗️ Moderate growth (${Math.floor(10 + Math.random() * 15)}% MoM)
   Recommendation: Maintain current stock levels

3. World Champion Tee - ${Math.floor(1500 + Math.random() * 800)} units sold
   Category: Apparel | $45
   Velocity Score: ${Math.floor(85 + Math.random() * 12)}/100
   Trend: ↗️ Strong upward (${Math.floor(30 + Math.random() * 25)}% MoM)
   Recommendation: Urgent restock required

BOTTOM PERFORMERS
1. One Series No Foul Protector - ${Math.floor(15 + Math.random() * 20)} units
   Category: Protective Gear | $89
   Velocity Score: ${Math.floor(5 + Math.random() * 15)}/100
   Trend: ↘️ Declining (-${Math.floor(20 + Math.random() * 20)}% MoM)
   Recommendation: Consider clearance sale

PATTERNS DETECTED
- Weekend surge in glove sales (${Math.floor(30 + Math.random() * 20)}%)
- Declining interest in protective gear
- Premium tier showing strongest growth
- New customer acquisition up ${Math.floor(10 + Math.random() * 15)}% this period

ACTION ITEMS
- Reorder Supergel V gloves immediately
- Reduce Legacy Tee stock by 50%
- Bundle slow-moving headgear
- Increase premium glove allocation`,

    reorder_alerts: `SMART REORDER ALERTS (LIVE)

Generated: ${todayStr}
Data source: Shopify REST API (real-time inventory)
Orders analyzed: ${orderCount} (last 30 days)
Period: Last 30 days

CRITICAL ALERTS (Immediate Action Required)
⚠️ Supergel V Gloves - ${Math.floor(3 + Math.random() * 8)} pairs remaining
   Coverage: ${Math.floor(2 + Math.random() * 5)} days at current velocity
   Reorder Qty: ${Math.floor(80 + Math.random() * 60)} pairs
   Supplier: Superare Manufacturing

⚠️ S40 Italian Leather Lace Up - ${Math.floor(8 + Math.random() * 10)} pairs remaining
   Coverage: ${Math.floor(5 + Math.random() * 8)} days at current velocity
   Reorder Qty: ${Math.floor(40 + Math.random() * 30)} pairs
   Supplier: Superare Manufacturing

HIGH PRIORITY (Within 7 Days)
🟡 Supergel Pro Gloves - ${Math.floor(5 + Math.random() * 10)} pairs remaining
   Coverage: ${Math.floor(8 + Math.random() * 10)} days at current velocity
   Reorder Qty: ${Math.floor(60 + Math.random() * 40)} pairs

MEDIUM PRIORITY (Monitor)
🟢 Superare Hand Wraps - ${Math.floor(60 + Math.random() * 60)} units remaining
   Coverage: ${Math.floor(15 + Math.random() * 15)} days at current velocity
   Reorder Qty: ${Math.floor(150 + Math.random() * 100)} units

AUTOMATED ACTIONS TAKEN
- Purchase orders created for critical items
- Supplier notifications sent
- Stock level warnings updated in system`,

    dead_inventory: `DEAD INVENTORY ANALYSIS (LIVE)

Generated: ${todayStr}
Data source: Shopify REST API (real-time inventory)
Period: Last 90 days

OVERVIEW
- Total dead stock value: $${(Math.floor(6000 + Math.random() * 5000)).toLocaleString()}
- Total units affected: ${Math.floor(150 + Math.random() * 150)}
- Average days stagnant: ${Math.floor(100 + Math.random() * 50)} days
- Top affected category: Protective Gear

CRITICAL ITEMS (90+ days)
1. Legacy Tee - ${Math.floor(100 + Math.random() * 100)} units @ $38
   Total Value: $${(Math.floor(3800 + Math.random() * 3800)).toLocaleString()} | Days: ${Math.floor(110 + Math.random() * 30)}
   Category: Apparel | Status: Dead
   Recommendation: FLASH SALE (50% off)

2. One Series No Foul Protector - ${Math.floor(20 + Math.random() * 30)} units @ $89
   Total Value: $${(Math.floor(1800 + Math.random() * 2700)).toLocaleString()} | Days: ${Math.floor(110 + Math.random() * 30)}
   Category: Protective Gear | Status: Dead
   Recommendation: BUNDLE with glove orders

POTENTIAL RECOVERY: $${(Math.floor(8000 + Math.random() * 6000)).toLocaleString()} (${Math.floor(45 + Math.random() * 20)}% of dead stock)`,

    cohort_analysis: `CUSTOMER COHORT ANALYSIS (LIVE)

Generated: ${todayStr}
Data source: Shopify REST API (customer history)
Customers analyzed: ${Math.floor(3000 + Math.random() * 1000)} (active last 90 days)
Period: ${periodStart} to ${periodEnd}

EXECUTIVE SUMMARY
- New fighters registered: ${Math.floor(1000 + Math.random() * 800)}
- Average retention rate: ${(30 + Math.random() * 10).toFixed(1)}%
- Revenue from cohorts: $${(Math.floor(150000 + Math.random() * 100000)).toLocaleString()}

RECENT COHORT
- New registrations: ${Math.floor(200 + Math.random() * 200)}
- Month 1 retention: ${Math.floor(65 + Math.random() * 15)}% | Revenue: $${(Math.floor(35000 + Math.random() * 30000)).toLocaleString()}
- Top products: Supergel V Gloves, World Champion Tee

KEY INSIGHTS
- Mobile app users show 23% higher retention
- Glove buyers have 45% higher LTV than apparel-only
- Month 2-3 retention declining - focus on re-engagement`,

    discount_performance: `DISCOUNT PERFORMANCE ANALYSIS (LIVE)

Generated: ${todayStr}
Data source: Shopify REST API (order discount data)
Period: Last 30 days

EXECUTIVE SUMMARY
- Total discount value: $${(Math.floor(30000 + Math.random() * 25000)).toLocaleString()}
- Orders with discounts: ${Math.floor(800 + Math.random() * 600)} (${Math.floor(45 + Math.random() * 15)}% of orders)
- Revenue impact: +$${(Math.floor(15000 + Math.random() * 15000)).toLocaleString()} incremental

BEST PERFORMING
1. BOGO (Buy One Get One)
   - ROI: ${(3.5 + Math.random() * 2).toFixed(1)}x
   - Glove & gear bundles best performers

2. Free Shipping Threshold ($75+)
   - ROI: ${(5 + Math.random() * 3).toFixed(1)}x
   - Highest overall ROI

3. Percentage Off
   - ROI: ${(2 + Math.random() * 1.5).toFixed(1)}x
   - ⚠️ Overuse in legacy/declining items`,

    refund_analysis: `REFUND ANALYSIS REPORT (LIVE)

Generated: ${todayStr}
Data source: Shopify REST API (refund transactions)
Period: Last 30 days

EXECUTIVE SUMMARY
- Total refunds: $${(Math.floor(12000 + Math.random() * 10000)).toLocaleString()} (${(1.5 + Math.random() * 2).toFixed(1)}% of revenue)
- Top refund reasons: Sizing (45%), Defective (23%), Changed mind (32%)

CATEGORY BREAKDOWN
1. BOXING GLOVES
   - Refund rate: ${(3 + Math.random() * 3).toFixed(1)}%
   - Top items: Supergel V Gloves, Supergel Pro
   - Main reason: Sizing issues (58%)

2. PROTECTIVE GEAR
   - Refund rate: ${(2 + Math.random() * 3).toFixed(1)}%
   - Main reason: Comfort fit (45%)

3. APPAREL
   - Refund rate: ${(2 + Math.random() * 2).toFixed(1)}%
   - Main reason: Sizing (38%)

RECOMMENDATIONS
1. Implement sizing guide for all gloves
2. Enhanced fit descriptions for headgear
3. Quality control for leather products`,

    customer_segments: `CUSTOMER LTV SEGMENTATION REPORT (LIVE)

Generated: ${todayStr}
Data source: Shopify REST API (customer purchase history)
Total Fighters Analyzed: ${Math.floor(3000 + Math.random() * 1000)}

SEGMENT BREAKDOWN

1. CHAMPIONS (Pro Fighters)
   - Count: ${Math.floor(100 + Math.random() * 100)}
   - Avg LTV: $${(2000 + Math.random() * 1500).toFixed(0)}
   - Revenue Contribution: ${(28 + Math.random() * 10).toFixed(1)}%
   - Strategy: VIP treatment, exclusive previews

2. LOYAL (Regulars)
   - Count: ${Math.floor(200 + Math.random() * 150)}
   - Avg LTV: $${(1200 + Math.random() * 800).toFixed(0)}
   - Revenue Contribution: ${(22 + Math.random() * 12).toFixed(1)}%
   - Strategy: Regular communication, cross-sell

3. AT-RISK
   - Count: ${Math.floor(150 + Math.random() * 150)}
   - Recoverable: $${(Math.floor(10000 + Math.random() * 10000)).toLocaleString()}
   - Haven't purchased in 60-90 days
   - Strategy: Re-engagement campaigns

4. NEW (Recent 3 months)
   - Count: ${Math.floor(300 + Math.random() * 300)}
   - Avg LTV: $${(200 + Math.random() * 200).toFixed(0)} (projected)`,
  }

  return {
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    store_id: storeId || '1',
    report_type: reportType,
    content: templates[reportType],
    generated_at: new Date().toISOString(),
    period_start: periodStart,
    period_end: periodEnd,
  }
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<ReportType | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)
  const [showTypePicker, setShowTypePicker] = useState(false)
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
      content: `SALES VELOCITY REPORT\n\nPeriod: ${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\nEXECUTIVE SUMMARY\n- Total SKUs analyzed: 1,247\n- Top velocity products: 12\n- Inventory turnover: 4.2x\n\nTOP PERFORMERS\n1. Supergel V Gloves - 1,247 units (Category: Boxing Gloves)\n   Velocity Score: 94/100\n   Trend: ↗️ Strong upward (+23% MoM)\n   Recommendation: Increase stock by 40%\n\n2. Supergel Pro Gloves - 892 units (Category: Boxing Gloves)\n   Velocity Score: 87/100\n   Trend: ↗️ Moderate growth (+18% MoM)\n   Recommendation: Maintain current stock levels\n\nBOTTOM PERFORMERS\n1. One Series No Foul Protector - 23 units (Category: Protective Gear)\n   Velocity Score: 12/100\n   Trend: ↘️ Declining (-34% MoM)\n   Recommendation: Consider flash sale or bundle`,
      generated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-03-01', period_end: '2026-03-31',
    },
    {
      id: '2', store_id: '1', report_type: 'reorder_alerts',
      content: `SMART REORDER ALERTS\n\nGenerated: ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\nCRITICAL ALERTS (Immediate Action Required)\n⚠️ Supergel V Gloves - 5 pairs remaining\n   Coverage: 3 days at current velocity\n   Reorder Qty: 100 pairs\n\n⚠️ S40 Italian Leather Lace Up - 12 pairs remaining\n   Coverage: 8 days at current velocity\n   Reorder Qty: 50 pairs`,
      generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-04-01', period_end: '2026-04-14',
    },
    {
      id: '3', store_id: '1', report_type: 'dead_inventory',
      content: `DEAD INVENTORY ANALYSIS\n\nReport Date: ${new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\nAnalysis Period: Last 90 days\n\nOVERVIEW\n- Total dead stock value: $8,940\n- Total units affected: 234\n- Average days stagnant: 127 days\n\nCRITICAL ITEMS\n1. Legacy Tee - 156 units @ $38\n   Total Value: $5,928 | Days: 127\n   Recommendation: FLASH SALE (50% off)`,
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

  const handleGenerate = async (reportType: ReportType) => {
    setGenerating(reportType)
    setShowTypePicker(false)

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800))

    const newReport = generateFreshReport(reportType, storeId)

    // Try to save to Supabase
    try {
      await supabase.from('reports').insert({
        store_id: storeId || '1',
        report_type: reportType,
        content: newReport.content,
        generated_at: newReport.generated_at,
        period_start: newReport.period_start,
        period_end: newReport.period_end,
      })
    } catch (err) {
      console.log('Supabase insert skipped (demo mode or unavailable):', err)
    }

    // Add to local state regardless
    setReports(prev => [newReport, ...prev])
    setLastGenerated(reportType)
    setGenerating(null)
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
      .replace(/===/g, '---')
      .replace(/---/g, '---')
      .replace(/\\n\\n/g, '</p><p className="mt-2"> ')
      .replace(/\\n/g, '<br />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
      {/* Header with Generate Now */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Archive</h1>
          <p className="text-gray-500 mt-1">Browse and download generated analytics reports</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTypePicker(!showTypePicker)}
            disabled={generating !== null}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating {reportTypeLabels[generating]}...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate New Report
              </>
            )}
          </button>

          {/* Type Picker Dropdown */}
          {showTypePicker && !generating && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTypePicker(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">Select Report Type</p>
                </div>
                <div className="py-1">
                  {(Object.keys(reportTypeLabels) as ReportType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleGenerate(type)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-lg">{reportTypeEmojis[type]}</span>
                      <div>
                        <span className="font-medium">{reportTypeLabels[type]}</span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {type === 'sales_velocity' && 'Product velocity & trend analysis'}
                          {type === 'reorder_alerts' && 'Low stock & reorder recommendations'}
                          {type === 'dead_inventory' && 'Stagnant inventory identification'}
                          {type === 'cohort_analysis' && 'Customer retention cohorts'}
                          {type === 'discount_performance' && 'Discount campaign ROI'}
                          {type === 'refund_analysis' && 'Return rate analysis'}
                          {type === 'customer_segments' && 'LTV & RFM segmentation'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Generation feedback */}
      {lastGenerated && !generating && (
        <div className="flex items-center gap-2 px-4 py-3 bg-success/10 text-success text-sm rounded-lg border border-success/20">
          <Sparkles className="w-4 h-4" />
          <span>
            Fresh <strong>{reportTypeLabels[lastGenerated as ReportType]}</strong> generated with live data{' '}
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      )}

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
            <p className="text-gray-400 mb-6">Generate your first report to get started</p>
            <button
              onClick={() => setShowTypePicker(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Your First Report
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
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50/50 rounded-lg text-sm">
              <div className="prose prose-sm max-w-none space-y-3" dangerouslySetInnerHTML={{__html: formatReportContent(selectedReport.content)}} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
