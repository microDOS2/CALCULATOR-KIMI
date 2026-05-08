import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet, FileUp, Download } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface CsvColumn {
  key: string;
  header: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
  example: string;
}

export interface CsvImportCardProps {
  title: string;
  columns: CsvColumn[];
  tooltip: string;
  onImport: (rows: Record<string, string>[]) => void;
  entityName: string; // "ingredient", "employee", etc. for messages
}

function parseCSVText(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const rows = lines.slice(1).map((line) => {
    const cells: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += ch;
      }
    }
    cells.push(cell.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

function validateRows(rows: Record<string, string>[], columns: CsvColumn[]): { valid: Record<string, string>[]; errors: string[] } {
  const errors: string[] = [];
  const valid: Record<string, string>[] = [];

  rows.forEach((row, i) => {
    const rowErrors: string[] = [];
    const normalizedRow: Record<string, string> = {};

    columns.forEach((col) => {
      // Try to find the column value by matching headers (case-insensitive, with aliases)
      let rawValue = "";
      for (const [key, val] of Object.entries(row)) {
        const normalizedKey = key.toLowerCase().replace(/\s/g, "").replace(/_/g, "");
        const normalizedColKey = col.key.toLowerCase().replace(/\s/g, "").replace(/_/g, "");
        if (normalizedKey === normalizedColKey || key.toLowerCase() === col.header.toLowerCase()) {
          rawValue = val;
          break;
        }
      }

      if (col.required && (!rawValue || rawValue.trim() === "")) {
        rowErrors.push(`${col.header} is required`);
      }

      if (col.type === "number" && rawValue) {
        const num = parseFloat(rawValue);
        if (isNaN(num)) {
          rowErrors.push(`${col.header} must be a number, got "${rawValue}"`);
        }
      }

      if (col.type === "boolean" && rawValue) {
        const lower = rawValue.toLowerCase().trim();
        if (!["true", "false", "1", "0", "yes", "no", ""].includes(lower)) {
          rowErrors.push(`${col.header} must be true/false, got "${rawValue}"`);
        }
      }

      normalizedRow[col.key] = rawValue;
    });

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 2}: ${rowErrors.join("; ")}`);
    } else {
      valid.push(normalizedRow);
    }
  });

  return { valid, errors };
}

export function CsvImportCard({ title, columns, tooltip, onImport, entityName }: CsvImportCardProps) {
  const [csvText, setCsvText] = useState("");
  const [useFilePicker, setUseFilePicker] = useState(false);
  const [importResult, setImportResult] = useState<{ valid: Record<string, string>[]; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headerRow = columns.map((c) => c.header).join(",");
  const exampleRow = columns.map((c) => c.example).join(",");
  const placeholderText = `${headerRow}\n${exampleRow}`;

  const handlePreview = () => {
    if (!csvText.trim()) return;
    const { rows } = parseCSVText(csvText);
    const result = validateRows(rows, columns);
    setImportResult(result);
  };

  const handleImport = () => {
    if (!importResult || importResult.valid.length === 0) return;
    onImport(importResult.valid);
    setCsvText("");
    setImportResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      // Auto-preview after file load
      const { rows } = parseCSVText(text);
      const result = validateRows(rows, columns);
      setImportResult(result);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csv = `${headerRow}\n${exampleRow}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityName}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-dashed border-2 bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-900/30 dark:via-blue-950/20 dark:to-transparent shadow-md border-l-4 border-l-blue-400">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-500" />
          {title}
          <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">Tool</span>
          <InfoTooltip text={tooltip} label={title} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Column reference */}
        <p className="text-xs text-muted-foreground">
          Required columns:{" "}
          {columns.map((col, i) => (
            <span key={col.key}>
              <code className={col.required ? "bg-amber-50 text-amber-800 px-1 rounded font-mono font-bold" : "bg-muted px-1 rounded font-mono"}>
                {col.header}
                {col.required && <span className="text-red-500">*</span>}
              </code>
              {i < columns.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        {/* Toggle: paste vs file picker */}
        <div className="flex items-center gap-3">
          <Label className="flex items-center gap-2 text-xs cursor-pointer">
            <Switch checked={useFilePicker} onCheckedChange={setUseFilePicker} />
            <span className={useFilePicker ? "font-medium text-blue-700" : "text-muted-foreground"}>
              {useFilePicker ? "Upload File" : "Paste CSV Text"}
            </span>
          </Label>
          <InfoTooltip text="Choose your preferred input method: paste CSV text directly (great for copying from Excel/Google Sheets) or upload a .csv/.txt file from your computer." label="Input Method" />
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800" onClick={handleDownloadTemplate}>
            <Download className="h-3 w-3 mr-1" /> Download Template
          </Button>
          <InfoTooltip text="Downloads a CSV file with the correct column headers and one example row. Open it in Excel or Google Sheets, fill in your data, then paste or upload it back here. This ensures your columns match exactly what the importer expects." label="Template Download" />
        </div>

        {/* Input: textarea or file picker */}
        {!useFilePicker ? (
          <Textarea
            className="text-xs font-mono h-28"
            placeholder={placeholderText}
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); setImportResult(null); }}
          />
        ) : (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-3.5 w-3.5 mr-1" />
              {csvText ? "File loaded — choose different file" : "Choose CSV File (.csv or .txt)"}
            </Button>
            {csvText && (
              <p className="text-xs text-green-700 bg-green-50 rounded p-1.5">
                <CheckCircle2 className="h-3 w-3 inline mr-1" />
                File loaded: {csvText.split(/\r?\n/).length - 1} row(s) found
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handlePreview} disabled={!csvText.trim()}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          <InfoTooltip text="Validates all rows before importing. Shows how many rows are valid vs. how many have errors. Fix errors in your CSV and click Preview again. Only valid rows can be imported." label="Preview Validation" />
          {importResult && (
            <Button size="sm" onClick={handleImport} disabled={importResult.valid.length === 0}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Import {importResult.valid.length} {entityName}{importResult.valid.length !== 1 ? "s" : ""}
            </Button>
          )}
          {importResult && (
            <InfoTooltip text={`Adds the ${importResult.valid.length} validated ${entityName}(s) to your existing list. Does NOT replace current entries — new entries are appended. Delete duplicates manually if needed.`} label="Import Action" />
          )}
        </div>

        {/* Preview / Results */}
        {importResult && (
          <div className="space-y-2">
            {importResult.errors.length > 0 && (
              <div className="text-xs text-red-600 space-y-0.5 bg-red-50 rounded-md p-2">
                <div className="flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3 w-3" /> {importResult.errors.length} error{importResult.errors.length !== 1 ? "s" : ""}:
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
                {importResult.valid.length} valid {entityName}{importResult.valid.length !== 1 ? "s" : ""} ready to import
              </div>
            )}
            {importResult.valid.length === 0 && importResult.errors.length === 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded-md p-2">
                No {entityName}s found. Check your CSV format matches the expected columns.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
