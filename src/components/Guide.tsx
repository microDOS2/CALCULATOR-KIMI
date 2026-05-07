import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Lightbulb, MousePointer, Sparkles, ShieldCheck, ClipboardList } from "lucide-react";

export function Guide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1">
          <BookOpen className="h-4 w-4" /> Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            User Guide
          </DialogTitle>
          <DialogDescription className="text-sm">
            Complete walkthrough of all 17 tabs and every feature.
          </DialogDescription>
        </DialogHeader>

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
              <li className="pl-1">
                <span className="font-medium">Product (Tab 1)</span> — Add your SKUs with units-per-pack, units-per-case, and pricing. Add ingredients with mg-per-unit, cost-per-mg, and supplier payment terms. Use <strong>MOQ Pricing Tiers</strong> to model volume discounts: "$0.70/mg at 1kg, $0.55/mg at 5kg. Use the <strong>CSV Import</strong> section to bulk-paste ingredients from a spreadsheet. The calculator auto-computes COGS per pack.
              </li>
              <li className="pl-1">
                <span className="font-medium">Packaging (Tab 2)</span> — Define packaging layers per SKU (jar, bottle, label, box). Set unit cost and weight (grams) for each layer. Packaging weight is used for <strong>weight-based shipping rates</strong>.
              </li>
              <li className="pl-1">
                <span className="font-medium">Channels (Tab 3)</span> — Set your retail selling price, wholesale discount %, and distributor discount %. Toggle channels on/off to see how each contributes. Set a flat shipping cost per pack, or enable <strong>Weight-Based Shipping Rates</strong> for carrier-like pricing by package weight. Add <strong>Sales Tax</strong> on retail and <strong>Import Duty</strong> on distributor to model regulatory costs.
              </li>
              <li className="pl-1">
                <span className="font-medium">Overhead (Tab 4)</span> — Enter your monthly overhead costs (rent, salaries, utilities, marketing). Toggle whether overhead is allocated to each channel. This directly affects operating profit.
              </li>
              <li className="pl-1">
                <span className="font-medium">3rd Party (Tab 5)</span> — Add third-party logistics or service providers. Include their markup %, which gets added to your cost structure.
              </li>
              <li className="pl-1">
                <span className="font-medium">PO (Tab 6)</span> — View purchase order projections. The calculator generates POs for raw materials and finished goods based on your production plan and ingredient lead times.
              </li>
              <li className="pl-1">
                <span className="font-medium">Commissions (Tab 7)</span> — Configure sales commissions. Set commission % per channel and see the total commission impact on your operating profit.
              </li>
              <li className="pl-1">
                <span className="font-medium">Charts (Tab 8)</span> — Visual breakdown of your business. <strong>Sensitivity Tornado Chart</strong> shows which inputs most affect your blended margin (diverging bars for ±10% changes). Pie chart shows cost composition (ingredients, packaging, overhead, shipping). Bar chart compares gross profit across all three channels. Time-series charts appear in their respective tabs.
              </li>
              <li className="pl-1">
                <span className="font-medium">Dashboard (Tab 9)</span> — One-screen "Mission Control" with 10 KPI cards: Blended Margin, Break-Even Revenue, Monthly Volume, COGS/Pack, Channel GPs, Shipping, Top Cost Driver, Tax Impact, and Campaign Effect. All numbers update in real-time. Industry benchmark ranges appear below select KPIs so you can compare against supplement industry norms. Use this for investor meetings or bank applications.
              </li>
              <li className="pl-1">
                <span className="font-medium">Goal Seek (Tab 9.5)</span> — Work backward from a target. Select what you want to achieve (e.g., "$50 gross profit per pack"), pick which input to adjust (e.g., "Retail Price"), and the solver finds the exact value that hits your target using 30-iteration binary search. Supports 5 target metrics and 7 adjustable inputs including ingredient/packaging cost multipliers.
              </li>
              <li className="pl-1">
                <span className="font-medium">Batch (Tab 9.6)</span> — Test multiple values for a single input at once. Enter comma-separated values (e.g., "20, 25, 30, 35, 40" for retail price) and get a comparison table with gross profit, margin, break-even, COGS, and break-even packs for each value. Rows highlight green when profit improves vs. the previous row, red when it declines.
              </li>
              <li className="pl-1">
                <span className="font-medium">Subscriptions (Tab 10)</span> — Model recurring revenue with subscription plans. Set monthly price, churn rate, and growth rate. See a 12-month projection of subscribers, MRR, and cumulative profit. Includes subscriber growth chart and revenue chart per plan. Toggle between monthly table view and mobile-friendly card view.
              </li>
              <li className="pl-1">
                <span className="font-medium">Cash Flow (Tab 11)</span> — Profitability does not equal viability. This tab projects 12 months of cash inflows and outflows, including payment term delays (NET 30/60/90), ingredient PO lead times, and debt service. Toggle between Monthly and Weekly views. Includes a 12-month cash balance bar chart. Watch for the red warning cards if your balance drops below $5,000.
              </li>
              <li className="pl-1">
                <span className="font-medium">Campaigns (Tab 12)</span> — Model time-boxed promotions like "Black Friday: 20% off for 2 weeks." Set discount %, duration, volume uplift %, and affected channels. The impact analysis shows Revenue At Risk, Margin Compression, and Net Annual Effect. If volume uplift outweighs the discount, net effect is green (positive). Includes before/during/after revenue comparison chart.
              </li>
              <li className="pl-1">
                <span className="font-medium">Scenarios (Tab 13)</span> — Save your current model configuration with a label and an optional note/description. Load previously saved scenarios. Delete or clear all. Scenarios persist in localStorage and survive browser restarts. Each scenario captures the complete state of all 17 tabs. Notes help you remember the rationale behind each saved scenario.
              </li>
              <li className="pl-1">
                <span className="font-medium">Compare (Tab 14)</span> — Load two saved scenarios side-by-side. Compare 13 key metrics (price, margin, break-even, volume, profit, shipping, COGS) with green/red delta indicators showing percentage change. Scenario notes appear in dropdowns and card headers for context. This is the fastest way to evaluate strategic decisions.
              </li>
              <li className="pl-1">
                <span className="font-medium">Simulate (Tab 15 / floating panel)</span> — Live what-if analysis. Drag 8 sliders (Retail Price, Units/Pack, Wholesale Discount, Distributor Discount, Monthly Volume, Subscription Price, Growth Rate, Churn Rate) and watch 12 delta cards update in real-time. The shadow state does not modify your real model until you click Apply. Click the Simulate button in the header for a floating panel, or use the Simulate tab for the full-page dashboard.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Sanity Checks & Validation
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              The Dashboard includes an automated Sanity Checks panel that validates your model against industry benchmarks and business logic in real-time.
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs text-muted-foreground">
              <li className="pl-1"><strong className="text-foreground">COGS Ratio</strong> — Checks if COGS is 20-45% of retail price (supplement industry norm).</li>
              <li className="pl-1"><strong className="text-foreground">Blended Margin</strong> — Validates gross margin is within the 45-75% healthy range.</li>
              <li className="pl-1"><strong className="text-foreground">Break-Even Feasibility</strong> — Warns if break-even volume exceeds 2,000 packs/month.</li>
              <li className="pl-1"><strong className="text-foreground">Channel Profitability</strong> — Flags any channel with negative gross profit.</li>
              <li className="pl-1"><strong className="text-foreground">Subscription Churn</strong> — Compares churn rate against 3-12% industry range.</li>
              <li className="pl-1"><strong className="text-foreground">Cash Flow</strong> — Alerts when projected balance goes negative or below $5,000.</li>
              <li className="pl-1"><strong className="text-foreground">Campaign Net Effect</strong> — Warns if promotions reduce overall annual profit.</li>
              <li className="pl-1"><strong className="text-foreground">Overhead Ratio</strong> — Flags when overhead exceeds 25% of revenue.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Assumptions Audit Trail
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              The Dashboard also includes a complete Assumptions Audit Trail — every assumption in your model listed by category (Product, Ingredients, Packaging, Channels, Shipping, Overhead, Tax, Volume, Cash Flow, Subscriptions, Campaigns). Each row shows the assumption name, its current value, and its business impact. Use this for due diligence, investor meetings, or when handing off a model to another team member.
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
                <strong className="text-foreground">Onboarding Wizard</strong> — First-time users see a 5-step guided tour. Click the <strong>?</strong> button in the header anytime to reopen it.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Mobile Responsive</strong> — Tables automatically convert to card stacks on mobile devices. The app works on phones and tablets for use in warehouses or supplier meetings.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">CSV Bulk Import</strong> — Paste a CSV of ingredients (name, mgPerUnit, costPerMg, supplierPaymentDays) in the Product tab to import 20 ingredients in 10 seconds instead of entering them one-by-one.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">PDF Export</strong> — Click Export — Download PDF in the header to generate a branded pitch-deck one-pager with Executive Summary, Channel Profitability, Cost Structure, and Break-Even Analysis. Designed for investor meetings and bank loan applications.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Industry Benchmarks</strong> — KPI cards on the Dashboard display supplement industry benchmark ranges (e.g., "Industry: 45%-75%" for blended margin) so you can instantly compare your model against market norms.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Goal Seek Solver</strong> — Reverse-engineer the inputs needed to hit a target. Great for answering "What price do I need to charge to make $50/pack?" or "How much must I reduce ingredient cost to hit 60% margin?"
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Batch What-If</strong> — Systematically test a range of values (5-10 price points, discount levels, or cost scenarios) in a single table to find the optimal configuration.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Sensitivity Tornado Chart</strong> — See at a glance which inputs have the biggest impact on your blended margin. The diverging bars show exactly how much margin changes when each input varies by ±10%.
              </li>
              <li className="pl-1">
                <strong className="text-foreground">Time-Series Charts</strong> — Cash Flow, Subscription Growth, and Campaign Impact all include visual charts showing trends over time. Spot problems before they become crises.
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
              <li className="pl-1">MOQ Pricing Tiers auto-select the right cost-per-mg based on your total order volume.</li>
              <li className="pl-1">Enable Weight-Based Shipping to replace flat-rate shipping with carrier-like pricing by package weight.</li>
              <li className="pl-1">Add Sales Tax and Import Duty in the Channels tab to model regulatory costs per channel.</li>
              <li className="pl-1">The Simulate tab's shadow state lets you experiment safely — your real model is not changed until you click Apply.</li>
              <li className="pl-1">Use the Compare tab to evaluate strategic decisions by loading two scenarios side-by-side.</li>
              <li className="pl-1">Campaigns with high volume uplift (50%+) can produce positive net effects despite deep discounts.</li>
              <li className="pl-1">The Dashboard tab is your fastest way to check overall model health — all 10 KPIs update live, plus sanity checks and an audit trail.</li>
              <li className="pl-1">All tables (Subscriptions, Cash Flow) render as card stacks on mobile for phone/tablet use.</li>
              <li className="pl-1">If you accidentally change something, use Ctrl+Z to undo up to 50 steps back.</li>
              <li className="pl-1">The PDF export includes a professional branded header — use it for investor decks and bank applications.</li>
              <li className="pl-1">Use Goal Seek to reverse-calculate the exact price, discount, or cost needed to hit a target margin or profit.</li>
              <li className="pl-1">Use Batch What-If to compare 5-10 scenarios at once and identify the optimal configuration.</li>
              <li className="pl-1">Check the Sanity Checks panel on the Dashboard — it catches problems you might miss.</li>
              <li className="pl-1">The Assumptions Audit Trail is perfect for due diligence and handoffs — it lists every assumption in your model.</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
