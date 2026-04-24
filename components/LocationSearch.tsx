import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, Search } from 'lucide-react';

interface LocationSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  label: string;
  placeholder: string;
  onSelect: (address: string, coords: [number, number]) => void;
  initialValue?: string;
  error?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ label, placeholder, onSelect, initialValue, error }) => {
  const [query, setQuery] = useState(initialValue || '');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipSearch = useRef(false);

  useEffect(() => {
    if (initialValue && initialValue !== query) {
      skipSearch.current = true;
      setQuery(initialValue);
      setShowResults(false);
    }
  }, [initialValue]);

  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setIsSearching(true);
        try {
          // Add addressdetails=1 to get more structured data if needed, but for now simple split is better
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
          const data = await response.json();
          
          // Simplify names
          const simplifiedData = data.map((item: any) => {
            const parts = item.display_name.split(', ');
            // Usually the first 2-3 parts are enough for a "simple" address
            const simplifiedName = parts.length > 3 ? parts.slice(0, 3).join(', ') : item.display_name;
            return {
              ...item,
              display_name: simplifiedName
            };
          });
          
          setResults(simplifiedData);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-4 block">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-gray-50 border-2 ${error ? 'border-red-500' : 'border-transparent'} focus:border-primary focus:bg-white rounded-[1.5rem] py-6 pl-16 pr-8 text-gray-900 font-bold transition-all outline-none placeholder:text-gray-300 shadow-inner`}
        />
        {isSearching && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}
      </div>
      {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-3 ml-2">{error}</p>}
      
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left p-4 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-50 last:border-0"
                onClick={() => {
                  skipSearch.current = true;
                  setQuery(result.display_name);
                  onSelect(result.display_name, [parseFloat(result.lat), parseFloat(result.lon)]);
                  setShowResults(false);
                }}
              >
                <Search className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{result.display_name}</span>
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
