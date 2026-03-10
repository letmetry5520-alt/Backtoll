"use client";

import React, { useState, useEffect, useRef } from "react";
import { searchAddress, GeocodeResult, useDebounce } from "../services/geocoding";
import { MapPin, Loader2, Map as MapIcon, Compass } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import MapPicker to avoid Window is not defined errors (Leaflet needs window)
const MapPicker = dynamic(() => import("./MapPicker"), { 
  ssr: false,
  loading: () => null
});

interface AddressAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  icon?: React.ReactNode;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  icon
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const debouncedQuery = useDebounce(internalValue, 150);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 3) {
      let active = true;
      setIsLoading(true);
      setStatusMsg("Searching...");

      searchAddress(debouncedQuery)
        .then(res => {
          if (!active) return;
          setResults(res);
          setIsLoading(false);
          setIsOpen(res.length > 0);
          setStatusMsg(res.length > 0 ? "" : "No places found. Check spelling or use Pin on Map.");
        })
        .catch(err => {
          if (!active) return;
          console.error("Autocomplete search error:", err);
          setIsLoading(false);
          setStatusMsg("Map service busy. Please wait a second and type again.");
        });

      return () => { active = false; };
    } else {
       setResults([]);
       setIsOpen(false);
       setStatusMsg("");
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodeResult) => {
    const shortName = result.display_name.split(",").slice(0, 3).join(",");
    setInternalValue(shortName);
    onChange(shortName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className={`relative w-full ${isOpen || isLoading ? "z-[60]" : "z-10"}`} ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10 flex items-center justify-center pointer-events-none">
          {icon || <MapPin size={18} className="text-slate-400" />}
        </div>
        
        <input
          required={required}
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-none bg-transparent border-0 py-4 pl-12 pr-12 focus:ring-0 text-white font-black placeholder:text-slate-600 focus:outline-none uppercase tracking-widest text-[11px]"
        />
        
        <div className="absolute right-3 z-10 flex items-center gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin text-blue-500 mr-1" />}
          <button 
            type="button"
            onClick={() => setShowMapModal(true)}
            className="p-2 hover:bg-slate-800 rounded-xl text-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] border border-blue-500/10"
            title="Pin on map"
          >
            <MapIcon size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {statusMsg && !isOpen && (
        <div className="absolute left-12 right-12 top-[44px] z-[200] text-[8px] text-blue-400 font-black bg-slate-900 border border-blue-500/20 px-3 py-1.5 rounded-full pointer-events-none animate-pulse uppercase tracking-[0.2em] shadow-2xl">
           {statusMsg}
        </div>
      )}

      {(isOpen || isLoading) && (
        <div className="absolute left-0 right-0 z-[1000] mt-3 bg-slate-950 rounded-3xl border border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="max-h-72 overflow-y-auto">
            {isLoading && (
               <div className="px-6 py-10 flex flex-col items-center justify-center gap-4 text-slate-600">
                  <Loader2 size={24} className="animate-spin text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Querying PH Database...</span>
               </div>
            )}
            
            {!isLoading && results.length === 0 && (
               <div className="px-6 py-10 text-center text-slate-500">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Results Found</p>
                  <p className="text-[9px] mt-2 font-bold uppercase tracking-widest opacity-60">Try Pining Manually on Map</p>
               </div>
            )}

            {!isLoading && results.map((res, i) => (
              <div
                key={i}
                onClick={() => handleSelect(res)}
                className="px-6 py-4 flex gap-4 text-sm border-b border-white/5 hover:bg-slate-900 cursor-pointer transition-all items-center group"
              >
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-slate-500 group-hover:text-blue-500 group-hover:bg-slate-800 transition-all shrink-0">
                  <Compass size={18} className="stroke-[2.5]" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-black text-white truncate text-[11px] uppercase tracking-tight group-hover:text-blue-400 transition-colors">{res.display_name.split(",")[0]}</span>
                  <span className="text-[8px] text-slate-600 truncate font-black uppercase tracking-widest mt-1">{res.display_name.split(",").slice(1).join(",").trim()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-white/5 bg-slate-900 text-center">
             <button 
                type="button" 
                onClick={() => { setIsOpen(false); setShowMapModal(true); }}
                className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-white transition-colors py-2"
             >
                Can&apos;t find it? Open PH Map Picker
             </button>
          </div>
        </div>
      )}

      {showMapModal && (
        <MapPicker 
          onTop={true}
          onSelect={(addr) => {
            setInternalValue(addr);
            setResults([]); // Clear results
            onChange(addr);
            setIsOpen(false);
          }}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
};

