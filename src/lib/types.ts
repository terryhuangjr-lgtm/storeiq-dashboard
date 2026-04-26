export interface Store {
  id: string;
  name: string;
  shopify_domain: string;
  owner_email: string;
  description?: string;
  created_at: string;
}

export interface Report {
  id: string;
  store_id: string;
  report_type: ReportType;
  content: string;
  generated_at: string;
  period_start?: string;
  period_end?: string;
}

export type ReportType = 
  | 'sales_velocity'
  | 'reorder_alerts'
  | 'dead_inventory'
  | 'cohort_analysis'
  | 'discount_performance'
  | 'refund_analysis'
  | 'customer_segments';

export interface ActivityLog {
  id: string;
  store_id: string;
  action: string;
  summary: string;
  details?: string;
  status: 'success' | 'warning' | 'error';
  created_at: string;
}

export interface Alert {
  id: string;
  store_id: string;
  alert_type: AlertType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  product_name?: string;
  value?: number;
  is_resolved: boolean;
  created_at: string;
}

export type AlertType = 
  | 'stockout_risk'
  | 'dead_inventory'
  | 'high_return_rate'
  | 'at_risk_customer'
  | 'discount_overuse'
  | 'revenue_anomaly';

export interface Metrics {
  id: string;
  store_id: string;
  metric_date: string;
  revenue_today?: number;
  orders_today?: number;
  revenue_7day?: number;
  orders_7day?: number;
  revenue_30day?: number;
  orders_30day?: number;
  top_product?: string;
  avg_order_value?: number;
  new_customers?: number;
  returning_customers?: number;
  created_at: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface ProductPerformance {
  name: string;
  unitsSold: number;
  revenue: number;
  trend: number;
  pattern: 'BESTSELLER' | 'SEASONAL' | 'NEW LAUNCH' | 'DECLINING';
}

export interface ChannelBreakdown {
  channel: string;
  revenue: number;
  percentage: number;
}

export interface RFMSegment {
  segment: string;
  count: number;
  revenuePercentage: number;
  avgLTV: number;
  color: string;
}

export interface CohortData {
  month: string;
  new: number;
  returning: number;
}

export interface Customer {
  name: string;
  email: string;
  totalOrders: number;
  lifetimeValue: number;
  lastOrder: string;
  segment: string;
}