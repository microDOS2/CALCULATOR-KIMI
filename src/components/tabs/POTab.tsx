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
import type { CalculationResult } from "@/types/calculator";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import { money, money3 } from "@/lib/calculator";

interface POTabProps {
  result: CalculationResult;
}

export function POTab({ result }: POTabProps) {
  const { poLineItems, poGrandTotals, ohTotal } = result;

  if (!poLineItems.length) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Purchase Order Analysis
                <InfoTooltip text="Purchase Order (PO) Analysis shows the profitability of a specific order based on your Order Composition quantities. It breaks down profit by channel for each SKU line item and calculates the total gross profit of the order. Compare this to your monthly overhead to see if the order is profitable overall." label="Purchase Order" />
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
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Purchase Order Line Items
                <InfoTooltip text="Each line item shows one SKU in your order. For each SKU, you see the total quantity ordered and the gross profit if sold through each channel (Retail, Wholesale, Distributor). The Total GP column sums all channels. This lets you see which SKUs and channels contribute most to order profitability." label="PO Line Items" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Auto-calculated</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Profit by channel for each SKU in your order. Based on Order Composition inputs.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Total Qty</TableHead>
                  <TableHead className="text-right">Retail Profit</TableHead>
                  <TableHead className="text-right">Wholesale Profit</TableHead>
                  <TableHead className="text-right">Distributor Profit</TableHead>
                  <TableHead className="text-right">Total GP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poLineItems.map((item) => (
                  <TableRow key={item.skuId}>
                    <TableCell>{item.skuName}</TableCell>
                    <TableCell className="text-right">{item.totalQty.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{money(item.retailProfit)}</TableCell>
                    <TableCell className="text-right">{money(item.wholesaleProfit)}</TableCell>
                    <TableCell className="text-right">{money(item.distributorProfit)}</TableCell>
                    <TableCell className="text-right font-medium">{money(item.totalProfit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell><strong>Grand Total</strong></TableCell>
                  <TableCell className="text-right"><strong>{poGrandTotals.totalQty.toLocaleString()}</strong></TableCell>
                  <TableCell className="text-right"><strong>{money(poGrandTotals.retailProfit)}</strong></TableCell>
                  <TableCell className="text-right"><strong>{money(poGrandTotals.wholesaleProfit)}</strong></TableCell>
                  <TableCell className="text-right"><strong>{money(poGrandTotals.distributorProfit)}</strong></TableCell>
                  <TableCell className="text-right"><strong>{money(poGrandTotals.totalProfit)}</strong></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <FormulaTooltip
          label="Total GP from Order"
          formula={`Sum of all line item profits = ${money(poGrandTotals.totalProfit)}`}
        >
          <Card className="cursor-help">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Total GP from Order</div>
              <div className="text-xl font-bold tabular-nums">{money(poGrandTotals.totalProfit)}</div>
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
          formula={`Total Profit / Total Units = ${money(poGrandTotals.totalProfit)} / ${poGrandTotals.totalUnits} = ${money3(poGrandTotals.avgProfitPerUnit)}`}
        >
          <Card className="cursor-help">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">Avg Profit / Unit</div>
              <div className="text-xl font-bold tabular-nums">{money3(poGrandTotals.avgProfitPerUnit)}</div>
            </CardContent>
          </Card>
        </FormulaTooltip>
      </div>
    </div>
  );
}
