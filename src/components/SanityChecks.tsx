import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { CalculationResult } from "@/types/calculator";
import { getBenchmarkStatus } from "@/lib/benchmarks";
import { money3, pct } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";

interface SanityCheck {
  id: string;
  severity: "error" | "warning" | "ok";
  title: string;
  message: string;
  detail: string;
}

interface SanityChecksProps {
  result: CalculationResult;
}

function runChecks(result: CalculationResult): SanityCheck[] {
  const checks: SanityCheck[] = [];

  // 1. COGS as % of retail price
  if (result.retail.price > 0) {
    const cogsRatio = result.cogsPerPack / result.retail.price;
    const cogsStatus = getBenchmarkStatus("cogsAsPercentOfRetail", cogsRatio);
    if (cogsStatus === "above") {
      checks.push({
        id: "cogs-high",
        severity: "error",
        title: "COGS Exceeds Industry Norm",
        message: `COGS is ${pct(cogsRatio)} of retail price — industry recommends 20-45%.`,
        detail: `Your COGS (${money3(result.cogsPerPack)}) eats up ${(cogsRatio * 100).toFixed(0)}% of your retail price (${money3(result.retail.price)}). Consider reducing ingredient costs, negotiating better packaging rates, or raising your retail price.`,
      });
    } else if (cogsStatus === "below") {
      checks.push({
        id: "cogs-low",
        severity: "ok",
        title: "COGS Is Favorable",
        message: `COGS is ${pct(cogsRatio)} of retail price — below the 20-45% industry range.`,
        detail: `Excellent cost control. Your COGS (${money3(result.cogsPerPack)}) represents only ${(cogsRatio * 100).toFixed(0)}% of retail price, giving you a healthy margin buffer.`,
      });
    } else {
      checks.push({
        id: "cogs-ok",
        severity: "ok",
        title: "COGS Within Industry Range",
        message: `COGS is ${pct(cogsRatio)} of retail price — within the healthy 20-45% range.`,
        detail: `Your cost structure is well-balanced at ${(cogsRatio * 100).toFixed(0)}% of retail.`,
      });
    }
  }

  // 2. Blended gross margin
  const bgmStatus = getBenchmarkStatus("blendedGrossMargin", result.bgmp);
  if (bgmStatus === "below") {
    checks.push({
      id: "bgm-low",
      severity: "error",
      title: "Blended Margin Below Industry",
      message: `Blended gross margin is ${pct(result.bgmp)} — industry range is 45-75%.`,
      detail: `At ${(result.bgmp * 100).toFixed(0)}% blended margin, you may struggle to cover overhead and achieve profitability. Consider raising prices, reducing discounts, or cutting COGS.`,
    });
  } else if (bgmStatus === "above") {
    checks.push({
      id: "bgm-high",
      severity: "ok",
      title: "Blended Margin Above Industry",
      message: `Blended gross margin is ${pct(result.bgmp)} — above the 45-75% industry range.`,
      detail: `Strong pricing power. At ${(result.bgmp * 100).toFixed(0)}% blended margin, you have excellent profit potential. Verify this is sustainable against competitive pressure.`,
    });
  } else {
    checks.push({
      id: "bgm-ok",
      severity: "ok",
      title: "Blended Margin Healthy",
      message: `Blended gross margin is ${pct(result.bgmp)} — within the 45-75% industry range.`,
      detail: `Your blended margin of ${(result.bgmp * 100).toFixed(0)}% is healthy for the supplement industry.`,
    });
  }

  // 3. Break-even feasibility
  if (isFinite(result.beUnitsB) && result.beUnitsB > 0) {
    const beStatus = getBenchmarkStatus("breakEvenPacksMonthly", result.beUnitsB);
    if (beStatus === "above") {
      checks.push({
        id: "be-high",
        severity: "warning",
        title: "High Break-Even Volume",
        message: `Break-even is ${Math.ceil(result.beUnitsB).toLocaleString()} packs/month — above typical range (200-2,000).`,
        detail: `You need to sell ${Math.ceil(result.beUnitsB).toLocaleString()} packs monthly to break even. Consider whether your sales channels can realistically support this volume, or reduce overhead/fixed costs.`,
      });
    } else {
      checks.push({
        id: "be-ok",
        severity: "ok",
        title: "Break-Within Reach",
        message: `Break-even is ${Math.ceil(result.beUnitsB).toLocaleString()} packs/month — within normal range.`,
        detail: `At ${Math.ceil(result.beUnitsB).toLocaleString()} packs/month, your break-even target is achievable for a small-medium supplement brand.`,
      });
    }
  } else {
    checks.push({
      id: "be-infinite",
      severity: "error",
      title: "Break-Even Is Unreachable",
      message: "Your model cannot reach break-even with current inputs.",
      detail: "Your costs exceed your revenue at all volumes. Check that you have channels enabled, prices are set above zero, and your cost structure is realistic. This is a critical issue.",
    });
  }

  // 4. Subscription churn rates
  result.subscriptionPlans.forEach((plan) => {
    if (!plan.included || plan.monthlyChurnRate <= 0) return;
    const churnStatus = getBenchmarkStatus("monthlyChurnRate", plan.monthlyChurnRate);
    if (churnStatus === "above") {
      checks.push({
        id: `churn-high-${plan.id}`,
        severity: "warning",
        title: `High Churn: ${plan.name}`,
        message: `Monthly churn is ${(plan.monthlyChurnRate * 100).toFixed(1)}% — industry range is 3-12%.`,
        detail: `At ${(plan.monthlyChurnRate * 100).toFixed(1)}% monthly churn, you're losing ${Math.round(plan.monthlyChurnRate * 100)}% of subscribers each month. Typical supplement subscription churn is 3-12%. Investigate product-market fit, onboarding, or customer satisfaction.`,
      });
    } else {
      checks.push({
        id: `churn-ok-${plan.id}`,
        severity: "ok",
        title: `Churn Healthy: ${plan.name}`,
        message: `Monthly churn is ${(plan.monthlyChurnRate * 100).toFixed(1)}% — within 3-12% industry range.`,
        detail: `Your ${(plan.monthlyChurnRate * 100).toFixed(1)}% monthly churn rate is healthy for supplement subscriptions.`,
      });
    }
  });

  // 5. Cash flow negative balance
  if (result.cashFlow?.months) {
    const negativeMonths = result.cashFlow.months.filter((m) => m.endingBalance < 0);
    if (negativeMonths.length > 0) {
      const worstMonth = negativeMonths.reduce((a, b) => (a.endingBalance < b.endingBalance ? a : b));
      checks.push({
        id: "cash-negative",
        severity: "error",
        title: "Cash Flow Goes Negative",
        message: `${negativeMonths.length} month(s) have negative ending balance. Worst: ${money3(worstMonth.endingBalance)} in Month ${worstMonth.month}.`,
        detail: `Your cash balance drops below zero in ${negativeMonths.length} month(s). This means you cannot cover all payments. Consider increasing starting cash, accelerating customer payments, delaying supplier payments, or reducing capex/debt service.`,
      });
    } else if (result.cashFlow.lowestBalance < 5000) {
      checks.push({
        id: "cash-low",
        severity: "warning",
        title: "Cash Buffer Is Thin",
        message: `Lowest balance is ${money3(result.cashFlow.lowestBalance)} — below $5,000 safety threshold.`,
        detail: `While you don't go negative, your lowest balance (${money3(result.cashFlow.lowestBalance)}) is below the recommended $5,000 safety buffer. An unexpected expense could cause a cash crunch.`,
      });
    } else {
      checks.push({
        id: "cash-ok",
        severity: "ok",
        title: "Cash Flow Healthy",
        message: `All months positive. Lowest balance: ${money3(result.cashFlow.lowestBalance)}.`,
        detail: `Your cash flow stays positive throughout the projection. Lowest balance of ${money3(result.cashFlow.lowestBalance)} provides a comfortable buffer.`,
      });
    }
  }

  // 6. Campaign net effect
  if (result.campaigns && result.campaigns.length > 0) {
    const netEffect = result.campaignImpact?.netAnnualEffect ?? 0;
    if (netEffect < 0) {
      checks.push({
        id: "campaign-negative",
        severity: "warning",
        title: "Campaigns Have Negative Net Effect",
        message: `Combined campaigns reduce annual profit by ${money3(Math.abs(netEffect))}.`,
        detail: `Your promotions cost more in margin compression than they generate in volume uplift. Consider reducing discount depth, shortening duration, or targeting channels with higher volume response.`,
      });
    } else if (netEffect > 0) {
      checks.push({
        id: "campaign-positive",
        severity: "ok",
        title: "Campaigns Are Net Positive",
        message: `Combined campaigns add ${money3(netEffect)} to annual profit.`,
        detail: `Your promotions are profitable — volume uplift outweighs discount costs. This is a strong promotional strategy.`,
      });
    }
  }

  // 7. Affiliate commission check
  if (result.affiliate.enabled) {
    const af = result.affiliate;
    if (af.commissionAsPercentOfRevenue > 50) {
      checks.push({
        id: "affiliate-commission-high",
        severity: "error",
        title: "Affiliate Commission Exceeds 50%",
        message: `Commission is ${af.commissionAsPercentOfRevenue.toFixed(1)}% of affiliate revenue — unsustainable.`,
        detail: `Your affiliate commission eats up ${af.commissionAsPercentOfRevenue.toFixed(0)}% of affiliate-driven revenue. With COGS and overhead also deducted, you may be losing money on every affiliate sale. Consider reducing the commission rate or switching to a flat per-order structure.`,
      });
    } else if (af.commissionAsPercentOfRevenue > 30) {
      checks.push({
        id: "affiliate-commission-warning",
        severity: "warning",
        title: "Affiliate Commission Is High",
        message: `Commission is ${af.commissionAsPercentOfRevenue.toFixed(1)}% of affiliate revenue — above 30%.`,
        detail: `At ${af.commissionAsPercentOfRevenue.toFixed(0)}% of revenue, your affiliate program leaves a thin margin after COGS and overhead. The supplement industry typically sees 15-25% affiliate commissions.`,
      });
    } else if (af.commissionAsPercentOfRevenue > 0) {
      checks.push({
        id: "affiliate-commission-ok",
        severity: "ok",
        title: "Affiliate Commission Healthy",
        message: `Commission is ${af.commissionAsPercentOfRevenue.toFixed(1)}% of affiliate revenue.`,
        detail: `Your ${af.commissionAsPercentOfRevenue.toFixed(0)}% commission rate is within a healthy range for supplement affiliate programs (15-25% typical).`,
      });
    }
  }

  // 8. Channel profitability
  const channels = [
    { name: "Retail", ch: result.retail, included: result.includeR },
    { name: "Wholesale", ch: result.wholesale, included: result.includeW },
    { name: "Distributor", ch: result.distributor, included: result.includeD },
  ];
  channels.forEach(({ name, ch, included }) => {
    if (!included) return;
    if (ch.gp < 0) {
      checks.push({
        id: `gp-negative-${name}`,
        severity: "error",
        title: `${name} Channel Is Unprofitable`,
        message: `${name} loses ${money3(Math.abs(ch.gp))} per pack on gross profit.`,
        detail: `Your ${name.toLowerCase()} channel has negative gross profit. Every sale in this channel loses money before overhead. Either raise the ${name.toLowerCase()} price, reduce the discount, or consider disabling this channel.`,
      });
    }
  });

  // 8. Overhead ratio
  if (result.ohTotal > 0) {
    const totalRev = result.retail.price * result.totalMonthlyVolume;
    if (totalRev > 0) {
      const ohRatio = result.ohTotal / totalRev;
      const ohStatus = getBenchmarkStatus("overheadAsPercentOfRevenue", ohRatio);
      if (ohStatus === "above") {
        checks.push({
          id: "overhead-high",
          severity: "warning",
          title: "Overhead Is High Relative to Revenue",
          message: `Overhead is ${pct(ohRatio)} of revenue — industry range is 10-25%.`,
          detail: `Monthly overhead of ${money3(result.ohTotal)} represents ${(ohRatio * 100).toFixed(0)}% of revenue. Consider reducing fixed costs or increasing volume to spread overhead across more units.`,
        });
      }
    }
  }

  // Sort by severity: errors first, then warnings, then ok
  const severityOrder = { error: 0, warning: 1, ok: 2 };
  checks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return checks;
}

export function SanityChecks({ result }: SanityChecksProps) {
  const checks = useMemo(() => runChecks(result), [result]);

  const errorCount = checks.filter((c) => c.severity === "error").length;
  const warningCount = checks.filter((c) => c.severity === "warning").length;
  const okCount = checks.filter((c) => c.severity === "ok").length;

  if (checks.length === 0) return null;

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "error": return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "ok": return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />;
      default: return null;
    }
  };

  const severityBorder = (severity: string) => {
    switch (severity) {
      case "error": return "border-l-4 border-l-red-500";
      case "warning": return "border-l-4 border-l-amber-500";
      case "ok": return "border-l-4 border-l-green-500";
      default: return "";
    }
  };

  return (
    <Card className="border-l-4 border-l-rose-400 bg-gradient-to-br from-rose-100 via-rose-50 to-white dark:from-rose-900/30 dark:via-rose-950/20 dark:to-transparent shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-rose-500" />
          Sanity Checks
          <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Validation</span>
          <InfoTooltip
            text="Automated validation of your model against industry benchmarks and business logic. Errors (red) require attention. Warnings (amber) suggest review. Green checks confirm healthy metrics. These checks analyze COGS ratios, margins, break-even feasibility, subscription churn, cash flow, campaign effects, channel profitability, and overhead ratios."
            label="Sanity Checks"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary bar */}
        <div className="flex items-center gap-3 text-xs">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <AlertCircle className="h-3.5 w-3.5" /> {errorCount} error{errorCount > 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" /> {warningCount} warning{warningCount > 1 ? "s" : ""}
            </span>
          )}
          {okCount > 0 && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> {okCount} passed
            </span>
          )}
        </div>

        {/* Check list */}
        <div className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`rounded-md bg-card p-3 ${severityBorder(check.severity)}`}
            >
              <div className="flex items-start gap-2">
                {severityIcon(check.severity)}
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${
                    check.severity === "error" ? "text-red-700" :
                    check.severity === "warning" ? "text-amber-700" :
                    "text-green-700"
                  }`}>
                    {check.title}
                  </p>
                  <p className="text-xs text-foreground mt-0.5">{check.message}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{check.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
