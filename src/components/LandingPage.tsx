import React from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  HeartPulse,
  Sparkles,
  PhoneCall,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Award,
  Users
} from 'lucide-react';
import { DoctorUser, HospitalUser } from '../types/index.ts';

interface LandingPageProps {
  onOpenAuth: (defaultRole?: string) => void;
  onOpenAiChat: () => void;
  onOpenEmergency: () => void;
  onSelectDoctor: (doc: DoctorUser) => void;
  setActiveView: (view: string) => void;
  onQuickSwitch: (id: string, view: string) => void;
  doctors: DoctorUser[];
  hospitals: HospitalUser[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenAiChat,
  onOpenEmergency,
  onSelectDoctor,
  setActiveView,
  onQuickSwitch,
  doctors,
  hospitals
}) => {
  const verifiedDoctors = doctors.filter(d => d.verificationStatus === 'verified').slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 lg:pt-14 pb-12 bg-linear-to-b from-sky-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100/70 border border-sky-200/80 rounded-full text-xs font-semibold text-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>EZIOX Primary-Source Medical Credentialing</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] text-balance">
                Bridging the Gap of Healthcare with{' '}
                <span className="text-sky-600">Verified Trust</span> & AI.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                BANDAZE connects patients directly with board-certified physicians, accredited trauma centers, and an emergency response network. Every practitioner is independently audited by the EZIOX Verification Center.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveView('directory')}
                  className="px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 group"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Verified Care</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenAuth('doctor')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm rounded-xl transition-all shadow-2xs"
                >
                  Join as Doctor or Clinic
                </button>

                <button
                  onClick={onOpenEmergency}
                  className="px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm rounded-xl transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Emergency SOS</span>
                </button>
              </div>

              {/* Institutional Proof Metrics */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-2xl font-black text-slate-900 block font-sans">100%</span>
                  <span className="text-slate-500 font-normal">Primary-Source Verified</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 block font-sans">&lt; 8 Min</span>
                  <span className="text-slate-500 font-normal">Emergency Trauma Triage</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 block font-sans">Zero</span>
                  <span className="text-slate-500 font-normal">Unverified Directory Guarantee</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-4/3 lg:aspect-auto lg:h-[460px]">
                <img
                  src="/src/assets/images/hero_healthcare_doctors_1792864742114.jpg"
                  alt="Doctor consulting with patient in modern clinic"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Credential Trust Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-900">EZIOX Clinical Verification Standard</p>
                    <p className="text-slate-500 text-[11px]">Licenses, degrees, and hospital privileges authenticated</p>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THREE LOGIN EXPERIENCES & EZIOX ADMIN PORTAL CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider">
            Role-Based Healthcare Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Three Tailored Experiences, One Unified Standard
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Switch between patient, doctor, hospital, and institutional auditor roles in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Patient Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">1. Patient Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Book verified doctors, maintain chronological encrypted health records, track daily medicine streaks, and trigger emergency response.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Instant Doctor Discovery</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Lab Reports & Health Vault</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Medicine Reminders & Streaks</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onQuickSwitch('patient_david_miller', 'patient-dashboard')}
              className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-xs rounded-xl border border-sky-200 transition-colors"
            >
              Demo Patient Experience →
            </button>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">2. Doctor Practice</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit credentials for EZIOX audit, toggle booking availability, manage consultation queues, and access authorized patient records.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>State License Vault</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Live Availability Controls</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Consultation & Prescription Notes</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onQuickSwitch('doc_sarah_connor', 'doctor-dashboard')}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 transition-colors"
            >
              Demo Doctor Experience →
            </button>
          </div>

          {/* Hospital Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">3. Hospital & Clinic</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage clinical departments, track real-time open beds and ICU availability, affiliate doctors, and coordinate trauma care.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>ICU Bed Availability Counter</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Doctor Affiliation System</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Accreditation Submission</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onQuickSwitch('hosp_apex_heart', 'hospital-dashboard')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs rounded-xl border border-indigo-200 transition-colors"
            >
              Demo Hospital Experience →
            </button>
          </div>

          {/* EZIOX Admin Card */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-amber-500/40 text-white flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  RESTRICTED ADMIN
                </span>
                <h3 className="font-bold text-base text-white">4. EZIOX Center</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Private credentialing panel for the 4 authorized EZIOX team members. Features Gemini AI pre-validation and immutable audit logs.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Approve, Reject & Flag Records</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>AI Pre-Check & Consistency Audit</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Conflict of Interest Safeguards</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onQuickSwitch('admin_elena_vance', 'eziox-admin')}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Enter EZIOX Admin Panel →
            </button>
          </div>

        </div>
      </section>

      {/* 3. VERIFIED PROVIDER SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider">
                Public Directory
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Spotlight on Verified Physicians
              </h3>
              <p className="text-xs text-slate-500">
                Only doctors audited and approved by the EZIOX credentialing team are featured.
              </p>
            </div>

            <button
              onClick={() => setActiveView('directory')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shrink-0"
            >
              Explore Full Directory ({doctors.length} Verified) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                    <p className="text-xs font-medium text-sky-700">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {doc.affiliation}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {doc.bio}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-mono font-bold text-slate-800">${doc.consultationFee} Fee</span>
                    <span className="font-semibold text-emerald-700">● {doc.isAvailable ? 'Available' : 'Schedule Confirmed'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CLINICAL FACILITY SHOWCASE & AI CARE GUIDE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-xl border border-slate-200 aspect-16/9">
            <img
              src="/src/assets/images/clinic_modern_facility_1792864742215.jpg"
              alt="Advanced Healthcare Clinic Atrium"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono font-bold text-teal-600 uppercase tracking-wider">
              Comprehensive Care Ecosystem
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Capacity Tracking & Real-Time Emergency Triage
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When emergencies strike, time is of the essence. BANDAZE tracks open emergency room and ICU capacity across accredited partner hospitals, while providing AI triage to direct non-emergency cases to outpatient specialists.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-xs">
                <Sparkles className="w-5 h-5 text-sky-600 mb-1" />
                <span className="font-bold text-slate-900 block">AI Symptom Assistant</span>
                <span className="text-slate-600 text-[11px]">Conversational medical literacy powered by Gemini 3.8</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-xs">
                <PhoneCall className="w-5 h-5 text-rose-600 mb-1" />
                <span className="font-bold text-slate-900 block">Priority Ambulance SOS</span>
                <span className="text-slate-600 text-[11px]">Direct CAD emergency triage with paramedic ETA</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={onOpenAiChat}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch BANDAZE CareGuide</span>
              </button>
              <button
                onClick={onOpenEmergency}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Open Trauma Network</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Operational Blueprint
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            How BANDAZE Bridges Healthcare
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono">
              01
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Provider Onboarding</h4>
            <p className="text-slate-600 leading-relaxed">
              Doctors and hospitals register, submitting official medical licenses and accreditations to the confidential vault.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              02
            </span>
            <h4 className="font-bold text-slate-900 text-sm">EZIOX Verification</h4>
            <p className="text-slate-600 leading-relaxed">
              Authorized credentialing officers run Gemini AI consistency checks and primary source registry verification.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              03
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Verified Discovery</h4>
            <p className="text-slate-600 leading-relaxed">
              Approved providers appear on the verified directory with live scheduling, while patients book appointments safely.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs font-mono">
              04
            </span>
            <h4 className="font-bold text-slate-900 text-sm">Ongoing Continuum</h4>
            <p className="text-slate-600 leading-relaxed">
              Consultation notes, prescriptions, encrypted health records, and daily medicine reminders keep patient health on track.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
