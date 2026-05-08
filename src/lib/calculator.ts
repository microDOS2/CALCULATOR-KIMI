import type {
  CalculatorState,
  CalculationResult,
  CommissionResults,
  POGrandTotals,
  POLineItem,
  PackagingLayer,
  SKU,
  Ingredient,
  ShippingRateBracket,
  Campaign,
  CashFlowWeek,
} from "@/types/calculator";

export const num = (v: unknown): number => {
  const x = Number(v);
  return isFinite(x) ? x : 0;
};

// Unit conversion constants
export const MG_PER_OZ = 28349.5231;
export const GRAMS_PER_OZ = 28.3495231;

export const toOz = (mg: number): number => mg / MG_PER_OZ;
export const fromOz = (oz: number): number => oz * MG_PER_OZ;
export const gramsToOz = (g: number): number => g / GRAMS_PER_OZ;
export const ozToGrams = (oz: number): number => oz * GRAMS_PER_OZ;

export function getEffectiveCostPerMg(ing: Ingredient, totalMgOrdered: number): number {
  if (!ing.moqTiers || ing.moqTiers.length === 0) return ing.costPerMg;
  const sorted = [...ing.moqTiers].sort((a, b) => b.minOrderMg - a.minOrderMg);
  for (const tier of sorted) {
    if (totalMgOrdered >= tier.minOrderMg) return tier.costPerMg;
  }
  return ing.costPerMg;
}

export function getShippingFromRateTable(weightGrams: number, brackets: ShippingRateBracket[]): number {
  if (!brackets || brackets.length === 0) return 0;
  const sorted = [...brackets].sort((a, b) => a.maxWeightGrams - b.maxWeightGrams);
  for (const bracket of sorted) {
    if (weightGrams <= bracket.maxWeightGrams) return bracket.cost;
  }
  return sorted[sorted.length - 1].cost;
}

export function calculateCampaignImpact(
  campaigns: Campaign[],
  baseResult: Pick<CalculationResult, 'retail' | 'wholesale' | 'distributor' | 'totalMonthlyVolume'>,
  state: Pick<CalculatorState, 'includeR' | 'includeW' | 'includeD'>
): CalculationResult['campaignImpact'] {
  if (!campaigns || campaigns.length === 0) {
    return { totalRevenueAtRisk: 0, totalMarginCompression: 0, netAnnualEffect: 0, affectedChannels: [] };
  }

  const weeksPerYear = 52;
  let totalRevenueAtRisk = 0;
  let totalMarginCompression = 0;
  let netAnnualEffect = 0;
  const affectedChannels = new Set<string>();

  for (const campaign of campaigns) {
    const weeks = Math.min(campaign.durationWeeks, weeksPerYear);
    const volumeMultiplier = 1 + (campaign.expectedVolumeUplift / 100);

    // Normal weekly volume
    const normalWeeklyVolume = baseResult.totalMonthlyVolume / 4.33;
    const campaignWeeklyVolume = normalWeeklyVolume * volumeMultiplier;

    if (campaign.affectedChannels.retail && state.includeR) {
      affectedChannels.add("Retail");
      const normalRev = normalWeeklyVolume * baseResult.retail.price * weeks;
      const discountedPrice = baseResult.retail.price * (1 - campaign.discountPercent / 100);
      const campaignRev = campaignWeeklyVolume * discountedPrice * weeks;
      totalRevenueAtRisk += normalRev - campaignRev;
      totalMarginCompression += (baseResult.retail.price - discountedPrice) * campaignWeeklyVolume * weeks;
      netAnnualEffect += campaignRev - normalRev;
    }
    if (campaign.affectedChannels.wholesale && state.includeW) {
      affectedChannels.add("Wholesale");
      const normalRev = normalWeeklyVolume * baseResult.wholesale.price * weeks;
      const discountedPrice = baseResult.wholesale.price * (1 - campaign.discountPercent / 100);
      const campaignRev = campaignWeeklyVolume * discountedPrice * weeks;
      totalRevenueAtRisk += normalRev - campaignRev;
      totalMarginCompression += (baseResult.wholesale.price - discountedPrice) * campaignWeeklyVolume * weeks;
      netAnnualEffect += campaignRev - normalRev;
    }
    if (campaign.affectedChannels.distributor && state.includeD) {
      affectedChannels.add("Distributor");
      const normalRev = normalWeeklyVolume * baseResult.distributor.price * weeks;
      const discountedPrice = baseResult.distributor.price * (1 - campaign.discountPercent / 100);
      const campaignRev = campaignWeeklyVolume * discountedPrice * weeks;
      totalRevenueAtRisk += normalRev - campaignRev;
      totalMarginCompression += (baseResult.distributor.price - discountedPrice) * campaignWeeklyVolume * weeks;
      netAnnualEffect += campaignRev - normalRev;
    }
  }

  return {
    totalRevenueAtRisk,
    totalMarginCompression,
    netAnnualEffect,
    affectedChannels: Array.from(affectedChannels),
  };
}

export const weightLabel = (unitSystem: 'mg' | 'oz'): string =>
  unitSystem === 'mg' ? 'mg' : 'oz';

export const weightLabelLong = (unitSystem: 'mg' | 'oz'): string =>
  unitSystem === 'mg' ? 'milligrams' : 'ounces';

export const fmtWeight = (mg: number, unitSystem: 'mg' | 'oz'): string => {
  if (unitSystem === 'mg') {
    return `${mg.toLocaleString(undefined, { maximumFractionDigits: 2 })} mg`;
  }
  return `${toOz(mg).toFixed(4)} oz`;
};

export const fmtWeightGrams = (g: number, unitSystem: 'mg' | 'oz'): string => {
  if (unitSystem === 'mg') {
    return `${g.toLocaleString(undefined, { maximumFractionDigits: 2 })} g`;
  }
  return `${gramsToOz(g).toFixed(4)} oz`;
};

export const pct = (x: number): string => {
  if (!isFinite(x) || x === 0) return "0%";
  return (x * 100).toFixed(1).replace(/\.0$/, "") + "%";
};

export const money = (n: number): string => {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const money3 = (n: number): string => {
  const x = Number(n || 0);
  if (!isFinite(x)) return "$0";
  const s = x.toFixed(3);
  const trimmed = s.replace(/\.?0+$/, "");
  const out = trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (x < 0 ? "-" : "") + "$" + out;
};

export const getSkuMonthlyVolume = (
  skuId: string,
  monthlyVolumes: { skuId: string; qty: number }[],
  skus: SKU[]
): number => {
  const mv = monthlyVolumes.find((v) => v.skuId === skuId);
  if (mv) return Math.max(0, mv.qty);
  return skus.length > 0 ? 1 : 0;
};

export function calculatePackagingCostPerPack(
  layers: PackagingLayer[],
  unitsPerPack: number
): number {
  return layers.reduce((sum, layer) => {
    if (!layer.included) return sum;
    const costPerPack = layer.costPerUnit * (unitsPerPack / Math.max(1, layer.unitsPerLayer));
    return sum + costPerPack;
  }, 0);
}

export function calculatePackagingWeightPerPack(
  layers: PackagingLayer[],
  unitsPerPack: number
): number {
  // Returns weight in grams
  return layers.reduce((sum, layer) => {
    if (!layer.included) return sum;
    const weightPerPack = layer.weightPerUnit * (unitsPerPack / Math.max(1, layer.unitsPerLayer));
    return sum + weightPerPack;
  }, 0);
}

// Default packaging layers for new SKUs
let _pkgUid = 0;
const pkgUid = () => `p${++_pkgUid}`;

export function createDefaultPackaging(): PackagingLayer[] {
  return [
    { id: pkgUid(), name: "Primary Container", costPerUnit: 1.75, unitsPerLayer: 1, weightPerUnit: 5, included: true },
    { id: pkgUid(), name: "Inner Packaging", costPerUnit: 0.5, unitsPerLayer: 1, weightPerUnit: 2, included: true },
    { id: pkgUid(), name: "Outer Box", costPerUnit: 1.5, unitsPerLayer: 1, weightPerUnit: 15, included: true },
    { id: pkgUid(), name: "Display Packaging", costPerUnit: 0, unitsPerLayer: 1, weightPerUnit: 0, included: false },
    { id: pkgUid(), name: "Shipping Box", costPerUnit: 1.5, unitsPerLayer: 1, weightPerUnit: 50, included: true },
  ];
}

export function calculate(state: CalculatorState): CalculationResult {
  const {
    skus,
    order,
    ingredients,
    overhead,
    monthlyVolumes,
    wDisc,
    dDisc,
    includeShip,
    shippingPerPack,
    ohR,
    ohW,
    ohD,
    includeThirdParty,
    beIncludeOverhead,
    thirdPartyCompanies,
  } = state;

  // Third party total
  let thirdPartyTotal = 0;
  thirdPartyCompanies.forEach((company) => {
    if (company.included) {
      company.items.forEach((item) => {
        thirdPartyTotal += num(item.cost);
      });
    }
  });

  const manualOhTotal = overhead.reduce((a, x) => a + x.cost, 0);
  const ohTotal = manualOhTotal + (includeThirdParty ? thirdPartyTotal : 0);

  // Pre-calculate effective ingredient costs based on MOQ tiers
  const ingredientTotalMg: Record<string, number> = {};
  order.forEach((orderItem) => {
    const sku = skus.find((s) => s.id === orderItem.skuId);
    if (!sku || orderItem.qty <= 0) return;
    ingredients.forEach((ing) => {
      const mg = ing.mgPerUnit * sku.unitsPerPack * orderItem.qty;
      ingredientTotalMg[ing.id] = (ingredientTotalMg[ing.id] || 0) + mg;
    });
  });

  const effectiveCosts: Record<string, number> = {};
  ingredients.forEach((ing) => {
    effectiveCosts[ing.id] = getEffectiveCostPerMg(ing, ingredientTotalMg[ing.id] || 0);
  });

  // Per-SKU packaging tracking
  const skuPackagingCosts: CalculationResult["skuPackagingCosts"] = [];

  // Order-level accumulators
  let totalPacks = 0;
  let totalUnits = 0;
  let totalIngCost = 0;
  let totalPackagingCost = 0;
  let totalPackagingWeight = 0; // in grams

  let totalRevenueR = 0;
  let totalRevenueW = 0;
  let totalRevenueD = 0;

  let totalGpR = 0;
  let totalGpW = 0;
  let totalGpD = 0;

  let totalPacksR = 0;
  let totalPacksW = 0;
  let totalPacksD = 0;

  order.forEach((orderItem) => {
    const sku = skus.find((s) => s.id === orderItem.skuId);
    if (!sku || orderItem.qty <= 0) return;

    const orderQty = orderItem.qty;
    totalPacks += orderQty;
    totalUnits += sku.unitsPerPack * orderQty;

    const ingPerPack = ingredients.reduce(
      (a, ing) => a + ing.mgPerUnit * sku.unitsPerPack * effectiveCosts[ing.id],
      0
    );
    const pkgPerPack = calculatePackagingCostPerPack(sku.packaging, sku.unitsPerPack);
    const pkgWeightPerPack = calculatePackagingWeightPerPack(sku.packaging, sku.unitsPerPack);
    const cogsPerPack = ingPerPack + pkgPerPack;

    totalIngCost += ingPerPack * orderQty;
    totalPackagingCost += pkgPerPack * orderQty;
    totalPackagingWeight += pkgWeightPerPack * orderQty;

    // Per-layer cost tracking for this SKU
    const skuPkgCosts = sku.packaging.map((layer) => ({
      id: layer.id,
      name: layer.name,
      costPerPack: 0,
    }));
    sku.packaging.forEach((layer, idx) => {
      if (layer.included) {
        skuPkgCosts[idx].costPerPack =
          layer.costPerUnit * (sku.unitsPerPack / Math.max(1, layer.unitsPerLayer));
      }
    });

    skuPackagingCosts.push({
      skuId: sku.id,
      skuName: sku.name,
      packagingCosts: skuPkgCosts,
      totalCostPerPack: pkgPerPack,
      totalWeightPerPack: pkgWeightPerPack,
    });

    const packsR = orderQty * (sku.mixR / 100);
    const packsW = orderQty * (sku.mixW / 100);
    const packsD = orderQty * (sku.mixD / 100);

    totalPacksR += packsR;
    totalPacksW += packsW;
    totalPacksD += packsD;

    const priceR = sku.retailPrice;
    const priceW = priceR * (1 - wDisc / 100);
    const priceD = priceW * (1 - dDisc / 100);

    totalRevenueR += priceR * packsR;
    totalRevenueW += priceW * packsW;
    totalRevenueD += priceD * packsD;

    totalGpR += (priceR - cogsPerPack) * packsR;
    totalGpW += (priceW - cogsPerPack) * packsW;
    totalGpD += (priceD - cogsPerPack) * packsD;
  });

  const avgIngCostPerPack = totalPacks > 0 ? totalIngCost / totalPacks : 0;
  const totalPackagingCostPerPack = totalPacks > 0 ? totalPackagingCost / totalPacks : 0;
  const totalPackagingWeightPerPack = totalPacks > 0 ? totalPackagingWeight / totalPacks : 0;
  const cogsPerPack = avgIngCostPerPack + totalPackagingCostPerPack;

  // Channel prices
  const avgPriceR = totalPacksR > 0 ? totalRevenueR / totalPacksR : 0;
  const avgPriceW = totalPacksW > 0 ? totalRevenueW / totalPacksW : 0;
  const avgPriceD = totalPacksD > 0 ? totalRevenueD / totalPacksD : 0;

  // Gross profit per pack
  const gpR = totalPacksR > 0 ? totalGpR / totalPacksR : 0;
  const gpW = totalPacksW > 0 ? totalGpW / totalPacksW : 0;
  const gpD = totalPacksD > 0 ? totalGpD / totalPacksD : 0;

  // Gross margin
  const gmR = avgPriceR > 0 ? gpR / avgPriceR : 0;
  const gmW = avgPriceW > 0 ? gpW / avgPriceW : 0;
  const gmD = avgPriceD > 0 ? gpD / avgPriceD : 0;

  // Tax & regulatory calculations
  const retailPriceWithTax = avgPriceR * (1 + state.retailSalesTaxRate / 100);
  const retailTaxAmount = avgPriceR * (state.retailSalesTaxRate / 100);
  const distributorImportDuty = avgPriceD * (state.distributorImportDutyRate / 100);
  const distributorCostWithDuty = cogsPerPack + distributorImportDuty;

  // Monthly volume
  const totalMonthlyVolume = skus.reduce(
    (sum, sku) => sum + getSkuMonthlyVolume(sku.id, monthlyVolumes, skus),
    0
  );
  // Overhead per pack — only allocated across channels where overhead is enabled
  const ohChannelsActive = (ohR ? 1 : 0) + (ohW ? 1 : 0) + (ohD ? 1 : 0);
  const includedMonthlyVolume = Math.max(
    1,
    (ohR ? totalPacksR : 0) + (ohW ? totalPacksW : 0) + (ohD ? totalPacksD : 0)
  );
  // Overhead per pack — when no channels carry overhead, per-pack overhead is $0
  const ohPerPack = ohChannelsActive > 0 ? ohTotal / includedMonthlyVolume : 0;
  const ohPerPackR = ohR ? ohPerPack : 0;
  const ohPerPackW = ohW ? ohPerPack : 0;
  const ohPerPackD = ohD ? ohPerPack : 0;

  // Compute total unit weight for shipping rate lookup
  const totalWeightPerUnit = ingredients.reduce((a, ing) => a + ing.mgPerUnit, 0);
  const weightedUnitsPerPack = totalPacks > 0 ? totalUnits / totalPacks : 0;
  const totalWeightPerPack = totalWeightPerUnit * weightedUnitsPerPack;
  const totalUnitWeightPerPack = (totalWeightPerPack / 1000) + totalPackagingWeightPerPack;

  // Per-channel shipping costs
  const shipPerPackR = includeShip
    ? (state.useShippingRateTable && state.shippingRateBrackets.length > 0
      ? getShippingFromRateTable(totalUnitWeightPerPack, state.shippingRateBrackets)
      : shippingPerPack)
    : 0;
  const shipPerPackW = includeShip ? state.shippingPerPackW : 0;
  const shipPerPackD = includeShip ? state.shippingPerPackD : 0;

  // Operating profit per pack — per-channel shipping
  const opR = gpR - ohPerPackR - shipPerPackR;
  const opW = gpW - ohPerPackW - shipPerPackW;
  const opD = gpD - ohPerPackD - shipPerPackD;

  // Operating margin
  const omR = avgPriceR > 0 ? opR / avgPriceR : 0;
  const omW = avgPriceW > 0 ? opW / avgPriceW : 0;
  const omD = avgPriceD > 0 ? opD / avgPriceD : 0;

  // Affiliate calculations
  const afState = state.affiliate;
  const afEnabled = afState.enabled;
  const afTier = afEnabled ? afState.tiers.find((t) => t.id === afState.activeTierId) || afState.tiers[0] : null;

  let afCommissionPerPack = 0;
  let afGrossRevenue = 0;
  let afInitialCommission = 0;
  let afNetProfit = 0;

  if (afEnabled && afTier) {
    // Affiliate sells at retail price
    const afPacks = afState.monthlyNewReferrals * afState.avgOrderPacks;
    afGrossRevenue = avgPriceR * afPacks;

    // Initial commission
    let commissionBasis = avgPriceR;
    if (afTier.initialBasis === 'product_only') {
      commissionBasis = avgPriceR;
    } else if (afTier.initialBasis === 'product_plus_shipping') {
      commissionBasis = avgPriceR + shipPerPackR;
    } else if (afTier.initialBasis === 'total') {
      commissionBasis = avgPriceR + shipPerPackR + retailTaxAmount;
    }

    if (afTier.initialType === 'percentage') {
      afCommissionPerPack = commissionBasis * (afTier.initialRate / 100);
    } else if (afTier.initialType === 'flat_per_pack') {
      afCommissionPerPack = afTier.initialRate;
    } else if (afTier.initialType === 'flat_per_order') {
      afCommissionPerPack = afTier.initialRate / afState.avgOrderPacks;
    }

    afInitialCommission = afCommissionPerPack * afPacks;
    const afCogs = cogsPerPack * afPacks;
    const afShipping = includeShip ? shipPerPackR * afPacks : 0;
    afNetProfit = afGrossRevenue - afCogs - afShipping - afInitialCommission;
  }

  // Blended — respect include flags
  const totalRevenue = (state.includeR ? totalRevenueR : 0) + (state.includeW ? totalRevenueW : 0) + (state.includeD ? totalRevenueD : 0);
  const totalGp = (state.includeR ? totalGpR : 0) + (state.includeW ? totalGpW : 0) + (state.includeD ? totalGpD : 0);
  const includedPacks = (state.includeR ? totalPacksR : 0) + (state.includeW ? totalPacksW : 0) + (state.includeD ? totalPacksD : 0);

  const brev = includedPacks > 0 ? totalRevenue / includedPacks : 0;
  const bgpp = includedPacks > 0 ? totalGp / includedPacks : 0;
  const bopp = brev > 0 ? bgpp - ohPerPack : 0;
  const bgmp = brev > 0 ? bgpp / brev : 0;
  const bomp = brev > 0 ? bopp / brev : 0;

  const retailerProfit = avgPriceR - avgPriceW;
  const distProfit = avgPriceW - avgPriceD;

  // Ingredient cost metrics (weight metrics already computed earlier for shipping)
  const totalMgPerPack = ingredients.reduce(
    (a, ing) => a + ing.mgPerUnit * weightedUnitsPerPack,
    0
  );
  const costPerMg = totalMgPerPack > 0 ? avgIngCostPerPack / totalMgPerPack : 0;
  const costPerGram = costPerMg * 1000;

  // Per-unit metrics
  const costPerUnit = weightedUnitsPerPack > 0 ? cogsPerPack / weightedUnitsPerPack : 0;
  const profitPerUnitR = weightedUnitsPerPack > 0 ? opR / weightedUnitsPerPack : 0;
  const profitPerUnitW = weightedUnitsPerPack > 0 ? opW / weightedUnitsPerPack : 0;
  const profitPerUnitD = weightedUnitsPerPack > 0 ? opD / weightedUnitsPerPack : 0;
  const overheadPerUnit = weightedUnitsPerPack > 0 ? ohPerPack / weightedUnitsPerPack : 0;

  // Break-even
  const fixedCosts = beIncludeOverhead ? ohTotal : 0;
  const contribR = gpR - shipPerPackR;
  const contribW = gpW - shipPerPackW;
  const contribD = gpD - shipPerPackD;
  const contribB = brev > 0 ? bopp + ohPerPack : 0;

  const beUnitsR = contribR > 0 ? fixedCosts / contribR : Infinity;
  const beUnitsW = contribW > 0 ? fixedCosts / contribW : Infinity;
  const beUnitsD = contribD > 0 ? fixedCosts / contribD : Infinity;
  const beUnitsB = contribB > 0 ? fixedCosts / contribB : Infinity;

  const beRevR = beUnitsR * avgPriceR;
  const beRevW = beUnitsW * avgPriceW;
  const beRevD = beUnitsD * avgPriceD;
  const beRevB = beUnitsB * brev;

  // Purchase Orders
  const poLineItems: POLineItem[] = [];
  const poGrandTotals: POGrandTotals = {
    totalQty: 0,
    retailProfit: 0,
    wholesaleProfit: 0,
    distributorProfit: 0,
    totalProfit: 0,
    totalUnits: 0,
    totalCOGS: 0,
    avgCostPerUnit: 0,
    avgProfitPerUnit: 0,
    retailOH: 0,
    wholesaleOH: 0,
    distributorOH: 0,
    totalOH: 0,
    retailOpProfit: 0,
    wholesaleOpProfit: 0,
    distributorOpProfit: 0,
    totalOpProfit: 0,
  };

  order.forEach((orderItem) => {
    const sku = skus.find((s) => s.id === orderItem.skuId);
    if (!sku || orderItem.qty <= 0) return;

    const ingPerPack = ingredients.reduce(
      (a, ing) => a + ing.mgPerUnit * sku.unitsPerPack * effectiveCosts[ing.id],
      0
    );
    const pkgPerPack = calculatePackagingCostPerPack(sku.packaging, sku.unitsPerPack);
    const cogsPerPack = ingPerPack + pkgPerPack;

    const retailQty = orderItem.qty * (sku.mixR / 100);
    const wholesaleQty = orderItem.qty * (sku.mixW / 100);
    const distributorQty = orderItem.qty * (sku.mixD / 100);

    const priceR = sku.retailPrice;
    const priceW = priceR * (1 - wDisc / 100);
    const priceD = priceW * (1 - dDisc / 100);

    const retailProfit = retailQty * (priceR - cogsPerPack - shipPerPackR);
    const wholesaleProfit = wholesaleQty * (priceW - cogsPerPack - shipPerPackW);
    const distributorProfit = distributorQty * (priceD - cogsPerPack - shipPerPackD);
    const totalProfit = retailProfit + wholesaleProfit + distributorProfit;

    // Overhead allocation for this line item (proportional to packs per channel)
    const retailOH = retailQty * ohPerPackR;
    const wholesaleOH = wholesaleQty * ohPerPackW;
    const distributorOH = distributorQty * ohPerPackD;
    const totalOH = retailOH + wholesaleOH + distributorOH;

    // Operating profit (gross profit - overhead allocation)
    const retailOpProfit = retailProfit - retailOH;
    const wholesaleOpProfit = wholesaleProfit - wholesaleOH;
    const distributorOpProfit = distributorProfit - distributorOH;
    const totalOpProfit = totalProfit - totalOH;

    poLineItems.push({
      skuId: sku.id,
      skuName: sku.name,
      totalQty: orderItem.qty,
      retailProfit,
      wholesaleProfit,
      distributorProfit,
      totalProfit,
      retailOH,
      wholesaleOH,
      distributorOH,
      totalOH,
      retailOpProfit,
      wholesaleOpProfit,
      distributorOpProfit,
      totalOpProfit,
    });

    poGrandTotals.totalQty += orderItem.qty;
    poGrandTotals.retailProfit += retailProfit;
    poGrandTotals.wholesaleProfit += wholesaleProfit;
    poGrandTotals.distributorProfit += distributorProfit;
    poGrandTotals.totalProfit += totalProfit;
    poGrandTotals.retailOH += retailOH;
    poGrandTotals.wholesaleOH += wholesaleOH;
    poGrandTotals.distributorOH += distributorOH;
    poGrandTotals.totalOH += totalOH;
    poGrandTotals.retailOpProfit += retailOpProfit;
    poGrandTotals.wholesaleOpProfit += wholesaleOpProfit;
    poGrandTotals.distributorOpProfit += distributorOpProfit;
    poGrandTotals.totalOpProfit += totalOpProfit;
    poGrandTotals.totalUnits += sku.unitsPerPack * orderItem.qty;
    poGrandTotals.totalCOGS += cogsPerPack * orderItem.qty;
  });

  poGrandTotals.avgCostPerUnit =
    poGrandTotals.totalUnits > 0
      ? poGrandTotals.totalCOGS / poGrandTotals.totalUnits
      : 0;
  poGrandTotals.avgProfitPerUnit =
    poGrandTotals.totalUnits > 0
      ? poGrandTotals.totalProfit / poGrandTotals.totalUnits
      : 0;

  // Commissions
  const commResults = calculateCommissions(
    state,
    {
      priceR: avgPriceR,
      priceW: avgPriceW,
      priceD: avgPriceD,
      gpR,
      gpW,
      gpD,
    },
    ohTotal,
    ohPerPack,
    shipPerPackR,
    shipPerPackW,
    shipPerPackD
  );

  // Aggregate packaging costs across SKUs for chart (weighted by order qty)
  const aggPackaging: Record<string, number> = {};
  order.forEach((orderItem) => {
    const sku = skus.find((s) => s.id === orderItem.skuId);
    if (!sku || orderItem.qty <= 0) return;
    sku.packaging.forEach((layer) => {
      if (!layer.included) return;
      const costPerPack = layer.costPerUnit * (sku.unitsPerPack / Math.max(1, layer.unitsPerLayer));
      aggPackaging[layer.name] = (aggPackaging[layer.name] || 0) + costPerPack * orderItem.qty;
    });
  });

  const costBreakdown: CalculationResult["costBreakdown"] = [
    { name: "Ingredients", value: avgIngCostPerPack, color: "#10b981" },
    ...Object.entries(aggPackaging)
      .filter(([, v]) => v > 0)
      .map(([name, totalCost], i) => ({
        name,
        value: totalPacks > 0 ? totalCost / totalPacks : 0,
        color: ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"][i % 6],
      })),
  ];

  const channelProfits: CalculationResult["channelProfits"] = [
    { name: "Retail", gp: gpR, op: opR, revenue: totalRevenueR },
    { name: "Wholesale", gp: gpW, op: opW, revenue: totalRevenueW },
    { name: "Distributor", gp: gpD, op: opD, revenue: totalRevenueD },
  ];

  // Subscription projections
  const subscriptionSummary = calculateSubscriptions(state, cogsPerPack);

  // Overrides (must be computed before cash flow)
  const overrides = calculateOverrides(state, totalRevenueR, totalRevenueW, totalRevenueD, afGrossRevenue);

  // Cash flow (depends on overrides)
  const cashFlow = calculateCashFlow(state, brev, totalMonthlyVolume, cogsPerPack, ohTotal, overrides.totalOverrideCost, commResults.totalBaseSalary);

  return {
    unitSystem: state.unitSystem,
    skus: state.skus,
    order: state.order,
    ingredients: state.ingredients,
    overhead: state.overhead,
    monthlyVolumes: state.monthlyVolumes,
    wDisc: state.wDisc,
    dDisc: state.dDisc,
    includeShip: state.includeShip,
    shippingPerPack: state.shippingPerPack,
    shippingRateBrackets: state.shippingRateBrackets,
    useShippingRateTable: state.useShippingRateTable,
    ohR: state.ohR,
    ohW: state.ohW,
    ohD: state.ohD,
    includeThirdParty: state.includeThirdParty,
    includeR: state.includeR,
    includeW: state.includeW,
    includeD: state.includeD,
    beIncludeOverhead: state.beIncludeOverhead,
    retailSalesTaxRate: state.retailSalesTaxRate,
    distributorImportDutyRate: state.distributorImportDutyRate,
    campaigns: state.campaigns,
    commissions: state.commissions,
    thirdPartyCompanies: state.thirdPartyCompanies,
    skuPackagingCosts,
    totalPackagingCostPerPack,
    avgIngCostPerPack,
    totalIngCostPerPack: avgIngCostPerPack,
    cogsPerPack,
    retail: {
      price: avgPriceR,
      gp: gpR,
      gm: gmR,
      op: opR,
      om: omR,
      costPerUnit,
      profitPerUnit: profitPerUnitR,
    },
    wholesale: {
      price: avgPriceW,
      gp: gpW,
      gm: gmW,
      op: opW,
      om: omW,
      costPerUnit,
      profitPerUnit: profitPerUnitW,
    },
    distributor: {
      price: avgPriceD,
      gp: gpD,
      gm: gmD,
      op: opD,
      om: omD,
      costPerUnit,
      profitPerUnit: profitPerUnitD,
    },
    affiliate: {
      enabled: afEnabled,
      tierName: afTier?.name || '',
      monthlyReferrals: afEnabled ? afState.monthlyNewReferrals : 0,
      monthlyPacks: afEnabled ? afState.monthlyNewReferrals * afState.avgOrderPacks : 0,
      grossRevenue: afGrossRevenue,
      initialCommission: afInitialCommission,
      projectedRenewalCommission: 0, // Phase 2
      netProfit: afNetProfit,
      commissionAsPercentOfRevenue: afGrossRevenue > 0 ? (afInitialCommission / afGrossRevenue) * 100 : 0,
    },
    overrides,
    retailPriceWithTax,
    retailTaxAmount,
    distributorImportDuty,
    distributorCostWithDuty,
    avgPriceR,
    avgPriceW,
    avgPriceD,
    retailerProfit,
    distProfit,
    ohTotal,
    thirdPartyTotal,
    ohPerPack,
    ohPerPackR,
    ohPerPackW,
    ohPerPackD,
    overheadPerUnit,
    shipPerPack: shipPerPackR,
    shippingPerPackW: shipPerPackW,
    shippingPerPackD: shipPerPackD,
    brev,
    bgpp,
    bgmp,
    bopp,
    bomp,
    weightedUnitsPerPack,
    costPerUnit,
    profitPerUnitR,
    profitPerUnitW,
    profitPerUnitD,
    costPerMg,
    costPerGram,
    totalMgPerPack,
    totalWeightPerUnit,
    totalWeightPerPack,
    totalPackagingWeightPerPack,
    totalUnitWeightPerPack,
    beUnitsR,
    beRevR,
    beUnitsW,
    beRevW,
    beUnitsD,
    beRevD,
    beUnitsB,
    beRevB,
    poLineItems,
    poGrandTotals,
    commissionResults: commResults,
    totalPacks,
    totalPacksR,
    totalPacksW,
    totalPacksD,
    totalUnits,
    totalMonthlyVolume,
    costBreakdown,
    channelProfits,
    subscriptionPlans: state.subscriptionPlans,
    subscriptionSummary,
    campaignImpact: calculateCampaignImpact(state.campaigns, {
      retail: { price: avgPriceR, gp: gpR, gm: gmR, op: opR, om: omR, costPerUnit, profitPerUnit: profitPerUnitR },
      wholesale: { price: avgPriceW, gp: gpW, gm: gmW, op: opW, om: omW, costPerUnit, profitPerUnit: profitPerUnitW },
      distributor: { price: avgPriceD, gp: gpD, gm: gmD, op: opD, om: omD, costPerUnit, profitPerUnit: profitPerUnitD },
      totalMonthlyVolume,
    }, state),
    cashFlow,
  };
}

function calculateSubscriptions(
  state: CalculatorState,
  _blendedCOGSPerPack: number
): CalculationResult["subscriptionSummary"] {
  const { skus, subscriptionPlans } = state;
  const activePlans = subscriptionPlans.filter((p) => p.included);

  let totalMRR = 0;
  let totalARR = 0;
  let totalSubscribers = 0;
  let combinedAnnualRevenue = 0;
  let combinedAnnualCOGS = 0;
  let combinedAnnualProfit = 0;

  const planResults: CalculationResult["subscriptionSummary"]["plans"] = [];

  activePlans.forEach((plan) => {
    const months: CalculationResult["subscriptionSummary"]["plans"][0]["months"] = [];
    let currentSubs = plan.startingSubscribers;
    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;

    // Calculate COGS per subscriber per month based on plan items
    let cogsPerSubscriberMonth = 0;
    plan.items.forEach((item) => {
      const sku = skus.find((s) => s.id === item.skuId);
      if (!sku) return;
      const skuCogs = calculatePackagingCostPerPack(sku.packaging, sku.unitsPerPack);
      const ingCost = state.ingredients.reduce(
        (a, ing) => a + ing.mgPerUnit * sku.unitsPerPack * ing.costPerMg, 0
      );
      cogsPerSubscriberMonth += (skuCogs + ingCost) * item.packsPerMonth;
    });

    for (let m = 1; m <= 12; m++) {
      const monthLabel = new Date(2026, m - 1, 1).toLocaleString("en", { month: "short" });
      const newSubs = Math.round(currentSubs * (plan.monthlyGrowthRate / 100));
      const churned = Math.round(currentSubs * (plan.monthlyChurnRate / 100));
      const endingSubs = Math.max(0, currentSubs + newSubs - churned);
      const monthlyRevenue = currentSubs * plan.monthlyPrice;
      const monthlyCOGS = currentSubs * cogsPerSubscriberMonth;
      const monthlyGrossProfit = monthlyRevenue - monthlyCOGS;

      cumulativeRevenue += monthlyRevenue;
      cumulativeProfit += monthlyGrossProfit;

      months.push({
        month: m,
        monthLabel,
        startingSubscribers: currentSubs,
        newSubscribers: newSubs,
        churnedSubscribers: churned,
        endingSubscribers: endingSubs,
        monthlyRevenue,
        monthlyCOGS,
        monthlyGrossProfit,
        cumulativeRevenue,
        cumulativeProfit,
      });

      currentSubs = endingSubs;
    }

    const mrr = months[0]?.monthlyRevenue ?? 0;
    const arr = mrr * 12;
    const avgMonthlyProfit = months.reduce((s, m) => s + m.monthlyGrossProfit, 0) / 12;
    const ltv = plan.monthlyChurnRate > 0
      ? (avgMonthlyProfit / (plan.monthlyChurnRate / 100))
      : avgMonthlyProfit * 12;
    const paybackMonths = avgMonthlyProfit > 0 ? plan.cac / avgMonthlyProfit : Infinity;

    totalMRR += mrr;
    totalARR += arr;
    totalSubscribers += plan.startingSubscribers;
    combinedAnnualRevenue += months[11]?.cumulativeRevenue ?? 0;
    combinedAnnualCOGS += months.reduce((s, m) => s + m.monthlyCOGS, 0);
    combinedAnnualProfit += months[11]?.cumulativeProfit ?? 0;

    planResults.push({
      planId: plan.id,
      planName: plan.name,
      monthlyPrice: plan.monthlyPrice,
      mrr,
      arr,
      ltv,
      paybackMonths,
      cac: plan.cac,
      months,
    });
  });

  return {
    plans: planResults,
    totalMRR,
    totalARR,
    totalSubscribers,
    combinedAnnualRevenue,
    combinedAnnualCOGS,
    combinedAnnualProfit,
  };
}

function calculateCashFlow(
  state: CalculatorState,
  blendedRevenuePerPack: number,
  totalMonthlyVolume: number,
  cogsPerPack: number,
  ohTotal: number,
  overrideCost: number,
  commissionTotalBaseSalary: number,
): CalculationResult["cashFlow"] {
  const {
    customerPaymentTerms,
    inventoryLeadTimeDays,
    startingCashBalance,
    capitalExpenditures,
    debtServiceMonthly,
    subscriptionPlans,
  } = state;

  const months: CalculationResult["cashFlow"]["months"] = [];
  let balance = startingCashBalance;
  let totalIn = 0;
  let totalOut = 0;
  let lowestBalance = balance;
  let lowestMonth = 0;
  let cashBreakevenMonth: number | null = null;
  let hasBeenPositive = false;

  // Pre-calculate revenue by channel per month (from monthlyVolumes)
  // For simplicity: monthly volume is split by channel mix of first SKU
  // Revenue timing: retail immediate-ish, wholesale delayed, distributor more delayed
  const monthlyRev = blendedRevenuePerPack * totalMonthlyVolume;

  for (let m = 1; m <= 12; m++) {
    const monthLabel = new Date(2026, m - 1, 1).toLocaleString("en", { month: "short" });
    const startingBalance = balance;

    // --- CASH IN ---
    // Revenue collected this month = revenue from sales made in previous months based on payment terms
    // Retail: collect after retailDays
    // Simplified: revenue delayed by customer payment terms

    // For a proper model we'd need per-month sales history. Let's use a simplified approach:
    // Assume the same monthly volume every month, so revenue is just monthlyRev * (1 if past first month else 0)
    // But with payment delays, month 1 revenue may not all be collected in month 1

    // SIMPLIFIED MODEL:
    // Revenue timing: delayed by customer payment terms
    const revenueDelayMonths = Math.ceil(customerPaymentTerms.retailDays / 30);
    const revenueCollected = m > revenueDelayMonths ? monthlyRev : monthlyRev * 0.2;

    // Subscription revenue (collected immediately or monthly)
    const activePlans = subscriptionPlans.filter((p) => p.included);
    let subscriptionRevenue = 0;
    let currentSubs = activePlans.reduce((s, p) => s + p.startingSubscribers, 0);
    for (let i = 1; i <= m; i++) {
      const newSubs = Math.round(currentSubs * (activePlans[0]?.monthlyGrowthRate ?? 0) / 100);
      const churned = Math.round(currentSubs * (activePlans[0]?.monthlyChurnRate ?? 0) / 100);
      currentSubs = Math.max(0, currentSubs + newSubs - churned);
      if (i === m) {
        subscriptionRevenue = currentSubs * (activePlans[0]?.monthlyPrice ?? 0);
      }
    }

    const cashIn = revenueCollected + subscriptionRevenue;

    // --- CASH OUT ---
    // COGS paid: order placed 1 month ahead, delivered after lead time, paid after supplier terms
    // Simplified: COGS paid with delay
    const cogsPaid = m > Math.ceil((inventoryLeadTimeDays + 30) / 30) ? cogsPerPack * totalMonthlyVolume : 0;

    const overheadPaid = ohTotal;
    const commissionsPaid = commissionTotalBaseSalary; // commission base salaries (fixed cost)
    const overridesPaid = overrideCost; // monthly override payouts
    const debtPaid = debtServiceMonthly;
    const capexPaid = capitalExpenditures
      .filter((c) => c.month === m)
      .reduce((s, c) => s + c.amount, 0);

    // Marketing costs (only if enabled)
    const marketingSalaryTotal = state.marketingEnabled ? state.marketingEmployees.reduce((s, e) => s + e.salary, 0) : 0;
    const marketingExpenseTotal = state.marketingEnabled ? state.marketingExpenses.reduce((s, e) => s + e.amount, 0) : 0;

    // Shipping employee costs (only if enabled)
    const shippingSalaryTotal = state.shippingEmployeesEnabled ? state.shippingEmployees.reduce((s, e) => s + e.salary, 0) : 0;
    const shippingBonusTotal = state.shippingEmployeesEnabled
      ? state.shippingEmployees.reduce((s, e) => s + (e.perItemBonusEnabled ? e.perItemBonus * totalMonthlyVolume : 0), 0)
      : 0;
    const shippingMaterialsTotal = state.shippingEmployeesEnabled
      ? state.shippingMaterials.reduce((s, m) => s + m.costPerPack * totalMonthlyVolume, 0)
      : 0;

    const cashOut = cogsPaid + overheadPaid + commissionsPaid + overridesPaid + debtPaid + capexPaid + marketingSalaryTotal + marketingExpenseTotal + shippingSalaryTotal + shippingBonusTotal + shippingMaterialsTotal;

    const netCashFlow = cashIn - cashOut;
    balance = startingBalance + netCashFlow;

    totalIn += cashIn;
    totalOut += cashOut;

    if (balance < lowestBalance) {
      lowestBalance = balance;
      lowestMonth = m;
    }

    if (balance > 0 && !hasBeenPositive) {
      hasBeenPositive = true;
    }
    if (balance > 0 && cashBreakevenMonth === null && m > 1) {
      cashBreakevenMonth = m;
    }

    months.push({
      month: m,
      monthLabel,
      startingBalance,
      cashIn,
      cashOut,
      netCashFlow,
      endingBalance: balance,
      revenueCollected,
      cogsPaid,
      overheadPaid,
      commissionsPaid,
      debtServicePaid: debtPaid,
      capexPaid,
      marketingSalaryTotal,
      marketingExpenseTotal,
      shippingSalaryTotal,
      shippingBonusTotal,
      shippingMaterialsTotal,
      subscriptionRevenue,
    });
  }

  // Build weekly interpolation from monthly data
  const weekly: CashFlowWeek[] = [];
  let weekBalance = startingCashBalance;
  for (let w = 1; w <= 52; w++) {
    const mIdx = Math.min(11, Math.floor((w - 1) / 4.33));
    const monthData = months[mIdx];
    const weekIn = monthData ? monthData.cashIn / 4.33 : 0;
    const weekOut = monthData ? monthData.cashOut / 4.33 : 0;
    const weekNet = weekIn - weekOut;
    const weekStart = weekBalance;
    weekBalance += weekNet;
    weekly.push({
      week: w,
      monthLabel: monthData?.monthLabel ?? "",
      startingBalance: weekStart,
      cashIn: weekIn,
      cashOut: weekOut,
      netCashFlow: weekNet,
      endingBalance: weekBalance,
    });
  }

  return {
    months,
    weekly,
    lowestBalance,
    lowestBalanceMonth: lowestMonth,
    cashBreakevenMonth,
    startingCash: startingCashBalance,
    totalCashIn: totalIn,
    totalCashOut: totalOut,
    totalNetFlow: totalIn - totalOut,
    endingBalance: balance,
  };
}

function calculateOverrides(
  state: CalculatorState,
  totalRevenueR: number,
  totalRevenueW: number,
  totalRevenueD: number,
  afGrossRevenue: number,
): CalculationResult['overrides'] {
  const entries: CalculationResult['overrides']['entries'] = [];
  let totalOverrideCost = 0;

  for (const override of state.overrides) {
    if (!override.enabled) continue;

    let revenue = 0;
    if (override.channels.retail) revenue += totalRevenueR;
    if (override.channels.wholesale) revenue += totalRevenueW;
    if (override.channels.distributor) revenue += totalRevenueD;
    if (override.channels.affiliate) revenue += afGrossRevenue;

    const basisRevenue = override.basis === 'net' ? revenue : revenue; // gross and net same for now
    const amount = basisRevenue * (override.percentage / 100);

    totalOverrideCost += amount;

    const channelNames: string[] = [];
    if (override.channels.retail) channelNames.push('Retail');
    if (override.channels.wholesale) channelNames.push('Wholesale');
    if (override.channels.distributor) channelNames.push('Distributor');
    if (override.channels.affiliate) channelNames.push('Affiliate');

    entries.push({
      name: override.name,
      amount,
      percentage: override.percentage,
      channels: channelNames,
    });
  }

  return { totalOverrideCost, entries };
}

function calculateCommissions(
  state: CalculatorState,
  C: {
    priceR: number;
    priceW: number;
    priceD: number;
    gpR: number;
    gpW: number;
    gpD: number;
  },
  _ohTotal: number,
  ohPerPack: number,
  shipPerPackR: number,
  shipPerPackW: number,
  shipPerPackD: number
): CommissionResults {
  const { commissions, skus, monthlyVolumes } = state;
  const { president, vps, rsms, sps } = commissions;

  let totalPacksR = 0;
  let totalPacksW = 0;
  let totalPacksD = 0;

  skus.forEach((sku) => {
    const vol = getSkuMonthlyVolume(sku.id, monthlyVolumes, skus);
    totalPacksR += vol * (sku.mixR / 100);
    totalPacksW += vol * (sku.mixW / 100);
    totalPacksD += vol * (sku.mixD / 100);
  });

  const perf = {
    R: { vol: state.includeR ? totalPacksR : 0, rev: state.includeR ? totalPacksR * C.priceR : 0, gp: state.includeR ? totalPacksR * C.gpR : 0 },
    W: { vol: state.includeW ? totalPacksW : 0, rev: state.includeW ? totalPacksW * C.priceW : 0, gp: state.includeW ? totalPacksW * C.gpW : 0 },
    D: { vol: state.includeD ? totalPacksD : 0, rev: state.includeD ? totalPacksD * C.priceD : 0, gp: state.includeD ? totalPacksD * C.gpD : 0 },
  };

  const activeSPsPerChannel = {
    R: sps.filter((sp) => sp.chR).length || 1,
    W: sps.filter((sp) => sp.chW).length || 1,
    D: sps.filter((sp) => sp.chD).length || 1,
  };

  const spShare = (channel: "R" | "W" | "D", sp: (typeof sps)[0]) => {
    if (!sp[`ch${channel}`]) return { vol: 0, rev: 0, gp: 0 };
    const count = activeSPsPerChannel[channel];
    const vol = perf[channel].vol / count;
    const rev = perf[channel].rev / count;
    const gp = perf[channel].gp / count;
    return { vol, rev, gp };
  };

  const spsWithPay = sps.map((sp) => {
    let units = 0;
    let grossRev = 0;
    let grossProfit = 0;

    (["R", "W", "D"] as ("R" | "W" | "D")[]).forEach((ch) => {
      const share = spShare(ch, sp);
      units += share.vol;
      grossRev += share.rev;
      grossProfit += share.gp;
    });

    let base = 0;
    if (sp.type === "pctGrossRev") base = grossRev * (sp.val / 100);
    else if (sp.type === "perPack") base = units * sp.val;

    let bonus = 0;
    sp.bonuses.forEach((b) => {
      const metricVal =
        b.metric === "units"
          ? units
          : b.metric === "grossRev"
            ? grossRev
            : grossProfit;
      if (metricVal >= b.thresh) bonus += b.amt;
    });

    return {
      ...sp,
      basePay: base,
      bonusPay: bonus,
      totalPay: base + bonus + sp.baseSalary,
      _units: units,
      _grossRev: grossRev,
      _grossProfit: grossProfit,
    };
  });

  const rsmsWithPay = rsms.map((rsm) => {
    const assignedSPs = spsWithPay.filter((sp) => sp.assignedRSM === rsm.id);
    let units = 0;
    let grossRev = 0;

    assignedSPs.forEach((sp) => {
      if (rsm.chR) { units += sp._units; grossRev += sp._grossRev; }
      if (rsm.chW) { units += sp._units; grossRev += sp._grossRev; }
      if (rsm.chD) { units += sp._units; grossRev += sp._grossRev; }
    });

    let override = 0;
    if (rsm.type === "pctGrossRev") override = grossRev * (rsm.val / 100);
    else if (rsm.type === "perPack") override = units * rsm.val;

    return { ...rsm, overridePay: override, totalPay: override + rsm.baseSalary };
  });

  const vpsWithPay = vps.map((vp) => {
    let units = 0;
    let grossRev = 0;

    spsWithPay.forEach((sp) => {
      if (vp.chR && sp.assignedVp_R === vp.id) { units += sp._units; grossRev += sp._grossRev; }
      if (vp.chW && sp.assignedVp_W === vp.id) { units += sp._units; grossRev += sp._grossRev; }
      if (vp.chD && sp.assignedVp_D === vp.id) { units += sp._units; grossRev += sp._grossRev; }
    });

    let override = 0;
    if (vp.type === "pctGrossRev") override = grossRev * (vp.val / 100);
    else if (vp.type === "perPack") override = units * vp.val;

    return { ...vp, overridePay: override, totalPay: override + vp.baseSalary };
  });

  const includedVPs = vpsWithPay.filter((vp) => vp.includePres).map((vp) => vp.id);

  let presUnits = 0;
  let presGrossRev = 0;

  spsWithPay.forEach((sp) => {
    const belongsToIncludedVp =
      includedVPs.includes(sp.assignedVp_R) ||
      includedVPs.includes(sp.assignedVp_W) ||
      includedVPs.includes(sp.assignedVp_D);

    if (belongsToIncludedVp) {
      if (president.chR) { presUnits += sp._units; presGrossRev += sp._grossRev; }
      if (president.chW) { presUnits += sp._units; presGrossRev += sp._grossRev; }
      if (president.chD) { presUnits += sp._units; presGrossRev += sp._grossRev; }
    }
  });

  let presOverride = 0;
  if (president.type === "pctGrossRev") presOverride = presGrossRev * (president.val / 100);
  else if (president.type === "perPack") presOverride = presUnits * president.val;

  const presidentWithPay = { ...president, overridePay: presOverride, totalPay: presOverride + president.baseSalary };

  const totalRevenue = perf.R.rev + perf.W.rev + perf.D.rev;
  const totalOpProfit =
    (C.gpR - ohPerPack - shipPerPackR) * totalPacksR +
    (C.gpW - ohPerPack - shipPerPackW) * totalPacksW +
    (C.gpD - ohPerPack - shipPerPackD) * totalPacksD;

  const totalComm =
    spsWithPay.reduce((sum, sp) => sum + sp.totalPay, 0) +
    rsmsWithPay.reduce((sum, rsm) => sum + rsm.totalPay, 0) +
    vpsWithPay.reduce((sum, vp) => sum + vp.totalPay, 0) +
    presidentWithPay.totalPay;

  const totalBonus = spsWithPay.reduce((sum, sp) => sum + sp.bonusPay, 0);

  const totalBaseSalary =
    president.baseSalary +
    vps.reduce((sum, vp) => sum + vp.baseSalary, 0) +
    rsms.reduce((sum, rsm) => sum + rsm.baseSalary, 0) +
    sps.reduce((sum, sp) => sum + sp.baseSalary, 0);

  return {
    president: presidentWithPay,
    vps: vpsWithPay,
    rsms: rsmsWithPay,
    sps: spsWithPay,
    totalRevenue,
    totalOpProfit,
    totalComm,
    totalBaseSalary,
    totalBonus,
    commPctGross: totalRevenue > 0 ? totalComm / totalRevenue : 0,
    commPctOp: totalOpProfit > 0 ? totalComm / totalOpProfit : 0,
  };
}