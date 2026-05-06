import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { SKU } from "@/types/calculator";
import { TipBadge } from "@/components/Tooltip";

interface ProductSpecsProps {
  skus: SKU[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<SKU>) => void;
}

function enforceMix(
  key: "mixR" | "mixW" | "mixD",
  value: number,
  sku: SKU
): Partial<SKU> {
  const clamped = Math.max(0, Math.min(100, value));
  const others: ("mixR" | "mixW" | "mixD")[] = ["mixR", "mixW", "mixD"].filter(
    (k) => k !== key
  ) as ("mixR" | "mixW" | "mixD")[];

  const rem = 100 - clamped;
  const currentOtherTotal = others.reduce((sum, k) => sum + (sku[k] || 0), 0);

  let result: Partial<SKU> = { [key]: clamped };

  if (currentOtherTotal === 0) {
    const split = rem / others.length;
    others.forEach((k) => (result[k] = Math.round(split * 10) / 10));
  } else {
    const factor = rem / currentOtherTotal;
    others.forEach(
      (k) => (result[k] = Math.round((sku[k] || 0) * factor * 10) / 10)
    );
  }

  // Fix rounding drift
  const finalTotal =
    (result.mixR ?? sku.mixR) +
    (result.mixW ?? sku.mixW) +
    (result.mixD ?? sku.mixD);
  const diff = Math.round((100 - finalTotal) * 10) / 10;
  if (diff !== 0 && others.length > 0) {
    const first = others[0];
    result[first] = Math.round(((result[first] ?? sku[first]) + diff) * 10) / 10;
  }

  return result;
}

export function ProductSpecs({ skus, onAdd, onRemove, onUpdate }: ProductSpecsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Product Specifications
          <TipBadge tip="Define your product SKUs here. All calculations below are based on the weighted average of the SKUs in the Order Composition." />
        </h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add SKU
        </Button>
      </div>

      <div className="space-y-3">
        {skus.map((sku) => (
          <Card key={sku.id}>
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">SKU Name</Label>
                <Input
                  value={sku.name}
                  onChange={(e) => onUpdate(sku.id, { name: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Units / Pack <TipBadge tip="Number of units (e.g., pills, items) in each retail pack." />
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={sku.unitsPerPack}
                  onChange={(e) =>
                    onUpdate(sku.id, { unitsPerPack: Math.max(1, Number(e.target.value)) })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Retail Price <TipBadge tip="Final consumer price for one pack." />
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={sku.retailPrice}
                  onChange={(e) =>
                    onUpdate(sku.id, { retailPrice: Number(e.target.value) })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Inner Pkg Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={sku.innerPkgCost}
                  onChange={(e) =>
                    onUpdate(sku.id, { innerPkgCost: Number(e.target.value) })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Outer Box Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={sku.outerBoxCost}
                  onChange={(e) =>
                    onUpdate(sku.id, { outerBoxCost: Number(e.target.value) })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Display Box Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={sku.displayBoxCost}
                  onChange={(e) =>
                    onUpdate(sku.id, { displayBoxCost: Number(e.target.value) })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Units / Display</Label>
                <Input
                  type="number"
                  min={1}
                  value={sku.unitsPerDisplay}
                  onChange={(e) =>
                    onUpdate(sku.id, {
                      unitsPerDisplay: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Shipping Box Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={sku.shippingBoxCost}
                  onChange={(e) =>
                    onUpdate(sku.id, { shippingBoxCost: Number(e.target.value) })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Units / Ship Box</Label>
                <Input
                  type="number"
                  min={1}
                  value={sku.unitsPerShipBox}
                  onChange={(e) =>
                    onUpdate(sku.id, {
                      unitsPerShipBox: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="h-8"
                />
              </div>
              <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    % Retail <TipBadge tip="Percentage of this SKU sold through Retail." />
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={sku.mixR}
                    onChange={(e) =>
                      onUpdate(
                        sku.id,
                        enforceMix("mixR", Number(e.target.value), sku)
                      )
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">% Wholesale</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={sku.mixW}
                    onChange={(e) =>
                      onUpdate(
                        sku.id,
                        enforceMix("mixW", Number(e.target.value), sku)
                      )
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">% Distributor</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={sku.mixD}
                    onChange={(e) =>
                      onUpdate(
                        sku.id,
                        enforceMix("mixD", Number(e.target.value), sku)
                      )
                    }
                    className="h-8"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => onRemove(sku.id)}
                  disabled={skus.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
