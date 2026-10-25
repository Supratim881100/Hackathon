import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Filter,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { DoctorUser, HospitalUser } from '../types/index.ts';

interface DirectoryViewProps {
  doctors: DoctorUser[];
  hospitals: HospitalUser[];
  onOpenBooking: (doctor: DoctorUser) => void;
  onOpenEmergency: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  doctors,
  hospitals,
  onOpenBooking,
  onOpenEmergency
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'doctors' | 'hospitals'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  const specialties = ['Cardiology', 'Orthopedic', 'Pediatrics', 'Neurology', 'Dermatology'];

  // Verified Doctors only
  const verifiedDoctors = doctors.filter(d => {
    if (d.verificationStatus !== 'verified') return false;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.affiliation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || d.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesAvail = !availableOnly || d.isAvailable;
    return matchesSearch && matchesSpecialty && matchesAvail;
  });

  // Verified Hospitals only
  const verifiedHospitals = hospitals.filter(h => {
    if (h.verificationStatus !== 'verified') return false;
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>EZIOX Verified Directory Guarantee</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Certified Doctors & Accredited Trauma Facilities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            All practitioners listed have passed independent primary-source credential verification by the EZIOX audit team.
          </p>
        </div>

        <button
          onClick={onOpenEmergency}
          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-colors shrink-0"
        >
          Need Immediate Emergency Care? SOS →
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by practitioner name, specialty, condition, or hospital..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 shrink-0">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
            />
            <span>Available for Booking Now</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Providers ({verifiedDoctors.length + verifiedHospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'doctors'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Doctors Only ({verifiedDoctors.length})
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hospitals & Clinics ({verifiedHospitals.length})
            </button>
          </div>

          {/* Specialty filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => setSelectedSpecialty('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedSpecialty === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Specialties
            </button>
            {specialties.map(sp => (
              <button
                key={sp}
                onClick={() => setSelectedSpecialty(sp)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedSpecialty === sp
                    ? 'bg-sky-600 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DOCTORS GRID */}
      {(activeTab === 'all' || activeTab === 'doctors') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Verified Physicians & Practitioners ({verifiedDoctors.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Primary Medical Licenses On File
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {verifiedDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                        ${doc.consultationFee} <span className="font-normal text-slate-500 text-[10px]">/ visit</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                    <p className="text-xs font-semibold text-sky-700">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {doc.affiliation}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {doc.bio}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between font-mono">
                    <span>{doc.experienceYears} Years Exp</span>
                    <span>Lic: {doc.registrationNumber}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">
                      {doc.availableDays.join(', ')} · {doc.availableHours}
                    </span>
                    <span
                      className={`font-semibold ${
                        doc.isAvailable ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {doc.isAvailable ? '● Available' : 'Availability not confirmed'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking(doc)}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOSPITALS GRID */}
      {(activeTab === 'all' || activeTab === 'hospitals') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Accredited Hospitals & Diagnostic Centers ({verifiedHospitals.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Operating Permits Audited
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {verifiedHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{hosp.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Accredited
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 font-medium">
                        {hosp.facilityType} · {hosp.accreditation}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{hosp.address}, {hosp.city}</span>
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {hosp.services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>ER Direct: <strong className="text-slate-900 font-mono">{hosp.emergencyHotline}</strong></span>
                  <span className="font-semibold text-slate-800">
                    {hosp.icuBedsAvailable !== undefined ? `${hosp.icuBedsAvailable} ICU Beds Open` : 'Call for Triage'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
