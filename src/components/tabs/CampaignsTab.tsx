import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Tag } from "lucide-react";
import type { Campaign } from "@/types/calculator";
import { money3 } from "@/lib/calculator";

interface CampaignsTabProps {
  campaigns: Campaign[];
  campaignImpact: { totalRevenueAtRisk: number; totalMarginCompression: number; netAnnualEffect: number; affectedChannels: string[] };
  onUpdate: (campaigns: Campaign[]) => void;
}

export function CampaignsTab({ campaigns, campaignImpact, onUpdate }: CampaignsTabProps) {
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
                        <label className="text-xs text-muted-foreground">Discount %</label>
                        <Input
                          type="number"
                          className="h-8"
                          value={campaign.discountPercent}
                          onChange={(e) => updateCampaign(campaign.id, { discountPercent: Math.max(0, Math.min(100, Number(e.target.value))) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Duration (weeks)</label>
                        <Input
                          type="number"
                          className="h-8"
                          value={campaign.durationWeeks}
                          onChange={(e) => updateCampaign(campaign.id, { durationWeeks: Math.max(1, Number(e.target.value)) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Volume Uplift %</label>
                        <Input
                          type="number"
                          className="h-8"
                          value={campaign.expectedVolumeUplift}
                          onChange={(e) => updateCampaign(campaign.id, { expectedVolumeUplift: Math.max(0, Number(e.target.value)) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Channels</label>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Campaign Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                <div className="text-xs text-muted-foreground">Revenue At Risk</div>
                <div className="text-lg font-bold text-red-600">{money3(campaignImpact.totalRevenueAtRisk)}</div>
                <div className="text-xs text-muted-foreground">Discounted revenue vs. normal</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                <div className="text-xs text-muted-foreground">Margin Compression</div>
                <div className="text-lg font-bold text-amber-600">{money3(campaignImpact.totalMarginCompression)}</div>
                <div className="text-xs text-muted-foreground">Profit lost to discounts</div>
              </div>
              <div className={`p-3 rounded-lg ${campaignImpact.netAnnualEffect >= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                <div className="text-xs text-muted-foreground">Net Annual Effect</div>
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
