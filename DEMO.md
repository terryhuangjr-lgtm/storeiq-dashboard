# StoreIQ Demo Guide

## Quick Start

### Option 1: Demo Mode (No Supabase Required)

The application includes a demo mode that runs without requiring a Supabase connection. This is perfect for testing and demonstrations.

1. Clone and install:
```bash
git clone https://github.com/your-username/storeiq-dashboard.git
cd storeiq-dashboard
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

4. Use demo credentials:
   - Email: `demo@storeiq.com`
   - Password: `demo123`

The app will automatically seed demo data on first load.

### Option 2: With Supabase

1. Create a Supabase project at https://supabase.com

2. Run the schema SQL in the Supabase SQL editor:
```sql
-- Run the schema from README.md
```

3. Create a `.env.local` file:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the app:
```bash
npm run dev
```

## Features Demo

### Dashboard Overview
- Real-time metrics cards showing today's revenue, orders, AOV, and alerts
- 30-day revenue trend chart
- Active alerts panel with severity badges
- Recent activity feed from Hermes agent

### Sales Intelligence
1. Navigate to "Sales Intelligence"
2. View top 10 products by velocity
3. Check pattern badges (Bestsellers, Seasonal, New Launch, Declining)
4. See acquisition channel breakdown
5. Review projected revenue for next 30 days

### Inventory Alerts
1. Navigate to "Inventory Alerts"
2. View alerts by severity (Critical, High, Medium, Low)
3. Check stock levels and days remaining
4. See dead inventory recommendations
5. Use "Mark Reviewed" buttons

### Customer Insights
1. Navigate to "Customer Insights"
2. View RFM segments with LTV metrics
3. Check at-risk customer alerts
4. Review top customers table
5. Analyze cohort retention data

### Reports Archive
1. Navigate to "All Reports"
2. View 7 different report types
3. Click "View Full Report" to see complete analysis
4. Download reports as text files
5. Each report includes:
   - Executive summary
   - Detailed analysis
   - Actionable recommendations

### Agent Activity Log
1. Navigate to "Agent Activity Log"
2. Filter by status (All, Success, Warning, Error)
3. Search for specific actions
4. View chronological feed of Hermes actions
5. Expand entries to see detailed execution logs
6. Shows proof of AI agent doing real work

## Sample Data Included

### Store
- **Superare** - Premium fashion retailer
- Shopify domain: superare-demo.myshopify.com

### 30 Days of Metrics
- Daily revenue: $3,000 - $8,000
- Weekend spikes included
- Realistic growth patterns

### 15 Activity Logs
- Spread across 7 days
- Mix of success, warning, and error statuses
- Shows Hermes performing various tasks

### 8 Active Alerts
- 2 Critical (stockout risk)
- 2 High
- 2 Medium
- 2 Low

### 7 Reports
- Sales Velocity
- Reorder Alerts
- Dead Inventory
- Cohort Analysis
- Discount Performance
- Refund Analysis
- Customer Segmentation

## UI Walkthrough

### Login Page
- Clean centered design
- StoreIQ logo with tagline
- Email/password inputs
- Demo data seeding button

### Main Dashboard
- Dark sidebar navigation
- Light main content area
- Responsive layout (mobile + desktop)
- Store selector dropdown
- User menu with sign out

### Key Interactions
- Date range filters
- Search functionality
- Export buttons
- Modal dialogs for detail views
- Hover states on all cards
- Status badges with colors
- Trend indicators (up/down arrows)

## Testing the Full Flow

1. **Login** with demo credentials
2. **Review Overview** - Check today's metrics
3. **Explore Sales Intelligence** - Identify top products
4. **Check Inventory Alerts** - Review stock levels
5. **Analyze Customers** - View segment performance
6. **Browse Reports** - Read generated insights
7. **Monitor Activity** - See Hermes in action

## What Makes This Professional

✓ Clean, modern SaaS aesthetic  
✓ Client-ready interface  
✓ Realistic demo data  
✓ Complete feature set  
✓ Responsive design  
✓ Professional typography  
✓ Thoughtful color scheme  
✓ Smooth interactions  
✓ Mobile-friendly layout  
✓ Comprehensive documentation  

## Next Steps for Production

1. Connect real Supabase instance
2. Configure Shopify webhook integration
3. Set up Hermes agent automation
4. Add user authentication
5. Configure email alerts
6. Set up Vercel deployment
7. Add custom domain
8. Configure domain-specific branding

## Troubleshooting

**Demo data not loading:**
- Check browser console for errors
- Ensure no Supabase connection is required
- Try clearing localStorage

**Charts not rendering:**
- Verify Recharts is installed
- Check browser console
- Ensure data format is correct

**Styling issues:**
- Run `npm run build` to regenerate CSS
- Check Tailwind configuration
- Verify font loading

## Demo Credentials

- **Store Name:** Superare
- **Email:** demo@storeiq.com
- **Password:** demo123
- **Revenue Range:** $3K-8K/day
- **Products:** 1,247 SKUs
- **Customers:** 3,421
