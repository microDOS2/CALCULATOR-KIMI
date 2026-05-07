import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Ingredient } from "@/types/calculator";
import { MG_PER_OZ } from "@/lib/calculator";

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
  const [showImport, setShowImport] = useState(false);

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
    setShowImport(false);
  };

  return (
    <div className="pt-2 border-t">
      <button
        onClick={() => setShowImport(!showImport)}
        className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1"
      >
        <Upload className="h-3 w-3" />
        {showImport ? "Hide" : "Bulk import ingredients from CSV"}
      </button>

      {showImport && (
        <Card className="mt-2">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Paste CSV with columns: <code className="bg-muted px-1 rounded">name, mgPerUnit, costPerMg, supplierPaymentDays</code>
              <br />
              Example: <code className="bg-muted px-1 rounded">Vitamin C, 500, 0.0002, 30</code>
            </p>
            <Textarea
              className="text-xs font-mono h-24"
              placeholder={`name,mgPerUnit,costPerMg,supplierPaymentDays\nVitamin C,500,0.0002,30\nZinc,25,0.001,30`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePreview} disabled={!csvText.trim()}>
                Preview
              </Button>
              {importResult && (
                <Button size="sm" onClick={handleImport} disabled={importResult.valid.length === 0}>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Import {importResult.valid.length} ingredients
                </Button>
              )}
            </div>

            {importResult && (
              <div className="space-y-1">
                {importResult.errors.length > 0 && (
                  <div className="text-xs text-red-500 space-y-0.5">
                    <div className="flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {importResult.errors.length} errors:
                    </div>
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                    {importResult.errors.length > 5 && (
                      <div>...and {importResult.errors.length - 5} more</div>
                    )}
                  </div>
                )}
                {importResult.valid.length > 0 && (
                  <div className="text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    {importResult.valid.length} valid ingredients ready to import
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
