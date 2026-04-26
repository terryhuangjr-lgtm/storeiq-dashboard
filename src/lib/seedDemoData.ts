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
      top_product: 'Supergel V Gloves',
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
      summary: 'Analyzed Superare fight gear inventory for velocity trends',
      details: 'Top categories: Boxing Gloves (+23%), Training Gear (+12%), Apparel (+8%)',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Updated Reorder Alerts',
      summary: 'Identified 23 fight gear products below reorder threshold',
      details: 'Top priority: Supergel V Gloves (5 pairs remaining)',
      status: 'warning' as const,
    },
    {
      store_id: storeId,
      action: 'Customer Segmentation Analysis',
      summary: 'Updated RFM segments for 3,421 boxing customers',
      details: '156 professional fighters moved to Champions segment',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Refund Pattern Detection',
      summary: 'Detected unusual refund spike in Boxing Gloves category',
      details: '12% increase vs. 30-day average. Sizing issues with leather gloves.',
      status: 'error' as const,
    },
    {
      store_id: storeId,
      action: 'Generated Dead Inventory Report',
      summary: 'Identified $8,940 in stagnant fight gear inventory',
      details: '47 products stagnant for 90+ days. Flash sale recommended for Legacy collection.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Processed Automated Reorders',
      summary: 'Submitted 15 purchase orders for fight gear to suppliers',
      details: 'Total value: $45,670. Expected delivery: 5-7 business days.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Discount Performance Analysis',
      summary: 'Analyzed Q1 discount campaigns for boxing equipment',
      details: 'BOGO promotions showing 4.3x ROI on glove bundles. Recommend strategy shift.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Mobile App User Review',
      summary: 'Analyzed mobile engagement for Superare app users',
      details: 'DAU up 34% MoM. Push notification open rate: 67%.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Competitor Price Monitoring',
      summary: 'Checked pricing across 15 fight gear competitors',
      details: '342 price changes detected. 78% of Superare products competitively priced.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Email Campaign Performance',
      summary: 'Q1 email marketing analysis for boxing community',
      details: 'Open rate: 34.2%. Revenue generated: $89,450. Top: Championship Collection launch.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Returns Analysis Complete',
      summary: 'Q1 return patterns analyzed for fight gear',
      details: 'Leather headgear return rate: 8.2%. Enhanced sizing guides recommended.',
      status: 'error' as const,
    },
    {
      store_id: storeId,
      action: 'Loyalty Program Review',
      summary: 'Analyzed 2,847 Superare Fight Club members',
      details: 'Active members: 66.5%. ROI: 4.2x. Diamond tier recommended for pros.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Seasonal Forecast Updated',
      summary: 'Q2 demand forecast for boxing equipment generated',
      details: 'Expected revenue: $1.45M. Training gear (+45%) leading growth.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Content Marketing Review',
      summary: 'Q1 blog performance for fight gear content',
      details: '24 posts generated 30,000+ visits. Technique guides performing best.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Abandoned Cart Recovery',
      summary: 'Sent recovery emails for 847 abandoned boxing gear carts',
      details: 'Recovery rate: 12.4%. $15,230 recovered. Recommend frequency increase.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Supplier Price Updates',
      summary: 'Updated pricing for 156 fight gear products',
      details: 'Average increase: 3.2%. 23 leather glove products flagged for margin review.',
      status: 'warning' as const,
    },
    {
      store_id: storeId,
      action: 'Inventory Sync Completed',
      summary: 'Synced 2,847 Superare products with Shopify',
      details: '56 discrepancies detected. 12 sync conflicts resolved.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Customer LTV Recalculation',
      summary: 'Updated lifetime value for boxing customer segments',
      details: 'Champions avg LTV: $2,840. At-Risk recoverable: $15,420.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Product Description Updates',
      summary: 'Optimized 234 fight gear product descriptions',
      details: 'SEO improvements: +23% keyword density. Expected traffic: +18%.',
      status: 'success' as const,
    },
    {
      store_id: storeId,
      action: 'Generated Cohort Analysis',
      summary: 'Multi-month cohort retention for boxing customers',
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
      title: 'Stockout Risk: Supergel V Gloves',
      description: 'Only 5 pairs remaining. Projected stockout in 3 days.',
      product_name: 'Supergel V Gloves',
      value: 5,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'stockout_risk' as const,
      severity: 'high' as const,
      title: 'Stockout Risk: S40 Italian Leather Lace Up',
      description: '12 pairs remaining. High velocity championship item.',
      product_name: 'S40 Italian Leather Lace Up Gloves',
      value: 12,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'dead_inventory' as const,
      severity: 'high' as const,
      title: 'Dead Inventory: Legacy Tee',
      description: '47 units stagnant for 90+ days',
      product_name: 'Legacy Tee',
      value: 47,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'dead_inventory' as const,
      severity: 'medium' as const,
      title: 'Slow Moving: One Series Leather Headgear',
      description: '23 units stagnant for 75 days',
      product_name: 'One Series Leather Headgear',
      value: 23,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'high_return_rate' as const,
      severity: 'medium' as const,
      title: 'High Return Rate: Enorme 2-in-1 Gear Bag',
      description: 'Returns up 18% this month. Quality control check recommended.',
      product_name: 'Enorme 2-in-1 Gear Bag 83L',
      value: 18,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'at_risk_customer' as const,
      severity: 'medium' as const,
      title: 'At-Risk: VIP Fighter Segment',
      description: '23 professional fighters showing reduced engagement',
      product_name: undefined,
      value: 23,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'discount_overuse' as const,
      severity: 'low' as const,
      title: 'Discount Overuse: Boxing Club Tees',
      description: 'Teens boxing tees discounts impacting margins (-8%)',
      product_name: 'Boxing Club NYC Tee',
      value: 8,
      is_resolved: false,
    },
    {
      store_id: storeId,
      alert_type: 'revenue_anomaly' as const,
      severity: 'high' as const,
      title: 'Revenue Anomaly: Leather Gloves Category',
      description: 'Tuesday revenue 45% below expected for premium gloves',
      product_name: undefined,
      value: 45,
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
      content: `SALES VELOCITY REPORT\n\nPeriod: March 1 - March 31, 2026\nStore: Superare - Premium fight gear brand\n\nEXECUTIVE SUMMARY\n- Total SKUs analyzed: 234\n- Top velocity products: 12\n- Inventory turnover: 4.2x\n\nTOP PERFORMERS\n1. Supergel V Gloves - 1,247 pairs sold\n   Category: Boxing Gloves | $149\n   Velocity Score: 94/100\n   Trend: ↗️ Strong upward (+23% MoM)\n   Recommendation: Increase stock by 40%\n\n2. Supergel Pro Gloves - 892 pairs sold\n   Category: Boxing Gloves | $129\n   Velocity Score: 87/100\n   Trend: ↗️ Moderate growth (+18% MoM)\n   Recommendation: Maintain current stock\n\n3. World Champion Tee - 2,103 units sold\n   Category: Apparel | $45\n   Velocity Score: 91/100\n   Trend: ↗️ Strong upward (+45% MoM)\n   Recommendation: Urgent restock required\n\nSTEADY SELLERS\n- Superare Hand Wraps ($25): 1,456 units\n- Fundamental 2.0 Shorts ($65): 567 units\n- Finisher Dad Hat ($35): 445 units\n\nBOTTOM PERFORMERS\n1. One Series No Foul Protector - 23 units\n   Category: Protective Gear | $89\n   Velocity Score: 12/100\n   Trend: ↘️ Declining (-34% MoM)\n   Recommendation: Consider clearance sale\n\nPATTERNS DETECTED\n- Weekend surge in glove sales (+42%)\n- Declining interest in protective gear\n- Premium tier showing strongest growth\n\nACTION ITEMS\n- Reorder Supergel V gloves immediately\n- Reduce Legacy Tee stock by 50%\n- Bundle slow-moving headgear\n- Increase premium glove allocation`,
      generated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-03-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'reorder_alerts' as const,
      content: `SMART REORDER ALERTS\n\nGenerated: April 15, 2026\nStore: Superare\n\nCRITICAL ALERTS (Immediate Action Required)\n⚠️ Supergel V Gloves - 5 pairs remaining\n   Coverage: 3 days at current velocity\n   Reorder Qty: 100 pairs\n   Supplier: Superare Manufacturing\n\n⚠️ S40 Italian Leather Lace Up - 12 pairs remaining\n   Coverage: 8 days at current velocity\n   Reorder Qty: 50 pairs\n   Supplier: Superare Manufacturing\n\n⚠️ World Champion Tee - 156 units remaining\n   Coverage: 5 days at current velocity\n   Reorder Qty: 500 units\n   Supplier: Superare Apparel\n\nHIGH PRIORITY ALERTS (Within 7 Days)\n🟡 Supergel Pro Gloves - 8 pairs remaining\n   Coverage: 12 days at current velocity\n   Reorder Qty: 75 pairs\n\n🟡 Fundamental 2.0 Shorts - 45 units remaining\n   Coverage: 15 days at current velocity\n   Reorder Qty: 100 units\n\nMEDIUM PRIORITY (Monitor)\n🟢 Superare Hand Wraps - 89 units remaining\n   Coverage: 22 days at current velocity\n   Reorder Qty: 200 units\n\nAUTOMATED ACTIONS TAKEN\n- Purchase orders created for critical items\n- Supplier notifications sent\n- Stock level warnings updated in system`,
      generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-04-01',
      period_end: '2026-04-14',
    },
    {
      store_id: storeId,
      report_type: 'dead_inventory' as const,
      content: `DEAD INVENTORY ANALYSIS\n\nReport Date: April 10, 2026\nStore: Superare\nAnalysis Period: Last 90 days\n\nOVERVIEW\n- Total dead stock value: $8,940\n- Total units affected: 234\n- Average days stagnant: 127 days\n- Top affected category: Protective Gear\n\nCRITICAL ITEMS (90+ days, $5,000+ value)\n1. Legacy Tee - 156 units @ $38\n   Total Value: $5,928 | Days: 127\n   Category: Apparel | Status: Dead\n   Recommendation: FLASH SALE (50% off)\n\n2. One Series No Foul Protector - 34 units @ $89\n   Total Value: $3,026 | Days: 127\n   Category: Protective Gear | Status: Dead\n   Recommendation: BUNDLE with glove orders\n\nMEDIUM PRIORITY (60-89 days)\n3. One Series Leather Headgear - 45 units @ $149\n   Total Value: $6,705 | Days: 89\n   Category: Protective Gear | Status: Slow\n   Recommendation: PROMO: Buy glove get 50% off\n\n4. Enorme 2-in-1 Gear Bag 83L - 23 units @ $189\n   Total Value: $4,347 | Days: 82\n   Category: Accessories | Status: Slow\n   Recommendation: Bundle with glove purchase\n\nRECOMMENDED ACTIONS\n1. Launch flash sale on Legacy Tees (Week 1)\n2. Create protective gear bundles (Week 2)\n3. Donate items with no movement after 30 days\n4. Write off $5,928 in obsolete apparel\n\nPOTENTIAL RECOVERY: $12,500 (59% of dead stock)`,
      generated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-12',
      period_end: '2026-04-10',
    },
    {
      store_id: storeId,
      report_type: 'cohort_analysis' as const,
      content: `CUSTOMER COHORT ANALYSIS\n\nPeriod: January 1 - March 31, 2026\nStore: Superare\n\nEXECUTIVE SUMMARY\n- New fighters registered: 1,456\n- Average retention rate: 34.2%\n- Revenue from cohorts: $234,560\n\nJANUARY 2026 COHORT (New Fighters)\n- New registrations: 312\n- Month 1 retention: 72% | Revenue: $58,920\n- Month 2 retention: 58% | Revenue: $46,720\n- Month 3 retention: 48% | Revenue: $39,450\n- Top products: Supergel V Gloves, World Champion Tee\n\nDECEMBER 2025 COHORT\n- New registrations: 245\n- Month 1 retention: 68% | Revenue: $45,230\n- Month 2 retention: 52% | Revenue: $38,940\n- Month 3 retention: 45% | Revenue: $32,180\n\nKEY INSIGHTS\n- January cohort showing strongest retention (+8% vs Dec)\n- Mobile app users show 23% higher retention\n- Glove buyers have 45% higher LTV than apparel-only\n- Month 2-3 retention declining - focus on re-engagement\n\nRECOMMENDATIONS\n1. Expand mobile app promotion (higher retention)\n2. Launch re-engagement for month 2-3 fighters\n3. Replicate January acquisition strategy\n4. Implement loyalty program for long-term retention\n5. Bundle gloves with training gear for new fighters`,
      generated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2025-12-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'discount_performance' as const,
      content: `DISCOUNT PERFORMANCE ANALYSIS\n\nPeriod: Q1 2026\nStore: Superare\n\nEXECUTIVE SUMMARY\n- Total discount value: $45,670\n- Orders with discounts: 1,847 (54% of all orders)\n- Revenue impact: +$23,450 incremental\n- Margin impact: -12.3%\n\nDISCOUNT TYPES PERFORMANCE\n\n1. BOGO (Buy One Get One)\n   - Usage: 234 orders | $12,220 total discount\n   - Revenue lift: +$28,450\n   - AOV change: +$45 (25% increase)\n   - Conversion rate: 18.7%\n   - ROI: 4.3x\n   ✓ Best performing - glove & gear bundles\n\n2. Free Shipping Threshold ($75+)\n   - Usage: 892 orders | $6,780 total cost\n   - Revenue lift: +$31,280\n   - AOV change: +$28 (19% increase)\n   - Conversion rate: 12.4%\n   - ROI: 6.6x\n   ✓ Highest ROI for fight gear\n\n3. Percentage Off (20-40% discounts)\n   - Usage: 456 orders | $23,450 total discount\n   - Revenue lift: +$18,920\n   - AOV change: -$12 (7% decrease)\n   - Conversion rate: 14.2%\n   - ROI: 2.8x\n   ⚠️ Overuse in legacy/declining items\n\nCATEGORY BREAKDOWN\n- Boxing Gloves: 38% of discounts, -8% margin\n- Training Gear: 24% of discounts, +12% revenue\n- Protective Gear: 18% of discounts, -15% margin\n- Apparel: 20% of discounts, +8% ROI\n\nRECOMMENDATIONS\n1. Increase BOGO on glove bundles (4.3x ROI)\n2. Expand free shipping program (6.6x ROI)\n3. Reduce percentage discounts on premium gloves\n4. Test category-specific strategies`,
      generated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'refund_analysis' as const,
      content: `REFUND ANALYSIS REPORT\n\nPeriod: Q1 2026\nStore: Superare\n\nEXECUTIVE SUMMARY\n- Total refunds: $18,450 (2.1% of revenue)\n- Refund rate by category: Boxing Gloves 4.2%, Apparel 3.8%\n- Top refund reasons: Sizing (45%), Defective (23%), Changed mind (32%)\n\nCATEGORY BREAKDOWN\n\n1. BOXING GLOVES\n   - Refund rate: 4.2% ($8,940)\n   - Top items: Supergel V Gloves (12%), Supergel Pro (8%)\n   - Main reason: Sizing issues (58%)\n   - Trend: ⬆️ 18% increase from Q4\n\n2. PROTECTIVE GEAR\n   - Refund rate: 3.5% ($3,240)\n   - Top items: Leather Headgear (40%)\n   - Main reason: Comfort fit (45%)\n   - Trend: ⬇️ 12% decrease from Q4\n\n3. APPAREL\n   - Refund rate: 2.8% ($2,880)\n   - Main reason: Sizing (38%)\n   - Trend: ↔️ Stable\n\n4. ACCESSORIES\n   - Refund rate: 1.9% ($3,390)\n   - Main reason: Changed mind (42%)\n   - Trend: ⬆️ 8% increase\n\nFRAUD DETECTION\n- Suspicious refund patterns: 23 orders\n- Total flagged: $3,240\n- Action: Manual review required\n\nRECOMMENDATIONS\n1. Implement sizing guide for all gloves\n2. Enhanced fit descriptions for headgear\n3. Quality control for leather products\n4. Consider restocking fee for premium items`,
      generated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: '2026-01-01',
      period_end: '2026-03-31',
    },
    {
      store_id: storeId,
      report_type: 'customer_segments' as const,
      content: `CUSTOMER LTV SEGMENTATION REPORT\n\nTotal Fighters Analyzed: 3,421\nStore: Superare\nAnalysis Date: April 1, 2026\n\nSEGMENT BREAKDOWN\n\n1. CHAMPIONS (Top 10% - Pro Fighters)\n   - Count: 156 fighters\n   - Avg LTV: $2,840\n   - Revenue Contribution: 32.5% ($384,240)\n   - Avg Orders: 12.4 | Last purchase: 14 days ago\n   - Products: Premium gloves, training gear\n   - Behavior: High engagement, early adopters\n   - Strategy: VIP treatment, exclusive previews\n\n2. LOYAL (Regulars - 20%)\n   - Count: 289 fighters\n   - Avg LTV: $1,680\n   - Revenue Contribution: 28.2% ($331,884)\n   - Avg Orders: 7.2 | Last purchase: 28 days ago\n   - Products: Mix of gear and apparel\n   - Behavior: Consistent purchasers\n   - Strategy: Regular communication, cross-sell\n\n3. POTENTIAL LOYALISTS (15%)\n   - Count: 342 fighters\n   - Avg LTV: $890\n   - Revenue Contribution: 18.7% ($220,266)\n   - Avg Orders: 4.1 | Last purchase: 45 days ago\n   - Products: Entry-level gear\n   - Behavior: Value-conscious\n   - Strategy: Personalized recommendations\n\n4. AT-RISK (15%)\n   - Count: 234 fighters\n   - Avg LTV: $920\n   - Revenue Contribution: 12.3% ($144,972)\n   - Avg Orders: 3.2 | Last purchase: 75 days ago\n   - Products: Declining engagement\n   - Behavior: Haven't purchased in 60-90 days\n   - Strategy: Re-engagement campaigns\n\n5. LOST (20%)\n   - Count: 187 fighters\n   - Avg LTV: $340\n   - Revenue Contribution: 6.8% ($80,520)\n   - Avg Orders: 1.8 | Last purchase: 180+ days ago\n   - Products: One-time purchases\n   - Behavior: Inactive\n   - Strategy: Low-cost reactivation\n\n6. NEW (Recent 3 months)\n   - Count: 423 fighters\n   - Avg LTV: $280 (projected)\n   - Revenue Contribution: 2.5% ($29,488)\n   - Avg Orders: 1.2 | Last purchase: 21 days ago\n   - Behavior: Testing brand\n   - Strategy: Onboarding series\n\nKEY INSIGHTS\n- Top 30% generate 79.4% of revenue\n- At-Risk: $15,420 recoverable revenue\n- New customer volume up 61% QoQ\n- Champions LTV up 23% YoY\n\nACTION PLAN\n1. Launch Champions VIP program\n2. Deploy win-back for At-Risk\n3. Onboarding for New fighters\n4. Referral program for Loyal\n5. Glove + gear bundles for all segments`,
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