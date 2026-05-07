import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calculator, Download, FileSpreadsheet, FileText, Redo, RotateCcw, Save, Share2, Scale, TrendingUp, Undo } from "lucide-react";
import type { CalculationResult } from "@/types/calculator";
import { exportResultCSV, exportPDF, exportExcel } from "@/lib/export";
import { Guide } from "@/components/Guide";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useState } from "react";

interface HeaderProps {
  onSaveScenario: (label: string, note?: string) => void;
  onReset: () => void;
  result: CalculationResult;
  unitSystem: 'mg' | 'oz';
  onToggleUnitSystem: () => void;
  onSimulateClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Header({ onSaveScenario, onReset, result, unitSystem, onToggleUnitSystem, onSimulateClick, onUndo, onRedo, canUndo, canRedo }: HeaderProps) {
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 flex h-16 items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5" />
          <h1 className="text-lg font-semibold tracking-tight">Channel Calculator</h1>
          <span className="hidden sm:inline text-xs text-muted-foreground">v10 · Simulate · Cash Flow · All Features</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Guide />
          <OnboardingWizard />
          <Button size="sm" variant="outline" onClick={onSimulateClick}>
            <TrendingUp className="h-4 w-4 mr-1" /> Simulate
          </Button>
          <div className="flex items-center gap-0.5">
            <Button size="sm" variant="ghost" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={onToggleUnitSystem} title={`Switch to ${unitSystem === 'mg' ? 'ounces' : 'milligrams'}`}>
            <Scale className="h-4 w-4 mr-1" /> {unitSystem === 'mg' ? 'mg' : 'oz'}
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <div className="flex flex-col gap-1">
            <Input placeholder="Scenario label..." className="w-48 h-8 text-sm" value={label} onChange={(e) => setLabel(e.target.value)} title="Give your scenario a descriptive name" />
            <Textarea
              placeholder="Notes (e.g., 'Aggressive Q4 pricing for investor pitch')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-48 min-h-[36px] text-xs py-1 resize-none"
              title="Add descriptive notes to remember why you saved this scenario"
            />
          </div>
          <Button size="sm" variant="default" onClick={() => { onSaveScenario(label, note); setLabel(""); setNote(""); }} title="Save current model state with label and notes">
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportResultCSV(result, label)}><FileText className="h-4 w-4 mr-2" /> Download CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportPDF(result, label)}><FileText className="h-4 w-4 mr-2" /> Download PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportExcel(result, label)}><FileSpreadsheet className="h-4 w-4 mr-2" /> Download Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" /> {copied ? "Copied!" : "Share"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset}><RotateCcw className="h-4 w-4 mr-1" /> Reset</Button>
        </div>
      </div>
    </header>
  );
}
