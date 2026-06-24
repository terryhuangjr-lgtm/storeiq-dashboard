import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (_req) => {
  try {
    // 1. Upsert store (service role bypasses RLS)
    const { error: storeError } = await supabase
      .from('stores')
      .upsert([{
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Superare',
        shopify_domain: 'superare-demo.myshopify.com',
        owner_email: 'owner@superare.com',
        description: 'Premium fight gear and boxing equipment brand based in New York City.',
        currency: 'USD',
        timezone: 'America/New_York',
        plan: 'professional',
        is_active: true,
      }], { onConflict: 'id', ignoreDuplicates: false })

    if (storeError) {
      return new Response(JSON.stringify({ error: `Store: ${storeError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 2. Upsert metrics (30 days)
    const metrics = []
    const baseRevenue = 45000
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const revenue = baseRevenue + (isWeekend ? 15000 : 0) + Math.random() * 10000 - 5000
      const orders = Math.floor(revenue / 85) + Math.floor(Math.random() * 20)
      metrics.push({
        store_id: '00000000-0000-0000-0000-000000000001',
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

    const { error: metricsError } = await supabase.from('metrics').upsert(metrics, { ignoreDuplicates: false })
    if (metricsError) {
      return new Response(JSON.stringify({ error: `Metrics: ${metricsError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 3. Activity logs
    const activities = [
      { action: 'Generated Sales Velocity Report', summary: 'Analyzed Superare fight gear inventory for velocity trends', details: 'Top categories: Boxing Gloves (+23%), Training Gear (+12%), Apparel (+8%)', status: 'success' },
      { action: 'Updated Reorder Alerts', summary: 'Identified 23 fight gear products below reorder threshold', details: 'Top priority: Supergel V Gloves (5 pairs remaining)', status: 'warning' },
      { action: 'Customer Segmentation Analysis', summary: 'Updated RFM segments for 3,421 boxing customers', details: '156 professional fighters moved to Champions segment', status: 'success' },
      { action: 'Refund Pattern Detection', summary: 'Detected unusual refund spike in Boxing Gloves category', details: '12% increase vs. 30-day average. Sizing issues with leather gloves.', status: 'error' },
      { action: 'Generated Dead Inventory Report', summary: 'Identified $8,940 in stagnant fight gear inventory', details: '47 products stagnant for 90+ days.', status: 'success' },
      { action: 'Processed Automated Reorders', summary: 'Submitted 15 purchase orders for fight gear to suppliers', details: 'Total value: $45,670', status: 'success' },
      { action: 'Discount Performance Analysis', summary: 'Analyzed Q1 discount campaigns for boxing equipment', details: 'BOGO promotions showing 4.3x ROI', status: 'success' },
      { action: 'Competitor Price Monitoring', summary: 'Checked pricing across 15 fight gear competitors', details: '342 price changes detected', status: 'success' },
      { action: 'Email Campaign Performance', summary: 'Q1 email marketing analysis', details: 'Open rate: 34.2%', status: 'success' },
      { action: 'Returns Analysis Complete', summary: 'Q1 return patterns analyzed', details: 'Leather headgear return rate: 8.2%', status: 'error' },
      { action: 'Loyalty Program Review', summary: 'Analyzed 2,847 Superare Fight Club members', details: 'Active members: 66.5%', status: 'success' },
      { action: 'Seasonal Forecast Updated', summary: 'Q2 demand forecast for boxing equipment', details: 'Expected revenue: $1.45M', status: 'success' },
      { action: 'Content Marketing Review', summary: 'Q1 blog performance for fight gear content', details: '24 posts generated 30,000+ visits', status: 'success' },
      { action: 'Abandoned Cart Recovery', summary: 'Sent recovery emails for 847 abandoned boxing gear carts', details: 'Recovery rate: 12.4%', status: 'success' },
      { action: 'Supplier Price Updates', summary: 'Updated pricing for 156 fight gear products', details: 'Average increase: 3.2%', status: 'warning' },
      { action: 'Inventory Sync Completed', summary: 'Synced 2,847 Superare products with Shopify', details: '56 discrepancies detected', status: 'success' },
      { action: 'Customer LTV Recalculation', summary: 'Updated lifetime value for boxing customer segments', details: 'Champions avg LTV: $2,840', status: 'success' },
      { action: 'Product Description Updates', summary: 'Optimized 234 fight gear product descriptions', details: 'SEO improvements: +23%', status: 'success' },
      { action: 'Generated Cohort Analysis', summary: 'Multi-month cohort retention', details: 'January cohort: 72% retention', status: 'success' },
      { action: 'Mobile App Performance Review', summary: 'Analyzed Superare mobile app user engagement', details: 'DAU up 34% MoM', status: 'success' },
    ]
    const activitiesWithDates = activities.map((a, i) => ({
      store_id: '00000000-0000-0000-0000-000000000001',
      ...a,
      created_at: new Date(Date.now() - i * 6 * 3600000).toISOString(),
    }))

    const { error: activitiesError } = await supabase.from('activity_log').upsert(activitiesWithDates, { ignoreDuplicates: false })
    if (activitiesError) {
      return new Response(JSON.stringify({ error: `Activities: ${activitiesError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 4. Alerts
    const alerts = [
      { alert_type: 'stockout_risk', severity: 'critical', title: 'Stockout Risk: Supergel V Gloves', description: 'Only 5 pairs remaining. Projected stockout in 3 days.', product_name: 'Supergel V Gloves', value: 5, is_resolved: false },
      { alert_type: 'stockout_risk', severity: 'high', title: 'Stockout Risk: S40 Italian Leather Lace Up', description: '12 pairs remaining.', product_name: 'S40 Italian Leather Lace Up Gloves', value: 12, is_resolved: false },
      { alert_type: 'dead_inventory', severity: 'high', title: 'Dead Inventory: Legacy Tee', description: '47 units stagnant for 90+ days', product_name: 'Legacy Tee', value: 47, is_resolved: false },
      { alert_type: 'dead_inventory', severity: 'medium', title: 'Slow Moving: One Series Leather Headgear', description: '23 units stagnant for 75 days', product_name: 'One Series Leather Headgear', value: 23, is_resolved: false },
      { alert_type: 'high_return_rate', severity: 'medium', title: 'High Return Rate: Enorme 2-in-1 Gear Bag', description: 'Returns up 18% this month.', product_name: 'Enorme 2-in-1 Gear Bag 83L', value: 18, is_resolved: false },
      { alert_type: 'at_risk_customer', severity: 'medium', title: 'At-Risk: VIP Fighter Segment', description: '23 professional fighters showing reduced engagement', value: 23, is_resolved: false },
      { alert_type: 'discount_overuse', severity: 'low', title: 'Discount Overuse: Boxing Club Tees', description: 'Teens boxing tees discounts impacting margins (-8%)', product_name: 'Boxing Club NYC Tee', value: 8, is_resolved: false },
      { alert_type: 'revenue_anomaly', severity: 'high', title: 'Revenue Anomaly: Leather Gloves Category', description: 'Tuesday revenue 45% below expected', value: 45, is_resolved: false },
    ]

    const { error: alertsError } = await supabase.from('alerts').upsert(
      alerts.map(a => ({ store_id: '00000000-0000-0000-0000-000000000001', ...a })),
      { ignoreDuplicates: false }
    )
    if (alertsError) {
      return new Response(JSON.stringify({ error: `Alerts: ${alertsError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 5. Product performance
    const products = [
      { name: 'Supergel V Gloves', units_sold: 1247, revenue: 149640, trend: 23, pattern: 'BESTSELLER' },
      { name: 'Supergel Pro Gloves', units_sold: 892, revenue: 133800, trend: 18, pattern: 'BESTSELLER' },
      { name: 'World Champion Tee', units_sold: 2103, revenue: 94635, trend: 45, pattern: 'SEASONAL' },
      { name: 'S40 Italian Leather Lace Up', units_sold: 334, revenue: 46760, trend: 22, pattern: 'NEW LAUNCH' },
      { name: 'Fundamental 2.0 Shorts', units_sold: 567, revenue: 36855, trend: 12, pattern: 'BESTSELLER' },
      { name: 'Superare Hand Wraps', units_sold: 445, revenue: 11125, trend: -8, pattern: 'DECLINING' },
      { name: 'Boxing Club NYC Tee', units_sold: 389, revenue: 17505, trend: 15, pattern: 'BESTSELLER' },
      { name: 'One Series Leather Headgear', units_sold: 256, revenue: 38144, trend: 31, pattern: 'SEASONAL' },
      { name: 'Finisher Dad Hat', units_sold: 189, revenue: 3591, trend: -5, pattern: 'DECLINING' },
    ]

    const { error: productError } = await supabase.from('product_performance').upsert(
      products.map(p => ({ store_id: '00000000-0000-0000-0000-000000000001', ...p })),
      { ignoreDuplicates: false }
    )
    if (productError) {
      return new Response(JSON.stringify({ error: `Products: ${productError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 6. Channel breakdown
    const channels = [
      { channel: 'Direct', revenue: 456780, percentage: 36.8, order_count: 2840 },
      { channel: 'Google Ads', revenue: 324560, percentage: 26.2, order_count: 1830 },
      { channel: 'Instagram', revenue: 234890, percentage: 19.0, order_count: 1250 },
      { channel: 'Email', revenue: 158760, percentage: 12.8, order_count: 980 },
      { channel: 'Facebook', revenue: 65410, percentage: 5.2, order_count: 420 },
    ]

    const { error: channelError } = await supabase.from('channel_breakdown').upsert(
      channels.map(c => ({ store_id: '00000000-0000-0000-0000-000000000001', ...c })),
      { ignoreDuplicates: false }
    )
    if (channelError) {
      return new Response(JSON.stringify({ error: `Channels: ${channelError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 7. Customers
    const customers = [
      { name: 'Mike Tyson Jr.', email: 'mike@boxingpro.com', total_orders: 47, lifetime_value: 12450, last_order: '2026-05-20', segment: 'Champions' },
      { name: 'Canelo Alvarez', email: 'canelo@boxingpro.com', total_orders: 38, lifetime_value: 11200, last_order: '2026-05-18', segment: 'Champions' },
      { name: 'Ryan Garcia', email: 'ryan@boxingpro.com', total_orders: 29, lifetime_value: 8900, last_order: '2026-05-15', segment: 'Champions' },
      { name: 'Gervonta Davis', email: 'tank@boxingpro.com', total_orders: 34, lifetime_value: 9820, last_order: '2026-05-22', segment: 'Champions' },
      { name: 'Shakur Stevenson', email: 'shakur@boxingpro.com', total_orders: 22, lifetime_value: 7400, last_order: '2026-05-10', segment: 'Loyal' },
      { name: 'Devin Haney', email: 'devin@boxingpro.com', total_orders: 18, lifetime_value: 5600, last_order: '2026-05-08', segment: 'Loyal' },
      { name: 'Tevin Farmer', email: 'tevin@boxingpro.com', total_orders: 12, lifetime_value: 3800, last_order: '2026-04-28', segment: 'Loyal' },
      { name: 'Amanda Serrano', email: 'amanda@boxingpro.com', total_orders: 25, lifetime_value: 8100, last_order: '2026-05-19', segment: 'Champions' },
      { name: 'Claressa Shields', email: 'claressa@boxingpro.com', total_orders: 20, lifetime_value: 6700, last_order: '2026-05-12', segment: 'Loyal' },
      { name: 'Katie Taylor', email: 'katie@boxingpro.com', total_orders: 15, lifetime_value: 4900, last_order: '2026-05-05', segment: 'Loyal' },
      { name: 'Andy Cruz', email: 'andy@boxingpro.com', total_orders: 8, lifetime_value: 2100, last_order: '2026-04-15', segment: 'Potential Loyalists' },
      { name: 'Keyshawn Davis', email: 'keyshawn@boxingpro.com', total_orders: 6, lifetime_value: 1800, last_order: '2026-04-10', segment: 'Potential Loyalists' },
      { name: 'Jaron Ennis', email: 'boots@boxingpro.com', total_orders: 10, lifetime_value: 3200, last_order: '2026-05-01', segment: 'Loyal' },
      { name: 'Vergil Ortiz Jr.', email: 'vergil@boxingpro.com', total_orders: 5, lifetime_value: 1500, last_order: '2026-03-20', segment: 'At-Risk' },
      { name: 'Xander Zayas', email: 'xander@boxingpro.com', total_orders: 3, lifetime_value: 900, last_order: '2026-02-15', segment: 'At-Risk' },
    ]

    const { error: customersError } = await supabase.from('customers').upsert(
      customers.map(c => ({ store_id: '00000000-0000-0000-0000-000000000001', ...c })),
      { ignoreDuplicates: false }
    )
    if (customersError) {
      return new Response(JSON.stringify({ error: `Customers: ${customersError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 8. Customer segments
    const segments = [
      { segment: 'Champions', count: 156, revenue_percentage: 32.5, avg_ltv: 2840, color: '#F59E0B' },
      { segment: 'Loyal', count: 289, revenue_percentage: 28.2, avg_ltv: 1680, color: '#10B981' },
      { segment: 'Potential Loyalists', count: 342, revenue_percentage: 18.7, avg_ltv: 890, color: '#3B82F6' },
      { segment: 'At-Risk', count: 234, revenue_percentage: 12.3, avg_ltv: 920, color: '#EF4444' },
      { segment: 'Lost', count: 187, revenue_percentage: 6.8, avg_ltv: 340, color: '#6B7280' },
      { segment: 'New', count: 423, revenue_percentage: 1.5, avg_ltv: 280, color: '#8B5CF6' },
    ]

    const { error: segmentsError } = await supabase.from('customer_segments').upsert(
      segments.map(s => ({ store_id: '00000000-0000-0000-0000-000000000001', ...s })),
      { ignoreDuplicates: false }
    )
    if (segmentsError) {
      return new Response(JSON.stringify({ error: `Segments: ${segmentsError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // 9. Cohort data
    const cohorts = [
      { month: '2026-01', new_customers: 312, returning_customers: 225 },
      { month: '2026-02', new_customers: 278, returning_customers: 198 },
      { month: '2026-03', new_customers: 345, returning_customers: 256 },
      { month: '2026-04', new_customers: 298, returning_customers: 210 },
      { month: '2026-05', new_customers: 167, returning_customers: 134 },
    ]

    const { error: cohortsError } = await supabase.from('cohort_data').upsert(
      cohorts.map(c => ({ store_id: '00000000-0000-0000-0000-000000000001', ...c })),
      { ignoreDuplicates: false }
    )
    if (cohortsError) {
      return new Response(JSON.stringify({ error: `Cohorts: ${cohortsError.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true, message: 'Demo data seeded successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
