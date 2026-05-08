import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList } from "lucide-react";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money3 } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";

interface AssumptionsAuditTrailProps {
  state: CalculatorState;
  result: CalculationResult;
}

interface AuditRow {
  category: string;
  assumption: string;
  value: string;
  impact: string;
}

function buildAuditRows(state: CalculatorState, result: CalculationResult): AuditRow[] {
  const rows: AuditRow[] = [];

  // PRODUCT ASSUMPTIONS
  state.skus.forEach((sku) => {
    rows.push({
      category: "Product",
      assumption: `${sku.name} — Units/Pack`,
      value: sku.unitsPerPack.toString(),
      impact: "Determines pack economics and COGS scaling",
    });
    rows.push({
      category: "Product",
      assumption: `${sku.name} — Retail Price`,
      value: money3(sku.retailPrice),
      impact: "Sets revenue ceiling for retail channel",
    });
  });

  // INGREDIENT ASSUMPTIONS
  state.ingredients.forEach((ing) => {
    const costPerPack = ing.mgPerUnit * ing.costPerMg * (state.skus[0]?.unitsPerPack ?? 1);
    rows.push({
      category: "Ingredients",
      assumption: `${ing.name} — ${ing.mgPerUnit}mg/unit @ ${money3(ing.costPerMg)}/mg`,
      value: `${money3(costPerPack)}/pack`,
      impact: ing.moqTiers?.length > 0
        ? `${ing.moqTiers.length} MOQ tiers for volume pricing`
        : "Fixed cost per mg",
    });
    rows.push({
      category: "Ingredients",
      assumption: `${ing.name} — Supplier Payment`,
      value: `NET ${ing.supplierPaymentDays}`,
      impact: `Cash outflow delayed ${ing.supplierPaymentDays} days after delivery`,
    });
  });

  // PACKAGING ASSUMPTIONS
  state.skus.forEach((sku) => {
    sku.packaging.forEach((layer) => {
      if (!layer.included) return;
      rows.push({
        category: "Packaging",
        assumption: `${sku.name} — ${layer.name}`,
        value: `${money3(layer.costPerUnit)} x ${layer.unitsPerLayer} units`,
        impact: `${layer.weightPerUnit}g weight contributes to shipping`,
      });
    });
  });

  // CHANNEL ASSUMPTIONS
  rows.push({
    category: "Channels",
    assumption: "Wholesale Discount",
    value: `${(state.wDisc * 100).toFixed(1)}%`,
    impact: `Wholesale price = ${money3(result.avgPriceW)}`,
  });
  rows.push({
    category: "Channels",
    assumption: "Distributor Discount",
    value: `${(state.dDisc * 100).toFixed(1)}%`,
    impact: `Distributor price = ${money3(result.avgPriceD)}`,
  });

  // SHIPPING
  if (state.useShippingRateTable) {
    rows.push({
      category: "Shipping",
      assumption: "Weight-Based Shipping",
      value: `${state.shippingRateBrackets.length} brackets`,
      impact: `Rate varies by total package weight`,
    });
  } else {
    rows.push({
      category: "Shipping",
      assumption: "Flat Shipping/Pack",
      value: money3(state.shippingPerPack),
      impact: `Fixed cost per pack shipped`,
    });
  }

  // OVERHEAD
  state.overhead.forEach((oh) => {
    rows.push({
      category: "Overhead",
      assumption: oh.name,
      value: money3(oh.cost) + "/mo",
      impact: `Allocated: R=${state.ohR ? "Y" : "N"} W=${state.ohW ? "Y" : "N"} D=${state.ohD ? "Y" : "N"}`,
    });
  });

  // TAX
  if (state.retailSalesTaxRate > 0) {
    rows.push({
      category: "Tax",
      assumption: "Retail Sales Tax",
      value: `${state.retailSalesTaxRate}%`,
      impact: `Customer pays ${money3(result.retailPriceWithTax)}`,
    });
  }
  if (state.distributorImportDutyRate > 0) {
    rows.push({
      category: "Tax",
      assumption: "Import Duty (Distributor)",
      value: `${state.distributorImportDutyRate}%`,
      impact: `Adds ${money3(result.distributorImportDuty)} to distributor cost`,
    });
  }

  // VOLUME
  state.monthlyVolumes.forEach((mv) => {
    const sku = state.skus.find((s) => s.id === mv.skuId);
    rows.push({
      category: "Volume",
      assumption: `${sku?.name || mv.skuId} — Monthly Qty`,
      value: mv.qty.toLocaleString(),
      impact: `Mix: R=${(sku?.mixR ?? 0 * 100).toFixed(0)}% W=${(sku?.mixW ?? 0 * 100).toFixed(0)}% D=${(sku?.mixD ?? 0 * 100).toFixed(0)}%`,
    });
  });

  // CASH FLOW
  rows.push({
    category: "Cash Flow",
    assumption: "Starting Cash Balance",
    value: money3(state.startingCashBalance),
    impact: `Initial liquidity for operations`,
  });
  rows.push({
    category: "Cash Flow",
    assumption: "Customer Payment Terms",
    value: `R:${state.customerPaymentTerms.retailDays}d W:${state.customerPaymentTerms.wholesaleDays}d D:${state.customerPaymentTerms.distributorDays}d`,
    impact: `Days from sale to cash collection`,
  });
  rows.push({
    category: "Cash Flow",
    assumption: "Inventory Lead Time",
    value: `${state.inventoryLeadTimeDays} days`,
    impact: `Days from PO to delivery — affects cash timing`,
  });
  if (state.debtServiceMonthly > 0) {
    rows.push({
      category: "Cash Flow",
      assumption: "Debt Service",
      value: money3(state.debtServiceMonthly) + "/mo",
      impact: `Fixed monthly loan/debt payment`,
    });
  }

  // SUBSCRIPTIONS
  state.subscriptionPlans.forEach((plan) => {
    if (!plan.included) return;
    rows.push({
      category: "Subscriptions",
      assumption: `${plan.name} — Price`,
      value: money3(plan.monthlyPrice) + "/mo",
      impact: `${plan.startingSubscribers} starting subs, ${(plan.monthlyGrowthRate * 100).toFixed(1)}% growth`,
    });
    rows.push({
      category: "Subscriptions",
      assumption: `${plan.name} — Churn`,
      value: `${(plan.monthlyChurnRate * 100).toFixed(1)}%/mo`,
      impact: `CAC: ${money3(plan.cac)}`,
    });
  });

  // CAMPAIGNS
  state.campaigns.forEach((camp) => {
    rows.push({
      category: "Campaigns",
      assumption: `${camp.name}`,
      value: `${camp.discountPercent}% off, ${camp.durationWeeks}wk`,
      impact: `${(camp.expectedVolumeUplift * 100).toFixed(0)}% volume uplift, channels: R=${camp.affectedChannels.retail ? "Y" : "N"} W=${camp.affectedChannels.wholesale ? "Y" : "N"} D=${camp.affectedChannels.distributor ? "Y" : "N"}`,
    });
  });

  return rows;
}

export function AssumptionsAuditTrail({ state, result }: AssumptionsAuditTrailProps) {
  const rows = useMemo(() => buildAuditRows(state, result), [state, result]);

  // Group by category
  const categories = [...new Set(rows.map((r) => r.category))];

  return (
    <Card className="border-l-4 border-l-slate-400 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900/30 dark:via-slate-950/20 dark:to-transparent shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-slate-500" />
          Assumptions Audit Trail
          <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Audit</span>
          <InfoTooltip
            text="A complete, auditable list of every assumption in your model — organized by category (Product, Ingredients, Packaging, Channels, Shipping, Overhead, Tax, Volume, Cash Flow, Subscriptions, Campaigns). Each row shows the assumption name, its current value, and the business impact it has on your model. Use this for due diligence, investor meetings, or when handing off a model to another team member."
            label="Audit Trail"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => {
            const catRows = rows.filter((r) => r.category === category);
            return (
              <div key={category}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {category}
                </h4>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-[35%]">Assumption</TableHead>
                        <TableHead className="text-xs w-[20%]">Value</TableHead>
                        <TableHead className="text-xs">Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catRows.map((row, i) => (
                        <TableRow key={`${category}-${i}`}>
                          <TableCell className="text-xs py-2">{row.assumption}</TableCell>
                          <TableCell className="text-xs font-medium py-2 tabular-nums">{row.value}</TableCell>
                          <TableCell className="text-xs text-muted-foreground py-2">{row.impact}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
