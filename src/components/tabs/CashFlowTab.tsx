import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money3, money } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { CashFlowChart } from "@/components/CashFlowChart";
import { DesktopTable, MobileOnly } from "@/components/ResponsiveTable";
import { Input } from "@/components/ui/input";
import { Landmark, HardHat, Plus, Trash2 } from "lucide-react";

interface CashFlowTabProps {
  state: CalculatorState;
  result: CalculationResult;
  isWeekly: boolean;
  onToggleWeekly: () => void;
  updateState: (patch: Partial<CalculatorState>) => void;
}

export function CashFlowTab({ state, result, isWeekly, onToggleWeekly, updateState }: CashFlowTabProps) {
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

      {/* Capital Expenditures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-dashed border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              Capital Expenditures
              <InfoTooltip
                text="One-time investments (equipment, vehicles, facility improvements) by month. These appear as cash outflows in the respective month. Use this to model major purchases that affect your cash position."
                label="Capital Expenditures"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {state.capitalExpenditures.length === 0 && (
              <div className="text-xs text-amber-600 bg-amber-50 rounded-md p-2.5 flex items-start gap-2">
                <Landmark className="h-4 w-4 shrink-0 mt-0.5" />
                <span>No CapEx items yet. Add equipment, vehicles, or facility investments to model their cash impact.</span>
              </div>
            )}
            {state.capitalExpenditures.map((capex, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">Name</Label>
                  <Input
                    className="h-7 text-xs"
                    value={capex.name}
                    onChange={(e) => {
                      const updated = [...state.capitalExpenditures];
                      updated[idx] = { ...capex, name: e.target.value };
                      updateState({ capitalExpenditures: updated });
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">Amount ($)</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={capex.amount}
                    onChange={(e) => {
                      const updated = [...state.capitalExpenditures];
                      updated[idx] = { ...capex, amount: Number(e.target.value) };
                      updateState({ capitalExpenditures: updated });
                    }}
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">Month</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      className="h-7 text-xs w-14"
                      value={capex.month}
                      onChange={(e) => {
                        const updated = [...state.capitalExpenditures];
                        updated[idx] = { ...capex, month: Math.max(1, Math.min(12, Number(e.target.value))) };
                        updateState({ capitalExpenditures: updated });
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive h-7 w-7 p-0"
                      onClick={() => {
                        const updated = state.capitalExpenditures.filter((_, i) => i !== idx);
                        updateState({ capitalExpenditures: updated });
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs w-full"
              onClick={() => {
                updateState({
                  capitalExpenditures: [...state.capitalExpenditures, { id: `capex-${Date.now()}`, name: "", amount: 0, month: 1 }],
                });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add CapEx Item
            </Button>
          </CardContent>
        </Card>

        {/* Debt Service */}
        <Card className="border-dashed border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Debt Service
              <InfoTooltip
                text="Fixed monthly loan or debt payments that reduce your cash balance. Enter the total monthly payment across all loans. This is treated as a recurring cash outflow every month."
                label="Debt Service"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Monthly Debt Payment ($)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  className="w-36 h-7"
                  value={state.debtServiceMonthly}
                  onChange={(e) => updateState({ debtServiceMonthly: Math.max(0, Number(e.target.value)) })}
                />
                {state.debtServiceMonthly > 0 && (
                  <span className="text-xs text-green-600">
                    {money3(state.debtServiceMonthly)}/mo in cash flow
                  </span>
                )}
              </div>
            </div>
            {state.debtServiceMonthly === 0 && (
              <div className="text-xs text-amber-600 bg-amber-50 rounded-md p-2.5 flex items-start gap-2">
                <Landmark className="h-4 w-4 shrink-0 mt-0.5" />
                <span>No debt service set. If you have monthly loan payments, enter the amount to see their impact on cash flow.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <CashFlowChart cashFlow={cf} />

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
