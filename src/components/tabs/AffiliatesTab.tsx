import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Users, Percent, MousePointer, TrendingUp, DollarSign, ShoppingCart, Clock, Wallet, BarChart3 } from "lucide-react";
import type { CalculatorState, CalculationResult, AffiliateTier } from "@/types/calculator";
import { money3 } from "@/lib/calculator";

interface AffiliatesTabProps {
  state: CalculatorState;
  result: CalculationResult;
  updateState: (patch: Partial<CalculatorState>) => void;
}

export function AffiliatesTab({ state, result, updateState }: AffiliatesTabProps) {
  const af = state.affiliate;
  const tier = af.tiers.find((t) => t.id === af.activeTierId) || af.tiers[0];
  const afResult = result.affiliate;

  const updateTier = (tierId: string, patch: Partial<AffiliateTier>) => {
    const updated = af.tiers.map((t) => (t.id === tierId ? { ...t, ...patch } : t));
    updateState({ affiliate: { ...af, tiers: updated } });
  };

  return (
    <div className="space-y-6">
      {/* B2C Context Banner */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-50 border border-indigo-200">
        <Users className="h-5 w-5 text-indigo-600 shrink-0" />
        <p className="text-sm text-indigo-800">
          <strong>B2C Sales Channel.</strong> Affiliates drive customers to your retail storefront at the same price as direct sales.
          You pay commission <em>after</em> the sale completes — unlike wholesale/distributor which use upfront discounts.
        </p>
      </div>

      {/* Enable Toggle */}
      <Card className="border-l-4 border-l-indigo-400">
        <CardContent className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={af.enabled}
              onCheckedChange={(v) => updateState({ affiliate: { ...af, enabled: v } })}
            />
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                {af.enabled ? "Affiliate Sales Enabled" : "Affiliate Sales Disabled"}
                <InfoTooltip
                  text="When enabled, affiliate-driven sales are modeled as a separate stream within your B2C revenue. Affiliates refer customers who buy at your retail price. You pay them a commission after the sale. This differs from Wholesale and Distributor which use upfront discounted pricing."
                  label="Enable Affiliates"
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {af.enabled
                  ? `Projected monthly revenue: ${money3(afResult.grossRevenue)} | Commission: ${money3(afResult.initialCommission)}`
                  : "Toggle to model affiliate-driven retail sales"}
              </p>
            </div>
          </div>
          <Badge variant={af.enabled ? "default" : "outline"} className={af.enabled ? "bg-indigo-500" : ""}>
            {af.enabled ? "Active" : "Off"}
          </Badge>
        </CardContent>
      </Card>

      {af.enabled && (
        <>
          {/* Tier Selector */}
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Commission Tier:</Label>
            <Select
              value={af.activeTierId || (af.tiers[0]?.id ?? "")}
              onValueChange={(v) => updateState({ affiliate: { ...af, activeTierId: v } })}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {af.tiers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commission Configuration */}
          <Card className="border-dashed border-2 bg-gradient-to-br from-indigo-100 via-indigo-50 to-white shadow-md border-l-4 border-l-indigo-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Percent className="h-5 w-5 text-indigo-500" />
                Initial Sale Commission
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Config</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Type + Rate */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    Commission Type
                    <InfoTooltip text="Percentage = % of the sale amount (e.g., 20% of $57.50 = $11.50). Flat per pack = fixed dollar amount per unit sold. Flat per order = fixed dollar amount per transaction regardless of quantity." label="Commission Type" />
                  </Label>
                  <Select
                    value={tier?.initialType || "percentage"}
                    onValueChange={(v) => tier && updateTier(tier.id, { initialType: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat_per_pack">Flat per Pack ($)</SelectItem>
                      <SelectItem value="flat_per_order">Flat per Order ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    {tier?.initialType === "percentage" ? "Rate (%)" : "Amount ($)"}
                    <InfoTooltip text={tier?.initialType === "percentage" ? "Percentage of the commission basis paid to the affiliate for each initial sale." : "Fixed dollar amount paid per pack or per order."} label="Commission Rate" />
                  </Label>
                  <Input
                    type="number"
                    value={tier?.initialRate ?? 20}
                    onChange={(e) => tier && updateTier(tier.id, { initialRate: Number(e.target.value) })}
                    className="h-8"
                    step={tier?.initialType === "percentage" ? 1 : 0.01}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    Basis
                    <InfoTooltip text="What the commission is calculated on. Product only = retail price excluding shipping and tax. Product + shipping = includes shipping cost. Total = includes everything (price + shipping + tax)." label="Commission Basis" />
                  </Label>
                  <Select
                    value={tier?.initialBasis || "product_only"}
                    onValueChange={(v) => tier && updateTier(tier.id, { initialBasis: v as any })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product_only">Product Only</SelectItem>
                      <SelectItem value="product_plus_shipping">Product + Shipping</SelectItem>
                      <SelectItem value="total">Total (incl. Tax)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Attribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <MousePointer className="h-3 w-3 text-indigo-400" />
                    Attribution Model
                    <InfoTooltip text="First Click = the affiliate who first referred the customer gets credit for all sales (good for content creators). Last Click = the affiliate whose link was clicked most recently before purchase gets credit (good for deal sites). First Click typically results in lower total commission costs but may discourage 'closer' affiliates." label="Attribution Model" />
                  </Label>
                  <Select
                    value={af.attributionModel}
                    onValueChange={(v) => updateState({ affiliate: { ...af, attributionModel: v as any } })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first_click">First Click (content friendly)</SelectItem>
                      <SelectItem value="last_click">Last Click (conversion friendly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3 text-indigo-400" />
                    Cookie Duration (days)
                    <InfoTooltip text="How many days the affiliate tracking cookie stays active. If the customer purchases within this window, the affiliate gets credit. Longer cookies favor content creators (bloggers, YouTubers). Shorter cookies favor deal sites. Default 60 days per AffiliateWP standard." label="Cookie Duration" />
                  </Label>
                  <Input
                    type="number"
                    value={af.cookieDays}
                    onChange={(e) => updateState({ affiliate: { ...af, cookieDays: Math.max(1, Number(e.target.value)) } })}
                    className="h-8"
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume Assumptions */}
          <Card className="border-dashed border-2 bg-gradient-to-br from-indigo-100 via-indigo-50 to-white shadow-md border-l-4 border-l-indigo-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Volume & Conversion Assumptions
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Input</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3 text-indigo-400" />
                    Monthly New Referrals
                    <InfoTooltip text="How many new customers you expect affiliates to refer each month. This is the top of your affiliate funnel. Combined with click-to-purchase rate and average order size, it drives your affiliate revenue projection." label="Monthly Referrals" />
                  </Label>
                  <Input
                    type="number"
                    value={af.monthlyNewReferrals}
                    onChange={(e) => updateState({ affiliate: { ...af, monthlyNewReferrals: Math.max(0, Number(e.target.value)) } })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3 text-indigo-400" />
                    Avg Order (packs)
                    <InfoTooltip text="Average number of packs per affiliate-referred order. Higher values mean more revenue per referral but also higher commission payouts (if using percentage-based commission)." label="Average Order Size" />
                  </Label>
                  <Input
                    type="number"
                    value={af.avgOrderPacks}
                    onChange={(e) => updateState({ affiliate: { ...af, avgOrderPacks: Math.max(1, Number(e.target.value)) } })}
                    className="h-8"
                    min={1}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Percent className="h-3 w-3 text-indigo-400" />
                    Click-to-Purchase Rate (%)
                    <InfoTooltip text="Percentage of affiliate link clicks that result in a purchase within the cookie window. Industry average for supplements is 3-8%. Higher rates mean more efficient affiliate marketing but may require higher-quality traffic." label="Click-to-Purchase Rate" />
                  </Label>
                  <Input
                    type="number"
                    value={af.clickToPurchaseRate}
                    onChange={(e) => updateState({ affiliate: { ...af, clickToPurchaseRate: Math.max(0, Math.min(100, Number(e.target.value))) } })}
                    className="h-8"
                    step={0.1}
                  />
                </div>
              </div>

              {/* Payout Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-dashed">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-indigo-400" />
                    Payout Day of Month
                    <InfoTooltip text="Day of the month when affiliate commissions are paid out. Default is the 15th. Commissions are accumulated throughout the month and paid on this date of the following month." label="Payout Day" />
                  </Label>
                  <Input
                    type="number"
                    value={af.payoutDayOfMonth}
                    onChange={(e) => updateState({ affiliate: { ...af, payoutDayOfMonth: Math.max(1, Math.min(28, Number(e.target.value))) } })}
                    className="h-8"
                    min={1}
                    max={28}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-indigo-400" />
                    Min Payout Threshold ($)
                    <InfoTooltip text="Minimum accumulated commission amount before an affiliate receives a payout. If their balance is below this threshold, it rolls forward to the next payout period. This reduces transaction fees and administrative overhead." label="Min Payout Threshold" />
                  </Label>
                  <Input
                    type="number"
                    value={tier?.minPayoutThreshold ?? 50}
                    onChange={(e) => tier && updateTier(tier.id, { minPayoutThreshold: Math.max(0, Number(e.target.value)) })}
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Summary */}
          <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Monthly Affiliate Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-white/80">
                  <p className="text-xs text-muted-foreground">Gross Revenue</p>
                  <p className="text-xl font-bold text-indigo-700">{money3(afResult.grossRevenue)}</p>
                  <p className="text-[10px] text-muted-foreground">{afResult.monthlyReferrals} referrals × {afResult.monthlyPacks} packs</p>
                </div>
                <div className="p-3 rounded-lg bg-white/80">
                  <p className="text-xs text-muted-foreground">Commission Cost</p>
                  <p className="text-xl font-bold text-red-600">{money3(afResult.initialCommission)}</p>
                  <p className="text-[10px] text-muted-foreground">{afResult.commissionAsPercentOfRevenue.toFixed(1)}% of revenue</p>
                </div>
                <div className="p-3 rounded-lg bg-white/80">
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className="text-xl font-bold text-green-600">{money3(afResult.netProfit)}</p>
                  <p className="text-[10px] text-muted-foreground">After COGS + commission</p>
                </div>
                <div className="p-3 rounded-lg bg-white/80">
                  <p className="text-xs text-muted-foreground">Commission/Pack</p>
                  <p className="text-xl font-bold text-amber-600">{money3(afResult.monthlyPacks > 0 ? afResult.initialCommission / afResult.monthlyPacks : 0)}</p>
                  <p className="text-[10px] text-muted-foreground">Per pack sold</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
