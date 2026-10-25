import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Award,
  Video,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { DoctorUser } from '../types/index.ts';
import { api } from '../services/api.ts';

interface DoctorRegistrationModalProps {
  onClose: () => void;
  onRegistered: (newDoctor: DoctorUser) => void;
}

export const DoctorRegistrationModal: React.FC<DoctorRegistrationModalProps> = ({
  onClose,
  onRegistered
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'Cardiology & Heart Care',
    qualifications: '',
    registrationNumber: '',
    registrationCouncil: 'Delhi Medical Council',
    registrationState: 'Delhi',
    experienceYears: 5,
    affiliation: '',
    clinicAddress: '',
    clinicHours: '10:00 AM - 06:00 PM',
    bio: '',
    documentTitle: 'State Medical Council Certificate',
    documentType: 'Medical Council License',
    videoFee: 600,
    voiceFee: 400,
    clinicFee: 700,
    chatFee: 250,
    enableVideo: true,
    enableVoice: true,
    enableClinic: true,
    enableChat: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successDoctor, setSuccessDoctor] = useState<DoctorUser | null>(null);

  const medicalCouncils = [
    'Delhi Medical Council',
    'Uttar Pradesh Medical Council',
    'National Medical Commission (MCI)',
    'Maharashtra Medical Council',
    'Karnataka Medical Council',
    'Tamil Nadu Medical Council',
    'West Bengal Medical Council',
    'Gujarat Medical Council',
    'Rajasthan Medical Council'
  ];

  const specialtiesList = [
    'Cardiology & Heart Care',
    'General Medicine & Physician',
    'Pediatrics & Child Care',
    'Dermatology & Skin Care',
    'Orthopedics & Joint Care',
    'Gynecology & Obstetrics',
    'Neurology & Brain Health',
    'ENT & Otolaryngology',
    'Ophthalmology & Eye Care',
    'Psychiatry & Mental Health'
  ];

  const statesList = [
    'Delhi',
    'Uttar Pradesh',
    'Maharashtra',
    'Karnataka',
    'Tamil Nadu',
    'Haryana',
    'West Bengal',
    'Gujarat',
    'Rajasthan',
    'Punjab'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.registrationNumber.trim() || !formData.qualifications.trim()) {
      setErrorMessage('Please fill in all mandatory professional fields.');
      return;
    }

    if (!formData.enableVideo && !formData.enableVoice && !formData.enableClinic && !formData.enableChat) {
      setErrorMessage('Please enable at least one consultation mode (Video, Voice, Clinic, or Chat).');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialty: formData.specialty,
        qualifications: formData.qualifications.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        registrationCouncil: formData.registrationCouncil,
        registrationState: formData.registrationState,
        experienceYears: Number(formData.experienceYears),
        affiliation: formData.affiliation.trim() || 'Independent Clinical Practice',
        clinicAddress: formData.clinicAddress.trim() || `${formData.registrationState} Medical Hub`,
        clinicHours: formData.clinicHours,
        consultationModes: {
          video: formData.enableVideo,
          voice: formData.enableVoice,
          clinic: formData.enableClinic,
          chat: formData.enableChat
        },
        consultationFees: {
          video: Number(formData.videoFee),
          voice: Number(formData.voiceFee),
          clinic: Number(formData.clinicFee),
          chat: Number(formData.chatFee)
        },
        bio: formData.bio.trim() || `Licensed practitioner registered with ${formData.registrationCouncil}.`,
        documentTitle: formData.documentTitle,
        documentType: formData.documentType
      };

      const doctor = await api.registerDoctor(payload);
      setSuccessDoctor(doctor);
      onRegistered(doctor);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit doctor registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#12383f] to-[#1e6b75] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                  BANDAZE Medical Network
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight mt-0.5">
                Doctor Registration & Credential Verification
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successDoctor ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900">
                  Registration Successfully Submitted!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Welcome, <strong>{successDoctor.name}</strong>. Your application has been logged under ID <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{successDoctor.id}</code>.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pending Admin Verification (NMC / State Council)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  As per BANDAZE compliance, newly registered profiles remain in <strong>Pending Verification</strong> status until the credentialing team verifies your registration number (<strong>{successDoctor.registrationNumber}</strong>) with the {successDoctor.registrationCouncil}.
                </p>
                <p className="text-[11px] text-amber-800 font-medium">
                  Once approved by the admin team, your profile and verified badge will automatically appear in the public "Consult a Doctor" directory.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#1e6b75] hover:bg-[#165860] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Compliance Notice */}
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-950 space-y-0.5 leading-relaxed">
                  <p className="font-bold">Mandatory Credential Audit Standard:</p>
                  <p className="text-teal-800 text-[11px]">
                    To ensure patient safety, BANDAZE requires active registration with a recognized State Medical Council or National Medical Commission. Newly registered doctors remain in <span className="font-semibold text-teal-900">pending_verification</span> until approved by the admin team.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
                  <span>1. Professional Identity & Contact</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name (with Honorific) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajiv Gupta"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Professional Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="dr.rajiv@clinic.health"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinical Experience (Years) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Medical Licensing & Qualifications */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
                  <span>2. Medical Registration & Qualifications</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Medical Specialization *
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      {specialtiesList.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Medical Degrees & Qualifications *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MBBS, MD (Medicine), DM (Cardiology)"
                      value={formData.qualifications}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration / License Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DMC-58291 or UPMC-44812"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration Council / Authority *
                    </label>
                    <select
                      value={formData.registrationCouncil}
                      onChange={(e) => setFormData({ ...formData, registrationCouncil: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      {medicalCouncils.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Jurisdiction *
                    </label>
                    <select
                      value={formData.registrationState}
                      onChange={(e) => setFormData({ ...formData, registrationState: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      {statesList.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hospital / Clinic Affiliation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fortis Escorts Heart Institute / Apex Clinic"
                      value={formData.affiliation}
                      onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Consultation Modes & Fees */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
                    <span>3. Consultation Modes & Fees (₹ INR)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Configure modes offered</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Video Call Mode */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${formData.enableVideo ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-teal-700" />
                        <span className="font-bold text-xs text-slate-900">Video Call</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableVideo}
                        onChange={(e) => setFormData({ ...formData, enableVideo: e.target.checked })}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                      />
                    </div>
                    {formData.enableVideo && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Fee: ₹</span>
                        <input
                          type="number"
                          value={formData.videoFee}
                          onChange={(e) => setFormData({ ...formData, videoFee: Number(e.target.value) })}
                          className="w-24 text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Voice Call Mode */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${formData.enableVoice ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-teal-700" />
                        <span className="font-bold text-xs text-slate-900">Voice Call</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableVoice}
                        onChange={(e) => setFormData({ ...formData, enableVoice: e.target.checked })}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                      />
                    </div>
                    {formData.enableVoice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Fee: ₹</span>
                        <input
                          type="number"
                          value={formData.voiceFee}
                          onChange={(e) => setFormData({ ...formData, voiceFee: Number(e.target.value) })}
                          className="w-24 text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* In-Clinic Visit Mode */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${formData.enableClinic ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-700" />
                        <span className="font-bold text-xs text-slate-900">In-Clinic Visit</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableClinic}
                        onChange={(e) => setFormData({ ...formData, enableClinic: e.target.checked })}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                      />
                    </div>
                    {formData.enableClinic && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Fee: ₹</span>
                        <input
                          type="number"
                          value={formData.clinicFee}
                          onChange={(e) => setFormData({ ...formData, clinicFee: Number(e.target.value) })}
                          className="w-24 text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Text Chat Mode */}
                  <div className={`p-3.5 rounded-2xl border transition-all ${formData.enableChat ? 'bg-teal-50/50 border-teal-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-teal-700" />
                        <span className="font-bold text-xs text-slate-900">Text Chat</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableChat}
                        onChange={(e) => setFormData({ ...formData, enableChat: e.target.checked })}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                      />
                    </div>
                    {formData.enableChat && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Fee: ₹</span>
                        <input
                          type="number"
                          value={formData.chatFee}
                          onChange={(e) => setFormData({ ...formData, chatFee: Number(e.target.value) })}
                          className="w-24 text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinic Location & Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinic Address (for In-Clinic visits)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sector 62 Medical Arcade, Noida, UP"
                      value={formData.clinicAddress}
                      onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Consultation Hours
                    </label>
                    <input
                      type="text"
                      placeholder="10:00 AM - 06:00 PM (Mon-Sat)"
                      value={formData.clinicHours}
                      onChange={(e) => setFormData({ ...formData, clinicHours: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Clinical Bio
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief background on clinical experience, focus areas, and patient approach..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{isSubmitting ? 'Submitting to Medical Review...' : 'Submit Doctor Registration'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
