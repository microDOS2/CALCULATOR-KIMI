import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Megaphone, Users, Receipt } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { MarketingEmployee, MarketingExpense, CalculatorState } from "@/types/calculator";
import { money } from "@/lib/calculator";

interface MarketingTabProps {
  state: CalculatorState;
  updateState: (patch: Partial<CalculatorState>) => void;
  marketingEmployees: MarketingEmployee[];
  marketingExpenses: MarketingExpense[];
  addMarketingEmployee: () => void;
  removeMarketingEmployee: (id: string) => void;
  updateMarketingEmployee: (id: string, patch: Partial<MarketingEmployee>) => void;
  addMarketingExpense: () => void;
  removeMarketingExpense: (id: string) => void;
  updateMarketingExpense: (id: string, patch: Partial<MarketingExpense>) => void;
}

const categoryColors: Record<string, string> = {
  "Digital Ads": "bg-blue-100 text-blue-700 border-blue-300",
  "Trade Shows": "bg-amber-100 text-amber-700 border-amber-300",
  Content: "bg-violet-100 text-violet-700 border-violet-300",
  PR: "bg-pink-100 text-pink-700 border-pink-300",
  Influencer: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  Custom: "bg-slate-100 text-slate-700 border-slate-300",
};

export function MarketingTab({
  state,
  updateState,
  marketingEmployees,
  marketingExpenses,
  addMarketingEmployee,
  removeMarketingEmployee,
  updateMarketingEmployee,
  addMarketingExpense,
  removeMarketingExpense,
  updateMarketingExpense,
}: MarketingTabProps) {
  const [activeSection, setActiveSection] = useState<"employees" | "expenses">("employees");
  const enabled = state.marketingEnabled;

  const totalSalary = marketingEmployees.reduce((s, e) => s + e.salary, 0);
  const totalExpenses = marketingExpenses.reduce((s, e) => s + e.amount, 0);
  const grandTotal = totalSalary + totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-pink-600" />
            Marketing
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Marketing team salaries and channel-tied expenditures
          </p>
        </div>
        <div className="flex items-center gap-3 bg-pink-50 dark:bg-pink-950/30 px-4 py-2 rounded-lg border border-pink-200 dark:border-pink-800">
          <Switch
            checked={enabled}
            onCheckedChange={(v) => updateState({ marketingEnabled: v })}
          />
          <Label className="text-sm font-medium cursor-pointer">
            {enabled ? "Enabled" : "Disabled (Outsourced)"}
          </Label>
          <InfoTooltip text="Toggle to include or exclude all marketing costs from calculations. When disabled, marketing costs are $0 — account for outsourced marketing through the Third Party tab." label="Marketing Toggle" />
        </div>
      </div>

      {!enabled && (
        <Card className="border-dashed border-2 border-pink-200 bg-pink-50/30 dark:bg-pink-950/10">
          <CardContent className="py-8 text-center">
            <Megaphone className="h-10 w-10 text-pink-300 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Marketing is outsourced</p>
            <p className="text-xs text-muted-foreground mt-1">
              All marketing costs are excluded. Account for outsourced marketing through the Third Party tab.
            </p>
          </CardContent>
        </Card>
      )}

      {enabled && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-pink-500 shadow-md bg-gradient-to-br from-white to-pink-50/40">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-pink-700">{money(totalSalary)}</p>
                <p className="text-xs text-muted-foreground">Team Salaries/mo</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-fuchsia-500 shadow-md bg-gradient-to-br from-white to-fuchsia-50/40">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-fuchsia-700">{money(totalExpenses)}</p>
                <p className="text-xs text-muted-foreground">Expenditures/mo</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-rose-500 shadow-md bg-gradient-to-br from-white to-rose-50/40">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-rose-700">{money(grandTotal)}</p>
                <p className="text-xs text-muted-foreground">Total Marketing/mo</p>
              </CardContent>
            </Card>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-2 border-b pb-2">
            <Button
              variant={activeSection === "employees" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("employees")}
              className="gap-1"
            >
              <Users className="h-4 w-4" /> Team ({marketingEmployees.length})
            </Button>
            <Button
              variant={activeSection === "expenses" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("expenses")}
              className="gap-1"
            >
              <Receipt className="h-4 w-4" /> Expenses ({marketingExpenses.length})
            </Button>
          </div>

          {/* Employees Section */}
          {activeSection === "employees" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Marketing Employees</h3>
                <Button size="sm" variant="outline" onClick={addMarketingEmployee}>
                  <Plus className="h-4 w-4 mr-1" /> Add Employee
                </Button>
              </div>

              {marketingEmployees.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    No marketing employees. Click "Add Employee" to add team members.
                  </CardContent>
                </Card>
              )}

              {marketingEmployees.map((emp) => (
                <Card key={emp.id}>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">NAME</span>
                        <Input value={emp.name} onChange={(e) => updateMarketingEmployee(emp.id, { name: e.target.value })} className="pt-5" placeholder="Employee Name" />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">TITLE</span>
                        <Input value={emp.title} onChange={(e) => updateMarketingEmployee(emp.id, { title: e.target.value })} className="pt-5" placeholder="e.g. Marketing Manager" />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">SALARY/MO</span>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                          <Input type="number" step="100" value={emp.salary} onChange={(e) => updateMarketingEmployee(emp.id, { salary: Number(e.target.value) })} className="pl-5 pt-5" placeholder="0" />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 text-xs text-muted-foreground pb-2">
                          Annual: {money(emp.salary * 12)}
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeMarketingEmployee(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Expenses Section */}
          {activeSection === "expenses" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Marketing Expenditures</h3>
                <Button size="sm" variant="outline" onClick={addMarketingExpense}>
                  <Plus className="h-4 w-4 mr-1" /> Add Expense
                </Button>
              </div>

              {marketingExpenses.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    No marketing expenses. Click "Add Expense" to add expenditure categories.
                  </CardContent>
                </Card>
              )}

              {marketingExpenses.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="p-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">CATEGORY</span>
                        <Select value={exp.category} onValueChange={(v) => updateMarketingExpense(exp.id, { category: v as MarketingExpense["category"] })}>
                          <SelectTrigger className="pt-5 h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Digital Ads">Digital Ads</SelectItem>
                            <SelectItem value="Trade Shows">Trade Shows</SelectItem>
                            <SelectItem value="Content">Content</SelectItem>
                            <SelectItem value="PR">PR</SelectItem>
                            <SelectItem value="Influencer">Influencer</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">DESCRIPTION</span>
                        <Input value={exp.name} onChange={(e) => updateMarketingExpense(exp.id, { name: e.target.value })} className="pt-5" placeholder="e.g. Google Ads Q1" />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">AMOUNT/MO</span>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                          <Input type="number" step="100" value={exp.amount} onChange={(e) => updateMarketingExpense(exp.id, { amount: Number(e.target.value) })} className="pl-5 pt-5" placeholder="0" />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <Badge variant="outline" className={`${categoryColors[exp.category]} text-[10px]`}>
                          {exp.category}
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => removeMarketingExpense(exp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Channel Toggles */}
                    <div className="flex items-center gap-4 pt-1 border-t">
                      <span className="text-xs text-muted-foreground">Applies to:</span>
                      {[
                        { key: "retail" as const, label: "Retail", color: "data-[state=checked]:bg-indigo-600" },
                        { key: "wholesale" as const, label: "Wholesale", color: "data-[state=checked]:bg-teal-600" },
                        { key: "distributor" as const, label: "Distributor", color: "data-[state=checked]:bg-teal-600" },
                      ].map((ch) => (
                        <Label key={ch.key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Checkbox
                            checked={exp.channels[ch.key]}
                            onCheckedChange={(v) => updateMarketingExpense(exp.id, { channels: { ...exp.channels, [ch.key]: !!v } })}
                            className={ch.color}
                          />
                          {ch.label}
                        </Label>
                      ))}
                      <InfoTooltip text="Select which channels this marketing expense is tied to. Only included channels will have this cost attributed." label="Channel Attribution" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Expense Summary Table */}
              {marketingExpenses.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Expenditure Summary by Channel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Channel</TableHead>
                          <TableHead className="text-xs text-right">Monthly</TableHead>
                          <TableHead className="text-xs text-right">Annual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { label: "Retail", amount: marketingExpenses.filter((e) => e.channels.retail).reduce((s, e) => s + e.amount, 0) },
                          { label: "Wholesale", amount: marketingExpenses.filter((e) => e.channels.wholesale).reduce((s, e) => s + e.amount, 0) },
                          { label: "Distributor", amount: marketingExpenses.filter((e) => e.channels.distributor).reduce((s, e) => s + e.amount, 0) },
                        ].map((row) => (
                          <TableRow key={row.label}>
                            <TableCell className="text-xs">{row.label}</TableCell>
                            <TableCell className="text-xs text-right">{money(row.amount)}</TableCell>
                            <TableCell className="text-xs text-right">{money(row.amount * 12)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
