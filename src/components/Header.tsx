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
import { FeatureList } from "@/components/FeatureList";
import { TutorialButton } from "@/components/TutorialWalkthrough";
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
          <span className="hidden lg:inline text-xs text-muted-foreground">v12</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0">
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <TutorialButton />
            <FeatureList />
            <Guide />
            <OnboardingWizard />
          </div>
          <Button size="sm" onClick={onSimulateClick} className="shrink-0 h-8 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 hover:border-amber-400 font-medium shadow-sm">
            <TrendingUp className="h-4 w-4 mr-1 text-amber-600" /> <span className="hidden sm:inline">Simulate</span>
          </Button>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button size="sm" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="h-8 w-8 p-0 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-40 shadow-sm">
              <Undo className="h-4 w-4 text-slate-500" />
            </Button>
            <Button size="sm" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="h-8 w-8 p-0 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-40 shadow-sm">
              <Redo className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
          <Button size="sm" onClick={onToggleUnitSystem} title={`Switch to ${unitSystem === 'mg' ? 'ounces' : 'milligrams'}`} className="shrink-0 h-8 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 shadow-sm">
            <Scale className="h-4 w-4 text-cyan-600" />
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
          <Button size="sm" onClick={() => { onSaveScenario(label, note); setLabel(""); setNote(""); }} className="shrink-0 h-8 bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 hover:border-green-400 shadow-sm" title="Save scenario">
            <Save className="h-4 w-4 text-green-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="shrink-0 h-8 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"><Download className="h-4 w-4 text-blue-600" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportResultCSV(result, label)}><FileText className="h-4 w-4 mr-2 text-blue-500" /> CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportPDF(result, label)}><FileText className="h-4 w-4 mr-2 text-red-500" /> PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportExcel(result, label)}><FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" /> Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleShare} className="shrink-0 h-8 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm" title="Copy shareable link">
            <Share2 className="h-4 w-4 text-indigo-600" />
          </Button>
          <Button size="sm" onClick={onReset} className="shrink-0 h-8 w-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm" title="Reset all">
            <RotateCcw className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}