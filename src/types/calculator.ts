export interface PackagingLayer {
  id: string;
  name: string;
  costPerUnit: number;
  unitsPerLayer: number;
  weightPerUnit: number; // in grams
  included: boolean;
}

export interface MoqTier {
  minOrderMg: number; // minimum total order quantity in mg to qualify
  costPerMg: number;
}

export interface Campaign {
  id: string;
  name: string;
  discountPercent: number;
  durationWeeks: number;
  affectedChannels: { retail: boolean; wholesale: boolean; distributor: boolean };
  expectedVolumeUplift: number;
}

export interface Ingredient {
  id: string;
  name: string;
  mgPerUnit: number;
  costPerMg: number;
  supplierPaymentDays: number; // days to pay supplier after delivery
  moqTiers: MoqTier[];
}

export interface SKU {
  id: string;
  name: string;
  unitsPerPack: number;
  retailPrice: number;
  mixR: number;
  mixW: number;
  mixD: number;
  packaging: PackagingLayer[];
}

export interface OrderItem {
  skuId: string;
  qty: number;
}

export interface OverheadItem {
  id: string;
  name: string;
  cost: number;
}

export interface MonthlyVolume {
  skuId: string;
  qty: number;
}

export interface Salesperson {
  id: string;
  name: string;
  type: 'pctGrossRev' | 'perPack';
  val: number;
  chR: boolean;
  chW: boolean;
  chD: boolean;
  assignedRSM: string;
  assignedVp_R: string;
  assignedVp_W: string;
  assignedVp_D: string;
  bonuses: Bonus[];
}

export interface Bonus {
  id: string;
  metric: 'units' | 'grossRev' | 'grossProfit';
  thresh: number;
  amt: number;
}

export interface RSM {
  id: string;
  name: string;
  type: 'pctGrossRev' | 'perPack';
  val: number;
  chR: boolean;
  chW: boolean;
  chD: boolean;
  assignedVP: string;
}

export interface VP {
  id: string;
  name: string;
  type: 'pctGrossRev' | 'perPack';
  val: number;
  chR: boolean;
  chW: boolean;
  chD: boolean;
  includePres: boolean;
}

export interface President {
  name: string;
  type: 'pctGrossRev' | 'perPack';
  val: number;
  chR: boolean;
  chW: boolean;
  chD: boolean;
}

export interface CommissionState {
  president: President;
  vps: VP[];
  rsms: RSM[];
  sps: Salesperson[];
}

export interface ThirdPartyCompany {
  name: string;
  included: boolean;
  items: ThirdPartyItem[];
}

export interface ThirdPartyItem {
  name: string;
  cost: number;
}

export interface ChannelCalc {
  price: number;
  gp: number;
  gm: number;
  op: number;
  om: number;
  costPerUnit: number;
  profitPerUnit: number;
}

export interface CalculationResult {
  unitSystem: 'mg' | 'oz';
  skus: SKU[];
  order: OrderItem[];
  ingredients: Ingredient[];
  overhead: OverheadItem[];
  monthlyVolumes: MonthlyVolume[];
  wDisc: number;
  dDisc: number;
  includeShip: boolean;
  shippingPerPack: number;
  shippingRateBrackets: ShippingRateBracket[];
  useShippingRateTable: boolean;
  ohR: boolean;
  ohW: boolean;
  ohD: boolean;
  includeThirdParty: boolean;
  includeR: boolean;
  includeW: boolean;
  includeD: boolean;
  beIncludeOverhead: boolean;
  retailSalesTaxRate: number;
  distributorImportDutyRate: number;
  campaigns: Campaign[];

  // Per-SKU packaging costs
  skuPackagingCosts: { skuId: string; skuName: string; packagingCosts: { id: string; name: string; costPerPack: number }[]; totalCostPerPack: number; totalWeightPerPack: number }[];
  totalPackagingCostPerPack: number; // weighted average across SKUs

  // Ingredient costs
  avgIngCostPerPack: number;
  totalIngCostPerPack: number;

  // COGS
  cogsPerPack: number;

  // Channel prices
  retail: ChannelCalc;
  wholesale: ChannelCalc;
  distributor: ChannelCalc;

  // Tax & regulatory
  retailPriceWithTax: number;
  retailTaxAmount: number;
  distributorImportDuty: number;
  distributorCostWithDuty: number;

  // Derived prices
  avgPriceR: number;
  avgPriceW: number;
  avgPriceD: number;
  retailerProfit: number;
  distProfit: number;

  // Overhead
  ohTotal: number;
  thirdPartyTotal: number;
  ohPerPack: number;
  ohPerPackR: number;
  ohPerPackW: number;
  ohPerPackD: number;
  overheadPerUnit: number;

  // Shipping
  shipPerPack: number;

  // Blended
  brev: number;
  bgpp: number;
  bgmp: number;
  bopp: number;
  bomp: number;
  weightedUnitsPerPack: number;

  // Per-unit
  costPerUnit: number;
  profitPerUnitR: number;
  profitPerUnitW: number;
  profitPerUnitD: number;
  costPerMg: number;
  costPerGram: number;
  totalMgPerPack: number;
  totalWeightPerUnit: number; // total ingredient weight per unit (mg)
  totalWeightPerPack: number; // total ingredient weight per pack (mg)
  totalPackagingWeightPerPack: number; // total packaging weight per pack (grams)
  totalUnitWeightPerPack: number; // combined ingredient + packaging weight per pack (grams)

  // Break-even
  beUnitsR: number;
  beRevR: number;
  beUnitsW: number;
  beRevW: number;
  beUnitsD: number;
  beRevD: number;
  beUnitsB: number;
  beRevB: number;

  // PO
  poLineItems: POLineItem[];
  poGrandTotals: POGrandTotals;

  // Commissions
  commissionResults: CommissionResults;

  // Totals
  totalPacks: number;
  totalUnits: number;
  totalMonthlyVolume: number;

  // Chart data
  costBreakdown: ChartSlice[];
  channelProfits: ChartBar[];

  // Inherited from state
  commissions: CommissionState;
  thirdPartyCompanies: ThirdPartyCompany[];

  // Campaign impact
  campaignImpact: {
    totalRevenueAtRisk: number;
    totalMarginCompression: number;
    netAnnualEffect: number;
    affectedChannels: string[];
  };

  // Subscription projections
  subscriptionPlans: SubscriptionPlan[];
  subscriptionSummary: SubscriptionSummary;

  // Cash flow
  cashFlow: CashFlowResult;
}

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface ChartBar {
  name: string;
  gp: number;
  op: number;
  revenue: number;
}

export interface POLineItem {
  skuId: string;
  skuName: string;
  totalQty: number;
  retailProfit: number;
  wholesaleProfit: number;
  distributorProfit: number;
  totalProfit: number;
}

export interface POGrandTotals {
  totalQty: number;
  retailProfit: number;
  wholesaleProfit: number;
  distributorProfit: number;
  totalProfit: number;
  totalUnits: number;
  totalCOGS: number;
  avgCostPerUnit: number;
  avgProfitPerUnit: number;
}

export interface CommissionResults {
  president: President & { overridePay: number; totalPay: number };
  vps: (VP & { overridePay: number; totalPay: number })[];
  rsms: (RSM & { overridePay: number; totalPay: number })[];
  sps: (Salesperson & { basePay: number; bonusPay: number; totalPay: number; _units: number; _grossRev: number; _grossProfit: number })[];
  totalRevenue: number;
  totalOpProfit: number;
  totalComm: number;
  totalBonus: number;
  commPctGross: number;
  commPctOp: number;
  periodMult: number;
}

export interface Scenario {
  id: string;
  savedAt: string;
  label: string;
  note: string;
  inputs: CalculatorState;
}

export interface SubscriptionPlanItem {
  skuId: string;
  skuName: string;
  packsPerMonth: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  items: SubscriptionPlanItem[];
  startingSubscribers: number;
  monthlyGrowthRate: number;
  monthlyChurnRate: number;
  included: boolean;
  cac: number; // customer acquisition cost
}

export interface SubscriptionMonthProjection {
  month: number;
  monthLabel: string;
  startingSubscribers: number;
  newSubscribers: number;
  churnedSubscribers: number;
  endingSubscribers: number;
  monthlyRevenue: number;
  monthlyCOGS: number;
  monthlyGrossProfit: number;
  cumulativeRevenue: number;
  cumulativeProfit: number;
}

export interface SubscriptionPlanResult {
  planId: string;
  planName: string;
  monthlyPrice: number;
  mrr: number;
  arr: number;
  ltv: number;
  paybackMonths: number;
  cac: number;
  months: SubscriptionMonthProjection[];
}

export interface SubscriptionSummary {
  plans: SubscriptionPlanResult[];
  totalMRR: number;
  totalARR: number;
  totalSubscribers: number;
  combinedAnnualRevenue: number;
  combinedAnnualCOGS: number;
  combinedAnnualProfit: number;
}

export interface ShippingRateBracket {
  maxWeightGrams: number; // up to this weight in grams
  cost: number; // shipping cost per pack at this weight
}

export interface CalculatorState {
  schemaVersion: number; // for migration compatibility
  unitSystem: 'mg' | 'oz';
  skus: SKU[];
  order: OrderItem[];
  ingredients: Ingredient[];
  overhead: OverheadItem[];
  monthlyVolumes: MonthlyVolume[];
  wDisc: number;
  dDisc: number;
  includeShip: boolean;
  shippingPerPack: number;
  shippingRateBrackets: ShippingRateBracket[];
  useShippingRateTable: boolean;
  ohR: boolean;
  ohW: boolean;
  ohD: boolean;
  includeThirdParty: boolean;
  includeR: boolean;
  includeW: boolean;
  includeD: boolean;
  beIncludeOverhead: boolean;
  retailSalesTaxRate: number; // % sales tax on retail (e.g., 8.5)
  distributorImportDutyRate: number; // % import duty on distributor (e.g., 5)
  commissions: CommissionState;
  thirdPartyCompanies: ThirdPartyCompany[];
  subscriptionPlans: SubscriptionPlan[];
  // Cash flow
  customerPaymentTerms: {
    retailDays: number;
    wholesaleDays: number;
    distributorDays: number;
  };
  inventoryLeadTimeDays: number; // days from order to delivery
  startingCashBalance: number;
  capitalExpenditures: { id: string; name: string; amount: number; month: number }[];
  debtServiceMonthly: number;
  campaigns: Campaign[];
}

// Cash Flow Types
export interface CashFlowMonth {
  month: number;
  monthLabel: string;
  startingBalance: number;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  endingBalance: number;
  revenueCollected: number;
  cogsPaid: number;
  overheadPaid: number;
  commissionsPaid: number;
  debtServicePaid: number;
  capexPaid: number;
  subscriptionRevenue: number;
}

export interface CashFlowWeek {
  week: number;
  monthLabel: string;
  startingBalance: number;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  endingBalance: number;
}

export interface CashFlowResult {
  months: CashFlowMonth[];
  weekly?: CashFlowWeek[];
  lowestBalance: number;
  lowestBalanceMonth: number;
  cashBreakevenMonth: number | null;
  startingCash: number;
  totalCashIn: number;
  totalCashOut: number;
  totalNetFlow: number;
  endingBalance: number;
}
