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
    desc: "Define your Stock Keeping Units (SKUs). Each SKU is a distinct product variant. Set units per pack, retail price, and what % sells through each channel. These must total 100%.",
    required: true,
  },
  {
    num: "2",
    title: "Packaging",
    desc: "Add each physical packaging layer your product needs: primary container (what the product sits in), inner packaging, outer box, display packaging, and shipping box. Set cost per unit and how many units fit in each layer.",
    required: true,
  },
  {
    num: "3",
    title: "Channels",
    desc: "Set your wholesale discount (how much retailers pay below retail) and distributor discount (how much distributors pay below wholesale). The cascade is: Retail Price → Wholesale Price → Distributor Price. Toggle which channels to include.",
    required: true,
  },
  {
    num: "4",
    title: "Costs & Break-Even",
    desc: "Add your fixed monthly overhead (salaries, rent, insurance, etc.). Set monthly volume per SKU — this is critical as it drives overhead allocation per pack and the break-even calculation. The break-even shows how many packs you need to sell to cover costs.",
    required: true,
  },
  {
    num: "5",
    title: "Order Composition",
    desc: "Within the Product tab, enter how many packs of each SKU you are ordering. This order mix drives the Purchase Order analysis and weighted-average calculations across all channels.",
    required: false,
  },
  {
    num: "6",
    title: "Commissions",
    desc: "Optional — set up your sales commission hierarchy (President → VP → RSM → Salesperson). Define override percentages or per-pack amounts. Assign team members. Add performance bonuses. This only affects projections, not core profitability.",
    required: false,
  },
  {
    num: "7",
    title: "Third Party",
    desc: "Optional — add external service provider costs (Sales, Operations, Fulfillment, Business Management, Marketing). Check 'Include' to fold these into your monthly overhead. Each category has 25 pre-filled line items.",
    required: false,
  },
  {
    num: "8",
    title: "Charts",
    desc: "Visual breakdown of your cost structure (pie chart) and channel profitability comparison (bar chart). Use these to quickly identify your biggest costs and most profitable channel.",
    required: false,
  },
  {
    num: "9",
    title: "Scenarios",
    desc: "Save a complete snapshot of your calculator configuration with a label. Load past scenarios to compare different business models. Export results as CSV, PDF, or Excel. Share via URL — the link encodes your entire model.",
    required: false,
  },
];

const tips = [
  "Channel Mix % must total 100% for each SKU — the calculator enforces this automatically.",
  "Monthly Volume is critical — without it, break-even shows 'Unprofitable' and overhead per pack is artificially high.",
  "Order Composition is separate from Monthly Volume — order qty drives PO analysis; monthly volume drives overhead allocation.",
  "Hover over any ƒ badge to see the exact formula used to calculate that result.",
  "Hover over any ⓘ badge to see explanatory text about what a section or field means.",
  "The ƒ (formula) tooltips show actual numbers — they update live as you change inputs.",
  "Use 'Share' to copy a URL that contains your entire model — anyone who opens it sees exactly what you see.",
  "Check 'Include Monthly Overhead' in Break-Even to see how many packs you need to cover fixed costs.",
  "Third Party costs only affect calculations when 'Include' is checked AND 'Include Third Party' in Costs is also checked.",
  "Generic defaults (SKU-A, Ingredient 1) mean this works for any physical product — supplements, electronics, apparel, food, etc.",
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
                across retail, wholesale, and distributor channels. Model packaging costs, ingredient
                costs, overhead allocation, break-even points, purchase order profitability, and sales
                commissions. Run what-if scenarios and compare outcomes.
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
