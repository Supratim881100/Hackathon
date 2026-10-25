import React, { useState } from 'react';
import { BandazeLogo } from '../BandazeLogo.tsx';
import {
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Building2,
  ChevronDown,
  ArrowRight,
  Phone,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface LoginViewProps {
  language: 'en' | 'hi';
  onToggleLanguage: (lang: 'en' | 'hi') => void;
  onLoginSuccess: (userId: string, role: UserRole) => void;
  onCall108: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onToggleLanguage,
  onLoginSuccess,
  onCall108
}) => {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor' | 'hospital'>('patient');
  const [mobileNumber, setMobileNumber] = useState('98765 43210');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Map to proper persona in system
      if (activeTab === 'patient') {
        onLoginSuccess('patient_supratim_paul', 'patient');
      } else if (activeTab === 'doctor') {
        onLoginSuccess('doc_sarah_connor', 'doctor');
      } else {
        onLoginSuccess('hosp_apex_heart', 'hospital');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f9fbfb]">
      {/* Left Column: Dark Slate-Teal Brand Banner */}
      <div className="lg:w-1/2 bg-[#12383f] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-screen">
        {/* Subtle Silhouette Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center mix-blend-luminosity"
          style={{
            backgroundImage: `url('/src/assets/images/hero_healthcare_doctors_1792864742114.jpg')`
          }}
        />

        {/* Top: Logo Card */}
        <div className="relative z-10 self-start">
          <BandazeLogo size="lg" />
        </div>

        {/* Center: Headline & Subhead */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Bandaging the gap of healthcare.
          </h1>
          <p className="text-base sm:text-lg text-teal-100/90 font-normal">
            Simple healthcare, made for you.
          </p>
        </div>

        {/* Bottom: Trust Badge */}
        <div className="relative z-10 flex items-center gap-2.5 text-xs text-teal-200/90 pt-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Trusted, simple and accessible care</span>
        </div>
      </div>

      {/* Right Column: Clean White Login Form */}
      <div className="lg:w-1/2 bg-white flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        {/* Top Right: Language Selector */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200">
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'bg-[#1e6b75] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onToggleLanguage('hi')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                language === 'hi'
                  ? 'bg-[#1e6b75] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Center Container: Health Care Hub */}
        <div className="max-w-md w-full mx-auto space-y-8 my-auto py-4">
          {/* Header */}
          <div>
            <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
              BANDAZE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
              Health Care Hub
            </h2>
          </div>

          {/* 3 Role Selection Tabs */}
          <div className="bg-gray-100/90 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 border border-gray-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('patient');
                setStep('phone');
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                activeTab === 'patient'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
              }`}
            >
              <Smartphone className="w-4 h-4 text-teal-700" />
              <span>Patient Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('doctor');
                setStep('phone');
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                activeTab === 'doctor'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span>Doctor Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('hospital');
                setStep('phone');
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                activeTab === 'hospital'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
              }`}
            >
              <Building2 className="w-4 h-4 text-teal-700" />
              <span className="leading-tight">Hospital / Clinic Login</span>
            </button>
          </div>

          {/* Step 1: Mobile Number Input */}
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mobile number
                </label>
                <div className="flex items-center gap-2">
                  {/* Country Selector */}
                  <div className="flex items-center gap-1 px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700">
                    <span>🇮🇳 +91</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>

                  {/* Phone Input */}
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 px-4 py-3 bg-white border border-teal-600 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#82abb0] hover:bg-[#1e6b75] active:scale-[0.99] text-white font-semibold py-3.5 rounded-2xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Sending SMS Code...' : 'Send OTP →'}</span>
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 text-xs text-teal-900">
                OTP sent to <strong>+91 {mobileNumber}</strong>. (For demo verification, enter any 6 digits e.g. <strong>123456</strong>)
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-white border border-teal-600 rounded-2xl text-base tracking-widest font-mono text-center font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-2xs"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.99] text-white font-semibold py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                >
                  {isLoading ? 'Verifying...' : `Continue to ${activeTab === 'patient' ? 'Patient' : activeTab === 'doctor' ? 'Doctor' : 'Hospital'} Hub`}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl text-xs cursor-pointer transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Bypass for Instant Testing */}
          <div className="pt-2 text-center">
            <span className="text-[11px] text-gray-400">
              Testing mode: Click any tab above and click "Send OTP" to log in.
            </span>
          </div>
        </div>

        {/* Bottom Emergency Disclaimer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p className="text-center sm:text-left leading-relaxed">
            In an emergency, call 108 now. BANDAZE never dispatches an ambulance.
          </p>
          <button
            onClick={onCall108}
            className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>108</span>
          </button>
        </div>
      </div>
    </div>
  );
};
