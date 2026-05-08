import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { List, CheckCircle } from "lucide-react";

interface FeatureItem {
  text: string;
}

interface FeatureSection {
  number: number;
  title: string;
  items: FeatureItem[];
  groupColor: string;
  groupName: string;
}

// Color mapping for tab groups
const groupColors: Record<string, { badge: string; text: string; border: string; name: string }> = {
  core:      { badge: "bg-blue-100 text-blue-700",       text: "text-blue-700",       border: "border-l-blue-400",       name: "Foundation" },
  b2c:       { badge: "bg-indigo-100 text-indigo-700",   text: "text-indigo-700",     border: "border-l-indigo-400",     name: "B2C Sales" },
  b2b:       { badge: "bg-teal-100 text-teal-700",       text: "text-teal-700",       border: "border-l-teal-400",       name: "B2B Sales" },
  ops:       { badge: "bg-emerald-100 text-emerald-700", text: "text-emerald-700",    border: "border-l-emerald-400",    name: "Operations" },
  power:     { badge: "bg-violet-100 text-violet-700",   text: "text-violet-700",     border: "border-l-violet-400",     name: "Dashboard & Power" },
  forecast:  { badge: "bg-amber-100 text-amber-700",       text: "text-amber-700",       border: "border-l-amber-400",       name: "Forecasting" },
  manage:    { badge: "bg-slate-100 text-slate-700",       text: "text-slate-700",       border: "border-l-slate-400",       name: "Management" },
  simulate:  { badge: "bg-rose-100 text-rose-700",         text: "text-rose-700",        border: "border-l-rose-400",         name: "Simulate" },
  system:    { badge: "bg-gray-100 text-gray-700",          text: "text-gray-700",        border: "border-l-gray-400",          name: "System" },
};

const features: FeatureSection[] = [
  {
    number: 1,
    title: "Blank Slate Philosophy",
    groupColor: "system",
    groupName: "Core Design",
    items: [
      { text: "All channels start OFF — Retail, Wholesale, Distributor all unchecked. User must consciously enable each channel" },
      { text: "All subscription plans start INACTIVE — user must enable each plan individually" },
      { text: "All commission channel checkboxes start unchecked — user must assign each person to channels" },
      { text: "Wholesale/Distributor shipping defaults to $0 — user must define based on actual freight costs" },
      { text: "Only Retail shipping has a default ($2.50/pack) — consumer parcel shipping has a standard range" },
      { text: "No hidden defaults — every assumption is visible and auditable in the Assumptions Audit Trail" },
    ],
  },
  {
    number: 2,
    title: "Bulk Import & Export (All Tabs)",
    groupColor: "system",
    groupName: "Core Design",
    items: [
      { text: "CSV Import with File Picker — Upload .csv or .txt files via Choose File button on every supported tab" },
      { text: "CSV Import by Paste — Paste CSV text directly into a textarea for quick data entry" },
      { text: "Template Download — Every import tab provides a Download Template button with example rows showing exact column format" },
      { text: "Validation & Preview — Preview button validates all rows, shows error count and details, confirms valid rows before import" },
      { text: "CSV Export — Download current data as .csv from Marketing Employees, Marketing Expenses, Shipping Employees, Shipping Materials" },
      { text: "Scenario Files (.channelcalc) — Export any saved scenario as a .channelcalc file (JSON format). Import .channelcalc files to restore full model state" },
      { text: "Product Ingredients CSV Import (Tab 1) — Bulk-import ingredients: name, mgPerUnit, costPerMg, supplierPaymentDays. Paste from spreadsheet" },
      { text: "Marketing Employees CSV Import — Import: name, title, isHourly, salary, hourlyRate, hoursPerWeek" },
      { text: "Marketing Expenses CSV Import — Import: category, name, amount, channelR, channelW, channelD" },
      { text: "Shipping Employees CSV Import — Import: name, title, isHourly, salary, hourlyRate, hoursPerWeek, perItemBonus, perItemBonusEnabled" },
      { text: "Shipping Materials CSV Import — Import: name, costPerPack" },
    ],
  },
  {
    number: 3,
    title: "Core Product Modeling (Tab 1: Product)",
    groupColor: "core",
    groupName: "Core Setup",
    items: [
      { text: "Multi-SKU Support — Add/remove unlimited SKUs, each with units-per-pack, retail price, and channel mix split (Retail/Wholesale/Distributor)" },
      { text: "Ingredient Management — Add/remove unlimited ingredients with mg-per-unit, cost-per-mg, and supplier payment terms (NET days)" },
      { text: "MOQ Pricing Tiers — Volume-based cost discounts per ingredient (e.g., \"$0.70/mg at 1kg, $0.55/mg at 5kg\") with tier add/remove" },
      { text: "CSV Bulk Import — Paste a spreadsheet of ingredients to import 20+ ingredients in seconds" },
      { text: "Order Composition — Define how many packs of each SKU per order (drives blended calculations and PO generation)" },
      { text: "mg/oz Unit Toggle — Switch between milligrams and ounces system-wide" },
    ],
  },
  {
    number: 4,
    title: "Per-SKU Packaging (Tab 2: Packaging)",
    groupColor: "core",
    groupName: "Core Setup",
    items: [
      { text: "Unlimited Packaging Layers per SKU — Jar, bottle, label, box, etc." },
      { text: "Cost & Weight per Layer — Cost per unit + weight in grams per unit" },
      { text: "Weight Contributes to Shipping — Total package weight used by weight-based shipping rate table" },
    ],
  },
  {
    number: 5,
    title: "B2C Sales — Retail + Affiliates (Tab 4)",
    groupColor: "b2c",
    groupName: "B2C Sales",
    items: [
      { text: "Channel Toggles — Retail starts unchecked (Blank Slate). User must consciously enable" },
      { text: "Retail Price Configuration — Set direct-to-consumer selling price" },
      { text: "Per-Channel Shipping — Retail shipping cost ($/pack), defaults to $2.50 with cost-per-pack tooltip" },
      { text: "Flat Shipping Rate Per Channel — Fixed cost per pack per channel (not inherited across channels)" },
      { text: "Weight-Based Shipping Rates — Carrier-like pricing with editable weight brackets" },
      { text: "Retail Sales Tax — Configurable sales tax rate with customer-facing price display" },
      { text: "Affiliate Program — B2C referral channel; only active when Retail is enabled" },
      { text: "Commission Types — Percentage, flat per pack, or flat per order; product-only or total basis" },
      { text: "Attribution Model — First Click or Last Click with editable cookie duration" },
      { text: "Volume Assumptions — Monthly referrals, avg order size, click-to-purchase rate" },
      { text: "Payout Schedule — Day of month, delay period, minimum threshold" },
      { text: "Impact Summary — Gross revenue, commission cost, net profit, commission % of revenue" },
    ],
  },
  {
    number: 6,
    title: "B2B Sales — Wholesale + Distributor (Tab 5)",
    groupColor: "b2b",
    groupName: "B2B Sales",
    items: [
      { text: "Channel Toggles — Wholesale and Distributor both start unchecked (Blank Slate)" },
      { text: "Wholesale Discount — Percentage off retail price for wholesale buyers" },
      { text: "Distributor Discount — Deeper percentage off retail price for distributors" },
      { text: "Per-Channel Shipping — W/D shipping defaults to $0 (must be user-defined). Cost-per-pack tooltip with pallet example" },
      { text: "Import Duty — Configurable import duty rate on distributor channel" },
      { text: "Empty-State Warning — Prominent message when no B2B channels enabled" },
    ],
  },
  {
    number: 7,
    title: "Overhead Management (Tab 3: Costs)",
    groupColor: "core",
    groupName: "Core Setup",
    items: [
      { text: "Unlimited Overhead Items — Rent, salaries, utilities, marketing, etc." },
      { text: "Per-Channel Allocation — Toggle overhead attribution to R/W/D channels independently" },
      { text: "Monthly Volume Management — Set qty per SKU for blended calculations" },
    ],
  },
  {
    number: 8,
    title: "Marketing Employees (Tab 20)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "Unlimited Marketing Employees — Name, title, and compensation per employee" },
      { text: "Salary or Hourly Toggle — Each employee can be set to fixed monthly salary OR hourly rate with hours/week" },
      { text: "Hourly Computation — Monthly = hourly rate x hours/week x 52 / 12 (shown in real-time)" },
      { text: "Annual Cost Display — Computed annual cost for budget planning and investor discussions" },
      { text: "Summary Cards — Team size, total salaries/mo, total expenditures/mo, grand total marketing/mo" },
      { text: "Marketing Expenditures — Per-channel variable costs: Digital Ads, Trade Shows, Content, PR, Influencer, Custom" },
      { text: "Per-Channel Attribution — Each expenditure toggled to Retail, Wholesale, Distributor independently" },
    ],
  },
  {
    number: 9,
    title: "Shipping Employees (Tab 21)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "Unlimited Shipping Employees — Name, title, compensation, and production bonus per employee" },
      { text: "Salary or Hourly Toggle — Fixed monthly salary OR hourly rate with hours/week computation" },
      { text: "Per-Pack Production Bonus — Optional variable bonus paid on every pack shipped through any channel" },
      { text: "Bonus Enable/Disable — Toggle bonus on/off per employee without removing the rate" },
      { text: "Shipping Materials — Per-pack material costs: boxes, tape, labels, bubble wrap, etc." },
      { text: "Cost Summary — Carrier cost, materials, fixed personnel, variable personnel, total per pack" },
      { text: "Summary Cards — Team members, base salaries/mo, per-pack bonus total, materials/pack" },
    ],
  },
  {
    number: 10,
    title: "Purchase Orders (Tab 6: Orders)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "Auto-Generated PO Line Items — Per-SKU totals with profit breakdown by channel" },
      { text: "Grand Totals — Total qty, profit, COGS, and average cost/profit per unit" },
    ],
  },
  {
    number: 11,
    title: "Commission Hierarchy (Tab 7: Commissions)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "4-Tier Sales Org — President, VPs, RSMs, Salespersons" },
      { text: "Two Compensation Types — Percent of gross revenue OR per-pack flat rate" },
      { text: "Per-Channel Assignment — Each person can be assigned to R/W/D independently" },
      { text: "Performance Bonuses — Per-salesperson bonuses triggered by units, gross revenue, or gross profit thresholds" },
      { text: "Total Commission Summary — Aggregate commission cost, % of revenue, % of operating profit" },
    ],
  },
  {
    number: 12,
    title: "Overrides — Named Individuals (Tab 9)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "Named Individual Payments — A third payment system separate from Affiliates and Commissions" },
      { text: "Unlimited Override Entries — Each with name, percentage, gross/net basis, and channel selection" },
      { text: "Per-Override Channel Toggles — Apply to Retail, Wholesale, Distributor, and/or Affiliate independently" },
      { text: "Gross vs Net Basis — Calculate on total revenue or revenue after COGS deductions" },
      { text: "Enable/Disable Toggle — Activate or deactivate individual overrides without deleting" },
      { text: "Monthly Impact Preview — Shows dollar amount and which channels contribute" },
      { text: "Summary Cards — Total entries, active count, monthly cost, annual cost" },
      { text: "Cash Flow Integration — Override payouts appear as recurring monthly cash outflows" },
      { text: "Sanity Check — Warns if total override costs exceed 10% of revenue" },
    ],
  },
  {
    number: 13,
    title: "Third-Party Services (Tab 8)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "5 Pre-Loaded Company Templates — Sales, Operations, Fulfillment, Business Management, Marketing — each with 25 line items" },
      { text: "Toggle Inclusion — Include/exclude entire companies" },
      { text: "Per-Line Cost Entry — Set cost for each service line item" },
    ],
  },
  {
    number: 14,
    title: "Visual Analytics (Tab 10: Charts)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "Sensitivity Tornado Chart — 8-input diverging bar chart showing +/-10% impact on blended gross margin" },
      { text: "Cost Breakdown Pie Chart — Ingredients, packaging, shipping, overhead per pack with auto-colors" },
      { text: "Channel Profit Comparison Bar Chart — Revenue, gross profit, operating profit side-by-side" },
    ],
  },
  {
    number: 15,
    title: "Executive Dashboard (Tab 11) — Mission Control",
    groupColor: "power",
    groupName: "Dashboard & Power",
    items: [
      { text: "10 Live KPI Cards — Blended Margin, Break-Even Revenue, Monthly Volume, COGS/Pack, Retail GP, Wholesale GP, Distributor GP, Shipping/Pack, Top Cost Driver, Tax/Campaign Impact" },
      { text: "Industry Benchmark Overlays — Supplement industry ranges displayed on select KPIs (e.g., \"Industry: 45%-75%\")" },
      { text: "Trend Indicators — Up/down/neutral arrows with color coding" },
      { text: "Sanity Checks Panel — 9 automated validations: COGS ratio, blended margin, break-even feasibility, channel profitability, subscription churn, cash flow balance, campaign net effect, overhead ratio, override cost ratio. Sorted by severity (error/warning/ok) with detailed corrective guidance" },
      { text: "Assumptions Audit Trail — Complete categorized listing of every assumption in the model (Product, Ingredients, Packaging, Channels, Shipping, Overhead, Tax, Volume, Cash Flow, Subscriptions, Campaigns) with current value and business impact" },
    ],
  },
  {
    number: 16,
    title: "Goal Seek / Target Finder (Tab 12)",
    groupColor: "power",
    groupName: "Dashboard & Power",
    items: [
      { text: "Reverse Solver — Pick a target metric, pick an adjustable input, solver finds the exact value" },
      { text: "5 Target Metrics — Total Gross Profit, Blended Gross Margin %, Break-Even Revenue, COGS/Pack, Monthly Volume" },
      { text: "7 Adjustable Inputs — Retail Price, Wholesale Discount, Distributor Discount, Ingredient Cost (multiplier), Packaging Cost (multiplier), Shipping Cost, Monthly Volume" },
      { text: "30-Iteration Binary Search — Precision convergence with unreachable-target detection" },
    ],
  },
  {
    number: 17,
    title: "Batch What-If Testing (Tab 13)",
    groupColor: "power",
    groupName: "Dashboard & Power",
    items: [
      { text: "Multi-Value Comparison Table — Enter comma-separated values, get instant comparison" },
      { text: "5 Input Variables — Retail Price, Wholesale Discount, Distributor Discount, Ingredient Cost (multiplier), Shipping Cost" },
      { text: "Color-Coded Rows — Green when profit improves vs. prior row, red when it declines" },
    ],
  },
  {
    number: 18,
    title: "Subscription Modeling (Tab 14)",
    groupColor: "forecast",
    groupName: "Forecasting",
    items: [
      { text: "All Plans Start INACTIVE — User must consciously enable each subscription plan" },
      { text: "Unlimited Subscription Plans — Monthly price, starting subscribers, growth rate, churn rate, CAC" },
      { text: "Plan Items — Assign SKUs with packs-per-month to each plan" },
      { text: "12-Month Projection Table — Starting/ending subscribers, new/churned, revenue, COGS, gross profit, cumulative metrics" },
      { text: "Per-Plan Charts — Subscriber growth curve + monthly revenue chart" },
      { text: "Summary Metrics — MRR, ARR, LTV, payback months per plan and combined totals" },
    ],
  },
  {
    number: 19,
    title: "Cash Flow Forecasting (Tab 15)",
    groupColor: "forecast",
    groupName: "Forecasting",
    items: [
      { text: "12-Month Monthly Projection — Starting balance, cash in, cash out, net flow, ending balance with full line-item detail" },
      { text: "Empty-State Warning — Alert when no channels enabled: \"No Revenue — No Cash In\"" },
      { text: "Weekly View Toggle — Switch to 52-week granularity" },
      { text: "Payment Term Modeling — NET 0/30/60/90 per channel with realistic cash collection delays" },
      { text: "Supplier Payment Terms — Per-ingredient payment days affect cash outflow timing" },
      { text: "Inventory Lead Time — Days from PO to delivery" },
      { text: "Capital Expenditures — One-time investments by month" },
      { text: "Debt Service — Fixed monthly loan payments" },
      { text: "Visual Cash Balance Chart — 12-month bar chart of ending balances" },
      { text: "Automatic Risk Warnings — Red alerts when balance drops below $5,000" },
    ],
  },
  {
    number: 20,
    title: "Campaign/Promotion Modeling (Tab 16)",
    groupColor: "forecast",
    groupName: "Forecasting",
    items: [
      { text: "Unlimited Campaigns — Name, discount %, duration in weeks, affected channels, expected volume uplift %" },
      { text: "Impact Analysis — Revenue At Risk, Margin Compression, Net Annual Effect with green/red indicators" },
      { text: "Before/During/After Chart — Visual revenue comparison across campaign phases" },
    ],
  },
  {
    number: 21,
    title: "Scenario Management (Tab 17)",
    groupColor: "manage",
    groupName: "Management",
    items: [
      { text: "Save Scenarios with Labels & Notes — Descriptive notes explain the rationale behind each saved state" },
      { text: "Load / Delete / Clear All — Full CRUD for saved scenarios" },
      { text: "localStorage Persistence — Survives browser restarts" },
      { text: "50-Scenario Limit — Automatic FIFO when limit reached" },
    ],
  },
  {
    number: 22,
    title: "Side-by-Side Comparison (Tab 18)",
    groupColor: "manage",
    groupName: "Management",
    items: [
      { text: "Two-Scenario Comparison — Load any two saved scenarios" },
      { text: "13 Key Metrics Compared — Price, margin, break-even, volume, profit, shipping, COGS" },
      { text: "Green/Red Delta Indicators — Percentage change with color coding" },
      { text: "Notes Display — Scenario notes shown in dropdowns and card headers" },
    ],
  },
  {
    number: 23,
    title: "Temporal Audit Log (Tab 19)",
    groupColor: "manage",
    groupName: "Management",
    items: [
      { text: "Change Logging — Every meaningful edit recorded with timestamp, category, field, old value, and new value" },
      { text: "16 Categories — Product, Ingredients, Packaging, Channels, Shipping, Overhead, Tax, Volume, Cash Flow, Subscriptions, Commissions, Overrides, Affiliates, Campaigns, Third Party, System" },
      { text: "Category Filter — Focus on a specific area of your model" },
      { text: "Search — Filter by field name, old value, or new value" },
      { text: "Summary Stats — Total entries, categories touched, first/latest change with relative timestamps" },
      { text: "CRUD Logging — Add/remove operations for SKUs, ingredients, overrides, commission roles, subscription plans, overhead items" },
      { text: "Auto-Diff — Scalar changes detected automatically via state comparison" },
      { text: "Channel Configuration Logging — Every include/exclude change tracked for Retail, Wholesale, Distributor" },
      { text: "Subscription Plan Logging — Every plan enabled/disabled tracked" },
      { text: "500-Entry Limit — Automatic FIFO to prevent unbounded growth" },
      { text: "Clearable — One-click clear with confirmation" },
    ],
  },
  {
    number: 24,
    title: "Live Simulation (Tab Simulate / Floating Panel)",
    groupColor: "simulate",
    groupName: "Simulate",
    items: [
      { text: "Shadow State — Experiment without modifying your real model" },
      { text: "8 Adjustable Sliders — Retail Price, Units/Pack, Wholesale Discount, Distributor Discount, Monthly Volume, Subscription Price, Growth Rate, Churn Rate" },
      { text: "12 Delta Cards — Real-time comparison of base vs. shadow state" },
      { text: "Apply Button — Commit shadow changes to your real model" },
      { text: "Reset Button — Revert shadow to match base state" },
    ],
  },
  {
    number: 25,
    title: "System Features",
    groupColor: "system",
    groupName: "System",
    items: [
      { text: "50-Step Undo/Redo — Ctrl+Z / Ctrl+Y with visual buttons in header" },
      { text: "Auto-Save — Every 30 seconds to localStorage" },
      { text: "Session Recovery — Recovery dialog on re-open if unsaved work detected" },
      { text: "URL State Encoding — Full model encoded in URL hash (shareable links), LZ-String compressed for 81% shorter URLs" },
      { text: "Dependency Flow Chart — Interactive visual diagram showing how every model component connects (horizontal/vertical toggle)" },
      { text: "Interactive Tutorial — 9-step guided walkthrough for first-time users, re-openable via Tutorial button" },
      { text: "PDF Export — Branded one-pager with Executive Summary, Channel Profitability, Cost Structure, Break-Even Analysis" },
      { text: "CSV Export — All key metrics in spreadsheet format" },
      { text: "Excel Export — Full data export" },
      { text: "Onboarding Wizard — 10-step guided tour for first-time users (re-openable via \"?\" button)" },
      { text: "Comprehensive User Guide — Complete walkthrough of all 22 tabs with Blank Slate philosophy, Cost Per Pack explanation, Import/Export Reference, and Flow Chart" },
      { text: "Feature List Button — Complete inventory of all 25 feature categories organized by tab group" },
      { text: "Info Tooltips Everywhere — Detailed explanations on every input and metric" },
      { text: "Color-Coded Tool Cards — Every advanced feature in a visually distinct card" },
      { text: "Tab Color Groups — Visual navigation: Blue (Foundation), Indigo (B2C), Teal (B2B), Emerald (Ops), Violet (Dashboard), Amber (Forecast), Slate (Manage), Rose (Simulate)" },
      { text: "Mobile Responsive — Tables become card stacks on phones/tablets" },
      { text: "Schema Migration — Automatic state migration when app updates" },
      { text: "Sticky Header — Toolbar stays visible while scrolling" },
    ],
  },
];

export function FeatureList() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
          <List className="h-4 w-4 text-blue-600" /> <span className="hidden sm:inline">Features</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Complete Feature List
          </DialogTitle>
          <DialogDescription className="text-sm">
            25 feature categories across 22 tabs. Each tab group has a color so you can navigate at a glance.
          </DialogDescription>
        </DialogHeader>

        {/* Color Legend */}
        <div className="mt-2 mb-4 p-3 rounded-lg border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tab Color Guide</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Foundation", cls: "bg-blue-100 text-blue-700 border-blue-200", tabs: "1-3" },
              { label: "B2C Sales", cls: "bg-indigo-100 text-indigo-700 border-indigo-200", tabs: "4" },
              { label: "B2B Sales", cls: "bg-teal-100 text-teal-700 border-teal-200", tabs: "5" },
              { label: "Operations", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", tabs: "6-10" },
              { label: "Dashboard & Power", cls: "bg-violet-100 text-violet-700 border-violet-200", tabs: "11-13" },
              { label: "Forecasting", cls: "bg-amber-100 text-amber-700 border-amber-200", tabs: "14-16" },
              { label: "Management", cls: "bg-slate-100 text-slate-700 border-slate-200", tabs: "17-19" },
              { label: "Marketing", cls: "bg-pink-100 text-pink-700 border-pink-200", tabs: "20" },
              { label: "Shipping", cls: "bg-cyan-100 text-cyan-700 border-cyan-200", tabs: "21" },
              { label: "Simulate", cls: "bg-rose-100 text-rose-700 border-rose-200", tabs: "●" },
            ].map((g) => (
              <span key={g.label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border ${g.cls}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                {g.label} <span className="opacity-60 font-normal">({g.tabs})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5 text-sm">
          {features.map((section) => {
            const colors = groupColors[section.groupColor] || groupColors.system;
            return (
              <section key={section.number} className={`border-l-4 ${colors.border} pl-3`}>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${colors.badge} text-xs font-bold shrink-0`}>
                    {section.number}
                  </span>
                  <span className={colors.text}>{section.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.badge} font-medium`}>
                    {colors.name}
                  </span>
                </h3>
                <ul className="space-y-1.5 ml-8">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${colors.text} opacity-60`} />
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <div className="pt-4 border-t text-center text-xs text-muted-foreground">
            Channel Calculator v12 — Blank Slate Philosophy, 22 tabs, 25 feature categories, 50+ major features, fully client-side.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
