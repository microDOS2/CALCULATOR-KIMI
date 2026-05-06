import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CalculatorState, CalculationResult, PackagingLayer } from "@/types/calculator";
import { FormulaTooltip, FormulaBadge } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import { money3 } from "@/lib/calculator";

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
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center text-xs text-muted-foreground px-1">
            <span>Layer Name</span>
            <span>Cost / Unit</span>
            <span>Units / Layer</span>
            <span>Include</span>
            <span></span>
          </div>
          {state.packaging.map((layer) => (
            <div key={layer.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
              <Input placeholder="Layer name" value={layer.name}
                onChange={(e) => updateLayer(layer.id, { name: e.target.value })} className="h-8" />
              <Input type="number" step="0.01" min={0} value={layer.costPerUnit}
                onChange={(e) => updateLayer(layer.id, { costPerUnit: Number(e.target.value) })} className="h-8 w-28" />
              <Input type="number" min={1} value={layer.unitsPerLayer}
                onChange={(e) => updateLayer(layer.id, { unitsPerLayer: Math.max(1, Number(e.target.value)) })} className="h-8 w-28" />
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

      {/* Packaging Cost Breakdown */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-base">
              Packaging Cost Breakdown
              <InfoTooltip text="This shows the cost contribution of each packaging layer to the total cost per pack. The total is the sum of all included layers, allocated based on how many units fit in each container. This total feeds directly into your COGS calculation." label="Packaging Breakdown" />
            </CardTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">Per-layer cost contribution to each pack. Total feeds into COGS.</p>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
