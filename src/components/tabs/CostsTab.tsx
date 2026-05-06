import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CalculatorState, CalculationResult, OverheadItem } from "@/types/calculator";
import { FormulaTooltip } from "@/components/FormulaTooltip";
import { InfoTooltip } from "@/components/InfoTooltip";
import { money, money3, pct } from "@/lib/calculator";

interface CostsTabProps {
  state: CalculatorState;
  result: CalculationResult;
  addOverhead: () => void;
  updateOverhead: (id: string, patch: Partial<OverheadItem>) => void;
  removeOverhead: (id: string) => void;
  updateMonthlyVolume: (skuId: string, qty: number) => void;
  updateState: (patch: Partial<CalculatorState>) => void;
}

function formatBE(units: number, rev: number): string {
  if (!isFinite(units) || units <= 0) return "Unprofitable";
  return `${Math.ceil(units).toLocaleString()} packs · ${money(rev)}`;
}

export function CostsTab({
  state,
  result,
  addOverhead,
  updateOverhead,
  removeOverhead,
  updateMonthlyVolume,
  updateState,
}: CostsTabProps) {
  return (
    <div className="space-y-6">
      {/* Monthly Overhead */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Monthly Operating Overhead
                <InfoTooltip text="Monthly overhead is all your fixed business costs that don't change with production volume — salaries, rent, insurance, utilities, software subscriptions, etc. These costs are divided across your total monthly volume to calculate an overhead cost per pack. This is critical for accurate profitability analysis." label="Monthly Overhead" />
                <FormulaTooltip
                  label="Total Monthly Overhead"
                  formula={`Sum of all overhead items + Third Party (if included) = ${money(result.ohTotal)}`}
                >
                  <span className="ml-2 text-sm font-normal text-muted-foreground cursor-help">
                    Total: {money(result.ohTotal)}
                  </span>
                </FormulaTooltip>
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Fixed monthly costs (salaries, rent, insurance, etc.). Divided by volume to get overhead per pack.</p>
          </div>
          <Button size="sm" variant="outline" onClick={addOverhead}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monthly Volume */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                Monthly Volume per SKU
                <InfoTooltip text="Monthly volume is how many packs of each SKU you expect to sell in a typical month. This is used to allocate your fixed overhead across units. Higher volume = lower overhead per pack. This is a forecast/estimate, not your order quantity." label="Monthly Volume" />
              </Label>
              <p className="text-xs text-muted-foreground">Forecast monthly sales per SKU. Drives overhead allocation and break-even.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {state.skus.map((sku) => {
                const vol = state.monthlyVolumes.find((v) => v.skuId === sku.id);
                return (
                  <div key={sku.id} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{sku.name}</Label>
                    <Input type="number" min={0} value={vol?.qty ?? 1000}
                      onChange={(e) => updateMonthlyVolume(sku.id, Math.max(0, Number(e.target.value)))} className="h-8" />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormulaTooltip
                label="Total Monthly Volume"
                formula={`Sum of all SKU monthly volumes = ${result.totalMonthlyVolume.toLocaleString()}`}
              >
                <div className="cursor-help space-y-1">
                  <Label className="text-xs text-muted-foreground">Total Monthly Volume</Label>
                  <Input value={result.totalMonthlyVolume.toLocaleString()} readOnly className="h-8 bg-muted" />
                </div>
              </FormulaTooltip>
              <FormulaTooltip
                label="Overhead / Unit"
                formula={`Total Overhead / Total Volume = ${money(result.ohTotal)} / ${result.totalMonthlyVolume} = ${money3(result.overheadPerUnit)} per unit`}
              >
                <div className="cursor-help space-y-1">
                  <Label className="text-xs text-muted-foreground">Overhead / Unit</Label>
                  <Input value={money3(result.overheadPerUnit)} readOnly className="h-8 bg-muted" />
                </div>
              </FormulaTooltip>
            </div>
          </div>

          {/* Third Party Toggle */}
          <Label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={state.includeThirdParty} onCheckedChange={(v) => updateState({ includeThirdParty: !!v })} />
            Include Third Party Costs in Overhead
            {state.includeThirdParty && result.thirdPartyTotal > 0 && (
              <span className="text-xs text-muted-foreground ml-2">(+{money(result.thirdPartyTotal)})</span>
            )}
          </Label>

          {/* Overhead Items */}
          <div className="space-y-2">
            {state.overhead.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Input placeholder="Name" value={item.name}
                  onChange={(e) => updateOverhead(item.id, { name: e.target.value })} className="w-48 h-8" />
                <Input type="number" step="0.01" placeholder="$/month" value={item.cost}
                  onChange={(e) => updateOverhead(item.id, { cost: Number(e.target.value) })} className="w-32 h-8" />
                <Button size="sm" variant="ghost" className="text-destructive h-8"
                  onClick={() => removeOverhead(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.ohR} onCheckedChange={(v) => updateState({ ohR: !!v })} />
              Include in Retail
            </Label>
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.ohW} onCheckedChange={(v) => updateState({ ohW: !!v })} />
              Include in Wholesale
            </Label>
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={state.ohD} onCheckedChange={(v) => updateState({ ohD: !!v })} />
              Include in Distributor
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Break-Even */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Break-Even Analysis
                <InfoTooltip text="Break-even analysis tells you the minimum number of packs you need to sell to cover all your costs. It divides your fixed costs by the contribution margin (profit per pack before fixed costs). Below this number, you lose money. Above it, you profit. A key metric for any product business." label="Break-Even" />
                <FormulaTooltip
                  label="Break-Even Formula"
                  formula={`Packs needed = Fixed Costs (${money(state.beIncludeOverhead ? result.ohTotal : 0)}) / Contribution Margin per Pack (GP before overhead)`}
                >
                  <span className="ml-2 text-sm font-normal text-muted-foreground cursor-help">
                    (hover for formula)
                  </span>
                </FormulaTooltip>
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Minimum packs to sell to cover costs. Below = loss, above = profit.</p>
          </div>
        </CardHeader>
        <CardContent>
          <Label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
            <Checkbox checked={state.beIncludeOverhead} onCheckedChange={(v) => updateState({ beIncludeOverhead: !!v })} />
            Include Monthly Overhead in Calculation
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: "Retail", units: result.beUnitsR, rev: result.beRevR, contrib: result.retail.gp - result.shipPerPack },
              { title: "Wholesale", units: result.beUnitsW, rev: result.beRevW, contrib: result.wholesale.gp },
              { title: "Distributor", units: result.beUnitsD, rev: result.beRevD, contrib: result.distributor.gp },
              { title: "Blended", units: result.beUnitsB, rev: result.beRevB, contrib: result.bopp + result.ohPerPack },
            ].map((be) => (
              <FormulaTooltip
                key={be.title}
                label={`${be.title} Break-Even`}
                formula={`Fixed Costs / Contribution Margin = ${money(state.beIncludeOverhead ? result.ohTotal : 0)} / ${money3(be.contrib)} = ${isFinite(be.units) ? Math.ceil(be.units).toLocaleString() : "Unprofitable"} packs`}
              >
                <Card className="cursor-help">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-1">{be.title} Break-Even</div>
                    <div className="text-lg font-bold tabular-nums">{formatBE(be.units, be.rev)}</div>
                  </CardContent>
                </Card>
              </FormulaTooltip>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blended KPIs */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Blended Key Performance Indicators
                <InfoTooltip text="Blended KPIs are weighted averages across all channels based on your Order Composition. They show your overall profitability per pack when you factor in the mix of retail, wholesale, and distributor sales. These numbers represent your true per-pack economics." label="Blended KPIs" />
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Weighted-average profitability across all channels, based on order mix.</p>
          </div>
        </CardHeader>
        <CardContent>
          {result.totalPacks === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              Add quantities to the Order Composition to calculate Blended KPIs.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Revenue / Pack", value: money3(result.brev), formula: `Weighted average revenue per pack across all channels = ${money3(result.brev)}` },
                { label: "Gross Profit / Pack", value: money3(result.bgpp), formula: `Revenue − COGS = ${money3(result.brev)} − ${money3(result.cogsPerPack)} = ${money3(result.bgpp)}` },
                { label: "Gross Margin", value: pct(result.bgmp), formula: `GP / Revenue = ${money3(result.bgpp)} / ${money3(result.brev)} = ${pct(result.bgmp)}` },
                { label: "Overhead / Pack", value: money3(result.ohPerPack), formula: `Total Overhead / Monthly Volume = ${money(result.ohTotal)} / ${result.totalMonthlyVolume} = ${money3(result.ohPerPack)}` },
                { label: "Operating Profit / Pack", value: money3(result.bopp), formula: `GP − Overhead = ${money3(result.bgpp)} − ${money3(result.ohPerPack)} = ${money3(result.bopp)}` },
                { label: "Operating Margin", value: pct(result.bomp), formula: `OP / Revenue = ${money3(result.bopp)} / ${money3(result.brev)} = ${pct(result.bomp)}` },
              ].map((kpi) => (
                <FormulaTooltip key={kpi.label} label={kpi.label} formula={kpi.formula}>
                  <Card className="cursor-help">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground">{kpi.label}</div>
                      <div className="text-xl font-bold tabular-nums">{kpi.value}</div>
                    </CardContent>
                  </Card>
                </FormulaTooltip>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Cash Flow Settings */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Cash Flow Settings
                <InfoTooltip text="Cash flow tracks when money actually enters and leaves your bank account — not just when revenue is earned or expenses are incurred. Payment terms determine the timing: customers may pay Net-30 (30 days after sale), while suppliers may require Net-30 after delivery. The gap between paying suppliers and collecting from customers is your cash gap." label="Cash Flow" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Payment terms, lead times, and starting balance drive cash timing. Critical for working capital planning.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">
                Starting Cash ($)
                <InfoTooltip text="Your bank balance at the start of the forecast period. This is the foundation all cash flows build on." label="Starting Cash" />
              </Label>
              <Input type="number" value={state.startingCashBalance} onChange={(e) => updateState({ startingCashBalance: Number(e.target.value) })} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Inventory Lead Time (days)
                <InfoTooltip text="Days from placing a purchase order with your supplier to receiving the goods. Affects when COGS cash outflow happens." label="Lead Time" />
              </Label>
              <Input type="number" value={state.inventoryLeadTimeDays} onChange={(e) => updateState({ inventoryLeadTimeDays: Number(e.target.value) })} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Debt Service / Month ($)
                <InfoTooltip text="Fixed monthly loan or debt payments. Paid regardless of sales volume." label="Debt Service" />
              </Label>
              <Input type="number" value={state.debtServiceMonthly} onChange={(e) => updateState({ debtServiceMonthly: Number(e.target.value) })} className="h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Customer Payment Terms (days after sale)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Retail</Label>
                <Input type="number" value={state.customerPaymentTerms.retailDays} onChange={(e) => updateState({ customerPaymentTerms: { ...state.customerPaymentTerms, retailDays: Number(e.target.value) } })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Wholesale</Label>
                <Input type="number" value={state.customerPaymentTerms.wholesaleDays} onChange={(e) => updateState({ customerPaymentTerms: { ...state.customerPaymentTerms, wholesaleDays: Number(e.target.value) } })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Distributor</Label>
                <Input type="number" value={state.customerPaymentTerms.distributorDays} onChange={(e) => updateState({ customerPaymentTerms: { ...state.customerPaymentTerms, distributorDays: Number(e.target.value) } })} className="h-8" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Capital Expenditures (one-time purchases)</Label>
              <Button size="sm" variant="outline" onClick={() => {
                const newCapEx = [...state.capitalExpenditures, { id: `capex-${Date.now()}`, name: "", amount: 0, month: 1 }];
                updateState({ capitalExpenditures: newCapEx });
              }}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            {state.capitalExpenditures.map((capex) => (
              <div key={capex.id} className="flex items-center gap-2">
                <Input placeholder="Name" value={capex.name} onChange={(e) => {
                  const updated = state.capitalExpenditures.map((c) => c.id === capex.id ? { ...c, name: e.target.value } : c);
                  updateState({ capitalExpenditures: updated });
                }} className="h-8 flex-1" />
                <Input type="number" placeholder="$" value={capex.amount} onChange={(e) => {
                  const updated = state.capitalExpenditures.map((c) => c.id === capex.id ? { ...c, amount: Number(e.target.value) } : c);
                  updateState({ capitalExpenditures: updated });
                }} className="h-8 w-24" />
                <Input type="number" placeholder="Month" min={1} max={12} value={capex.month} onChange={(e) => {
                  const updated = state.capitalExpenditures.map((c) => c.id === capex.id ? { ...c, month: Math.max(1, Math.min(12, Number(e.target.value))) } : c);
                  updateState({ capitalExpenditures: updated });
                }} className="h-8 w-20" />
                <Button size="sm" variant="ghost" className="text-destructive h-8" onClick={() => {
                  const updated = state.capitalExpenditures.filter((c) => c.id !== capex.id);
                  updateState({ capitalExpenditures: updated });
                }}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
