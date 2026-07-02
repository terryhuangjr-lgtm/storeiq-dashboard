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

// Reorder & Transfer Module Types
export interface InventoryVariant {
  inventory_item_id: string;
  product_title: string;
  variant_title: string | null;
  variant_id: string;
}

export interface ReorderThreshold {
  id: string;
  store_id: string;
  variant_id: string;
  product_title: string;
  variant_title: string | null;
  threshold_qty: number;
  suggested_reorder_qty: number;
  supplier_name: string;
  lead_time_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  store_id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  store_id: string;
  po_number: string;
  supplier_name: string;
  status: string;
  items: any[];
  total_items: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ReorderQueueItem {
  id: string;
  store_id: string;
  variant_id: string;
  product_title: string;
  variant_title: string | null;
  current_qty: number;
  threshold_qty: number;
  suggested_reorder_qty: number;
  supplier_name: string;
  lead_time_days: number;
  urgency_score: number;
  status: string;
  last_checked: string;
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