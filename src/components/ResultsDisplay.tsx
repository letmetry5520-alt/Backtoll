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
      <div className="relative !bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-x-hidden">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 !bg-white border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Calculation Result</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Visual Route Indicator */}
          <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Origin</div>
            </div>
            <div className="pl-5 -mt-2">
              <div className="text-sm font-extrabold text-slate-800 truncate">{originName}</div>
            </div>
            
            <div className="flex items-center gap-3 py-1">
              <div className="h-4 w-[2px] bg-slate-200 ml-1 rounded-full"></div>
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m12 19 7-7-7-7"/><path d="M5 12h14"/></svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Destination</div>
            </div>
            <div className="pl-5 -mt-2">
              <div className="text-sm font-extrabold text-slate-800 truncate">{destinationName}</div>
            </div>
          </div>

          {/* Main Total */}
          <div className="text-center py-4 bg-blue-50 rounded-2xl border border-blue-100">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Grand Total Cost</h3>
            <div className="text-5xl font-black text-slate-900 tracking-tighter">
              {formatPHP(result.grandTotal)}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isRoundTrip ? "Includes return trip estimate" : "One-way trip estimate"}
            </p>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Route Distance</div>
              <div className="text-xl font-extrabold text-slate-800">{isRoundTrip ? distanceKm * 2 : distanceKm} <span className="text-sm font-normal">km</span></div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{fuelType} Consumption</div>
              <div className="text-xl font-extrabold text-slate-800">{result.litersNeeded.toFixed(1)} <span className="text-sm font-normal">L</span></div>
              <div className="text-[10px] text-slate-400 font-bold mt-1">@ {formatPHP(fuelPrice)}/L</div>
            </div>
          </div>

          {/* Itemized Cost */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Itemized Breakdown</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                <span className="text-slate-600 font-semibold">{fuelType} Cost</span>
                <span className="font-bold text-slate-900">{formatPHP(result.fuelCost)}</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-3">
                  <span className="text-slate-600 font-semibold">Toll Gate Fees</span>
                  <span className="font-bold text-slate-900">{formatPHP(result.totalTollCost)}</span>
                </div>
                
                {tolls.length > 0 ? (
                  <div className="space-y-3 px-1">
                    {tolls.map(t => {
                      const baseRate = t.rates[vehicleClass] || 0;
                      const finalAmount = isRoundTrip ? baseRate * 2 : baseRate;
                      
                      return (
                        <div key={t.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-blue-200 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.expressway}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-600 font-black font-mono text-sm">{formatPHP(finalAmount)}</div>
                              {isRoundTrip && (
                                <div className="text-[9px] text-blue-400 font-bold uppercase tracking-tight">
                                  {formatPHP(baseRate)} x 2
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/50">
                            {(["Class 1", "Class 2", "Class 3"] as VehicleClass[]).map((vClass) => {
                              const rate = t.rates[vClass] || 0;
                              const isSelected = vClass === vehicleClass;
                              return (
                                <div key={vClass} className={`text-center py-2 rounded-xl border transition-all ${
                                  isSelected 
                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105" 
                                    : "bg-white border-slate-100 text-slate-400 grayscale opacity-60"
                                }`}>
                                  <div className={`text-[7px] font-black uppercase tracking-tighter mb-0.5 ${isSelected ? "text-blue-100" : "text-slate-300"}`}>
                                    {vClass}
                                  </div>
                                  <div className={`text-[10px] font-black font-mono ${isSelected ? "text-white" : "text-slate-600"}`}>
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
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-6 rounded-2xl text-center border border-dashed border-slate-200">
                    No toll gates matched for this route.
                  </div>
                )}
              </div>

              {result.contingencyAmount > 0 && (
                <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-700">
                  <span className="font-semibold text-sm">Contingency Buffer ({((result.contingencyAmount / result.subTotal) * 100).toFixed(0)}%)</span>
                  <span className="font-bold">{formatPHP(result.contingencyAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Advisory */}
          <div className="flex gap-3 p-4 bg-slate-900 text-slate-400 text-[10px] leading-relaxed rounded-2xl">
            <AlertCircle size={16} className="text-blue-500 shrink-0" />
            <p>
              This is a generated estimate. Actual expenses may vary based on traffic conditions, driving style, and toll rate adjustments by the TRB.
            </p>
          </div>

          {/* Share Button Inside Modal */}
          <button 
            onClick={onShare}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Share2 size={20} />
            SHARE THIS ESTIMATE
          </button>
        </div>
      </div>
    </div>
  );
};



