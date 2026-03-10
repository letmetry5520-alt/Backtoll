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
  },
  {
    id: "slex-alabang-calamba",
    name: "Alabang to Calamba",
    expressway: "SLEX",
    rates: {
      "Class 1": 116,
      "Class 2": 232,
      "Class 3": 348
    }
  },
  {
    id: "slex-calamba-stotomas",
    name: "Calamba to Sto. Tomas",
    expressway: "SLEX",
    rates: {
      "Class 1": 31,
      "Class 2": 63,
      "Class 3": 94
    }
  },
  {
    id: "star-stotomas-lipa",
    name: "Sto. Tomas to Lipa",
    expressway: "STAR",
    rates: {
      "Class 1": 55,
      "Class 2": 110,
      "Class 3": 165
    }
  },
  {
    id: "star-lipa-batangas",
    name: "Lipa to Batangas City",
    expressway: "STAR",
    rates: {
      "Class 1": 49,
      "Class 2": 98,
      "Class 3": 147
    }
  },
  {
    id: "mcx-daanghari",
    name: "MCX (Daang Hari to SLEX)",
    expressway: "MCX",
    rates: {
      "Class 1": 19,
      "Class 2": 39,
      "Class 3": 58
    }
  },
  {
    id: "skyway-stage3",
    name: "Skyway Stage 3 (Balintawak to Buendia/SLEX)",
    expressway: "SKYWAY",
    rates: {
      "Class 1": 264,
      "Class 2": 528,
      "Class 3": 792
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
