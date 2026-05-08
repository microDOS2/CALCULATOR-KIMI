import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { CalculationResult } from "@/types/calculator";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import { money, money3 } from "@/lib/calculator";

interface POTabProps {
  result: CalculationResult;
}

export function POTab({ result }: POTabProps) {
  const { poLineItems, poGrandTotals, ohTotal, ohPerPackR, ohPerPackW, ohPerPackD } = result;
  const [showOverhead, setShowOverhead] = useState(false);

  if (!poLineItems.length) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Purchase Order Analysis
                <InfoTooltip text="Purchase Order (PO) Analysis shows the profitability of a specific order based on your Order Composition quantities. It breaks down profit by channel for each SKU line item and calculates the total gross profit of the order. Toggle 'Include Overhead' to see operating profit after overhead allocation." label="Purchase Order" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Auto</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Add order quantities in the Product tab to see PO analysis.</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          Add quantities to the Order Composition to see Purchase Order analysis.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <Card className="border-l-4 border-l-amber-500 shadow-md bg-gradient-to-br from-white to-amber-50/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                Overhead Allocation View
                <InfoTooltip text="Toggle to show operating profit (gross profit minus overhead) instead of gross profit alone. When ON, each channel's profit is reduced by its proportional overhead share. This shows true profitability after accounting for fixed operational costs." label="Overhead Toggle" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {showOverhead
                  ? "Showing OPERATING PROFIT (GP - Overhead). True profitability."
                  : "Showing GROSS PROFIT only (no overhead). Revenue minus COGS and shipping."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">GP Only</span>
              <Switch checked={showOverhead} onCheckedChange={setShowOverhead} />
              <span className="text-xs font-medium">Include Overhead</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overhead Rate Card (visible when toggle is on) */}
      {showOverhead && (
        <Card className="border-l-4 border-l-rose-500 shadow-md bg-gradient-to-br from-white to-rose-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Overhead Rates per Pack
              <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300 text-[10px]">ALLOCATED</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-indigo-700">{money(ohPerPackR)}</p>
                <p className="text-[10px] text-muted-foreground">Retail / pack</p>
              </div>
              <div>
                <p className="text-lg font-bold text-teal-700">{money(ohPerPackW)}</p>
                <p className="text-[10px] text-muted-foreground">Wholesale / pack</p>
              </div>
              <div>
                <p className="text-lg font-bold text-teal-700">{money(ohPerPackD)}</p>
                <p className="text-[10px] text-muted-foreground">Distributor / pack</p>
              </div>
              <div>
                <p className="text-lg font-bold text-rose-700">{money(ohTotal)}</p>
                <p className="text-[10px] text-muted-foreground">Total Monthly OH</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Purchase Order Line Items
                <InfoTooltip text="Each line item shows one SKU in your order. Toggle overhead above to switch between Gross Profit (no overhead) and Operating Profit (with overhead)." label="PO Line Items" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Auto-calculated</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {showOverhead
                ? "Operating Profit by channel (GP - Overhead allocation) for each SKU."
                : "Gross Profit by channel (Revenue - COGS - Shipping) for each SKU."}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Total Qty</TableHead>
                  <TableHead className="text-right">
                    {showOverhead ? "Retail Op. Profit" : "Retail Profit"}
                  </TableHead>
                  <TableHead className="text-right">
                    {showOverhead ? "Wholesale Op. Profit" : "Wholesale Profit"}
                  </TableHead>
                  <TableHead className="text-right">
                    {showOverhead ? "Distributor Op. Profit" : "Distributor Profit"}
                  </TableHead>
                  {showOverhead && (
                    <>
                      <TableHead className="text-right text-rose-600">OH Allocation</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">
                    {showOverhead ? "Total Op. Profit" : "Total GP"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poLineItems.map((item) => (
                  <TableRow key={item.skuId}>
                    <TableCell>{item.skuName}</TableCell>
                    <TableCell className="text-right">{item.totalQty.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {money(showOverhead ? item.retailOpProfit : item.retailProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {money(showOverhead ? item.wholesaleOpProfit : item.wholesaleProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {money(showOverhead ? item.distributorOpProfit : item.distributorProfit)}
                    </TableCell>
                    {showOverhead && (
                      <TableCell className="text-right text-rose-600 font-medium">
                        {money(item.totalOH)}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-bold">
                      {money(showOverhead ? item.totalOpProfit : item.totalProfit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell><strong>Grand Total</strong></TableCell>
                  <TableCell className="text-right"><strong>{poGrandTotals.totalQty.toLocaleString()}</strong></TableCell>
                  <TableCell className="text-right"><strong>{money(showOverhead ? poGrandTotals.retailOpProfit : poGrandTotals.retailProfit)}</strong></TableCell>
                  <TableCell className="text-right"><strong>{money(showOverhead ? poGrandTotals.wholesaleOpProfit : poGrandTotals.wholesaleProfit)}</strong></TableCell>
                  <TableCell className="text-right"><strong>{money(showOverhead ? poGrandTotals.distributorOpProfit : poGrandTotals.distributorProfit)}</strong></TableCell>
                  {showOverhead && (
                    <TableCell className="text-right text-rose-600 font-bold">
                      {money(poGrandTotals.totalOH)}
                    </TableCell>
                  )}
                  <TableCell className="text-right font-bold">
                    {money(showOverhead ? poGrandTotals.totalOpProfit : poGrandTotals.totalProfit)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <FormulaTooltip
          label={showOverhead ? "Total Operating Profit from Order" : "Total GP from Order"}
          formula={showOverhead
            ? `Order GP − OH Allocation = ${money(poGrandTotals.totalProfit)} − ${money(poGrandTotals.totalOH)} = ${money(poGrandTotals.totalOpProfit)}`
            : `Sum of all line item profits = ${money(poGrandTotals.totalProfit)}`}
        >
          <Card className="cursor-help border-l-2 border-l-green-500">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">
                {showOverhead ? "Total Operating Profit" : "Total GP from Order"}
              </div>
              <div className="text-xl font-bold tabular-nums">
                {money(showOverhead ? poGrandTotals.totalOpProfit : poGrandTotals.totalProfit)}
              </div>
            </CardContent>
          </Card>
        </FormulaTooltip>

        <FormulaTooltip
          label="Total Monthly Overhead"
          formula={`Sum of all overhead items = ${money(ohTotal)}`}
        >
          <Card className="cursor-help">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Total Monthly Overhead</div>
              <div className="text-xl font-bold tabular-nums">{money(ohTotal)}</div>
            </CardContent>
          </Card>
        </FormulaTooltip>

        {showOverhead ? (
          <FormulaTooltip
            label="OH Allocated to This Order"
            formula={`Proportional OH based on order volume = ${money(poGrandTotals.totalOH)}`}
          >
            <Card className="cursor-help border-l-2 border-l-rose-500">
              <CardContent className="p-3">
                <div className="text-xs text-rose-600 font-medium">OH Allocated to Order</div>
                <div className="text-xl font-bold tabular-nums text-rose-600">{money(poGrandTotals.totalOH)}</div>
              </CardContent>
            </Card>
          </FormulaTooltip>
        ) : (
          <FormulaTooltip
            label="Net Impact on Monthly Profit"
            formula={`Order GP − Overhead = ${money(poGrandTotals.totalProfit)} − ${money(ohTotal)} = ${money(poGrandTotals.totalProfit - ohTotal)}`}
          >
            <Card className="cursor-help">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Net Impact</div>
                <div className="text-xl font-bold tabular-nums">{money(poGrandTotals.totalProfit - ohTotal)}</div>
              </CardContent>
            </Card>
          </FormulaTooltip>
        )}

        <FormulaTooltip
          label="Avg Cost / Unit"
          formula={`Total COGS / Total Units = ${money(poGrandTotals.totalCOGS)} / ${poGrandTotals.totalUnits} = ${money3(poGrandTotals.avgCostPerUnit)}`}
        >
          <Card className="cursor-help">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Avg Cost / Unit</div>
              <div className="text-xl font-bold tabular-nums">{money3(poGrandTotals.avgCostPerUnit)}</div>
            </CardContent>
          </Card>
        </FormulaTooltip>

        <FormulaTooltip
          label="Avg Profit / Unit"
          formula={`Total ${showOverhead ? "Op. Profit" : "GP"} / Total Units = ${money(showOverhead ? poGrandTotals.totalOpProfit : poGrandTotals.totalProfit)} / ${poGrandTotals.totalUnits} = ${money3(showOverhead ? poGrandTotals.totalOpProfit / poGrandTotals.totalUnits : poGrandTotals.avgProfitPerUnit)}`}
        >
          <Card className="cursor-help">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">
                Avg {showOverhead ? "Op. Profit" : "Profit"} / Unit
              </div>
              <div className="text-xl font-bold tabular-nums">
                {money3(showOverhead ? poGrandTotals.totalOpProfit / poGrandTotals.totalUnits : poGrandTotals.avgProfitPerUnit)}
              </div>
            </CardContent>
          </Card>
        </FormulaTooltip>
      </div>
    </div>
  );
}
