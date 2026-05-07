import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, RotateCcw, Check } from "lucide-react";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money3 } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";

interface SensitivityPanelProps {
  baseState: CalculatorState;
  baseResult: CalculationResult;
  shadowState: CalculatorState;
  shadowResult: CalculationResult | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSku: (id: string, patch: Partial<CalculatorState["skus"][0]>) => void;
  onUpdatePlan: (id: string, patch: Partial<CalculatorState["subscriptionPlans"][0]>) => void;
  onUpdateGlobal: (patch: Partial<CalculatorState>) => void;
  onReset: () => void;
  onApply: () => void;
}

export function SensitivityPanel({
  baseResult,
  shadowState,
  shadowResult,
  isOpen,
  onOpenChange,
  onUpdateSku,
  onUpdatePlan,
  onUpdateGlobal,
  onReset,
  onApply,
}: SensitivityPanelProps) {
  const firstSku = shadowState.skus[0];
  const firstPlan = shadowState.subscriptionPlans[0];

  const b = baseResult;
  const s = shadowResult;

  const deltaClass = (base: number, shadow: number) => {
    const diff = shadow - base;
    if (Math.abs(diff) < 0.001) return "text-muted-foreground";
    return diff > 0 ? "text-green-600" : "text-red-500";
  };

  const deltaArrow = (base: number, shadow: number) => {
    const diff = shadow - base;
    if (Math.abs(diff) < 0.001) return "→";
    return diff > 0 ? "↑" : "↓";
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
        <span className="tabular-nums text-muted-foreground">{format(value)} {unit}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px] p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Strategy Simulator
            <InfoTooltip text="Drag sliders to explore 'what-if' scenarios. Changes here don't affect your saved model until you click Apply. Use Reset to snap back to current values." label="Strategy Simulator" />
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Quick deltas */}
          {s && (
            <div className="grid grid-cols-2 gap-2">
              <Card className="bg-muted/30">
                <CardContent className="p-2.5">
                  <div className="text-[10px] text-muted-foreground">Blended OP / Pack</div>
                  <div className="text-sm font-bold tabular-nums">
                    {money3(b.bopp)} {deltaArrow(b.bopp, s.bopp)}{" "}
                    <span className={deltaClass(b.bopp, s.bopp)}>{money3(s.bopp)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-2.5">
                  <div className="text-[10px] text-muted-foreground">Break-Even</div>
                  <div className="text-sm font-bold tabular-nums">
                    {isFinite(b.beUnitsB) ? Math.ceil(b.beUnitsB).toLocaleString() : "N/A"} {deltaArrow(b.beUnitsB, s.beUnitsB)}{" "}
                    <span className={deltaClass(b.beUnitsB, s.beUnitsB)}>
                      {isFinite(s.beUnitsB) ? Math.ceil(s.beUnitsB).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-2.5">
                  <div className="text-[10px] text-muted-foreground">MRR</div>
                  <div className="text-sm font-bold tabular-nums">
                    {money3(b.subscriptionSummary.totalMRR)} {deltaArrow(b.subscriptionSummary.totalMRR, s.subscriptionSummary.totalMRR)}{" "}
                    <span className={deltaClass(b.subscriptionSummary.totalMRR, s.subscriptionSummary.totalMRR)}>
                      {money3(s.subscriptionSummary.totalMRR)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-2.5">
                  <div className="text-[10px] text-muted-foreground">12-Mo Profit</div>
                  <div className="text-sm font-bold tabular-nums">
                    {money3(b.subscriptionSummary.combinedAnnualProfit)} {deltaArrow(b.subscriptionSummary.combinedAnnualProfit, s.subscriptionSummary.combinedAnnualProfit)}{" "}
                    <span className={deltaClass(b.subscriptionSummary.combinedAnnualProfit, s.subscriptionSummary.combinedAnnualProfit)}>
                      {money3(s.subscriptionSummary.combinedAnnualProfit)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sliders */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing</h4>
            {firstSku && (
              <SliderRow
                label="Retail Price"
                tooltip="The consumer-facing price for one pack. Adjusting this ripples through wholesale and distributor pricing via your discount tiers."
                value={firstSku.retailPrice}
                min={1}
                max={firstSku.retailPrice * 3}
                step={0.5}
                unit="$"
                onChange={(v) => onUpdateSku(firstSku.id, { retailPrice: v })}
                format={(v) => `$${v.toFixed(2)}`}
              />
            )}
            <SliderRow
              label="Wholesale Discount"
              tooltip="The percentage discount off retail price that retailers pay. Higher discount = lower wholesale price = lower margin but potentially higher volume."
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
              tooltip="The additional percentage discount off wholesale price that distributors pay. This is the deepest discount tier in your channel cascade."
              value={shadowState.dDisc}
              min={0}
              max={50}
              step={1}
              unit="%"
              onChange={(v) => onUpdateGlobal({ dDisc: v })}
              format={(v) => `${v.toFixed(0)}%`}
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volume</h4>
            {firstSku && (
              <SliderRow
                label="Units / Pack"
                tooltip="How many units (e.g., pills, items) go into each retail pack. More units = lower packaging cost per unit but higher pack price."
                value={firstSku.unitsPerPack}
                min={1}
                max={firstSku.unitsPerPack * 4}
                step={1}
                unit="units"
                onChange={(v) => onUpdateSku(firstSku.id, { unitsPerPack: Math.max(1, Math.round(v)) })}
              />
            )}
            {shadowState.monthlyVolumes[0] && (
              <SliderRow
                label="Monthly Volume"
                tooltip="Forecast monthly sales volume. Higher volume spreads fixed overhead across more units, lowering per-pack overhead cost."
                value={shadowState.monthlyVolumes[0].qty}
                min={0}
                max={shadowState.monthlyVolumes[0].qty * 5}
                step={100}
                unit="packs"
                onChange={(v) => {
                  const skuId = shadowState.monthlyVolumes[0].skuId;
                  onUpdateGlobal({
                    monthlyVolumes: shadowState.monthlyVolumes.map((m) =>
                      m.skuId === skuId ? { ...m, qty: Math.max(0, Math.round(v)) } : m
                    ),
                  });
                }}
              />
            )}
          </div>

          {firstPlan && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscriptions</h4>
              <SliderRow
                label="Monthly Price"
                tooltip="What subscribers pay per month. Higher price = more MRR per subscriber but may reduce conversion and increase churn."
                value={firstPlan.monthlyPrice}
                min={5}
                max={firstPlan.monthlyPrice * 3}
                step={1}
                unit="$"
                onChange={(v) => onUpdatePlan(firstPlan.id, { monthlyPrice: v })}
                format={(v) => `$${v.toFixed(2)}`}
              />
              <SliderRow
                label="Growth Rate"
                tooltip="Percentage of existing subscribers that bring in new subscribers each month. Compounds over time. Set to 0 for flat projections."
                value={firstPlan.monthlyGrowthRate}
                min={0}
                max={50}
                step={0.5}
                unit="%/mo"
                onChange={(v) => onUpdatePlan(firstPlan.id, { monthlyGrowthRate: v })}
                format={(v) => `${v.toFixed(1)}%`}
              />
              <SliderRow
                label="Churn Rate"
                tooltip="Percentage of subscribers who cancel each month. Lower is better. Physical product subscriptions typically see 6-10% monthly churn."
                value={firstPlan.monthlyChurnRate}
                min={0}
                max={30}
                step={0.5}
                unit="%/mo"
                onChange={(v) => onUpdatePlan(firstPlan.id, { monthlyChurnRate: v })}
                format={(v) => `${v.toFixed(1)}%`}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" variant="default" className="flex-1 gap-1" onClick={() => { onApply(); onOpenChange(false); }}>
              <Check className="h-3.5 w-3.5" /> Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
