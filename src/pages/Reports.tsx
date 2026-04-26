import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import ReportCard from '../components/ReportCard'
import { Report, ReportType } from '../lib/types'

const mockReports: Report[] = [
  {
    id: '1',
    store_id: '1',
    report_type: 'sales_velocity',
    content: `SALES VELOCITY REPORT\n\nPeriod: March 1 - March 31, 2026\n\nEXECUTIVE SUMMARY\n- Total SKUs analyzed: 1,247\n- Top velocity products: 12\n- Inventory turnover: 4.2x\n\nTOP PERFORMERS\n1. Premium Wireless Headphones - 1,247 units (Category: Electronics)\n   Velocity Score: 94/100\n   Trend: ↗️ Strong upward (+23% MoM)\n   Recommendation: Increase stock by 40%\n\n2. Smart Watch Series 5 - 892 units (Category: Wearables)\n   Velocity Score: 87/100\n   Trend: ↗️ Moderate growth (+18% MoM)\n   Recommendation: Maintain current stock levels\n\n3. iPhone 15 Pro Case - 2,103 units (Category: Accessories)\n   Velocity Score: 91/100\n   Trend: ↗️ Strong upward (+45% MoM)\n   Recommendation: Urgent restock required\n\nBOTTOM PERFORMERS\n1. Vintage Bluetooth Speaker - 23 units (Category: Audio)\n   Velocity Score: 12/100\n   Trend: ↘️ Declining (-34% MoM)\n   Recommendation: Consider flash sale or bundle\n\nPATTERNS DETECTED\n- Seasonal surge in wireless accessories (+42%)\n- Declining interest in legacy audio products\n- Premium tier showing strongest growth\n\nACTION ITEMS\n- Reorder iPhone 15 Pro cases immediately\n- Reduce Vintage Speaker stock by 50%\n- Bundle slow-moving audio products\n- Increase premium electronics allocation`,
    generated_at: '2026-04-15T09:30:00Z',
    period_start: '2026-03-01',
    period_end: '2026-03-31',
  },
  {
    id: '2',
    store_id: '1',
    report_type: 'reorder_alerts',
    content: `SMART REORDER ALERTS\n\nGenerated: April 15, 2026\n\nCRITICAL ALERTS (Immediate Action Required)\n⚠️ Premium Wireless Headphones - 5 units remaining\n   Coverage: 3 days at current velocity\n   Reorder Qty: 100 units\n   Supplier: TechCorp Inc.\n\n⚠️ iPhone 15 Pro Case - 12 units remaining\n   Coverage: 8 days at current velocity\n   Reorder Qty: 200 units\n   Supplier: CaseDirect Ltd.\n\nHIGH PRIORITY ALERTS (Within 7 Days)\n🟡 Smart Watch Series 5 - 8 units remaining\n   Coverage: 12 days at current velocity\n   Reorder Qty: 150 units\n\n🟡 Wireless Charger Pad - 45 units remaining\n   Coverage: 42 days at current velocity\n   Reorder Qty: 100 units\n\nMEDIUM PRIORITY (Monitor)\n🟢 USB-C Hub 7-in-1 - 67 units remaining\n   Coverage: 58 days at current velocity\n   Reorder Qty: 50 units\n\nAUTOMATED ACTIONS TAKEN\n- Purchase orders created for critical items\n- Supplier notifications sent\n- Stock level warnings updated in system`,
    generated_at: '2026-04-14T16:45:00Z',
    period_start: '2026-04-01',
    period_end: '2026-04-14',
  },
  {
    id: '3',
    store_id: '1',
    report_type: 'dead_inventory',
    content: `DEAD INVENTORY ANALYSIS\n\nReport Date: April 10, 2026\nAnalysis Period: Last 90 days\n\nOVERVIEW\n- Total dead stock value: $8,940\n- Total units affected: 234\n- Average days stagnant: 127 days\n- Top affected category: Audio Equipment\n\nCRITICAL ITEMS (90+ days, $5,000+ value)\n1. Vintage Bluetooth Speaker - 34 units @ $60\n   Total Value: $2,040 | Days: 127\n   Category: Audio | Status: Dead\n   Recommendation: FLASH SALE (50% off)\n\n2. Old Model Phone Cases - 78 units @ $20\n   Total Value: $1,560 | Days: 98\n   Category: Accessories | Status: Dead\n   Recommendation: BUNDLE with new products\n\n3. Screen Protector Kit (Old Version) - 156 units @ $20\n   Total Value: $3,120 | Days: 156\n   Category: Accessories | Status: Dead\n   Recommendation: DISCONTINUE - Donate to charity\n\nMEDIUM PRIORITY (60-89 days, $2,000-$5,000 value)\n4. Car Mount Magnetic - 45 units @ $30\n   Total Value: $1,350 | Days: 89\n   Recommendation: PROMO: Buy 2 get 1 free\n\nRECOMMENDED ACTIONS\n1. Launch flash sale on top 3 items (Week 1)\n2. Create bundles with fast-moving products (Week 2)\n3. Donate items with no movement after 30 days\n4. Write off $3,120 in obsolete inventory\n\nPOTENTIAL RECOVERY: $5,250 (59% of dead stock)`,
    generated_at: '2026-04-10T14:20:00Z',
    period_start: '2026-01-12',
    period_end: '2026-04-10',
  },
  {
    id: '4',
    store_id: '1',
    report_type: 'cohort_analysis',
    content: `CUSTOMER COHORT ANALYSIS\n\nPeriod: January 1 - March 31, 2026\n\nEXECUTIVE SUMMARY\n- New customers acquired: 1,456\n- Average retention rate: 34.2%\n- Revenue from cohorts: $234,560\n\nDECEMBER 2025 COHORT\n- New customers: 245\n- Month 1 retention: 68% | Revenue: $45,230\n- Month 2 retention: 52% | Revenue: $38,940\n- Month 3 retention: 45% | Revenue: $32,180\n- Total LTV per customer: $470\n\nJANUARY 2026 COHORT\n- New customers: 312\n- Month 1 retention: 72% | Revenue: $58,920\n- Month 2 retention: 58% | Revenue: $46,720\n- Month 3 retention: 48% | Revenue: $39,450\n- Total LTV per customer: $464\n\nFEBRUARY 2026 COHORT\n- New customers: 278\n- Month 1 retention: 65% | Revenue: $48,230\n- Month 2 retention: 54% | Revenue: $42,150\n- Month 3 retention: 42% | Revenue: $28,940\n- Total LTV per customer: $426\n\nMARCH 2026 COHORT (Partial)\n- New customers: 423\n- Month 1 retention: 78% | Revenue: $67,240\n- Current LTV per customer: $159 (projected: $450+)\n\nKEY INSIGHTS\n- January cohort showing strongest retention (+8% vs Dec)\n- March cohort acquisition up 61% - excellent growth\n- Month 2-3 retention declining - focus on re-engagement\n- Mobile app users show 23% higher retention\n
RECOMMENDATIONS\n1. Expand mobile app promotion (higher retention)\n2. Launch re-engagement campaign for month 2-3 customers\n3. Replicate January acquisition strategy\n4. Implement loyalty program for long-term retention`,
    generated_at: '2026-04-08T11:15:00Z',
    period_start: '2025-12-01',
    period_end: '2026-03-31',
  },
  {
    id: '5',
    store_id: '1',
    report_type: 'discount_performance',
    content: `DISCOUNT PERFORMANCE ANALYSIS\n\nPeriod: Q1 2026 (January - March)\n\nEXECUTIVE SUMMARY\n- Total discount value: $45,670\n- Orders with discounts: 1,847 (54% of all orders)\n- Revenue impact: +$23,450 incremental\n- Margin impact: -12.3%\n\nDISCOUNT TYPES PERFORMANCE\n\n1. Percentage Off (20-40% discounts)\n   - Usage: 456 orders | $23,450 total discount\n   - Revenue lift: +$18,920\n   - AOV change: -$12 (7% decrease)\n   - Conversion rate: 14.2%\n   - ROI: 2.8x\n   ⚠️ Overuse detected in electronics category\n\n2. BOGO (Buy One Get One)\n   - Usage: 234 orders | $12,220 total discount\n   - Revenue lift: +$28,450\n   - AOV change: +$45 (25% increase)\n   - Conversion rate: 18.7%\n   - ROI: 4.3x\n   ✓ Best performing discount type\n\n3. Free Shipping Threshold ($50+)\n   - Usage: 892 orders | $6,780 total cost\n   - Revenue lift: +$31,280\n   - AOV change: +$28 (19% increase)\n   - Conversion rate: 12.4%\n   - ROI: 6.6x\n   ✓ Highest ROI\n\n4. Fixed Amount Off ($5-$20)\n   - Usage: 265 orders | $3,220 total discount\n   - Revenue lift: +$8,900\n   - AOV change: -$3 (2% decrease)\n   - Conversion rate: 8.9%\n   - ROI: 3.2x\n\nCATEGORY BREAKDOWN\n- Electronics: 38% of discounts, -8% margin impact\n- Fashion: 24% of discounts, +12% revenue lift\n- Home & Garden: 18% of discounts, +8% ROI\n- Accessories: 20% of discounts, -15% margin impact\n\nRECOMMENDATIONS\n1. Increase BOGO promotions (4.3x ROI)\n2. Expand free shipping program (6.6x ROI)\n3. Reduce electronics percentage discounts\n4. Test category-specific discount strategies`,
    generated_at: '2026-04-05T08:30:00Z',
    period_start: '2026-01-01',
    period_end: '2026-03-31',
  },
  {
    id: '6',
    store_id: '1',
    report_type: 'refund_analysis',
    content: `REFUND ANALYSIS REPORT\n\nPeriod: Q1 2026\n\nEXECUTIVE SUMMARY\n- Total refunds: $18,450 (2.1% of revenue)\n- Refund rate by category: Fashion 4.2%, Electronics 1.8%
- Top refund reasons: Size/fit (45%), Defective (23%), Changed mind (32%)\n\nCATEGORY BREAKDOWN\n\n1. FASHION & APPAREL
   - Refund rate: 4.2% ($8,940)\n   - Top items: Designer Handbag (12%), Denim Jacket (8%), Running Shoes (7%)\n   - Main reason: Size/fit issues (58%)\n   - Trend: ⬆️ 18% increase from Q4\n\n2. ELECTRONICS
   - Refund rate: 1.8% ($3,240)\n   - Top items: Wireless Earbuds (40%), Phone Cases (25%)\n   - Main reason: Defective DOA (45%)\n   - Trend: ⬇️ 12% decrease from Q4\n\n3. HOME & GARDEN
   - Refund rate: 2.4% ($2,880)\n   - Main reason: Not as described (38%)\n   - Trend: ↔️ Stable\n\n4. ACCESSORIES
   - Refund rate: 1.9% ($3,390)\n   - Main reason: Changed mind (42%)\n   - Trend: ⬆️ 8% increase\n\nFRAUD DETECTION\n- Suspicious refund patterns detected: 23 orders\n- Total flagged amount: $3,240\n- Action: Manual review required\n\nRECOMMENDATIONS\n1. Implement size recommendation engine for fashion (-40% size refunds)
2. Enhance product descriptions with customer photos (-25% 'not as described')
3. Add quality control checkpoint for electronics (-50% DOA rate)
4. Consider restocking fee for high-value fashion items
5. Launch 'try before you buy' program for premium fashion`,
    generated_at: '2026-04-02T15:45:00Z',
    period_start: '2026-01-01',
    period_end: '2026-03-31',
  },
  {
    id: '7',
    store_id: '1',
    report_type: 'customer_segments',
    content: `CUSTOMER LTV SEGMENTATION REPORT\n\nTotal Customers Analyzed: 3,421\nAnalysis Date: April 1, 2026\n\nSEGMENT BREAKDOWN\n\n1. CHAMPIONS (Top 10%)\n   - Count: 156 customers\n   - Avg LTV: $2,840\n   - Revenue Contribution: 32.5% ($384,240)\n   - Avg Orders: 12.4 | Last purchase: 14 days ago\n   - Products: Premium electronics, accessories\n   - Behavior: High engagement, early adopters\n   - Strategy: VIP treatment, exclusive previews, loyalty rewards\n\n2. LOYAL CUSTOMERS (Next 20%)\n   - Count: 289 customers\n   - Avg LTV: $1,680\n   - Revenue Contribution: 28.2% ($331,884)\n   - Avg Orders: 7.2 | Last purchase: 28 days ago\n   - Products: Mix of categories, regular buyers\n   - Behavior: Consistent purchasers, respond to offers\n   - Strategy: Regular communication, cross-sell opportunities\n\n3. POTENTIAL LOYALISTS (Next 15%)\n   - Count: 342 customers\n   - Avg LTV: $890\n   - Revenue Contribution: 18.7% ($220,266)\n   - Avg Orders: 4.1 | Last purchase: 45 days ago\n   - Products: Entry-level products, promotional buyers\n   - Behavior: Value-conscious, need nurturing\n   - Strategy: Personalized recommendations, bundle offers\n\n4. AT-RISK (Next 15%)\n   - Count: 234 customers\n   - Avg LTV: $920\n   - Revenue Contribution: 12.3% ($144,972)\n   - Avg Orders: 3.2 | Last purchase: 75 days ago\n   - Products: Declining engagement\n   - Behavior: Haven't purchased in 60-90 days\n   - Strategy: Re-engagement campaigns, win-back offers\n\n5. LOST (Bottom 20%)\n   - Count: 187 customers\n   - Avg LTV: $340\n   - Revenue Contribution: 6.8% ($80,520)\n   - Avg Orders: 1.8 | Last purchase: 180+ days ago\n   - Products: One-time low-value purchases\n   - Behavior: Inactive, likely churned\n   - Strategy: Low-cost reactivation campaigns\n\n6. NEW CUSTOMERS (Recent 3 months)\n   - Count: 423 customers\n   - Avg LTV: $280 (projected)\n   - Revenue Contribution: 2.5% ($29,488)\n   - Avg Orders: 1.2 | Last purchase: 21 days ago\n   - Behavior: Testing brand, high potential\n   - Strategy: Onboarding series, second-purchase incentive\n\nKEY INSIGHTS\n- Top 30% of customers generate 79.4% of revenue\n- At-Risk segment represents $15,420 recoverable revenue\n- New customer volume up 61% vs. last quarter\n- Champions show 23% increase in LTV over last year\n\nACTION PLAN\n1. Launch Champions VIP program with exclusive benefits\n2. Deploy automated win-back campaign for At-Risk segment\n3. Implement personalized onboarding for New customers\n4. Create referral program to leverage Loyal segment\n5. A/B test pricing strategies for Potential Loyalists`,
    generated_at: '2026-04-01T10:00:00Z',
    period_start: '2025-04-01',
    period_end: '2026-04-01',
  },
]

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports Archive</h1>
        <p className="text-gray-500 mt-1">Browse and download generated analytics reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onView={handleView}
            onDownload={handleDownload}
          />
        ))}
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
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {selectedReport.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}