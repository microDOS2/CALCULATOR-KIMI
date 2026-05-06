import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CalculatorState, CalculationResult, PackagingLayer } from "@/types/calculator";
import { FormulaTooltip, FormulaBadge } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import { money3, fmtWeightGrams } from "@/lib/calculator";

interface PackagingTabProps {
  state: CalculatorState;
  result: CalculationResult;
  addLayer: () => void;
  updateLayer: (id: string, patch: Partial<PackagingLayer>) => void;
  removeLayer: (id: string) => void;
}

export function PackagingTab({
  state,
  result,
  addLayer,
  updateLayer,
  removeLayer,
}: PackagingTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Packaging Layers
                <InfoTooltip text="Packaging layers are the physical containers and materials that hold and protect your product from factory to customer. Each layer has a cost per unit and a capacity (units per layer). Common layers: Primary Container (bottle/blister the product sits in), Inner Packaging (inserts, padding), Outer Box (retail box), Display Packaging (shelf display), Shipping Box (bulk shipping carton). Costs are allocated per pack based on how many units fit in each layer." label="Packaging Layers" />
                <FormulaBadge
                  label="Packaging Cost"
                  formula={`Each layer cost = cost/unit × (units/pack / units/layer). Total packaging = Σ(all included layers)`}
                />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Physical containers and materials. Cost allocated per pack based on capacity. Drives COGS.</p>
          </div>
          <Button size="sm" variant="outline" onClick={addLayer}>
            <Plus className="h-4 w-4 mr-1" /> Add Layer
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center text-xs text-muted-foreground px-1">
            <span>Layer Name</span>
            <span>Cost / Unit</span>
            <span>Units / Layer</span>
            <span>Weight (g)</span>
            <span>Include</span>
            <span></span>
          </div>
          {state.packaging.map((layer) => (
            <div key={layer.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center">
              <Input placeholder="Layer name" value={layer.name}
                onChange={(e) => updateLayer(layer.id, { name: e.target.value })} className="h-8" />
              <Input type="number" step="0.01" min={0} value={layer.costPerUnit}
                onChange={(e) => updateLayer(layer.id, { costPerUnit: Number(e.target.value) })} className="h-8 w-24" />
              <Input type="number" min={1} value={layer.unitsPerLayer}
                onChange={(e) => updateLayer(layer.id, { unitsPerLayer: Math.max(1, Number(e.target.value)) })} className="h-8 w-24" />
              <Input type="number" step="0.1" min={0} value={layer.weightPerUnit}
                onChange={(e) => updateLayer(layer.id, { weightPerUnit: Math.max(0, Number(e.target.value)) })} className="h-8 w-24" title="Weight in grams per unit" />
              <Checkbox checked={layer.included}
                onCheckedChange={(v) => updateLayer(layer.id, { included: !!v })} />
              <Button size="sm" variant="ghost" className="text-destructive h-8"
                onClick={() => removeLayer(layer.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Packaging Cost & Weight Breakdown */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-base">
              Packaging Cost & Weight Breakdown
              <InfoTooltip text="This shows the cost contribution of each packaging layer to the total cost per pack, plus the weight contribution of each layer. The total packaging weight affects shipping costs and regulatory requirements." label="Packaging Breakdown" />
            </CardTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">Per-layer cost and weight contribution to each pack.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {result.packagingCosts.map((pc) => (
              <FormulaTooltip
                key={pc.id}
                label={pc.name}
                formula={`${pc.name} cost per pack = ${money3(pc.costPerPack)}`}
              >
                <Card className="cursor-help">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground truncate">{pc.name}</div>
                    <div className="text-xl font-bold tabular-nums">{money3(pc.costPerPack)}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
            ))}
            <FormulaTooltip
              label="Total Packaging / Pack"
              formula={`Σ(all layers) = ${money3(result.totalPackagingCostPerPack)}`}
            >
              <Card className="cursor-help bg-muted/50">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Total Packaging / Pack</div>
                  <div className="text-xl font-bold tabular-nums">{money3(result.totalPackagingCostPerPack)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>
          </div>

          {/* Weight row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FormulaTooltip
              label="Packaging Weight / Pack"
              formula={`Total packaging weight per pack = ${fmtWeightGrams(result.totalPackagingWeightPerPack, state.unitSystem)}`}
            >
              <Card className="cursor-help bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Packaging Weight / Pack</div>
                  <div className="text-lg font-bold tabular-nums">{fmtWeightGrams(result.totalPackagingWeightPerPack, state.unitSystem)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>

            <FormulaTooltip
              label="Ingredient Weight / Pack"
              formula={`Total ingredient weight per pack = ${fmtWeightGrams(result.totalWeightPerPack / 1000, state.unitSystem)}`}
            >
              <Card className="cursor-help bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Ingredient Weight / Pack</div>
                  <div className="text-lg font-bold tabular-nums">{fmtWeightGrams(result.totalWeightPerPack / 1000, state.unitSystem)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>

            <FormulaTooltip
              label="Total Unit Weight / Pack"
              formula={`Ingredient weight + Packaging weight = ${fmtWeightGrams(result.totalUnitWeightPerPack, state.unitSystem)}`}
            >
              <Card className="cursor-help bg-primary/10">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Total Unit Weight / Pack</div>
                  <div className="text-lg font-bold tabular-nums">{fmtWeightGrams(result.totalUnitWeightPerPack, state.unitSystem)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
