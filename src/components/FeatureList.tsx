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
}

const features: FeatureSection[] = [
  {
    number: 1,
    title: "Core Product Modeling (Tab 1: Product)",
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
    number: 2,
    title: "Per-SKU Packaging (Tab 2: Packaging)",
    items: [
      { text: "Unlimited Packaging Layers per SKU — Jar, bottle, label, box, etc." },
      { text: "Cost & Weight per Layer — Cost per unit + weight in grams per unit" },
      { text: "Weight Contributes to Shipping — Total package weight used by weight-based shipping rate table" },
    ],
  },
  {
    number: 3,
    title: "Channel Pricing & Configuration (Tab 3: Channels)",
    items: [
      { text: "Three Sales Channels — Retail, Wholesale, Distributor with independent toggle on/off" },
      { text: "Cascading Discounts — Wholesale discount % off retail, Distributor discount % off wholesale" },
      { text: "Flat Shipping Rate — Fixed cost per pack" },
      { text: "Weight-Based Shipping Rates — Carrier-like pricing with editable weight brackets (100g, 250g, 500g, 1kg, 2kg, 5kg)" },
      { text: "Retail Sales Tax — Configurable sales tax rate with customer-facing price display" },
      { text: "Distributor Import Duty — Configurable import duty with cost-with-duty display" },
      { text: "Formula Tooltips — Every metric shows its calculation formula on hover" },
    ],
  },
  {
    number: 4,
    title: "Overhead Management (Tab 4: Costs)",
    items: [
      { text: "Unlimited Overhead Items — Rent, salaries, utilities, marketing, etc." },
      { text: "Per-Channel Allocation — Toggle overhead attribution to R/W/D channels independently" },
      { text: "Monthly Volume Management — Set qty per SKU for blended calculations" },
    ],
  },
  {
    number: 5,
    title: "Purchase Orders (Tab 6: PO)",
    items: [
      { text: "Auto-Generated PO Line Items — Per-SKU totals with profit breakdown by channel" },
      { text: "Grand Totals — Total qty, profit, COGS, and average cost/profit per unit" },
    ],
  },
  {
    number: 6,
    title: "Commission Hierarchy (Tab 7: Commissions)",
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
    title: "Third-Party Services (Tab 7: Third Party)",
    items: [
      { text: "5 Pre-Loaded Company Templates — Sales, Operations, Fulfillment, Business Management, Marketing — each with 25 line items" },
      { text: "Toggle Inclusion — Include/exclude entire companies" },
      { text: "Per-Line Cost Entry — Set cost for each service line item" },
    ],
  },
  {
    number: 8,
    title: "Visual Analytics (Tab 8: Charts)",
    items: [
      { text: "Sensitivity Tornado Chart — 8-input diverging bar chart showing +/-10% impact on blended gross margin" },
      { text: "Cost Breakdown Pie Chart — Ingredients, packaging, shipping, overhead per pack with auto-colors" },
      { text: "Channel Profit Comparison Bar Chart — Revenue, gross profit, operating profit side-by-side" },
    ],
  },
  {
    number: 9,
    title: "Executive Dashboard (Tab 9) — Mission Control",
    items: [
      { text: "10 Live KPI Cards — Blended Margin, Break-Even Revenue, Monthly Volume, COGS/Pack, Retail GP, Wholesale GP, Distributor GP, Shipping/Pack, Top Cost Driver, Tax/Campaign Impact" },
      { text: "Industry Benchmark Overlays — Supplement industry ranges displayed on select KPIs (e.g., \"Industry: 45%-75%\")" },
      { text: "Trend Indicators — Up/down/neutral arrows with color coding" },
      { text: "Sanity Checks Panel — 8 automated validations: COGS ratio, blended margin, break-even feasibility, channel profitability, subscription churn, cash flow balance, campaign net effect, overhead ratio. Sorted by severity (error/warning/ok) with detailed corrective guidance" },
      { text: "Assumptions Audit Trail — Complete categorized listing of every assumption in the model (Product, Ingredients, Packaging, Channels, Shipping, Overhead, Tax, Volume, Cash Flow, Subscriptions, Campaigns) with current value and business impact" },
    ],
  },
  {
    number: 10,
    title: "Goal Seek / Target Finder (Tab 10)",
    items: [
      { text: "Reverse Solver — Pick a target metric, pick an adjustable input, solver finds the exact value" },
      { text: "5 Target Metrics — Total Gross Profit, Blended Gross Margin %, Break-Even Revenue, COGS/Pack, Monthly Volume" },
      { text: "7 Adjustable Inputs — Retail Price, Wholesale Discount, Distributor Discount, Ingredient Cost (multiplier), Packaging Cost (multiplier), Shipping Cost, Monthly Volume" },
      { text: "30-Iteration Binary Search — Precision convergence with unreachable-target detection" },
    ],
  },
  {
    number: 11,
    title: "Batch What-If Testing (Tab 11)",
    items: [
      { text: "Multi-Value Comparison Table — Enter comma-separated values, get instant comparison" },
      { text: "5 Input Variables — Retail Price, Wholesale Discount, Distributor Discount, Ingredient Cost (multiplier), Shipping Cost" },
      { text: "Color-Coded Rows — Green when profit improves vs. prior row, red when it declines" },
    ],
  },
  {
    number: 12,
    title: "Subscription Modeling (Tab 12)",
    items: [
      { text: "Unlimited Subscription Plans — Monthly price, starting subscribers, growth rate, churn rate, CAC" },
      { text: "Plan Items — Assign SKUs with packs-per-month to each plan" },
      { text: "12-Month Projection Table — Starting/ending subscribers, new/churned, revenue, COGS, gross profit, cumulative metrics" },
      { text: "Per-Plan Charts — Subscriber growth curve + monthly revenue chart" },
      { text: "Summary Metrics — MRR, ARR, LTV, payback months per plan and combined totals" },
    ],
  },
  {
    number: 13,
    title: "Cash Flow Forecasting (Tab 13)",
    items: [
      { text: "12-Month Monthly Projection — Starting balance, cash in, cash out, net flow, ending balance with full line-item detail" },
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
    number: 14,
    title: "Campaign/Promotion Modeling (Tab 14)",
    items: [
      { text: "Unlimited Campaigns — Name, discount %, duration in weeks, affected channels, expected volume uplift %" },
      { text: "Impact Analysis — Revenue At Risk, Margin Compression, Net Annual Effect with green/red indicators" },
      { text: "Before/During/After Chart — Visual revenue comparison across campaign phases" },
    ],
  },
  {
    number: 15,
    title: "Scenario Management (Tab 15)",
    items: [
      { text: "Save Scenarios with Labels & Notes — Descriptive notes explain the rationale behind each saved state" },
      { text: "Load / Delete / Clear All — Full CRUD for saved scenarios" },
      { text: "localStorage Persistence — Survives browser restarts" },
      { text: "50-Scenario Limit — Automatic FIFO when limit reached" },
    ],
  },
  {
    number: 16,
    title: "Side-by-Side Comparison (Tab 16)",
    items: [
      { text: "Two-Scenario Comparison — Load any two saved scenarios" },
      { text: "13 Key Metrics Compared — Price, margin, break-even, volume, profit, shipping, COGS" },
      { text: "Green/Red Delta Indicators — Percentage change with color coding" },
      { text: "Notes Display — Scenario notes shown in dropdowns and card headers" },
    ],
  },
  {
    number: 17,
    title: "Live Simulation (Tab Simulate / Floating Panel)",
    items: [
      { text: "Shadow State — Experiment without modifying your real model" },
      { text: "8 Adjustable Sliders — Retail Price, Units/Pack, Wholesale Discount, Distributor Discount, Monthly Volume, Subscription Price, Growth Rate, Churn Rate" },
      { text: "12 Delta Cards — Real-time comparison of base vs. shadow state" },
      { text: "Apply Button — Commit shadow changes to your real model" },
      { text: "Reset Button — Revert shadow to match base state" },
    ],
  },
  {
    number: 18,
    title: "System Features",
    items: [
      { text: "50-Step Undo/Redo — Ctrl+Z / Ctrl+Y with visual buttons in header" },
      { text: "Auto-Save — Every 30 seconds to localStorage" },
      { text: "Session Recovery — Recovery dialog on re-open if unsaved work detected" },
      { text: "URL State Encoding — Full model encoded in URL hash (shareable links), LZ-String compressed for 81% shorter URLs" },
      { text: "PDF Export — Branded one-pager with Executive Summary, Channel Profitability, Cost Structure, Break-Even Analysis" },
      { text: "CSV Export — All key metrics in spreadsheet format" },
      { text: "Excel Export — Full data export" },
      { text: "Onboarding Wizard — 8-step guided tour for first-time users (re-openable via \"?\" button)" },
      { text: "Comprehensive User Guide — Complete walkthrough of all 16 tabs with tips and feature descriptions" },
      { text: "Feature List Button — This dialog: complete inventory of all features organized by tab" },
      { text: "Info Tooltips Everywhere — \"i\" icons on every input and metric with detailed explanations" },
      { text: "Color-Coded Tool Cards — Every advanced feature in a visually distinct card: Blue (Import), Amber (Pricing), Sky (Shipping), Emerald (Tax), Orange (Cash Flow), Violet (Power Tools), Rose (Validation), Slate (Audit)" },
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
            18 feature categories across 17 tabs. Click the tab numbers to navigate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm mt-2">
          {features.map((section) => (
            <section key={section.number}>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {section.number}
                </span>
                {section.title}
              </h3>
              <ul className="space-y-1.5 ml-8">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="pt-4 border-t text-center text-xs text-muted-foreground">
            Channel Calculator v10 — 16 tabs, 40+ major features, fully client-side.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
