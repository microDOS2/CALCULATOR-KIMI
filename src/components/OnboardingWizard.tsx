import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calculator, Package, Store, BarChart3, TrendingUp, Target, Table2, ShieldCheck, HelpCircle, ArrowRight, ArrowLeft, X } from "lucide-react";

const WIZARD_KEY = "channel_calc_wizard_seen_v2";

const steps = [
  {
    icon: Calculator,
    title: "Welcome to Channel Calculator",
    body: "This tool models your product's profitability across Retail, Wholesale, and Distributor channels. Enter your product specs, costs, and pricing — then explore scenarios, simulate changes, forecast cash flow, and validate your model against industry benchmarks.",
  },
  {
    icon: Package,
    title: "Step 1: Build Your Product",
    body: "Start in the Product tab. Add your SKUs, ingredients (with cost per mg), and packaging layers. The calculator automatically computes COGS — the total cost to produce one pack. Every other number in the tool flows from this foundation. Use CSV Import to bulk-paste ingredients from a spreadsheet.",
  },
  {
    icon: Store,
    title: "Step 2: Set Your Channels",
    body: "In the Channels tab, set retail price, wholesale discount, and distributor discount. The calculator shows gross profit and margin for each channel. Toggle channels on/off to see how each one contributes. Add Sales Tax and Import Duty to model regulatory costs. Enable Weight-Based Shipping for carrier-like pricing.",
  },
  {
    icon: BarChart3,
    title: "Step 3: Analyze & Visualize",
    body: "The Charts tab includes a Sensitivity Tornado Chart that shows which inputs most affect your blended margin (±10% swings). A pie chart reveals your biggest cost drivers. A bar chart compares revenue vs. profit across all three channels. Time-series charts in Cash Flow, Subscriptions, and Campaigns tabs show trends over time.",
  },
  {
    icon: Target,
    title: "Step 4: Optimize with Power Tools",
    body: "Use Goal Seek (Tab 9.5) to reverse-calculate: enter a target margin or profit, pick which input to adjust (price, discount, cost), and the solver finds the exact value. Use Batch What-If (Tab 9.6) to test 5-10 values at once and compare in a single table. These are the fastest ways to find your optimal pricing and cost structure.",
  },
  {
    icon: Table2,
    title: "Step 5: Compare & Save Scenarios",
    body: "Save your model configurations as named scenarios with notes (Tab 13). Use the Compare tab (Tab 14) to load two scenarios side-by-side and see 13 key metrics with green/red delta indicators. This is the fastest way to evaluate strategic decisions — like raising price vs. cutting costs.",
  },
  {
    icon: ShieldCheck,
    title: "Step 6: Validate & Audit",
    body: "The Dashboard (Tab 9) is your Mission Control. It includes 10 live KPI cards with industry benchmark comparisons (supplement industry norms), an automated Sanity Checks panel that flags COGS ratios, margins, break-even feasibility, and cash flow risks, plus a complete Assumptions Audit Trail listing every assumption in your model. Use this for investor meetings, bank applications, and due diligence.",
  },
  {
    icon: TrendingUp,
    title: "Step 7: Forecast & Simulate",
    body: "Click Simulate to drag sliders and watch margins update live. Visit the Cash Flow tab to model when cash goes in and out — including payment terms and inventory lead times. Model subscriptions with churn and growth projections. This is where strategy meets reality. Remember: you can always undo with Ctrl+Z (50 steps).",
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
        className="gap-1"
      >
        <HelpCircle className="h-4 w-4" />
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
