import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CalculationResult } from "@/types/calculator";
import { money3 } from "@/lib/calculator";

interface ChartsTabProps {
  result: CalculationResult;
}

export function ChartsTab({ result }: ChartsTabProps) {
  if (result.totalPacks === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Add quantities to the Order Composition to see charts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cost Breakdown Pie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Breakdown per Pack</CardTitle>
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
          <CardTitle className="text-base">Channel Profit Comparison</CardTitle>
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
