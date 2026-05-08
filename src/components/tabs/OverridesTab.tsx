import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Info, Plus, Trash2, TrendingDown, UserCog } from "lucide-react";
import type { CalculatorState, CalculationResult } from "@/types/calculator";

interface Props {
  state: CalculatorState;
  result: CalculationResult;
  updateState: (patch: Partial<CalculatorState>) => void;
}

const basisOptions: Array<{ value: "gross" | "net"; label: string; tooltip: string }> = [
  {
    value: "gross",
    label: "Gross Revenue",
    tooltip: "Percentage of total revenue before any deductions (COGS, shipping, taxes)",
  },
  {
    value: "net",
    label: "Net Revenue",
    tooltip: "Percentage of revenue after deducting COGS and channel-specific costs",
  },
];

export function OverridesTab({ state, result, updateState }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  const addOverride = () => {
    const newEntry = {
      id: `ov_${Date.now()}`,
      name: `Override ${state.overrides.length + 1}`,
      percentage: 1,
      channels: {
        retail: state.includeR,
        wholesale: state.includeW,
        distributor: state.includeD,
        affiliate: state.affiliate.enabled,
      },
      basis: "gross" as const,
      enabled: true,
    };
    updateState({ overrides: [...state.overrides, newEntry] });
  };

  const removeOverride = (id: string) => {
    updateState({ overrides: state.overrides.filter((o) => o.id !== id) });
  };

  const updateOverride = (id: string, patch: Partial<CalculatorState["overrides"][0]>) => {
    updateState({
      overrides: state.overrides.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    });
  };

  const totalOverrideCost = result.overrides?.totalOverrideCost ?? 0;
  const activeCount = state.overrides.filter((o) => o.enabled).length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UserCog className="h-6 w-6 text-emerald-600" />
              Overrides
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Named individual payments — a percentage of revenue paid to specific people on any channel
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="gap-1"
          >
            <Info className="h-4 w-4" />
            {showHelp ? "Hide" : "Help"}
          </Button>
        </div>

        {/* Help Banner */}
        {showHelp && (
          <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/80 to-white dark:from-emerald-950/30 dark:to-transparent">
            <CardContent className="pt-4 text-sm space-y-2">
              <p className="font-medium text-emerald-800 dark:text-emerald-200">How Overrides Work</p>
              <p className="text-muted-foreground">
                Overrides are fixed percentage payments made to named individuals (e.g., consultants,
                advisors, partners) based on revenue from selected channels. They are separate from
                Affiliates (external referrals) and Commissions (internal sales team).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div className="bg-white/70 dark:bg-black/20 rounded-md p-2.5">
                  <Badge variant="outline" className="mb-1 text-xs">Gross Revenue</Badge>
                  <p className="text-xs text-muted-foreground">
                    Percentage of total revenue before any deductions
                  </p>
                </div>
                <div className="bg-white/70 dark:bg-black/20 rounded-md p-2.5">
                  <Badge variant="outline" className="mb-1 text-xs">Net Revenue</Badge>
                  <p className="text-xs text-muted-foreground">
                    Percentage of revenue after COGS and channel costs
                  </p>
                </div>
                <div className="bg-white/70 dark:bg-black/20 rounded-md p-2.5">
                  <Badge variant="outline" className="mb-1 text-xs">Channel Selection</Badge>
                  <p className="text-xs text-muted-foreground">
                    Apply the override to any combination of channels
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        <Card className="border-l-4 border-l-emerald-500 shadow-md bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-700">{state.overrides.length}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  ${totalOverrideCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Monthly Cost</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  ${(totalOverrideCost * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Annual Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Override Entries */}
        <div className="space-y-4">
          {state.overrides.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <UserCog className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No overrides configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add your first override payment to track individual payouts
                </p>
                <Button onClick={addOverride} className="mt-4 gap-1" variant="outline">
                  <Plus className="h-4 w-4" />
                  Add Override
                </Button>
              </CardContent>
            </Card>
          )}

          {state.overrides.map((override, idx) => {
            const entryResult = result.overrides?.entries.find((e) => e.name === override.name);
            const monthlyAmount = entryResult?.amount ?? 0;

            return (
              <Card
                key={override.id}
                className={`border-l-4 shadow-md transition-all ${
                  override.enabled
                    ? "border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20"
                    : "border-l-gray-300 bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-900 dark:to-gray-950/10 opacity-70"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={override.enabled ? "default" : "secondary"}
                        className="bg-emerald-600 text-white text-[10px]"
                      >
                        #{idx + 1}
                      </Badge>
                      <Input
                        value={override.name}
                        onChange={(e) =>
                          updateOverride(override.id, { name: e.target.value })
                        }
                        className="w-48 font-semibold"
                        placeholder="Override name"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={override.enabled}
                              onCheckedChange={(checked) =>
                                updateOverride(override.id, { enabled: checked })
                              }
                            />
                            <span className="text-xs text-muted-foreground">
                              {override.enabled ? "Active" : "Off"}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enable or disable this override payment</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOverride(override.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Row 1: Percentage and Basis */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-xs font-medium">
                        Percentage
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage of revenue paid as override</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={override.percentage}
                          onChange={(e) =>
                            updateOverride(override.id, {
                              percentage: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                            })
                          }
                          className="text-right"
                        />
                        <span className="text-sm font-medium text-muted-foreground w-6">%</span>
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs font-medium">Basis</Label>
                      <div className="flex gap-2">
                        {basisOptions.map((option) => (
                          <Tooltip key={option.value}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={override.basis === option.value ? "default" : "outline"}
                                size="sm"
                                onClick={() =>
                                  updateOverride(override.id, { basis: option.value })
                                }
                                className={`flex-1 text-xs ${
                                  override.basis === option.value
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : ""
                                }`}
                              >
                                {option.label}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{option.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Channel Toggles */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Applies to Channels</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          key: "retail" as const,
                          label: "Retail",
                          color: "bg-indigo-100 text-indigo-700 border-indigo-300",
                          activeColor: "bg-indigo-600 text-white",
                          available: state.includeR,
                        },
                        {
                          key: "wholesale" as const,
                          label: "Wholesale",
                          color: "bg-teal-100 text-teal-700 border-teal-300",
                          activeColor: "bg-teal-600 text-white",
                          available: state.includeW,
                        },
                        {
                          key: "distributor" as const,
                          label: "Distributor",
                          color: "bg-teal-100 text-teal-700 border-teal-300",
                          activeColor: "bg-teal-600 text-white",
                          available: state.includeD,
                        },
                        {
                          key: "affiliate" as const,
                          label: "Affiliate",
                          color: "bg-indigo-100 text-indigo-700 border-indigo-300",
                          activeColor: "bg-indigo-600 text-white",
                          available: state.affiliate.enabled,
                        },
                      ].map((ch) => (
                        <Tooltip key={ch.key}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() =>
                                ch.available &&
                                updateOverride(override.id, {
                                  channels: {
                                    ...override.channels,
                                    [ch.key]: !override.channels[ch.key],
                                  },
                                })
                              }
                              disabled={!ch.available}
                              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                !ch.available
                                  ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                                  : override.channels[ch.key]
                                    ? ch.activeColor
                                    : ch.color
                              }`}
                            >
                              {ch.label}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {!ch.available ? (
                              <p>{ch.label} channel is not included in calculations</p>
                            ) : override.channels[ch.key] ? (
                              <p>Click to exclude {ch.label} revenue</p>
                            ) : (
                              <p>Click to include {ch.label} revenue</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Impact Preview */}
                  {override.enabled && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingDown className="h-4 w-4 text-amber-600" />
                        <span className="text-muted-foreground">Monthly impact:</span>
                        <span className="font-semibold text-amber-700">
                          ${monthlyAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({override.percentage}% of{" "}
                          {override.basis === "gross" ? "gross" : "net"} revenue from{" "}
                          {Object.entries(override.channels)
                            .filter(([, v]) => v)
                            .map(([k]) => k)
                            .join(", ") || "no channels"}
                          )
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {state.overrides.length > 0 && (
            <Button onClick={addOverride} variant="outline" className="gap-1 w-full">
              <Plus className="h-4 w-4" />
              Add Another Override
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
