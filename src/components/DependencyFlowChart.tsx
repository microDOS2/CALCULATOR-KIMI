import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ArrowRight, ArrowDown, Layers, ShoppingCart, Truck, Building2, Users, DollarSign, TrendingUp, Package, ToggleLeft, BarChart3, Megaphone } from "lucide-react";

type NodeId = string;

interface FlowNode {
  id: NodeId;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  inputs: string[];
  outputs: string[];
  formula?: string;
}

const nodes: FlowNode[] = [
  {
    id: "product",
    label: "Product",
    icon: Package,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Define SKUs, ingredients, packaging",
    inputs: [],
    outputs: ["cogs"],
    formula: "COGS = Ingredients + Packaging",
  },
  {
    id: "cogs",
    label: "COGS / Pack",
    icon: Layers,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Cost to produce one pack",
    inputs: ["product"],
    outputs: ["channels", "cashflow"],
    formula: "COGS/Pack = Ingredient Cost + Packaging Cost",
  },
  {
    id: "channels",
    label: "Channels",
    icon: ShoppingCart,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    description: "Toggle R/W/D on/off. Set prices",
    inputs: ["cogs"],
    outputs: ["shipping", "overhead", "commissions", "affiliates", "marketing", "overrides", "cashflow"],
    formula: "Revenue = Price x Volume per channel",
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: Truck,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    description: "Per-channel carrier costs ($/pack) + employees + materials",
    inputs: ["channels"],
    outputs: ["cashflow"],
    formula: "Ship Cost = Carrier $/pack x Volume + Personnel + Materials + Per-Pack Bonus",
  },
  {
    id: "overhead",
    label: "Overhead",
    icon: Building2,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
    description: "Fixed costs allocated per channel",
    inputs: ["channels"],
    outputs: ["cashflow"],
    formula: "OH/Pack = Total OH / Volume on channels carrying OH",
  },
  {
    id: "commissions",
    label: "Commissions",
    icon: Users,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    description: "B2B sales team (internal)",
    inputs: ["channels"],
    outputs: ["cashflow"],
    formula: "Commission = % of Gross Rev (B2B channels only)",
  },
  {
    id: "affiliates",
    label: "Affiliates",
    icon: Users,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    description: "B2C referral partners (external)",
    inputs: ["channels"],
    outputs: ["cashflow"],
    formula: "Affiliate Commission = % of Retail Revenue",
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
    description: "Marketing employees (salary or hourly) + per-channel expenditures",
    inputs: ["channels"],
    outputs: ["cashflow"],
    formula: "Marketing = Employee Costs + Channel-Tied Ad Spend (Digital, Trade Shows, PR, Influencer)",
  },
  {
    id: "overrides",
    label: "Overrides",
    icon: DollarSign,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    description: "Named individuals on any channel",
    inputs: ["channels"],
    outputs: ["cashflow"],
    formula: "Override = % of Revenue (any channel)",
  },
  {
    id: "cashflow",
    label: "Cash Flow",
    icon: TrendingUp,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    description: "12-month in/out projection",
    inputs: ["channels", "shipping", "overhead", "commissions", "affiliates", "marketing", "overrides"],
    outputs: ["dashboard"],
    formula: "Net Cash = Cash In - Cash Out (COGS + OH + Ship + Comm + Mktg + Overrides)",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300",
    description: "KPIs, sanity checks, audit trail",
    inputs: ["cashflow"],
    outputs: [],
    formula: "Blended Margin, Break-Even, Operating Profit per channel",
  },
];

const edges = [
  { from: "product", to: "cogs", label: "produces" },
  { from: "cogs", to: "channels", label: "subtracts from" },
  { from: "channels", to: "shipping", label: "needs" },
  { from: "channels", to: "overhead", label: "carries" },
  { from: "channels", to: "commissions", label: "generates" },
  { from: "channels", to: "affiliates", label: "feeds" },
  { from: "channels", to: "marketing", label: "promotes" },
  { from: "channels", to: "overrides", label: "feeds" },
  { from: "channels", to: "cashflow", label: "revenue" },
  { from: "shipping", to: "cashflow", label: "cost" },
  { from: "overhead", to: "cashflow", label: "cost" },
  { from: "commissions", to: "cashflow", label: "payout" },
  { from: "affiliates", to: "cashflow", label: "payout" },
  { from: "marketing", to: "cashflow", label: "spend" },
  { from: "overrides", to: "cashflow", label: "payout" },
  { from: "cashflow", to: "dashboard", label: "drives" },
];

export function DependencyFlowChart() {
  const [horizontal, setHorizontal] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activeNode = hoveredNode ? nodes.find((n) => n.id === hoveredNode) || null : null;
  const activeEdges = hoveredNode
    ? edges.filter((e) => e.from === hoveredNode || e.to === hoveredNode)
    : [];

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ToggleLeft className="h-4 w-4 text-sky-500" />
            Model Interdependency Flow
            <InfoTooltip
              text="This diagram shows how every component of your model connects. Hover over any node to see its description, formula, and relationships. Use the toggle to switch between horizontal (left-to-right) and vertical (top-to-bottom) views."
              label="Flow Chart"
            />
          </CardTitle>
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1.5">
              <Switch checked={horizontal} onCheckedChange={setHorizontal} className="scale-75" />
              {horizontal ? "Horizontal View" : "Vertical View"}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={horizontal ? "overflow-x-auto" : ""}>
          {/* Flow visualization */}
          <div
            className={`flex ${horizontal ? "flex-row items-center gap-3 min-w-[800px]" : "flex-col gap-4"} py-2`}
          >
            {/* Row 1: Product → COGS */}
            <div className={`flex ${horizontal ? "flex-row items-center gap-3" : "flex-col gap-2"} ${horizontal ? "" : "w-full"}`}>
              {renderNodePair("product", "cogs", horizontal, hoveredNode, setHoveredNode, activeEdges)}
            </div>

            {/* Arrow to channels */}
            {renderArrow(horizontal)}

            {/* Row 2: Channels (center hub) */}
            <div className={`flex ${horizontal ? "flex-row items-center gap-3" : "flex-col gap-2"} ${horizontal ? "" : "w-full"}`}>
              {renderNode("channels", horizontal, hoveredNode, setHoveredNode, activeEdges)}
            </div>

            {/* Arrow to cost centers */}
            {renderArrow(horizontal)}

            {/* Row 3: Cost Centers */}
            <div className={`flex ${horizontal ? "flex-col gap-2" : "flex-row flex-wrap gap-2"} ${horizontal ? "" : "w-full justify-center"}`}>
              {["shipping", "overhead", "commissions", "affiliates", "marketing", "overrides"].map((id) =>
                <div key={id} className={horizontal ? "" : "flex-1 min-w-[100px] max-w-[140px]"}>
                  {renderNode(id, horizontal, hoveredNode, setHoveredNode, activeEdges)}
                </div>
              )}
            </div>

            {/* Arrow to cash flow */}
            {renderArrow(horizontal)}

            {/* Row 4: Cash Flow */}
            <div className={`flex ${horizontal ? "flex-row items-center gap-3" : "flex-col gap-2"} ${horizontal ? "" : "w-full"}`}>
              {renderNode("cashflow", horizontal, hoveredNode, setHoveredNode, activeEdges)}
            </div>

            {/* Arrow to dashboard */}
            {renderArrow(horizontal)}

            {/* Row 5: Dashboard */}
            <div className={`flex ${horizontal ? "flex-row items-center gap-3" : "flex-col gap-2"} ${horizontal ? "" : "w-full"}`}>
              {renderNode("dashboard", horizontal, hoveredNode, setHoveredNode, activeEdges)}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {activeNode && (
          <div className="mt-4 p-3 rounded-lg border bg-primary/5 text-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <activeNode.icon className={`h-4 w-4 ${activeNode.color}`} />
              <span className="font-semibold">{activeNode.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{activeNode.description}</p>
            {activeNode.formula && (
              <p className="text-xs font-mono text-primary bg-primary/10 rounded px-2 py-1">
                {activeNode.formula}
              </p>
            )}
            {activeEdges.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground pt-1">
                {activeEdges.map((e) => (
                  <span key={`${e.from}-${e.to}`}>
                    {e.from === hoveredNode
                      ? `→ ${nodes.find((n) => n.id === e.to)?.label} (${e.label})`
                      : `← ${nodes.find((n) => n.id === e.from)?.label} (${e.label})`}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-3 border-t text-[10px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-medium">Color Key:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Foundation</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" /> B2C Sales</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Shipping</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Overhead</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" /> Marketing</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Commissions/Overrides</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" /> Dashboard</span>
        </div>
      </CardContent>
    </Card>
  );
}

function renderNode(
  id: string,
  horizontal: boolean,
  hovered: string | null,
  setHovered: (id: string | null) => void,
  activeEdges: Array<{ from: string; to: string; label: string }>
) {
  const node = nodes.find((n) => n.id === id)!;
  const isHovered = hovered === id;
  const isConnected = activeEdges.some((e) => e.from === id || e.to === id);
  const dimmed = hovered && !isHovered && !isConnected;

  const Icon = node.icon;

  return (
    <button
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all ${
        horizontal ? "min-w-[90px]" : "w-full"
      } ${node.bgColor} ${node.borderColor} ${
        isHovered ? "ring-2 ring-offset-1 ring-sky-400 scale-105" : ""
      } ${dimmed ? "opacity-40" : "opacity-100"} hover:shadow-md cursor-pointer text-left`}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
    >
      <Icon className={`h-3.5 w-3.5 shrink-0 ${node.color}`} />
      <div className="min-w-0">
        <p className={`text-[10px] font-semibold ${node.color} truncate`}>{node.label}</p>
        {!horizontal && <p className="text-[9px] text-muted-foreground truncate">{node.description}</p>}
      </div>
    </button>
  );
}

function renderNodePair(
  id1: string,
  id2: string,
  horizontal: boolean,
  hovered: string | null,
  setHovered: (id: string | null) => void,
  activeEdges: Array<{ from: string; to: string; label: string }>
) {
  return (
    <>
      {renderNode(id1, horizontal, hovered, setHovered, activeEdges)}
      {renderSmallArrow(horizontal)}
      {renderNode(id2, horizontal, hovered, setHovered, activeEdges)}
    </>
  );
}

function renderArrow(horizontal: boolean) {
  if (horizontal) {
    return <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
  return <ArrowDown className="h-4 w-4 text-muted-foreground mx-auto" />;
}

function renderSmallArrow(horizontal: boolean) {
  if (horizontal) {
    return <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />;
  }
  return <ArrowDown className="h-3 w-3 text-muted-foreground/50 mx-auto" />;
}
