import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { SKU, SubscriptionPlan, SubscriptionSummary } from "@/types/calculator";
import { money3, money } from "@/lib/calculator";

interface SubscriptionsTabProps {
  skus: SKU[];
  plans: SubscriptionPlan[];
  summary: SubscriptionSummary;
  addPlan: () => void;
  updatePlan: (id: string, patch: Partial<SubscriptionPlan>) => void;
  removePlan: (id: string) => void;
  addItem: (planId: string, skuId: string, skuName: string) => void;
  updateItem: (planId: string, skuId: string, patch: { packsPerMonth?: number }) => void;
  removeItem: (planId: string, skuId: string) => void;
}

export function SubscriptionsTab({
  skus,
  plans,
  summary,
  addPlan,
  updatePlan,
  removePlan,
  addItem,
  updateItem,
  removeItem,
}: SubscriptionsTabProps) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(
    plans[0]?.id ?? null
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Subscription Revenue Dashboard
                <InfoTooltip text="Subscription projections model monthly recurring revenue (MRR) over 12 months. Each plan includes one or more SKUs that subscribers receive monthly. Growth rate adds new subscribers, churn rate removes them. COGS is calculated per subscriber based on the SKUs and quantities in their plan." label="Subscriptions" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Model monthly recurring revenue, churn, and 12-month projections for subscription plans.</p>
          </div>
        </CardHeader>
        <CardContent>
          {plans.filter((p) => p.included).length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No active subscription plans. Add a plan below.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <FormulaTooltip label="Total MRR" formula={`Sum of all plans' month-1 revenue = ${money3(summary.totalMRR)}`}>
                <Card className="cursor-help bg-primary/5">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Total MRR</div>
                    <div className="text-xl font-bold tabular-nums">{money3(summary.totalMRR)}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
              <FormulaTooltip label="Total ARR" formula={`MRR x 12 = ${money3(summary.totalARR)}`}>
                <Card className="cursor-help bg-primary/10">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Total ARR</div>
                    <div className="text-xl font-bold tabular-nums">{money3(summary.totalARR)}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
              <FormulaTooltip label="Starting Subscribers" formula={`Sum of all plans' starting subscribers = ${summary.totalSubscribers.toLocaleString()}`}>
                <Card className="cursor-help">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Starting Subscribers</div>
                    <div className="text-xl font-bold tabular-nums">{summary.totalSubscribers.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
              <FormulaTooltip label="Annual Revenue" formula={`12-month cumulative revenue across all plans = ${money3(summary.combinedAnnualRevenue)}`}>
                <Card className="cursor-help bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">12-Mo Revenue</div>
                    <div className="text-xl font-bold tabular-nums">{money3(summary.combinedAnnualRevenue)}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
              <FormulaTooltip label="Annual COGS" formula={`12-month cumulative COGS across all plans = ${money3(summary.combinedAnnualCOGS)}`}>
                <Card className="cursor-help bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">12-Mo COGS</div>
                    <div className="text-xl font-bold tabular-nums">{money3(summary.combinedAnnualCOGS)}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
              <FormulaTooltip label="Annual Gross Profit" formula={`Revenue - COGS = ${money3(summary.combinedAnnualProfit)}`}>
                <Card className="cursor-help bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">12-Mo Gross Profit</div>
                    <div className="text-xl font-bold tabular-nums">{money3(summary.combinedAnnualProfit)}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Subscription Plans</h3>
            <InfoTooltip text="A subscription plan defines what products subscribers receive, how much they pay monthly, and how the subscriber base grows or shrinks over time. You can create multiple plans (e.g., Basic, Premium, Family) with different product sets and pricing. Toggle the Include checkbox to include/exclude a plan from projections." label="Subscription Plans" />
          </div>
          <Button size="sm" variant="outline" onClick={addPlan}>
            <Plus className="h-4 w-4 mr-1" /> Add Plan
          </Button>
        </div>

        {plans.map((plan) => (
          <PlanEditor
            key={plan.id}
            plan={plan}
            skus={skus}
            isExpanded={expandedPlan === plan.id}
            onToggle={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
            onUpdate={updatePlan}
            onRemove={removePlan}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        ))}
      </div>

      {/* 12-Month Projection Tables */}
      {summary.plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              12-Month Projections
              <InfoTooltip text="Month-by-month breakdown showing subscriber growth, churn, revenue, COGS, and cumulative figures. Growth and churn compound monthly based on your plan settings. Starting subscribers carry forward as the next month's starting point." label="Projections" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {summary.plans.map((plan) => (
              <div key={plan.planId} className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold">{plan.planName}</h4>
                  <FormulaTooltip
                    label="Plan Metrics"
                    formula={`MRR = ${money3(plan.mrr)} | ARR = MRR x 12 = ${money3(plan.arr)} | LTV = avg monthly profit / churn rate = ${money3(plan.ltv)} | Payback = CAC / avg monthly profit = ${isFinite(plan.paybackMonths) ? plan.paybackMonths.toFixed(1) : "N/A"} months`}
                  >
                    <span className="text-xs text-muted-foreground cursor-help">
                      MRR: {money3(plan.mrr)} · ARR: {money3(plan.arr)} · LTV: {money3(plan.ltv)} · Payback: {isFinite(plan.paybackMonths) ? plan.paybackMonths.toFixed(1) : "N/A"} mo
                    </span>
                  </FormulaTooltip>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">
                          Month
                          <InfoTooltip text="Calendar month of the projection (Jan-Dec)." label="Month" />
                        </TableHead>
                        <TableHead className="text-right">
                          Starting
                          <InfoTooltip text="Number of subscribers at the start of this month (carried forward from last month's ending count)." label="Starting Subscribers" />
                        </TableHead>
                        <TableHead className="text-right text-green-600">
                          +New
                          <InfoTooltip text="New subscribers acquired this month = Starting Subscribers x Growth Rate %. These are added to the base before churn is applied. Growth compounds monthly." label="New Subscribers" />
                        </TableHead>
                        <TableHead className="text-right text-red-500">
                          -Churn
                          <InfoTooltip text="Subscribers who cancelled this month = Starting Subscribers x Churn Rate %. Applied after new subscribers are added. Lower churn = more stable recurring revenue." label="Churned Subscribers" />
                        </TableHead>
                        <TableHead className="text-right">
                          Ending
                          <InfoTooltip text="Subscribers remaining at month end = Starting + New - Churn. This becomes next month's starting count." label="Ending Subscribers" />
                        </TableHead>
                        <TableHead className="text-right">
                          Revenue
                          <InfoTooltip text={`Monthly revenue = Starting Subscribers x Monthly Price ($${plan.monthlyPrice.toFixed(2)}). Based on subscribers at the start of the month.`} label="Monthly Revenue" />
                        </TableHead>
                        <TableHead className="text-right">
                          COGS
                          <InfoTooltip text="Monthly COGS = Starting Subscribers x per-subscriber COGS. Per-subscriber COGS is calculated from the SKUs and packs per month in this plan, using each SKU's ingredient and packaging costs." label="Monthly COGS" />
                        </TableHead>
                        <TableHead className="text-right">
                          Gross Profit
                          <InfoTooltip text="Monthly Gross Profit = Revenue - COGS. This is before overhead, commissions, or other operating costs." label="Monthly Gross Profit" />
                        </TableHead>
                        <TableHead className="text-right">
                          Cum. Rev
                          <InfoTooltip text="Running total of all revenue from month 1 through this month." label="Cumulative Revenue" />
                        </TableHead>
                        <TableHead className="text-right">
                          Cum. Profit
                          <InfoTooltip text="Running total of all gross profit from month 1 through this month." label="Cumulative Profit" />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.months.map((m) => (
                        <TableRow key={m.month}>
                          <TableCell className="font-medium">{m.monthLabel}</TableCell>
                          <TableCell className="text-right">{m.startingSubscribers.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">+{m.newSubscribers.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-red-500">-{m.churnedSubscribers.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">{m.endingSubscribers.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{money(m.monthlyRevenue)}</TableCell>
                          <TableCell className="text-right">{money(m.monthlyCOGS)}</TableCell>
                          <TableCell className="text-right font-medium">{money(m.monthlyGrossProfit)}</TableCell>
                          <TableCell className="text-right">{money(m.cumulativeRevenue)}</TableCell>
                          <TableCell className="text-right">{money(m.cumulativeProfit)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PlanEditor({
  plan,
  skus,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: {
  plan: SubscriptionPlan;
  skus: SKU[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, patch: Partial<SubscriptionPlan>) => void;
  onRemove: (id: string) => void;
  onAddItem: (planId: string, skuId: string, skuName: string) => void;
  onUpdateItem: (planId: string, skuId: string, patch: { packsPerMonth?: number }) => void;
  onRemoveItem: (planId: string, skuId: string) => void;
}) {
  const [selectedSkuId, setSelectedSkuId] = useState("");
  const availableSkus = skus.filter(
    (sku) => !plan.items.some((item) => item.skuId === sku.id)
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Checkbox
            checked={plan.included}
            onCheckedChange={(v) => onUpdate(plan.id, { included: !!v })}
            title="Include this plan in projections"
          />
          <button onClick={onToggle} className="flex-1 text-left">
            <span className="font-semibold text-sm">{plan.name || "Unnamed Plan"}</span>
            <span className="text-xs text-muted-foreground ml-2">
              ${plan.monthlyPrice.toFixed(2)}/mo · {plan.startingSubscribers} subs · {plan.items.length} SKU{plan.items.length !== 1 ? "s" : ""}
            </span>
          </button>
          <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => onRemove(plan.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-2 border-t">
            {/* Plan settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">
                  Plan Name
                  <InfoTooltip text="The name of this subscription tier that customers see (e.g., 'Basic Monthly', 'Premium Bundle', 'Family Plan'). This is for your reference only." label="Plan Name" />
                </Label>
                <Input value={plan.name} onChange={(e) => onUpdate(plan.id, { name: e.target.value })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Monthly Price ($)
                  <InfoTooltip text="The amount each subscriber pays every month for this plan. This is your recurring revenue per subscriber. Set this based on the value of the products included and your target margins." label="Monthly Price" />
                </Label>
                <Input type="number" step="0.01" value={plan.monthlyPrice} onChange={(e) => onUpdate(plan.id, { monthlyPrice: Number(e.target.value) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Starting Subscribers
                  <InfoTooltip text="How many subscribers you already have (or expect to launch with) at month 1. This is your baseline — growth and churn are applied to this number going forward." label="Starting Subscribers" />
                </Label>
                <Input type="number" value={plan.startingSubscribers} onChange={(e) => onUpdate(plan.id, { startingSubscribers: Math.max(0, Number(e.target.value)) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Growth Rate (%/mo)
                  <InfoTooltip text="The percentage of your existing subscriber base that joins as new subscribers each month. For example, 5% means if you have 100 subscribers, you gain 5 new ones next month. This compounds over time. Set to 0 for a flat projection." label="Growth Rate" />
                </Label>
                <Input type="number" step="0.1" value={plan.monthlyGrowthRate} onChange={(e) => onUpdate(plan.id, { monthlyGrowthRate: Number(e.target.value) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Churn Rate (%/mo)
                  <InfoTooltip text="The percentage of subscribers who cancel each month. For example, 3% means 3 out of 100 subscribers leave each month. Lower churn = more stable revenue. Industry average for physical product subscriptions is 6-10%." label="Churn Rate" />
                </Label>
                <Input type="number" step="0.1" value={plan.monthlyChurnRate} onChange={(e) => onUpdate(plan.id, { monthlyChurnRate: Number(e.target.value) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  CAC ($)
                  <InfoTooltip text="Customer Acquisition Cost — how much you spend (marketing, ads, sales) to acquire one subscriber. Used to calculate payback period: how many months of profit it takes to recover the acquisition cost. Lower CAC and higher LTV = better business model." label="CAC" />
                </Label>
                <Input type="number" step="0.01" value={plan.cac} onChange={(e) => onUpdate(plan.id, { cac: Number(e.target.value) })} className="h-8" title="Customer Acquisition Cost" />
              </div>
            </div>

            {/* SKU items in plan */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Products in this plan
                <InfoTooltip text="Select which SKUs (products) are included in this subscription plan and how many packs each subscriber receives per month. COGS is calculated automatically from each SKU's ingredient and packaging costs. You can combine multiple SKUs into a single plan (product bundles)." label="Products in Plan" />
              </Label>
              {plan.items.length === 0 && (
                <p className="text-xs text-muted-foreground">No products added yet. Select an SKU below.</p>
              )}
              {plan.items.map((item) => (
                <div key={item.skuId} className="flex items-center gap-2">
                  <span className="text-sm flex-1">{item.skuName}</span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">
                      packs/mo
                      <InfoTooltip text="How many packs of this product does each subscriber receive per month? For example, a 30-day supply = 1 pack/month. A 60-day supply = 0.5 packs/month. This directly affects COGS per subscriber." label="Packs per Month" />
                    </Label>
                    <Input type="number" min={1} value={item.packsPerMonth} onChange={(e) => onUpdateItem(plan.id, item.skuId, { packsPerMonth: Math.max(1, Number(e.target.value)) })} className="h-7 w-20" />
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => onRemoveItem(plan.id, item.skuId)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Add SKU to plan */}
              {availableSkus.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
                    <SelectTrigger className="h-7 w-48 text-xs">
                      <SelectValue placeholder="Add SKU to plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSkus.map((sku) => (
                        <SelectItem key={sku.id} value={sku.id}>{sku.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    disabled={!selectedSkuId}
                    onClick={() => {
                      const sku = skus.find((s) => s.id === selectedSkuId);
                      if (sku) {
                        onAddItem(plan.id, sku.id, sku.name);
                        setSelectedSkuId("");
                      }
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
