import React, { useState, useEffect } from "react";
import { VehicleClass, UserPreferences, TollEntry, FuelType } from "../types";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { CircleDot, MapPin, Fuel, Info } from "lucide-react";
import { getPreferences, savePreferences, saveRecentRoute } from "../services/storage";
import { TOLL_RATES, getSampleRouteTolls, DEFAULT_DIESEL_PRICE, DEFAULT_UNLEADED_PRICE, CONFIG_META } from "../config/data";

export interface CalculatorFormProps {
  onCalculate: (params: any) => void;
  isLoading: boolean;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, isLoading }) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>("Class 1");
  const [fuelType, setFuelType] = useState<FuelType>("Diesel");
  const [efficiency, setEfficiency] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [contingency, setContingency] = useState("10");

  useEffect(() => {
    const prefs = getPreferences();
    setVehicleClass(prefs.vehicleClass);
    setEfficiency(prefs.defaultEfficiency.toString());
    setFuelType(prefs.fuelType || "Diesel");
    
    // Set initial price based on fuel type if no last price stored
    if (prefs.lastFuelPrice) {
      setFuelPrice(prefs.lastFuelPrice.toString());
    } else {
      setFuelPrice(prefs.fuelType === "Unleaded" ? DEFAULT_UNLEADED_PRICE.toString() : DEFAULT_DIESEL_PRICE.toString());
    }
  }, []);

  // Update default price when fuel type changes (unless user touched it?)
  const handleFuelTypeChange = (type: FuelType) => {
    setFuelType(type);
    setFuelPrice(type === "Unleaded" ? DEFAULT_UNLEADED_PRICE.toString() : DEFAULT_DIESEL_PRICE.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    // Save prefs
    savePreferences({
      vehicleClass,
      fuelType,
      defaultEfficiency: Number(efficiency),
      lastFuelPrice: Number(fuelPrice)
    });

    saveRecentRoute({ origin, destination });

    const o = origin.toLowerCase();
    const d = destination.toLowerCase();
    
    let selectedTolls: TollEntry[] = [];
    
    // 🛣️ SMART ROUTE DETECTION (PH EXPRESSWAYS)
    const northKeywords = [
      "manila", "quezon", "bulacan", "marilao", "pampanga", "tarlac", "union", "baguio", 
      "vigan", "laoag", "pangasinan", "ilocos", "subdivision", "valenzuela", "malabon", "caloocan",
      "bangar", "luna", "fernando", "bauang", "bacnotan", "santo tomas", "rosario", "ulu", "dagupan", "urdaneta",
      "clark", "subic", "zambales", "bataan", "hermosa", "dinalupihan"
    ];
    
    const southKeywords = ["batangas", "laguna", "calamba", "lipa", "tagaytay", "naga", "albay", "bicol", "quezon province", "lucena"];
    
    const isNorthbound = northKeywords.some(k => o.includes(k)) && northKeywords.some(k => d.includes(k));
    const isSouthbound = (o.includes("manila") || o.includes("makati") || o.includes("paranaque") || o.includes("alabang")) && southKeywords.some(k => d.includes(k));

    if (isNorthbound) {
      const allNorthTolls = ["nlex-balintawak-marilao", "nlex-marilao-dau", "sctex-mabalacat-tarlac", "tplex-tarlac-rosario"];
      
      // EXCLUSION LOGIC: Skip Balintawak segment if starting in Bulacan
      let ids = [...allNorthTolls];
      const isBulacanResident = (o.includes("marilao") || o.includes("ramcar") || o.includes("subdivision") || o.includes("bulacan")) && 
                               !(o.includes("manila") || o.includes("quezon"));
      
      if (isBulacanResident) {
        ids = ids.filter(id => id !== "nlex-balintawak-marilao");
      }
      
      // Sub-route logic: If ending in Tarlac, skip TPLEX
      if (d.includes("tarlac") || d.includes("pampanga")) {
        ids = ids.filter(id => id.includes("nlex") || id.includes("sctex"));
      }
      if (d.includes("pampanga")) {
        ids = ids.filter(id => id.includes("nlex"));
      }

      selectedTolls = TOLL_RATES.filter(t => ids.includes(t.id));
    } 
    else if (isSouthbound) {
       // Placeholder for SLEX/STAR matrix (Coming soon in full)
       selectedTolls = [TOLL_RATES[0]]; 
    }
    else {
      selectedTolls = []; 
    }

    onCalculate({
      origin,
      destination,
      vehicleClass,
      fuelType,
      efficiencyKmPerL: Number(efficiency) || 10,
      fuelPrice: Number(fuelPrice) || 0,
      isRoundTrip,
      contingencyPercent: Number(contingency) || 0,
      selectedTolls
    });
  };

  const setDemoRoute = () => {
    setOrigin("Marilao, Bulacan");
    setDestination("San Juan, La Union");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        
        <div className="flex justify-end">
          <button type="button" onClick={setDemoRoute} className="text-sm text-blue-600 hover:underline">
              Load Demo Route
          </button>
        </div>

        <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-1 mb-6">
          <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-200 z-0"></div>
          <AddressAutocomplete 
            label="Origin" 
            placeholder="Where from?" 
            value={origin} 
            onChange={setOrigin} 
            required 
            icon={<CircleDot size={18} className="text-blue-500 fill-blue-100" />}
          />
          <div className="h-[1px] bg-slate-200 mx-12"></div>
          <AddressAutocomplete 
            label="Destination" 
            placeholder="Where to?" 
            value={destination} 
            onChange={setDestination} 
            required 
            icon={<MapPin size={18} className="text-red-500 fill-red-100" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Class</label>
            <select value={vehicleClass} onChange={e => setVehicleClass(e.target.value as VehicleClass)}
                    className="w-full rounded-xl border-slate-200 border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
            <select value={fuelType} onChange={e => handleFuelTypeChange(e.target.value as FuelType)}
                    className="w-full rounded-xl border-slate-200 border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="Diesel">Diesel</option>
              <option value="Unleaded">Unleaded / Gas</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Efficiency (km/L)</label>
            <input required type="number" step="0.1" value={efficiency} onChange={e => setEfficiency(e.target.value)}
                  className="w-full rounded-xl border-slate-200 border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{fuelType} Price (₱/L)</label>
            <input required type="number" step="0.01" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)}
                  className="w-full rounded-xl border-slate-200 border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isRoundTrip} onChange={e => setIsRoundTrip(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-slate-700">Round Trip</span>
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">Contingency</span>
            <input type="number" step="1" min="0" max="100" value={contingency} onChange={e => setContingency(e.target.value)}
                  className="w-16 rounded-lg border-slate-200 border p-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-sm font-medium text-slate-700">%</span>
          </div>
        </div>

        <button type="submit" disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
          <Fuel size={20} />
          {isLoading ? "Calculating..." : "Calculate Cost"}
        </button>

      </form>

      {/* Database/Meta Info Matrix */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-wider">
          <Info size={14} />
          Data Matrix Status
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-slate-600">Fuel (PH Average)</div>
            <div>Diesel: <span className="text-slate-800">₱{DEFAULT_DIESEL_PRICE.toFixed(2)}</span></div>
            <div>Unleaded: <span className="text-slate-800">₱{DEFAULT_UNLEADED_PRICE.toFixed(2)}</span></div>
            <div className="pt-1 italic">Update: {fuelType === "Diesel" ? CONFIG_META.DIESEL_PRICE_DATE : CONFIG_META.GASOLINE_PRICE_DATE}</div>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-600">Expressways</div>
            <div>Toll Rates: <span className="text-slate-800">Verified</span></div>
            <div>Last Sync: <span className="text-slate-800">{CONFIG_META.TOLLS_LAST_UPDATED}</span></div>
            <div className="pt-1 italic">Source: {CONFIG_META.SOURCES.TOLLS}</div>
          </div>
        </div>
      </div>

      {/* Full Expressway Rate Guide - ALWAYS VISIBLE */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18"/><path d="m9 21 3-3 3 3"/><path d="m9 3 3 3 3-3"/><path d="M12 18V6"/></svg>
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Expressway Rate Guide (V1)</h3>
        </div>

        <div className="space-y-4">
          {/* Group tolls by Expressway */}
          {Array.from(new Set(TOLL_RATES.map(t => t.expressway))).map(exp => (
            <div key={exp} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="bg-slate-800 px-4 py-2 text-white text-[10px] font-bold uppercase tracking-widest flex justify-between items-center">
                <span>{exp} Expressway</span>
                <span className="bg-slate-700 px-2 py-0.5 rounded">Rates Matrix</span>
              </div>
              <div className="divide-y divide-slate-50">
                {TOLL_RATES.filter(t => t.expressway === exp).map(toll => (
                  <div key={toll.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="font-semibold text-slate-800 text-sm mb-3">{toll.name}</div>
                    <div className="grid grid-cols-3 gap-2">
                       {(["Class 1", "Class 2", "Class 3"] as VehicleClass[]).map(v => (
                         <div key={v} className="text-center rounded-lg bg-slate-50 p-2 border border-slate-100">
                           <div className="text-[9px] text-slate-400 font-bold uppercase leading-tight mb-1">{v}</div>
                           <div className="text-xs font-bold text-slate-700 font-mono">₱{toll.rates[v]}</div>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
