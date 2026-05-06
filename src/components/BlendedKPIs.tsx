import { Card, CardContent } from "@/components/ui/card";
import type { CalculationResult } from "@/types/calculator";
import { TipBadge } from "@/components/Tooltip";
import { money3, pct } from "@/lib/calculator";

interface BlendedKPIsProps {
  result: CalculationResult;
}

export function BlendedKPIs({ result }: BlendedKPIsProps) {
  const hasOrder = result.totalPacks > 0;

  if (!hasOrder) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Blended Key Performance Indicators</h2>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Add quantities to the Order Composition to calculate Blended KPIs.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Blended Key Performance Indicators</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Revenue / Pack <TipBadge tip="Average revenue per pack across all channels." />
            </div>
            <div className="text-xl font-bold tabular-nums">{money3(result.brev)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Gross Profit / Pack <TipBadge tip="Average gross profit per pack." />
            </div>
            <div className="text-xl font-bold tabular-nums">{money3(result.bgpp)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Gross Margin <TipBadge tip="Blended gross margin percentage." />
            </div>
            <div className="text-xl font-bold tabular-nums">{pct(result.bgmp)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Overhead / Pack <TipBadge tip="Monthly overhead allocated per pack." />
            </div>
            <div className="text-xl font-bold tabular-nums">{money3(result.ohPerPack)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Operating Profit / Pack <TipBadge tip="Average operating profit after overhead." />
            </div>
            <div className="text-xl font-bold tabular-nums">{money3(result.bopp)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Operating Margin <TipBadge tip="Blended operating margin percentage." />
            </div>
            <div className="text-xl font-bold tabular-nums">{pct(result.bomp)}</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
