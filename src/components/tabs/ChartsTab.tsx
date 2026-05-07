import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CalculatorState, CalculationResult } from "@/types/calculator";
import { InfoTooltip } from "@/components/InfoTooltip";
import { TornadoChart } from "@/components/TornadoChart";
import { money3 } from "@/lib/calculator";

interface ChartsTabProps {
  state: CalculatorState;
  result: CalculationResult;
}

export function ChartsTab({ state, result }: ChartsTabProps) {
  if (result.totalPacks === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                Visual Analytics
                <InfoTooltip text="Charts provide a visual representation of your cost structure and channel profitability. The pie chart breaks down what goes into each pack's cost — ingredients, packaging, shipping, overhead. The bar chart compares revenue, gross profit, and operating profit across all three channels. Use these to quickly identify your biggest cost drivers and most profitable channel." label="Charts" />
              </CardTitle>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Auto</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Visual breakdown of costs and channel profitability. Requires order quantities.</p>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          Add quantities to the Order Composition to see charts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sensitivity Tornado */}
      <TornadoChart state={state} />

      {/* Cost Breakdown Pie */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-base">
              Cost Breakdown per Pack
              <InfoTooltip text="This pie chart shows the composition of costs in each pack you sell. Each slice represents a cost category — ingredients, packaging, shipping to customer, and allocated overhead. The largest slices are your biggest cost drivers. Use this to identify where cost reduction would have the most impact on your margins." label="Cost Pie Chart" />
            </CardTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">What goes into each pack's cost. Largest slices = biggest cost reduction opportunities.</p>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={result.costBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${money3(value)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {result.costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => money3(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Channel Profits Bar */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-base">
              Channel Profit Comparison
              <InfoTooltip text="This bar chart compares the three sales channels side by side. For each channel, you see Revenue (total money coming in), Gross Profit (revenue minus direct costs), and Operating Profit (gross profit minus overhead and shipping). The channel with the highest operating profit per pack is your most profitable channel. Use this to decide where to focus sales efforts." label="Channel Bar Chart" />
            </CardTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">Compare revenue, gross profit, and operating profit across all channels.</p>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={result.channelProfits} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => money3(v as number)} />
              <Tooltip formatter={(v: number) => money3(v)} />
              <Legend />
              <Bar dataKey="gp" name="Gross Profit" fill="#10b981" />
              <Bar dataKey="op" name="Operating Profit" fill="#3b82f6" />
              <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
