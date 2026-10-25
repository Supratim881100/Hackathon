import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Search,
  ChevronDown,
  Building2,
  Phone,
  ShieldCheck,
  MapPin,
  Clock,
  Bed,
  Navigation,
  ExternalLink,
  Loader2,
  Filter,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { HospitalUser, NearbyCareFacility, MedicalCareCategory } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface NearbyCareViewProps {
  hospitals: HospitalUser[];
  onCall108: () => void;
}

export const NearbyCareView: React.FC<NearbyCareViewProps> = ({
  hospitals,
  onCall108
}) => {
  // Verified facilities state
  const [verifiedSearch, setVerifiedSearch] = useState('');

  // OSM Search State
  const [osmQuery, setOsmQuery] = useState('Noida');
  const [osmRadius, setOsmRadius] = useState('25 km');
  const [selectedCategory, setSelectedCategory] = useState<MedicalCareCategory>('All');
  const [hasOsmSearched, setHasOsmSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search Results State
  const [facilities, setFacilities] = useState<NearbyCareFacility[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [locationDisplayName, setLocationDisplayName] = useState('Noida, Uttar Pradesh');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    All: 0,
    Hospitals: 0,
    Clinics: 0,
    'Diagnostic Labs': 0,
    'Blood Banks': 0,
    Pharmacies: 0
  });

  // Display pagination & in-list filter
  const [displayLimit, setDisplayLimit] = useState(20);
  const [inResultSearch, setInResultSearch] = useState('');

  const categories: MedicalCareCategory[] = [
    'All',
    'Hospitals',
    'Clinics',
    'Diagnostic Labs',
    'Blood Banks',
    'Pharmacies'
  ];

  const quickLocations = [
    { label: 'Noida', query: 'Noida' },
    { label: 'Sector 62', query: 'Sector 62 Noida' },
    { label: 'Sector 18', query: 'Sector 18 Noida' },
    { label: 'Greater Noida', query: 'Greater Noida' },
    { label: 'Delhi NCR', query: 'Delhi' }
  ];

  // Core search function
  const searchNearbyCare = useCallback(
    async (queryText: string, radiusText: string, category: string, coords?: { lat: number; lon: number }) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getNearbyCare({
          query: queryText,
          radius: radiusText,
          category: category === 'All' ? undefined : category,
          lat: coords?.lat,
          lon: coords?.lon
        });

        if (res.success) {
          setFacilities(res.facilities);
          setTotalFound(res.totalFound);
          if (res.location?.displayName) {
            setLocationDisplayName(res.location.displayName);
          }
          if (res.categoryCounts) {
            setCategoryCounts(res.categoryCounts);
          }
          setHasOsmSearched(true);
          setDisplayLimit(20);
        } else {
          setError('Could not load medical facilities for this location.');
        }
      } catch (err: any) {
        console.error('Error fetching nearby facilities:', err);
        setError('Network or data service is temporarily busy. Showing closest available facilities.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load: automatically search Noida with 25 km radius
  useEffect(() => {
    searchNearbyCare('Noida', '25 km', 'All');
  }, [searchNearbyCare]);

  // Handle Search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    searchNearbyCare(osmQuery || 'Noida', osmRadius, selectedCategory);
  };

  // Handle radius change: immediately trigger search with the new radius
  const handleRadiusChange = (newRadius: string) => {
    setOsmRadius(newRadius);
    searchNearbyCare(osmQuery || 'Noida', newRadius, selectedCategory);
  };

  // Handle category change: re-fetch or filter
  const handleCategoryChange = (cat: MedicalCareCategory) => {
    setSelectedCategory(cat);
    searchNearbyCare(osmQuery || 'Noida', osmRadius, cat);
  };

  // Handle GPS "Use my location"
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setOsmQuery('Current Location');
        searchNearbyCare('Current Location', osmRadius, selectedCategory, {
          lat: latitude,
          lon: longitude
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to Noida
        setOsmQuery('Noida');
        searchNearbyCare('Noida', osmRadius, selectedCategory);
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Filter verified hospitals
  const filteredVerified = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(verifiedSearch.toLowerCase()) ||
      h.services.some((s) => s.toLowerCase().includes(verifiedSearch.toLowerCase())) ||
      h.city.toLowerCase().includes(verifiedSearch.toLowerCase())
  );

  // Filter OSM facilities based on inResultSearch
  const displayFacilities = facilities.filter((f) => {
    if (!inResultSearch.trim()) return true;
    const term = inResultSearch.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      f.address.toLowerCase().includes(term) ||
      (f.rawType && f.rawType.toLowerCase().includes(term))
    );
  });

  const paginatedFacilities = displayFacilities.slice(0, displayLimit);
  const hasMore = displayLimit < displayFacilities.length;

  // Category badge color helper
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Hospitals':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Clinics':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Diagnostic Labs':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Blood Banks':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Pharmacies':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
          BANDAZE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
          Nearby Care
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Hospitals, clinics, labs, pharmacies and blood banks near you from OpenStreetMap
        </p>
      </div>

      {/* Section 1: BANDAZE-verified hospitals & clinics */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">
              BANDAZE-verified hospitals & clinics
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified clinical partners with credentialed doctors & emergency protocols
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              value={verifiedSearch}
              onChange={(e) => setVerifiedSearch(e.target.value)}
              placeholder="Search name or service..."
              className="w-full sm:w-64 px-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {filteredVerified.length === 0 ? (
          <p className="text-xs text-gray-500 py-3">
            No verified facilities match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredVerified.map((hosp) => (
              <div
                key={hosp.id}
                className="p-4 rounded-2xl border border-gray-200 bg-teal-50/20 hover:border-teal-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{hosp.name}</h4>
                    <p className="text-xs text-teal-800 font-medium">{hosp.facilityType}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>
                    {hosp.address}, {hosp.city}
                  </span>
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hosp.services.slice(0, 3).map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-white border border-gray-200 text-gray-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={`tel:${hosp.emergencyHotline}`}
                    className="text-xs font-semibold text-teal-700 flex items-center gap-1.5 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{hosp.emergencyHotline}</span>
                  </a>
                  {hosp.icuBedsAvailable !== undefined && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-gray-400" />
                      {hosp.icuBedsAvailable} ICU beds
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: OSM Search & Live Medical Facilities */}
      <div className="space-y-4">
        {/* Search Bar Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-3xl p-3 border border-gray-200 shadow-2xs space-y-2.5"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Use My Location Button */}
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={isLocating || isLoading}
              className="bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.98] disabled:opacity-75 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap cursor-pointer transition-all"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Use my location</span>
                </>
              )}
            </button>

            {/* Location Query Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={osmQuery}
                onChange={(e) => setOsmQuery(e.target.value)}
                placeholder="Or type an area, city, landmark or PIN code..."
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50/70 border border-transparent focus:border-teal-500 focus:bg-white rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
              />
              {osmQuery && (
                <button
                  type="button"
                  onClick={() => setOsmQuery('')}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-700 p-1"
                title="Search location"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Radius Selector */}
            <div className="relative">
              <select
                value={osmRadius}
                onChange={(e) => handleRadiusChange(e.target.value)}
                className="w-full sm:w-28 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700 font-semibold appearance-none focus:outline-none focus:border-teal-600 pr-8 cursor-pointer"
              >
                <option value="3 km">3 km</option>
                <option value="5 km">5 km</option>
                <option value="10 km">10 km</option>
                <option value="25 km">25 km</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Location Pills */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-gray-400 font-medium whitespace-nowrap pl-1">
              Popular areas:
            </span>
            {quickLocations.map((loc) => (
              <button
                key={loc.label}
                type="button"
                onClick={() => {
                  setOsmQuery(loc.query);
                  searchNearbyCare(loc.query, osmRadius, selectedCategory);
                }}
                className={`px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                  osmQuery.toLowerCase() === loc.query.toLowerCase()
                    ? 'bg-teal-100 text-teal-900 border border-teal-300'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200 border border-transparent'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </form>

        {/* Category Filter Pills with Live Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e6b75] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{cat}</span>
                {totalFound > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Results Summary & In-list filter */}
        {hasOsmSearched && !isLoading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 px-4 py-3 rounded-2xl border border-gray-150">
            <div>
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  Found <strong className="text-teal-800">{displayFacilities.length}</strong> facilities
                  within {osmRadius} of <span className="text-gray-700 font-medium truncate max-w-xs">{locationDisplayName}</span>
                </span>
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Sorted by proximity. Proximity calculated via geodesic coordinates.
              </p>
            </div>

            {/* Quick in-result filter */}
            {facilities.length > 5 && (
              <div className="relative">
                <input
                  type="text"
                  value={inResultSearch}
                  onChange={(e) => setInResultSearch(e.target.value)}
                  placeholder="Filter by name, road or sector..."
                  className="w-full sm:w-56 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 placeholder-gray-400"
                />
                {inResultSearch && (
                  <button
                    onClick={() => setInResultSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error notice if any */}
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => searchNearbyCare(osmQuery || 'Noida', osmRadius, selectedCategory)}
              className="text-teal-700 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-150 shadow-2xs space-y-3">
            <Loader2 className="w-8 h-8 text-teal-700 animate-spin mx-auto" />
            <h4 className="font-bold text-gray-800 text-sm">
              Retrieving healthcare facilities from OpenStreetMap...
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Scanning hospitals, clinics, pharmacies, diagnostic labs and blood banks within {osmRadius} of {osmQuery || 'selected location'}.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && hasOsmSearched && displayFacilities.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-3xl p-12 text-center bg-white space-y-3">
            <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
            <h4 className="font-bold text-gray-800 text-sm">
              No matching medical facilities found within {osmRadius}
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Try selecting a wider search radius (such as 25 km), switching to &quot;All&quot; categories, or searching for a broader city or locality.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {osmRadius !== '25 km' && (
                <button
                  onClick={() => handleRadiusChange('25 km')}
                  className="bg-[#1e6b75] hover:bg-[#165860] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Expand to 25 km
                </button>
              )}
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => handleCategoryChange('All')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Show All Categories
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && hasOsmSearched && paginatedFacilities.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedFacilities.map((facility) => {
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`;
                return (
                  <div
                    key={facility.id}
                    className="bg-white rounded-2xl p-5 border border-gray-150 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top row: Name & Distance */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">
                            {facility.name}
                          </h4>
                          {facility.rawType && facility.rawType !== facility.category && (
                            <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                              {facility.rawType}
                            </p>
                          )}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-100 flex-shrink-0">
                          {facility.distance}
                        </span>
                      </div>

                      {/* Address */}
                      <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{facility.address}</span>
                      </p>

                      {/* Hours & Category Badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {facility.openHours}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold border ${getCategoryBadgeClass(
                            facility.category
                          )}`}
                        >
                          {facility.category}
                        </span>
                        {facility.source && (
                          <span className="text-[10px] text-gray-400">
                            via {facility.source}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        {facility.phone && (
                          <a
                            href={`tel:${facility.phone}`}
                            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 hover:underline"
                            title="Call facility"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{facility.phone}</span>
                          </a>
                        )}

                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-gray-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
                          title="Get navigation directions in Google Maps"
                        >
                          <Navigation className="w-3 h-3 text-teal-600" />
                          <span>Directions</span>
                        </a>
                      </div>

                      {facility.emergencyReady && (
                        <button
                          type="button"
                          onClick={onCall108}
                          className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-red-200"
                        >
                          Emergency 108
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Progressive Loading */}
            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setDisplayLimit((prev) => prev + 20)}
                  className="bg-white hover:bg-gray-50 active:scale-[0.99] text-[#1b646e] border border-gray-200 font-bold px-6 py-2.5 rounded-2xl text-xs shadow-2xs hover:border-teal-400 transition-all cursor-pointer"
                >
                  Load More Facilities (Showing {paginatedFacilities.length} of {displayFacilities.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
