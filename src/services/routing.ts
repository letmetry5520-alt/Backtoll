export interface RouteRequest {
  origin: string;
  destination: string;
}

export interface RouteResponse {
  distanceKm: number;
  durationMinutes: number;
  success: boolean;
  message?: string;
}

export const getRouteDistance = async (req: RouteRequest): Promise<RouteResponse> => {
  const o = req.origin.toLowerCase();
  const d = req.destination.toLowerCase();
  
  // Enhanced Distance Guesser - Consistent logic for 10+ major PH destinations
  let distance = 150; // Default fallback for untracked provinces
  
  // Define regional markers
  const northStart = ["manila", "quezon", "valenzuela", "subdivision", "marker", "caloocan", "marilao", "bulacan"];
  const isFromNorthStart = northStart.some(k => o.includes(k));
  const isToNorthStart = northStart.some(k => d.includes(k));

  // Determine standard distances (one-way from Manila/QC center)
  const getBaseDistance = (addr: string) => {
    if (addr.includes("bangar") || addr.includes("bacnotan")) return 285;
    if (addr.includes("union") || addr.includes("san fernando") || addr.includes("luna")) return 265;
    if (addr.includes("baguio") || addr.includes("benguet")) return 245;
    if (addr.includes("vigan") || addr.includes("ilocos sur")) return 405;
    if (addr.includes("laoag") || addr.includes("ilocos norte")) return 480;
    if (addr.includes("tarlac")) return 125;
    if (addr.includes("dau") || addr.includes("pampanga") || addr.includes("san fernando pampanga")) return 75;
    if (addr.includes("pangasinan") || addr.includes("dagupan") || addr.includes("urdaneta")) return 175;
    if (addr.includes("clark")) return 95;
    if (addr.includes("subic") || addr.includes("zambales")) return 165;
    if (addr.includes("batangas") || addr.includes("lipa")) return 105;
    if (addr.includes("laguna") || addr.includes("calamba")) return 55;
    if (addr.includes("tagaytay") || addr.includes("cavite")) return 65;
    if (addr.includes("naga") || addr.includes("camarines")) return 380;
    if (addr.includes("legazpi") || addr.includes("albay")) return 470;
    if (addr.includes("sorsogon")) return 520;
    if (addr.includes("quezon province") || addr.includes("lucena") || addr.includes("sariaya")) return 130;
    return null;
  };

  // Calculate distance based on origin/destination matching
  let resolvedDist = getBaseDistance(d) || getBaseDistance(o);
  
  if (resolvedDist !== null) {
    distance = resolvedDist;
    // ADJUSTMENT: If starting/ending in Marilao/Bulacan/North, but going South, don't subtract.
    // However, if both are in North/South library, adjust.
    if ((o.includes("marilao") || o.includes("ramcar") || o.includes("bulacan")) && distance > 50) {
      // If destination is in the North Library, we're partway there.
      const isDestinationNorth = ["union", "baguio", "ilocos", "tarlac", "pampanga", "pangasinan", "clark", "subic"].some(k => d.includes(k));
      if (isDestinationNorth) {
         distance -= 35; // Bulacan is ~35km ahead for Northbound
      } else {
         distance += 35; // Bulacan is ~35km back for Southbound (must pass Manila)
      }
    }
  }

  return new Promise(resolve => setTimeout(() => resolve({
    distanceKm: distance,
    durationMinutes: distance * 1.6,
    success: true,
    message: distance === 150 
      ? "Using estimated regional distance." 
      : resolvedDist ? `PH Route Library: Detected distance for ${distance}km route.` : "Standard PH Estimate."
  }), 800));
};
