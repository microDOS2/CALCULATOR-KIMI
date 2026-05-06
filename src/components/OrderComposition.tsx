import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { SKU, OrderItem } from "@/types/calculator";
import { TipBadge } from "@/components/Tooltip";

interface OrderCompositionProps {
  skus: SKU[];
  order: OrderItem[];
  onUpdateQty: (skuId: string, qty: number) => void;
}

export function OrderComposition({ skus, order, onUpdateQty }: OrderCompositionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        Order Composition
        <TipBadge tip="Specify quantities for each SKU. This order mix drives all weighted-average calculations." />
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {skus.map((sku) => {
          const item = order.find((o) => o.skuId === sku.id);
          const qty = item?.qty ?? 0;
          return (
            <Card key={sku.id}>
              <CardContent className="p-3 space-y-2">
                <Label className="text-xs text-muted-foreground">{sku.name}</Label>
                <Input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) =>
                    onUpdateQty(sku.id, Math.max(0, Number(e.target.value)))
                  }
                  className="h-8"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
