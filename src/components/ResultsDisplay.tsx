import React, { useEffect } from "react";
import { CalculationResult, TollEntry, VehicleClass, FuelType } from "../types";
import { X, Share2, AlertCircle } from "lucide-react";

export interface ResultsDisplayProps {
  result: CalculationResult | null;
  tolls: TollEntry[];
  distanceKm: number;
  isRoundTrip: boolean;
  fuelPrice: number;
  fuelType: FuelType;
  vehicleClass: VehicleClass;
  onClose: () => void;
  onShare: () => void;
  originName: string;
  destinationName: string;
}

const formatPHP = (val: number) => {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val);
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, 
  tolls, 
  distanceKm, 
  isRoundTrip, 
  fuelPrice,
  fuelType,
  vehicleClass,
  onClose,
  onShare,
  originName,
  destinationName
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (result) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [result]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative !bg-slate-950 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-x-hidden">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 !bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-5 flex justify-between items-center">
          <h2 className="font-black text-white text-lg uppercase tracking-tighter italic">Calculation Result</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Visual Route Indicator */}
          <div className="flex flex-col gap-3 p-5 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Origin</div>
            </div>
            <div className="pl-5.5 -mt-2">
              <div className="text-sm font-black text-white truncate px-3">{originName}</div>
            </div>
            
            <div className="flex items-center gap-3 py-1">
              <div className="h-5 w-[2.5px] bg-slate-800 ml-1.5 rounded-full"></div>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m12 19 7-7-7-7"/><path d="M5 12h14"/></svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Destination</div>
            </div>
            <div className="pl-5.5 -mt-2">
              <div className="text-sm font-black text-white truncate px-3">{destinationName}</div>
            </div>
          </div>

          {/* Main Total */}
          <div className="text-center py-8 bg-blue-600/10 rounded-3xl border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Est. Grand Total Cost</h3>
            <div className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
              {formatPHP(result.grandTotal)}
            </div>
            <p className="text-[11px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
              {isRoundTrip ? "Includes Return Trip Estimate" : "One-Way Trip Estimate"}
            </p>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Distance</div>
              <div className="text-2xl font-black text-white">{isRoundTrip ? distanceKm * 2 : distanceKm} <span className="text-[11px] font-bold text-slate-500">KM</span></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{fuelType} USAGE</div>
              <div className="text-2xl font-black text-white">{result.litersNeeded.toFixed(1)} <span className="text-[11px] font-bold text-slate-500">L</span></div>
              <div className="text-[9px] text-blue-500 font-black mt-2 tracking-tight">@ {formatPHP(fuelPrice)}/L</div>
            </div>
          </div>

          {/* Itemized Cost */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 bg-blue-600 rounded-full"></div>
              <h4 className="font-black text-white text-[12px] uppercase tracking-[0.2em]">Detailed Breakdown</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{fuelType} Total Cost</span>
                <span className="font-black text-white font-mono">{formatPHP(result.fuelCost)}</span>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center px-4">
                  <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Toll Pass Fees</span>
                  <span className="font-black text-white font-mono">{formatPHP(result.totalTollCost)}</span>
                </div>
                
                {tolls.length > 0 ? (
                  <div className="space-y-4">
                    {tolls.map(t => {
                      const baseRate = t.rates[vehicleClass] || 0;
                      const finalAmount = isRoundTrip ? baseRate * 2 : baseRate;
                      
                      return (
                        <div key={t.id} className="bg-slate-950 rounded-3xl p-5 border border-slate-800 hover:border-blue-500/30 transition-all group shadow-2xl">
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <div className="font-black text-white text-sm tracking-tight mb-1 group-hover:text-blue-400 transition-colors">{t.name}</div>
                              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t.expressway} PATH</div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-500 font-black font-mono text-base">{formatPHP(finalAmount)}</div>
                              {isRoundTrip && (
                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                  {formatPHP(baseRate)} x 2
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/5">
                            {(["Class 1", "Class 2", "Class 3"] as VehicleClass[]).map((vClass) => {
                              const rate = t.rates[vClass] || 0;
                              const isSelected = vClass === vehicleClass;
                              return (
                                <div key={vClass} className={`text-center py-2.5 rounded-2xl border transition-all ${
                                  isSelected 
                                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-105" 
                                    : "bg-slate-900 border-slate-800 text-slate-600 opacity-60"
                                }`}>
                                  <div className={`text-[8px] font-black uppercase tracking-tighter mb-1 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                                    {vClass.replace('Class ', 'C')}
                                  </div>
                                  <div className={`text-[10px] font-black font-mono ${isSelected ? "text-white" : "text-slate-400"}`}>
                                    ₱{rate}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] bg-slate-900 px-6 py-10 rounded-3xl text-center border border-dashed border-slate-800">
                    No Toll Gates Detected
                  </div>
                )}
              </div>

              {result.contingencyAmount > 0 && (
                <div className="flex justify-between items-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
                   <div className="flex flex-col">
                      <span className="font-black text-[10px] uppercase tracking-widest">Contingency Buffer</span>
                      <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-0.5">{((result.contingencyAmount / result.subTotal) * 100).toFixed(0)}% Reservation</span>
                   </div>
                  <span className="font-black font-mono text-sm">{formatPHP(result.contingencyAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Advisory */}
          <div className="flex gap-4 p-5 bg-slate-900 border border-white/5 text-slate-500 text-[9px] leading-relaxed rounded-3xl font-bold uppercase tracking-widest">
            <AlertCircle size={18} className="text-blue-500 shrink-0" />
            <p>
              Generated Estimate. Actual costs may vary based on traffic, load, and TRB adjustments.
            </p>
          </div>

          {/* Share Button Inside Modal */}
          <button 
            onClick={onShare}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-5 rounded-3xl shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs italic"
          >
            <Share2 size={18} />
            Download Summary
          </button>
        </div>
      </div>
    </div>
  );
};



