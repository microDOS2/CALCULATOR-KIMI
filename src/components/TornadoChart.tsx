import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CalculatorState } from "@/types/calculator";
import { calculate } from "@/lib/calculator";
import { money3 } from "@/lib/calculator";

interface TornadoChartProps {
  state: CalculatorState;
}

interface TornadoRow {
  name: string;
  low: number;   // profit delta from -10%
  high: number;  // profit delta from +10%
}

function cloneState(s: CalculatorState): CalculatorState {
  return JSON.parse(JSON.stringify(s));
}

function totalGP(result: ReturnType<typeof calculate>): number {
  return result.retail.gp + result.wholesale.gp + result.distributor.gp;
}

function computeTornado(state: CalculatorState): TornadoRow[] {
  const baseResult = calculate(state);
  const baseGP = totalGP(baseResult);

  const rows: TornadoRow[] = [];

  // Retail Price (per SKU)
  {
    const up = cloneState(state); up.skus = up.skus.map((s) => ({ ...s, retailPrice: s.retailPrice * 1.1 }));
    const down = cloneState(state); down.skus = down.skus.map((s) => ({ ...s, retailPrice: s.retailPrice / 1.1 }));
    rows.push({ name: "Retail Price", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Wholesale Discount
  {
    const up = cloneState(state); up.wDisc = Math.min(99, up.wDisc * 1.1);
    const down = cloneState(state); down.wDisc = Math.max(0, down.wDisc / 1.1);
    rows.push({ name: "Wholesale Disc", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Distributor Discount
  {
    const up = cloneState(state); up.dDisc = Math.min(99, up.dDisc * 1.1);
    const down = cloneState(state); down.dDisc = Math.max(0, down.dDisc / 1.1);
    rows.push({ name: "Distributor Disc", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Ingredient Cost
  {
    const up = cloneState(state);
    up.ingredients = up.ingredients.map((ing) => ({ ...ing, costPerMg: ing.costPerMg * 1.1, moqTiers: ing.moqTiers.map((t) => ({ ...t, costPerMg: t.costPerMg * 1.1 })) }));
    const down = cloneState(state);
    down.ingredients = down.ingredients.map((ing) => ({ ...ing, costPerMg: ing.costPerMg / 1.1, moqTiers: ing.moqTiers.map((t) => ({ ...t, costPerMg: t.costPerMg / 1.1 })) }));
    rows.push({ name: "Ingredient Cost", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Packaging Cost
  {
    const up = cloneState(state);
    up.skus = up.skus.map((sku) => ({ ...sku, packaging: sku.packaging.map((p) => ({ ...p, costPerUnit: p.costPerUnit * 1.1 })) }));
    const down = cloneState(state);
    down.skus = down.skus.map((sku) => ({ ...sku, packaging: sku.packaging.map((p) => ({ ...p, costPerUnit: p.costPerUnit / 1.1 })) }));
    rows.push({ name: "Packaging Cost", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Shipping Cost
  {
    const up = cloneState(state); up.shippingPerPack *= 1.1;
    const down = cloneState(state); down.shippingPerPack /= 1.1;
    rows.push({ name: "Shipping Cost", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Overhead
  {
    const up = cloneState(state);
    up.overhead = up.overhead.map((o) => ({ ...o, cost: o.cost * 1.1 }));
    const down = cloneState(state);
    down.overhead = down.overhead.map((o) => ({ ...o, cost: o.cost / 1.1 }));
    rows.push({ name: "Overhead", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Volume
  {
    const up = cloneState(state); up.monthlyVolumes = up.monthlyVolumes.map((m) => ({ ...m, qty: Math.round(m.qty * 1.1) }));
    const down = cloneState(state); down.monthlyVolumes = down.monthlyVolumes.map((m) => ({ ...m, qty: Math.round(m.qty / 1.1) }));
    rows.push({ name: "Volume", low: totalGP(calculate(down)) - baseGP, high: totalGP(calculate(up)) - baseGP });
  }

  // Sort by max absolute impact
  return rows.sort((a, b) => {
    const maxA = Math.max(Math.abs(a.low), Math.abs(a.high));
    const maxB = Math.max(Math.abs(b.low), Math.abs(b.high));
    return maxB - maxA;
  });
}

function DivergingBar({ label, low, high, maxAbs }: { label: string; low: number; high: number; maxAbs: number }) {
  const lowPct = Math.abs(low) / maxAbs * 100;
  const highPct = Math.abs(high) / maxAbs * 100;

  return (
    <div className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center text-xs">
      <span className="text-muted-foreground truncate" title={label}>{label}</span>
      <div className="flex items-center justify-end gap-1">
        <span className="tabular-nums text-red-600 w-14 text-right">{money3(low)}</span>
        <div className="h-5 bg-red-500 rounded-sm min-w-[2px]" style={{ width: `${lowPct}%` }} />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-5 bg-green-500 rounded-sm min-w-[2px]" style={{ width: `${highPct}%` }} />
        <span className="tabular-nums text-green-600 w-14">{money3(high)}</span>
      </div>
    </div>
  );
}

export function TornadoChart({ state }: TornadoChartProps) {
  const data = useMemo(() => computeTornado(state), [state]);
  const maxAbs = useMemo(() => Math.max(...data.flatMap((r) => [Math.abs(r.low), Math.abs(r.high)])), [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Sensitivity Tornado Chart
          <InfoTooltip
            text="Shows how each input affects total gross profit per pack when changed by ±10%. Inputs are sorted by impact — longest bars are your highest-leverage targets. Red values mean profit decreased. Green values mean profit increased. Focus on the top 3 bars for the biggest improvement opportunities."
            label="Tornado Chart"
          />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Change in gross profit per pack from ±10% input variation. Sorted by impact.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-[100px_1fr_1fr] gap-2 text-xs text-muted-foreground border-b pb-1">
          <span>Input</span>
          <span className="text-right pr-2">-10% Impact</span>
          <span>+10% Impact</span>
        </div>

        {data.map((row) => (
          <DivergingBar key={row.name} label={row.name} low={row.low} high={row.high} maxAbs={maxAbs} />
        ))}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground border-t">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> = Profit decrease
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> = Profit increase
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
