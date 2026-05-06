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
          <h3 className="text-sm font-semibold">Subscription Plans</h3>
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
              <InfoTooltip text="Month-by-month breakdown showing subscriber growth, churn, revenue, COGS, and cumulative figures. Growth and churn compound monthly based on your plan settings." label="Projections" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {summary.plans.map((plan) => (
              <div key={plan.planId} className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold">{plan.planName}</h4>
                  <span className="text-xs text-muted-foreground">MRR: {money3(plan.mrr)} · ARR: {money3(plan.arr)} · LTV: {money3(plan.ltv)} · Payback: {isFinite(plan.paybackMonths) ? plan.paybackMonths.toFixed(1) : "N/A"} mo</span>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Month</TableHead>
                        <TableHead className="text-right">Starting</TableHead>
                        <TableHead className="text-right text-green-600">+New</TableHead>
                        <TableHead className="text-right text-red-500">-Churn</TableHead>
                        <TableHead className="text-right">Ending</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">COGS</TableHead>
                        <TableHead className="text-right">Gross Profit</TableHead>
                        <TableHead className="text-right">Cum. Rev</TableHead>
                        <TableHead className="text-right">Cum. Profit</TableHead>
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
                <Label className="text-xs">Plan Name</Label>
                <Input value={plan.name} onChange={(e) => onUpdate(plan.id, { name: e.target.value })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monthly Price ($)</Label>
                <Input type="number" step="0.01" value={plan.monthlyPrice} onChange={(e) => onUpdate(plan.id, { monthlyPrice: Number(e.target.value) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Starting Subscribers</Label>
                <Input type="number" value={plan.startingSubscribers} onChange={(e) => onUpdate(plan.id, { startingSubscribers: Math.max(0, Number(e.target.value)) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Growth Rate (%/mo)</Label>
                <Input type="number" step="0.1" value={plan.monthlyGrowthRate} onChange={(e) => onUpdate(plan.id, { monthlyGrowthRate: Number(e.target.value) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Churn Rate (%/mo)</Label>
                <Input type="number" step="0.1" value={plan.monthlyChurnRate} onChange={(e) => onUpdate(plan.id, { monthlyChurnRate: Number(e.target.value) })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CAC ($)</Label>
                <Input type="number" step="0.01" value={plan.cac} onChange={(e) => onUpdate(plan.id, { cac: Number(e.target.value) })} className="h-8" title="Customer Acquisition Cost" />
              </div>
            </div>

            {/* SKU items in plan */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Products in this plan (what subscribers receive monthly)</Label>
              {plan.items.length === 0 && (
                <p className="text-xs text-muted-foreground">No products added yet. Select an SKU below.</p>
              )}
              {plan.items.map((item) => (
                <div key={item.skuId} className="flex items-center gap-2">
                  <span className="text-sm flex-1">{item.skuName}</span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">packs/mo:</Label>
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
