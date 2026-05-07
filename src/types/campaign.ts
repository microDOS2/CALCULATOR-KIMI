export interface Campaign {
  id: string;
  name: string;
  discountPercent: number; // e.g., 20 = 20% off
  durationWeeks: number; // how many weeks the campaign runs
  affectedChannels: { retail: boolean; wholesale: boolean; distributor: boolean };
  expectedVolumeUplift: number; // % increase in volume during campaign (e.g., 50 = 50% more sales)
}
