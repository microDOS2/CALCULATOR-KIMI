import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calculator, Package, Store, BarChart3, Target, Table2, ShieldCheck, HelpCircle, ArrowRight, ArrowLeft, X, Wrench } from "lucide-react";

const WIZARD_KEY = "channel_calc_wizard_seen_v3";

const tabColorLegend = [
  { label: "Core Setup", cls: "bg-blue-200 text-blue-800", tabs: "1-4" },
  { label: "Operations", cls: "bg-emerald-200 text-emerald-800", tabs: "5-8" },
  { label: "Power", cls: "bg-violet-200 text-violet-800", tabs: "9-11" },
  { label: "Forecast", cls: "bg-amber-200 text-amber-800", tabs: "12-14" },
  { label: "Manage", cls: "bg-slate-200 text-slate-800", tabs: "15-16" },
  { label: "Simulate", cls: "bg-rose-200 text-rose-800", tabs: "●" },
];

const steps = [
  {
    icon: Calculator,
    title: "Welcome to Channel Calculator",
    body: "This tool models your product's profitability across Retail, Wholesale, and Distributor channels. Enter your product specs, costs, and pricing — then explore scenarios, simulate changes, forecast cash flow, and validate your model against industry benchmarks. Every advanced feature lives in a color-coded tool card so you can't miss it.",
  },
  {
    icon: Package,
    title: "Step 1: Build Your Product",
    body: "Start in the Product tab (blue tab group). Add your SKUs, ingredients (with cost per mg), and packaging layers. The calculator automatically computes COGS. Look for the blue CSV Bulk Import card to paste a spreadsheet of ingredients in seconds. Use the amber Volume Pricing Tiers card to set MOQ discounts like \"$0.70/mg at 1kg\".",
  },
  {
    icon: Store,
    title: "Step 2: Set Your Channels",
    body: "In the Product tab (blue) (blue group), set retail price, wholesale discount, and distributor discount. Toggle channels on/off to see contribution. Look for the sky-blue Weight-Based Shipping card to model carrier-like pricing by package weight. Use the emerald Tax & Duty card to add Sales Tax on retail and Import Duty on distributor. These are not hidden — they're right below your channel cards.",
  },
  {
    icon: BarChart3,
    title: "Step 3: Analyze & Visualize",
    body: "The Charts tab (emerald group) includes a Sensitivity Tornado Chart that shows which inputs most affect your blended margin (±10% swings). A pie chart reveals your biggest cost drivers. A bar chart compares revenue vs. profit across all three channels. Time-series charts in Cash Flow, Subscriptions, and Campaigns tabs show trends over time.",
  },
  {
    icon: Target,
    title: "Step 4: Optimize with Power Tools",
    body: "The violet tabs are your power tools. Goal Seek (Tab 14) reverse-calculates: enter a target margin or profit, pick an input to adjust, and the solver finds the exact value. Batch What-If (Tab 14) tests 5-10 values at once in a comparison table with green/red profit indicators. These are the fastest ways to find your optimal pricing and cost structure.",
  },
  {
    icon: Table2,
    title: "Step 5: Compare & Save Scenarios",
    body: "Save your model configurations as named scenarios with notes (Tab 17, slate group). Use the Compare tab (Tab 17, slate group) to load two scenarios side-by-side and see 13 key metrics with green/red delta indicators. Notes help you remember why you saved each scenario. This is the fastest way to evaluate strategic decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Step 6: Validate & Audit",
    body: "The Dashboard (Tab 14, violet group) is your Mission Control. It starts with the rose Sanity Checks panel that auto-validates your model against 8 industry benchmarks and flags problems. Below that, 10 live KPI cards with benchmark comparisons. At the bottom, the slate Assumptions Audit Trail lists every assumption in your model. Use this for investor meetings, bank applications, and due diligence.",
  },
  {
    icon: Wrench,
    title: "Step 7: Cash Flow & Advanced Tools",
    body: "The Cash Flow tab (Tab 14, amber group) includes orange tool cards for Capital Expenditures (equipment, vehicles) and Debt Service (monthly loan payments). These affect your 12-month cash projection. Model subscriptions with churn and growth projections. The Simulate button (rose) opens a floating panel for live what-if analysis. Remember: Ctrl+Z undoes up to 50 steps.",
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
