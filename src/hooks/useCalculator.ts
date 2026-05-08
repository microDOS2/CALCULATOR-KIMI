import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  CalculatorState,
  SKU,
  Ingredient,
  PackagingLayer,
  OverheadItem,
  CommissionState,
  ThirdPartyCompany,
  Scenario,
  OverrideEntry,
} from "@/types/calculator";
import { calculate, createDefaultPackaging } from "@/lib/calculator";
import { useSensitivity } from "./useSensitivity";
import { useUndoRedo } from "./useUndoRedo";
import { diffState, createAuditEntry, trimAuditLog } from "@/lib/audit";
import LZString from "lz-string";

let uidCounter = 0;
const uid = () => `u${++uidCounter}`;

const AUTOSAVE_KEY = "channel_calc_autosave_v10";

const defaultThirdPartyCompanies: ThirdPartyCompany[] = [
  {
    name: "Sales Company",
    included: false,
    items: [
      "Sales Strategy Development", "Territory & Channel Mapping", "Prospecting & Lead Generation",
      "CRM Setup & Management", "Pipeline Management", "Sales Collateral Creation",
      "Sales Training & Coaching", "Sales Call Execution", "Trade Show Representation",
      "Distributor & Retailer Outreach", "Key Account Management", "Sales Order Processing",
      "Negotiation & Contract Closing", "Commission on Sales", "Sales Performance Reporting",
      "Wholesale Account Setup Fees", "Retail Buyer Introductions", "Customer Relationship Mgmt",
      "Merchandising & Display Setup", "Sampling & Demo Programs", "Incentive Program Mgmt",
      "Channel Conflict Resolution", "Market Feedback Reporting", "Sales Forecasting",
      "Customer Onboarding & Education"
    ].map((name) => ({ name, cost: 0 })),
  },
  {
    name: "Operations Company",
    included: false,
    items: [
      "Operations Strategy Development", "SOP Creation & Documentation", "Workflow Optimization",
      "Process Automation & Tech", "KPI Dashboard Setup", "Supply Chain Management",
      "Vendor Contract Negotiation", "Inventory Oversight", "Freight & Shipping Coordination",
      "Procurement & Purchasing", "Quality Control Audits", "Risk & Compliance Oversight",
      "Facility & Equipment Management", "Workforce Scheduling", "Safety & OSHA Programs",
      "Lean / Cost Reduction", "Returns & Reverse Logistics", "ERP/CRM/WMS Integration",
      "Customer Service Oversight", "Performance Tracking Reports", "Multi-Channel Ops Alignment",
      "Training & Onboarding", "IT Infrastructure Support", "Project Management Services",
      "Crisis & Contingency Planning"
    ].map((name) => ({ name, cost: 0 })),
  },
  {
    name: "Fulfillment Company",
    included: false,
    items: [
      "Inbound Receiving Fees", "SKU Setup Fees", "Quality Control on Receipt",
      "Pallet Breakdown / Sorting", "Storage Fees (pallet/bin)", "Climate-Controlled Storage",
      "Long-Term Storage Fees", "Pick Fees (per item)", "Pack Fees (per order)",
      "Packaging Materials", "Custom Packaging / Branded Boxes", "Kitting & Assembly",
      "Shipping Label Fees", "Carrier Postage (pass-through)", "Freight Coordination (LTL/FTL)",
      "International Shipping Docs", "Returns Processing Fees", "Rework / Relabeling",
      "Lot & Expiration Tracking", "Subscription Box Assembly", "Account Management Fee",
      "Tech Integration Fee", "Inventory Cycle Counting", "Disposal / Liquidation Fees",
      "Rush Order / Priority Handling"
    ].map((name) => ({ name, cost: 0 })),
  },
  {
    name: "Business Management Company",
    included: false,
    items: [
      "Business Strategy Development", "Market & Channel Planning", "Fractional CEO/COO Advisory",
      "OKRs & Roadmap Development", "Financial Modeling & Forecasting", "Budget Development & Oversight",
      "Profitability & Margin Analysis", "Fundraising & Investor Support", "Governance & Board Reporting",
      "Risk & Compliance Oversight", "Contract & Legal Coordination", "Licensing & Regulatory Filing",
      "Vendor Oversight & Coordination", "Cross-System Integration", "HR & Org Design",
      "Compensation & Incentive Planning", "Executive Recruiting Support", "Performance Management Systems",
      "Capital Allocation Strategy", "Strategic Partnership Dev.", "Channel Performance Reviews",
      "Quarterly Business Reviews", "KPI Dashboard Reporting", "Scenario Planning & Stress Tests",
      "Crisis & Contingency Mgmt"
    ].map((name) => ({ name, cost: 0 })),
  },
  {
    name: "Marketing Company",
    included: false,
    items: [
      "Marketing Strategy Development", "Brand Identity & Guidelines", "Logo & Visual Design",
      "Content Writing (blogs, copy)", "Photography (product, lifestyle)", "Video Production",
      "Graphic Design (ads, infographics)", "Paid Media Management", "Ad Spend (pass-through)",
      "Conversion Rate Optimization", "Website & Landing Page Design", "Search Engine Optimization (SEO)",
      "Social Media Management", "Influencer & Affiliate Mgmt", "Email Marketing Campaigns",
      "Marketing Automation (HubSpot, etc.)", "PR & Media Outreach", "Event Marketing (launch, pop-ups)",
      "Sponsorship Management", "Analytics Dashboards & Reporting", "Customer Segmentation & Personas",
      "Market Research & Competitor Analysis", "Product Launch Campaigns", "Creative Direction (tone/look/feel)",
      "Crisis Communication & Reputation"
    ].map((name) => ({ name, cost: 0 })),
  },
];

const createDefaultState = (): CalculatorState => {
  const skuId1 = uid();
  return {
    schemaVersion: 1,
    unitSystem: 'mg' as const,
    skus: [
      {
        id: skuId1,
        name: "SKU-A",
        unitsPerPack: 10,
        retailPrice: 57.5,
        mixR: 100,
        mixW: 0,
        mixD: 0,
        packaging: createDefaultPackaging(),
      },
    ],
    order: [{ skuId: skuId1, qty: 1 }],
    ingredients: [
      { id: uid(), name: "Ingredient 1", mgPerUnit: 2, costPerMg: 0.7, supplierPaymentDays: 30, moqTiers: [] },
      { id: uid(), name: "Ingredient 2", mgPerUnit: 800, costPerMg: 0.000075, supplierPaymentDays: 30, moqTiers: [] },
      { id: uid(), name: "Ingredient 3", mgPerUnit: 198, costPerMg: 0.00015, supplierPaymentDays: 30, moqTiers: [] },
    ],
    overhead: [
      { id: uid(), name: "Salaries", cost: 10000 },
      { id: uid(), name: "Rent", cost: 5000 },
      { id: uid(), name: "Insurance", cost: 1000 },
      { id: uid(), name: "Utilities", cost: 500 },
    ],
    monthlyVolumes: [{ skuId: skuId1, qty: 1000 }],
    wDisc: 50,
    dDisc: 25,
    includeShip: true,
    shippingPerPack: 2.5,
    shippingRateBrackets: [
      { maxWeightGrams: 100, cost: 3.50 },
      { maxWeightGrams: 250, cost: 4.50 },
      { maxWeightGrams: 500, cost: 5.75 },
      { maxWeightGrams: 1000, cost: 7.50 },
      { maxWeightGrams: 2000, cost: 10.00 },
      { maxWeightGrams: 5000, cost: 15.00 },
    ],
    useShippingRateTable: false,
    ohR: true,
    ohW: true,
    ohD: true,
    includeThirdParty: false,
    includeR: true,
    includeW: true,
    includeD: true,
    beIncludeOverhead: true,
    retailSalesTaxRate: 0,
    distributorImportDutyRate: 0,
    affiliate: {
      enabled: false,
      tiers: [
        {
          id: uid(),
          name: 'Standard',
          initialType: 'percentage',
          initialRate: 20,
          initialBasis: 'product_only',
          subscriptionEnabled: true,
          subscriptionTiers: [
            { id: uid(), monthStart: 1, monthEnd: 12, rate: 15 },
            { id: uid(), monthStart: 13, monthEnd: 36, rate: 10 },
            { id: uid(), monthStart: 37, monthEnd: 60, rate: 5 },
          ],
          minPayoutThreshold: 50,
        },
      ],
      activeTierId: '', // set at runtime below
      monthlyNewReferrals: 100,
      avgOrderPacks: 2,
      subscriptionConversionRate: 25,
      cookieDays: 60,
      attributionModel: 'first_click',
      clickToPurchaseRate: 5,
      payoutDayOfMonth: 15,
      payoutDelayMonths: 1,
    },
    overrides: [],
    commissions: {
      president: {
        name: "President of Sales",
        type: "pctGrossRev",
        val: 1,
        chR: true,
        chW: true,
        chD: true,
      },
      vps: [
        {
          id: uid(),
          name: "VP of Sales",
          type: "pctGrossRev",
          val: 2,
          chR: true,
          chW: true,
          chD: true,
          includePres: true,
        },
      ],
      rsms: [
        {
          id: uid(),
          name: "RSM 1",
          type: "pctGrossRev",
          val: 3,
          chR: true,
          chW: true,
          chD: true,
          assignedVP: "",
        },
      ],
      sps: [
        {
          id: uid(),
          name: "Salesperson 1",
          type: "pctGrossRev",
          val: 5,
          chR: true,
          chW: true,
          chD: true,
          assignedRSM: "",
          assignedVp_R: "",
          assignedVp_W: "",
          assignedVp_D: "",
          bonuses: [],
        },
      ],
    },
    thirdPartyCompanies: defaultThirdPartyCompanies,
    subscriptionPlans: [
      {
        id: uid(),
        name: "Basic Monthly",
        monthlyPrice: 49.99,
        items: [{ skuId: skuId1, skuName: "SKU-A", packsPerMonth: 1 }],
        startingSubscribers: 100,
        monthlyGrowthRate: 5,
        monthlyChurnRate: 3,
        included: true,
        cac: 25,
      },
    ],
    customerPaymentTerms: {
      retailDays: 0,      // immediate
      wholesaleDays: 30,  // Net-30
      distributorDays: 60, // Net-60
    },
    inventoryLeadTimeDays: 30,
    startingCashBalance: 50000,
    capitalExpenditures: [],
    debtServiceMonthly: 0,
    campaigns: [],
    auditLog: [],
  };
};

// v2: LZ-String compressed URLs (shorter)
const URL_PREFIX_V2 = "c~";

const encodeState = (state: CalculatorState): string => {
  try {
    const json = JSON.stringify(state);
    return URL_PREFIX_V2 + LZString.compressToBase64(json);
  } catch {
    return "";
  }
};

const decodeState = (hash: string): CalculatorState | null => {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;

  // v2: LZ-String compressed
  if (raw.startsWith(URL_PREFIX_V2)) {
    try {
      const compressed = raw.slice(URL_PREFIX_V2.length);
      const json = LZString.decompressFromBase64(compressed);
      if (!json) return null;
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  // v1: Legacy base64+encodeURIComponent (backward compatible)
  try {
    const json = decodeURIComponent(atob(raw));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const CURRENT_SCHEMA_VERSION = 1;

/**
 * Migration runner: takes any decoded/loaded state and ensures it matches
 * the current schema version. Each new schema bump adds a case here.
 */
const migrateState = (raw: Partial<CalculatorState>): CalculatorState => {
  const defaults = createDefaultState();
  // v0 -> v1: Add schemaVersion, per-SKU packaging, subscriptionPlans,
  //           cashFlow fields, capitalExpenditures, debtServiceMonthly
  const migrated: CalculatorState = {
    ...defaults,
    ...raw,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    skus: (raw.skus ?? defaults.skus).map((sku) => ({
      ...defaults.skus[0],
      ...sku,
      packaging: sku.packaging ?? createDefaultPackaging(),
    })),
    subscriptionPlans: raw.subscriptionPlans ?? defaults.subscriptionPlans,
    customerPaymentTerms: raw.customerPaymentTerms ?? defaults.customerPaymentTerms,
    inventoryLeadTimeDays: raw.inventoryLeadTimeDays ?? defaults.inventoryLeadTimeDays,
    startingCashBalance: raw.startingCashBalance ?? defaults.startingCashBalance,
    capitalExpenditures: raw.capitalExpenditures ?? defaults.capitalExpenditures,
    debtServiceMonthly: raw.debtServiceMonthly ?? defaults.debtServiceMonthly,
    shippingRateBrackets: raw.shippingRateBrackets ?? defaults.shippingRateBrackets,
    useShippingRateTable: raw.useShippingRateTable ?? defaults.useShippingRateTable,
    retailSalesTaxRate: raw.retailSalesTaxRate ?? defaults.retailSalesTaxRate,
    distributorImportDutyRate: raw.distributorImportDutyRate ?? defaults.distributorImportDutyRate,
    campaigns: raw.campaigns ?? defaults.campaigns,
    overrides: raw.overrides ?? defaults.overrides,
    affiliate: raw.affiliate ?? defaults.affiliate,
    ingredients: (raw.ingredients ?? defaults.ingredients).map((ing) => ({
      ...ing,
      moqTiers: ing.moqTiers ?? [],
    })),
  };

  return migrated;
};

const LS_KEY = "channel_calc_scenarios_v10";

const loadScenarios = (): Scenario[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Migrate each scenario's inputs to current schema
    return parsed.map((s: Scenario) => ({
      ...s,
      inputs: migrateState(s.inputs),
    }));
  } catch {
    return [];
  }
};

const saveScenarios = (list: Scenario[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

export function useCalculator() {
  // Compute initial state (URL hash or default)
  const initialState = useMemo(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const decoded = decodeState(window.location.hash);
      if (decoded) return migrateState(decoded);
    }
    return createDefaultState();
  }, []);

  const { state, setState, undo, redo, canUndo, canRedo, reset: resetHistory } = useUndoRedo(initialState, { maxHistory: 50 });

  // Recovery: check for auto-saved state on mount
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveredState, setRecoveredState] = useState<CalculatorState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CalculatorState;
      if (parsed.schemaVersion && parsed.schemaVersion >= 1) {
        const migrated = migrateState(parsed);
        const isSame = JSON.stringify(migrated) === JSON.stringify(state);
        if (!isSame) {
          setRecoveredState(migrated);
          setShowRecovery(true);
        }
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = calculate(state);

  // Sensitivity / simulation shadow state
  const sensitivity = useSensitivity(state, result);

  useEffect(() => {
    if (!sensitivity.isActive) {
      sensitivity.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, sensitivity.isActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const encoded = encodeState(state);
      if (encoded && typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${encoded}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  // Ensure affiliate activeTierId is set
  useEffect(() => {
    if (state.affiliate.enabled && state.affiliate.tiers.length > 0 && !state.affiliate.activeTierId) {
      updateState({ affiliate: { ...state.affiliate, activeTierId: state.affiliate.tiers[0].id } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.affiliate.enabled, state.affiliate.tiers, state.affiliate.activeTierId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
      } catch {
        // ignore
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [state]);

  const updateState = useCallback((patch: Partial<CalculatorState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      // Diff and append audit log entries for meaningful changes
      const changes = diffState(prev, next);
      if (changes.length > 0) {
        const mergedLog = trimAuditLog([...prev.auditLog, ...changes]);
        return { ...next, auditLog: mergedLog };
      }
      return next;
    });
  }, []);

  // SKU
  const addSKU = useCallback(() => {
    const id = uid();
    setState((prev) => {
      const newSku: SKU = {
        id,
        name: `SKU-${prev.skus.length + 1}`,
        unitsPerPack: 10,
        retailPrice: 57.5,
        mixR: 100,
        mixW: 0,
        mixD: 0,
        packaging: createDefaultPackaging(),
      };
      const entry = createAuditEntry("Product", `Added SKU "${newSku.name}"`, `skus.${prev.skus.length}`, "—", `Units: ${newSku.unitsPerPack}, Price: $${newSku.retailPrice}`);
      return {
        ...prev,
        skus: [...prev.skus, newSku],
        order: [...prev.order, { skuId: id, qty: 0 }],
        monthlyVolumes: [...prev.monthlyVolumes, { skuId: id, qty: 1000 }],
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const removeSKU = useCallback((id: string) => {
    setState((prev) => {
      const sku = prev.skus.find((s) => s.id === id);
      const entry = createAuditEntry("Product", `Removed SKU "${sku?.name || id}"`, `skus.${prev.skus.findIndex((s) => s.id === id)}`, sku ? `Units: ${sku.unitsPerPack}, Price: $${sku.retailPrice}` : "—", "Removed");
      return {
        ...prev,
        skus: prev.skus.filter((s) => s.id !== id),
        order: prev.order.filter((o) => o.skuId !== id),
        monthlyVolumes: prev.monthlyVolumes.filter((m) => m.skuId !== id),
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateSKU = useCallback((id: string, patch: Partial<SKU>) => {
    setState((prev) => ({
      ...prev,
      skus: prev.skus.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const updateOrderQty = useCallback((skuId: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      order: prev.order.map((o) =>
        o.skuId === skuId ? { ...o, qty: Math.max(0, qty) } : o
      ),
    }));
  }, []);

  // Ingredients
  const addIngredient = useCallback(() => {
    setState((prev) => {
      const idx = prev.ingredients.length;
      const entry = createAuditEntry("Ingredients", `Added Ingredient #${idx + 1}`, `ingredients.${idx}`, "—", "New ingredient added");
      return {
        ...prev,
        ingredients: [
          ...prev.ingredients,
          { id: uid(), name: "", mgPerUnit: 0, costPerMg: 0, supplierPaymentDays: 30, moqTiers: [] },
        ],
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const setIngredients = useCallback((ingredients: Ingredient[]) => {
    setState((prev) => ({
      ...prev,
      ingredients,
    }));
  }, []);

  const updateIngredient = useCallback(
    (id: string, patch: Partial<Ingredient>) => {
      setState((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((i) =>
          i.id === id ? { ...i, ...patch } : i
        ),
      }));
    },
    []
  );

  const removeIngredient = useCallback((id: string) => {
    setState((prev) => {
      const ing = prev.ingredients.find((i) => i.id === id);
      const entry = createAuditEntry("Ingredients", `Removed Ingredient "${ing?.name || id}"`, `ingredients.${prev.ingredients.findIndex((i) => i.id === id)}`, `${ing?.mgPerUnit}mg @ $${ing?.costPerMg}/mg`, "Removed");
      return {
        ...prev,
        ingredients: prev.ingredients.filter((i) => i.id !== id),
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  // Packaging (per-SKU)
  const addPackagingLayer = useCallback((skuId: string) => {
    setState((prev) => ({
      ...prev,
      skus: prev.skus.map((s) =>
        s.id === skuId
          ? {
              ...s,
              packaging: [
                ...s.packaging,
                { id: uid(), name: "", costPerUnit: 0, unitsPerLayer: 1, weightPerUnit: 0, included: true },
              ],
            }
          : s
      ),
    }));
  }, []);

  const updatePackagingLayer = useCallback(
    (skuId: string, layerId: string, patch: Partial<PackagingLayer>) => {
      setState((prev) => ({
        ...prev,
        skus: prev.skus.map((s) =>
          s.id === skuId
            ? {
                ...s,
                packaging: s.packaging.map((p) =>
                  p.id === layerId ? { ...p, ...patch } : p
                ),
              }
            : s
        ),
      }));
    },
    []
  );

  const removePackagingLayer = useCallback((skuId: string, layerId: string) => {
    setState((prev) => ({
      ...prev,
      skus: prev.skus.map((s) =>
        s.id === skuId
          ? { ...s, packaging: s.packaging.filter((p) => p.id !== layerId) }
          : s
      ),
    }));
  }, []);

  // Subscriptions
  const addSubscriptionPlan = useCallback(() => {
    setState((prev) => {
      const newName = `Plan ${prev.subscriptionPlans.length + 1}`;
      const entry = createAuditEntry("Subscriptions", `Added "${newName}"`, `subscriptionPlans.${prev.subscriptionPlans.length}`, "—", "$49.99/mo, 100 subs");
      return {
        ...prev,
        subscriptionPlans: [
          ...prev.subscriptionPlans,
          {
            id: uid(),
            name: newName,
            monthlyPrice: 49.99,
            items: prev.skus.length > 0
              ? [{ skuId: prev.skus[0].id, skuName: prev.skus[0].name, packsPerMonth: 1 }]
              : [],
            startingSubscribers: 100,
            monthlyGrowthRate: 5,
            monthlyChurnRate: 3,
            included: true,
            cac: 25,
          },
        ],
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateSubscriptionPlan = useCallback(
    (id: string, patch: Partial<import("@/types/calculator").SubscriptionPlan>) => {
      setState((prev) => ({
        ...prev,
        subscriptionPlans: prev.subscriptionPlans.map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      }));
    },
    []
  );

  const removeSubscriptionPlan = useCallback((id: string) => {
    setState((prev) => {
      const plan = prev.subscriptionPlans.find((p) => p.id === id);
      const entry = createAuditEntry("Subscriptions", `Removed "${plan?.name || id}"`, `subscriptionPlans.${prev.subscriptionPlans.findIndex((p) => p.id === id)}`, `$${plan?.monthlyPrice}/mo, ${plan?.startingSubscribers} subs`, "Removed");
      return {
        ...prev,
        subscriptionPlans: prev.subscriptionPlans.filter((p) => p.id !== id),
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const addSubscriptionItem = useCallback((planId: string, skuId: string, skuName: string) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((p) =>
        p.id === planId
          ? {
              ...p,
              items: [...p.items, { skuId, skuName, packsPerMonth: 1 }],
            }
          : p
      ),
    }));
  }, []);

  const updateSubscriptionItem = useCallback(
    (planId: string, skuId: string, patch: { packsPerMonth?: number }) => {
      setState((prev) => ({
        ...prev,
        subscriptionPlans: prev.subscriptionPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                items: p.items.map((i) =>
                  i.skuId === skuId ? { ...i, ...patch } : i
                ),
              }
            : p
        ),
      }));
    },
    []
  );

  const removeSubscriptionItem = useCallback((planId: string, skuId: string) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((p) =>
        p.id === planId
          ? { ...p, items: p.items.filter((i) => i.skuId !== skuId) }
          : p
      ),
    }));
  }, []);

  // Overhead
  const addOverhead = useCallback(() => {
    setState((prev) => {
      const entry = createAuditEntry("Overhead", `Added Overhead Item #${prev.overhead.length + 1}`, `overhead.${prev.overhead.length}`, "—", "New overhead line");
      return {
        ...prev,
        overhead: [...prev.overhead, { id: uid(), name: "", cost: 0 }],
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateOverhead = useCallback(
    (id: string, patch: Partial<OverheadItem>) => {
      setState((prev) => ({
        ...prev,
        overhead: prev.overhead.map((o) =>
          o.id === id ? { ...o, ...patch } : o
        ),
      }));
    },
    []
  );

  const removeOverhead = useCallback((id: string) => {
    setState((prev) => {
      const oh = prev.overhead.find((o) => o.id === id);
      const entry = createAuditEntry("Overhead", `Removed "${oh?.name || id}"`, `overhead.${prev.overhead.findIndex((o) => o.id === id)}`, `${oh?.name}: $${oh?.cost}/mo`, "Removed");
      return {
        ...prev,
        overhead: prev.overhead.filter((o) => o.id !== id),
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateMonthlyVolume = useCallback(
    (skuId: string, qty: number) => {
      setState((prev) => ({
        ...prev,
        monthlyVolumes: prev.monthlyVolumes.map((m) =>
          m.skuId === skuId ? { ...m, qty: Math.max(0, qty) } : m
        ),
      }));
    },
    []
  );

  // Commissions
  const addVP = useCallback(() => {
    setState((prev) => {
      const newName = `VP ${prev.commissions.vps.length + 1}`;
      const entry = createAuditEntry("Commissions", `Added VP "${newName}"`, `commissions.vps.${prev.commissions.vps.length}`, "—", "2% Gross Rev");
      return {
        ...prev,
        commissions: {
          ...prev.commissions,
          vps: [
            ...prev.commissions.vps,
            {
              id: uid(),
              name: newName,
              type: "pctGrossRev",
              val: 2,
              chR: true,
              chW: true,
              chD: true,
              includePres: true,
            },
          ],
        },
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const removeVP = useCallback((id: string) => {
    setState((prev) => {
      const vp = prev.commissions.vps.find((v) => v.id === id);
      const entry = createAuditEntry("Commissions", `Removed VP "${vp?.name || id}"`, `commissions.vps.${prev.commissions.vps.findIndex((v) => v.id === id)}`, `${vp?.val}% Gross Rev`, "Removed");
      return {
        ...prev,
        commissions: {
          ...prev.commissions,
          vps: prev.commissions.vps.filter((v) => v.id !== id),
          rsms: prev.commissions.rsms.map((r) =>
            r.assignedVP === id ? { ...r, assignedVP: "" } : r
          ),
        },
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateVP = useCallback(
    (id: string, patch: Partial<CommissionState["vps"][0]>) => {
      setState((prev) => ({
        ...prev,
        commissions: {
          ...prev.commissions,
          vps: prev.commissions.vps.map((v) =>
            v.id === id ? { ...v, ...patch } : v
          ),
        },
      }));
    },
    []
  );

  const addRSM = useCallback(() => {
    setState((prev) => {
      const newName = `RSM ${prev.commissions.rsms.length + 1}`;
      const entry = createAuditEntry("Commissions", `Added RSM "${newName}"`, `commissions.rsms.${prev.commissions.rsms.length}`, "—", "3% Gross Rev");
      return {
        ...prev,
        commissions: {
          ...prev.commissions,
          rsms: [
            ...prev.commissions.rsms,
            {
              id: uid(),
              name: newName,
              type: "pctGrossRev",
              val: 3,
              chR: true,
              chW: true,
              chD: true,
              assignedVP: "",
            },
          ],
        },
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const removeRSM = useCallback((id: string) => {
    setState((prev) => {
      const rsm = prev.commissions.rsms.find((r) => r.id === id);
      const entry = createAuditEntry("Commissions", `Removed RSM "${rsm?.name || id}"`, `commissions.rsms.${prev.commissions.rsms.findIndex((r) => r.id === id)}`, `${rsm?.val}% Gross Rev`, "Removed");
      return {
        ...prev,
        commissions: {
          ...prev.commissions,
          rsms: prev.commissions.rsms.filter((r) => r.id !== id),
          sps: prev.commissions.sps.map((s) =>
            s.assignedRSM === id ? { ...s, assignedRSM: "" } : s
          ),
        },
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateRSM = useCallback(
    (id: string, patch: Partial<CommissionState["rsms"][0]>) => {
      setState((prev) => ({
        ...prev,
        commissions: {
          ...prev.commissions,
          rsms: prev.commissions.rsms.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        },
      }));
    },
    []
  );

  const addSP = useCallback(() => {
    setState((prev) => {
      const newName = `Rep ${prev.commissions.sps.length + 1}`;
      const entry = createAuditEntry("Commissions", `Added Salesperson "${newName}"`, `commissions.sps.${prev.commissions.sps.length}`, "—", "5% Gross Rev");
      return {
        ...prev,
        commissions: {
          ...prev.commissions,
          sps: [
            ...prev.commissions.sps,
            {
              id: uid(),
              name: newName,
              type: "pctGrossRev",
              val: 5,
              chR: true,
              chW: true,
              chD: true,
              assignedRSM: "",
              assignedVp_R: "",
              assignedVp_W: "",
              assignedVp_D: "",
              bonuses: [],
            },
          ],
        },
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const removeSP = useCallback((id: string) => {
    setState((prev) => {
      const sp = prev.commissions.sps.find((s) => s.id === id);
      const entry = createAuditEntry("Commissions", `Removed Salesperson "${sp?.name || id}"`, `commissions.sps.${prev.commissions.sps.findIndex((s) => s.id === id)}`, `${sp?.val}% Gross Rev`, "Removed");
      return {
        ...prev,
        commissions: {
          ...prev.commissions,
          sps: prev.commissions.sps.filter((s) => s.id !== id),
        },
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateSP = useCallback(
    (id: string, patch: Partial<CommissionState["sps"][0]>) => {
      setState((prev) => ({
        ...prev,
        commissions: {
          ...prev.commissions,
          sps: prev.commissions.sps.map((s) =>
            s.id === id ? { ...s, ...patch } : s
          ),
        },
      }));
    },
    []
  );

  const addBonus = useCallback((spId: string) => {
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        sps: prev.commissions.sps.map((s) =>
          s.id === spId
            ? {
                ...s,
                bonuses: [
                  ...s.bonuses,
                  { id: uid(), metric: "units", thresh: 0, amt: 0 },
                ],
              }
            : s
        ),
      },
    }));
  }, []);

  const updateBonus = useCallback(
    (spId: string, bonusId: string, patch: { metric?: string; thresh?: number; amt?: number }) => {
      setState((prev) => ({
        ...prev,
        commissions: {
          ...prev.commissions,
          sps: prev.commissions.sps.map((s) =>
            s.id === spId
              ? {
                  ...s,
                  bonuses: s.bonuses.map((b) =>
                    b.id === bonusId
                      ? {
                          ...b,
                          ...(patch.metric && { metric: patch.metric as "units" | "grossRev" | "grossProfit" }),
                          ...(patch.thresh !== undefined && { thresh: patch.thresh }),
                          ...(patch.amt !== undefined && { amt: patch.amt }),
                        }
                      : b
                  ),
                }
              : s
          ),
        },
      }));
    },
    []
  );

  const removeBonus = useCallback((spId: string, bonusId: string) => {
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        sps: prev.commissions.sps.map((s) =>
          s.id === spId
            ? { ...s, bonuses: s.bonuses.filter((b) => b.id !== bonusId) }
            : s
        ),
      },
    }));
  }, []);

  const updatePresident = useCallback(
    (patch: Partial<CommissionState["president"]>) => {
      setState((prev) => ({
        ...prev,
        commissions: {
          ...prev.commissions,
          president: { ...prev.commissions.president, ...patch },
        },
      }));
    },
    []
  );

  // Third Party
  const updateThirdParty = useCallback(
    (companyName: string, patch: Partial<ThirdPartyCompany>) => {
      setState((prev) => ({
        ...prev,
        thirdPartyCompanies: prev.thirdPartyCompanies.map((c) =>
          c.name === companyName ? { ...c, ...patch } : c
        ),
      }));
    },
    []
  );

  const updateThirdPartyItem = useCallback(
    (companyName: string, itemName: string, cost: number) => {
      setState((prev) => ({
        ...prev,
        thirdPartyCompanies: prev.thirdPartyCompanies.map((c) =>
          c.name === companyName
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.name === itemName ? { ...i, cost } : i
                ),
              }
            : c
        ),
      }));
    },
    []
  );

  // Overrides
  const addOverride = useCallback(() => {
    setState((prev) => {
      const newName = `Override ${prev.overrides.length + 1}`;
      const entry = createAuditEntry("Overrides", `Added "${newName}"`, `overrides.${prev.overrides.length}`, "—", "1% gross — Retail");
      return {
        ...prev,
        overrides: [
          ...prev.overrides,
          {
            id: uid(),
            name: newName,
            percentage: 1,
            channels: { retail: true, wholesale: false, distributor: false, affiliate: false },
            basis: 'gross' as const,
            enabled: true,
          },
        ],
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const removeOverride = useCallback((id: string) => {
    setState((prev) => {
      const ov = prev.overrides.find((o) => o.id === id);
      const entry = createAuditEntry("Overrides", `Removed "${ov?.name || id}"`, `overrides.${prev.overrides.findIndex((o) => o.id === id)}`, `${ov?.percentage}% ${ov?.basis} — ${Object.entries(ov?.channels || {}).filter(([, v]) => v).map(([k]) => k).join(", ")}`, "Removed");
      return {
        ...prev,
        overrides: prev.overrides.filter((o) => o.id !== id),
        auditLog: trimAuditLog([...prev.auditLog, entry]),
      };
    });
  }, []);

  const updateOverride = useCallback((id: string, patch: Partial<OverrideEntry>) => {
    setState((prev) => ({
      ...prev,
      overrides: prev.overrides.map((o) =>
        o.id === id ? { ...o, ...patch } : o
      ),
    }));
  }, []);

  // Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>(loadScenarios);

  const saveScenario = useCallback(
    (label: string, note: string = "") => {
      const scenario: Scenario = {
        id: uid(),
        savedAt: new Date().toLocaleString(),
        label: label.trim(),
        note: note.trim(),
        inputs: JSON.parse(JSON.stringify(state)),
      };
      const next = [scenario, ...scenarios].slice(0, 50);
      setScenarios(next);
      saveScenarios(next);
    },
    [state, scenarios]
  );

  const loadScenario = useCallback((scenario: Scenario) => {
    setState(migrateState(scenario.inputs));
  }, []);

  const deleteScenario = useCallback(
    (id: string) => {
      const next = scenarios.filter((s) => s.id !== id);
      setScenarios(next);
      saveScenarios(next);
    },
    [scenarios]
  );

  const clearScenarios = useCallback(() => {
    setScenarios([]);
    saveScenarios([]);
  }, []);

  const toggleUnitSystem = useCallback(() => {
    setState((prev) => ({
      ...prev,
      unitSystem: prev.unitSystem === 'mg' ? 'oz' : 'mg',
    }));
  }, []);

  const resetAll = useCallback(() => {
    resetHistory(createDefaultState());
  }, [resetHistory]);

  const recoverState = useCallback(() => {
    if (recoveredState) {
      resetHistory(recoveredState);
      setShowRecovery(false);
      setRecoveredState(null);
    }
  }, [recoveredState, resetHistory]);

  const dismissRecovery = useCallback(() => {
    setShowRecovery(false);
    setRecoveredState(null);
  }, []);

  return {
    state,
    result,
    unitSystem: state.unitSystem,
    toggleUnitSystem,
    updateState,
    addSKU,
    removeSKU,
    updateSKU,
    updateOrderQty,
    addIngredient,
    setIngredients,
    updateIngredient,
    removeIngredient,
    addPackagingLayer,
    updatePackagingLayer,
    removePackagingLayer,
    addOverhead,
    updateOverhead,
    removeOverhead,
    updateMonthlyVolume,
    commissions: state.commissions,
    addVP,
    removeVP,
    updateVP,
    addRSM,
    removeRSM,
    updateRSM,
    addSP,
    removeSP,
    updateSP,
    addBonus,
    updateBonus,
    removeBonus,
    updatePresident,
    thirdPartyCompanies: state.thirdPartyCompanies,
    updateThirdParty,
    updateThirdPartyItem,
    overrides: state.overrides,
    addOverride,
    removeOverride,
    updateOverride,
    scenarios,
    saveScenario,
    loadScenario,
    deleteScenario,
    clearScenarios,
    resetAll,
    undo,
    redo,
    canUndo,
    canRedo,
    showRecovery,
    recoverState,
    dismissRecovery,
    subscriptionPlans: state.subscriptionPlans,
    addSubscriptionPlan,
    updateSubscriptionPlan,
    removeSubscriptionPlan,
    addSubscriptionItem,
    updateSubscriptionItem,
    removeSubscriptionItem,
    sensitivity,
  };
}
