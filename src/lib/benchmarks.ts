/**
 * Industry benchmarks for supplement/nutraceutical products.
 * Used to provide context on the Executive Dashboard KPI cards.
 * Sources: industry reports, trade associations, aggregated from publicly
 * available data. Users can override if their niche differs significantly.
 */

export interface BenchmarkRange {
  label: string;
  min: number;
  max: number;
  unit: "pct" | "dollars" | "packs" | "ratio";
  source?: string;
}

export const INDUSTRY_BENCHMARKS: Record<string, BenchmarkRange> = {
  blendedGrossMargin: {
    label: "Supplement Industry Gross Margin",
    min: 0.45,
    max: 0.75,
    unit: "pct",
    source: "Industry aggregate",
  },
  retailGrossMargin: {
    label: "Retail Channel GM",
    min: 0.50,
    max: 0.80,
    unit: "pct",
    source: "DTC supplements",
  },
  wholesaleGrossMargin: {
    label: "Wholesale Channel GM",
    min: 0.30,
    max: 0.55,
    unit: "pct",
    source: "B2B distribution",
  },
  cogsAsPercentOfRetail: {
    label: "COGS as % of Retail Price",
    min: 0.20,
    max: 0.45,
    unit: "pct",
    source: "Industry average",
  },
  monthlyChurnRate: {
    label: "Monthly Churn Rate",
    min: 0.03,
    max: 0.12,
    unit: "pct",
    source: "Subscription supplements",
  },
  shippingCostPerPack: {
    label: "Shipping Cost / Pack",
    min: 2.50,
    max: 6.00,
    unit: "dollars",
    source: "US domestic standard",
  },
  breakEvenPacksMonthly: {
    label: "Break-Even Volume (packs/mo)",
    min: 200,
    max: 2000,
    unit: "packs",
    source: "Small-medium supplement brands",
  },
  overheadAsPercentOfRevenue: {
    label: "Overhead as % of Revenue",
    min: 0.10,
    max: 0.25,
    unit: "pct",
    source: "Industry average",
  },
};

export function getBenchmarkStatus(
  key: string,
  value: number
): "above" | "within" | "below" | "unknown" {
  const b = INDUSTRY_BENCHMARKS[key];
  if (!b) return "unknown";
  if (value > b.max) return "above";
  if (value < b.min) return "below";
  return "within";
}

export function formatBenchmarkRange(key: string): string {
  const b = INDUSTRY_BENCHMARKS[key];
  if (!b) return "";
  if (b.unit === "pct") {
    return `${(b.min * 100).toFixed(0)}%-${(b.max * 100).toFixed(0)}%`;
  }
  if (b.unit === "dollars") {
    return `$${b.min.toFixed(2)}-$${b.max.toFixed(2)}`;
  }
  if (b.unit === "packs") {
    return `${b.min.toLocaleString()}-${b.max.toLocaleString()}`;
  }
  return `${b.min}-${b.max}`;
}
