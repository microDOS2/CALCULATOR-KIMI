import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Scale } from "lucide-react";
import { FormulaTooltip, FormulaBadge } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CalculatorState, CalculationResult, SKU, Ingredient } from "@/types/calculator";
import { money3, MG_PER_OZ, toOz, fmtWeight } from "@/lib/calculator";
import { CsvImportSection } from "@/components/CsvImportSection";

interface ProductTabProps {
  state: CalculatorState;
  result: CalculationResult;
  addSKU: () => void;
  removeSKU: (id: string) => void;
  updateSKU: (id: string, patch: Partial<SKU>) => void;
  updateOrderQty: (skuId: string, qty: number) => void;
  addIngredient: () => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  updateIngredient: (id: string, patch: Partial<{ name?: string; mgPerUnit?: number; costPerMg?: number; moqTiers?: { minOrderMg: number; costPerMg: number }[] }>) => void;
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
  setIngredients,
  updateIngredient,
  removeIngredient,
}: ProductTabProps) {
  return (
    <div className="space-y-6">
      {/* SKU Editor */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Product Specifications (SKUs)
                <InfoTooltip text="A Stock Keeping Unit (SKU) is a unique product variant. Define your product(s) here — what goes in each pack, the retail price, and how sales split across channels. You can add multiple SKUs to compare different product variants." label="SKUs" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Define each product variant, units per pack, retail price, and channel sales mix.</p>
          </div>
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
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Order Composition
                <InfoTooltip text="Order Composition defines how many packs of each SKU you are ordering in a single purchase order. This drives the Purchase Order analysis and blended (weighted-average) calculations across all channels. Set quantities to 0 for SKUs not in this order." label="Order Composition" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Set how many packs of each SKU you are ordering. Drives PO and blended calculations.</p>
          </div>
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
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Ingredients / Components
                <InfoTooltip text="Ingredients are the raw materials that go into each unit of your product. Enter the amount per unit (in milligrams) and the cost per milligram. The calculator multiplies these to get your total ingredient cost per pack. This is your raw material / direct material cost." label="Ingredients / Components" />
                <FormulaBadge
                  label="Ingredients"
                  formula={`Define components per unit. Cost is per milligram. Total ingredient cost = Σ(mg/unit × units/pack × $/mg)`}
                />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">List raw materials per unit. Enter mg per unit and cost per mg. Drives COGS calculation.</p>
          </div>
          <Button size="sm" variant="outline" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center text-xs text-muted-foreground px-1">
            <span>Name</span>
            <span>{state.unitSystem === 'mg' ? 'mg / unit' : 'oz / unit'}</span>
            <span>{state.unitSystem === 'mg' ? '$ / mg' : '$ / oz'}</span>
            <span></span>
          </div>
          {state.ingredients.map((ing) => {

            return (
            <div key={ing.id} className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                <Input placeholder="Name" value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, { name: e.target.value })} className="h-8" />
                <Input type="number" step={state.unitSystem === 'mg' ? "0.0001" : "0.000001"}
                  placeholder={state.unitSystem === 'mg' ? 'mg' : 'oz'}
                  value={state.unitSystem === 'mg' ? ing.mgPerUnit : Number((ing.mgPerUnit / MG_PER_OZ).toFixed(6))}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateIngredient(ing.id, { mgPerUnit: state.unitSystem === 'mg' ? val : val * MG_PER_OZ });
                  }} className="h-8 w-28" />
                <Input type="number" step={state.unitSystem === 'mg' ? "0.000001" : "0.0000001"}
                  placeholder={state.unitSystem === 'mg' ? '$/mg' : '$/oz'}
                  value={state.unitSystem === 'mg' ? ing.costPerMg : Number((ing.costPerMg * MG_PER_OZ).toFixed(7))}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateIngredient(ing.id, { costPerMg: state.unitSystem === 'mg' ? val : val / MG_PER_OZ });
                  }} className="h-8 w-28" />
                <Button size="sm" variant="ghost" className="text-destructive h-8"
                  onClick={() => removeIngredient(ing.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* MOQ Tier Editor */}
              <Card className="border-dashed border-2">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                    Volume Pricing Tiers
                    <span className="text-muted-foreground font-normal">
                      {ing.moqTiers && ing.moqTiers.length > 0 && `(${ing.moqTiers.length} tiers)`}
                    </span>
                    <InfoTooltip
                      text="Set lower cost-per-mg when ordering larger quantities. The calculator auto-selects the right tier based on total order volume. Example: $0.70/mg at 1kg, $0.55/mg at 5kg."
                      label="MOQ Pricing Tiers"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 pb-3 px-3">
                  <p className="text-[10px] text-muted-foreground">
                    Lower cost-per-mg when ordering larger quantities. Auto-selected based on order volume.
                  </p>
                  {ing.moqTiers.length === 0 && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 rounded p-1.5">
                      No tiers yet. Click Add Tier to set volume discounts.
                    </p>
                  )}
                  {ing.moqTiers.map((tier, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Min Order (mg)</Label>
                        <Input
                          type="number"
                          value={tier.minOrderMg}
                          onChange={(e) => {
                            const newTiers = [...ing.moqTiers];
                            newTiers[idx] = { ...tier, minOrderMg: Math.max(0, Number(e.target.value)) };
                            updateIngredient(ing.id, { moqTiers: newTiers });
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Cost / mg ($)</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={tier.costPerMg}
                          onChange={(e) => {
                            const newTiers = [...ing.moqTiers];
                            newTiers[idx] = { ...tier, costPerMg: Math.max(0, Number(e.target.value)) };
                            updateIngredient(ing.id, { moqTiers: newTiers });
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive h-7 self-end"
                        onClick={() => {
                          const newTiers = ing.moqTiers.filter((_, i) => i !== idx);
                          updateIngredient(ing.id, { moqTiers: newTiers });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs w-full"
                    onClick={() => {
                      const newTiers = [...ing.moqTiers, { minOrderMg: 1000, costPerMg: ing.costPerMg * 0.9 }];
                      updateIngredient(ing.id, { moqTiers: newTiers });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Tier
                  </Button>
                </CardContent>
              </Card>
            </div>
            );
          })}

          {/* CSV Bulk Import */}
          <CsvImportSection
            existingIngredients={state.ingredients}
            unitSystem={state.unitSystem}
            setIngredients={setIngredients}
          />

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

            <FormulaTooltip
              label="Total Weight / Unit"
              formula={`Sum of all ingredient weights per unit = ${state.unitSystem === 'mg' ? `${result.totalWeightPerUnit.toFixed(2)} mg` : `${toOz(result.totalWeightPerUnit).toFixed(4)} oz`}`}
            >
              <Card className="cursor-help bg-primary/5">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Total Weight / Unit</div>
                  <div className="text-xl font-bold tabular-nums">{fmtWeight(result.totalWeightPerUnit, state.unitSystem)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
