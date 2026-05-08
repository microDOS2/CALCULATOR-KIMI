import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money3, pct } from "@/lib/calculator";
import { Truck, Receipt, Globe, Package, AlertTriangle, Container, Info } from "lucide-react";

interface ChannelsTabProps {
  state: CalculatorState;
  result: CalculationResult;
  updateState: (patch: Partial<CalculatorState>) => void;
  mode?: 'all' | 'b2c' | 'b2b';
}

export function ChannelsTab({ state, result, updateState, mode = 'all' }: ChannelsTabProps) {
  const showRetail = mode === 'b2c' || mode === 'all';
  const showWholesale = mode === 'b2b' || mode === 'all';
  const showDistributor = mode === 'b2b' || mode === 'all';
  const showTools = mode === 'b2c' || mode === 'all';
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
          formula={`GP − Overhead − Shipping = ${money3(calc.gp)} − ${money3(title === "Retail" ? result.ohPerPackR : title === "Wholesale" ? result.ohPerPackW : result.ohPerPackD)} − ${title === "Retail" ? money3(result.shipPerPack) : title === "Wholesale" ? money3(result.shippingPerPackW) : money3(result.shippingPerPackD)} = ${money3(calc.op)}`}
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

  const noChannelsSelected = !state.includeR && !state.includeW && !state.includeD;

  return (
    <div className="space-y-6">
      {/* Blank Slate Banner */}
      {noChannelsSelected && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-amber-800 text-sm">Blank Slate — Choose Your Channels</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  All sales channels start <strong>unchecked by design.</strong> You must consciously decide which channels to include in your model.
                  Check at least one channel below to begin. Each channel can be toggled independently at any time.
                </p>
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
            {showRetail && (
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.includeR} onCheckedChange={(v) => updateState({ includeR: !!v })} />
              Include Retail
            </Label>
            )}
            {showWholesale && (
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.includeW} onCheckedChange={(v) => updateState({ includeW: !!v })} />
              Include Wholesale
            </Label>
            )}
            {showDistributor && (
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.includeD} onCheckedChange={(v) => updateState({ includeD: !!v })} />
              Include Distributor
            </Label>
            )}
          </div>

          <div className={`grid gap-4 ${mode === 'b2b' ? 'grid-cols-1 md:grid-cols-2' : mode === 'b2c' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {showRetail && (
            <ChannelCard
              title="Retail"
              calc={result.retail}
              priceLabel="Price = Retail"
              priceFormula={`Retail price as entered = ${money3(result.retail.price)}`}
              extra={
                <div className="pt-2 space-y-2 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={state.includeShip} onCheckedChange={(v) => updateState({ includeShip: !!v })} />
                    <span className="text-sm">Include shipping in COGS</span>
                    <InfoTooltip text="Master toggle: when enabled, shipping cost is subtracted from gross profit for all channels. Each channel has its own shipping cost — set in the Per-Channel Shipping card below." label="Include Shipping" />
                  </div>
                </div>
              }
            />)}<span data-shipping-extracted />

          {/* Per-Channel Shipping Costs — STANDALONE */}
          {state.includeShip && !state.useShippingRateTable && (
            <Card className="border-l-4 border-l-amber-400 shadow-md bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/20 dark:via-transparent dark:to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-500" />
                  Per-Channel Shipping Costs
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Required</span>
                  <InfoTooltip
                    text="Cost per PACK shipped — NOT per individual item, NOT per shipment/delivery. A 'pack' is one unit your customer buys. Example: a pallet costs $400 to ship and holds 200 packs = $2.00/pack. The carrier invoices you per pallet, but for margin analysis we allocate down to each pack."
                    label="Cost Per Pack Explained"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Retail — has default */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-indigo-500" />
                      <Label className="text-xs font-medium text-indigo-700">Retail (Consumer Parcel)</Label>
                      <InfoTooltip
                        text="Cost per PACK shipped to a consumer. Example: UPS charges $12.50 to deliver a box of 5 packs to a customer's door = $2.50/pack. NOT $12.50 (that's per shipment). The pack is what the customer buys — divide your total shipping invoice by the number of packs in the shipment."
                        label="Retail Shipping Cost"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Individual packages to end consumers</p>
                    <Input
                      type="number" step="0.01" className="h-8"
                      value={state.shippingPerPack}
                      onChange={(e) => updateState({ shippingPerPack: Number(e.target.value) })}
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Default: $2.50</span>
                    </div>
                  </div>

                  {/* Wholesale — must be defined */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Container className="h-3.5 w-3.5 text-teal-500" />
                      <Label className="text-xs font-medium text-teal-700">Wholesale (Pallet/Freight)</Label>
                      <InfoTooltip
                        text="Cost per PACK shipped to wholesale buyers. Example: a pallet costs $350 to ship to a retailer and holds 144 packs = $2.43/pack ($350 / 144). NOT $350 — that's per pallet. You MUST calculate this yourself because pallet sizes, freight rates, and pack counts vary by product and carrier. No default is provided."
                        label="Wholesale Shipping Cost"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Pallets or large boxes to retailers</p>
                    <Input
                      type="number" step="0.01" className="h-8"
                      value={state.shippingPerPackW}
                      onChange={(e) => updateState({ shippingPerPackW: Number(e.target.value) })}
                      placeholder="Enter cost..."
                    />
                    {state.shippingPerPackW === 0 ? (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] text-amber-700 font-medium">Must be defined by user</span>
                      </div>
                    ) : (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Set: {money3(state.shippingPerPackW)}/pack</span>
                    )}
                  </div>

                  {/* Distributor — must be defined */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Container className="h-3.5 w-3.5 text-teal-700" />
                      <Label className="text-xs font-medium text-teal-800">Distributor (Freight/LTL)</Label>
                      <InfoTooltip
                        text="Cost per PACK shipped to distribution centers. Example: an LTL freight shipment costs $850 to a regional DC and holds 500 packs = $1.70/pack ($850 / 500). NOT $850 — that's per freight shipment. Distributor logistics often involve full truckloads, containers, or intermodal rail. You MUST calculate this yourself based on your actual freight contracts. No default is provided."
                        label="Distributor Shipping Cost"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Freight to distribution centers</p>
                    <Input
                      type="number" step="0.01" className="h-8"
                      value={state.shippingPerPackD}
                      onChange={(e) => updateState({ shippingPerPackD: Number(e.target.value) })}
                      placeholder="Enter cost..."
                    />
                    {state.shippingPerPackD === 0 ? (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] text-amber-700 font-medium">Must be defined by user</span>
                      </div>
                    ) : (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Set: {money3(state.shippingPerPackD)}/pack</span>
                    )}
                  </div>
                </div>

                {/* Summary bar */}
                <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground bg-primary/5 rounded p-2 mt-2">
                  <span className="font-medium">Effective shipping:</span>
                  <span>Retail: {money3(result.shipPerPack)}</span>
                  <span>Wholesale: {money3(result.shippingPerPackW)}</span>
                  <span>Distributor: {money3(result.shippingPerPackD)}</span>
                  {state.includeShip && (state.shippingPerPackW === 0 || state.shippingPerPackD === 0) && (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      W/D shipping costs are $0 — set values above for accurate margins
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

            {showWholesale && (<ChannelCard
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
            />)}

            {showDistributor && (<ChannelCard
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
            />)}
          </div>

          {showTools && (<>
          {/* Advanced Tool Cards */}
          <div className="flex items-center gap-2 py-1 mt-2">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-sky-300 via-emerald-300 to-transparent" />
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded">Shipping & Tax Tools</span>
            <div className="h-0.5 flex-1 bg-gradient-to-l from-emerald-300 via-sky-300 to-transparent" />
          </div>

          {/* Weight-Based Shipping Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card className="border-dashed border-2 bg-gradient-to-br from-sky-100 via-sky-50 to-white dark:from-sky-900/30 dark:via-sky-950/20 dark:to-transparent shadow-md border-l-4 border-l-sky-400">
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
            <Card className="border-dashed border-2 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white dark:from-emerald-900/30 dark:via-emerald-950/20 dark:to-transparent shadow-md border-l-4 border-l-emerald-400">
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
          </>)}
        </CardContent>
      </Card>
    </div>
  );
}
