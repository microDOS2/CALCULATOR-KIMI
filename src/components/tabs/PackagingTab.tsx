import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CalculatorState, CalculationResult, PackagingLayer } from "@/types/calculator";
import { FormulaTooltip, FormulaBadge } from "@/components/FormulaTooltip";
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Packaging Layers
            <FormulaBadge
              label="Packaging Cost"
              formula={`Each layer cost = cost/unit × (units/pack / units/layer). Total packaging = Σ(all included layers)`}
            />
          </CardTitle>
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
          <CardTitle className="text-base">Packaging Cost Breakdown</CardTitle>
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
