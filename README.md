# StoreIQ Dashboard

Professional client-facing analytics dashboard for Shopify store operators.

## Overview

StoreIQ is a comprehensive analytics platform that connects to your Shopify store via the Hermes agent and provides real-time insights into sales performance, inventory status, customer behavior, and business metrics.

## Features

### 📊 Overview Dashboard
- Real-time revenue and order metrics
- 30-day revenue trend visualization
- Active alerts monitoring
- Recent agent activity feed

### 📈 Sales Intelligence
- Product velocity analysis
- Top and bottom performers
- Acquisition channel breakdown
- Projected revenue forecasts
- Pattern recognition (Bestsellers, Seasonal, New Launch, Declining)

### 🚨 Inventory Alerts
- Real-time stock level monitoring
- Dead inventory identification
- Reorder point alerts
- Stockout risk warnings

### 👥 Customer Insights
- RFM segmentation (Champions, Loyal, At-Risk, Lost, New, One-Time)
- Customer lifetime value tracking
- Cohort retention analysis
- At-risk customer identification

### 📋 Reports Archive
- Sales Velocity Reports
- Smart Reorder Alerts
- Dead Inventory Analysis
- Customer Cohort Analysis
- Discount Performance
- Refund Analysis
- Customer LTV Segmentation

### 📜 Agent Activity Log
- Complete audit trail of Hermes actions
- Success/warning/error status tracking
- Detailed execution logs
- Proof of work documentation

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Supabase account (for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/storeiq-dashboard.git
cd storeiq-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Mode

If no Supabase credentials are provided, the app runs in demo mode with seeded data.

## Database Schema

### Tables

- **stores**: Client store information
- **reports**: Generated analytics reports
- **activity_log**: Hermes agent activity history
- **alerts**: Active alerts requiring attention
- **metrics**: Key performance indicators

See `src/lib/types.ts` for detailed type definitions.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Design System

### Colors

- **Sidebar**: Dark navy (#0F172A)
- **Main Background**: Light gray (#F8FAFC)
- **Cards**: White
- **Primary Accent**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)
- **Critical**: Purple (#7C3AED)

### Typography

- **Font**: Inter (sans-serif)
- **Weights**: 300, 400, 500, 600, 700

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy!

### Supabase Setup

Run the following SQL to create tables:

```sql
-- Stores table
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  shopify_domain text not null,
  owner_email text not null,
  created_at timestamp default now()
);

-- Reports table
create table reports (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id),
  report_type text not null,
  content text not null,
  generated_at timestamp default now(),
  period_start date,
  period_end date
);

-- Activity log table
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id),
  action text not null,
  summary text not null,
  details text,
  status text default 'success',
  created_at timestamp default now()
);

-- Alerts table
create table alerts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id),
  alert_type text not null,
  severity text not null,
  title text not null,
  description text not null,
  product_name text,
  value numeric,
  is_resolved boolean default false,
  created_at timestamp default now()
);

-- Metrics table
create table metrics (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id),
  metric_date date not null,
  revenue_today numeric,
  orders_today integer,
  revenue_7day numeric,
  orders_7day integer,
  revenue_30day numeric,
  orders_30day integer,
  top_product text,
  avg_order_value numeric,
  new_customers integer,
  returning_customers integer,
  created_at timestamp default now()
);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with 💙 for Shopify merchants**