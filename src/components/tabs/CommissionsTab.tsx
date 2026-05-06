import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import type { CommissionState, CalculationResult } from "@/types/calculator";
import { money, pct } from "@/lib/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";

interface CommissionsTabProps {
  commissions: CommissionState;
  result: CalculationResult;
  onAddVP: () => void;
  onRemoveVP: (id: string) => void;
  onUpdateVP: (id: string, patch: Partial<CommissionState["vps"][0]>) => void;
  onAddRSM: () => void;
  onRemoveRSM: (id: string) => void;
  onUpdateRSM: (id: string, patch: Partial<CommissionState["rsms"][0]>) => void;
  onAddSP: () => void;
  onRemoveSP: (id: string) => void;
  onUpdateSP: (id: string, patch: Partial<CommissionState["sps"][0]>) => void;
  onAddBonus: (spId: string) => void;
  onUpdateBonus: (spId: string, bonusId: string, patch: { metric?: string; thresh?: number; amt?: number }) => void;
  onRemoveBonus: (spId: string, bonusId: string) => void;
  onUpdatePresident: (patch: Partial<CommissionState["president"]>) => void;
}

export function CommissionsTab(props: CommissionsTabProps) {
  const { commissions, result, onAddVP, onRemoveVP, onUpdateVP, onAddRSM, onRemoveRSM, onUpdateRSM,
    onAddSP, onRemoveSP, onUpdateSP, onAddBonus, onUpdateBonus, onRemoveBonus, onUpdatePresident } = props;
  const { president, vps, rsms, sps } = commissions;
  const comm = result.commissionResults;

  const ChannelChecks = ({ chR, chW, chD, onChange }: { chR: boolean; chW: boolean; chD: boolean; onChange: (p: { chR?: boolean; chW?: boolean; chD?: boolean }) => void }) => (
    <div className="flex items-center gap-3 flex-wrap">
      <Label className="flex items-center gap-1 text-xs cursor-pointer">
        <Checkbox checked={chR} onCheckedChange={(v) => onChange({ chR: !!v })} /> Retail
      </Label>
      <Label className="flex items-center gap-1 text-xs cursor-pointer">
        <Checkbox checked={chW} onCheckedChange={(v) => onChange({ chW: !!v })} /> Wholesale
      </Label>
      <Label className="flex items-center gap-1 text-xs cursor-pointer">
        <Checkbox checked={chD} onCheckedChange={(v) => onChange({ chD: !!v })} /> Distributor
      </Label>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* President */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">President of Sales</span>
              <InfoTooltip text="The President of Sales sits at the top of the commission hierarchy and earns an override — a percentage of revenue or a fixed amount per pack sold across all channels they are assigned to. This is a leadership commission paid on top of the team they manage. Set their compensation type (% of revenue or $/pack) and which channels they earn on." label="President of Sales" />
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Top of commission hierarchy. Earns override on assigned channels.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input value={president.name} onChange={(e) => onUpdatePresident({ name: e.target.value })} className="h-8" />
            <Select value={president.type} onValueChange={(v) => onUpdatePresident({ type: v as "pctGrossRev" | "perPack" })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pctGrossRev">% of Gross Revenue</SelectItem>
                <SelectItem value="perPack">$ per Pack Sold</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" step="0.01" value={president.val} onChange={(e) => onUpdatePresident({ val: Number(e.target.value) })} className="h-8" />
          </div>
          <ChannelChecks chR={president.chR} chW={president.chW} chD={president.chD} onChange={(p) => onUpdatePresident(p)} />
        </CardContent>
      </Card>

      {/* VPs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">VPs of Sales</h3>
              <InfoTooltip text="Vice Presidents of Sales manage Regional Sales Managers. Each VP can earn an override commission (percentage of revenue or $/pack) on the channels they are assigned to. You can assign which RSMs report to each VP. Check 'Include in President's Override' if the President should also earn on this VP's sales." label="VPs of Sales" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Manage RSMs. Earn override on assigned channels.</p>
          </div>
          <Button size="sm" variant="outline" onClick={onAddVP}><Plus className="h-4 w-4 mr-1" /> Add VP</Button>
        </div>
        {vps.map((vp) => (
          <Card key={vp.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <Input value={vp.name} onChange={(e) => onUpdateVP(vp.id, { name: e.target.value })} className="h-8" />
                  <Select value={vp.type} onValueChange={(v) => onUpdateVP(vp.id, { type: v as "pctGrossRev" | "perPack" })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pctGrossRev">% of Gross Revenue</SelectItem>
                      <SelectItem value="perPack">$ per Pack Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" step="0.01" value={vp.val} onChange={(e) => onUpdateVP(vp.id, { val: Number(e.target.value) })} className="h-8" />
                </div>
                <Button size="sm" variant="ghost" className="text-destructive ml-2" onClick={() => onRemoveVP(vp.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <ChannelChecks chR={vp.chR} chW={vp.chW} chD={vp.chD} onChange={(p) => onUpdateVP(vp.id, p)} />
              <Label className="flex items-center gap-2 text-xs cursor-pointer">
                <Checkbox checked={vp.includePres} onCheckedChange={(v) => onUpdateVP(vp.id, { includePres: !!v })} />
                Include in President&apos;s Override
              </Label>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RSMs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">Regional Sales Managers</h3>
              <InfoTooltip text="Regional Sales Managers (RSMs) oversee Salespersons in a specific geographic area or market segment. Each RSM earns an override commission on the channels they cover. Assign each RSM to a VP so the commission hierarchy flows correctly (President → VP → RSM → Salesperson)." label="RSMs" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Oversee salespersons. Earn override. Assign to a VP.</p>
          </div>
          <Button size="sm" variant="outline" onClick={onAddRSM}><Plus className="h-4 w-4 mr-1" /> Add RSM</Button>
        </div>
        {rsms.map((rsm) => (
          <Card key={rsm.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                  <Input value={rsm.name} onChange={(e) => onUpdateRSM(rsm.id, { name: e.target.value })} className="h-8" />
                  <Select value={rsm.type} onValueChange={(v) => onUpdateRSM(rsm.id, { type: v as "pctGrossRev" | "perPack" })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pctGrossRev">% of Gross Revenue</SelectItem>
                      <SelectItem value="perPack">$ per Pack Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" step="0.01" value={rsm.val} onChange={(e) => onUpdateRSM(rsm.id, { val: Number(e.target.value) })} className="h-8" />
                  <Select value={rsm.assignedVP || "__none__"} onValueChange={(v) => onUpdateRSM(rsm.id, { assignedVP: v === "__none__" ? "" : v })}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Assign to VP" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {vps.map((vp) => (<SelectItem key={vp.id} value={vp.id}>{vp.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive ml-2" onClick={() => onRemoveRSM(rsm.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <ChannelChecks chR={rsm.chR} chW={rsm.chW} chD={rsm.chD} onChange={(p) => onUpdateRSM(rsm.id, p)} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Salespersons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">Salespersons</h3>
              <InfoTooltip text="Salespersons are the front-line sellers who directly generate revenue. They earn base commission on each sale (percentage of revenue or fixed $/pack) plus performance bonuses when they hit targets. Assign each salesperson to an RSM and optionally to channel-specific VPs. Add target bonuses to incentivize hitting sales milestones." label="Salespersons" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Front-line sellers. Base commission + target bonuses. Assign to RSM.</p>
          </div>
          <Button size="sm" variant="outline" onClick={onAddSP}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        {sps.map((sp) => (
          <Card key={sp.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                  <Input value={sp.name} onChange={(e) => onUpdateSP(sp.id, { name: e.target.value })} className="h-8" />
                  <Select value={sp.type} onValueChange={(v) => onUpdateSP(sp.id, { type: v as "pctGrossRev" | "perPack" })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pctGrossRev">% of Gross Revenue</SelectItem>
                      <SelectItem value="perPack">$ per Pack Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" step="0.01" value={sp.val} onChange={(e) => onUpdateSP(sp.id, { val: Number(e.target.value) })} className="h-8" />
                  <Select value={sp.assignedRSM || "__none__"} onValueChange={(v) => onUpdateSP(sp.id, { assignedRSM: v === "__none__" ? "" : v })}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Assign to RSM" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {rsms.map((rsm) => (<SelectItem key={rsm.id} value={rsm.id}>{rsm.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive ml-2" onClick={() => onRemoveSP(sp.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <ChannelChecks chR={sp.chR} chW={sp.chW} chD={sp.chD} onChange={(p) => onUpdateSP(sp.id, p)} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(["R", "W", "D"] as const).map((ch) => (
                  <Select key={ch} value={sp[`assignedVp_${ch}` as const] || "__none__"}
                    onValueChange={(v) => onUpdateSP(sp.id, { [`assignedVp_${ch}`]: v === "__none__" ? "" : v })}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder={`${ch === "R" ? "Retail" : ch === "W" ? "Wholesale" : "Distributor"} → VP`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {vps.map((vp) => (<SelectItem key={vp.id} value={vp.id}>{vp.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                ))}
              </div>
              {/* Bonuses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Target Bonuses</span>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => onAddBonus(sp.id)}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                </div>
                {sp.bonuses.map((bonus) => (
                  <div key={bonus.id} className="flex items-center gap-2">
                    <Select value={bonus.metric} onValueChange={(v) => onUpdateBonus(sp.id, bonus.id, { metric: v })}>
                      <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="units">Units Sold</SelectItem>
                        <SelectItem value="grossRev">Gross Revenue</SelectItem>
                        <SelectItem value="grossProfit">Gross Profit</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" step="0.01" placeholder="Threshold" value={bonus.thresh}
                      onChange={(e) => onUpdateBonus(sp.id, bonus.id, { thresh: Number(e.target.value) })} className="h-8 w-28" />
                    <Input type="number" step="0.01" placeholder="Bonus $" value={bonus.amt}
                      onChange={(e) => onUpdateBonus(sp.id, bonus.id, { amt: Number(e.target.value) })} className="h-8 w-28" />
                    <Button size="sm" variant="ghost" className="text-destructive h-8" onClick={() => onRemoveBonus(sp.id, bonus.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission Projections Table */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">Commission Projections</h3>
              <InfoTooltip text="This table projects total commission payouts based on your current inputs. It shows base pay, bonuses, and override amounts for each role in the hierarchy. The hierarchy view (indented rows) shows how commissions flow up: Salespersons earn base + bonuses, RSMs and VPs earn overrides on their team's sales, and the President earns the top-level override. Use this to understand your total sales compensation cost." label="Commission Projections" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Projected payouts by role. Shows base, bonus, and override amounts.</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role / Name</TableHead>
                  <TableHead className="text-right">Base Pay</TableHead>
                  <TableHead className="text-right">Bonuses</TableHead>
                  <TableHead className="text-right">Override</TableHead>
                  <TableHead className="text-right">Total Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="font-semibold bg-muted/40">
                  <TableCell>{comm.president.name}</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">{money(comm.president.overridePay)}</TableCell>
                  <TableCell className="text-right">{money(comm.president.totalPay)}</TableCell>
                </TableRow>
                {comm.vps.map((vp) => (
                  <>
                    <TableRow key={vp.id} className="font-medium">
                      <TableCell className="pl-6">{vp.name}</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right">{money(vp.overridePay)}</TableCell>
                      <TableCell className="text-right">{money(vp.totalPay)}</TableCell>
                    </TableRow>
                    {comm.rsms.filter((rsm) => rsm.assignedVP === vp.id).map((rsm) => (
                      <>
                        <TableRow key={rsm.id}>
                          <TableCell className="pl-10">{rsm.name}</TableCell>
                          <TableCell className="text-right">—</TableCell>
                          <TableCell className="text-right">—</TableCell>
                          <TableCell className="text-right">{money(rsm.overridePay)}</TableCell>
                          <TableCell className="text-right">{money(rsm.totalPay)}</TableCell>
                        </TableRow>
                        {comm.sps.filter((sp) => sp.assignedRSM === rsm.id).map((sp) => (
                          <TableRow key={sp.id} className="italic">
                            <TableCell className="pl-14">{sp.name}</TableCell>
                            <TableCell className="text-right">{money(sp.basePay)}</TableCell>
                            <TableCell className="text-right">{money(sp.bonusPay)}</TableCell>
                            <TableCell className="text-right">—</TableCell>
                            <TableCell className="text-right">{money(sp.totalPay)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))}
                  </>
                ))}
                <TableRow className="font-bold border-t-2">
                  <TableCell>Grand Total</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">{money(comm.totalBonus)}</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">
                    {money(comm.sps.reduce((s, sp) => s + sp.totalPay, 0) + comm.rsms.reduce((s, r) => s + r.totalPay, 0) + comm.vps.reduce((s, v) => s + v.totalPay, 0) + comm.president.totalPay)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Total Revenue</div>
                <div className="text-lg font-bold tabular-nums">{money(comm.totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Total OP</div>
                <div className="text-lg font-bold tabular-nums">{money(comm.totalOpProfit)}</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Total Commissions</div>
                <div className="text-lg font-bold tabular-nums">{money(comm.totalComm)}</div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">Comm % of Revenue</div>
                <div className="text-lg font-bold tabular-nums">{pct(comm.commPctGross)}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
