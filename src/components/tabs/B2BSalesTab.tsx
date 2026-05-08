import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ToggleLeft, AlertCircle } from "lucide-react";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { money3, pct } from "@/lib/calculator";

interface B2BSalesTabProps {
  state: CalculatorState;
  result: CalculationResult;
  updateState: (patch: Partial<CalculatorState>) => void;
}

export function B2BSalesTab({ state, result, updateState }: B2BSalesTabProps) {
  const noB2B = !state.includeW && !state.includeD;

  return (
    <div className="space-y-6">
      {/* B2B Context Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-teal-100 to-teal-50 border border-teal-200">
        <ToggleLeft className="h-5 w-5 text-teal-600 shrink-0" />
        <p className="text-sm text-teal-800">
          <strong>B2B Sales Channels.</strong> Wholesale and Distributor sell at discounted prices.
          You receive payment when the sale completes — no post-sale commissions.
        </p>
      </div>

      {/* Empty state: no B2B channels */}
      {noB2B && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-amber-800 text-sm">No B2B Channels Enabled</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Both Wholesale and Distributor are currently off. Check at least one B2B channel below to configure B2B sales settings.
                  You must consciously choose which channels to include — nothing is pre-selected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">
              B2B Channel Configuration
              <InfoTooltip
                text="Wholesale = selling to retailers at a discount (e.g., 50% off retail). Distributor = selling through a middleman at an even deeper discount (e.g., 25% off wholesale). Both are B2B transactions — you sell to businesses, not consumers."
                label="B2B Channels"
              />
            </CardTitle>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">Required</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Toggle wholesale and distributor channels. Price cascades: Retail → Wholesale → Distributor.
          </p>
        </CardHeader>
        <CardContent>
          {/* Toggles */}
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={state.includeW}
                onCheckedChange={(v) => updateState({ includeW: !!v })}
              />
              Include Wholesale
            </Label>
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={state.includeD}
                onCheckedChange={(v) => updateState({ includeD: !!v })}
              />
              Include Distributor
            </Label>
          </div>

          {/* B2B Channel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wholesale */}
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-teal-700">Wholesale</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-100 text-teal-700">B2B</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    Wholesale Discount %
                    <InfoTooltip
                      text="Discount off your retail price for wholesale buyers. Example: 50% off $57.50 retail = $28.75 wholesale price."
                      label="Wholesale Discount"
                    />
                  </Label>
                  <Input
                    type="number"
                    className="w-24 h-8"
                    value={state.wDisc}
                    onChange={(e) => updateState({ wDisc: Math.max(0, Math.min(100, Number(e.target.value))) })}
                  />
                </div>

                <div className="p-2 rounded bg-teal-50/50 text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span>Wholesale Price:</span><span>{money3(result.wholesale.price)}</span></div>
                  <div className="flex justify-between"><span>Gross Profit:</span><span className={result.wholesale.gp >= 0 ? "text-green-600" : "text-red-600"}>{money3(result.wholesale.gp)}</span></div>
                  <div className="flex justify-between"><span>Margin:</span><span>{pct(result.wholesale.gm)}</span></div>
                  <div className="flex justify-between"><span>Operating Profit:</span><span className={result.wholesale.op >= 0 ? "text-green-600" : "text-red-600"}>{money3(result.wholesale.op)}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Distributor */}
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-teal-700">Distributor</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-100 text-teal-700">B2B</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    Distributor Discount %
                    <InfoTooltip
                      text="Additional discount off your wholesale price for distributors. Example: 25% off $28.75 wholesale = $21.56 distributor price."
                      label="Distributor Discount"
                    />
                  </Label>
                  <Input
                    type="number"
                    className="w-24 h-8"
                    value={state.dDisc}
                    onChange={(e) => updateState({ dDisc: Math.max(0, Math.min(100, Number(e.target.value))) })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    Import Duty %
                    <InfoTooltip
                      text="Import duty rate applied to the distributor's cost. This regulatory cost is added to the distributor's total cost."
                      label="Import Duty"
                    />
                  </Label>
                  <Input
                    type="number"
                    className="w-24 h-8"
                    value={state.distributorImportDutyRate}
                    onChange={(e) => updateState({ distributorImportDutyRate: Math.max(0, Number(e.target.value)) })}
                  />
                </div>

                <div className="p-2 rounded bg-teal-50/50 text-xs font-mono space-y-1">
                  <div className="flex justify-between"><span>Dist. Price:</span><span>{money3(result.distributor.price)}</span></div>
                  <div className="flex justify-between"><span>+ Import Duty:</span><span>{money3(result.distributorImportDuty)}</span></div>
                  <div className="flex justify-between"><span>= Total Cost:</span><span>{money3(result.distributorCostWithDuty)}</span></div>
                  <div className="flex justify-between"><span>Gross Profit:</span><span className={result.distributor.gp >= 0 ? "text-green-600" : "text-red-600"}>{money3(result.distributor.gp)}</span></div>
                  <div className="flex justify-between"><span>Margin:</span><span>{pct(result.distributor.gm)}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
