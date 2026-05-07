// Extensible module state pattern for CalculatorState.
// New features (MOQ tiers, Tax layers, Campaigns, etc.) should add their
// state slices here and extend CalculatorState via module augmentation.
// This prevents every new feature from touching core types.

export interface ModuleState {
  // Placeholder for future modules.
  // Phase 2.1: moqTiers?: MoqTierConfig[];
  // Phase 2.2: shippingZones?: ShippingZoneConfig[];
  // Phase 2.3: taxLayers?: TaxLayerConfig[];
  // Phase 3.2: campaigns?: CampaignConfig[];
}

/**
 * Migration step type — each schema bump registers a function here.
 */
export type MigrationStep = (state: Record<string, unknown>) => Record<string, unknown>;

const migrations: Record<number, MigrationStep> = {
  // v0 -> v1: handled inline in migrateState() for now.
  // Future: 1: addMoqTiers, 2: addTaxLayers, etc.
};

export function runMigrations(state: Record<string, unknown>, fromVersion: number, toVersion: number): Record<string, unknown> {
  let current = { ...state };
  for (let v = fromVersion; v < toVersion; v++) {
    const step = migrations[v];
    if (step) {
      current = step(current);
    }
  }
  return current;
}
