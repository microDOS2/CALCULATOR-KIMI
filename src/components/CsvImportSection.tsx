import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import type { Ingredient } from "@/types/calculator";
import { MG_PER_OZ } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";

interface CsvImportSectionProps {
  existingIngredients: Ingredient[];
  unitSystem: 'mg' | 'oz';
  setIngredients: (ingredients: Ingredient[]) => void;
}

function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
  return { headers, rows };
}

function parseIngredients(rows: string[][], headers: string[], unitSystem: 'mg' | 'oz'): { valid: Ingredient[]; errors: string[] } {
  const valid: Ingredient[] = [];
  const errors: string[] = [];

  const nameIdx = headers.indexOf("name");
  const mgIdx = headers.indexOf("mgperunit") || headers.indexOf("mg") || headers.indexOf("amount");
  const costIdx = headers.indexOf("costpermg") || headers.indexOf("cost") || headers.indexOf("price");
  const daysIdx = headers.indexOf("supplierpaymentdays") || headers.indexOf("paymentdays") || headers.indexOf("days");

  if (nameIdx === -1 || mgIdx === -1 || costIdx === -1) {
    errors.push("CSV must have columns: name, mgPerUnit (or mg/amount), costPerMg (or cost/price)");
    return { valid, errors };
  }

  rows.forEach((row, i) => {
    const name = row[nameIdx]?.trim();
    const mgVal = parseFloat(row[mgIdx]);
    const costVal = parseFloat(row[costIdx]);
    const days = daysIdx >= 0 ? parseInt(row[daysIdx], 10) || 30 : 30;

    if (!name || isNaN(mgVal) || isNaN(costVal)) {
      errors.push(`Row ${i + 2}: Invalid data (name='${name}', mg=${row[mgIdx]}, cost=${row[costIdx]})`);
      return;
    }

    const mgPerUnit = unitSystem === 'mg' ? mgVal : mgVal * MG_PER_OZ;
    const costPerMg = unitSystem === 'mg' ? costVal : costVal / MG_PER_OZ;

    valid.push({
      id: `ing-csv-${Date.now()}-${i}`,
      name,
      mgPerUnit,
      costPerMg,
      supplierPaymentDays: days,
      moqTiers: [],
    });
  });

  return { valid, errors };
}

export function CsvImportSection({ existingIngredients, unitSystem, setIngredients }: CsvImportSectionProps) {
  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<{ valid: Ingredient[]; errors: string[] } | null>(null);

  const handlePreview = () => {
    const { headers, rows } = parseCSV(csvText);
    const result = parseIngredients(rows, headers, unitSystem);
    setImportResult(result);
  };

  const handleImport = () => {
    if (!importResult || importResult.valid.length === 0) return;
    setIngredients([...existingIngredients, ...importResult.valid]);
    setCsvText("");
    setImportResult(null);
  };

  return (
    <Card className="border-dashed border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          CSV Bulk Import
          <InfoTooltip
            text="Paste a CSV spreadsheet to bulk-import ingredients in seconds. Supports: name, mgPerUnit, costPerMg, supplierPaymentDays columns. Import 20+ ingredients at once instead of entering them one by one."
            label="CSV Import"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-xs text-muted-foreground">
          Paste CSV with columns:{" "}
          <code className="bg-muted px-1 rounded font-mono">name, mgPerUnit, costPerMg, supplierPaymentDays</code>
        </p>
        <Textarea
          className="text-xs font-mono h-28"
          placeholder={`name,mgPerUnit,costPerMg,supplierPaymentDays\nVitamin C,500,0.0002,30\nZinc (Elemental),25,0.001,30\nMagnesium Glycinate,200,0.00015,30\nAshwagandha Root,300,0.00008,45\nTurmeric Curcumin,400,0.00012,30`}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handlePreview} disabled={!csvText.trim()}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          {importResult && (
            <Button size="sm" onClick={handleImport} disabled={importResult.valid.length === 0}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Import {importResult.valid.length} ingredient{importResult.valid.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {importResult && (
          <div className="space-y-2">
            {importResult.errors.length > 0 && (
              <div className="text-xs text-red-600 space-y-0.5 bg-red-50 rounded-md p-2">
                <div className="flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" /> {importResult.errors.length} error{importResult.errors.length !== 1 ? 's' : ''}:
                </div>
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <div key={i} className="pl-4">{err}</div>
                ))}
                {importResult.errors.length > 5 && (
                  <div className="pl-4">...and {importResult.errors.length - 5} more</div>
                )}
              </div>
            )}
            {importResult.valid.length > 0 && (
              <div className="text-xs text-green-700 bg-green-50 rounded-md p-2 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {importResult.valid.length} valid ingredient{importResult.valid.length !== 1 ? 's' : ''} ready to import
              </div>
            )}
            {importResult.valid.length === 0 && importResult.errors.length === 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded-md p-2">
                No ingredients found. Check your CSV format matches the expected columns.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
