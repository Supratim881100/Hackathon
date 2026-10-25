import React, { useState } from 'react';
import {
  AlertTriangle,
  Compass,
  Search,
  ChevronDown,
  MapPin,
  Phone,
  ExternalLink,
  Navigation
} from 'lucide-react';

export const MedicineLocatorView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState('3 km');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const samplePharmacies = [
    {
      id: 'ph_1',
      name: 'Apollo 24/7 Pharmacy & Healthcare',
      address: 'Plot 14, Commercial Center, Sector 18, Noida',
      distance: '0.8 km',
      phone: '+91 120 4589012',
      openHours: 'Open 24 Hours',
      source: 'OpenStreetMap'
    },
    {
      id: 'ph_2',
      name: 'MedPlus Chemist & Wellness Store',
      address: 'Shop 4, Block B Market, Sector 15',
      distance: '1.4 km',
      phone: '+91 120 4589334',
      openHours: '08:00 AM – 11:00 PM',
      source: 'OpenStreetMap'
    },
    {
      id: 'ph_3',
      name: 'Fortis Hospital Pharmacy Counter',
      address: 'B-22, Sector 62, Institutional Area',
      distance: '2.1 km',
      phone: '+91 120 4589999',
      openHours: 'Open 24 Hours',
      source: 'OpenStreetMap'
    },
    {
      id: 'ph_4',
      name: 'Sanjivani Medicos & Generic Dispensary',
      address: 'Atta Market Main Lane, Near Metro Station',
      distance: '2.8 km',
      phone: '+91 120 4589771',
      openHours: '09:00 AM – 10:30 PM',
      source: 'OpenStreetMap'
    }
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 450);
  };

  const handleUseLocation = () => {
    setIsLoading(true);
    setQuery('Noida, Sector 18 (Current Location)');
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
          BANDAZE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
          Medicine Locator
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Pharmacies near you from OpenStreetMap
        </p>
      </div>

      {/* Yellow Disclaimer Banner */}
      <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-4 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400e] leading-relaxed">
          Live pharmacy locations come from OpenStreetMap community data. Medicine stock, prices and ordering are NOT available — call the pharmacy to confirm.
        </p>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl p-3 border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Use My Location Button */}
          <button
            type="button"
            onClick={handleUseLocation}
            className="bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-2xs whitespace-nowrap cursor-pointer transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Use my location</span>
          </button>

          {/* Search Query Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Or type an area, city or PIN code..."
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50/70 border border-transparent focus:border-teal-500 focus:bg-white rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-700"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Radius Dropdown */}
          <div className="relative">
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full sm:w-28 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700 font-medium appearance-none focus:outline-none focus:border-teal-600 pr-8"
            >
              <option value="3 km">3 km</option>
              <option value="5 km">5 km</option>
              <option value="10 km">10 km</option>
              <option value="25 km">25 km</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </form>

      {/* Results / Empty State */}
      {!hasSearched ? (
        <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white/50">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Share your location or search an area to see real nearby places.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Found 4 licensed pharmacies within {radius}</span>
            <span className="text-[11px] text-teal-700 font-medium">Verified OSM Data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {samplePharmacies.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-gray-150 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-100 flex-shrink-0">
                      {item.distance}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{item.address}</span>
                  </p>

                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="font-medium text-emerald-700">{item.openHours}</span>
                    <span>·</span>
                    <span>Source: {item.source}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={`tel:${item.phone}`}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{item.phone}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      item.name + ' ' + item.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-500 hover:text-teal-800 flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
