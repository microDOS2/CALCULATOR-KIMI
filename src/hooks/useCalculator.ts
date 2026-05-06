import { useState, useCallback, useEffect } from "react";
import type {
  CalculatorState,
  SKU,
  Ingredient,
  PackagingLayer,
  OverheadItem,
  CommissionState,
  ThirdPartyCompany,
  Scenario,
} from "@/types/calculator";
import { calculate, createDefaultPackaging } from "@/lib/calculator";

let uidCounter = 0;
const uid = () => `u${++uidCounter}`;

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
      { id: uid(), name: "Ingredient 1", mgPerUnit: 2, costPerMg: 0.7 },
      { id: uid(), name: "Ingredient 2", mgPerUnit: 800, costPerMg: 0.000075 },
      { id: uid(), name: "Ingredient 3", mgPerUnit: 198, costPerMg: 0.00015 },
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
    ohR: true,
    ohW: true,
    ohD: true,
    includeThirdParty: false,
    includeR: true,
    includeW: true,
    includeD: true,
    beIncludeOverhead: true,
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
  };
};

const encodeState = (state: CalculatorState): string => {
  try {
    const json = JSON.stringify(state);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
};

const decodeState = (hash: string): CalculatorState | null => {
  try {
    const json = decodeURIComponent(atob(hash.replace(/^#/, "")));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const LS_KEY = "channel_calc_scenarios_v8";

const loadScenarios = (): Scenario[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
  const [state, setState] = useState<CalculatorState>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const decoded = decodeState(window.location.hash);
      if (decoded) return decoded;
    }
    return createDefaultState();
  });

  const result = calculate(state);

  useEffect(() => {
    const timer = setTimeout(() => {
      const encoded = encodeState(state);
      if (encoded && typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${encoded}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  const updateState = useCallback((patch: Partial<CalculatorState>) => {
    setState((prev) => ({ ...prev, ...patch }));
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
      return {
        ...prev,
        skus: [...prev.skus, newSku],
        order: [...prev.order, { skuId: id, qty: 0 }],
        monthlyVolumes: [...prev.monthlyVolumes, { skuId: id, qty: 1000 }],
      };
    });
  }, []);

  const removeSKU = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      skus: prev.skus.filter((s) => s.id !== id),
      order: prev.order.filter((o) => o.skuId !== id),
      monthlyVolumes: prev.monthlyVolumes.filter((m) => m.skuId !== id),
    }));
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
    setState((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: uid(), name: "", mgPerUnit: 0, costPerMg: 0 },
      ],
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
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.id !== id),
    }));
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

  // Overhead
  const addOverhead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      overhead: [...prev.overhead, { id: uid(), name: "", cost: 0 }],
    }));
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
    setState((prev) => ({
      ...prev,
      overhead: prev.overhead.filter((o) => o.id !== id),
    }));
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
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        vps: [
          ...prev.commissions.vps,
          {
            id: uid(),
            name: `VP ${prev.commissions.vps.length + 1}`,
            type: "pctGrossRev",
            val: 2,
            chR: true,
            chW: true,
            chD: true,
            includePres: true,
          },
        ],
      },
    }));
  }, []);

  const removeVP = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        vps: prev.commissions.vps.filter((v) => v.id !== id),
        rsms: prev.commissions.rsms.map((r) =>
          r.assignedVP === id ? { ...r, assignedVP: "" } : r
        ),
      },
    }));
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
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        rsms: [
          ...prev.commissions.rsms,
          {
            id: uid(),
            name: `RSM ${prev.commissions.rsms.length + 1}`,
            type: "pctGrossRev",
            val: 3,
            chR: true,
            chW: true,
            chD: true,
            assignedVP: "",
          },
        ],
      },
    }));
  }, []);

  const removeRSM = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        rsms: prev.commissions.rsms.filter((r) => r.id !== id),
        sps: prev.commissions.sps.map((s) =>
          s.assignedRSM === id ? { ...s, assignedRSM: "" } : s
        ),
      },
    }));
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
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        sps: [
          ...prev.commissions.sps,
          {
            id: uid(),
            name: `Rep ${prev.commissions.sps.length + 1}`,
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
    }));
  }, []);

  const removeSP = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      commissions: {
        ...prev.commissions,
        sps: prev.commissions.sps.filter((s) => s.id !== id),
      },
    }));
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

  // Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>(loadScenarios);

  const saveScenario = useCallback(
    (label: string) => {
      const scenario: Scenario = {
        id: uid(),
        savedAt: new Date().toLocaleString(),
        label: label.trim(),
        inputs: JSON.parse(JSON.stringify(state)),
      };
      const next = [scenario, ...scenarios].slice(0, 50);
      setScenarios(next);
      saveScenarios(next);
    },
    [state, scenarios]
  );

  const loadScenario = useCallback((scenario: Scenario) => {
    setState(scenario.inputs);
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
    setState(createDefaultState());
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
    scenarios,
    saveScenario,
    loadScenario,
    deleteScenario,
    clearScenarios,
    resetAll,
  };
}
