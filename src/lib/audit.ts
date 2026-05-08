import type { CalculatorState, AuditLogEntry } from "@/types/calculator";

let logIdCounter = 0;
const newLogId = () => `al_${++logIdCounter}_${Date.now()}`;

const money = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const pctStr = (v: number) => `${v.toFixed(1)}%`;

interface DiffResult {
  category: AuditLogEntry["category"];
  field: string;
  path: string;
  oldValue: string;
  newValue: string;
}

function pushDiff(diffs: DiffResult[], category: AuditLogEntry["category"], field: string, path: string, oldVal: unknown, newVal: unknown) {
  const oldStr = typeof oldVal === "number" ? (field.includes("Price") || field.includes("Cost") || field.includes("Revenue") || field.includes("Balance") || field.includes("Service") ? money(oldVal) : field.includes("Rate") || field.includes("Disc") || field.includes("Percent") || field.includes("Mix") || field.includes("margin") || field.includes(" uplift") ? pctStr(oldVal) : String(oldVal)) : String(oldVal ?? "—");
  const newStr = typeof newVal === "number" ? (field.includes("Price") || field.includes("Cost") || field.includes("Revenue") || field.includes("Balance") || field.includes("Service") ? money(newVal) : field.includes("Rate") || field.includes("Disc") || field.includes("Percent") || field.includes("Mix") || field.includes("margin") || field.includes(" uplift") ? pctStr(newVal) : String(newVal)) : String(newVal ?? "—");
  if (oldStr === newStr) return;
  diffs.push({ category, field, path, oldValue: oldStr, newValue: newStr });
}

/**
 * Compare two CalculatorState objects and return a list of audit log entries
 * for every meaningful change. Only records changes, not additions/deletions
 * of array items (those are handled separately by the CRUD functions).
 */
export function diffState(oldState: CalculatorState, newState: CalculatorState): AuditLogEntry[] {
  const diffs: DiffResult[] = [];
  const now = Date.now();

  // —— PRODUCT (SKUs) ——
  newState.skus.forEach((sku, i) => {
    const oldSku = oldState.skus[i];
    if (!oldSku) return; // new SKU added — handled by addSKU logging
    if (sku.name !== oldSku.name) pushDiff(diffs, "Product", `${sku.name} — Name`, `skus.${i}.name`, oldSku.name, sku.name);
    if (sku.unitsPerPack !== oldSku.unitsPerPack) pushDiff(diffs, "Product", `${sku.name} — Units/Pack`, `skus.${i}.unitsPerPack`, oldSku.unitsPerPack, sku.unitsPerPack);
    if (sku.retailPrice !== oldSku.retailPrice) pushDiff(diffs, "Product", `${sku.name} — Retail Price`, `skus.${i}.retailPrice`, oldSku.retailPrice, sku.retailPrice);
    if (sku.mixR !== oldSku.mixR) pushDiff(diffs, "Product", `${sku.name} — Retail Mix`, `skus.${i}.mixR`, oldSku.mixR, sku.mixR);
    if (sku.mixW !== oldSku.mixW) pushDiff(diffs, "Product", `${sku.name} — Wholesale Mix`, `skus.${i}.mixW`, oldSku.mixW, sku.mixW);
    if (sku.mixD !== oldSku.mixD) pushDiff(diffs, "Product", `${sku.name} — Distributor Mix`, `skus.${i}.mixD`, oldSku.mixD, sku.mixD);
    // Packaging layers
    sku.packaging.forEach((layer, li) => {
      const oldLayer = oldSku.packaging[li];
      if (!oldLayer) return;
      if (layer.name !== oldLayer.name) pushDiff(diffs, "Packaging", `${sku.name} — ${layer.name} — Name`, `skus.${i}.packaging.${li}.name`, oldLayer.name, layer.name);
      if (layer.costPerUnit !== oldLayer.costPerUnit) pushDiff(diffs, "Packaging", `${sku.name} — ${layer.name} — Cost/Unit`, `skus.${i}.packaging.${li}.costPerUnit`, oldLayer.costPerUnit, layer.costPerUnit);
      if (layer.unitsPerLayer !== oldLayer.unitsPerLayer) pushDiff(diffs, "Packaging", `${sku.name} — ${layer.name} — Units/Layer`, `skus.${i}.packaging.${li}.unitsPerLayer`, oldLayer.unitsPerLayer, layer.unitsPerLayer);
      if (layer.weightPerUnit !== oldLayer.weightPerUnit) pushDiff(diffs, "Packaging", `${sku.name} — ${layer.name} — Weight/Unit`, `skus.${i}.packaging.${li}.weightPerUnit`, oldLayer.weightPerUnit, layer.weightPerUnit);
      if (layer.included !== oldLayer.included) pushDiff(diffs, "Packaging", `${sku.name} — ${layer.name} — Included`, `skus.${i}.packaging.${li}.included`, oldLayer.included, layer.included);
    });
  });

  // —— INGREDIENTS ——
  newState.ingredients.forEach((ing, i) => {
    const oldIng = oldState.ingredients[i];
    if (!oldIng) return;
    if (ing.name !== oldIng.name) pushDiff(diffs, "Ingredients", `${ing.name} — Name`, `ingredients.${i}.name`, oldIng.name, ing.name);
    if (ing.mgPerUnit !== oldIng.mgPerUnit) pushDiff(diffs, "Ingredients", `${ing.name} — mg/Unit`, `ingredients.${i}.mgPerUnit`, oldIng.mgPerUnit, ing.mgPerUnit);
    if (ing.costPerMg !== oldIng.costPerMg) pushDiff(diffs, "Ingredients", `${ing.name} — Cost/mg`, `ingredients.${i}.costPerMg`, oldIng.costPerMg, ing.costPerMg);
    if (ing.supplierPaymentDays !== oldIng.supplierPaymentDays) pushDiff(diffs, "Ingredients", `${ing.name} — Payment Days`, `ingredients.${i}.supplierPaymentDays`, oldIng.supplierPaymentDays, ing.supplierPaymentDays);
  });

  // —— CHANNELS ——
  if (newState.wDisc !== oldState.wDisc) pushDiff(diffs, "Channels", "Wholesale Discount", "wDisc", oldState.wDisc, newState.wDisc);
  if (newState.dDisc !== oldState.dDisc) pushDiff(diffs, "Channels", "Distributor Discount", "dDisc", oldState.dDisc, newState.dDisc);
  if (newState.includeR !== oldState.includeR) pushDiff(diffs, "Channels", "Include Retail", "includeR", oldState.includeR, newState.includeR);
  if (newState.includeW !== oldState.includeW) pushDiff(diffs, "Channels", "Include Wholesale", "includeW", oldState.includeW, newState.includeW);
  if (newState.includeD !== oldState.includeD) pushDiff(diffs, "Channels", "Include Distributor", "includeD", oldState.includeD, newState.includeD);

  // —— SHIPPING ——
  if (newState.shippingPerPack !== oldState.shippingPerPack) pushDiff(diffs, "Shipping", "Shipping/Pack", "shippingPerPack", oldState.shippingPerPack, newState.shippingPerPack);
  if (newState.useShippingRateTable !== oldState.useShippingRateTable) pushDiff(diffs, "Shipping", "Use Rate Table", "useShippingRateTable", oldState.useShippingRateTable, newState.useShippingRateTable);
  if (newState.includeShip !== oldState.includeShip) pushDiff(diffs, "Shipping", "Include Shipping", "includeShip", oldState.includeShip, newState.includeShip);

  // —— OVERHEAD ——
  newState.overhead.forEach((oh, i) => {
    const oldOh = oldState.overhead[i];
    if (!oldOh) return;
    if (oh.name !== oldOh.name) pushDiff(diffs, "Overhead", `${oh.name} — Name`, `overhead.${i}.name`, oldOh.name, oh.name);
    if (oh.cost !== oldOh.cost) pushDiff(diffs, "Overhead", `${oh.name} — Cost`, `overhead.${i}.cost`, oldOh.cost, oh.cost);
  });

  // —— TAX ——
  if (newState.retailSalesTaxRate !== oldState.retailSalesTaxRate) pushDiff(diffs, "Tax", "Retail Sales Tax Rate", "retailSalesTaxRate", oldState.retailSalesTaxRate, newState.retailSalesTaxRate);
  if (newState.distributorImportDutyRate !== oldState.distributorImportDutyRate) pushDiff(diffs, "Tax", "Import Duty Rate", "distributorImportDutyRate", oldState.distributorImportDutyRate, newState.distributorImportDutyRate);

  // —— VOLUME ——
  newState.monthlyVolumes.forEach((mv, i) => {
    const oldMv = oldState.monthlyVolumes[i];
    if (!oldMv) return;
    if (mv.qty !== oldMv.qty) {
      const sku = newState.skus.find((s) => s.id === mv.skuId);
      pushDiff(diffs, "Volume", `${sku?.name || mv.skuId} — Monthly Qty`, `monthlyVolumes.${i}.qty`, oldMv.qty, mv.qty);
    }
  });

  // —— CASH FLOW ——
  if (newState.startingCashBalance !== oldState.startingCashBalance) pushDiff(diffs, "Cash Flow", "Starting Cash Balance", "startingCashBalance", oldState.startingCashBalance, newState.startingCashBalance);
  if (newState.customerPaymentTerms.retailDays !== oldState.customerPaymentTerms.retailDays) pushDiff(diffs, "Cash Flow", "Retail Payment Terms (days)", "customerPaymentTerms.retailDays", oldState.customerPaymentTerms.retailDays, newState.customerPaymentTerms.retailDays);
  if (newState.customerPaymentTerms.wholesaleDays !== oldState.customerPaymentTerms.wholesaleDays) pushDiff(diffs, "Cash Flow", "Wholesale Payment Terms (days)", "customerPaymentTerms.wholesaleDays", oldState.customerPaymentTerms.wholesaleDays, newState.customerPaymentTerms.wholesaleDays);
  if (newState.customerPaymentTerms.distributorDays !== oldState.customerPaymentTerms.distributorDays) pushDiff(diffs, "Cash Flow", "Distributor Payment Terms (days)", "customerPaymentTerms.distributorDays", oldState.customerPaymentTerms.distributorDays, newState.customerPaymentTerms.distributorDays);
  if (newState.inventoryLeadTimeDays !== oldState.inventoryLeadTimeDays) pushDiff(diffs, "Cash Flow", "Inventory Lead Time", "inventoryLeadTimeDays", oldState.inventoryLeadTimeDays, newState.inventoryLeadTimeDays);
  if (newState.debtServiceMonthly !== oldState.debtServiceMonthly) pushDiff(diffs, "Cash Flow", "Debt Service", "debtServiceMonthly", oldState.debtServiceMonthly, newState.debtServiceMonthly);

  // —— SUBSCRIPTIONS ——
  newState.subscriptionPlans.forEach((plan, i) => {
    const oldPlan = oldState.subscriptionPlans[i];
    if (!oldPlan) return;
    if (plan.name !== oldPlan.name) pushDiff(diffs, "Subscriptions", `${plan.name} — Name`, `subscriptionPlans.${i}.name`, oldPlan.name, plan.name);
    if (plan.monthlyPrice !== oldPlan.monthlyPrice) pushDiff(diffs, "Subscriptions", `${plan.name} — Monthly Price`, `subscriptionPlans.${i}.monthlyPrice`, oldPlan.monthlyPrice, plan.monthlyPrice);
    if (plan.startingSubscribers !== oldPlan.startingSubscribers) pushDiff(diffs, "Subscriptions", `${plan.name} — Starting Subscribers`, `subscriptionPlans.${i}.startingSubscribers`, oldPlan.startingSubscribers, plan.startingSubscribers);
    if (plan.monthlyGrowthRate !== oldPlan.monthlyGrowthRate) pushDiff(diffs, "Subscriptions", `${plan.name} — Growth Rate`, `subscriptionPlans.${i}.monthlyGrowthRate`, oldPlan.monthlyGrowthRate, plan.monthlyGrowthRate);
    if (plan.monthlyChurnRate !== oldPlan.monthlyChurnRate) pushDiff(diffs, "Subscriptions", `${plan.name} — Churn Rate`, `subscriptionPlans.${i}.monthlyChurnRate`, oldPlan.monthlyChurnRate, plan.monthlyChurnRate);
    if (plan.cac !== oldPlan.cac) pushDiff(diffs, "Subscriptions", `${plan.name} — CAC`, `subscriptionPlans.${i}.cac`, oldPlan.cac, plan.cac);
    if (plan.included !== oldPlan.included) pushDiff(diffs, "Subscriptions", `${plan.name} — Included`, `subscriptionPlans.${i}.included`, oldPlan.included, plan.included);
  });

  // —— COMMISSIONS ——
  const { president: newPres } = newState.commissions;
  const { president: oldPres } = oldState.commissions;
  if (newPres.name !== oldPres.name) pushDiff(diffs, "Commissions", `${newPres.name} — President Name`, "commissions.president.name", oldPres.name, newPres.name);
  if (newPres.val !== oldPres.val) pushDiff(diffs, "Commissions", `${newPres.name} — President Rate`, "commissions.president.val", oldPres.val, newPres.val);

  // —— OVERRIDES ——
  newState.overrides.forEach((ov, i) => {
    const oldOv = oldState.overrides[i];
    if (!oldOv) return;
    if (ov.name !== oldOv.name) pushDiff(diffs, "Overrides", `${ov.name} — Name`, `overrides.${i}.name`, oldOv.name, ov.name);
    if (ov.percentage !== oldOv.percentage) pushDiff(diffs, "Overrides", `${ov.name} — Percentage`, `overrides.${i}.percentage`, oldOv.percentage, ov.percentage);
    if (ov.basis !== oldOv.basis) pushDiff(diffs, "Overrides", `${ov.name} — Basis`, `overrides.${i}.basis`, oldOv.basis, ov.basis);
    if (ov.enabled !== oldOv.enabled) pushDiff(diffs, "Overrides", `${ov.name} — Enabled`, `overrides.${i}.enabled`, oldOv.enabled, ov.enabled);
  });

  // —— AFFILIATES ——
  if (newState.affiliate.enabled !== oldState.affiliate.enabled) pushDiff(diffs, "Affiliates", "Affiliate Program Enabled", "affiliate.enabled", oldState.affiliate.enabled, newState.affiliate.enabled);
  if (newState.affiliate.monthlyNewReferrals !== oldState.affiliate.monthlyNewReferrals) pushDiff(diffs, "Affiliates", "Monthly New Referrals", "affiliate.monthlyNewReferrals", oldState.affiliate.monthlyNewReferrals, newState.affiliate.monthlyNewReferrals);
  if (newState.affiliate.clickToPurchaseRate !== oldState.affiliate.clickToPurchaseRate) pushDiff(diffs, "Affiliates", "Click-to-Purchase Rate", "affiliate.clickToPurchaseRate", oldState.affiliate.clickToPurchaseRate, newState.affiliate.clickToPurchaseRate);
  if (newState.affiliate.payoutDayOfMonth !== oldState.affiliate.payoutDayOfMonth) pushDiff(diffs, "Affiliates", "Payout Day", "affiliate.payoutDayOfMonth", oldState.affiliate.payoutDayOfMonth, newState.affiliate.payoutDayOfMonth);

  // —— CAMPAIGNS ——
  newState.campaigns.forEach((camp, i) => {
    const oldCamp = oldState.campaigns[i];
    if (!oldCamp) return;
    if (camp.name !== oldCamp.name) pushDiff(diffs, "Campaigns", `${camp.name} — Name`, `campaigns.${i}.name`, oldCamp.name, camp.name);
    if (camp.discountPercent !== oldCamp.discountPercent) pushDiff(diffs, "Campaigns", `${camp.name} — Discount %`, `campaigns.${i}.discountPercent`, oldCamp.discountPercent, camp.discountPercent);
    if (camp.expectedVolumeUplift !== oldCamp.expectedVolumeUplift) pushDiff(diffs, "Campaigns", `${camp.name} — Volume Uplift`, `campaigns.${i}.expectedVolumeUplift`, oldCamp.expectedVolumeUplift, camp.expectedVolumeUplift);
  });

  // Convert diffs to audit log entries
  return diffs.map((d) => ({
    id: newLogId(),
    timestamp: now,
    category: d.category,
    field: d.field,
    path: d.path,
    oldValue: d.oldValue,
    newValue: d.newValue,
  }));
}

/**
 * Create a manual audit log entry for CRUD operations (add/remove)
 */
export function createAuditEntry(
  category: AuditLogEntry["category"],
  field: string,
  path: string,
  oldValue: string,
  newValue: string
): AuditLogEntry {
  return {
    id: newLogId(),
    timestamp: Date.now(),
    category,
    field,
    path,
    oldValue,
    newValue,
  };
}

/**
 * Trim audit log to max entries, keeping the most recent
 */
export function trimAuditLog(log: AuditLogEntry[], maxEntries = 500): AuditLogEntry[] {
  if (log.length <= maxEntries) return log;
  return log.slice(-maxEntries);
}
