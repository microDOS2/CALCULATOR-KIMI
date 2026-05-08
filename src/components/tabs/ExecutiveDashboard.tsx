import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, DollarSign, Truck, Target, BarChart3, AlertTriangle, Sparkles, Users } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { SanityChecks } from "@/components/SanityChecks";
import { AssumptionsAuditTrail } from "@/components/AssumptionsAuditTrail";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money, money3, pct } from "@/lib/calculator";
import { formatBenchmarkRange } from "@/lib/benchmarks";

interface ExecutiveDashboardProps {
  state: CalculatorState;
  result: CalculationResult;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  benchmark,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
  benchmark?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        {benchmark && (
          <div className="mt-1 text-xs text-muted-foreground italic">
            Industry: {benchmark}
          </div>
        )}
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span className={`text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
              {trend === "up" ? "Positive" : trend === "down" ? "Attention needed" : "Stable"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChannelProfitability({ state, result }: { state: CalculatorState; result: CalculationResult }) {
  // Per-channel marketing expenses
  const marketingR = state.marketingEnabled
    ? state.marketingExpenses.filter((e) => e.channels.retail).reduce((s, e) => s + e.amount, 0)
    : 0;
  const marketingW = state.marketingEnabled
    ? state.marketingExpenses.filter((e) => e.channels.wholesale).reduce((s, e) => s + e.amount, 0)
    : 0;
  const marketingD = state.marketingEnabled
    ? state.marketingExpenses.filter((e) => e.channels.distributor).reduce((s, e) => s + e.amount, 0)
    : 0;

  // Per-pack shipping employee bonus (if enabled)
  const shipBonusPerPack = state.shippingEmployeesEnabled
    ? state.shippingEmployees.reduce((s, e) => s + (e.perItemBonusEnabled ? e.perItemBonus : 0), 0)
    : 0;

  // Monthly volumes
  const packsR = result.totalPacksR;
  const packsW = result.totalPacksW;
  const packsD = result.totalPacksD;

  // Overhead per pack
  const ohR = result.ohPerPackR;
  const ohW = result.ohPerPackW;
  const ohD = result.ohPerPackD;

  // Commission results per channel
  const commResults = result.commissionResults;
  const hasCommissionPayout = commResults.totalComm > 0;

  // Total cost per channel
  const totalCostR = ohR * packsR + marketingR + shipBonusPerPack * packsR;
  const totalCostW = ohW * packsW + marketingW + shipBonusPerPack * packsW;
  const totalCostD = ohD * packsD + marketingD + shipBonusPerPack * packsD;

  // Operating profit per channel
  const opR = result.retail.gp * packsR - totalCostR;
  const opW = result.wholesale.gp * packsW - totalCostW;
  const opD = result.distributor.gp * packsD - totalCostD;

  // Per-pack operating profit
  const opPerPackR = packsR > 0 ? opR / packsR : 0;
  const opPerPackW = packsW > 0 ? opW / packsW : 0;
  const opPerPackD = packsD > 0 ? opD / packsD : 0;

  const channels = [
    {
      label: "Retail",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      gp: result.retail.gp,
      gm: result.retail.gm,
      ohPerPack: ohR,
      marketing: marketingR,
      shipBonus: shipBonusPerPack * packsR,
      totalCost: totalCostR,
      op: opPerPackR,
    },
    {
      label: "Wholesale",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      gp: result.wholesale.gp,
      gm: result.wholesale.gm,
      ohPerPack: ohW,
      marketing: marketingW,
      shipBonus: shipBonusPerPack * packsW,
      totalCost: totalCostW,
      op: opPerPackW,
    },
    {
      label: "Distributor",
      color: "text-teal-700",
      bgColor: "bg-teal-50",
      gp: result.distributor.gp,
      gm: result.distributor.gm,
      ohPerPack: ohD,
      marketing: marketingD,
      shipBonus: shipBonusPerPack * packsD,
      totalCost: totalCostD,
      op: opPerPackD,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          Channel Profitability (Operating Profit)
          <InfoTooltip text="Shows gross profit, overhead allocation, marketing spend, shipping employee bonuses, and final operating profit per pack for each channel. This is the true profit after all variable and allocated fixed costs." label="Channel Operating Profit" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {channels.map((ch) => (
            <div key={ch.label} className={`rounded-lg border p-3 ${ch.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">{ch.label}</p>
                <div className="text-right">
                  <p className={`text-lg font-bold ${ch.op > 0 ? "text-green-600" : "text-red-600"}`}>
                    {money3(ch.op)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">op. profit / pack</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">GP / pack</p>
                  <p className="text-sm font-medium text-green-600">+{money3(ch.gp)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Margin</p>
                  <p className="text-sm font-medium">{pct(ch.gm)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">OH / pack</p>
                  <p className="text-sm font-medium text-amber-600">-{money3(ch.ohPerPack)}</p>
                </div>
                {ch.marketing > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground">Marketing/mo</p>
                    <p className="text-sm font-medium text-pink-600">-{money(ch.marketing)}</p>
                  </div>
                )}
                {ch.shipBonus > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground">Ship Bonus/mo</p>
                    <p className="text-sm font-medium text-cyan-600">-{money(ch.shipBonus)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Commission note */}
          {hasCommissionPayout && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-xs text-orange-700 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Commission Payout: {money(commResults.totalComm)}/mo ({pct(commResults.commPctGross)} of revenue)
              </p>
              <p className="text-[10px] text-orange-600 mt-1">
                Includes base salaries ({money(commResults.totalBaseSalary)}/mo) + variable commissions. Paid on B2B channels only.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExecutiveDashboard({ state, result }: ExecutiveDashboardProps) {
  const topCost = result.costBreakdown.reduce((a, b) => (a.value > b.value ? a : b), result.costBreakdown[0]);
  const hasCampaigns = result.campaigns && result.campaigns.length > 0;
  const campaignEffect = result.campaignImpact?.netAnnualEffect ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">Executive Dashboard</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        One-screen summary of your most critical business metrics. For investor meetings, bank applications, or partner discussions.
        <InfoTooltip text="All KPIs update in real-time as you adjust inputs across any tab. Use this view to quickly assess the health of your business model without navigating through individual tabs." label="Dashboard" />
      </p>

      {/* Sanity Checks — at top as a validation gate */}
      <SanityChecks result={result} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Blended Gross Margin"
          value={pct(result.bgmp)}
          subtitle="Across all active channels"
          icon={Target}
          color="bg-blue-500"
          trend={result.bgmp > 0.3 ? "up" : result.bgmp > 0.15 ? "neutral" : "down"}
          benchmark={formatBenchmarkRange("blendedGrossMargin")}
        />
        <KPICard
          title="Break-Even Revenue"
          value={money3(result.brev)}
          subtitle="Monthly revenue to cover costs"
          icon={DollarSign}
          color="bg-emerald-500"
          trend="neutral"
        />
        <KPICard
          title="Monthly Volume"
          value={result.totalMonthlyVolume.toLocaleString()}
          subtitle="Total packs across all channels"
          icon={Package}
          color="bg-violet-500"
          trend={result.totalMonthlyVolume > 1000 ? "up" : "neutral"}
        />
        <KPICard
          title="COGS / Pack"
          value={money3(result.cogsPerPack)}
          subtitle="Cost to produce one unit"
          icon={Package}
          color="bg-orange-500"
          trend={result.cogsPerPack < result.retail.price * 0.5 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Retail GP"
          value={money3(result.retail.gp)}
          subtitle="Gross profit per pack"
          icon={DollarSign}
          color="bg-cyan-500"
          trend={result.retail.gp > 0 ? "up" : "down"}
        />
        <KPICard
          title="Wholesale GP"
          value={money3(result.wholesale.gp)}
          subtitle="Gross profit per pack"
          icon={DollarSign}
          color="bg-indigo-500"
          trend={result.wholesale.gp > 0 ? "up" : "down"}
        />
        <KPICard
          title="Distributor GP"
          value={money3(result.distributor.gp)}
          subtitle="Gross profit per pack"
          icon={DollarSign}
          color="bg-pink-500"
          trend={result.distributor.gp > 0 ? "up" : "down"}
        />
        <KPICard
          title="Shipping / Pack"
          value={money3(result.shipPerPack)}
          subtitle="Per-unit logistics cost"
          icon={Truck}
          color="bg-amber-500"
          trend={result.shipPerPack < 5 ? "up" : "down"}
          benchmark={formatBenchmarkRange("shippingCostPerPack")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Top Cost Driver</p>
                <p className="text-lg font-bold">{topCost?.name || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{topCost ? money3(topCost.value) + " per pack" : ""}</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {result.retailSalesTaxRate > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Retail Tax Impact</p>
                  <p className="text-lg font-bold">{result.retailSalesTaxRate}%</p>
                  <p className="text-xs text-muted-foreground">Customer pays {money3(result.retailPriceWithTax)}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-500">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasCampaigns && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Campaign Effect</p>
                  <p className={`text-lg font-bold ${campaignEffect >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {campaignEffect >= 0 ? "+" : ""}{money3(campaignEffect)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {campaignEffect >= 0 ? "Net positive from promotions" : "Net negative from promotions"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Override Cost KPI */}
        {(result.overrides?.totalOverrideCost ?? 0) > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Override Cost</p>
                  <p className="text-lg font-bold text-amber-600">
                    {money3(result.overrides?.totalOverrideCost ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {state.overrides.filter((o) => o.enabled).length} active override{state.overrides.filter((o) => o.enabled).length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affiliate Commission KPI */}
        {result.affiliate.enabled && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Affiliate Commission</p>
                  <p className="text-lg font-bold text-red-600">
                    {money3(result.affiliate.initialCommission)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.affiliate.commissionAsPercentOfRevenue.toFixed(1)}% of affiliate revenue
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ChannelProfitability state={state} result={result} />

      {/* D2: Assumptions Audit Trail */}
      <AssumptionsAuditTrail state={state} result={result} />
    </div>
  );
}
