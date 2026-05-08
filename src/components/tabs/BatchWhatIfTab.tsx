import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Table2 } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CalculatorState } from "@/types/calculator";
import { calculate } from "@/lib/calculator";
import { money3, pct } from "@/lib/calculator";

interface BatchWhatIfTabProps {
  state: CalculatorState;
}

type WhatIfInput = "retailPrice" | "wDisc" | "dDisc" | "ingredientCost" | "shippingPerPack";

function cloneState(s: CalculatorState): CalculatorState {
  return JSON.parse(JSON.stringify(s));
}

export function BatchWhatIfTab({ state }: BatchWhatIfTabProps) {
  const [input, setInput] = useState<WhatIfInput>("retailPrice");
  const [valuesText, setValuesText] = useState("20, 25, 30, 35, 40");

  const results = useMemo(() => {
    const values = valuesText
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v));

    return values.map((val) => {
      const testState = cloneState(state);
      switch (input) {
        case "retailPrice":
          testState.skus = testState.skus.map((s: any) => ({ ...s, retailPrice: val }));
          break;
        case "wDisc":
          testState.wDisc = Math.max(0, Math.min(99, val));
          break;
        case "dDisc":
          testState.dDisc = Math.max(0, Math.min(99, val));
          break;
        case "ingredientCost":
          testState.ingredients = testState.ingredients.map((ing: any) => ({
            ...ing,
            costPerMg: ing.costPerMg * val,
            moqTiers: ing.moqTiers.map((t: any) => ({ ...t, costPerMg: t.costPerMg * val })),
          }));
          break;
        case "shippingPerPack":
          testState.shippingPerPack = val;
          break;
      }

      try {
        const r = calculate(testState);
        return {
          value: val,
          totalGP: r.retail.gp + r.wholesale.gp + r.distributor.gp,
          bgmp: pct(r.bgmp),
          brev: money3(r.brev),
          cogs: money3(r.cogsPerPack),
          bePacks: isFinite(r.beUnitsB) ? Math.ceil(r.beUnitsB).toLocaleString() : "∞",
        };
      } catch {
        return { value: val, totalGP: 0, bgmp: "—", brev: "—", cogs: "—", bePacks: "—" };
      }
    });
  }, [state, input, valuesText]);

  const inputLabel = (inp: WhatIfInput) => {
    switch (inp) {
      case "retailPrice": return "Retail Price ($)";
      case "wDisc": return "Wholesale Discount (%)";
      case "dDisc": return "Distributor Discount (%)";
      case "ingredientCost": return "Ingredient Cost (multiplier)";
      case "shippingPerPack": return "Shipping Cost ($)";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-violet-400 bg-gradient-to-br from-violet-100 via-violet-50 to-white dark:from-violet-900/30 dark:via-violet-950/20 dark:to-transparent shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Table2 className="h-5 w-5 text-violet-500" />
            Batch "What-If" Testing
            <span className="bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Power Tool</span>
            <InfoTooltip
              text="Test multiple values for a single input at once. Enter comma-separated values (e.g., '20, 25, 30, 35, 40' for retail price) and get a comparison table with gross profit, margin, break-even, COGS, and break-even packs for each value. This is the systematic way to find your optimal pricing or cost structure."
              label="Batch What-If"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Input Variable
              <InfoTooltip text="Which business lever to test across multiple values?" label="Input Variable" />
            </Label>
            <Select value={input} onValueChange={(v) => setInput(v as WhatIfInput)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retailPrice">Retail Price ($)</SelectItem>
                <SelectItem value="wDisc">Wholesale Discount (%)</SelectItem>
                <SelectItem value="dDisc">Distributor Discount (%)</SelectItem>
                <SelectItem value="ingredientCost">Ingredient Cost (multiplier)</SelectItem>
                <SelectItem value="shippingPerPack">Shipping Cost ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              Test Values (comma-separated)
              <InfoTooltip text="Enter values to test, separated by commas. For ingredient cost, use multipliers (e.g., '0.5, 0.75, 1, 1.25, 1.5' means half cost through 1.5x cost)." label="Test Values" />
            </Label>
            <Input value={valuesText} onChange={(e) => setValuesText(e.target.value)} placeholder="20, 25, 30, 35, 40" />
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{inputLabel(input)}</TableHead>
                    <TableHead className="text-right">Total GP</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">Break-Even Rev</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">BE Packs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, i) => (
                    <TableRow key={i} className={i === 0 ? "" : results[i].totalGP > results[i - 1].totalGP ? "bg-green-50/50" : results[i].totalGP < results[i - 1].totalGP ? "bg-red-50/50" : ""}>
                      <TableCell className="font-medium">
                        {input === "ingredientCost" ? `${r.value}x` : input === "wDisc" || input === "dDisc" ? `${r.value}%` : money3(r.value)}
                      </TableCell>
                      <TableCell className="text-right">{money3(r.totalGP)}</TableCell>
                      <TableCell className="text-right">{r.bgmp}</TableCell>
                      <TableCell className="text-right">{r.brev}</TableCell>
                      <TableCell className="text-right">{r.cogs}</TableCell>
                      <TableCell className="text-right">{r.bePacks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
