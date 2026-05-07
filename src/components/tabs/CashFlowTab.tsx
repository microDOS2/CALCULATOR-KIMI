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
import { DesktopTable, MobileOnly } from "@/components/ResponsiveTable";

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
            <DesktopTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isWeekly ? "Week" : "Month"}</TableHead>
                    <TableHead className="text-right">
                      Starting
                      <InfoTooltip text="Bank balance at the start of this period. Carried forward from the previous period's ending balance." label="Starting Balance" />
                    </TableHead>
                    <TableHead className="text-right text-green-600">
                      Cash In
                      <InfoTooltip text="All cash received this period: revenue from sales (after payment term delays) plus subscription payments." label="Cash In" />
                    </TableHead>
                    <TableHead className="text-right text-red-500">
                      Cash Out
                      <InfoTooltip text="All cash paid this period: COGS (after lead time + supplier terms), overhead, debt, commissions, and capital expenditures." label="Cash Out" />
                    </TableHead>
                    <TableHead className="text-right">
                      Net
                      <InfoTooltip text="Net cash flow = Cash In minus Cash Out. Positive means more money came in than went out." label="Net Cash Flow" />
                    </TableHead>
                    <TableHead className="text-right">
                      Ending
                      <InfoTooltip text="Bank balance at end of this period = Starting + Net. Rolls forward as next period's starting balance." label="Ending Balance" />
                    </TableHead>
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
            </DesktopTable>

            <MobileOnly>
              <div className="space-y-2">
                {(data as any[]).map((row, i) => {
                  const isNeg = row.endingBalance < 0;
                  const label = (row as any).monthLabel ?? `W${(row as any).week}`;
                  return (
                    <Card key={i} className={`border-l-4 ${isNeg ? "border-l-red-400" : "border-l-primary"}`}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{label}</span>
                          <span className={`text-xs font-medium ${isNeg ? "text-red-600" : "text-green-600"}`}>
                            End: {money(row.endingBalance)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                          <div><span className="text-muted-foreground">Start:</span> {money(row.startingBalance)}</div>
                          <div><span className="text-green-600">In:</span> {money(row.cashIn)}</div>
                          <div><span className="text-red-500">Out:</span> {money(row.cashOut)}</div>
                          <div><span className="font-medium">Net:</span> {money(row.netCashFlow)}</div>
                          {!isWeekly && (
                            <>
                              <div><span className="text-muted-foreground">Rev:</span> {money((row as any).revenueCollected)}</div>
                              <div><span className="text-muted-foreground">COGS:</span> {money((row as any).cogsPaid)}</div>
                              <div><span className="text-muted-foreground">OH:</span> {money((row as any).overheadPaid)}</div>
                              <div><span className="text-muted-foreground">Debt/ CapEx:</span> {money((row as any).debtServicePaid + (row as any).capexPaid)}</div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </MobileOnly>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
