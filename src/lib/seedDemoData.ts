import { supabase, isDemoMode } from './supabase'

export async function seedDemoData() {
  console.log('Seeding demo data...')

  // Create store
  const { data: storeData, error: storeError } = await supabase
    .from('stores')
    .insert([
      {
        name: 'Superare',
        shopify_domain: 'superare-demo.myshopify.com',
        owner_email: 'owner@superare.com',
      },
    ])
    .select()
    .single()

  if (storeError && !storeError.message.includes('duplicate')) {
    console.error('Error creating store:', storeError)
    return
  }

  const storeId = storeData?.id || '00000000-0000-0000-0000-000000000001'

  // Generate 30 days of metrics
  const metrics = []
  const baseRevenue = 45000
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const revenue = baseRevenue + (isWeekend ? 15000 : 0) + Math.random() * 10000 - 5000
    const orders = Math.floor(revenue / 85) + Math.floor(Math.random() * 20)

    metrics.push({
      store_id: storeId,
      metric_date: date.toISOString().split('T')[0],
      revenue_today: Math.round(revenue),
      orders_today: orders,
      revenue_7day: Math.round(revenue * 6.5),
      orders_7day: Math.floor(orders * 6.2),
      revenue_30day: Math.round(revenue * 28),
      orders_30day: Math.floor(orders * 27),
      top_product: 'Premium Wireless Headphones',
      avg_order_value: 85 + Math.random() * 20,
      new_customers: Math.floor(Math.random() * 10) + 1,
      returning_customers: Math.floor(Math.random() * 20) + 5,
    })
  }

  const { error: metricsError } = await supabase
    .from('metrics')
    .insert(metrics)

  if (metricsError && !metricsError.message.includes('duplicate')) {
    console.error('Error creating metrics:', metricsError)
  }

  // Create activity logs
  const activities = [
    {
      store_id: storeId,
      action: 'Generated Sales Velocity Report',
      summary: 'Analyzed 1,247 products for velocity trends',
      details: 'Top categories: Electronics (+23%), Fashion (+12%), Home (+8%)',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Updated Reorder Alerts',
      summary: 'Identified 23 products below reorder threshold',
      details: 'Top priority: iPhone 15 Pro Case (5 units remaining)',
      status: 'warning' as const,
    },
    {
      store_id: storeId,
      action: 'Customer Segmentation Analysis',
      summary: 'Updated RFM segments for 3,421 customers',
      details: '156 customers moved to Champions segment',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Refund Pattern Detection',
      summary: 'Detected unusual refund spike in Fashion category',
      details: '12% increase vs. 30-day average. Investigation recommended.',
      status: 'error' as const,
    },
    {
      store_id: storeId,
      action: 'Generated Dead Inventory Report',
      summary: 'Identified $8,940 in stagnant inventory',
      details: '47 products stagnant for 90+ days. Flash sale recommended.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Processed Automated Reorders',
      summary: 'Submitted 15 purchase orders to suppliers',
      details: 'Total value: $45,670. Expected delivery: 5-7 business days.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Discount Performance Analysis',
      summary: 'Analyzed Q1 discount campaigns',
      details: 'BOGO promotions showing 4.3x ROI. Recommend strategy shift.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Mobile App User Review',
      summary: 'Analyzed mobile engagement metrics',
      details: 'DAU up 34% MoM. Push notification open rate: 67%.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Competitor Price Monitoring',
      summary: 'Checked pricing across 15 competitors',
      details: '342 price changes detected. 78% of products competitively priced.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Email Campaign Performance',
      summary: 'Q1 email marketing analysis complete',
      details: 'Open rate: 34.2%. Revenue generated: $89,450.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Returns Analysis Complete',
      summary: 'Q1 return patterns analyzed',
      details: 'Fashion category return rate: 14.2%. Enhanced sizing guides recommended.',
      status: 'error' as const,
    },
    {
      store_id: storeId,
      action: 'Loyalty Program Review',
      summary: 'Analyzed 2,847 loyalty program members',
      details: 'Active members: 66.5%. ROI: 4.2x. Diamond tier recommended.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Seasonal Forecast Updated',
      summary: 'Q2 demand forecast generated',
      details: 'Expected revenue: $1.45M. Spring Fashion (+45%) leading growth.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Content Marketing Review',
      summary: 'Q1 blog performance analyzed',
      details: '24 posts generated 30,000+ visits. Sustainability content performing best.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Abandoned Cart Recovery',
      summary: 'Sent recovery emails to 847 abandoned carts',
      details: 'Recovery rate: 12.4%. $15,230 recovered. Recommend frequency increase.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Supplier Price Updates',
      summary: 'Updated pricing for 156 products',
      details: 'Average increase: 3.2%. 23 products flagged for margin review.',
      status: 'warning' as const,
    },
    {
      store_id: storeId,
      action: 'Inventory Sync Completed',
      summary: 'Synced 2,847 products with Shopify',
      details: '56 discrepancies detected. 12 sync conflicts resolved.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Customer LTV Recalculation',
      summary: 'Updated lifetime value for all customers',
      details: 'Champions avg LTV: $2,840. At-Risk recoverable: $15,420.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Product Description Updates',
      summary: 'Optimized 234 product descriptions',
      details: 'SEO improvements: +23% keyword density. Expected traffic: +18%.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Generated Cohort Analysis',
      summary: 'Multi-month cohort retention analysis',
      details: 'January cohort: 72% month-1 retention. Mobile users: +23% retention.',
      status: 'success' as const,
    },
  ]

  // Add dates to activities (spread over last 7 days)
  const activitiesWithDates = activities.map((activity, index) => ({
    ...activity,
    created_at: new Date(Date.now() - (index * 6) * 60 * 60 * 1000).toISOString(),
  }))

  const { error: activitiesError } = await supabase
    .from('activity_log')
    .insert(activitiesWithDates)

  if (activitiesError && !activitiesError.message.includes('duplicate')) {
    console.error('Error creating activities:', activitiesError)
  }

  // Create alerts
  const alerts = [
    {
      store_id: storeId,
      alert_type: 'stockout_risk' as const,
      severity: 'critical' as const,
      title: 'Stockout Risk: Premium Wireless Headphones',
      description: 'Only 5 units remaining. Projected stockout in 3 days.',
      product_name: 'Premium Wireless Headphones',
      value: 5,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'dead_inventory' as const,
      severity: 'high' as const,
      title: 'Dead Inventory Alert',
      description: '47 products stagnant for 90+ days',
      product_name: 'Vintage Bluetooth Speaker',
      value: 47,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'high_return_rate' as const,
      severity: 'medium' as const,
      title: 'High Return Rate Detected',
      description: 'Fashion category returns up 18% this week',
      product_name: 'Designer Handbag',
      value: 18,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'at_risk_customer' as const,
      severity: 'medium' as const,
      title: 'Customer At-Risk: VIP Segment',
      description: '23 customers showing reduced engagement',
      product_name: undefined,
      value: 23,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'discount_overuse' as const,
      severity: 'low' as const,
      title: 'Discount Overuse in Electronics',
      description: 'Electronics discounts impacting margins (-8%)',
      product_name: 'Wireless Earbuds Pro',
      value: 8,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'revenue_anomaly' as const,
      severity: 'high' as const,
      title: 'Revenue Anomaly: Fashion Category',
      description: 'Tuesday revenue 45% below expected for category',
      product_name: undefined,
      value: 45,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'stockout_risk' as const,
      severity: 'high' as const,
      title: 'Stockout Risk: iPhone 15 Pro Case',
      description: '12 units remaining. High velocity item.',
      product_name: 'iPhone 15 Pro Case',
      value: 12,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'dead_inventory' as const,
      severity: 'medium' as const,
      title: 'Slow Moving: Phone Accessories Bundle',
      description: '89 units stagnant for 75 days',
      product_name: 'Phone Accessories Bundle',
      value: 89,
      is_resolved: false,
    },
  ]

  const { error: alertsError } = await supabase
    .from('alerts')
    .insert(alerts)

  if (alertsError && !alertsError.message.includes('duplicate')) {
    console.error('Error creating alerts:', alertsError)
  }

  // Create sample reports
  const reports = [
    {
      store_id: storeId,
      report_type: 'sales_velocity' as const,
      content: `SALES VELOCITY REPORT\n\nPeriod: March 1 - March 31, 2026\n\nEXECUTIVE SUMMARY\n- Total SKUs analyzed: 1,247\n- Top velocity products: 12\n- Inventory turnover: 4.2x\n\nTOP PERFORMERS\n1. Premium Wireless Headphones - 1,247 units (Category: Electronics)\n   Velocity Score: 94/100\n   Trend: ↗️ Strong upward (+23% MoM)\n   Recommendation: Increase stock by 40%\n\n2. Smart Watch Series 5 - 892 units (Category: Wearables)\n   Velocity Score: 87/100\n   Trend: ↗️ Moderate growth (+18% MoM)\n   Recommendation: Maintain current stock levels\n\nBOTTOM PERFORMERS\n1. Vintage Bluetooth Speaker - 23 units (Category: Audio)\n   Velocity Score: 12/100\n   Trend: ↘️ Declining (-34% MoM)\n   Recommendation: Consider flash sale or bundle`,
      generated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-03-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'reorder_alerts' as const,
      content: `SMART REORDER ALERTS\n\nGenerated: April 15, 2026\n\nCRITICAL ALERTS (Immediate Action Required)\n⚠️ Premium Wireless Headphones - 5 units remaining\n   Coverage: 3 days at current velocity\n   Reorder Qty: 100 units\n\n⚠️ iPhone 15 Pro Case - 12 units remaining\n   Coverage: 8 days at current velocity\n   Reorder Qty: 200 units\n\nHIGH PRIORITY ALERTS (Within 7 Days)\n🟡 Smart Watch Series 5 - 8 units remaining\n   Coverage: 12 days at current velocity\n   Reorder Qty: 150 units`,
      generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-04-01',
      period_end: '2026-04-14',
    },
    {
      store_id: storeId,
      report_type: 'dead_inventory' as const,
      content: `DEAD INVENTORY ANALYSIS\n\nReport Date: April 10, 2026\nAnalysis Period: Last 90 days\n\nOVERVIEW\n- Total dead stock value: $8,940\n- Total units affected: 234\n- Average days stagnant: 127 days\n\nCRITICAL ITEMS (90+ days)\n1. Vintage Bluetooth Speaker - 34 units @ $60\n   Total Value: $2,040 | Days: 127\n   Recommendation: FLASH SALE (50% off)\n\n2. Old Model Phone Cases - 78 units @ $20\n   Total Value: $1,560 | Days: 98\n   Recommendation: BUNDLE with new products`,
      generated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-12',
      period_end: '2026-04-10',
    },
    {
      store_id: storeId,
      report_type: 'cohort_analysis' as const,
      content: `CUSTOMER COHORT ANALYSIS\n\nPeriod: January 1 - March 31, 2026\n\nEXECUTIVE SUMMARY\n- New customers acquired: 1,456\n- Average retention rate: 34.2%\n- Revenue from cohorts: $234,560\n\nJANUARY 2026 COHORT\n- New customers: 312\n- Month 1 retention: 72% | Revenue: $58,920\n- Month 2 retention: 58% | Revenue: $46,720\n- Total LTV per customer: $464\n\nKEY INSIGHTS\n- January cohort showing strongest retention\n- Mobile app users show 23% higher retention\n- Month 2-3 retention declining - focus on re-engagement`,
      generated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2025-12-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'discount_performance' as const,
      content: `DISCOUNT PERFORMANCE ANALYSIS\n\nPeriod: Q1 2026\n\nEXECUTIVE SUMMARY\n- Total discount value: $45,670\n- Orders with discounts: 1,847 (54% of all orders)\n- Revenue impact: +$23,450 incremental\n\nDISCOUNT TYPES PERFORMANCE\n\n1. BOGO (Buy One Get One)\n   - Usage: 234 orders | ROI: 4.3x\n   - Revenue lift: +$28,450\n   ✓ Best performing discount type\n\n2. Free Shipping Threshold ($50+)\n   - Usage: 892 orders | ROI: 6.6x\n   - Revenue lift: +$31,280\n   ✓ Highest ROI\n\n3. Percentage Off (20-40%)\n   - Usage: 456 orders | ROI: 2.8x\n   - Margin impact: -12.3%\n   ⚠️ Overuse detected in electronics`,
      generated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'refund_analysis' as const,
      content: `REFUND ANALYSIS REPORT\n\nPeriod: Q1 2026\n\nEXECUTIVE SUMMARY\n- Total refunds: $18,450 (2.1% of revenue)\n- Refund rate by category: Fashion 4.2%, Electronics 1.8%\n\nCATEGORY BREAKDOWN\n\n1. FASHION & APPAREL\n   - Refund rate: 4.2% ($8,940)\n   - Top items: Designer Handbag (12%), Denim Jacket (8%)\n   - Main reason: Size/fit issues (58%)\n   - Trend: ⬆️ 18% increase from Q4\n\n2. ELECTRONICS\n   - Refund rate: 1.8% ($3,240)\n   - Main reason: Defective DOA (45%)\n   - Trend: ⬇️ 12% decrease from Q4\n\nRECOMMENDATIONS\n1. Implement size recommendation engine for fashion\n2. Add quality control checkpoint for electronics\n3. Consider restocking fee for high-value fashion items`,
      generated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'customer_segments' as const,
      content: `CUSTOMER LTV SEGMENTATION REPORT\n\nTotal Customers Analyzed: 3,421\n\nSEGMENT BREAKDOWN\n\n1. CHAMPIONS (Top 10%)\n   - Count: 156 customers\n   - Avg LTV: $2,840\n   - Revenue Contribution: 32.5%\n   - Strategy: VIP treatment, exclusive previews\n\n2. LOYAL CUSTOMERS (Next 20%)\n   - Count: 289 customers\n   - Avg LTV: $1,680\n   - Revenue Contribution: 28.2%\n   - Strategy: Regular communication, cross-sell\n\n3. AT-RISK (Next 15%)\n   - Count: 234 customers\n   - Avg LTV: $920\n   - Revenue Contribution: 12.3%\n   - Strategy: Re-engagement campaigns\n\nKEY INSIGHTS\n- Top 30% generate 79.4% of revenue\n- New customer volume up 61% QoQ\n- Champions LTV up 23% YoY`,
      generated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2025-04-01',
      period_end: '2026-04-01',
    },
  ]

  const { error: reportsError } = await supabase
    .from('reports')
    .insert(reports)

  if (reportsError && !reportsError.message.includes('duplicate')) {
    console.error('Error creating reports:', reportsError)
  }

  console.log('✅ Demo data seeded successfully!')
  console.log(`Store: ${storeId}`)
  console.log(`- ${metrics.length} days of metrics`)
  console.log(`- ${activities.length} activity logs`)
  console.log(`- ${alerts.length} active alerts`)
  console.log(`- ${reports.length} reports`)
}

// Auto-seed on first load if in demo mode
if (isDemoMode) {
  seedDemoData().catch(console.error)
}