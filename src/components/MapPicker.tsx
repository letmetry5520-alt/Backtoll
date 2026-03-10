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
      
      <div className="relative !bg-white w-full max-w-2xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[85vh]">
        {/* Header with Search */}
        <div className="p-4 border-b border-slate-100 !bg-white z-[10002] rounded-t-none sm:rounded-t-3xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <PinIcon size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm italic">PH MAP PICKER</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
             </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative" onClick={(e) => e.stopPropagation()}>
             <div className="relative">
                <input 
                  type="text"
                  placeholder="Search for a place in PH..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length >= 3) setShowResults(true);
                  }}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true) }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                />
                <LSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                {loading && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
             </div>

             {/* Search Results Dropdown inside Modal - Using Portal-like positioning or very high Z */}
             {showResults && (searchResults.length > 0 || loading) && (
               <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-blue-500 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] rounded-2xl z-[100000] max-h-80 overflow-y-auto overflow-x-hidden animate-in slide-in-from-top-2 duration-300 ring-8 ring-blue-500/10">
                  {loading && (
                    <div className="p-4 text-center text-slate-500 text-xs font-bold animate-pulse flex items-center justify-center gap-2 bg-slate-50">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      FETCHING PHILIPPINE PLACES...
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
                      className="w-full text-left p-4 hover:bg-blue-50 border-b border-slate-100 last:border-0 flex items-start gap-4 transition-all group"
                    >
                       <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Compass size={16} />
                       </div>
                       <div className="flex flex-col overflow-hidden">
                          <span className="text-sm text-slate-900 font-extrabold truncate group-hover:text-blue-700 transition-colors">{res.display_name.split(',')[0]}</span>
                          <span className="text-[11px] text-slate-400 font-medium truncate py-0.5">{res.display_name.split(',').slice(1).join(',').trim()}</span>
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

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full px-4 max-w-sm">
               <div className="bg-white shadow-xl border border-slate-200 p-3 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Instruction</p>
                  <p className="text-sm font-medium text-slate-700">Tap anywhere on the Philippines map to drop a pin.</p>
               </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 space-y-4">
            <div className="min-h-[3rem] p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
              <div className="mt-1">
                <div className={`w-2 h-2 rounded-full ${position ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}></div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Selected Location</p>
                <p className="text-sm text-slate-800 font-medium">
                  {loading ? "Geocoding location..." : address || (position ? `Pinned: ${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : "No location selected yet.")}
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check size={20} />
              CONFIRM THIS LOCATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerContent;
