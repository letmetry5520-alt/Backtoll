"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { X, MapPin as PinIcon, Check, Search as LSearch, Loader2, MapPin, Compass } from "lucide-react";
import { reverseSearch, searchAddress, useDebounce } from "../services/geocoding";
import { useEffect } from "react";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  onTop: boolean; // Just a dummy prop to help with layering if needed
  onSelect: (address: string) => void;
  onClose: () => void;
  initialValue?: string;
}

const LocationMarker = ({ setPosition }: { setPosition: (pos: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const MapPickerContent: React.FC<MapPickerProps> = ({ onSelect, onClose }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Link to the map instance
  const [map, setMap] = useState<L.Map | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const triggerSearch = async () => {
      if (debouncedSearch && debouncedSearch.length >= 3) {
        setLoading(true);
        // console.log("MAP SEARCH TRIGGERED:", debouncedSearch);
        try {
          const results = await searchAddress(debouncedSearch);
          // console.log("MAP SEARCH RESULTS:", results.length);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error("Map search failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };
    triggerSearch();
  }, [debouncedSearch]);

  const handleConfirm = () => {
    if (address) {
      onSelect(address);
      onClose();
    }
  };

  const handleMapClick = async (pos: [number, number]) => {
    setPosition(pos);
    setLoading(true);
    const addr = await reverseSearch(pos[0], pos[1]);
    setAddress(addr);
    setLoading(false);
    setShowResults(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  const selectSearchResult = (res: any) => {
    const pos: [number, number] = [parseFloat(res.lat), parseFloat(res.lon)];
    setPosition(pos);
    setAddress(res.display_name);
    setShowResults(false);
    if (map) {
      map.setView(pos, 16);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative !bg-slate-950 w-full max-w-2xl rounded-none sm:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col h-full sm:h-[85vh] border border-white/5 animate-in fade-in zoom-in-95 duration-500">
        {/* Header with Search */}
        <div className="p-5 border-b border-white/5 !bg-slate-950/90 backdrop-blur-md z-[10002] rounded-t-none sm:rounded-t-3xl">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2.5">
                <div className="bg-blue-500/10 p-2 rounded-xl">
                  <PinIcon size={18} className="text-blue-500" />
                </div>
                <h3 className="font-black text-white text-[11px] uppercase tracking-[0.2em]">PH GEO-LOCATOR</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
                <X size={22} />
             </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative" onClick={(e) => e.stopPropagation()}>
             <div className="relative">
                <input 
                  type="text"
                  placeholder="EX: CEBU CITY, MANILA, RAMCAR..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 3) setShowResults(true);
                  }}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 uppercase tracking-widest"
                />
                <LSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                {loading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
             </div>

             {/* Search Results Dropdown inside Modal - Using Portal-like positioning or very high Z */}
             {showResults && (searchResults.length > 0 || loading) && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-slate-950 border border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] rounded-3xl z-[100000] max-h-80 overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-4 duration-500">
                  {loading && (
                    <div className="p-6 text-center text-slate-500 text-[9px] font-black animate-pulse flex items-center justify-center gap-3 bg-slate-900/50 tracking-[0.3em]">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      SYSTEM SEARCHING PH...
                    </div>
                  )}
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                         e.stopPropagation();
                         selectSearchResult(res);
                      }}
                      className="w-full text-left p-5 hover:bg-slate-900 border-b border-white/5 last:border-0 flex items-start gap-4 transition-all group"
                    >
                       <div className="bg-slate-800 p-2.5 rounded-xl text-slate-500 shrink-0 mt-0.5 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Compass size={16} />
                       </div>
                       <div className="flex flex-col overflow-hidden">
                          <span className="text-[11px] text-white font-black truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{res.display_name.split(',')[0]}</span>
                          <span className="text-[9px] text-slate-500 font-bold truncate py-1 uppercase tracking-widest">{res.display_name.split(',').slice(1).join(',').trim()}</span>
                       </div>
                    </button>
                  ))}
                  {showResults && !loading && searchResults.length === 0 && searchQuery.length >= 3 && (
                     <div className="p-6 text-center text-slate-400 text-xs font-medium">
                        No results found in PH. Try a different landmark.
                     </div>
                  )}
               </div>
             )}
          </form>
        </div>

        <div className="flex-1 relative overflow-hidden sm:rounded-b-3xl flex flex-col">
          <div className="flex-1 relative">
            <MapContainer 
              center={[12.8797, 121.7740]} // Philippines center 
              zoom={6} 
              className="h-full w-full"
              ref={setMap}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker setPosition={handleMapClick} />
              {position && <Marker position={position} icon={icon} />}
            </MapContainer>


          </div>

          <div className="p-3 bg-slate-950 border-t border-white/5 space-y-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className="shrink-0">
                <div className={`w-3 h-3 rounded-full ${position ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-800"}`}></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Target Coordinates</p>
                <p className="text-[10px] text-white font-black truncate tracking-tight uppercase">
                  {loading ? "DECODING..." : address || (position ? `LAT: ${position[0].toFixed(4)} LON: ${position[1].toFixed(4)}` : "TAP MAP TO PIN")}
                </p>
              </div>
            </div>

            <button 
              disabled={!position || loading}
              onClick={() => {
                if (address) onSelect(address);
                else if (position) onSelect(`Marker: ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`);
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-30 uppercase tracking-[0.15em] text-xs italic"
            >
              <Check size={18} className="stroke-[3]" />
              FINALIZE SELECTION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerContent;
