"use client";

import React, { useState } from "react";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { CalculationParams, CalculationResult, TollEntry, VehicleClass, FuelType } from "@/types";
import { calculateTotals } from "@/utils/calculator";
import { getRouteDistance } from "@/services/routing";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // Stored state for display
  const [distanceKm, setDistanceKm] = useState(0);
  const [usedTolls, setUsedTolls] = useState<TollEntry[]>([]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [fuelPrice, setFuelPrice] = useState(0);
  const [fuelType, setFuelType] = useState<FuelType>("Diesel");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>("Class 1");
  const [originName, setOriginName] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCalculate = async (params: CalculationParams) => {
    // console.log("Starting calculation with params:", params);
    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      // 1. Fetch route distance
      const routeReq = params; 
      
      const routeInfo = await getRouteDistance({
        origin: routeReq.origin,
        destination: routeReq.destination
      });

      if (!routeInfo.success) {
         setErrorMsg(routeInfo.message || "Failed to calculate route distance");
         setIsLoading(false);
         return;
      }

      // 2. Perform calculation
      const calcParams: CalculationParams = {
        ...params,
        distanceKm: routeInfo.distanceKm
      };

      const calculationResult = calculateTotals(calcParams);

      // 3. Update view state
      setDistanceKm(routeInfo.distanceKm);
      setUsedTolls(params.selectedTolls);
      setIsRoundTrip(!!params.isRoundTrip);
      setFuelPrice(params.fuelPrice);
      setFuelType(params.fuelType);
      setVehicleClass(params.vehicleClass);
      setOriginName(params.origin);
      setDestinationName(params.destination);
      setResult(calculationResult);

    } catch (err) {
      setErrorMsg("An unexpected error occurred during calculation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const shareText = `🛣️ PH Toll & Fuel Estimate
Distance: ${isRoundTrip ? distanceKm * 2 : distanceKm} km
${fuelType} Cost: ₱${result.fuelCost.toFixed(2)}
Toll Fees: ₱${result.totalTollCost.toFixed(2)}
Grand Total: ₱${result.grandTotal.toFixed(2)}

Calculated via PH Toll Calculator app`;

    if (navigator.share) {
      navigator.share({
        title: "Trip Cost Estimate",
        text: shareText
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Estimate copied to clipboard!");
    }
  };

  return (
    <main className="container mx-auto max-w-md p-4 pt-8 pb-20">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trip Calculator</h1>
        <p className="text-slate-500 mt-2 text-sm">Estimate toll fees and fuel cost</p>
      </div>

      <CalculatorForm onCalculate={handleCalculate} isLoading={isLoading} />

      {errorMsg && (
         <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {errorMsg}
         </div>
      )}

      {result && (
        <ResultsDisplay 
          result={result} 
          tolls={usedTolls} 
          distanceKm={distanceKm} 
          isRoundTrip={isRoundTrip} 
          fuelPrice={fuelPrice} 
          fuelType={fuelType}
          vehicleClass={vehicleClass}
          onClose={() => setResult(null)}
          onShare={handleShare}
          originName={originName}
          destinationName={destinationName}
        />
      )}

    </main>
  );
}
