import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Tag } from "lucide-react";
import type { Campaign } from "@/types/calculator";
import { money3 } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";
import { CampaignChart } from "@/components/CampaignChart";

interface CampaignsTabProps {
  campaigns: Campaign[];
  campaignImpact: { totalRevenueAtRisk: number; totalMarginCompression: number; netAnnualEffect: number; affectedChannels: string[] };
  baseRetailPrice: number;
  baseWholesalePrice: number;
  baseDistributorPrice: number;
  baseVolume: number;
  onUpdate: (campaigns: Campaign[]) => void;
}

export function CampaignsTab({ campaigns, campaignImpact, baseRetailPrice, baseWholesalePrice, baseDistributorPrice, baseVolume, onUpdate }: CampaignsTabProps) {
  const addCampaign = () => {
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: "New Campaign",
      discountPercent: 20,
      durationWeeks: 2,
      affectedChannels: { retail: true, wholesale: false, distributor: false },
      expectedVolumeUplift: 50,
    };
    onUpdate([...campaigns, newCampaign]);
  };

  const updateCampaign = (id: string, patch: Partial<Campaign>) => {
    onUpdate(campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCampaign = (id: string) => {
    onUpdate(campaigns.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Campaigns & Promotions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Model time-boxed promotions like "Black Friday: 20% off for 2 weeks." The calculator shows revenue at risk, margin compression, and net annual effect.
            <InfoTooltip text="Create a campaign with discount %, duration in weeks, and expected volume uplift. The calculator compares normal revenue vs. discounted revenue to show the net effect. If volume uplift from the discount outweighs the price cut, net effect is positive." label="Campaign Modeling" />
          </p>

          {campaigns.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              No campaigns configured. Add one to model promotion impact.
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        className="h-8 w-48 font-medium"
                        value={campaign.name}
                        onChange={(e) => updateCampaign(campaign.id, { name: e.target.value })}
                      />
                      <Button size="sm" variant="ghost" className="text-destructive h-8"
                        onClick={() => removeCampaign(campaign.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          Discount %
                          <InfoTooltip text="Percentage off the regular price during the campaign. E.g., 20 means customers pay 80% of normal price." label="Discount %" />
                        </label>
                        <Input
                          type="number"
                          className="h-8"
                          value={campaign.discountPercent}
                          onChange={(e) => updateCampaign(campaign.id, { discountPercent: Math.max(0, Math.min(100, Number(e.target.value))) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          Duration (weeks)
                          <InfoTooltip text="How many weeks the promotion runs. Longer campaigns increase total revenue at risk but also extend the volume uplift period." label="Duration" />
                        </label>
                        <Input
                          type="number"
                          className="h-8"
                          value={campaign.durationWeeks}
                          onChange={(e) => updateCampaign(campaign.id, { durationWeeks: Math.max(1, Number(e.target.value)) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          Volume Uplift %
                          <InfoTooltip text="Expected increase in sales volume due to the discount. E.g., 50 means you expect to sell 1.5x normal volume. If uplift is high enough, it can offset the discount and produce a positive net effect." label="Volume Uplift" />
                        </label>
                        <Input
                          type="number"
                          className="h-8"
                          value={campaign.expectedVolumeUplift}
                          onChange={(e) => updateCampaign(campaign.id, { expectedVolumeUplift: Math.max(0, Number(e.target.value)) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          Channels
                          <InfoTooltip text="Which channels the discount applies to. R = Retail, W = Wholesale, D = Distributor. You can apply the campaign to one, two, or all three channels." label="Channels" />
                        </label>
                        <div className="flex items-center gap-2 text-xs">
                          <label className="flex items-center gap-1">
                            <Checkbox
                              checked={campaign.affectedChannels.retail}
                              onCheckedChange={(v) => updateCampaign(campaign.id, { affectedChannels: { ...campaign.affectedChannels, retail: !!v } })}
                            /> R
                          </label>
                          <label className="flex items-center gap-1">
                            <Checkbox
                              checked={campaign.affectedChannels.wholesale}
                              onCheckedChange={(v) => updateCampaign(campaign.id, { affectedChannels: { ...campaign.affectedChannels, wholesale: !!v } })}
                            /> W
                          </label>
                          <label className="flex items-center gap-1">
                            <Checkbox
                              checked={campaign.affectedChannels.distributor}
                              onCheckedChange={(v) => updateCampaign(campaign.id, { affectedChannels: { ...campaign.affectedChannels, distributor: !!v } })}
                            /> D
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button size="sm" variant="outline" className="mt-3" onClick={addCampaign}>
            <Plus className="h-4 w-4 mr-1" /> Add Campaign
          </Button>
        </CardContent>
      </Card>

      {campaigns.length > 0 && (
        <CampaignChart
          campaigns={campaigns}
          campaignImpact={campaignImpact}
          baseRetailPrice={baseRetailPrice}
          baseWholesalePrice={baseWholesalePrice}
          baseDistributorPrice={baseDistributorPrice}
          baseVolume={baseVolume}
        />
      )}

      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campaign Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  Revenue At Risk
                  <InfoTooltip text="Difference between what you would have earned at full price vs. what you earn at the discounted price (before volume uplift). This is the 'cost' of running the promotion." label="Revenue At Risk" />
                </div>
                <div className="text-lg font-bold text-red-600">{money3(campaignImpact.totalRevenueAtRisk)}</div>
                <div className="text-xs text-muted-foreground">Discounted revenue vs. normal</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  Margin Compression
                  <InfoTooltip text="Total gross profit lost because you're selling at a lower price per unit. This is (Normal Price - Discounted Price) x Units Sold during the campaign period." label="Margin Compression" />
                </div>
                <div className="text-lg font-bold text-amber-600">{money3(campaignImpact.totalMarginCompression)}</div>
                <div className="text-xs text-muted-foreground">Profit lost to discounts</div>
              </div>
              <div className={`p-3 rounded-lg ${campaignImpact.netAnnualEffect >= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  Net Annual Effect
                  <InfoTooltip text="The bottom line: (Discounted Revenue x Volume Uplift) - (Normal Revenue x Normal Volume). Positive = the extra volume from the promotion more than offsets the discount. Negative = the discount costs more than the uplift gains." label="Net Annual Effect" />
                </div>
                <div className={`text-lg font-bold ${campaignImpact.netAnnualEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {campaignImpact.netAnnualEffect >= 0 ? '+' : ''}{money3(campaignImpact.netAnnualEffect)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {campaignImpact.netAnnualEffect >= 0 ? 'Uplift outweighs discount' : 'Discount outweighs uplift'}
                </div>
              </div>
            </div>
            {campaignImpact.affectedChannels.length > 0 && (
              <div className="text-xs text-muted-foreground pt-1">
                Affected channels: {campaignImpact.affectedChannels.join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
