import { TollEntry } from "../types";

// ==========================================
// 🚗 DEFAULT VALUES
// ==========================================
// Edit this file to manually update the toll fees and fuel price defaults.
export const CONFIG_META = {
  DIESEL_PRICE_DATE: "2024-05-20",
  GASOLINE_PRICE_DATE: "2024-05-20",
  TOLLS_LAST_UPDATED: "2025-03-02",
  SOURCES: {
    FUEL: "DOE Price Monitor",
    TOLLS: "TRB Monitoring (March 2025 Update)"
  }
};

export const DEFAULT_DIESEL_PRICE = 58.50; // PHP per liter
export const DEFAULT_UNLEADED_PRICE = 64.95; // PHP per liter
export const DEFAULT_VAN_EFFICIENCY = 10; // km per liter

// ==========================================
// 🛣️ TOLL RATES
// ==========================================
// Add or modify toll segments here. 
// A diesel van is usually Class 1, but large passenger vans might be Class 2.
export const TOLL_RATES: TollEntry[] = [
  {
    id: "nlex-balintawak-marilao",
    name: "Balintawak to Marilao",
    expressway: "NLEX",
    rates: {
      "Class 1": 79,
      "Class 2": 199,
      "Class 3": 238
    }
  },
  {
    id: "nlex-marilao-dau",
    name: "Marilao to Dau",
    expressway: "NLEX",
    rates: {
      "Class 1": 337,
      "Class 2": 840,
      "Class 3": 1009
    }
  },
  {
    id: "sctex-mabalacat-tarlac",
    name: "Mabalacat to Tarlac",
    expressway: "SCTEX",
    rates: {
      "Class 1": 158,
      "Class 2": 316,
      "Class 3": 474
    }
  },
  {
    id: "tplex-tarlac-rosario",
    name: "Tarlac to Rosario (La Union)",
    expressway: "TPLEX",
    rates: {
      "Class 1": 311,
      "Class 2": 777,
      "Class 3": 1165
    }
  }
];

/**
 * Helper to get a sample route for Marilao -> La Union
 */
export const getSampleRouteTolls = (): TollEntry[] => {
  return TOLL_RATES.filter(t => [
    "nlex-marilao-dau", 
    "sctex-mabalacat-tarlac", 
    "tplex-tarlac-rosario"
  ].includes(t.id));
};
