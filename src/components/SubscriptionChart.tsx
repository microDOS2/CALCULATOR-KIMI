import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { SubscriptionPlanResult } from "@/types/calculator";

interface SubscriptionChartProps {
  plan: SubscriptionPlanResult;
}

export function SubscriptionChart({ plan }: SubscriptionChartProps) {
  const maxSubs = Math.max(...plan.months.map((m) => m.endingSubscribers), 1);
  const maxRev = Math.max(...plan.months.map((m) => m.monthlyRevenue), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          Subscriber Growth & Revenue
          <InfoTooltip text="Top bar: subscriber count each month (ending subscribers). Bottom bar: monthly recurring revenue. Watch for the gap between the two — it reveals how churn is eating into your growth even as subscriber count rises." label="Subscriber Chart" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Subscribers */}
        <div className="space-y-0.5 mb-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Subscribers</div>
          <div className="flex items-end gap-0.5 h-16">
            {plan.months.map((m, i) => {
              const pct = (m.endingSubscribers / maxSubs) * 100;
              return (
                <div key={`s-${i}`} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm min-h-[2px]"
                    style={{ height: `${Math.max(3, pct)}%` }}
                    title={`${m.monthLabel}: ${m.endingSubscribers.toLocaleString()} subs`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-0.5">
            {plan.months.slice(0, 12).map((m, i) => (
              <span key={`sl-${i}`} className="flex-1 text-center text-[8px] text-muted-foreground">
                {m.monthLabel.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="space-y-0.5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Revenue</div>
          <div className="flex items-end gap-0.5 h-16">
            {plan.months.map((m, i) => {
              const pct = (m.monthlyRevenue / maxRev) * 100;
              return (
                <div key={`r-${i}`} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t-sm min-h-[2px]"
                    style={{ height: `${Math.max(3, pct)}%` }}
                    title={`${m.monthLabel}: $${m.monthlyRevenue.toLocaleString()}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-0.5">
            {plan.months.slice(0, 12).map((m, i) => (
              <span key={`rl-${i}`} className="flex-1 text-center text-[8px] text-muted-foreground">
                {m.monthLabel.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
