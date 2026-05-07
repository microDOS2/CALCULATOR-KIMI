import { useState, useMemo } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { Scenario, CalculationResult } from "@/types/calculator";
import { calculate } from "@/lib/calculator";
import { money3, pct } from "@/lib/calculator";

interface CompareTabProps {
  scenarios: Scenario[];
}

interface DeltaRow {
  label: string;
  a: number;
  b: number;
  format: "money" | "pct" | "num";
  suffix?: string;
}

function getDeltas(a: CalculationResult, b: CalculationResult): DeltaRow[] {
  return [
    { label: "Retail Price", a: a.retail.price, b: b.retail.price, format: "money" },
    { label: "Wholesale Price", a: a.wholesale.price, b: b.wholesale.price, format: "money" },
    { label: "Distributor Price", a: a.distributor.price, b: b.distributor.price, format: "money" },
    { label: "Blended Gross Margin", a: a.bgmp, b: b.bgmp, format: "pct" },
    { label: "Break-Even Revenue", a: a.brev, b: b.brev, format: "money" },
    { label: "Blended Gross Profit / Pack", a: a.bgpp, b: b.bgpp, format: "money" },
    { label: "Blended Op. Profit / Pack", a: a.bopp, b: b.bopp, format: "money" },
    { label: "Monthly Volume", a: a.totalMonthlyVolume, b: b.totalMonthlyVolume, format: "num" },
    { label: "Retail Gross Profit", a: a.retail.gp, b: b.retail.gp, format: "money" },
    { label: "Wholesale Gross Profit", a: a.wholesale.gp, b: b.wholesale.gp, format: "money" },
    { label: "Distributor Gross Profit", a: a.distributor.gp, b: b.distributor.gp, format: "money" },
    { label: "Shipping / Pack", a: a.shipPerPack, b: b.shipPerPack, format: "money" },
    { label: "COGS / Pack", a: a.cogsPerPack, b: b.cogsPerPack, format: "money" },
  ];
}

function fmt(row: DeltaRow, val: number): string {
  if (row.format === "money") return money3(val);
  if (row.format === "pct") return pct(val);
  return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function DeltaBadge({ a, b }: { a: number; b: number }) {
  const diff = b - a;
  if (Math.abs(diff) < 0.001) {
    return <span className="inline-flex items-center text-xs text-muted-foreground"><Minus className="h-3 w-3 mr-0.5" /> Same</span>;
  }
  const isBetter = diff > 0;
  const pctChange = a !== 0 ? ((diff / Math.abs(a)) * 100).toFixed(1) : "N/A";
  return (
    <span className={`inline-flex items-center text-xs font-medium ${isBetter ? "text-green-600" : "text-red-500"}`}>
      {isBetter ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
      {diff > 0 ? "+" : ""}{fmt({ label: "", a: 0, b: 0, format: "money" }, diff)} ({pctChange}%)
    </span>
  );
}

export function CompareTab({ scenarios }: CompareTabProps) {
  const [scenarioAId, setScenarioAId] = useState<string>("");
  const [scenarioBId, setScenarioBId] = useState<string>("");

  const scenarioA = scenarios.find((s) => s.id === scenarioAId);
  const scenarioB = scenarios.find((s) => s.id === scenarioBId);

  const resultA = useMemo(() => {
    if (!scenarioA) return null;
    try {
      return calculate(scenarioA.inputs);
    } catch {
      return null;
    }
  }, [scenarioA]);

  const resultB = useMemo(() => {
    if (!scenarioB) return null;
    try {
      return calculate(scenarioB.inputs);
    } catch {
      return null;
    }
  }, [scenarioB]);

  const deltas = useMemo(() => {
    if (!resultA || !resultB) return [];
    return getDeltas(resultA, resultB);
  }, [resultA, resultB]);

  if (scenarios.length < 2) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Save at least 2 scenarios to compare them side-by-side.</p>
        <p className="text-xs mt-1">Configure the calculator, click Save in the header, then return here.</p>
        <p className="text-xs mt-1 text-muted-foreground">
          <InfoTooltip text="The Compare tab lets you load two saved scenarios and see 13 key metrics side-by-side with green/red delta indicators. This is the fastest way to evaluate strategic decisions." label="Compare Tab" />
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Side-by-Side Scenario Compare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-start">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Scenario A</label>
              <Select value={scenarioAId} onValueChange={setScenarioAId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario A..." />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label || "—"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center pt-6">
              <span className="text-muted-foreground text-sm font-medium">vs</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Scenario B</label>
              <Select value={scenarioBId} onValueChange={setScenarioBId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario B..." />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label || "—"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {deltas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Scenario A Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-600">{scenarioA?.label || "Scenario A"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {deltas.map((row) => (
                <div key={row.label} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium tabular-nums">{fmt(row, row.a)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Scenario B Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600">{scenarioB?.label || "Scenario B"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {deltas.map((row) => (
                <div key={row.label} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium tabular-nums">{fmt(row, row.b)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {deltas.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Delta Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deltas.map((row) => (
              <div key={row.label} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <DeltaBadge a={row.a} b={row.b} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
