import React, { useState, useEffect } from 'react';
import { Phone, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api.ts';

export const EmergencyView: React.FC = () => {
  const [contactName, setContactName] = useState('manu tomar');
  const [contactNumber, setContactNumber] = useState('9460636567');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [addressLandmark, setAddressLandmark] = useState('noida');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      const details = await api.getEmergencyDetails();
      if (details) {
        if (details.contactName) setContactName(details.contactName);
        if (details.contactNumber) setContactNumber(details.contactNumber);
        if (details.bloodGroup) setBloodGroup(details.bloodGroup);
        if (details.addressLandmark) setAddressLandmark(details.addressLandmark);
        if (details.keyConditions) setConditions(details.keyConditions);
        if (details.allergies) setAllergies(details.allergies);
      }
    };
    loadDetails();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveEmergencyDetails({
      contactName,
      contactNumber,
      bloodGroup,
      addressLandmark,
      keyConditions: conditions,
      allergies
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCall = (num: string) => {
    window.location.href = `tel:${num}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
          BANDAZE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
          Emergency
        </h1>
      </div>

      {/* Red Alert Container */}
      <div className="bg-white border-2 border-[#dc2626] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#dc2626]">
            In an emergency, call 108 now.
          </h2>
          <p className="text-xs sm:text-sm text-[#991b1b] mt-1 leading-relaxed">
            BANDAZE does not dispatch or track ambulances. Calling opens your phone dialer — the call itself is handled by the emergency service, not this app.
          </p>
        </div>

        {/* 3 Red Emergency Call Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* 108 */}
          <button
            onClick={() => handleCall('108')}
            className="bg-[#d32f2f] hover:bg-[#b71c1c] active:scale-[0.98] text-white p-4 rounded-2xl flex items-center gap-3 text-left transition-all shadow-xs cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold block leading-none">108</span>
              <span className="text-[11px] text-white/90 font-medium block mt-1">
                Ambulance / Medical emergency
              </span>
            </div>
          </button>

          {/* 112 */}
          <button
            onClick={() => handleCall('112')}
            className="bg-[#d32f2f] hover:bg-[#b71c1c] active:scale-[0.98] text-white p-4 rounded-2xl flex items-center gap-3 text-left transition-all shadow-xs cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold block leading-none">112</span>
              <span className="text-[11px] text-white/90 font-medium block mt-1">
                National emergency number
              </span>
            </div>
          </button>

          {/* 102 */}
          <button
            onClick={() => handleCall('102')}
            className="bg-[#d32f2f] hover:bg-[#b71c1c] active:scale-[0.98] text-white p-4 rounded-2xl flex items-center gap-3 text-left transition-all shadow-xs cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold block leading-none">102</span>
              <span className="text-[11px] text-white/90 font-medium block mt-1">
                Maternal & child ambulance
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Yellow Disclaimer Note */}
      <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-4 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400e] leading-relaxed">
          The details below are saved to your BANDAZE profile so you can read them out to responders. They are NOT sent to any ambulance service.
        </p>
      </div>

      {/* My Emergency Details Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-5">
        <h3 className="font-extrabold text-gray-900 text-base">
          My emergency details
        </h3>

        {isSaved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Emergency profile details saved.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Row 1: Name and Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Emergency contact name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name of relative or contact"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Emergency contact number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Mobile number"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Row 2: Blood group and address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Blood group
              </label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="e.g. B+, O+, A-"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Home address / landmark
              </label>
              <input
                type="text"
                value={addressLandmark}
                onChange={(e) => setAddressLandmark(e.target.value)}
                placeholder="Nearest landmark, building or street"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Row 3: Conditions and Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Key conditions (optional)
              </label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="e.g. Asthma, Hypertension, Diabetes"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Allergies (optional)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.98] text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Save details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
