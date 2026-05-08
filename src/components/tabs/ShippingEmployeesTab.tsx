import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Truck, PackageCheck, ExternalLink, Box } from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { ShippingEmployee, ShippingMaterial, CalculatorState } from "@/types/calculator";
import { money } from "@/lib/calculator";

interface ShippingEmployeesTabProps {
  state: CalculatorState;
  updateState: (patch: Partial<CalculatorState>) => void;
  shippingEmployees: ShippingEmployee[];
  shippingMaterials: ShippingMaterial[];
  addShippingEmployee: () => void;
  removeShippingEmployee: (id: string) => void;
  updateShippingEmployee: (id: string, patch: Partial<ShippingEmployee>) => void;
  addShippingMaterial: () => void;
  removeShippingMaterial: (id: string) => void;
  updateShippingMaterial: (id: string, patch: Partial<ShippingMaterial>) => void;
}

export function ShippingEmployeesTab({
  state,
  updateState,
  shippingEmployees,
  shippingMaterials,
  addShippingEmployee,
  removeShippingEmployee,
  updateShippingEmployee,
  addShippingMaterial,
  removeShippingMaterial,
  updateShippingMaterial,
}: ShippingEmployeesTabProps) {
  const enabled = state.shippingEmployeesEnabled;

  const totalSalary = shippingEmployees.reduce((s, e) => s + e.salary, 0);
  const totalPerItem = shippingEmployees.reduce((s, e) => s + (e.perItemBonusEnabled ? e.perItemBonus : 0), 0);
  const totalMaterials = shippingMaterials.reduce((s, m) => s + m.costPerPack, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-cyan-600" />
            Shipping & Logistics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            In-house shipping: carrier cost, materials, and personnel
          </p>
        </div>
        <div className="flex items-center gap-3 bg-cyan-50 dark:bg-cyan-950/30 px-4 py-2 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <Switch
            checked={enabled}
            onCheckedChange={(v) => updateState({ shippingEmployeesEnabled: v })}
          />
          <Label className="text-sm font-medium cursor-pointer">
            {enabled ? "In-House Shipping" : "Outsourced (Use Third Party)"}
          </Label>
          <InfoTooltip text="Toggle to switch between in-house shipping (all costs below) and outsourced shipping (account for through Third Party tab). When outsourced, all shipping employee and material costs are $0." label="Shipping Toggle" />
        </div>
      </div>

      {!enabled && (
        <Card className="border-dashed border-2 border-cyan-200 bg-cyan-50/30 dark:bg-cyan-950/10">
          <CardContent className="py-8 text-center">
            <Truck className="h-10 w-10 text-cyan-300 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Shipping is outsourced</p>
            <p className="text-xs text-muted-foreground mt-1">
              All shipping employee and material costs are excluded.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Account for outsourced logistics through the Third Party tab.
            </p>
          </CardContent>
        </Card>
      )}

      {enabled && (
        <>
          {/* Carrier Cost Reference */}
          <Card className="border-l-4 border-l-amber-500 shadow-md bg-gradient-to-br from-white to-amber-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-amber-600" />
                Carrier Shipping Cost (from Costs tab)
                <InfoTooltip text="This is the per-pack cost you pay the carrier (USPS, UPS, FedEx) to deliver each package. It is configured on the Costs tab and is included in COGS. Shown here for reference only — edit it on the Costs tab." label="Carrier Cost Reference" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center items-end">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">CARRIER COST / PACK</p>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={state.shippingPerPack}
                      onChange={(e) => updateState({ shippingPerPack: Number(e.target.value) })}
                      className="pl-5 h-9 font-bold text-amber-700"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center pb-2">
                  <Label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={state.includeShip}
                      onCheckedChange={(v) => updateState({ includeShip: !!v })}
                      className="data-[state=checked]:bg-green-600"
                    />
                    <span className={state.includeShip ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
                      {state.includeShip ? "In COGS" : "Not in COGS"}
                    </span>
                  </Label>
                </div>
                <div>
                  <p className={`text-lg font-bold ${state.includeShip ? "text-amber-700" : "text-muted-foreground"}`}>
                    {state.includeShip ? (state.useShippingRateTable ? "Rate Table" : "Flat Rate") : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Pricing model</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-700">{money((state.includeShip ? state.shippingPerPack : 0))}/p</p>
                  <p className="text-[10px] text-muted-foreground">Effective cost</p>
                </div>
                <div className="flex items-center justify-center pb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateState({ useShippingRateTable: !state.useShippingRateTable })}
                    className="text-xs"
                  >
                    {state.useShippingRateTable ? "Use Flat Rate" : "Use Rate Table"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-cyan-500 shadow-md bg-gradient-to-br from-white to-cyan-50/40">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-cyan-700">{shippingEmployees.length}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-sky-500 shadow-md bg-gradient-to-br from-white to-sky-50/40">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-sky-700">{money(totalSalary)}</p>
                <p className="text-xs text-muted-foreground">Base Salaries/mo</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-teal-500 shadow-md bg-gradient-to-br from-white to-teal-50/40">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-teal-700">{money(totalPerItem)}</p>
                <p className="text-xs text-muted-foreground">Per-Pack Bonus</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-violet-500 shadow-md bg-gradient-to-br from-white to-violet-50/40">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-violet-700">{money(totalMaterials)}</p>
                <p className="text-xs text-muted-foreground">Materials/pack</p>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Materials Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Box className="h-4 w-4 text-violet-500" />
                Shipping Materials (Variable with Volume)
                <InfoTooltip text="Boxes, tape, labels, bubble wrap, packing peanuts, etc. These are variable costs — the more you ship, the more materials you use. Each material has a per-pack cost that scales with monthly volume. Total materials cost = sum of all per-pack costs × total monthly packs." label="Shipping Materials" />
              </h3>
              <Button size="sm" variant="outline" onClick={addShippingMaterial}>
                <Plus className="h-4 w-4 mr-1" /> Add Material
              </Button>
            </div>

            {shippingMaterials.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-6 text-center text-muted-foreground text-sm">
                  No shipping materials. Click "Add Material" to add boxes, tape, labels, etc.
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shippingMaterials.map((mat) => (
                <Card key={mat.id}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={mat.name}
                        onChange={(e) => updateShippingMaterial(mat.id, { name: e.target.value })}
                        placeholder="Material name"
                        className="h-8 flex-1"
                      />
                      <Button size="sm" variant="ghost" className="text-destructive h-8 w-8 p-0" onClick={() => removeShippingMaterial(mat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={mat.costPerPack}
                        onChange={(e) => updateShippingMaterial(mat.id, { costPerPack: Number(e.target.value) })}
                        placeholder="0.00"
                        className="h-8 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">/pack</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Employee List */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-cyan-500" />
              Shipping Employees
            </h3>
            <Button size="sm" variant="outline" onClick={addShippingEmployee}>
              <Plus className="h-4 w-4 mr-1" /> Add Employee
            </Button>
          </div>

          {shippingEmployees.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                No shipping employees. Click "Add Employee" to add team members.
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {shippingEmployees.map((emp) => (
              <Card key={emp.id} className="overflow-hidden">
                <CardContent className="p-3 space-y-3">
                  {/* Row 1: Name, Title, Salary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">NAME</span>
                      <Input value={emp.name} onChange={(e) => updateShippingEmployee(emp.id, { name: e.target.value })} className="pt-5" placeholder="Employee Name" />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">ROLE / TITLE</span>
                      <Input value={emp.title} onChange={(e) => updateShippingEmployee(emp.id, { title: e.target.value })} className="pt-5" placeholder="e.g. Warehouse Lead" />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">BASE SALARY/MO</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <Input type="number" step="100" value={emp.salary} onChange={(e) => updateShippingEmployee(emp.id, { salary: Number(e.target.value) })} className="pl-5 pt-5" placeholder="0" />
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1 text-xs text-muted-foreground pb-2">
                        Annual: {money(emp.salary * 12)}
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeShippingEmployee(emp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Row 2: Per-Item Bonus Toggle */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={emp.perItemBonusEnabled}
                        onCheckedChange={(v) => updateShippingEmployee(emp.id, { perItemBonusEnabled: !!v })}
                        className="data-[state=checked]:bg-cyan-600"
                      />
                      <Label className="text-xs font-medium cursor-pointer flex items-center gap-1">
                        <PackageCheck className="h-3.5 w-3.5" />
                        Production Bonus (per pack shipped)
                      </Label>
                    </div>

                    {emp.perItemBonusEnabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={emp.perItemBonus}
                          onChange={(e) => updateShippingEmployee(emp.id, { perItemBonus: Number(e.target.value) })}
                          className="w-24 h-8"
                          placeholder="0.00"
                        />
                        <span className="text-xs text-muted-foreground">per pack</span>
                        <InfoTooltip text="This is a variable bonus paid per pack shipped. If a pack ships through any channel, this employee earns the bonus. This is separate from their fixed base salary." label="Per-Item Bonus" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cost Summary */}
          {shippingEmployees.length > 0 || shippingMaterials.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Shipping Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Carrier</p>
                    <p className={`text-lg font-bold ${state.includeShip ? "text-amber-700" : "text-muted-foreground line-through"}`}>
                      {state.includeShip ? money(state.shippingPerPack) : "$0"}/p
                    </p>
                    {!state.includeShip && <p className="text-[10px] text-red-500">Excluded from COGS</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Materials</p>
                    <p className="text-lg font-bold text-violet-700">{money(totalMaterials)}/p</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Personnel (fixed)</p>
                    <p className="text-lg font-bold text-sky-700">{money(totalSalary)}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Personnel (var)</p>
                    <p className="text-lg font-bold text-teal-700">{money(totalPerItem)}/p</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total / pack</p>
                    <p className="text-lg font-bold text-cyan-700">
                      {money((state.includeShip ? state.shippingPerPack : 0) + totalMaterials + totalPerItem)}/p
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
