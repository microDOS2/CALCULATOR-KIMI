import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const steps = [
  {
    num: "1",
    title: "Product",
    desc: "Define your Stock Keeping Units (SKUs). Each SKU is a distinct product variant with its own units per pack, retail price, and channel sales mix. Add ingredients (raw materials) with mg per unit, cost per mg, and supplier payment terms. The calculator shows total weight per unit, cost per mg, and cost per gram. Use the Order Composition to set how many packs of each SKU you're ordering.",
    required: true,
  },
  {
    num: "2",
    title: "Packaging",
    desc: "Each SKU has its own packaging layers — primary container, inner packaging, outer box, display packaging, shipping box. Set cost per unit, units per layer, and weight in grams for each layer. Toggle Include on/off to see costs update live. The total packaging cost and weight feed into COGS and shipping calculations.",
    required: true,
  },
  {
    num: "3",
    title: "Channels",
    desc: "Set your wholesale discount (how much retailers pay below retail) and distributor discount (how much distributors pay below wholesale). The cascade is: Retail Price → Wholesale Price → Distributor Price. Toggle which channels to include. Retail can optionally include a per-pack shipping cost.",
    required: true,
  },
  {
    num: "4",
    title: "Costs & Break-Even",
    desc: "Add fixed monthly overhead (salaries, rent, insurance, etc.) and cash flow settings (starting cash, payment terms, lead times, debt service, CapEx). Set monthly volume per SKU — this drives overhead allocation per pack and the break-even calculation. The break-even shows how many packs you need to sell to cover costs.",
    required: true,
  },
  {
    num: "5",
    title: "Orders",
    desc: "Shows the profitability of your Order Composition as a Purchase Order. Breaks down profit by channel for each SKU line item. Calculates total GP, monthly overhead impact, net impact, average cost per unit, and average profit per unit. Based on your Product tab order quantities.",
    required: false,
  },
  {
    num: "6",
    title: "Commissions",
    desc: "Set up a 4-tier sales commission hierarchy: President → VP → RSM → Salesperson. Define override percentages or per-pack amounts. Assign team members. Add performance bonuses with thresholds. View projected commission payouts. This only affects projections, not core profitability.",
    required: false,
  },
  {
    num: "7",
    title: "Third Party",
    desc: "Add external service provider costs across 5 categories (Sales, Operations, Fulfillment, Business Management, Marketing) with 25 line items each. Check 'Include' to fold into monthly overhead. Model outsourced vs. in-house operations and see impact on per-pack profitability.",
    required: false,
  },
  {
    num: "8",
    title: "Charts",
    desc: "Visual analytics — a pie chart breaks down your cost structure (ingredients, packaging layers), and a bar chart compares revenue, gross profit, and operating profit across all three channels. Quickly identify your biggest cost drivers and most profitable channel.",
    required: false,
  },
  {
    num: "9",
    title: "Subscriptions",
    desc: "Model monthly recurring revenue (MRR) with subscription plans. Each plan includes one or more SKUs that subscribers receive monthly. Set growth rate, churn rate, starting subscribers, and CAC. View 12-month projections with subscriber counts, revenue, COGS, and cumulative figures. Compare multiple plans.",
    required: false,
  },
  {
    num: "10",
    title: "Cash Flow",
    desc: "Tracks when money actually enters and leaves your bank account — not just when revenue is earned. Models customer payment terms (retail immediate, wholesale Net-30, distributor Net-60), supplier lead times, inventory delays, debt service, and one-time CapEx. Shows your cash trough, breakeven month, and 12-month net flow. Toggle between monthly and weekly views.",
    required: false,
  },
  {
    num: "11",
    title: "Scenarios",
    desc: "Save a complete snapshot of your entire calculator configuration. Load past scenarios to compare different business models. Export results as CSV, PDF, or Excel. Share via URL — the link encodes your entire model so anyone who opens it sees exactly what you see.",
    required: false,
  },
];

const tips = [
  "Channel Mix % must total 100% for each SKU — the calculator enforces this automatically.",
  "Monthly Volume is critical — without it, break-even shows 'Unprofitable' and overhead per pack is artificially high.",
  "Order Composition is separate from Monthly Volume — order qty drives PO analysis; monthly volume drives overhead allocation.",
  "Hover over any info badge (i) to see what a section or field means.",
  "Hover over any formula badge (f) to see the exact calculation with live numbers.",
  "The formula tooltips show actual numbers — they update live as you change inputs.",
  "Use 'Share' to copy a URL that contains your entire model — anyone who opens it sees exactly what you see.",
  "Check 'Include Monthly Overhead' in Break-Even to see how many packs you need to cover fixed costs.",
  "Third Party costs only affect calculations when 'Include' is checked AND 'Include Third Party' in Costs is also checked.",
  "Generic defaults (SKU-A, Ingredient 1) mean this works for any physical product — supplements, electronics, apparel, food, etc.",
  "Each SKU has its own packaging — select an SKU in the Packaging tab to edit its layers independently.",
  "Toggle the unit switch (mg/oz) in the header to display weights in your preferred unit system.",
  "Subscription plans can include multiple SKUs — create product bundles like 'Basic' (1 SKU) or 'Premium' (3 SKUs).",
  "Lower churn rate + higher monthly price = higher LTV and faster CAC payback.",
  "Cash Flow tracks actual bank balance — a business can be profitable on paper but run out of cash. Watch your lowest balance month.",
  "The Simulate panel lets you drag sliders to explore 'what-if' scenarios without changing your saved model.",
  "Payment terms create cash gaps — you may pay suppliers in 30 days but customers pay you in 60 days. That's a 30-day cash gap.",
  "Use the Simulate tab for deep analysis — it shows all 12 key metrics side-by-side as you adjust levers.",
  "The info badges (i circles) explain what each section does — hover over them for educational context.",
];

export function Guide() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 shrink-0"
          onClick={() => setOpen(true)}
          type="button"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">How to Use the Channel Calculator</DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-6 pb-6 max-h-[70vh]">
          <div className="space-y-6">
            {/* Overview */}
            <section>
              <h3 className="font-semibold text-sm mb-2">What This Calculator Does</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A business modeling tool for any physical product. Calculate per-pack profitability
                across retail, wholesale, and distributor channels. Model per-SKU packaging costs,
                ingredient costs, overhead allocation, break-even points, purchase orders, sales
                commissions, subscription revenue, and cash flow timing. Features sensitivity sliders
                for strategy exploration, mg/oz unit toggle, multiple SKUs with independent packaging,
                product bundle subscriptions, and scenario save/load with URL sharing.
              </p>
            </section>

            {/* Step Flow */}
            <section>
              <h3 className="font-semibold text-sm mb-3">Recommended Input Flow</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.num} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{step.title}</span>
                        {step.required ? (
                          <Badge variant="destructive" className="text-xs h-4 px-1">Required</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs h-4 px-1">Optional</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tools (unnumbered) */}
            <section>
              <h3 className="font-semibold text-sm mb-2">Tools & Modes</h3>
              <div className="space-y-2">
                <div className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                    ●
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Simulate</span>
                      <Badge variant="outline" className="text-xs h-4 px-1">Tool</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      Explore "what-if" scenarios with draggable sliders. Adjust retail price, discounts, volume,
                      subscription growth, and churn — watch all metrics update in real-time. Available as a
                      floating side panel (quick exploration) or a dedicated full-screen tab (deep analysis).
                      Changes don't affect your saved model until you click Apply. Use Reset to snap back anytime.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Overview */}
            <section>
              <h3 className="font-semibold text-sm mb-2">Key Features</h3>
              <ul className="space-y-1.5">
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Per-SKU Packaging</strong> — Each product has its own packaging layers with independent costs and weights
                </li>
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Unit Toggle (mg/oz)</strong> — Switch between milligrams and ounces for ingredient and weight displays
                </li>
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Subscription Projections</strong> — Model MRR, churn, growth, and 12-month forecasts with product bundles
                </li>
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Cash Flow Forecasting</strong> — Track actual bank balance with payment terms, lead times, debt, and CapEx. Monthly and weekly views.
                </li>
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Strategy Simulator</strong> — Drag sliders to explore scenarios without changing your saved model. Panel + tab modes.
                </li>
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Formula Tooltips</strong> — Hover over (f) badges to see live calculations with actual numbers
                </li>
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Educational Tooltips</strong> — Hover over (i) badges to learn what each section and field means
                </li>
                <li className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                  <span className="text-primary flex-shrink-0">•</span>
                  <strong>Required/Optional Indicators</strong> — Red badges for required fields, gray for optional
                </li>
              </ul>
            </section>

            {/* Quick Tips */}
            <section>
              <h3 className="font-semibold text-sm mb-3">Quick Tips</h3>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2 items-start leading-relaxed">
                    <span className="text-primary flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
