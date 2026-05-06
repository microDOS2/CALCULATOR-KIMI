import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { Ingredient, CalculationResult } from "@/types/calculator";
import { TipBadge } from "@/components/Tooltip";
import { money3 } from "@/lib/calculator";

interface IngredientsProps {
  ingredients: Ingredient[];
  result: CalculationResult;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<Ingredient>) => void;
  onRemove: (id: string) => void;
}

export function IngredientsSection({
  ingredients,
  result,
  onAdd,
  onUpdate,
  onRemove,
}: IngredientsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Ingredients / Components
          <TipBadge tip="Define the components of a single unit. Cost is per milligram." />
        </h2>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {ingredients.map((ing) => (
          <div key={ing.id} className="flex items-center gap-2">
            <Input
              placeholder="Name"
              value={ing.name}
              onChange={(e) => onUpdate(ing.id, { name: e.target.value })}
              className="w-40 h-8"
            />
            <Input
              type="number"
              step="0.0001"
              placeholder="mg/unit"
              value={ing.mgPerUnit}
              onChange={(e) =>
                onUpdate(ing.id, { mgPerUnit: Number(e.target.value) })
              }
              className="w-28 h-8"
            />
            <Input
              type="number"
              step="0.000001"
              placeholder="$ / mg"
              value={ing.costPerMg}
              onChange={(e) =>
                onUpdate(ing.id, { costPerMg: Number(e.target.value) })
              }
              className="w-28 h-8"
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => onRemove(ing.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Blended Ingredient Cost / Pack
              <TipBadge tip="Weighted average ingredient cost per pack based on order composition." />
            </div>
            <div className="text-xl font-bold tabular-nums">
              {money3(result.avgIngCostPerPack)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Blended COGS / Pack
              <TipBadge tip="Total cost of goods sold per pack including ingredients, packaging, display, and shipping box." />
            </div>
            <div className="text-xl font-bold tabular-nums">
              {money3(result.cogsPerPack)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Cost / mg
              <TipBadge tip="Average ingredient cost per milligram across all ingredients." />
            </div>
            <div className="text-xl font-bold tabular-nums">
              {result.costPerMg > 0 ? money3(result.costPerMg) : "$0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              Cost / gram
              <TipBadge tip="Average ingredient cost per gram." />
            </div>
            <div className="text-xl font-bold tabular-nums">
              {result.costPerGram > 0 ? money3(result.costPerGram) : "$0"}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
