import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import type { CalculationResult } from "@/types/calculator";
import { TipBadge } from "@/components/Tooltip";
import { money3, pct } from "@/lib/calculator";

interface SalesChannelsProps {
  result: CalculationResult;
  wDisc: number;
  dDisc: number;
  includeShip: boolean;
  shippingPerPack: number;
  includeR: boolean;
  includeW: boolean;
  includeD: boolean;
  onUpdate: (patch: Partial<Pick<CalculationResult, never>>) => void;
}

export function SalesChannels({
  result,
  wDisc,
  dDisc,
  includeShip,
  shippingPerPack,
  includeR,
  includeW,
  includeD,
  onUpdate,
}: SalesChannelsProps) {
  const updateField = (field: string, value: unknown) => {
    // This is a bit of a hack — the parent will handle the actual state update
    // We just pass the field name and value
    (onUpdate as (patch: Record<string, unknown>) => void)({ [field]: value });
  };

  const ChannelCard = ({
    title,
    price,
    gp,
    gm,
    op,
    om,
    costPerUnit,
    profitPerUnit,
    extra,
  }: {
    title: string;
    price: number;
    gp: number;
    gm: number;
    op: number;
    om: number;
    costPerUnit: number;
    profitPerUnit: number;
    extra?: React.ReactNode;
  }) => (
    <Card className={!includeR && title === "Retail" ? "opacity-60" : !includeW && title === "Wholesale" ? "opacity-60" : !includeD && title === "Distributor" ? "opacity-60" : ""}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <strong>{title}</strong>
          <span className="text-xs text-muted-foreground">{money3(price)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Gross Margin %</Label>
            <Input value={pct(gm)} readOnly className="h-8 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Revenue / Pack</Label>
            <Input value={money3(price)} readOnly className="h-8 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">GP / Pack</Label>
            <Input value={money3(gp)} readOnly className="h-8 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">OP / Pack</Label>
            <Input value={money3(op)} readOnly className="h-8 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">OM %</Label>
            <Input value={pct(om)} readOnly className="h-8 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Cost / Unit</Label>
            <Input value={money3(costPerUnit)} readOnly className="h-8 bg-muted" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Profit / Unit</Label>
            <Input value={money3(profitPerUnit)} readOnly className="h-8 bg-muted" />
          </div>
        </div>
        {extra}
      </CardContent>
    </Card>
  );

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        Sales Channels
        <TipBadge tip="Wholesale and Distributor prices are derived from Retail via discounts." />
      </h2>

      <div className="flex items-center gap-4 flex-wrap">
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={includeR} onCheckedChange={(v) => updateField("includeR", !!v)} />
          Include Retail
        </Label>
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={includeW} onCheckedChange={(v) => updateField("includeW", !!v)} />
          Include Wholesale
        </Label>
        <Label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={includeD} onCheckedChange={(v) => updateField("includeD", !!v)} />
          Include Distributor
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ChannelCard
          title="Retail"
          price={result.retail.price}
          gp={result.retail.gp}
          gm={result.retail.gm}
          op={result.retail.op}
          om={result.retail.om}
          costPerUnit={result.costPerUnit}
          profitPerUnit={result.profitPerUnitR}
          extra={
            <div className="flex items-center gap-2 pt-2">
              <Label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={includeShip}
                  onCheckedChange={(v) => updateField("includeShip", !!v)}
                />
                Include shipping
              </Label>
              <Input
                type="number"
                step="0.01"
                className="w-20 h-8"
                value={shippingPerPack}
                onChange={(e) =>
                  updateField("shippingPerPack", Number(e.target.value))
                }
              />
            </div>
          }
        />
        <ChannelCard
          title="Wholesale"
          price={result.wholesale.price}
          gp={result.wholesale.gp}
          gm={result.wholesale.gm}
          op={result.wholesale.op}
          om={result.wholesale.om}
          costPerUnit={result.costPerUnit}
          profitPerUnit={result.profitPerUnitW}
          extra={
            <div className="space-y-1 pt-2">
              <Label className="text-xs text-muted-foreground">Wholesale Discount %</Label>
              <Input
                type="number"
                step="0.01"
                className="h-8"
                value={wDisc}
                onChange={(e) => updateField("wDisc", Number(e.target.value))}
              />
              {wDisc === 50 && (
                <span className="text-xs text-muted-foreground">Keystone pricing</span>
              )}
            </div>
          }
        />
        <ChannelCard
          title="Distributor"
          price={result.distributor.price}
          gp={result.distributor.gp}
          gm={result.distributor.gm}
          op={result.distributor.op}
          om={result.distributor.om}
          costPerUnit={result.costPerUnit}
          profitPerUnit={result.profitPerUnitD}
          extra={
            <div className="space-y-1 pt-2">
              <Label className="text-xs text-muted-foreground">Distributor Discount %</Label>
              <Input
                type="number"
                step="0.01"
                className="h-8"
                value={dDisc}
                onChange={(e) => updateField("dDisc", Number(e.target.value))}
              />
            </div>
          }
        />
      </div>
    </section>
  );
}
