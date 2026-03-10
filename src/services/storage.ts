import { UserPreferences } from "../types";
import { DEFAULT_VAN_EFFICIENCY, DEFAULT_DIESEL_PRICE } from "../config/data";

const PREFS_KEY = "ph-toll-calc-prefs";
const RECENT_ROUTES_KEY = "ph-toll-calc-recent-routes";

export const getPreferences = (): UserPreferences => {
  if (typeof window === "undefined") {
    return {
      defaultEfficiency: DEFAULT_VAN_EFFICIENCY,
      lastFuelPrice: DEFAULT_DIESEL_PRICE,
      fuelType: "Diesel",
      vehicleClass: "Class 1"
    };
  }

  const stored = localStorage.getItem(PREFS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  return {
    defaultEfficiency: DEFAULT_VAN_EFFICIENCY,
    lastFuelPrice: DEFAULT_DIESEL_PRICE,
    fuelType: "Diesel",
    vehicleClass: "Class 1"
  };
};

export const savePreferences = (prefs: Partial<UserPreferences>) => {
  if (typeof window === "undefined") return;
  const current = getPreferences();
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
};

export interface RecentRoute {
  origin: string;
  destination: string;
}

export const getRecentRoutes = (): RecentRoute[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECENT_ROUTES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return [];
};

export const saveRecentRoute = (route: RecentRoute) => {
  if (typeof window === "undefined") return;
  let routes = getRecentRoutes();
  
  // Remove if it exists
  routes = routes.filter(
    r => r.origin.toLowerCase() !== route.origin.toLowerCase() || 
         r.destination.toLowerCase() !== route.destination.toLowerCase()
  );
  
  // Add to top
  routes.unshift(route);
  
  // Keep only last 5
  if (routes.length > 5) {
    routes = routes.slice(0, 5);
  }
  
  localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(routes));
};
