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
          className="w-full rounded-none bg-transparent border-0 py-4 pl-12 pr-12 focus:ring-0 text-slate-800 font-semibold placeholder:text-slate-300 focus:outline-none"
        />
        
        <div className="absolute right-3 z-10 flex items-center gap-1">
          {isLoading && <Loader2 size={16} className="animate-spin text-blue-500 mr-1" />}
          <button 
            type="button"
            onClick={() => setShowMapModal(true)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            title="Pin on map"
          >
            <MapIcon size={18} />
          </button>
        </div>
      </div>

      {statusMsg && !isOpen && (
        <div className="absolute left-12 right-12 top-11 z-[200] text-[10px] text-blue-500 font-bold bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded pointer-events-none animate-pulse">
           {statusMsg}
        </div>
      )}

      {(isOpen || isLoading) && (
        <div className="absolute left-0 right-0 z-[1000] mt-1 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {isLoading && (
               <div className="px-4 py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={24} className="animate-spin text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Searching map...</span>
               </div>
            )}
            
            {!isLoading && results.length === 0 && (
               <div className="px-4 py-6 text-center text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-widest">No addresses found</p>
                  <p className="text-[10px] mt-1">Try dropping a pin on the map instead.</p>
               </div>
            )}

            {!isLoading && results.map((res, i) => (
              <div
                key={i}
                onClick={() => handleSelect(res)}
                className="px-4 py-3 flex gap-3 text-sm border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors items-center"
              >
                <div className="bg-slate-100 p-2 rounded-full text-slate-500 shrink-0">
                  <Compass size={16} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-slate-800 truncate">{res.display_name.split(",")[0]}</span>
                  <span className="text-[10px] text-slate-400 truncate tracking-tight">{res.display_name.split(",").slice(1).join(",").trim()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-2 border-t border-slate-50 bg-slate-50/50 text-center">
             <button 
                type="button" 
                onClick={() => { setIsOpen(false); setShowMapModal(true); }}
                className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
             >
                Can&apos;t find it? Pin on map
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

