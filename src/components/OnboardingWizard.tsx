import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calculator, Package, Store, BarChart3, Target, Table2, ShieldCheck, HelpCircle, ArrowRight, ArrowLeft, X, Wrench, ShoppingCart, ToggleLeft } from "lucide-react";

const WIZARD_KEY = "channel_calc_wizard_seen_v3";

const tabColorLegend = [
  { label: "Foundation", cls: "bg-blue-200 text-blue-800", tabs: "1-3" },
  { label: "B2C Sales", cls: "bg-indigo-200 text-indigo-800", tabs: "4-5" },
  { label: "Operations", cls: "bg-emerald-200 text-emerald-800", tabs: "6-10" },
  { label: "Dashboard & Power", cls: "bg-violet-200 text-violet-800", tabs: "11-13" },
  { label: "Forecast", cls: "bg-amber-200 text-amber-800", tabs: "14-16" },
  { label: "Manage", cls: "bg-slate-200 text-slate-800", tabs: "17-19" },
  { label: "Simulate", cls: "bg-rose-200 text-rose-800", tabs: "●" },
];

const steps = [
  {
    icon: Calculator,
    title: "Welcome to Channel Calculator",
    body: "This tool models your product's profitability across Retail, Wholesale, and Distributor channels. Every input starts blank — you consciously choose every assumption. No hidden defaults, no pre-selected channels, no assumed costs.",
  },
  {
    icon: ToggleLeft,
    title: "Step 1: Choose Your Channels (Blank Slate)",
    body: "All three channels start OFF by design. You must check at least one to begin: Retail (B2C — direct to consumers), Wholesale (B2B — sell to retailers), or Distributor (B2B — sell through middlemen). Go to the Channels tab and check the channels you plan to use. You can toggle any channel on/off at any time.",
  },
  {
    icon: Package,
    title: "Step 2: Build Your Product",
    body: "In the Product tab (blue group), add your SKUs, ingredients (with cost per mg), and packaging layers. The calculator automatically computes COGS per pack. Use the CSV Bulk Import card to paste a spreadsheet of ingredients. Use the Volume Pricing Tiers card to set MOQ discounts.",
  },
  {
    icon: ShoppingCart,
    title: "Step 3: Set Channel Prices & Shipping",
    body: "In the Channels tab, set retail price, wholesale discount, and distributor discount. The Per-Channel Shipping card lets you set carrier costs per channel. IMPORTANT: Cost per PACK, not per shipment. Example: a $350 pallet with 144 packs = $2.43/pack. Only Retail has a default — Wholesale and Distributor must be defined by you.",
  },
  {
    icon: Store,
    title: "Step 4: Add Operating Costs",
    body: "In the Costs tab, enter monthly overhead (rent, salaries, utilities, marketing) and set monthly volumes per SKU. Toggle overhead allocation per channel. Optional: add Marketing, Shipping Employees, Third Party services, or Campaigns for promotions.",
  },
  {
    icon: BarChart3,
    title: "Step 5: Analyze & Visualize",
    body: "The Charts tab shows a Sensitivity Tornado Chart (which inputs most affect margin), a cost breakdown pie chart, and channel profit comparison bars. The Dashboard (violet) shows KPIs, sanity checks against benchmarks, and a complete assumptions audit trail.",
  },
  {
    icon: Target,
    title: "Step 6: Optimize with Power Tools",
    body: "Goal Seek (Tab 12) — reverse-solve: pick a target, pick an adjustable input, solver finds the exact value. Batch What-If (Tab 13) — test 5-10 values at once with green/red profit indicators. These are the fastest ways to find optimal pricing.",
  },
  {
    icon: Table2,
    title: "Step 7: Compare & Save Scenarios",
    body: "Save model configurations as named scenarios with notes (Tab 17). Use the Compare tab to load two scenarios side-by-side with 13 key metrics and green/red delta indicators. Notes help you remember why you saved each scenario.",
  },
  {
    icon: ShieldCheck,
    title: "Step 8: Validate & Audit",
    body: "The Dashboard starts with the Sanity Checks panel (9 industry benchmarks). Below: 10 live KPI cards with trend indicators. At the bottom: the Assumptions Audit Trail lists every assumption in your model with current values and business impact. Use this for investor meetings and due diligence.",
  },
  {
    icon: Wrench,
    title: "Step 9: Cash Flow & Advanced Tools",
    body: "The Cash Flow tab (amber) projects 12 months of inflows/outflows with payment term delays, lead times, and debt service. Capital Expenditures and Debt Service cards for modeling investments and loans. Subscription plans (start inactive — you must enable them) with churn/growth. Remember: Ctrl+Z undoes up to 50 steps.",
  },
];

export function OnboardingWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(WIZARD_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const markSeen = () => {
    localStorage.setItem(WIZARD_KEY, "true");
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      markSeen();
      setOpen(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    markSeen();
    setOpen(false);
  };

  const handleReopen = () => {
    setStep(0);
    setOpen(true);
  };

  const current = steps[step];
  const Icon = current.icon;

  return (
    <>
      {/* Floating help button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleReopen}
        title="Open guided tour"
        className="gap-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 shadow-sm"
      >
        <HelpCircle className="h-4 w-4 text-violet-600" />
        <span className="hidden sm:inline">?</span>
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-lg">{current.title}</DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed pt-1">
              {current.body}
            </DialogDescription>
          </DialogHeader>

          {/* Color legend bar */}
          <div className="flex flex-wrap gap-1.5 pt-2 pb-1">
            {tabColorLegend.map((c) => (
              <span key={c.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${c.cls}`}>
                {c.label} <span className="opacity-60">{c.tabs}</span>
              </span>
            ))}
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 pt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBack} disabled={step === 0} size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleNext} size="sm">
                {step === steps.length - 1 ? (
                  <>Get Started <X className="h-4 w-4 ml-1" /></>
                ) : (
                  <>Next <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Skip Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
