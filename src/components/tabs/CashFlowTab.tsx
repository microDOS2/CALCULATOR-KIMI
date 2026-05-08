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
import { Landmark, HardHat, Plus, Trash2, Wallet, Clock, Truck, UserCog, AlertCircle } from "lucide-react";

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

  const noChannels = !state.includeR && !state.includeW && !state.includeD;

  return (
    <div className="space-y-6">
      {/* Empty state: no channels */}
      {noChannels && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-amber-800 text-sm">No Revenue — No Cash In</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  All sales channels are off. Cash flow projections require at least one enabled channel.
                  Go to the Channels tab and check Retail, Wholesale, or Distributor to begin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Cash Flow Settings */}
      <div className="flex items-center gap-2 py-1">
        <div className="h-0.5 flex-1 bg-gradient-to-r from-teal-300 via-orange-300 to-transparent" />
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-100 px-2 py-0.5 rounded">Cash Flow Tools</span>
        <div className="h-0.5 flex-1 bg-gradient-to-l from-orange-300 via-teal-300 to-transparent" />
      </div>

      <Card className="border-dashed border-2 bg-gradient-to-br from-teal-100 via-teal-50 to-white dark:from-teal-900/30 dark:via-teal-950/20 dark:to-transparent shadow-md border-l-4 border-l-teal-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wallet className="h-5 w-5 text-teal-500" />
            Cash Flow Settings
            <span className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Tool</span>
            <InfoTooltip
              text="These settings control the timing of all cash movements. Starting cash is your opening bank balance. Lead time is days from PO to delivery. Payment terms are days from sale to cash collection. Together they determine whether you have enough cash to operate."
              label="Cash Flow Settings"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Wallet className="h-3 w-3 text-teal-500" />
                Starting Cash ($)
                <InfoTooltip text="Your bank balance at the start of the forecast period. This is the foundation all cash flows build on." label="Starting Cash" />
              </Label>
              <Input
                type="number"
                value={state.startingCashBalance}
                onChange={(e) => updateState({ startingCashBalance: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-teal-500" />
                Lead Time (days)
                <InfoTooltip text="Days from placing a purchase order with your supplier to receiving the goods. Affects when COGS cash outflow happens." label="Lead Time" />
              </Label>
              <Input
                type="number"
                value={state.inventoryLeadTimeDays}
                onChange={(e) => updateState({ inventoryLeadTimeDays: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Landmark className="h-3 w-3 text-teal-500" />
                Debt Service ($/mo)
                <InfoTooltip text="Fixed monthly loan or debt payments. Paid regardless of sales volume. Shown in the Debt Service card below for detail." label="Debt Service" />
              </Label>
              <Input
                type="number"
                value={state.debtServiceMonthly}
                onChange={(e) => updateState({ debtServiceMonthly: Math.max(0, Number(e.target.value)) })}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-teal-500" />
              Customer Payment Terms (days after sale)
              <InfoTooltip text="How many days after a sale before you collect cash from each channel. Retail = immediate (0 days). Wholesale typically NET 30. Distributor often NET 60 or 90. These delays directly affect your cash flow timing." label="Payment Terms" />
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Retail</Label>
                <Input
                  type="number"
                  value={state.customerPaymentTerms.retailDays}
                  onChange={(e) => updateState({ customerPaymentTerms: { ...state.customerPaymentTerms, retailDays: Number(e.target.value) } })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Wholesale</Label>
                <Input
                  type="number"
                  value={state.customerPaymentTerms.wholesaleDays}
                  onChange={(e) => updateState({ customerPaymentTerms: { ...state.customerPaymentTerms, wholesaleDays: Number(e.target.value) } })}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Distributor</Label>
                <Input
                  type="number"
                  value={state.customerPaymentTerms.distributorDays}
                  onChange={(e) => updateState({ customerPaymentTerms: { ...state.customerPaymentTerms, distributorDays: Number(e.target.value) } })}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Override Cost Summary */}
      {(result.overrides?.totalOverrideCost ?? 0) > 0 && (
        <Card className="border-dashed border-2 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white dark:from-emerald-900/30 dark:via-emerald-950/20 dark:to-transparent shadow-md border-l-4 border-l-emerald-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCog className="h-5 w-5 text-emerald-500" />
              Override Payouts
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Tool</span>
              <InfoTooltip
                text="Monthly override payments to named individuals. These are fixed percentage payouts based on selected channel revenue, separate from commissions and affiliate fees. Shown as a recurring cash outflow each month."
                label="Override Payouts"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {result.overrides?.entries.map((entry, i) => (
                <div key={i} className="bg-white/70 dark:bg-black/20 rounded-md p-2">
                  <p className="text-xs text-muted-foreground">{entry.name}</p>
                  <p className="text-sm font-bold text-amber-700">{money3(entry.amount)}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.percentage}% of {entry.channels.join(", ")}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1 border-t">
              <span className="text-xs text-muted-foreground">Total monthly override payout</span>
              <span className="text-sm font-bold text-amber-700">{money3(result.overrides?.totalOverrideCost ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capital Expenditures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-dashed border-2 bg-gradient-to-br from-orange-100 via-orange-50 to-white dark:from-orange-900/30 dark:via-orange-950/20 dark:to-transparent shadow-md border-l-4 border-l-orange-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardHat className="h-5 w-5 text-orange-500" />
              Capital Expenditures
              <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Tool</span>
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
        <Card className="border-dashed border-2 bg-gradient-to-br from-orange-100 via-orange-50 to-white dark:from-orange-900/30 dark:via-orange-950/20 dark:to-transparent shadow-md border-l-4 border-l-orange-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Landmark className="h-5 w-5 text-orange-500" />
              Debt Service
              <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Tool</span>
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
                      <InfoTooltip text="All cash paid this period: COGS (after lead time + supplier terms), overhead, commissions, marketing, shipping employees, debt, and capital expenditures." label="Cash Out" />
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
                        <TableHead className="text-right text-xs">Commissions</TableHead>
                        <TableHead className="text-right text-xs">Marketing</TableHead>
                        <TableHead className="text-right text-xs">Ship Labor</TableHead>
                        <TableHead className="text-right text-xs">Ship Materials</TableHead>
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
                            <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).commissionsPaid)}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).marketingSalaryTotal + (row as any).marketingExpenseTotal)}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).shippingSalaryTotal + (row as any).shippingBonusTotal)}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{money((row as any).shippingMaterialsTotal)}</TableCell>
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
                              <div><span className="text-muted-foreground">Comm:</span> {money((row as any).commissionsPaid)}</div>
                              <div><span className="text-muted-foreground">Mktg:</span> {money((row as any).marketingSalaryTotal + (row as any).marketingExpenseTotal)}</div>
                              <div><span className="text-muted-foreground">Ship L:</span> {money((row as any).shippingSalaryTotal + (row as any).shippingBonusTotal)}</div>
                              <div><span className="text-muted-foreground">Ship M:</span> {money((row as any).shippingMaterialsTotal)}</div>
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
