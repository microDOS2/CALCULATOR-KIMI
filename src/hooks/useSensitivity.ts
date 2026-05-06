import { useState, useCallback } from "react";
import { calculate } from "@/lib/calculator";
import type { CalculatorState, CalculationResult } from "@/types/calculator";

export interface SensitivityDelta {
  label: string;
  base: number;
  shadow: number;
  unit: string;
}

export function useSensitivity(baseState: CalculatorState, baseResult: CalculationResult) {
  // Shadow state starts as deep copy of base; user modifies this in simulate mode
  const [shadowState, setShadowState] = useState<CalculatorState>(() =>
    JSON.parse(JSON.stringify(baseState))
  );
  const [isActive, setIsActive] = useState(false);

  // Keep shadow in sync when base changes and sensitivity is NOT active
  // (when active, user is exploring — don't overwrite their sandbox)
  // This is handled by the caller via useEffect

  const enable = useCallback(() => {
    setShadowState(JSON.parse(JSON.stringify(baseState)));
    setIsActive(true);
  }, [baseState]);

  const disable = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setShadowState(JSON.parse(JSON.stringify(baseState)));
  }, [baseState]);

  const applyToModel = useCallback(() => {
    setIsActive(false);
    return shadowState;
  }, [shadowState]);

  const updateShadow = useCallback((patch: Partial<CalculatorState>) => {
    setShadowState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSku = useCallback((id: string, patch: Partial<CalculatorState["skus"][0]>) => {
    setShadowState((prev) => ({
      ...prev,
      skus: prev.skus.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const updatePlan = useCallback((id: string, patch: Partial<CalculatorState["subscriptionPlans"][0]>) => {
    setShadowState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }));
  }, []);

  const shadowResult = isActive ? calculate(shadowState) : null;

  const deltas: SensitivityDelta[] = [];
  if (shadowResult) {
    deltas.push({ label: "Blended Revenue / Pack", base: baseResult.brev, shadow: shadowResult.brev, unit: "$" });
    deltas.push({ label: "Blended GP / Pack", base: baseResult.bgpp, shadow: shadowResult.bgpp, unit: "$" });
    deltas.push({ label: "Blended GM", base: baseResult.bgmp * 100, shadow: shadowResult.bgmp * 100, unit: "%" });
    deltas.push({ label: "Blended OP / Pack", base: baseResult.bopp, shadow: shadowResult.bopp, unit: "$" });
    deltas.push({ label: "Break-Even (Blended)", base: baseResult.beUnitsB, shadow: shadowResult.beUnitsB, unit: "packs" });
    deltas.push({ label: "Total MRR", base: baseResult.subscriptionSummary.totalMRR, shadow: shadowResult.subscriptionSummary.totalMRR, unit: "$" });
    deltas.push({ label: "Total ARR", base: baseResult.subscriptionSummary.totalARR, shadow: shadowResult.subscriptionSummary.totalARR, unit: "$" });
    deltas.push({ label: "12-Mo Profit", base: baseResult.subscriptionSummary.combinedAnnualProfit, shadow: shadowResult.subscriptionSummary.combinedAnnualProfit, unit: "$" });
  }

  return {
    isActive,
    enable,
    disable,
    reset,
    applyToModel,
    shadowState,
    shadowResult,
    updateShadow,
    updateSku,
    updatePlan,
    deltas,
  };
}
