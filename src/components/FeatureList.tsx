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
    number: 3,
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
    number: 4,
    title: "Channels (Tab 4) — Blank Slate Selection",
    groupColor: "core",
    groupName: "Core Setup",
    items: [
      { text: "Channel Toggles — Retail, Wholesale, Distributor all start unchecked. User must consciously enable each" },
      { text: "Discount Configuration — Wholesale discount % and Distributor discount % off retail price" },
      { text: "Per-Channel Shipping Costs — Independent shipping cost per channel ($/pack). Retail defaults to $2.50, W/D default to $0 (must be user-defined)" },
      { text: "Cost Per Pack Explained — Tooltip documentation: $350 pallet / 144 packs = $2.43/pack. NOT per shipment" },
      { text: "Blank Slate Warning Banner — Prominent message when all channels are off, guiding user to enable at least one" },
      { text: "Import Duty — Configurable import duty rate on distributor channel" },
    ],
  },
  {
    number: 5,
    title: "Retail + Affiliates (Tabs 4-5)",
    groupColor: "b2c",
    groupName: "B2C Sales",
    items: [
      { text: "Retail Price Configuration — Set direct-to-consumer selling price" },
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
    number: 5,
    title: "Purchase Orders (Tab 6: Orders)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "Auto-Generated PO Line Items — Per-SKU totals with profit breakdown by channel" },
      { text: "Grand Totals — Total qty, profit, COGS, and average cost/profit per unit" },
    ],
  },
  {
    number: 6,
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
    number: 7,
    title: "Overrides (Tab 8: Overrides)",
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
    number: 8,
    title: "Third-Party Services (Tab 9: Third Party)",
    groupColor: "ops",
    groupName: "Operations",
    items: [
      { text: "5 Pre-Loaded Company Templates — Sales, Operations, Fulfillment, Business Management, Marketing — each with 25 line items" },
      { text: "Toggle Inclusion — Include/exclude entire companies" },
      { text: "Per-Line Cost Entry — Set cost for each service line item" },
    ],
  },
  {
    number: 9,
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
    number: 10,
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
    number: 11,
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
    number: 12,
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
    number: 14,
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
    number: 15,
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
    number: 16,
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
    number: 17,
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
    number: 18,
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
    number: 19,
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
    number: 20,
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
    number: 21,
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
      { text: "Comprehensive User Guide — Complete walkthrough of all tabs with Blank Slate philosophy, Cost Per Pack explanation, and Flow Chart" },
      { text: "Feature List Button — Complete inventory of all features organized by tab group" },
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
            19 feature categories across 17 tabs. Each tab group has a color so you can navigate at a glance.
          </DialogDescription>
        </DialogHeader>

        {/* Color Legend */}
        <div className="mt-2 mb-4 p-3 rounded-lg border bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tab Color Guide</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Foundation", cls: "bg-blue-100 text-blue-700 border-blue-200", tabs: "1-3" },
              { label: "B2C Sales", cls: "bg-indigo-100 text-indigo-700 border-indigo-200", tabs: "4-5" },
              { label: "Operations", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", tabs: "6-10" },
              { label: "Dashboard & Power", cls: "bg-violet-100 text-violet-700 border-violet-200", tabs: "11-13" },
              { label: "Forecasting", cls: "bg-amber-100 text-amber-700 border-amber-200", tabs: "14-16" },
              { label: "Management", cls: "bg-slate-100 text-slate-700 border-slate-200", tabs: "17-18" },
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
            Channel Calculator v11 — Blank Slate Philosophy, 17 tabs, 45+ major features, fully client-side.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
