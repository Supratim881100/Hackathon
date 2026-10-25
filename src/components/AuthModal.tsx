import React, { useState } from 'react';
import { X, UserCheck, Stethoscope, Building2, ShieldCheck, KeyRound } from 'lucide-react';
import { UserRole, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onSuccess,
  defaultRole = 'patient'
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'bootstrap'>('register');
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole === 'admin' ? 'patient' : defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Patient extras
  const [age, setAge] = useState('32');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Doctor extras
  const [specialty, setSpecialty] = useState('Cardiology & Internal Medicine');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [consultationFee, setConsultationFee] = useState('120');

  // Hospital extras
  const [facilityType, setFacilityType] = useState<'Hospital' | 'Multi-specialty Clinic' | 'Diagnostic Center' | 'Trauma Center'>('Hospital');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Bootstrap Admin state
  const [inviteToken, setInviteToken] = useState('EZIOX-BOOTSTRAP-ALPHA-2026');
  const [adminTitle, setAdminTitle] = useState('Clinical Verification Officer');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        role: selectedRole,
        name,
        email,
        phone
      };

      if (selectedRole === 'patient') {
        payload.age = age;
        payload.bloodGroup = bloodGroup;
      } else if (selectedRole === 'doctor') {
        payload.specialty = specialty;
        payload.registrationNumber = registrationNumber || `MED-STATE-${Math.floor(100000 + Math.random() * 900000)}`;
        payload.affiliation = affiliation || 'Independent Practice';
        payload.consultationFee = Number(consultationFee);
      } else if (selectedRole === 'hospital') {
        payload.facilityType = facilityType;
        payload.licenseNumber = licenseNumber || `HOSP-LIC-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.city = city || 'New York, NY';
        payload.address = address || '100 Medical Center Parkway';
      }

      const user = await api.register(payload);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await api.bootstrapAdminInvite({
        inviteToken,
        name,
        email,
        adminTitle
      });
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Bootstrap token redemption failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Tabs */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'register' ? 'bg-white shadow-xs text-sky-700' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Public Registration
            </button>
            <button
              onClick={() => setActiveTab('bootstrap')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'bootstrap' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              EZIOX Token
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Public Registration Tab */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-4">
            
            {/* Role Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Your Healthcare Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('patient')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'patient'
                      ? 'bg-sky-50 border-sky-600 text-sky-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <UserCheck className="w-5 h-5 mx-auto mb-1 text-sky-600" />
                  <span className="text-xs block">Patient</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('doctor')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'doctor'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Stethoscope className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('hospital')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'hospital'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <span className="text-xs block">Hospital / Clinic</span>
                </button>
              </div>
            </div>

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Organization
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedRole === 'doctor' ? 'Dr. Jane Doe, MD' : selectedRole === 'hospital' ? 'Metro General Clinic' : 'Jane Doe'}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            {/* Doctor-specific fields */}
            {selectedRole === 'doctor' && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Credentialing Information (Required for EZIOX Review)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Clinical Specialty
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="e.g. Cardiology"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Medical License / Reg Number
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="MED-NY-123456"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Hospital / Clinic Affiliation
                    </label>
                    <input
                      type="text"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      placeholder="e.g. Mount Sinai Medical Center"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Consultation Fee ($ USD)
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hospital-specific fields */}
            {selectedRole === 'hospital' && (
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Facility Registration & Accreditation</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Facility Classification
                    </label>
                    <select
                      value={facilityType}
                      onChange={(e: any) => setFacilityType(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Hospital">General Hospital</option>
                      <option value="Trauma Center">Level 1/2 Trauma Center</option>
                      <option value="Multi-specialty Clinic">Multi-specialty Clinic</option>
                      <option value="Diagnostic Center">Diagnostic & Imaging Center</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      State Operating License ID
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="HOSP-LIC-8821"
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security note */}
            <p className="text-[11px] text-slate-500">
              By creating an account, you agree to BANDAZE institutional terms and the EZIOX verification standard.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
          </form>
        )}

        {/* EZIOX Token Bootstrap Tab */}
        {activeTab === 'bootstrap' && (
          <form onSubmit={handleBootstrapAdmin} className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-1">Restricted Administrative Onboarding:</span>
              EZIOX Admin accounts are strictly invitation-only. To bootstrap a credentialing reviewer account, you must present a valid institutional invite token issued by the system administrator.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                EZIOX Bootstrap Invite Token
              </label>
              <input
                type="text"
                required
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="EZIOX-BOOTSTRAP-XXXX-XXXX"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/30"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Pre-seeded demo tokens: <code className="text-amber-800">EZIOX-BOOTSTRAP-ALPHA-2026</code>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jordan Hayes, MD"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan.hayes@eziox.health"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Credentialing Title
              </label>
              <input
                type="text"
                required
                value={adminTitle}
                onChange={(e) => setAdminTitle(e.target.value)}
                placeholder="Senior Clinical Credentialing Officer"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Validating Token...' : 'Redeem Token & Authorize Admin Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
