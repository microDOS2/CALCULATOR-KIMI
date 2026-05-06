import { Card, CardContent } from "@/components/ui/card";
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
import { TipBadge } from "@/components/Tooltip";
import { money, money3 } from "@/lib/calculator";

interface PurchaseOrdersProps {
  result: CalculationResult;
}

export function PurchaseOrders({ result }: PurchaseOrdersProps) {
  const { poLineItems, poGrandTotals, ohTotal } = result;

  if (!poLineItems.length) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Purchase Order Analysis
          <TipBadge tip="Profitability of your current order composition." />
        </h2>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Add quantities to the Order Composition to see Purchase Order analysis.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        Purchase Order Analysis
        <TipBadge tip="Profitability of your current order composition." />
      </h2>

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
                <TableCell className="text-right">
                  {item.totalQty.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {money(item.retailProfit)}
                </TableCell>
                <TableCell className="text-right">
                  {money(item.wholesaleProfit)}
                </TableCell>
                <TableCell className="text-right">
                  {money(item.distributorProfit)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {money(item.totalProfit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                <strong>Grand Total</strong>
              </TableCell>
              <TableCell className="text-right">
                <strong>{poGrandTotals.totalQty.toLocaleString()}</strong>
              </TableCell>
              <TableCell className="text-right">
                <strong>{money(poGrandTotals.retailProfit)}</strong>
              </TableCell>
              <TableCell className="text-right">
                <strong>{money(poGrandTotals.wholesaleProfit)}</strong>
              </TableCell>
              <TableCell className="text-right">
                <strong>{money(poGrandTotals.distributorProfit)}</strong>
              </TableCell>
              <TableCell className="text-right">
                <strong>{money(poGrandTotals.totalProfit)}</strong>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Total GP from Order
              <TipBadge tip="Total gross profit before monthly overhead." />
            </div>
            <div className="text-xl font-bold tabular-nums">
              {money(poGrandTotals.totalProfit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Total Monthly Overhead
              <TipBadge tip="Fixed monthly costs." />
            </div>
            <div className="text-xl font-bold tabular-nums">{money(ohTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Net Impact on Monthly Profit
              <TipBadge tip="Order GP minus total monthly overhead." />
            </div>
            <div className="text-xl font-bold tabular-nums">
              {money(poGrandTotals.totalProfit - ohTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Avg Cost / Unit</div>
            <div className="text-xl font-bold tabular-nums">
              {money3(poGrandTotals.avgCostPerUnit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Avg Profit / Unit</div>
            <div className="text-xl font-bold tabular-nums">
              {money3(poGrandTotals.avgProfitPerUnit)}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
