import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Video,
  Phone,
  Building2,
  MessageSquare,
  Clock,
  ShieldCheck,
  Stethoscope,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  UserPlus,
  Info
} from 'lucide-react';
import { DoctorUser, ConsultationMode } from '../../types/index.ts';

interface ConsultDoctorViewProps {
  doctors: DoctorUser[];
  onRequestBooking: (doctor: DoctorUser) => void;
  onStartConsultation?: (doctor: DoctorUser, mode: ConsultationMode) => void;
  onOpenDoctorRegistration?: () => void;
  onViewProfile?: (doctor: DoctorUser) => void;
}

export const ConsultDoctorView: React.FC<ConsultDoctorViewProps> = ({
  doctors,
  onRequestBooking,
  onStartConsultation,
  onOpenDoctorRegistration
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedMode, setSelectedMode] = useState<'all' | 'video' | 'voice' | 'clinic' | 'chat'>('all');
  const [selectedDocModal, setSelectedDocModal] = useState<DoctorUser | null>(null);

  const specialties = [
    'All',
    'Cardiology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'General Medicine',
    'Neurology',
    'Gynecology'
  ];

  // Helper to get clean initials
  const getInitials = (name: string) => {
    const clean = name.replace(/^Dr\.\s*/i, '').replace(/,\s*.*$/, '').trim();
    const parts = clean.split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Strictly filter only verified doctors
  const verifiedDoctors = doctors.filter((doc) => {
    const isVerified = doc.verificationStatus === 'verified' && doc.accountStatus !== 'suspended' && doc.accountStatus !== 'rejected';
    if (!isVerified) return false;

    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.affiliation && doc.affiliation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.registrationCouncil && doc.registrationCouncil.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    const matchesMode =
      selectedMode === 'all' ||
      (doc.consultationModes && doc.consultationModes[selectedMode] === true);

    return matchesSearch && matchesSpecialty && matchesMode;
  });

  const handleLaunchConsultation = (doc: DoctorUser, mode: ConsultationMode) => {
    if (mode === 'clinic') {
      onRequestBooking(doc);
    } else if (onStartConsultation) {
      onStartConsultation(doc, mode);
    } else {
      onRequestBooking(doc);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Top Title & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
            BANDAZE Verified Network
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
            Consult a Verified Doctor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Connect with State Medical Council verified doctors via Video, Voice, In-Clinic, or Text Chat.
          </p>
        </div>

        {onOpenDoctorRegistration && (
          <button
            onClick={onOpenDoctorRegistration}
            className="self-start sm:self-auto px-4 py-2.5 bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.99] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-emerald-300" />
            <span>Join as a Doctor</span>
          </button>
        )}
      </div>

      {/* Doctor Join Invitation Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-[#12383f] text-white rounded-3xl p-5 sm:p-6 shadow-md border border-teal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Medical Council Verified Directory</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold">
            Are you a licensed physician or specialist?
          </h2>
          <p className="text-xs text-teal-100/80 leading-relaxed max-w-xl">
            Register your practice on BANDAZE to provide Video Calls, Audio Consultations, In-Clinic appointments, and digital prescriptions to verified patients.
          </p>
        </div>

        {onOpenDoctorRegistration && (
          <button
            onClick={onOpenDoctorRegistration}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <span>Register Practice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search Input & Consultation Mode Filter Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, specialty (e.g. Cardiology, Pediatrics), hospital, or council..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
          />
        </div>

        {/* Consultation Mode Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-600 mr-1">Consultation Mode:</span>
          <button
            onClick={() => setSelectedMode('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedMode === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            All Modes
          </button>
          <button
            onClick={() => setSelectedMode('video')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedMode === 'video'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Call</span>
          </button>
          <button
            onClick={() => setSelectedMode('voice')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedMode === 'voice'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Voice Call</span>
          </button>
          <button
            onClick={() => setSelectedMode('clinic')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedMode === 'clinic'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>In-Clinic Visit</span>
          </button>
          <button
            onClick={() => setSelectedMode('chat')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedMode === 'chat'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Text Chat</span>
          </button>
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSpecialty === spec
                  ? 'bg-[#1e6b75] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {verifiedDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              No verified doctors found matching your filters
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We only display medical doctors whose credentials have been cross-verified with their State Medical Council. Try clearing your search query or selecting a different specialty.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('All');
                setSelectedMode('all');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            {onOpenDoctorRegistration && (
              <button
                onClick={onOpenDoctorRegistration}
                className="px-4 py-2 bg-[#1e6b75] hover:bg-[#165860] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Register as Doctor
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {verifiedDoctors.map((doc) => {
            const initials = getInitials(doc.name);
            const videoFee = doc.consultationFees?.video || 600;
            const voiceFee = doc.consultationFees?.voice || 400;
            const clinicFee = doc.consultationFees?.clinic || doc.consultationFee || 700;
            const chatFee = doc.consultationFees?.chat || 250;

            const offersVideo = doc.consultationModes?.video !== false;
            const offersVoice = doc.consultationModes?.voice !== false;
            const offersClinic = doc.consultationModes?.clinic !== false;
            const offersChat = doc.consultationModes?.chat !== false;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Info Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-[#edf6f7] text-[#1b5e67] font-bold text-base flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">
                          {doc.name}
                        </h3>
                      </div>
                      <p className="text-xs font-semibold text-[#1e6b75] mt-0.5 leading-tight">
                        {doc.specialty}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {doc.qualifications} · {doc.experienceYears || 10}+ yrs exp
                      </p>
                    </div>
                  </div>

                  {/* Verification & Council Badge */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified by BANDAZE
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.registrationNumber}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1 truncate">
                      <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{doc.registrationCouncil || 'National Medical Commission'}</span>
                    </p>

                    {doc.clinicAddress && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{doc.clinicAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* Available Consultation Modes & Fee Schedule */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Available Modes & Fees
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {offersVideo && (
                        <div className="px-2 py-1 bg-teal-50/70 border border-teal-100 rounded-lg flex items-center justify-between text-teal-900">
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3 text-teal-600" />
                            <span>Video</span>
                          </span>
                          <strong className="font-mono">₹{videoFee}</strong>
                        </div>
                      )}

                      {offersVoice && (
                        <div className="px-2 py-1 bg-teal-50/70 border border-teal-100 rounded-lg flex items-center justify-between text-teal-900">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-teal-600" />
                            <span>Voice</span>
                          </span>
                          <strong className="font-mono">₹{voiceFee}</strong>
                        </div>
                      )}

                      {offersClinic && (
                        <div className="px-2 py-1 bg-teal-50/70 border border-teal-100 rounded-lg flex items-center justify-between text-teal-900">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-teal-600" />
                            <span>Clinic</span>
                          </span>
                          <strong className="font-mono">₹{clinicFee}</strong>
                        </div>
                      )}

                      {offersChat && (
                        <div className="px-2 py-1 bg-teal-50/70 border border-teal-100 rounded-lg flex items-center justify-between text-teal-900">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-teal-600" />
                            <span>Chat</span>
                          </span>
                          <strong className="font-mono">₹{chatFee}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Multi-Mode Action Buttons */}
                <div className="mt-5 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {offersVideo && (
                      <button
                        onClick={() => handleLaunchConsultation(doc, 'video')}
                        className="w-full bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.99] text-white font-bold py-2 px-2.5 rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Start Video Consultation"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Video Call</span>
                      </button>
                    )}

                    {offersVoice && (
                      <button
                        onClick={() => handleLaunchConsultation(doc, 'voice')}
                        className="w-full bg-white hover:bg-teal-50 border border-teal-600/40 text-teal-800 font-bold py-2 px-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Start Voice Consultation"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Voice Call</span>
                      </button>
                    )}

                    {offersClinic && (
                      <button
                        onClick={() => handleLaunchConsultation(doc, 'clinic')}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold py-2 px-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Book In-Clinic Appointment"
                      >
                        <Building2 className="w-3.5 h-3.5 text-gray-500" />
                        <span>In-Clinic</span>
                      </button>
                    )}

                    {offersChat && (
                      <button
                        onClick={() => handleLaunchConsultation(doc, 'chat')}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold py-2 px-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Start Text Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                        <span>Chat</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedDocModal(doc)}
                    className="w-full text-center text-[11px] font-semibold text-gray-500 hover:text-teal-700 py-1 transition-colors cursor-pointer"
                  >
                    View Doctor Credentials & Profile →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Full Profile Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 font-bold text-lg flex items-center justify-center border border-teal-100">
                  {getInitials(selectedDocModal.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {selectedDocModal.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-700">
                    {selectedDocModal.specialty}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedDocModal.affiliation || 'Independent Practice'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocModal(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-600 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p>
                <strong className="text-gray-800">Experience:</strong>{' '}
                {selectedDocModal.experienceYears || 10} Years
              </p>
              <p>
                <strong className="text-gray-800">Registration Number:</strong>{' '}
                <span className="font-mono font-bold text-teal-800">{selectedDocModal.registrationNumber}</span>
              </p>
              <p>
                <strong className="text-gray-800">Registration Authority:</strong>{' '}
                {selectedDocModal.registrationCouncil || 'Delhi Medical Council'}
              </p>
              <p>
                <strong className="text-gray-800">Qualifications:</strong>{' '}
                {selectedDocModal.qualifications}
              </p>
              <p>
                <strong className="text-gray-800">Clinic Address:</strong>{' '}
                {selectedDocModal.clinicAddress || 'Sector 62 Medical Hub, Noida'}
              </p>
              <p>
                <strong className="text-gray-800">Consultation Hours:</strong>{' '}
                {selectedDocModal.clinicHours || '10:00 AM - 06:00 PM'}
              </p>
              <p>
                <strong className="text-gray-800">Clinical Bio:</strong>{' '}
                {selectedDocModal.bio}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const doc = selectedDocModal;
                  setSelectedDocModal(null);
                  handleLaunchConsultation(doc, 'video');
                }}
                className="bg-[#1e6b75] hover:bg-[#165860] text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Call (₹{selectedDocModal.consultationFees?.video || 600})</span>
              </button>
              <button
                onClick={() => {
                  const doc = selectedDocModal;
                  setSelectedDocModal(null);
                  handleLaunchConsultation(doc, 'clinic');
                }}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                <span>In-Clinic Visit</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
