import { calculateTotals } from "./calculator";
import { TollEntry } from "../types";

// Running this file with ts-node or integrating with Jest/Vitest
// Here are simple assertions to demonstrate test coverage of core logic.

export const runTests = () => {
  const dummyTolls: TollEntry[] = [
    {
      id: "t1",
      name: "Toll 1",
      expressway: "A",
      rates: { "Class 1": 100 }
    }
  ];

  console.log("Running calculation tests...");

  // Test 1: Basic fuel calculation
  let res = calculateTotals({
    distanceKm: 100,
    efficiencyKmPerL: 10,
    dieselPrice: 50,
    selectedTolls: [],
    vehicleClass: "Class 1"
  });
  // 100km / 10km/L = 10L. 10L * 50 = 500
  if (res.fuelCost !== 500) throw new Error("Test 1 Failed: basic fuel calculation");

  // Test 2: Toll addition
  res = calculateTotals({
    distanceKm: 100, // 500 PHP fuel
    efficiencyKmPerL: 10,
    dieselPrice: 50,
    selectedTolls: dummyTolls, // 100 PHP roll
    vehicleClass: "Class 1"
  });
  if (res.totalTollCost !== 100 || res.grandTotal !== 600) {
    throw new Error("Test 2 Failed: toll addition");
  }

  // Test 3: Round trip behavior
  res = calculateTotals({
    distanceKm: 100, 
    efficiencyKmPerL: 10,
    dieselPrice: 50,
    selectedTolls: dummyTolls, 
    vehicleClass: "Class 1",
    isRoundTrip: true
  });
  // distance * 2 = 200km -> 20L * 50 = 1000 fuel. 
  // tolls * 2 = 200 toll. 1000 + 200 = 1200
  if (res.fuelCost !== 1000 || res.totalTollCost !== 200 || res.grandTotal !== 1200) {
    throw new Error("Test 3 Failed: round trip behavior");
  }

  // Test 4: Contingency addition
  res = calculateTotals({
    distanceKm: 100, 
    efficiencyKmPerL: 10,
    dieselPrice: 50,
    selectedTolls: [], 
    vehicleClass: "Class 1",
    contingencyPercent: 10
  });
  // 500 fuel, 0 toll, 50 contingency -> 550
  if (res.grandTotal !== 550 || res.contingencyAmount !== 50) {
    throw new Error("Test 4 Failed: contingency calculation");
  }

  console.log("All calculation tests passed successfully.");
};

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}
