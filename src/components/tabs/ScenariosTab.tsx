import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2, Upload, Download, FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [importStatus, setImportStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filtered = scenarios.filter((s) => (s.label || "").toLowerCase().includes(filter.toLowerCase()));

  const handleExportFile = (scenario: Scenario) => {
    const payload = {
      version: 1,
      app: "Channel Calculator",
      exportedAt: new Date().toISOString(),
      scenario: {
        label: scenario.label,
        note: scenario.note,
        savedAt: scenario.savedAt,
        inputs: scenario.inputs,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (scenario.label || "scenario").replace(/[^a-z0-9]/gi, "-").toLowerCase();
    a.download = `${safeName}.channelcalc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text);
        if (!data.scenario?.inputs) {
          setImportStatus({ ok: false, msg: "Invalid .channelcalc file — missing scenario data." });
          return;
        }
        const imported: Scenario = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          savedAt: data.scenario.savedAt || new Date().toLocaleString(),
          label: data.scenario.label || "Imported Scenario",
          note: (data.scenario.note || "") + " [imported from file]",
          inputs: data.scenario.inputs,
        };
        onLoad(imported);
        setImportStatus({ ok: true, msg: `Successfully imported "${imported.label}". Model state restored.` });
      } catch {
        setImportStatus({ ok: false, msg: "Failed to parse file. Make sure it's a valid .channelcalc file." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">
                  Saved Scenarios
                  <InfoTooltip text="Scenarios let you save a complete snapshot of your entire calculator configuration. Export as .channelcalc files to share or backup. Import .channelcalc files to restore a scenario from a file. Files are plain JSON — you can inspect them in any text editor." label="Scenarios" />
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Filter scenarios..." className="w-48 h-8" value={filter} onChange={(e) => setFilter(e.target.value)} />
                <Button size="sm" variant="ghost" onClick={onClear}><Trash2 className="h-4 w-4 mr-1" /> Clear all</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Save complete calculator snapshots. Export as .channelcalc files. Import from files. Stored locally in your browser.</p>
          </div>
        </CardHeader>
      </Card>

      {/* Import from file */}
      <div className="flex items-center gap-3 flex-wrap">
        <input ref={fileInputRef} type="file" accept=".channelcalc,.json" onChange={handleImportFile} className="hidden" />
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <FileUp className="h-4 w-4 mr-1" /> Import .channelcalc File
        </Button>
        <InfoTooltip text="Select a .channelcalc file (previously exported from this calculator) to restore that scenario's full model state. The file is a JSON format — you can open it in a text editor to inspect the data." label="Import Scenario File" />
        {importStatus && (
          <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${importStatus.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {importStatus.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {importStatus.msg}
          </div>
        )}
      </div>

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
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell className="text-muted-foreground text-sm">{scenario.savedAt}</TableCell>
                  <TableCell className="font-medium">{scenario.label || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{scenario.note || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => onLoad(scenario)} title="Restore this scenario"><Upload className="h-4 w-4 mr-1" /> Load</Button>
                    <Button size="sm" variant="ghost" className="text-slate-600 ml-1" onClick={() => handleExportFile(scenario)} title="Download as .channelcalc file"><Download className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive ml-1" onClick={() => onDelete(scenario.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
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
