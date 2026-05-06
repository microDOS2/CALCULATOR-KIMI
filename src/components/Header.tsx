import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calculator, Download, FileSpreadsheet, FileText, RotateCcw, Save, Share2 } from "lucide-react";
import type { CalculationResult } from "@/types/calculator";
import { exportResultCSV, exportPDF, exportExcel } from "@/lib/export";
import { Guide } from "@/components/Guide";
import { useState } from "react";

interface HeaderProps {
  onSaveScenario: (label: string) => void;
  onReset: () => void;
  result: CalculationResult;
}

export function Header({ onSaveScenario, onReset, result }: HeaderProps) {
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5" />
          <h1 className="text-lg font-semibold tracking-tight">Channel Calculator</h1>
          <span className="hidden sm:inline text-xs text-muted-foreground">v8 · All-in · Product-agnostic</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Guide />
          <div className="w-px h-6 bg-border mx-1" />
          <Input placeholder="Scenario label..." className="w-40 h-8 text-sm" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button size="sm" variant="default" onClick={() => { onSaveScenario(label); setLabel(""); }}>
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
