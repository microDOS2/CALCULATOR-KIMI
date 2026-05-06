import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Check, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money3, pct } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";
import { FormulaTooltip } from "@/components/FormulaTooltip";

interface SimulateTabProps {
  baseState: CalculatorState;
  baseResult: CalculationResult;
  shadowState: CalculatorState;
  shadowResult: CalculationResult | null;
  onUpdateSku: (id: string, patch: Partial<CalculatorState["skus"][0]>) => void;
  onUpdatePlan: (id: string, patch: Partial<CalculatorState["subscriptionPlans"][0]>) => void;
  onUpdateGlobal: (patch: Partial<CalculatorState>) => void;
  onReset: () => void;
  onApply: () => void;
}

export function SimulateTab({
  baseResult,
  shadowState,
  shadowResult,
  onUpdateSku,
  onUpdatePlan,
  onUpdateGlobal,
  onReset,
  onApply,
}: SimulateTabProps) {
  const activeSku = shadowState.skus[0];

  const b = baseResult;
  const s = shadowResult;

  const DeltaCard = ({
    label,
    base,
    shadow,
    unit,
    formula,
  }: {
    label: string;
    base: number;
    shadow: number;
    unit: string;
    formula: string;
  }) => {
    const diff = shadow - base;
    const pctChange = base !== 0 ? ((diff / Math.abs(base)) * 100).toFixed(1) : "0.0";
    const isUp = diff > 0.001;
    const isDown = diff < -0.001;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    const color = isUp ? "text-green-600" : isDown ? "text-red-500" : "text-muted-foreground";

    return (
      <FormulaTooltip label={label} formula={formula}>
        <Card className="cursor-help">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-bold tabular-nums">{unit === "$" ? money3(shadow) : unit === "%" ? pct(shadow / 100) : Math.ceil(shadow).toLocaleString()}</div>
            <div className={`text-xs flex items-center gap-0.5 ${color}`}>
              <Icon className="h-3 w-3" />
              {unit === "$" ? money3(Math.abs(diff)) : Math.abs(diff).toFixed(1)}
              {unit} ({pctChange}%)
            </div>
          </CardContent>
        </Card>
      </FormulaTooltip>
    );
  };

  const SliderRow = ({
    label,
    tooltip,
    value,
    min,
    max,
    step,
    unit,
    onChange,
    format = (v: number) => String(v),
  }: {
    label: string;
    tooltip: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (v: number) => void;
    format?: (v: number) => string;
  }) => (
    <div className="space-y-1.5 py-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">
          {label}
          <InfoTooltip text={tooltip} label={label} />
        </span>
        <Badge variant="outline" className="text-xs h-5 px-1.5 tabular-nums">
          {format(value)} {unit}
        </Badge>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );

  if (!s) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm">Loading simulation data...</p>
          <p className="text-xs mt-1">Click the Simulate button in the header or wait a moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Strategy Simulator</h2>
          <InfoTooltip text="Explore 'what-if' scenarios by adjusting key business levers. All sliders start from your current model values. Results update instantly. Click Apply to commit changes back to your model." label="Strategy Simulator" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={onApply}>
            <Check className="h-4 w-4 mr-1" /> Apply to Model
          </Button>
        </div>
      </div>

      {/* Big Results Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <DeltaCard label="Revenue / Pack" base={b.brev} shadow={s.brev} unit="$" formula={`Base: ${money3(b.brev)} → Shadow: ${money3(s.brev)}`} />
        <DeltaCard label="Gross Profit / Pack" base={b.bgpp} shadow={s.bgpp} unit="$" formula={`Base: ${money3(b.bgpp)} → Shadow: ${money3(s.bgpp)}`} />
        <DeltaCard label="Gross Margin" base={b.bgmp * 100} shadow={s.bgmp * 100} unit="%" formula={`Base: ${pct(b.bgmp)} → Shadow: ${pct(s.bgmp)}`} />
        <DeltaCard label="Operating Profit / Pack" base={b.bopp} shadow={s.bopp} unit="$" formula={`Base: ${money3(b.bopp)} → Shadow: ${money3(s.bopp)}`} />
        <DeltaCard label="Break-Even Packs" base={b.beUnitsB} shadow={s.beUnitsB} unit="" formula={`Base: ${isFinite(b.beUnitsB) ? Math.ceil(b.beUnitsB).toLocaleString() : "N/A"} → Shadow: ${isFinite(s.beUnitsB) ? Math.ceil(s.beUnitsB).toLocaleString() : "N/A"}`} />
        <DeltaCard label="Operating Margin" base={b.bomp * 100} shadow={s.bomp * 100} unit="%" formula={`Base: ${pct(b.bomp)} → Shadow: ${pct(s.bomp)}`} />
        <DeltaCard label="Retail Margin" base={b.retail.om * 100} shadow={s.retail.om * 100} unit="%" formula={`Base: ${pct(b.retail.om)} → Shadow: ${pct(s.retail.om)}`} />
        <DeltaCard label="Wholesale Margin" base={b.wholesale.om * 100} shadow={s.wholesale.om * 100} unit="%" formula={`Base: ${pct(b.wholesale.om)} → Shadow: ${pct(s.wholesale.om)}`} />
        <DeltaCard label="Distributor Margin" base={b.distributor.om * 100} shadow={s.distributor.om * 100} unit="%" formula={`Base: ${pct(b.distributor.om)} → Shadow: ${pct(s.distributor.om)}`} />
        <DeltaCard label="MRR" base={b.subscriptionSummary.totalMRR} shadow={s.subscriptionSummary.totalMRR} unit="$" formula={`Base: ${money3(b.subscriptionSummary.totalMRR)} → Shadow: ${money3(s.subscriptionSummary.totalMRR)}`} />
        <DeltaCard label="ARR" base={b.subscriptionSummary.totalARR} shadow={s.subscriptionSummary.totalARR} unit="$" formula={`Base: ${money3(b.subscriptionSummary.totalARR)} → Shadow: ${money3(s.subscriptionSummary.totalARR)}`} />
        <DeltaCard label="12-Mo Profit" base={b.subscriptionSummary.combinedAnnualProfit} shadow={s.subscriptionSummary.combinedAnnualProfit} unit="$" formula={`Base: ${money3(b.subscriptionSummary.combinedAnnualProfit)} → Shadow: ${money3(s.subscriptionSummary.combinedAnnualProfit)}`} />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pricing Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pricing Levers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {activeSku && (
              <>
                <SliderRow
                  label="Retail Price"
                  tooltip="Consumer-facing price per pack. Ripples through wholesale and distributor pricing via your discount tiers."
                  value={activeSku.retailPrice}
                  min={1}
                  max={activeSku.retailPrice * 3}
                  step={0.5}
                  unit="$"
                  onChange={(v) => onUpdateSku(activeSku.id, { retailPrice: v })}
                  format={(v) => `$${v.toFixed(2)}`}
                />
                <SliderRow
                  label="Units / Pack"
                  tooltip="Units per pack affects packaging cost per unit and total pack economics."
                  value={activeSku.unitsPerPack}
                  min={1}
                  max={activeSku.unitsPerPack * 4}
                  step={1}
                  unit="units"
                  onChange={(v) => onUpdateSku(activeSku.id, { unitsPerPack: Math.max(1, Math.round(v)) })}
                />
              </>
            )}
            <SliderRow
              label="Wholesale Discount"
              tooltip="Discount off retail for retailers. Higher = lower margin but potential volume."
              value={shadowState.wDisc}
              min={0}
              max={80}
              step={1}
              unit="%"
              onChange={(v) => onUpdateGlobal({ wDisc: v })}
              format={(v) => `${v.toFixed(0)}%`}
            />
            <SliderRow
              label="Distributor Discount"
              tooltip="Additional discount off wholesale for distributors. Deepest tier in cascade."
              value={shadowState.dDisc}
              min={0}
              max={50}
              step={1}
              unit="%"
              onChange={(v) => onUpdateGlobal({ dDisc: v })}
              format={(v) => `${v.toFixed(0)}%`}
            />
          </CardContent>
        </Card>

        {/* Volume Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Volume Levers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {shadowState.monthlyVolumes.map((mv) => {
              const sku = shadowState.skus.find((s) => s.id === mv.skuId);
              return (
                <SliderRow
                  key={mv.skuId}
                  label={`${sku?.name ?? "SKU"} Monthly Volume`}
                  tooltip="Forecast monthly sales. Higher volume spreads fixed overhead across more units."
                  value={mv.qty}
                  min={0}
                  max={mv.qty * 5}
                  step={100}
                  unit="packs"
                  onChange={(v) => {
                    onUpdateGlobal({
                      monthlyVolumes: shadowState.monthlyVolumes.map((m) =>
                        m.skuId === mv.skuId ? { ...m, qty: Math.max(0, Math.round(v)) } : m
                      ),
                    });
                  }}
                />
              );
            })}
            <SliderRow
              label="Shipping / Pack"
              tooltip="Cost to ship one pack to a retail customer. Directly reduces retail operating profit."
              value={shadowState.shippingPerPack}
              min={0}
              max={shadowState.shippingPerPack * 4}
              step={0.5}
              unit="$"
              onChange={(v) => onUpdateGlobal({ shippingPerPack: v })}
              format={(v) => `$${v.toFixed(2)}`}
            />
          </CardContent>
        </Card>

        {/* Subscription Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Subscription Levers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {shadowState.subscriptionPlans.map((plan) => (
              <div key={plan.id} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground pt-1">{plan.name}</div>
                <SliderRow
                  label="Monthly Price"
                  tooltip="Subscriber monthly payment. Higher = more MRR but may hurt conversion."
                  value={plan.monthlyPrice}
                  min={5}
                  max={plan.monthlyPrice * 3}
                  step={1}
                  unit="$"
                  onChange={(v) => onUpdatePlan(plan.id, { monthlyPrice: v })}
                  format={(v) => `$${v.toFixed(2)}`}
                />
                <SliderRow
                  label="Starting Subscribers"
                  tooltip="Initial subscriber count. The foundation all growth and churn is applied to."
                  value={plan.startingSubscribers}
                  min={0}
                  max={plan.startingSubscribers * 5}
                  step={10}
                  unit="subs"
                  onChange={(v) => onUpdatePlan(plan.id, { startingSubscribers: Math.max(0, Math.round(v)) })}
                />
                <SliderRow
                  label="Growth Rate"
                  tooltip="New subscribers per month as % of existing base. Compounds. Set to 0 for flat."
                  value={plan.monthlyGrowthRate}
                  min={0}
                  max={50}
                  step={0.5}
                  unit="%/mo"
                  onChange={(v) => onUpdatePlan(plan.id, { monthlyGrowthRate: v })}
                  format={(v) => `${v.toFixed(1)}%`}
                />
                <SliderRow
                  label="Churn Rate"
                  tooltip="Subscribers cancelling per month as % of existing base. Lower is better."
                  value={plan.monthlyChurnRate}
                  min={0}
                  max={30}
                  step={0.5}
                  unit="%/mo"
                  onChange={(v) => onUpdatePlan(plan.id, { monthlyChurnRate: v })}
                  format={(v) => `${v.toFixed(1)}%`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
