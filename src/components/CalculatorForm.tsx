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
      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-3xl shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex justify-end">
          <button type="button" onClick={setDemoRoute} className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors mb-2">
              LOAD DEMO TRIP
          </button>
        </div>

        <div className="relative bg-slate-900/40 border border-slate-800 rounded-3xl p-1 mb-6 shadow-inner">
          <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-800 z-0"></div>
          <AddressAutocomplete 
            label="Origin" 
            placeholder="Starting Point..." 
            value={origin} 
            onChange={setOrigin} 
            required 
            icon={<CircleDot size={18} className="text-blue-500 fill-blue-500/20" />}
          />
          <div className="h-[1px] bg-slate-800 mx-12"></div>
          <AddressAutocomplete 
            label="Destination" 
            placeholder="Heading To..." 
            value={destination} 
            onChange={setDestination} 
            required 
            icon={<MapPin size={18} className="text-red-500 fill-red-500/20" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Vehicle Class</label>
            <select value={vehicleClass} onChange={e => setVehicleClass(e.target.value as VehicleClass)}
                    className="w-full rounded-2xl border-slate-800 border bg-slate-900 text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg text-sm font-bold">
              <option value="Class 1">🚗 Class 1</option>
              <option value="Class 2">🚐 Class 2 (Hiace/Truck)</option>
              <option value="Class 3">🚛 Class 3 (Trailer)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Fuel Type</label>
            <select value={fuelType} onChange={e => handleFuelTypeChange(e.target.value as FuelType)}
                    className="w-full rounded-2xl border-slate-800 border bg-slate-900 text-slate-100 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg text-sm font-bold">
              <option value="Diesel">🛢️ Diesel</option>
              <option value="Unleaded">⛽ Unleaded / Gas</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Efficiency (km/L)</label>
            <input required type="number" step="0.1" value={efficiency} onChange={e => setEfficiency(e.target.value)}
                  className="w-full rounded-2xl border-slate-800 border bg-slate-900 text-white p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg text-sm font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-widest pl-1">{fuelType} (₱/L)</label>
            <input required type="number" step="0.01" value={fuelPrice} onChange={e => setFuelPrice(e.target.value)}
                  className="w-full rounded-2xl border-slate-800 border bg-slate-900 text-white p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-lg text-sm font-bold" />
          </div>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" checked={isRoundTrip} onChange={e => setIsRoundTrip(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-slate-800 bg-slate-900 text-blue-500 focus:ring-blue-500/50 transition-all" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">Round Trip</span>
          </label>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Contingency</span>
            <div className="flex items-center gap-1.5">
               <input type="number" step="1" min="0" max="100" value={contingency} onChange={e => setContingency(e.target.value)}
                    className="w-16 rounded-xl border-slate-800 border bg-slate-900 text-white p-2 text-center text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
               <span className="text-[10px] font-black text-slate-400 font-mono">%</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4.5 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-3 uppercase tracking-tighter text-sm italic py-4">
          <Fuel size={20} className="text-white" />
          {isLoading ? "CALCULATING..." : "START CALCULATION"}
        </button>

      </form>

      {/* Database/Meta Info Matrix */}
      {/* Database/Meta Info Matrix */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-[10px] text-slate-400 space-y-4">
        <div className="flex items-center gap-2 font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
          <Info size={14} className="text-blue-500" />
          System Data Matrix
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="font-extrabold text-slate-200">FUEL (PH AVERAGE)</div>
            <div className="flex justify-between"><span>Diesel:</span> <span className="font-mono text-white font-black tracking-tight">₱{DEFAULT_DIESEL_PRICE.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Unleaded:</span> <span className="font-mono text-white font-black tracking-tight">₱{DEFAULT_UNLEADED_PRICE.toFixed(2)}</span></div>
            <div className="pt-1 opacity-60 text-[8px] uppercase font-bold italic tracking-wider">Synced: {fuelType === "Diesel" ? CONFIG_META.DIESEL_PRICE_DATE : CONFIG_META.GASOLINE_PRICE_DATE}</div>
          </div>
          <div className="space-y-2">
            <div className="font-extrabold text-slate-200">EXPRESSWAYS</div>
            <div className="flex justify-between"><span>Toll Rates:</span> <span className="text-emerald-400 font-bold">VERIFIED</span></div>
            <div className="flex justify-between"><span>Last Sync:</span> <span className="text-slate-100 font-bold">{CONFIG_META.TOLLS_LAST_UPDATED}</span></div>
            <div className="pt-1 opacity-60 text-[8px] uppercase font-bold italic tracking-wider line-clamp-1">Source: {CONFIG_META.SOURCES.TOLLS}</div>
          </div>
        </div>
      </div>

      {/* Full Expressway Rate Guide - ALWAYS VISIBLE */}
      <div className="mt-10 space-y-5">
        <div className="flex items-center gap-2.5 px-1">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18"/><path d="m9 21 3-3 3 3"/><path d="m9 3 3 3 3-3"/><path d="M12 18V6"/></svg>
          </div>
          <h3 className="font-black text-slate-200 text-xs uppercase tracking-[0.2em]">Regional Toll Directory</h3>
        </div>

        <div className="space-y-5">
          {/* Group tolls by Expressway */}
          {Array.from(new Set(TOLL_RATES.map(t => t.expressway))).map(exp => (
            <div key={exp} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-800/50 px-5 py-3 text-slate-100 text-[10px] font-black uppercase tracking-[0.15em] flex justify-between items-center border-b border-slate-800">
                <span>{exp} EXPRESSWAY</span>
                <span className="bg-blue-600 px-2.5 py-1 rounded-full text-[8px] font-black">ACTIVE</span>
              </div>
              <div className="divide-y divide-slate-800">
                {TOLL_RATES.filter(t => t.expressway === exp).map(toll => (
                  <div key={toll.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                    <div className="font-black text-slate-100 text-sm mb-4 tracking-tight">{toll.name}</div>
                    <div className="grid grid-cols-3 gap-3">
                       {(["Class 1", "Class 2", "Class 3"] as VehicleClass[]).map(v => (
                         <div key={v} className="text-center rounded-2xl bg-slate-800/50 p-2.5 border border-slate-800 hover:border-blue-500/50 transition-colors group">
                           <div className="text-[8px] text-slate-500 font-black uppercase leading-tight mb-1 group-hover:text-blue-400 transition-colors">{v}</div>
                           <div className="text-[11px] font-black text-white font-mono">₱{toll.rates[v]}</div>
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
