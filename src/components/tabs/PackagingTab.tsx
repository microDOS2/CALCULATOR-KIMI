import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { SKU, PackagingLayer } from "@/types/calculator";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import { money3, fmtWeightGrams } from "@/lib/calculator";

interface PackagingTabProps {
  skus: SKU[];
  unitSystem: 'mg' | 'oz';
  skuPackagingCosts: { skuId: string; skuName: string; packagingCosts: { id: string; name: string; costPerPack: number }[]; totalCostPerPack: number; totalWeightPerPack: number }[];
  totalPackagingCostPerPack: number;
  totalPackagingWeightPerPack: number;
  totalUnitWeightPerPack: number;
  addLayer: (skuId: string) => void;
  updateLayer: (skuId: string, layerId: string, patch: Partial<PackagingLayer>) => void;
  removeLayer: (skuId: string, layerId: string) => void;
}

export function PackagingTab({
  skus,
  unitSystem,
  skuPackagingCosts,
  totalPackagingCostPerPack,
  totalPackagingWeightPerPack,
  totalUnitWeightPerPack,
  addLayer,
  updateLayer,
  removeLayer,
}: PackagingTabProps) {
  const [selectedSkuId, setSelectedSkuId] = useState(skus[0]?.id ?? "");
  const selectedSku = skus.find((s) => s.id === selectedSkuId);
  const selectedPkgCosts = skuPackagingCosts.find((p) => p.skuId === selectedSkuId);

  return (
    <div className="space-y-6">
      {/* SKU Selector */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Packaging by SKU
                <InfoTooltip text="Each SKU can have its own unique packaging configuration. Select an SKU to edit its packaging layers. Different products often need different containers, boxes, and shipping materials." label="Per-SKU Packaging" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Each SKU has its own packaging. Select an SKU to edit its layers.</p>
          </div>
          <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
            <SelectTrigger className="w-48 h-8">
              <SelectValue placeholder="Select SKU" />
            </SelectTrigger>
            <SelectContent>
              {skus.map((sku) => (
                <SelectItem key={sku.id} value={sku.id}>{sku.name} ({sku.unitsPerPack} units/pack)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        {selectedSku && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Editing packaging for <strong>{selectedSku.name}</strong> · {selectedSku.unitsPerPack} units per pack
              </div>
              <Button size="sm" variant="outline" onClick={() => addLayer(selectedSku.id)}>
                <Plus className="h-4 w-4 mr-1" /> Add Layer
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center text-xs text-muted-foreground px-1">
              <span>Layer Name</span>
              <span>Cost / Unit</span>
              <span>Units / Layer</span>
              <span>Weight (g)</span>
              <span>Include</span>
              <span></span>
            </div>
            {selectedSku.packaging.map((layer) => (
              <div key={layer.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center">
                <Input placeholder="Layer name" value={layer.name}
                  onChange={(e) => updateLayer(selectedSku.id, layer.id, { name: e.target.value })} className="h-8" />
                <Input type="number" step="0.01" min={0} value={layer.costPerUnit}
                  onChange={(e) => updateLayer(selectedSku.id, layer.id, { costPerUnit: Number(e.target.value) })} className="h-8 w-24" />
                <Input type="number" min={1} value={layer.unitsPerLayer}
                  onChange={(e) => updateLayer(selectedSku.id, layer.id, { unitsPerLayer: Math.max(1, Number(e.target.value)) })} className="h-8 w-24" />
                <Input type="number" step="0.1" min={0} value={layer.weightPerUnit}
                  onChange={(e) => updateLayer(selectedSku.id, layer.id, { weightPerUnit: Math.max(0, Number(e.target.value)) })} className="h-8 w-24" title="Weight in grams per unit" />
                <Checkbox checked={layer.included}
                  onCheckedChange={(v) => updateLayer(selectedSku.id, layer.id, { included: !!v })} />
                <Button size="sm" variant="ghost" className="text-destructive h-8"
                  onClick={() => removeLayer(selectedSku.id, layer.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Per-SKU totals */}
            {selectedPkgCosts && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t">
                <FormulaTooltip
                  label={`${selectedSku.name} Packaging Cost / Pack`}
                  formula={`Total packaging cost for ${selectedSku.name} = ${money3(selectedPkgCosts.totalCostPerPack)}`}
                >
                  <Card className="cursor-help bg-muted/30">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground">Packaging Cost / Pack</div>
                      <div className="text-lg font-bold tabular-nums">{money3(selectedPkgCosts.totalCostPerPack)}</div>
                    </CardContent>
                  </Card>
                </FormulaTooltip>
                <FormulaTooltip
                  label={`${selectedSku.name} Packaging Weight / Pack`}
                  formula={`Total packaging weight for ${selectedSku.name} = ${fmtWeightGrams(selectedPkgCosts.totalWeightPerPack, unitSystem)}`}
                >
                  <Card className="cursor-help bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground">Packaging Weight / Pack</div>
                      <div className="text-lg font-bold tabular-nums">{fmtWeightGrams(selectedPkgCosts.totalWeightPerPack, unitSystem)}</div>
                    </CardContent>
                  </Card>
                </FormulaTooltip>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* All SKUs Overview */}
      {skuPackagingCosts.length > 1 && (
        <Card>
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-base">
                Packaging Comparison Across SKUs
                <InfoTooltip text="This table compares packaging costs and weights for all SKUs in your order, so you can see how different products contribute to overall packaging expenses." label="SKU Comparison" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {skuPackagingCosts.map((spc) => (
                <Card key={spc.skuId} className={spc.skuId === selectedSkuId ? "border-primary" : ""}>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground font-medium">{spc.skuName}</div>
                    <div className="text-lg font-bold tabular-nums">{money3(spc.totalCostPerPack)}</div>
                    <div className="text-xs text-muted-foreground">{fmtWeightGrams(spc.totalWeightPerPack, unitSystem)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weight Summary */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-base">
              Weight Summary (Weighted Average)
              <InfoTooltip text="These are weighted-average weights across all SKUs based on your order composition. The total unit weight combines ingredient weight and packaging weight per pack." label="Weight Summary" />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FormulaTooltip
              label="Packaging Weight / Pack"
              formula={`Weighted average packaging weight = ${fmtWeightGrams(totalPackagingWeightPerPack, unitSystem)}`}
            >
              <Card className="cursor-help bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Packaging Weight / Pack</div>
                  <div className="text-xl font-bold tabular-nums">{fmtWeightGrams(totalPackagingWeightPerPack, unitSystem)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>

            <FormulaTooltip
              label="Total Packaging Cost / Pack"
              formula={`Weighted average packaging cost = ${money3(totalPackagingCostPerPack)}`}
            >
              <Card className="cursor-help bg-muted/30">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Packaging Cost / Pack</div>
                  <div className="text-xl font-bold tabular-nums">{money3(totalPackagingCostPerPack)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>

            <FormulaTooltip
              label="Total Unit Weight / Pack"
              formula={`Ingredient weight + Packaging weight = ${fmtWeightGrams(totalUnitWeightPerPack, unitSystem)}`}
            >
              <Card className="cursor-help bg-primary/10">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Total Unit Weight / Pack</div>
                  <div className="text-xl font-bold tabular-nums">{fmtWeightGrams(totalUnitWeightPerPack, unitSystem)}</div>
                </CardContent>
              </Card>
            </FormulaTooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
