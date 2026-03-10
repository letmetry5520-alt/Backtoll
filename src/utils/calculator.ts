import { CalculationParams, CalculationResult, TollEntry } from "../types";

export const calculateTollCost = (
  tolls: TollEntry[],
  vehicleClass: CalculationParams["vehicleClass"],
  isRoundTrip: boolean
): number => {
  const oneWayToll = tolls.reduce((sum, toll) => {
    const rate = toll.rates[vehicleClass] || 0;
    return sum + rate;
  }, 0);
  
  return isRoundTrip ? oneWayToll * 2 : oneWayToll;
};

export const calculateTotals = (params: CalculationParams): CalculationResult => {
  const {
    distanceKm,
    efficiencyKmPerL,
    fuelPrice,
    selectedTolls,
    vehicleClass,
    isRoundTrip = false,
    contingencyPercent = 0
  } = params;

  // Double distance if round trip
  const totalDistance = isRoundTrip ? distanceKm * 2 : distanceKm;
  
  // Fuel calculation
  const litersNeeded = efficiencyKmPerL > 0 ? totalDistance / efficiencyKmPerL : 0;
  const fuelCost = litersNeeded * fuelPrice;
  
  // Toll calculation
  const totalTollCost = calculateTollCost(selectedTolls, vehicleClass, isRoundTrip);
  
  // Subtotal and contingency
  const subTotal = fuelCost + totalTollCost;
  const contingencyAmount = (subTotal * contingencyPercent) / 100;
  const grandTotal = subTotal + contingencyAmount;

  return {
    fuelCost,
    litersNeeded,
    totalTollCost,
    contingencyAmount,
    subTotal,
    grandTotal
  };
};
