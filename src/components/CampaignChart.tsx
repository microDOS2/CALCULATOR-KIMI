import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { Campaign } from "@/types/calculator";
import { money3 } from "@/lib/calculator";

interface CampaignChartProps {
  campaigns: Campaign[];
  campaignImpact: { totalRevenueAtRisk: number; totalMarginCompression: number; netAnnualEffect: number; affectedChannels: string[] };
  baseRetailPrice: number;
  baseWholesalePrice: number;
  baseDistributorPrice: number;
  baseVolume: number;
}
// campaignImpact is used via parent component, kept for interface completeness

export function CampaignChart({ campaigns, baseRetailPrice, baseWholesalePrice, baseDistributorPrice, baseVolume }: CampaignChartProps) {
  if (campaigns.length === 0) return null;

  const normalWeeklyVolume = baseVolume / 4.33;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          Campaign Revenue Impact
          <InfoTooltip text="Shows normal weekly revenue (blue) vs. campaign-period weekly revenue (green) for each affected channel. If the green bar is taller despite the discount, the volume uplift is strong enough to offset the price cut." label="Campaign Chart" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const discounted = 1 - campaign.discountPercent / 100;
            const uplifted = 1 + campaign.expectedVolumeUplift / 100;

            const channels = [] as { name: string; normal: number; campaign: number }[];

            if (campaign.affectedChannels.retail) {
              channels.push({
                name: "Retail",
                normal: normalWeeklyVolume * baseRetailPrice,
                campaign: normalWeeklyVolume * uplifted * baseRetailPrice * discounted,
              });
            }
            if (campaign.affectedChannels.wholesale) {
              channels.push({
                name: "Wholesale",
                normal: normalWeeklyVolume * baseWholesalePrice,
                campaign: normalWeeklyVolume * uplifted * baseWholesalePrice * discounted,
              });
            }
            if (campaign.affectedChannels.distributor) {
              channels.push({
                name: "Distributor",
                normal: normalWeeklyVolume * baseDistributorPrice,
                campaign: normalWeeklyVolume * uplifted * baseDistributorPrice * discounted,
              });
            }

            const maxVal = Math.max(...channels.flatMap((c) => [c.normal, c.campaign]), 1);

            return (
              <div key={campaign.id} className="space-y-1 border-b last:border-0 pb-2">
                <div className="text-xs font-medium">{campaign.name}</div>
                {channels.map((ch) => {
                  const normalPct = (ch.normal / maxVal) * 100;
                  const campaignPct = (ch.campaign / maxVal) * 100;
                  return (
                    <div key={ch.name} className="space-y-0.5">
                      <div className="text-[10px] text-muted-foreground">{ch.name}</div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-12">Normal</span>
                          <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-sm" style={{ width: `${normalPct}%` }} />
                          </div>
                          <span className="text-[9px] tabular-nums w-12 text-right">{money3(ch.normal)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-12">{campaign.discountPercent}% off</span>
                          <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                            <div className={`h-full rounded-sm ${ch.campaign >= ch.normal ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${campaignPct}%` }} />
                          </div>
                          <span className="text-[9px] tabular-nums w-12 text-right">{money3(ch.campaign)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
