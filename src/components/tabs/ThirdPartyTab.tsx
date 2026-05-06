import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ThirdPartyCompany } from "@/types/calculator";
import { money } from "@/lib/calculator";

interface ThirdPartyTabProps {
  companies: ThirdPartyCompany[];
  updateCompany: (name: string, patch: Partial<ThirdPartyCompany>) => void;
  updateItem: (companyName: string, itemName: string, cost: number) => void;
}

export function ThirdPartyTab({ companies, updateCompany, updateItem }: ThirdPartyTabProps) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const totalMonthly = companies.reduce((sum, c) =>
    c.included ? sum + c.items.reduce((s, i) => s + (Number(i.cost) || 0), 0) : sum, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Total Monthly</div>
            <div className="text-xl font-bold tabular-nums">{money(totalMonthly)}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Total Weekly</div>
            <div className="text-xl font-bold tabular-nums">{money(totalMonthly / 4.33)}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Total Daily</div>
            <div className="text-xl font-bold tabular-nums">{money(totalMonthly / 30.44)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {companies.map((company) => {
          const companyTotal = company.items.reduce((s, i) => s + (Number(i.cost) || 0), 0);
          const isOpen = openMap[company.name] ?? false;
          return (
            <Collapsible key={company.name} open={isOpen} onOpenChange={(v) => setOpenMap((p) => ({ ...p, [company.name]: v }))}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  <span className="font-medium text-sm">{company.name}</span>
                  {company.included && companyTotal > 0 && <span className="text-xs text-muted-foreground">{money(companyTotal)}</span>}
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={company.included} onCheckedChange={(v) => updateCompany(company.name, { included: !!v })} />
                  Include
                </label>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border rounded-b-lg border-t-0 p-3">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Line Item</TableHead>
                          <TableHead className="text-right w-36">Cost ($)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {company.items.map((item, idx) => (
                          <TableRow key={item.name}>
                            <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">
                              <Input type="number" step="0.01" min={0} value={item.cost}
                                onChange={(e) => updateItem(company.name, item.name, Number(e.target.value))}
                                className="h-8 w-32 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
