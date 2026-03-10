export type VehicleClass = "Class 1" | "Class 2" | "Class 3";
export type FuelType = "Diesel" | "Unleaded";

export interface TollEntry {
  id: string;
  name: string;
  expressway: string;
  rates: Partial<Record<VehicleClass, number>>;
  notes?: string;
}

export interface CalculationParams {
  origin: string;
  destination: string;
  distanceKm: number;
  efficiencyKmPerL: number;
  fuelPrice: number;
  fuelType: FuelType;
  selectedTolls: TollEntry[];
  vehicleClass: VehicleClass;
  isRoundTrip?: boolean;
  contingencyPercent?: number;
}

export interface CalculationResult {
  fuelCost: number;
  litersNeeded: number;
  totalTollCost: number;
  contingencyAmount: number;
  subTotal: number;
  grandTotal: number;
}

export interface UserPreferences {
  defaultEfficiency: number;
  lastFuelPrice?: number;
  fuelType: FuelType;
  vehicleClass: VehicleClass;
}
