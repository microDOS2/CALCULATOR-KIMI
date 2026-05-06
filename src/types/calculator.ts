export interface Ingredient {
  id: string;
  name: string;
  mgPerUnit: number; // mg per pill/unit
  costPerMg: number; // $ per mg
}

export interface SKU {
  id: string;
  name: string;
  unitsPerPack: number; // pills per pack (renamed from pills)
  retailPrice: number;
  innerPkgCost: number;
  outerBoxCost: number;
  displayBoxCost: number;
  unitsPerDisplay: number;
  shippingBoxCost: number;
  unitsPerShipBox: number;
  mixR: number;
  mixW: number;
  mixD: number;
}

export interface OrderItem {
  skuId: string;
  qty: number;
}

export interface OverheadItem {
  id: string;
  name: string;
  cost: number; // monthly
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
}

export interface CalculationResult {
  // Inputs snapshot
  skus: SKU[];
  order: OrderItem[];
  ingredients: Ingredient[];
  overhead: OverheadItem[];
  monthlyVolumes: MonthlyVolume[];
  wDisc: number;
  dDisc: number;
  includeShip: boolean;
  shippingPerPack: number;
  ohR: boolean;
  ohW: boolean;
  ohD: boolean;
  includeThirdParty: boolean;
  includeR: boolean;
  includeW: boolean;
  includeD: boolean;
  beIncludeOverhead: boolean;

  // Core costs
  avgIngCostPerPack: number;
  avgPackCostPerPack: number;
  avgDisplayCostPerPack: number;
  avgShipBoxCostPerPack: number;
  cogsPerPack: number;

  // Channel prices
  retail: ChannelCalc;
  wholesale: ChannelCalc;
  distributor: ChannelCalc;
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

  // Per-unit metrics
  costPerUnit: number;
  profitPerUnitR: number;
  profitPerUnitW: number;
  profitPerUnitD: number;
  costPerMg: number;
  costPerGram: number;
  totalMgPerPack: number;

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
  inputs: CalculatorState;
  outputs: Record<string, string>;
}

export interface CalculatorState {
  skus: SKU[];
  order: OrderItem[];
  ingredients: Ingredient[];
  overhead: OverheadItem[];
  monthlyVolumes: MonthlyVolume[];
  wDisc: number;
  dDisc: number;
  includeShip: boolean;
  shippingPerPack: number;
  ohR: boolean;
  ohW: boolean;
  ohD: boolean;
  includeThirdParty: boolean;
  includeR: boolean;
  includeW: boolean;
  includeD: boolean;
  beIncludeOverhead: boolean;
  commissions: CommissionState;
  thirdPartyCompanies: ThirdPartyCompany[];
}
