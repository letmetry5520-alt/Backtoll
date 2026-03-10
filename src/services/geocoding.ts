"use client";

import { useState, useEffect } from "react";

export interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const searchAddress = async (query: string): Promise<GeocodeResult[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    // console.log("FETCHING geocode for:", query);
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    // console.log("GEOCODE status:", res.status);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    // console.log("GEOCODE results:", data.length);
    return data;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
};

export const reverseSearch = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
    if (!response.ok) return "";
    const data = await response.json();
    return data.display_name || "";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "";
  }
};
