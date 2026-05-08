import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Search, Trash2, Filter } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { CalculatorState } from "@/types/calculator";

interface AuditLogTabProps {
  state: CalculatorState;
  updateState: (patch: Partial<CalculatorState>) => void;
}

const categoryColors: Record<string, string> = {
  Product: "bg-blue-100 text-blue-700 border-blue-300",
  Ingredients: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Packaging: "bg-teal-100 text-teal-700 border-teal-300",
  Channels: "bg-indigo-100 text-indigo-700 border-indigo-300",
  Shipping: "bg-cyan-100 text-cyan-700 border-cyan-300",
  Overhead: "bg-amber-100 text-amber-700 border-amber-300",
  Tax: "bg-rose-100 text-rose-700 border-rose-300",
  Volume: "bg-violet-100 text-violet-700 border-violet-300",
  "Cash Flow": "bg-sky-100 text-sky-700 border-sky-300",
  Subscriptions: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  Commissions: "bg-orange-100 text-orange-700 border-orange-300",
  Overrides: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Affiliates: "bg-indigo-100 text-indigo-700 border-indigo-300",
  Campaigns: "bg-pink-100 text-pink-700 border-pink-300",
  "Third Party": "bg-slate-100 text-slate-700 border-slate-300",
  System: "bg-gray-100 text-gray-700 border-gray-300",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AuditLogTab({ state, updateState }: AuditLogTabProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allCategories = useMemo(() => {
    const cats = new Set(state.auditLog.map((e) => e.category));
    return ["all", ...Array.from(cats).sort()];
  }, [state.auditLog]);

  const filtered = useMemo(() => {
    let entries = [...state.auditLog].reverse(); // newest first
    if (categoryFilter !== "all") {
      entries = entries.filter((e) => e.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.field.toLowerCase().includes(q) ||
          e.oldValue.toLowerCase().includes(q) ||
          e.newValue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    return entries;
  }, [state.auditLog, categoryFilter, searchQuery]);

  const clearLog = () => {
    updateState({ auditLog: [] });
  };

  const entryCount = state.auditLog.length;
  const filteredCount = filtered.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-rose-600" />
            Change Audit Log
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Every meaningful change to your model — timestamped, categorized, and diffable
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entryCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearLog}
              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <Card className="border-l-4 border-l-rose-500 shadow-md bg-gradient-to-br from-white to-rose-50/40 dark:from-slate-900 dark:to-rose-950/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-700">{entryCount}</p>
              <p className="text-xs text-muted-foreground">Total Entries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-700">
                {new Set(state.auditLog.map((e) => e.category)).size}
              </p>
              <p className="text-xs text-muted-foreground">Categories Touched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-700">
                {state.auditLog.length > 0
                  ? formatRelativeTime(Math.min(...state.auditLog.map((e) => e.timestamp)))
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">First Change</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-700">
                {state.auditLog.length > 0
                  ? formatRelativeTime(Math.max(...state.auditLog.map((e) => e.timestamp)))
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Latest Change</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search field, old value, new value..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InfoTooltip
                text="Filter by category to focus on a specific area of your model. Combine with the search box to drill down to specific fields."
                label="Category Filter"
              />
            </div>
          </div>
          {filteredCount !== entryCount && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {filteredCount} of {entryCount} entries
            </p>
          )}
        </CardContent>
      </Card>

      {/* Log Table */}
      {entryCount === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No changes recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start editing your model — every change will appear here automatically
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-rose-500" />
              Chronological Log
              {filteredCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">{filteredCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="text-xs w-[130px]">Time</TableHead>
                    <TableHead className="text-xs w-[110px]">Category</TableHead>
                    <TableHead className="text-xs">Field</TableHead>
                    <TableHead className="text-xs w-[150px]">Old Value</TableHead>
                    <TableHead className="text-xs w-[150px]">New Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => (
                    <TableRow key={entry.id} className="group hover:bg-muted/50">
                      <TableCell className="text-xs tabular-nums text-muted-foreground py-2">
                        <div>{formatTime(entry.timestamp)}</div>
                        <div className="text-[10px] text-muted-foreground/60">
                          {formatRelativeTime(entry.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${categoryColors[entry.category] || "bg-gray-100 text-gray-700"}`}
                        >
                          {entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium py-2 max-w-[200px] truncate" title={entry.field}>
                        {entry.field}
                      </TableCell>
                      <TableCell className="text-xs text-red-600/80 py-2 max-w-[150px] truncate" title={entry.oldValue}>
                        {entry.oldValue}
                      </TableCell>
                      <TableCell className="text-xs text-green-600/80 font-medium py-2 max-w-[150px] truncate" title={entry.newValue}>
                        {entry.newValue}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
