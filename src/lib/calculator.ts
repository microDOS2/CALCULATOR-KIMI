import type {
  CalculatorState,
  CalculationResult,
  CommissionResults,
  POGrandTotals,
  POLineItem,
  PackagingLayer,
  SKU,
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

export function calculate(state: CalculatorState): CalculationResult {
  const {
    skus,
    order,
    ingredients,
    packaging,
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

  // Packaging costs per pack for each SKU
  const packagingCosts = packaging.map((layer) => ({
    id: layer.id,
    name: layer.name,
    costPerPack: 0,
  }));

  // Order-level accumulators
  let totalPacks = 0;
  let totalUnits = 0;
  let totalIngCost = 0;
  let totalPackagingCost = 0;

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
      (a, ing) => a + ing.mgPerUnit * sku.unitsPerPack * ing.costPerMg,
      0
    );
    const pkgPerPack = calculatePackagingCostPerPack(packaging, sku.unitsPerPack);
    const cogsPerPack = ingPerPack + pkgPerPack;

    totalIngCost += ingPerPack * orderQty;
    totalPackagingCost += pkgPerPack * orderQty;

    // Accumulate per-layer costs
    packaging.forEach((layer, idx) => {
      if (layer.included) {
        const layerCostPerPack =
          layer.costPerUnit * (sku.unitsPerPack / Math.max(1, layer.unitsPerLayer));
        packagingCosts[idx].costPerPack += layerCostPerPack * orderQty;
      }
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

  // Normalize packaging costs to per-pack
  packagingCosts.forEach((pc) => {
    pc.costPerPack = totalPacks > 0 ? pc.costPerPack / totalPacks : 0;
  });

  const avgIngCostPerPack = totalPacks > 0 ? totalIngCost / totalPacks : 0;
  const totalPackagingCostPerPack = totalPacks > 0 ? totalPackagingCost / totalPacks : 0;
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

  // Monthly volume
  const totalMonthlyVolume = skus.reduce(
    (sum, sku) => sum + getSkuMonthlyVolume(sku.id, monthlyVolumes, skus),
    0
  );
  const safeMonthlyVolume = Math.max(1, totalMonthlyVolume);

  // Overhead per pack
  const ohPerPack = ohTotal / safeMonthlyVolume;
  const ohPerPackR = ohR ? ohPerPack : 0;
  const ohPerPackW = ohW ? ohPerPack : 0;
  const ohPerPackD = ohD ? ohPerPack : 0;

  const shipPerPack = includeShip ? shippingPerPack : 0;

  // Operating profit per pack
  const opR = gpR - ohPerPackR - shipPerPack;
  const opW = gpW - ohPerPackW;
  const opD = gpD - ohPerPackD;

  // Operating margin
  const omR = avgPriceR > 0 ? opR / avgPriceR : 0;
  const omW = avgPriceW > 0 ? opW / avgPriceW : 0;
  const omD = avgPriceD > 0 ? opD / avgPriceD : 0;

  // Blended
  const totalRevenue = totalRevenueR + totalRevenueW + totalRevenueD;
  const totalGp = totalGpR + totalGpW + totalGpD;

  const brev = totalPacks > 0 ? totalRevenue / totalPacks : 0;
  const bgpp = totalPacks > 0 ? totalGp / totalPacks : 0;
  const bopp = brev > 0 ? bgpp - ohPerPack : 0;
  const bgmp = brev > 0 ? bgpp / brev : 0;
  const bomp = brev > 0 ? bopp / brev : 0;

  const retailerProfit = avgPriceR - avgPriceW;
  const distProfit = avgPriceW - avgPriceD;

  const weightedUnitsPerPack = totalPacks > 0 ? totalUnits / totalPacks : 0;

  // Ingredient cost metrics
  const totalMgPerPack = ingredients.reduce(
    (a, ing) => a + ing.mgPerUnit * weightedUnitsPerPack,
    0
  );
  const totalWeightPerUnit = ingredients.reduce(
    (a, ing) => a + ing.mgPerUnit,
    0
  );
  const totalWeightPerPack = totalWeightPerUnit * weightedUnitsPerPack;
  const costPerMg = totalMgPerPack > 0 ? avgIngCostPerPack / totalMgPerPack : 0;
  const costPerGram = costPerMg * 1000;

  // Packaging weight calculations (in grams)
  const totalPackagingWeightPerPack = packaging.reduce((sum, layer) => {
    if (!layer.included) return sum;
    return sum + layer.weightPerUnit * (weightedUnitsPerPack / Math.max(1, layer.unitsPerLayer));
  }, 0);
  const totalUnitWeightPerPack = (totalWeightPerPack / 1000) + totalPackagingWeightPerPack; // ingredients in mg -> g + packaging in g

  // Per-unit metrics
  const costPerUnit = weightedUnitsPerPack > 0 ? cogsPerPack / weightedUnitsPerPack : 0;
  const profitPerUnitR = weightedUnitsPerPack > 0 ? opR / weightedUnitsPerPack : 0;
  const profitPerUnitW = weightedUnitsPerPack > 0 ? opW / weightedUnitsPerPack : 0;
  const profitPerUnitD = weightedUnitsPerPack > 0 ? opD / weightedUnitsPerPack : 0;
  const overheadPerUnit = weightedUnitsPerPack > 0 ? ohPerPack / weightedUnitsPerPack : 0;

  // Break-even
  const fixedCosts = beIncludeOverhead ? ohTotal : 0;
  const contribR = gpR - shipPerPack;
  const contribW = gpW;
  const contribD = gpD;
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
  };

  order.forEach((orderItem) => {
    const sku = skus.find((s) => s.id === orderItem.skuId);
    if (!sku || orderItem.qty <= 0) return;

    const ingPerPack = ingredients.reduce(
      (a, ing) => a + ing.mgPerUnit * sku.unitsPerPack * ing.costPerMg,
      0
    );
    const pkgPerPack = calculatePackagingCostPerPack(packaging, sku.unitsPerPack);
    const cogsPerPack = ingPerPack + pkgPerPack;

    const retailQty = orderItem.qty * (sku.mixR / 100);
    const wholesaleQty = orderItem.qty * (sku.mixW / 100);
    const distributorQty = orderItem.qty * (sku.mixD / 100);

    const priceR = sku.retailPrice;
    const priceW = priceR * (1 - wDisc / 100);
    const priceD = priceW * (1 - dDisc / 100);

    const retailProfit = retailQty * (priceR - cogsPerPack - shipPerPack);
    const wholesaleProfit = wholesaleQty * (priceW - cogsPerPack);
    const distributorProfit = distributorQty * (priceD - cogsPerPack);
    const totalProfit = retailProfit + wholesaleProfit + distributorProfit;

    poLineItems.push({
      skuId: sku.id,
      skuName: sku.name,
      totalQty: orderItem.qty,
      retailProfit,
      wholesaleProfit,
      distributorProfit,
      totalProfit,
    });

    poGrandTotals.totalQty += orderItem.qty;
    poGrandTotals.retailProfit += retailProfit;
    poGrandTotals.wholesaleProfit += wholesaleProfit;
    poGrandTotals.distributorProfit += distributorProfit;
    poGrandTotals.totalProfit += totalProfit;
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
    shipPerPack
  );

  // Chart data
  const costBreakdown: CalculationResult["costBreakdown"] = [
    { name: "Ingredients", value: avgIngCostPerPack, color: "#10b981" },
    ...packagingCosts
      .filter((p) => p.costPerPack > 0)
      .map((p, i) => ({
        name: p.name,
        value: p.costPerPack,
        color: ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"][i % 6],
      })),
  ];

  const channelProfits: CalculationResult["channelProfits"] = [
    { name: "Retail", gp: gpR, op: opR, revenue: totalRevenueR },
    { name: "Wholesale", gp: gpW, op: opW, revenue: totalRevenueW },
    { name: "Distributor", gp: gpD, op: opD, revenue: totalRevenueD },
  ];

  return {
    ...state,
    packagingCosts,
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
    shipPerPack,
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
    totalUnits,
    totalMonthlyVolume,
    costBreakdown,
    channelProfits,
  };
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
  shipPerPack: number
): CommissionResults {
  const { commissions, skus, monthlyVolumes } = state;
  const { president, vps, rsms, sps } = commissions;

  const periodMult = 1;

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
    R: { vol: totalPacksR, rev: totalPacksR * C.priceR, gp: totalPacksR * C.gpR },
    W: { vol: totalPacksW, rev: totalPacksW * C.priceW, gp: totalPacksW * C.gpW },
    D: { vol: totalPacksD, rev: totalPacksD * C.priceD, gp: totalPacksD * C.gpD },
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
      totalPay: base + bonus,
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

    return { ...rsm, overridePay: override, totalPay: override };
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

    return { ...vp, overridePay: override, totalPay: override };
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

  const presidentWithPay = { ...president, overridePay: presOverride, totalPay: presOverride };

  const totalRevenue = perf.R.rev + perf.W.rev + perf.D.rev;
  const totalOpProfit =
    (C.gpR - ohPerPack - shipPerPack) * totalPacksR +
    (C.gpW - ohPerPack) * totalPacksW +
    (C.gpD - ohPerPack) * totalPacksD;

  const totalComm =
    spsWithPay.reduce((sum, sp) => sum + sp.totalPay, 0) +
    rsmsWithPay.reduce((sum, rsm) => sum + rsm.totalPay, 0) +
    vpsWithPay.reduce((sum, vp) => sum + vp.totalPay, 0) +
    presidentWithPay.totalPay;

  const totalBonus = spsWithPay.reduce((sum, sp) => sum + sp.bonusPay, 0);

  return {
    president: presidentWithPay,
    vps: vpsWithPay,
    rsms: rsmsWithPay,
    sps: spsWithPay,
    totalRevenue,
    totalOpProfit,
    totalComm,
    totalBonus,
    commPctGross: totalRevenue > 0 ? totalComm / totalRevenue : 0,
    commPctOp: totalOpProfit > 0 ? totalComm / totalOpProfit : 0,
    periodMult,
  };
}
