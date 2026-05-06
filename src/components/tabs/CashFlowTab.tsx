import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import type { CalculationResult } from "@/types/calculator";
import { money3, money } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";
import { FormulaTooltip } from "@/components/FormulaTooltip";

interface CashFlowTabProps {
  result: CalculationResult;
  isWeekly: boolean;
  onToggleWeekly: () => void;
}

export function CashFlowTab({ result, isWeekly, onToggleWeekly }: CashFlowTabProps) {
  const cf = result.cashFlow;
  if (!cf || cf.months.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Cash Flow data not available. Ensure starting cash and payment terms are set.
        </CardContent>
      </Card>
    );
  }

  const data = isWeekly && cf.weekly ? cf.weekly : cf.months;

  const sparklineData = cf.months.map((m) => ({
    label: m.monthLabel,
    balance: m.endingBalance,
    inflow: m.cashIn,
    outflow: m.cashOut,
  }));

  return (
    <div className="space-y-6">
      {/* Alert Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FormulaTooltip label="Starting Cash" formula={`Initial bank balance = ${money3(cf.startingCash)}`}>
          <Card className="cursor-help bg-primary/5">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Starting Cash</div>
              <div className="text-xl font-bold tabular-nums">{money3(cf.startingCash)}</div>
            </CardContent>
          </Card>
        </FormulaTooltip>

        <FormulaTooltip label="Lowest Balance" formula={`Deepest cash trough = ${money3(cf.lowestBalance)} in month ${cf.lowestBalanceMonth}`}>
          <Card className={`cursor-help ${cf.lowestBalance < 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"}`}>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Lowest Balance</div>
              <div className="text-xl font-bold tabular-nums">{money3(cf.lowestBalance)}</div>
              <div className="text-xs text-muted-foreground">Month {cf.lowestBalanceMonth}</div>
            </CardContent>
          </Card>
        </FormulaTooltip>

        <FormulaTooltip label="Cash Breakeven" formula={`First month ending balance stays positive = ${cf.cashBreakevenMonth ?? "N/A"}`}>
          <Card className="cursor-help bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Cash Breakeven</div>
              <div className="text-xl font-bold tabular-nums">{cf.cashBreakevenMonth ? `Mo ${cf.cashBreakevenMonth}` : "N/A"}</div>
            </CardContent>
          </Card>
        </FormulaTooltip>

        <FormulaTooltip label="12-Month Net Flow" formula={`Total in - Total out = ${money3(cf.totalNetFlow)}`}>
          <Card className={`cursor-help ${cf.totalNetFlow >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">12-Mo Net Flow</div>
              <div className="text-xl font-bold tabular-nums">{money3(cf.totalNetFlow)}</div>
            </CardContent>
          </Card>
        </FormulaTooltip>
      </div>

      {/* Sparkline Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Cash Balance Over Time
            <InfoTooltip text="Shows your bank balance at the end of each month. The lowest point is your cash trough — the moment you need the most capital. Positive means you have cash; negative means you're in the red." label="Cash Balance" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32 px-2">
            {sparklineData.map((d, i) => {
              const min = Math.min(...sparklineData.map((x) => x.balance), 0);
              const max = Math.max(...sparklineData.map((x) => x.balance), 1);
              const range = max - min;
              const heightPct = range > 0 ? ((d.balance - min) / range) * 100 : 50;
              const isNegative = d.balance < 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${isNegative ? "bg-red-400" : "bg-primary"}`}
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                    title={`${d.label}: ${money3(d.balance)}`}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Toggle */}
      <div className="flex items-center justify-end gap-2">
        <Label className="text-sm text-muted-foreground">View:</Label>
        <Button size="sm" variant={!isWeekly ? "default" : "outline"} onClick={() => isWeekly && onToggleWeekly()}>
          Monthly
        </Button>
        <Button size="sm" variant={isWeekly ? "default" : "outline"} onClick={() => !isWeekly && onToggleWeekly()}>
          Weekly
        </Button>
      </div>

      {/* Cash Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isWeekly ? "Weekly Cash Flow" : "Monthly Cash Flow"}
            <InfoTooltip text="Tracks cash in (revenue collected, subscriptions) and cash out (COGS, overhead, debt, CapEx) over time. Ending balance rolls forward as the next period's starting balance." label="Cash Flow" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isWeekly ? "Week" : "Month"}</TableHead>
                  <TableHead className="text-right">Starting</TableHead>
                  <TableHead className="text-right text-green-600">Cash In</TableHead>
                  <TableHead className="text-right text-red-500">Cash Out</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-right">Ending</TableHead>
                  {!isWeekly && (
                    <>
                      <TableHead className="text-right text-xs">Revenue</TableHead>
                      <TableHead className="text-right text-xs">COGS</TableHead>
                      <TableHead className="text-right text-xs">Overhead</TableHead>
                      <TableHead className="text-right text-xs">Debt/CapEx</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data as any[]).map((row, i) => {
                  const isNeg = row.endingBalance < 0;
                  return (
                    <TableRow key={i} className={isNeg ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                      <TableCell className="font-medium">
                        {(row as any).monthLabel ?? `W${(row as any).week}`}
                      </TableCell>
                      <TableCell className="text-right">{money(row.startingBalance)}</TableCell>
                      <TableCell className="text-right text-green-600">{money(row.cashIn)}</TableCell>
                      <TableCell className="text-right text-red-500">{money(row.cashOut)}</TableCell>
                      <TableCell className={`text-right font-medium ${row.netCashFlow >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {money(row.netCashFlow)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${isNeg ? "text-red-600" : ""}`}>
                        {money(row.endingBalance)}
                      </TableCell>
                      {!isWeekly && (
                        <>
                          <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).revenueCollected)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).cogsPaid)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).overheadPaid)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).debtServicePaid + (row as any).capexPaid)}</TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
