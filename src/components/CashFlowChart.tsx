import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CashFlowResult } from "@/types/calculator";
import { money3 } from "@/lib/calculator";

interface CashFlowChartProps {
  cashFlow: CashFlowResult;
}

export function CashFlowChart({ cashFlow }: CashFlowChartProps) {
  const data = useMemo(() => {
    return cashFlow.months.map((m) => ({
      month: m.monthLabel,
      balance: m.endingBalance,
      inflow: m.cashIn,
      outflow: -m.cashOut,
      isNegative: m.endingBalance < 0,
    }));
  }, [cashFlow]);

  const maxVal = useMemo(() => Math.max(...data.map((d) => Math.abs(d.balance))), [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          12-Month Cash Balance
          <InfoTooltip text="Visual view of your ending cash balance each month. Red bars mean negative balance — you're spending more than you're earning. Green bars mean positive — you're accumulating cash. Watch for the dip pattern: if balance drops before recovering, that identifies your cash crunch period." label="Cash Balance Chart" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {data.map((d) => {
            const pct = Math.min(100, (Math.abs(d.balance) / (maxVal || 1)) * 100);
            return (
              <div key={d.month} className="grid grid-cols-[50px_1fr_60px] gap-2 items-center text-xs">
                <span className="text-muted-foreground">{d.month}</span>
                <div className="flex items-center">
                  <div
                    className={`h-5 rounded-sm ${d.balance >= 0 ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`tabular-nums text-right ${d.isNegative ? "text-red-600" : "text-green-600"}`}>
                  {money3(d.balance)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Positive</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Negative</span>
        </div>
      </CardContent>
    </Card>
  );
}
