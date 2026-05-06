import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { CalculationResult } from "@/types/calculator";
import { TipBadge } from "@/components/Tooltip";
import { money } from "@/lib/calculator";

interface BreakEvenProps {
  result: CalculationResult;
  beIncludeOverhead: boolean;
  onUpdate: (patch: Record<string, unknown>) => void;
}

function formatBE(units: number, rev: number): string {
  if (!isFinite(units) || units <= 0) return "Unprofitable";
  return `${Math.ceil(units).toLocaleString()} packs · ${money(rev)}`;
}

export function BreakEven({ result, beIncludeOverhead, onUpdate }: BreakEvenProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        Break-Even Analysis
        <TipBadge tip="Packs needed to cover fixed costs. Uses contribution margin (gross profit before overhead allocation)." />
      </h2>

      <Label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox
          checked={beIncludeOverhead}
          onCheckedChange={(v) => onUpdate({ beIncludeOverhead: !!v })}
        />
        Include Monthly Overhead in Calculation
      </Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Retail Break-Even
              <TipBadge tip="Packs needed if selling only through Retail." />
            </div>
            <div className="text-lg font-bold tabular-nums">
              {formatBE(result.beUnitsR, result.beRevR)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Wholesale Break-Even
              <TipBadge tip="Packs needed if selling only through Wholesale." />
            </div>
            <div className="text-lg font-bold tabular-nums">
              {formatBE(result.beUnitsW, result.beRevW)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Distributor Break-Even
              <TipBadge tip="Packs needed if selling only through Distributor." />
            </div>
            <div className="text-lg font-bold tabular-nums">
              {formatBE(result.beUnitsD, result.beRevD)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Blended Break-Even
              <TipBadge tip="Packs needed for your actual blended channel mix." />
            </div>
            <div className="text-lg font-bold tabular-nums">
              {formatBE(result.beUnitsB, result.beRevB)}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
