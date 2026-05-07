import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top row: branding + main actions */}
      <div className="container mx-auto px-4 sm:px-6 flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <Calculator className="h-5 w-5" />
          <h1 className="text-lg font-semibold tracking-tight hidden sm:block">Channel Calculator</h1>
          <span className="hidden lg:inline text-xs text-muted-foreground">v10</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0">
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <Guide />
            <OnboardingWizard />
          </div>
          <Button size="sm" variant="outline" onClick={onSimulateClick} className="shrink-0 h-8">
            <TrendingUp className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Simulate</span>
          </Button>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button size="sm" variant="ghost" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="h-8 w-8 p-0">
              <Undo className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="h-8 w-8 p-0">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={onToggleUnitSystem} title={`Switch to ${unitSystem === 'mg' ? 'ounces' : 'milligrams'}`} className="shrink-0 h-8 px-2">
            <Scale className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border shrink-0" />
          {/* Label + Note inputs */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Input
              placeholder="Label..."
              className="w-28 lg:w-36 h-8 text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              title="Scenario name"
            />
            <Input
              placeholder="Notes..."
              className="w-28 lg:w-36 h-8 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              title="Optional notes"
            />
          </div>
          <Button size="sm" variant="default" onClick={() => { onSaveScenario(label, note); setLabel(""); setNote(""); }} className="shrink-0 h-8" title="Save scenario">
            <Save className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="shrink-0 h-8 px-2"><Download className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportResultCSV(result, label)}><FileText className="h-4 w-4 mr-2" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportPDF(result, label)}><FileText className="h-4 w-4 mr-2" /> PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportExcel(result, label)}><FileSpreadsheet className="h-4 w-4 mr-2" /> Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" onClick={handleShare} className="shrink-0 h-8 px-2" title="Copy shareable link">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset} className="shrink-0 h-8 w-8 p-0" title="Reset all"><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>
    </header>
  );
}
