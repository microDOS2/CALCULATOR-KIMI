import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Package, ShoppingCart, Truck, Building2, Users, BarChart3,
  TrendingUp, ArrowRight, ArrowLeft, Lightbulb, GraduationCap, CheckCircle, Sparkles
} from "lucide-react";

const TUTORIAL_KEY = "channel_calc_tutorial_seen_v1";

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  body: React.ReactNode;
  highlight?: string;
}

const steps: TutorialStep[] = [
  {
    icon: GraduationCap,
    title: "Welcome! Here's How It Works",
    body: (
      <div className="space-y-3">
        <p>
          This calculator models your product's profitability across multiple sales channels.
          <strong> Everything starts as a blank slate.</strong> You must consciously choose which channels to include,
          what your costs are, and how your business operates.
        </p>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" /> Core Principle
          </p>
          <p className="text-xs text-amber-700 mt-1">
            No channel is pre-selected. No cost is assumed. No subscription is active by default.
            Every assumption is yours to make. This prevents hidden defaults from skewing your analysis.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: Package,
    title: "Step 1: Define Your Product",
    body: (
      <div className="space-y-3">
        <p>
          Start in the <strong>Product tab</strong> (blue). Add your SKUs with units-per-pack and retail price.
          Add ingredients with mg-per-unit and cost-per-mg. Add packaging layers with cost and weight.
        </p>
        <p className="text-sm text-muted-foreground">
          The calculator auto-computes your <strong>COGS per pack</strong> — the foundation of everything else.
          Everything downstream depends on getting this right first.
        </p>
      </div>
    ),
    highlight: "product",
  },
  {
    icon: ShoppingCart,
    title: "Step 2: Choose Your Sales Channels",
    body: (
      <div className="space-y-3">
        <p>
          Go to the <strong>Channels tab</strong> (blue). <strong>Check at least one channel</strong> to begin:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <span><strong>Retail</strong> — Direct to consumers at full price (B2C)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
            <span><strong>Wholesale</strong> — Sell to retailers at a discount (B2B)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <span><strong>Distributor</strong> — Sell through a middleman (B2B)</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Price cascade: Retail → Wholesale (discount) → Distributor (deeper discount).
          You can toggle any channel on/off at any time.
        </p>
      </div>
    ),
    highlight: "channels",
  },
  {
    icon: Truck,
    title: "Step 3: Set Your Shipping Costs",
    body: (
      <div className="space-y-3">
        <p>
          In the <strong>Channels tab</strong>, the "Per-Channel Shipping Costs" card lets you set carrier costs for each channel.
        </p>
        <div className="p-3 rounded-lg bg-primary/5 text-sm space-y-2">
          <p className="font-medium">Cost per PACK — not per shipment</p>
          <p className="text-xs text-muted-foreground">
            A pallet costs $350 to ship and holds 144 packs = <strong>$2.43/pack</strong>.
            The carrier invoices per pallet, but for margin analysis we divide by packs.
          </p>
        </div>
        <p className="text-xs text-amber-700">
          Only Retail has a default ($2.50). Wholesale and Distributor <strong>must be defined by you</strong> because freight
          rates vary by pallet size, distance, and carrier.
        </p>
      </div>
    ),
    highlight: "shipping",
  },
  {
    icon: Building2,
    title: "Step 4: Add Overhead & Operating Costs",
    body: (
      <div className="space-y-3">
        <p>
          Go to the <strong>Costs tab</strong> (blue) to add monthly overhead items (rent, salaries, utilities).
          Toggle which channels carry overhead — this affects operating profit per channel.
        </p>
        <p className="text-sm text-muted-foreground">
          Optional tabs for advanced cost modeling: <strong>Marketing</strong>, <strong>Shipping Employees</strong>,
          <strong>Third Party</strong> services, and <strong>Campaigns</strong> for promotions.
        </p>
      </div>
    ),
    highlight: "overhead",
  },
  {
    icon: Users,
    title: "Step 5: Three Payment Systems",
    body: (
      <div className="space-y-3">
        <p>Your model has three completely separate payment systems:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            <span><strong>Affiliates</strong> — External B2C referral partners. Paid on retail revenue.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span><strong>Commissions</strong> — Internal B2B sales team. Paid on wholesale/distributor revenue.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
            <span><strong>Overrides</strong> — Named individuals on any channel. Separate from both above.</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Each system has its own tab, its own toggle, and its own calculations. None are pre-enabled.
        </p>
      </div>
    ),
    highlight: "commissions",
  },
  {
    icon: TrendingUp,
    title: "Step 6: Forecast Cash Flow",
    body: (
      <div className="space-y-3">
        <p>
          The <strong>Cash Flow tab</strong> (amber) projects 12 months of inflows and outflows.
          Set starting cash, payment terms, inventory lead time, and debt service.
        </p>
        <p className="text-sm text-muted-foreground">
          Cash flow is the ultimate test of viability. A product can be profitable on paper but still run out of cash.
          Watch for the red warning when balance drops below $5,000.
        </p>
      </div>
    ),
    highlight: "cashflow",
  },
  {
    icon: BarChart3,
    title: "Step 7: Read the Dashboard",
    body: (
      <div className="space-y-3">
        <p>
          The <strong>Dashboard</strong> (violet) is your Mission Control. Live KPIs, sanity checks against
          industry benchmarks, and a complete audit trail of every assumption.
        </p>
        <p className="text-sm text-muted-foreground">
          Use the <strong>Dependency Flow Chart</strong> (in the Guide) to visualize how every component connects.
          Use <strong>Goal Seek</strong> to work backward from targets, and <strong>Batch What-If</strong> to compare
          multiple scenarios at once.
        </p>
      </div>
    ),
    highlight: "dashboard",
  },
  {
    icon: Sparkles,
    title: "You're Ready!",
    body: (
      <div className="space-y-3">
        <p>
          That's the complete workflow. Remember: <strong>blank slate by design.</strong>
          Every toggle, every cost, every channel is your conscious choice.
        </p>
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-800 font-medium">Quick Tips:</p>
          <ul className="text-xs text-green-700 mt-1 space-y-1">
            <li>Ctrl+Z undoes up to 50 steps</li>
            <li>URL encodes your full model (shareable links)</li>
            <li>Auto-saves every 30 seconds</li>
            <li>Reopen this tutorial anytime via the Guide button</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export function TutorialWalkthrough() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShow) {
      localStorage.setItem(TUTORIAL_KEY, "true");
    }
    setOpen(false);
  };

  const current = steps[step];
  const CurrentIcon = current.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1.5 rounded-lg ${step === steps.length - 1 ? "bg-green-100" : "bg-primary/10"}`}>
              <CurrentIcon className={`h-5 w-5 ${step === steps.length - 1 ? "text-green-600" : "text-primary"}`} />
            </div>
            <DialogTitle className="text-base">{current.title}</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Step {step + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm space-y-3 min-h-[200px]">
          {current.body}
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 pt-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between flex-row">
          <Label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox checked={dontShow} onCheckedChange={(v) => setDontShow(!!v)} />
            Don't show again
          </Label>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button size="sm" variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleClose}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Get Started
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TutorialButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const handleOpen = () => {
    setStep(0);
    setOpen(true);
  };

  const current = steps[step];
  const CurrentIcon = current.icon;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200"
        onClick={handleOpen}
      >
        <GraduationCap className="h-4 w-4" /> Tutorial
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${step === steps.length - 1 ? "bg-green-100" : "bg-primary/10"}`}>
                <CurrentIcon className={`h-5 w-5 ${step === steps.length - 1 ? "text-green-600" : "text-primary"}`} />
              </div>
              <DialogTitle className="text-base">{current.title}</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Step {step + 1} of {steps.length}
            </DialogDescription>
          </DialogHeader>

          <div className="text-sm space-y-3 min-h-[200px]">
            {current.body}
          </div>

          <div className="flex gap-1 pt-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            {step > 0 && (
              <Button size="sm" variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => setOpen(false)}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
