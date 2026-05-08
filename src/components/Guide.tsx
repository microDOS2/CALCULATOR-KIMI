import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Lightbulb, MousePointer, Sparkles, ShieldCheck, ClipboardList, ToggleLeft, Package } from "lucide-react";
import { DependencyFlowChart } from "./DependencyFlowChart";

export function Guide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
          <BookOpen className="h-4 w-4 text-emerald-600" /> Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            User Guide
          </DialogTitle>
          <DialogDescription className="text-sm">
            Complete walkthrough of all 18 tabs and every feature.
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
              { label: "Management", cls: "bg-slate-100 text-slate-700 border-slate-200", tabs: "17-19" },
              { label: "Simulate", cls: "bg-rose-100 text-rose-700 border-rose-200", tabs: "●" },
            ].map((g) => (
              <span key={g.label} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border ${g.cls}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                {g.label} <span className="opacity-60 font-normal">({g.tabs})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Blank Slate Philosophy */}
        <div className="p-3 rounded-lg border bg-gradient-to-r from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10">
          <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
            <ToggleLeft className="h-3.5 w-3.5" /> Blank Slate Philosophy
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Nothing is pre-selected.</strong> All channels (Retail, Wholesale, Distributor) start unchecked.
            All subscription plans start inactive. All commission channels start unchecked.
            You must consciously choose every assumption. This prevents hidden defaults from silently
            skewing your analysis. Enable what you need, leave the rest off.
          </p>
        </div>

        {/* Cost Per Pack Explained */}
        <div className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
          <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" /> Cost Per Pack — Not Per Shipment
          </p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Shipping costs are shown as <strong>cost per PACK shipped</strong> — not per individual item, not per shipment/delivery.
            A &quot;pack&quot; is what your customer buys (e.g., a box of 10 units).
            Example: a $350 pallet containing 144 packs = <strong>$2.43/pack</strong>. The carrier invoices per pallet,
            but for margin analysis we divide by packs. Only Retail has a default ($2.50). Wholesale and Distributor <strong>must be defined by you</strong>.
          </p>
        </div>

        {/* Dependency Flow Chart */}
        <DependencyFlowChart />

        <div className="space-y-6 text-sm">
          <section>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              Step-by-Step Walkthrough
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Follow these steps in order to build a complete channel model. Each tab builds on the previous one.
            </p>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="pl-1 border-l-2 border-l-blue-300">
                <span className="font-medium text-blue-700">Product (Tab 1)</span> — Add your SKUs with units-per-pack, units-per-case, and pricing. Add ingredients with mg-per-unit, cost-per-mg, and supplier payment terms. Use <strong>MOQ Pricing Tiers</strong> (amber tool card) to model volume discounts: "$0.70/mg at 1kg, $0.55/mg at 5kg". Use the <strong>CSV Bulk Import</strong> (blue tool card) to bulk-paste ingredients from a spreadsheet. The calculator auto-computes COGS per pack.
              </li>
              <li className="pl-1 border-l-2 border-l-blue-300">
                <span className="font-medium text-blue-700">Packaging (Tab 2)</span> — Define packaging layers per SKU (jar, bottle, label, box). Set unit cost and weight (grams) for each layer. Packaging weight is used for <strong>weight-based shipping rates</strong>.
              </li>
              <li className="pl-1 border-l-2 border-l-blue-300">
                <span className="font-medium text-indigo-700">Retail (Tab 4)</span> — Set your retail selling price and direct e-commerce configuration. Toggle retail channel on/off. Use the <strong>Weight-Based Shipping Rates</strong> card (sky blue) to replace flat-rate shipping with carrier-like pricing by package weight. Use the <strong>Tax &amp; Duty</strong> card (emerald green) to add Sales Tax on retail. Formula tooltips on every metric show the calculation on hover.
              </li>
              <li className="pl-1 border-l-2 border-l-indigo-300">
                <span className="font-medium text-indigo-700">Affiliates (Tab 5)</span> — <strong>B2C referral channel.</strong> Affiliates drive customers to your retail storefront at the same retail price, but you pay commission <em>after</em> the sale. Configure commission type (percentage or flat), rate, attribution model (first/last click), cookie duration, and payout schedule. The impact summary shows gross revenue, commission cost, and net profit after commission. Enable subscription renewal commissions with sliding scale tiers.
              </li>
              <li className="pl-1 border-l-2 border-l-blue-300">
                <span className="font-medium text-blue-700">Overhead (Tab 4)</span> — Enter your monthly overhead costs (rent, salaries, utilities, marketing). Toggle whether overhead is allocated to each channel. This directly affects operating profit.
              </li>
              <li className="pl-1 border-l-2 border-l-emerald-300">
                <span className="font-medium text-emerald-700">Marketing Employees</span> — Add marketing staff with salary OR hourly rate. Toggle each employee between fixed monthly pay and hourly (rate x hours/week x 52 / 12). Add channel-tied expenditures (Digital Ads, Trade Shows, Content, PR, Influencer) toggled per-channel.
              </li>
              <li className="pl-1 border-l-2 border-l-emerald-300">
                <span className="font-medium text-emerald-700">Shipping Employees</span> — Add warehouse/shipping staff with salary OR hourly rate. Optional per-pack production bonus (paid on every pack shipped through any channel). Add shipping materials (boxes, tape, labels) with per-pack costs.
              </li>
              <li className="pl-1 border-l-2 border-l-emerald-300">
                <span className="font-medium text-emerald-700">3rd Party (Tab 5)</span> — Add third-party logistics or service providers. Include their markup %, which gets added to your cost structure.
              </li>
              <li className="pl-1 border-l-2 border-l-emerald-300">
                <span className="font-medium text-emerald-700">PO (Tab 6)</span> — View purchase order projections. The calculator generates POs for raw materials and finished goods based on your production plan and ingredient lead times.
              </li>
              <li className="pl-1 border-l-2 border-l-emerald-300">
                <span className="font-medium text-emerald-700">Commissions (Tab 7)</span> — Configure sales commissions. Set commission % per channel and see the total commission impact on your operating profit.
              </li>
              <li className="pl-1 border-l-2 border-l-emerald-300">
                <span className="font-medium text-emerald-700">Overrides (Tab 8)</span> — <strong>Named individual payments.</strong> A third payment system separate from Affiliates and Commissions. Create override entries with a name, percentage, gross/net basis, and channel selection (Retail, Wholesale, Distributor, Affiliate). Use for consultants, advisors, partners, or anyone who receives a revenue share. Each override shows its monthly impact. Enable/disable individually.
              </li>
              <li className="pl-1 border-l-2 border-l-emerald-300">
                <span className="font-medium text-emerald-700">Charts (Tab 10)</span> — Visual breakdown of your business. <strong>Sensitivity Tornado Chart</strong> shows which inputs most affect your blended margin (diverging bars for ±10% changes). Pie chart shows cost composition (ingredients, packaging, overhead, shipping). Bar chart compares gross profit across all three channels. Time-series charts appear in their respective tabs.
              </li>
              <li className="pl-1 border-l-2 border-l-violet-300">
                <span className="font-medium text-violet-700">Dashboard (Tab 11)</span> — One-screen "Mission Control". Starts with the <strong>Sanity Checks</strong> panel (rose red) that validates your model against 9 industry benchmarks. Below that, 10 live KPI cards with industry benchmark ranges and trend indicators. At the bottom, the <strong>Assumptions Audit Trail</strong> (slate gray) lists every assumption in your model. Use this for investor meetings or bank applications.
              </li>
              <li className="pl-1 border-l-2 border-l-violet-300">
                <span className="font-medium text-violet-700">Goal Seek (Tab 11)</span> — <strong className="text-violet-600">Power Tool</strong> (violet card). Work backward from a target. Select what you want to achieve (e.g., "$50 gross profit per pack"), pick which input to adjust (e.g., "Retail Price"), and the solver finds the exact value that hits your target using 30-iteration binary search. Supports 5 target metrics and 7 adjustable inputs including ingredient/packaging cost multipliers.
              </li>
              <li className="pl-1 border-l-2 border-l-violet-300">
                <span className="font-medium text-violet-700">Batch (Tab 12)</span> — <strong className="text-violet-600">Power Tool</strong> (violet card). Test multiple values for a single input at once. Enter comma-separated values (e.g., "20, 25, 30, 35, 40" for retail price) and get a comparison table with gross profit, margin, break-even, COGS, and break-even packs for each value. Rows highlight green when profit improves vs. the previous row, red when it declines.
              </li>
              <li className="pl-1 border-l-2 border-l-amber-300">
                <span className="font-medium text-amber-700">Subscriptions (Tab 13)</span> — Model recurring revenue with subscription plans. Set monthly price, churn rate, and growth rate. See a 12-month projection of subscribers, MRR, and cumulative profit. Includes subscriber growth chart and revenue chart per plan. Toggle between monthly table view and mobile-friendly card view.
              </li>
              <li className="pl-1 border-l-2 border-l-amber-300">
                <span className="font-medium text-amber-700">Cash Flow (Tab 14)</span> — Profitability does not equal viability. This tab projects 12 months of cash inflows and outflows, including payment term delays (NET 30/60/90), ingredient PO lead times, and debt service. Use the <strong>Capital Expenditures</strong> card (orange) to model one-time investments. Use the <strong>Debt Service</strong> card (orange) for monthly loan payments. Toggle between Monthly and Weekly views. Includes a 12-month cash balance bar chart. Watch for the red warning cards if your balance drops below $5,000.
              </li>
              <li className="pl-1 border-l-2 border-l-amber-300">
                <span className="font-medium text-amber-700">Campaigns (Tab 15)</span> — Model time-boxed promotions like "Black Friday: 20% off for 2 weeks." Set discount %, duration, volume uplift %, and affected channels. The impact analysis shows Revenue At Risk, Margin Compression, and Net Annual Effect. If volume uplift outweighs the discount, net effect is green (positive). Includes before/during/after revenue comparison chart.
              </li>
              <li className="pl-1 border-l-2 border-l-slate-300">
                <span className="font-medium text-slate-700">Scenarios (Tab 16)</span> — Save your current model configuration with a label and an optional note/description. Load previously saved scenarios. Delete or clear all. Scenarios persist in localStorage and survive browser restarts. Each scenario captures the complete state of all 17 tabs. Notes help you remember the rationale behind each saved scenario.
              </li>
              <li className="pl-1 border-l-2 border-l-slate-300">
                <span className="font-medium text-slate-700">Compare (Tab 17)</span> — Load two saved scenarios side-by-side. Compare 13 key metrics (price, margin, break-even, volume, profit, shipping, COGS) with green/red delta indicators showing percentage change. Scenario notes appear in dropdowns and card headers for context. This is the fastest way to evaluate strategic decisions.
              </li>
              <li className="pl-1 border-l-2 border-l-slate-300">
                <span className="font-medium text-slate-700">Audit Log (Tab 18)</span> — A complete temporal change log that records every meaningful edit to your model with timestamp, category, field name, and old→new value diff. Filter by category (Product, Channels, Overrides, etc.) or search by field name. Shows 4 summary stats (total entries, categories touched, first/latest change). Clearable. This is the true audit trail — not a snapshot, but a chronological record of who changed what and when.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2 border-l-4 border-l-rose-300 pl-3">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              Sanity Checks &amp; Validation
            </h3>
            <p className="text-xs text-muted-foreground mb-3 pl-3">
              The Dashboard starts with an automated Sanity Checks panel (rose red card) that validates your model against industry benchmarks and business logic in real-time.
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs text-muted-foreground pl-3">
              <li className="pl-1"><strong className="text-foreground">COGS Ratio</strong> — Checks if COGS is 20-45% of retail price (supplement industry norm).</li>
              <li className="pl-1"><strong className="text-foreground">Blended Margin</strong> — Validates gross margin is within the 45-75% healthy range.</li>
              <li className="pl-1"><strong className="text-foreground">Break-Even Feasibility</strong> — Warns if break-even volume exceeds 2,000 packs/month.</li>
              <li className="pl-1"><strong className="text-foreground">Channel Profitability</strong> — Flags any channel with negative gross profit.</li>
              <li className="pl-1"><strong className="text-foreground">Subscription Churn</strong> — Compares churn rate against 3-12% industry range.</li>
              <li className="pl-1"><strong className="text-foreground">Cash Flow</strong> — Alerts when projected balance goes negative or below $5,000.</li>
              <li className="pl-1"><strong className="text-foreground">Campaign Net Effect</strong> — Warns if promotions reduce overall annual profit.</li>
              <li className="pl-1"><strong className="text-foreground">Overhead Ratio</strong> — Flags when overhead exceeds 25% of revenue.</li>
              <li className="pl-1"><strong className="text-foreground">Override Cost</strong> — Warns if override payments exceed 10% of total revenue.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2 border-l-4 border-l-slate-300 pl-3">
              <ClipboardList className="h-4 w-4 text-slate-500" />
              Assumptions Audit Trail
            </h3>
            <p className="text-xs text-muted-foreground mb-3 pl-3">
              The Dashboard includes a complete Assumptions Audit Trail (slate gray card) — every assumption in your model listed by category (Product, Ingredients, Packaging, Channels, Shipping, Overhead, Tax, Volume, Cash Flow, Subscriptions, Campaigns). Each row shows the assumption name, its current value, and its business impact. Use this for due diligence, investor meetings, or when handing off a model to another team member.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Key Features
            </h3>
            <ul className="space-y-2 list-disc list-inside text-xs text-muted-foreground">
              <li className="pl-1">
                <strong className="text-foreground">Undo/Redo</strong> — 50-step history. Use Ctrl+Z to undo, Ctrl+Y to redo. The undo/redo buttons are in the header toolbar next to the Simulate button. Never lose work from accidental changes.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Auto-Save</strong> — Your session is automatically saved every 30 seconds to localStorage. If you close the browser and return, a recovery dialog appears asking if you want to restore your unsaved work.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Onboarding Wizard</strong> — First-time users see an 8-step guided tour. Click the <strong>?</strong> button in the header anytime to reopen it.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Mobile Responsive</strong> — Tables automatically convert to card stacks on mobile devices. The app works on phones and tablets for use in warehouses or supplier meetings.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">CSV Bulk Import</strong> — Paste a CSV of ingredients (name, mgPerUnit, costPerMg, supplierPaymentDays) in the Product tab to import 20 ingredients in 10 seconds instead of entering them one-by-one. Blue tool card with dashed border.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">PDF Export</strong> — Click Export — Download PDF in the header to generate a branded pitch-deck one-pager with Executive Summary, Channel Profitability, Cost Structure, and Break-Even Analysis. Designed for investor meetings and bank loan applications.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Industry Benchmarks</strong> — KPI cards on the Dashboard display supplement industry benchmark ranges (e.g., "Industry: 45%-75%" for blended margin) so you can instantly compare your model against market norms.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Goal Seek Solver</strong> — Reverse-engineer the inputs needed to hit a target. Great for answering "What price do I need to charge to make $50/pack?" or "How much must I reduce ingredient cost to hit 60% margin?" Violet Power Tool card.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Batch What-If</strong> — Systematically test a range of values (5-10 price points, discount levels, or cost scenarios) in a single table to find the optimal configuration. Violet Power Tool card.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Sensitivity Tornado Chart</strong> — See at a glance which inputs have the biggest impact on your blended margin. The diverging bars show exactly how much margin changes when each input varies by ±10%.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Time-Series Charts</strong> — Cash Flow, Subscription Growth, and Campaign Impact all include visual charts showing trends over time. Spot problems before they become crises.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Color-Coded Tool Cards</strong> — Every advanced feature is organized in a visually distinct card with a category color: Blue (Import), Amber (Pricing), Sky (Shipping), Emerald (Tax), Orange (Cash Flow), Violet (Power Tools), Rose (Validation), Slate (Audit).
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Quick Tips
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-muted-foreground">
              <li className="pl-1">Hover over the <strong className="text-foreground">i</strong> icons next to labels for detailed tooltips on every input and metric.</li>
              <li className="pl-1">Use <strong className="text-foreground">mg</strong> toggle in the header to switch between milligram and ounce units.</li>
              <li className="pl-1"><strong className="text-foreground">Share</strong> button copies a URL with your full model encoded — anyone with the link sees your exact setup.</li>
              <li className="pl-1">The <strong className="text-foreground">Save</strong> button in the header saves scenarios to your browser's localStorage (survives page refresh). Add notes to remember why you saved each scenario.</li>
              <li className="pl-1">Red alert cards in Cash Flow warn you when ending balance drops below $5,000.</li>
              <li className="pl-1">MOQ Pricing Tiers (amber card) auto-select the right cost-per-mg based on your total order volume.</li>
              <li className="pl-1">Enable Weight-Based Shipping (sky card) to replace flat-rate shipping with carrier-like pricing by package weight.</li>
              <li className="pl-1">Add Sales Tax and Import Duty (emerald card) in the Channels tab to model regulatory costs per channel.</li>
              <li className="pl-1">The Simulate tab's shadow state lets you experiment safely — your real model is not changed until you click Apply.</li>
              <li className="pl-1">Use the Compare tab to evaluate strategic decisions by loading two scenarios side-by-side.</li>
              <li className="pl-1">Campaigns with high volume uplift (50%+) can produce positive net effects despite deep discounts.</li>
              <li className="pl-1">The Dashboard tab is your fastest way to check overall model health — Sanity Checks first, then 10 KPIs, then Audit Trail.</li>
              <li className="pl-1">All tables (Subscriptions, Cash Flow) render as card stacks on mobile for phone/tablet use.</li>
              <li className="pl-1">If you accidentally change something, use Ctrl+Z to undo up to 50 steps back.</li>
              <li className="pl-1">The PDF export includes a professional branded header — use it for investor decks and bank applications.</li>
              <li className="pl-1">Use Goal Seek (violet card, Tab 10) to reverse-calculate the exact price, discount, or cost needed to hit a target margin or profit.</li>
              <li className="pl-1">Use Batch What-If (violet card, Tab 11) to compare 5-10 scenarios at once and identify the optimal configuration.</li>
              <li className="pl-1">Check the Sanity Checks panel (rose card) on the Dashboard first — it catches problems you might miss.</li>
              <li className="pl-1">The Assumptions Audit Trail (slate card) is perfect for due diligence and handoffs — it lists every assumption in your model.</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
