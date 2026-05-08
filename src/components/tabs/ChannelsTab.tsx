import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money3, pct } from "@/lib/calculator";
import { Truck, Receipt, Globe } from "lucide-react";

interface ChannelsTabProps {
  state: CalculatorState;
  result: CalculationResult;
  updateState: (patch: Partial<CalculatorState>) => void;
}

export function ChannelsTab({ state, result, updateState }: ChannelsTabProps) {
  const ChannelCard = ({
    title,
    calc,
    priceLabel,
    priceFormula,
    extra,
  }: {
    title: string;
    calc: CalculationResult["retail"];
    priceLabel: string;
    priceFormula: string;
    extra?: React.ReactNode;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormulaTooltip
          label={`${title} Price`}
          formula={priceFormula}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">{priceLabel}</span>
            <span className="font-bold tabular-nums">{money3(calc.price)}</span>
          </div>
        </FormulaTooltip>

        <FormulaTooltip
          label="Gross Margin %"
          formula={`GP / Price = ${money3(calc.gp)} / ${money3(calc.price)} = ${pct(calc.gm)}`}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">Gross Margin %</span>
            <span className="font-medium tabular-nums">{pct(calc.gm)}</span>
          </div>
        </FormulaTooltip>

        <FormulaTooltip
          label="Revenue / Pack"
          formula={`Price per pack = ${money3(calc.price)}`}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">Revenue / Pack</span>
            <span className="font-medium tabular-nums">{money3(calc.price)}</span>
          </div>
        </FormulaTooltip>

        <FormulaTooltip
          label="Gross Profit / Pack"
          formula={`Revenue − COGS = ${money3(calc.price)} − ${money3(result.cogsPerPack)} = ${money3(calc.gp)}`}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">Gross Profit / Pack</span>
            <span className="font-medium tabular-nums">{money3(calc.gp)}</span>
          </div>
        </FormulaTooltip>

        <FormulaTooltip
          label="Operating Profit / Pack"
          formula={`GP − Overhead − Shipping = ${money3(calc.gp)} − ${money3(title === "Retail" ? result.ohPerPackR : title === "Wholesale" ? result.ohPerPackW : result.ohPerPackD)} − ${title === "Retail" ? money3(result.shipPerPack) : "$0"} = ${money3(calc.op)}`}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">Operating Profit / Pack</span>
            <span className="font-medium tabular-nums">{money3(calc.op)}</span>
          </div>
        </FormulaTooltip>

        <FormulaTooltip
          label="Operating Margin %"
          formula={`OP / Price = ${money3(calc.op)} / ${money3(calc.price)} = ${pct(calc.om)}`}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">Operating Margin %</span>
            <span className="font-medium tabular-nums">{pct(calc.om)}</span>
          </div>
        </FormulaTooltip>

        <FormulaTooltip
          label="Cost / Unit"
          formula={`COGS / Units per Pack = ${money3(result.cogsPerPack)} / ${result.weightedUnitsPerPack.toFixed(1)} = ${money3(calc.costPerUnit)}`}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">Cost / Unit</span>
            <span className="font-medium tabular-nums">{money3(calc.costPerUnit)}</span>
          </div>
        </FormulaTooltip>

        <FormulaTooltip
          label="Profit / Unit"
          formula={`OP / Units per Pack = ${money3(calc.op)} / ${result.weightedUnitsPerPack.toFixed(1)} = ${money3(calc.profitPerUnit)}`}
        >
          <div className="flex justify-between items-center cursor-help">
            <span className="text-sm text-muted-foreground">Profit / Unit</span>
            <span className="font-medium tabular-nums">{money3(calc.profitPerUnit)}</span>
          </div>
        </FormulaTooltip>

        {extra}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Channel Configuration
                <InfoTooltip text="Channels are the paths through which your product reaches customers. Retail = direct to consumer at full price. Wholesale = selling to retailers who mark up your product. Distributor = selling through a middleman who sells to retailers. Each channel has a different price point and margin structure." label="Channel Configuration" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Toggle which sales channels to include and set discount tiers. Price cascades: Retail → Wholesale → Distributor.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.includeR} onCheckedChange={(v) => updateState({ includeR: !!v })} />
              Include Retail
            </Label>
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.includeW} onCheckedChange={(v) => updateState({ includeW: !!v })} />
              Include Wholesale
            </Label>
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.includeD} onCheckedChange={(v) => updateState({ includeD: !!v })} />
              Include Distributor
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChannelCard
              title="Retail"
              calc={result.retail}
              priceLabel="Price = Retail"
              priceFormula={`Retail price as entered = ${money3(result.retail.price)}`}
              extra={
                <div className="pt-2 space-y-2 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={state.includeShip} onCheckedChange={(v) => updateState({ includeShip: !!v })} />
                    <span className="text-sm">Include shipping</span>
                    <InfoTooltip text="When enabled, shipping cost is added to the COGS for each pack. Disable if shipping is free or included in your product price." label="Include Shipping" />
                  </div>
                  {!state.useShippingRateTable && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        Flat Shipping $/Pack
                        <InfoTooltip text="Fixed shipping cost per pack. Used when weight-based shipping is disabled." label="Flat Shipping" />
                      </Label>
                      <Input type="number" step="0.01" className="w-24 h-7"
                        value={state.shippingPerPack}
                        onChange={(e) => updateState({ shippingPerPack: Number(e.target.value) })} />
                    </div>
                  )}
                </div>
              }
            />

            <ChannelCard
              title="Wholesale"
              calc={result.wholesale}
              priceLabel="Retail − Discount"
              priceFormula={`Retail × (1 − Wholesale Discount%) = ${money3(result.retail.price)} × (1 − ${state.wDisc}%) = ${money3(result.wholesale.price)}`}
              extra={
                <div className="pt-2 space-y-2 border-t">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Wholesale Discount %</Label>
                    <Input type="number" step="0.01" className="h-7"
                      value={state.wDisc}
                      onChange={(e) => updateState({ wDisc: Number(e.target.value) })} />
                    {state.wDisc === 50 && <span className="text-xs text-muted-foreground">Keystone pricing</span>}
                  </div>
                  <FormulaTooltip
                    label="Retailer Profit / Pack"
                    formula={`Retail Price − Wholesale Price = ${money3(result.retail.price)} − ${money3(result.wholesale.price)} = ${money3(result.retailerProfit)}`}
                  >
                    <div className="flex justify-between items-center cursor-help">
                      <span className="text-sm text-muted-foreground">Retailer Profit / Pack</span>
                      <span className="font-medium tabular-nums">{money3(result.retailerProfit)}</span>
                    </div>
                  </FormulaTooltip>
                </div>
              }
            />

            <ChannelCard
              title="Distributor"
              calc={result.distributor}
              priceLabel="Wholesale − Discount"
              priceFormula={`Wholesale × (1 − Distributor Discount%) = ${money3(result.wholesale.price)} × (1 − ${state.dDisc}%) = ${money3(result.distributor.price)}`}
              extra={
                <div className="pt-2 space-y-2 border-t">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Distributor Discount %</Label>
                    <Input type="number" step="0.01" className="h-7"
                      value={state.dDisc}
                      onChange={(e) => updateState({ dDisc: Number(e.target.value) })} />
                  </div>
                  <FormulaTooltip
                    label="Distributor Profit / Pack"
                    formula={`Wholesale Price − Distributor Price = ${money3(result.wholesale.price)} − ${money3(result.distributor.price)} = ${money3(result.distProfit)}`}
                  >
                    <div className="flex justify-between items-center cursor-help">
                      <span className="text-sm text-muted-foreground">Distributor Profit / Pack</span>
                      <span className="font-medium tabular-nums">{money3(result.distProfit)}</span>
                    </div>
                  </FormulaTooltip>
                  {/* Import Duty */}
                  <div className="space-y-1 pt-1">
                    <Label className="text-xs text-muted-foreground">Import Duty %</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" step="0.01" className="w-20 h-7"
                        value={state.distributorImportDutyRate}
                        onChange={(e) => updateState({ distributorImportDutyRate: Math.max(0, Number(e.target.value)) })} />
                      {state.distributorImportDutyRate > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Duty: {money3(result.distributorImportDuty)} | Cost: {money3(result.distributorCostWithDuty)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              }
            />
          </div>

          {/* Weight-Based Shipping Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card className="border-dashed border-2 bg-sky-50/50 dark:bg-sky-950/20 border-l-4 border-l-sky-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-5 w-5 text-sky-500" />
                  Weight-Based Shipping Rates
                  <span className="bg-sky-100 text-sky-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Tool</span>
                  <InfoTooltip
                    text="Carrier-like pricing based on your total package weight (ingredients + all packaging layers). When enabled, the flat shipping rate is ignored and the rate table determines shipping cost per pack."
                    label="Weight-Based Shipping"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={state.useShippingRateTable}
                    onCheckedChange={(v) => updateState({ useShippingRateTable: !!v })}
                  />
                  <span className="text-sm font-medium">Enable weight-based rates</span>
                </div>
                {state.useShippingRateTable && (
                  <>
                    <div className="text-xs text-muted-foreground bg-primary/5 rounded p-2">
                      Package weight: <strong>{(result.totalUnitWeightPerPack).toFixed(1)}g</strong> → Current rate: <strong>{money3(result.shipPerPack)}</strong>
                    </div>
                    <div className="space-y-1.5">
                      {state.shippingRateBrackets.map((bracket, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input type="number" step="1" className="w-20 h-7 text-xs"
                            value={bracket.maxWeightGrams}
                            onChange={(e) => {
                              const newBrackets = [...state.shippingRateBrackets];
                              newBrackets[idx] = { ...bracket, maxWeightGrams: Math.max(1, Number(e.target.value)) };
                              updateState({ shippingRateBrackets: newBrackets });
                            }} />
                          <span className="text-xs text-muted-foreground">g =</span>
                          <Input type="number" step="0.01" className="w-16 h-7 text-xs"
                            value={bracket.cost}
                            onChange={(e) => {
                              const newBrackets = [...state.shippingRateBrackets];
                              newBrackets[idx] = { ...bracket, cost: Math.max(0, Number(e.target.value)) };
                              updateState({ shippingRateBrackets: newBrackets });
                            }} />
                          <span className="text-xs text-muted-foreground">$</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive h-7 text-xs"
                            onClick={() => {
                              const newBrackets = state.shippingRateBrackets.filter((_, i) => i !== idx);
                              updateState({ shippingRateBrackets: newBrackets });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs w-full"
                        onClick={() => {
                          const last = state.shippingRateBrackets[state.shippingRateBrackets.length - 1];
                          const newBracket = last
                            ? { maxWeightGrams: last.maxWeightGrams + 500, cost: last.cost + 2 }
                            : { maxWeightGrams: 500, cost: 5 };
                          updateState({ shippingRateBrackets: [...state.shippingRateBrackets, newBracket] });
                        }}
                      >
                        + Add bracket
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tax & Duty Configuration */}
            <Card className="border-dashed border-2 bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-l-emerald-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-500" />
                  Tax &amp; Duty
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Tool</span>
                  <InfoTooltip
                    text="Configure regulatory costs per channel. Sales tax applies to retail customer purchases. Import duty applies to distributor imports. Both are shown as separate line items so buyers see true total costs."
                    label="Tax & Duty"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Retail Sales Tax */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                    Retail Sales Tax %
                    <InfoTooltip text="Sales tax rate applied to retail price. Shown separately so the customer sees the true cost. Example: 8.25% tax on $57.50 = $4.74, customer pays $62.24." label="Sales Tax" />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" step="0.01" className="w-24 h-7"
                      value={state.retailSalesTaxRate}
                      onChange={(e) => updateState({ retailSalesTaxRate: Math.max(0, Number(e.target.value)) })} />
                    {state.retailSalesTaxRate > 0 && (
                      <span className="text-xs text-green-600">
                        Customer pays: {money3(result.retailPriceWithTax)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Distributor Import Duty */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    Distributor Import Duty %
                    <InfoTooltip text="Import duty rate applied to the distributor's cost price. This regulatory cost is borne by the distributor and shown as a separate line item in their cost structure." label="Import Duty" />
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" step="0.01" className="w-24 h-7"
                      value={state.distributorImportDutyRate}
                      onChange={(e) => updateState({ distributorImportDutyRate: Math.max(0, Number(e.target.value)) })} />
                    {state.distributorImportDutyRate > 0 && (
                      <span className="text-xs text-green-600">
                        Duty: {money3(result.distributorImportDuty)} | Total: {money3(result.distributorCostWithDuty)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
