import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { OverheadItem, MonthlyVolume, CalculationResult } from "@/types/calculator";
import { TipBadge } from "@/components/Tooltip";
import { money, money3 } from "@/lib/calculator";

interface MonthlyCostsProps {
  overhead: OverheadItem[];
  monthlyVolumes: MonthlyVolume[];
  result: CalculationResult;
  ohR: boolean;
  ohW: boolean;
  ohD: boolean;
  includeThirdParty: boolean;
  thirdPartyTotal: number;
  skus: { id: string; name: string }[];
  onAddOverhead: () => void;
  onUpdateOverhead: (id: string, patch: Partial<OverheadItem>) => void;
  onRemoveOverhead: (id: string) => void;
  onUpdateVolume: (skuId: string, qty: number) => void;
  onUpdate: (patch: Record<string, unknown>) => void;
}

export function MonthlyCosts({
  overhead,
  monthlyVolumes,
  result,
  ohR,
  ohW,
  ohD,
  includeThirdParty,
  thirdPartyTotal,
  skus,
  onAddOverhead,
  onUpdateOverhead,
  onRemoveOverhead,
  onUpdateVolume,
  onUpdate,
}: MonthlyCostsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Monthly Costs (Operating Overhead)
          <TipBadge tip="Fixed monthly business costs allocated across your monthly pack volume." />
        </h2>
        <span className="text-sm font-medium">
          Total: {money(result.ohTotal)}
        </span>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-medium">Monthly Volume per SKU</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {skus.map((sku) => {
              const vol = monthlyVolumes.find((v) => v.skuId === sku.id);
              return (
                <div key={sku.id} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{sku.name}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={vol?.qty ?? 1000}
                    onChange={(e) =>
                      onUpdateVolume(sku.id, Math.max(0, Number(e.target.value)))
                    }
                    className="h-8"
                  />
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Total Monthly Volume</Label>
              <Input
                value={result.totalMonthlyVolume.toLocaleString()}
                readOnly
                className="h-8 bg-muted"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Overhead / Unit</Label>
              <Input
                value={money3(result.overheadPerUnit)}
                readOnly
                className="h-8 bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox
          checked={includeThirdParty}
          onCheckedChange={(v) => onUpdate({ includeThirdParty: !!v })}
        />
        Include Third Party Costs in Overhead
        {includeThirdParty && thirdPartyTotal > 0 && (
          <span className="text-xs text-muted-foreground ml-2">
            (+{money(thirdPartyTotal)})
          </span>
        )}
      </Label>

      <div className="space-y-2">
        {overhead.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              placeholder="Name"
              value={item.name}
              onChange={(e) => onUpdateOverhead(item.id, { name: e.target.value })}
              className="w-48 h-8"
            />
            <Input
              type="number"
              step="0.01"
              placeholder="$/month"
              value={item.cost}
              onChange={(e) =>
                onUpdateOverhead(item.id, { cost: Number(e.target.value) })
              }
              className="w-32 h-8"
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => onRemoveOverhead(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={onAddOverhead}>
          <Plus className="h-4 w-4 mr-1" />
          Add overhead item
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={ohR}
            onCheckedChange={(v) => onUpdate({ ohR: !!v })}
          />
          Include in Retail
        </Label>
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={ohW}
            onCheckedChange={(v) => onUpdate({ ohW: !!v })}
          />
          Include in Wholesale
        </Label>
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={ohD}
            onCheckedChange={(v) => onUpdate({ ohD: !!v })}
          />
          Include in Distributor
        </Label>
      </div>
    </section>
  );
}
