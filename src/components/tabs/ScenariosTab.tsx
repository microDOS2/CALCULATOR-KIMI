import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2, Upload } from "lucide-react";
import type { Scenario } from "@/types/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";

interface ScenariosTabProps {
  scenarios: Scenario[];
  onLoad: (scenario: Scenario) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function ScenariosTab({ scenarios, onLoad, onDelete, onClear }: ScenariosTabProps) {
  const [filter, setFilter] = useState("");
  const filtered = scenarios.filter((s) => (s.label || "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">
                  Saved Scenarios
                  <InfoTooltip text="Scenarios let you save a complete snapshot of your entire calculator configuration — all SKUs, ingredients, packaging, channels, costs, commissions, and third-party settings. Load a saved scenario to restore that exact configuration. Compare different business models by saving multiple scenarios (e.g., 'Budget Option', 'Premium Option', 'Wholesale-Only'). Scenarios are stored in your browser's local storage and persist between sessions." label="Scenarios" />
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Filter scenarios..." className="w-48 h-8" value={filter} onChange={(e) => setFilter(e.target.value)} />
                <Button size="sm" variant="ghost" onClick={onClear}><Trash2 className="h-4 w-4 mr-1" /> Clear all</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Save complete calculator snapshots. Load to compare business models. Stored locally in your browser.</p>
          </div>
        </CardHeader>
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {scenarios.length === 0
            ? "No scenarios saved yet. Configure the calculator and click Save in the header to store a scenario."
            : "No scenarios match your filter."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Saved At</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell className="text-muted-foreground text-sm">{scenario.savedAt}</TableCell>
                  <TableCell className="font-medium">{scenario.label || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onLoad(scenario)}><Upload className="h-4 w-4 mr-1" /> Load</Button>
                    <Button size="sm" variant="ghost" className="text-destructive ml-1" onClick={() => onDelete(scenario.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
