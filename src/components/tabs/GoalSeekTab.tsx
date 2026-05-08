import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crosshair, AlertCircle, CheckCircle2 } from "lucide-react";
import type { CalculatorState } from "@/types/calculator";
import { calculate } from "@/lib/calculator";
import { money3, pct } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";

interface GoalSeekTabProps {
  state: CalculatorState;
}

type TargetMetric = "totalGP" | "bgmp" | "brev" | "cogsPerPack" | "totalMonthlyVolume";
type AdjustableInput = "retailPrice" | "wDisc" | "dDisc" | "ingredientCost" | "packagingCost" | "shippingPerPack" | "volume";

function getMetricValue(result: ReturnType<typeof calculate>, metric: TargetMetric): number {
  switch (metric) {
    case "totalGP": return result.retail.gp + result.wholesale.gp + result.distributor.gp;
    case "bgmp": return result.bgmp;
    case "brev": return result.brev;
    case "cogsPerPack": return result.cogsPerPack;
    case "totalMonthlyVolume": return result.totalMonthlyVolume;
    default: return 0;
  }
}

function metricLabel(metric: TargetMetric): string {
  switch (metric) {
    case "totalGP": return "Total Gross Profit / Pack";
    case "bgmp": return "Blended Gross Margin %";
    case "brev": return "Break-Even Revenue";
    case "cogsPerPack": return "COGS / Pack";
    case "totalMonthlyVolume": return "Monthly Volume";
  }
}

function inputLabel(input: AdjustableInput): string {
  switch (input) {
    case "retailPrice": return "Retail Price";
    case "wDisc": return "Wholesale Discount %";
    case "dDisc": return "Distributor Discount %";
    case "ingredientCost": return "Ingredient Cost";
    case "packagingCost": return "Packaging Cost";
    case "shippingPerPack": return "Shipping Cost / Pack";
    case "volume": return "Monthly Volume";
  }
}

function formatMetricValue(metric: TargetMetric, value: number): string {
  if (metric === "bgmp") return pct(value);
  if (metric === "totalMonthlyVolume") return Math.round(value).toLocaleString();
  return money3(value);
}

function cloneState(s: CalculatorState): CalculatorState {
  return JSON.parse(JSON.stringify(s));
}

function setInputValue(s: CalculatorState, input: AdjustableInput, value: number): CalculatorState {
  const state = cloneState(s);
  switch (input) {
    case "retailPrice":
      state.skus = state.skus.map((sku: any) => ({ ...sku, retailPrice: value }));
      break;
    case "wDisc":
      state.wDisc = Math.max(0, Math.min(99, value));
      break;
    case "dDisc":
      state.dDisc = Math.max(0, Math.min(99, value));
      break;
    case "ingredientCost":
      state.ingredients = state.ingredients.map((ing: any) => ({
        ...ing,
        costPerMg: ing.costPerMg * value,
        moqTiers: ing.moqTiers.map((t: any) => ({ ...t, costPerMg: t.costPerMg * value })),
      }));
      break;
    case "packagingCost":
      state.skus = state.skus.map((sku: any) => ({
        ...sku,
        packaging: sku.packaging.map((p: any) => ({ ...p, costPerUnit: p.costPerUnit * value })),
      }));
      break;
    case "shippingPerPack":
      state.shippingPerPack = Math.max(0, value);
      break;
    case "volume":
      state.monthlyVolumes = state.monthlyVolumes.map((m: any) => ({ ...m, qty: Math.max(1, Math.round(value)) }));
      break;
  }
  return state;
}

function getCurrentInputValue(state: CalculatorState, input: AdjustableInput): number {
  switch (input) {
    case "retailPrice": return state.skus[0]?.retailPrice ?? 0;
    case "wDisc": return state.wDisc;
    case "dDisc": return state.dDisc;
    case "ingredientCost": return 1; // multiplier
    case "packagingCost": return 1; // multiplier
    case "shippingPerPack": return state.shippingPerPack;
    case "volume": return state.monthlyVolumes[0]?.qty ?? 0;
  }
}

function getInputBounds(input: AdjustableInput, current: number): [number, number] {
  switch (input) {
    case "retailPrice": return [current * 0.1, current * 5];
    case "wDisc": return [0, 99];
    case "dDisc": return [0, 99];
    case "ingredientCost": return [0.1, 5]; // multiplier range
    case "packagingCost": return [0.1, 5]; // multiplier range
    case "shippingPerPack": return [0, current * 5];
    case "volume": return [1, current * 10];
  }
}

export function GoalSeekTab({ state }: GoalSeekTabProps) {
  const [targetMetric, setTargetMetric] = useState<TargetMetric>("totalGP");
  const [targetValue, setTargetValue] = useState("");
  const [adjustableInput, setAdjustableInput] = useState<AdjustableInput>("retailPrice");
  const [result, setResult] = useState<{ value: number; achieved: number; iterations: number } | null>(null);
  const [error, setError] = useState("");

  const baseResult = useMemo(() => calculate(state), [state]);
  const baseMetric = useMemo(() => getMetricValue(baseResult, targetMetric), [baseResult, targetMetric]);

  const runSolver = useCallback(() => {
    setError("");
    setResult(null);

    const target = parseFloat(targetValue);
    if (isNaN(target)) {
      setError("Please enter a valid target value.");
      return;
    }

    const currentInput = getCurrentInputValue(state, adjustableInput);
    const [min, max] = getInputBounds(adjustableInput, currentInput);

    // For ingredient/packaging cost, we use a multiplier approach
    // For others, we search the absolute value
    const isMultiplier = adjustableInput === "ingredientCost" || adjustableInput === "packagingCost";

    let lo = min;
    let hi = max;
    let bestValue = currentInput;
    let bestAchieved = baseMetric;
    let bestDiff = Math.abs(baseMetric - target);

    // Binary search for 30 iterations
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      let testState: CalculatorState;

      if (isMultiplier) {
        // Apply multiplier to base state
        testState = setInputValue(state, adjustableInput, mid / currentInput);
      } else {
        testState = setInputValue(state, adjustableInput, mid);
      }

      try {
        const testResult = calculate(testState);
        const achieved = getMetricValue(testResult, targetMetric);
        const diff = achieved - target;

        if (Math.abs(achieved - target) < bestDiff) {
          bestDiff = Math.abs(achieved - target);
          bestValue = mid;
          bestAchieved = achieved;
        }

        if (diff > 0) {
          hi = mid;
        } else {
          lo = mid;
        }
      } catch {
        break;
      }
    }

    if (bestDiff > Math.abs(baseMetric) * 0.5) {
      setError(`Target may be unreachable. Closest achieved: ${formatMetricValue(targetMetric, bestAchieved)}`);
    }

    setResult({ value: bestValue, achieved: bestAchieved, iterations: 30 });
  }, [state, targetMetric, targetValue, adjustableInput, baseMetric]);

  const isMultiplier = adjustableInput === "ingredientCost" || adjustableInput === "packagingCost";

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-violet-400 bg-gradient-to-br from-violet-100 via-violet-50 to-white dark:from-violet-900/30 dark:via-violet-950/20 dark:to-transparent shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-violet-500" />
            Goal Seek / Target Finder
            <span className="bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Power Tool</span>
            <InfoTooltip
              text="Work backward from a target. Select what you want to achieve (e.g., '$50 gross profit per pack'), pick which input to adjust (e.g., 'Retail Price'), and the solver finds the exact value that hits your target. Uses 30-iteration binary search for precision."
              label="Goal Seek"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Target Metric */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Target Metric
              <InfoTooltip text="What business outcome do you want to achieve?" label="Target Metric" />
            </Label>
            <Select value={targetMetric} onValueChange={(v) => setTargetMetric(v as TargetMetric)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalGP">Total Gross Profit / Pack</SelectItem>
                <SelectItem value="bgmp">Blended Gross Margin %</SelectItem>
                <SelectItem value="brev">Break-Even Revenue</SelectItem>
                <SelectItem value="cogsPerPack">COGS / Pack</SelectItem>
                <SelectItem value="totalMonthlyVolume">Monthly Volume</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current: <strong>{formatMetricValue(targetMetric, baseMetric)}</strong>
            </p>
          </div>

          {/* Target Value */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Target Value
              <InfoTooltip text="Enter the exact value you want to achieve. Use the same units as the metric (dollars for profit, percentage for margin)." label="Target Value" />
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder={`e.g., ${targetMetric === "bgmp" ? "0.50" : "50"}`}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
            />
          </div>

          {/* Adjustable Input */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Adjust This Input
              <InfoTooltip text="Which business lever do you want the solver to adjust? The solver will find the exact value for this input that achieves your target." label="Adjustable Input" />
            </Label>
            <Select value={adjustableInput} onValueChange={(v) => setAdjustableInput(v as AdjustableInput)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retailPrice">Retail Price</SelectItem>
                <SelectItem value="wDisc">Wholesale Discount %</SelectItem>
                <SelectItem value="dDisc">Distributor Discount %</SelectItem>
                <SelectItem value="ingredientCost">Ingredient Cost (multiplier)</SelectItem>
                <SelectItem value="packagingCost">Packaging Cost (multiplier)</SelectItem>
                <SelectItem value="shippingPerPack">Shipping Cost / Pack</SelectItem>
                <SelectItem value="volume">Monthly Volume</SelectItem>
              </SelectContent>
            </Select>
            {isMultiplier && (
              <p className="text-xs text-muted-foreground">
                Solver uses a cost multiplier (1.0 = current cost, 0.5 = half cost, 2.0 = double cost).
              </p>
            )}
          </div>

          <Button onClick={runSolver} className="w-full" disabled={!targetValue}>
            <Crosshair className="h-4 w-4 mr-1" /> Find Solution
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {error && (
        <Card className="border-amber-200">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Solution Found</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Required {inputLabel(adjustableInput)}</p>
                <p className="text-lg font-bold">
                  {isMultiplier ? `${result.value.toFixed(2)}x` : (adjustableInput === "volume" ? Math.round(result.value).toLocaleString() : money3(result.value))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Achieved {metricLabel(targetMetric)}</p>
                <p className="text-lg font-bold">{formatMetricValue(targetMetric, result.achieved)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Target was {formatMetricValue(targetMetric, parseFloat(targetValue) || 0)}. Difference: {formatMetricValue(targetMetric, result.achieved - (parseFloat(targetValue) || 0))}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
