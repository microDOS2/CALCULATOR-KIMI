import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

export interface CsvExportButtonProps {
  data: Record<string, string | number | boolean>[];
  columns: { key: string; header: string }[];
  filename: string;
  label?: string;
  tooltip?: string;
}

function escapeCSV(val: string | number | boolean): string {
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function CsvExportButton({ data, columns, filename, label = "Export CSV", tooltip }: CsvExportButtonProps) {
  const handleExport = () => {
    if (data.length === 0) return;
    const header = columns.map((c) => c.header).join(",");
    const rows = data.map((row) =>
      columns.map((c) => escapeCSV(row[c.key])).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleExport}
      disabled={data.length === 0}
      className="text-xs"
    >
      <Download className="h-3.5 w-3.5 mr-1" /> {label}
      {tooltip && <InfoTooltip text={tooltip} label={label} />}
    </Button>
  );
}
