import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { FormulaTooltip, FormulaBadge } from "@/components/FormulaTooltip";
import type { CalculatorState, CalculationResult, SKU } from "@/types/calculator";
import { money3 } from "@/lib/calculator";

interface ProductTabProps {
  state: CalculatorState;
  result: CalculationResult;
  addSKU: () => void;
  removeSKU: (id: string) => void;
  updateSKU: (id: string, patch: Partial<SKU>) => void;
  updateOrderQty: (skuId: string, qty: number) => void;
  addIngredient: () => void;
  updateIngredient: (id: string, patch: Partial<{ name?: string; mgPerUnit?: number; costPerMg?: number }>) => void;
  removeIngredient: (id: string) => void;
}

function enforceMix(key: "mixR" | "mixW" | "mixD", value: number, sku: SKU): Partial<SKU> {
  const clamped = Math.max(0, Math.min(100, value));
  const others = (["mixR", "mixW", "mixD"] as const).filter((k) => k !== key);
  const rem = 100 - clamped;
  const currentOtherTotal = others.reduce((sum, k) => sum + (sku[k] || 0), 0);
  let result: Partial<SKU> = { [key]: clamped };
  if (currentOtherTotal === 0) {
    const split = rem / others.length;
    others.forEach((k) => (result[k] = Math.round(split * 10) / 10));
  } else {
    const factor = rem / currentOtherTotal;
    others.forEach((k) => (result[k] = Math.round((sku[k] || 0) * factor * 10) / 10));
  }
  const finalTotal = (result.mixR ?? sku.mixR) + (result.mixW ?? sku.mixW) + (result.mixD ?? sku.mixD);
  const diff = Math.round((100 - finalTotal) * 10) / 10;
  if (diff !== 0 && others.length > 0) {
    result[others[0]] = Math.round(((result[others[0]] ?? sku[others[0]]) + diff) * 10) / 10;
  }
  return result;
}

export function ProductTab({
  state,
  result,
  addSKU,
  removeSKU,
  updateSKU,
  updateOrderQty,
  addIngredient,
  updateIngredient,
  removeIngredient,
}: ProductTabProps) {
  return (
    <div className="space-y-6">
      {/* SKU Editor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Product Specifications (SKUs)</CardTitle>
          <Button size="sm" variant="outline" onClick={addSKU}>
            <Plus className="h-4 w-4 mr-1" /> Add SKU
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.skus.map((sku) => (
            <div key={sku.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">SKU Name</Label>
                  <Input value={sku.name} onChange={(e) => updateSKU(sku.id, { name: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    Units / Pack
                    <FormulaBadge
                      label="Units per Pack"
                      formula={`Number of units (e.g., pills, items) in each retail pack. Current: ${sku.unitsPerPack}`}
                    />
                  </Label>
                  <Input type="number" min={1} value={sku.unitsPerPack}
                    onChange={(e) => updateSKU(sku.id, { unitsPerPack: Math.max(1, Number(e.target.value)) })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    Retail Price / Pack
                    <FormulaBadge
                      label="Retail Price"
                      formula={`Final consumer price for one pack. Current: ${money3(sku.retailPrice)}`}
                    />
                  </Label>
                  <Input type="number" step="0.01" min={0} value={sku.retailPrice}
                    onChange={(e) => updateSKU(sku.id, { retailPrice: Number(e.target.value) })} className="h-8" />
                </div>
                <div className="flex items-end">
                  <Button size="sm" variant="ghost" className="text-destructive"
                    onClick={() => removeSKU(sku.id)} disabled={state.skus.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["mixR", "mixW", "mixD"] as const).map((k) => (
                  <div key={k} className="space-y-1">
                    <Label className="text-xs">
                      % {k === "mixR" ? "Retail" : k === "mixW" ? "Wholesale" : "Distributor"}
                    </Label>
                    <Input type="number" min={0} max={100} value={sku[k]}
                      onChange={(e) => updateSKU(sku.id, enforceMix(k, Number(e.target.value), sku))} className="h-8" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {state.skus.map((sku) => {
              const item = state.order.find((o) => o.skuId === sku.id);
              return (
                <div key={sku.id} className="space-y-1">
                  <Label className="text-xs font-medium">{sku.name}</Label>
                  <Input type="number" min={0} value={item?.qty ?? 0}
                    onChange={(e) => updateOrderQty(sku.id, Math.max(0, Number(e.target.value)))} className="h-8" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Ingredients / Components
            <FormulaBadge
              label="Ingredients"
              formula={`Define components per unit. Cost is per milligram. Total ingredient cost = Σ(mg/unit × units/pack × $/mg)`}
            />
          </CardTitle>
          <Button size="sm" variant="outline" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center text-xs text-muted-foreground px-1">
            <span>Name</span>
            <span>mg / unit</span>
            <span>$ / mg</span>
            <span></span>
          </div>
          {state.ingredients.map((ing) => (
            <div key={ing.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
              <Input placeholder="Name" value={ing.name}
                onChange={(e) => updateIngredient(ing.id, { name: e.target.value })} className="h-8" />
              <Input type="number" step="0.0001" placeholder="mg" value={ing.mgPerUnit}
                onChange={(e) => updateIngredient(ing.id, { mgPerUnit: Number(e.target.value) })} className="h-8 w-28" />
              <Input type="number" step="0.000001" placeholder="$/mg" value={ing.costPerMg}
                onChange={(e) => updateIngredient(ing.id, { costPerMg: Number(e.target.value) })} className="h-8 w-28" />
              <Button size="sm" variant="ghost" className="text-destructive h-8"
                onClick={() => removeIngredient(ing.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Ingredient Result Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <FormulaTooltip
              label="Blended Ingredient Cost / Pack"
              formula={`Σ(ingredient mg × units/pack × $/mg) = ${money3(result.avgIngCostPerPack)}`}
            >
              <Card className="cursor-help">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Blended Ingredient Cost / Pack</div>
                  <div className="text-xl font-bold tabular-nums">{money3(result.avgIngCostPerPack)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>

            <FormulaTooltip
              label="Blended COGS / Pack"
              formula={`Ingredients (${money3(result.avgIngCostPerPack)}) + Packaging (${money3(result.totalPackagingCostPerPack)}) = ${money3(result.cogsPerPack)}`}
            >
              <Card className="cursor-help">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Blended COGS / Pack</div>
                  <div className="text-xl font-bold tabular-nums">{money3(result.cogsPerPack)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>

            <FormulaTooltip
              label="Cost / mg"
              formula={`Total ingredient cost / Total mg = ${money3(result.costPerMg)}`}
            >
              <Card className="cursor-help">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Cost / mg</div>
                  <div className="text-xl font-bold tabular-nums">{result.costPerMg > 0 ? money3(result.costPerMg) : "$0"}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>

            <FormulaTooltip
              label="Cost / gram"
              formula={`Cost/mg × 1000 = ${money3(result.costPerGram)}`}
            >
              <Card className="cursor-help">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Cost / gram</div>
                  <div className="text-xl font-bold tabular-nums">{result.costPerGram > 0 ? money3(result.costPerGram) : "$0"}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
