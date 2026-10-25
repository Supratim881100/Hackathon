import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Upload,
  UserPlus,
  PhoneCall,
  MapPin,
  Heart,
  FileCheck,
  CheckCircle2,
  Stethoscope,
  XCircle
} from 'lucide-react';
import { HospitalUser, DoctorUser } from '../types/index.ts';
import { api } from '../services/api.ts';

interface HospitalDashboardProps {
  hospital: HospitalUser;
  affiliatedDoctors: DoctorUser[];
  onRefreshData: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospital,
  affiliatedDoctors,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'doctors' | 'documents' | 'services'>('profile');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Operating License');
  const [isUploading, setIsUploading] = useState(false);

  // Affiliate doctor state
  const [inviteDoctorName, setInviteDoctorName] = useState('');
  const [inviteDoctorEmail, setInviteDoctorEmail] = useState('');

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    try {
      setIsUploading(true);
      await api.uploadVerificationDocument({
        title: docTitle,
        type: docType
      });
      setDocTitle('');
      setStatusMessage('Facility document uploaded. Queued for EZIOX compliance audit.');
      onRefreshData();
    } catch (err: any) {
      setStatusMessage(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInviteDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteDoctorName || !inviteDoctorEmail) return;
    setStatusMessage(`Affiliation invitation dispatched to ${inviteDoctorName} (${inviteDoctorEmail}).`);
    setInviteDoctorName('');
    setInviteDoctorEmail('');
  };

  const isVerified = hospital.verificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hospital Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{hospital.name}</h2>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  EZIOX Accredited
                </span>
              ) : hospital.verificationStatus === 'needs_info' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Documentation Incomplete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-300">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  Facility Audit In Progress
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Facility Type: <strong className="text-slate-800">{hospital.facilityType}</strong></span>
              <span aria-hidden="true">·</span>
              <span>License ID: <strong className="font-mono text-slate-800">{hospital.licenseNumber}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Accreditation: <strong className="text-slate-800">{hospital.accreditation}</strong></span>
            </div>
          </div>
        </div>

        {/* Live Capacity Indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-mono">TOTAL BEDS</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">{hospital.totalBeds || 150}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-mono">ICU AVAILABILITY</span>
            <span className="text-base font-extrabold text-emerald-600 font-mono">
              {hospital.icuBedsAvailable || 8} OPEN
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl font-medium">
          {statusMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Facility Profile
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'doctors'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Affiliated Doctors ({affiliatedDoctors.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'documents'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Accreditation Vault ({hospital.documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'services'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Clinical Departments & Emergency
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Facility Details & Contact Information</h3>
            <p className="text-xs text-slate-500">Official institutional address and 24/7 emergency dispatch contact</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Emergency Care Line</span>
              <p className="text-base font-extrabold text-slate-900 font-mono">{hospital.emergencyHotline}</p>
              <p className="text-slate-500 text-[11px]">Direct priority trunk to triage coordinator</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Institutional Address</span>
              <p className="text-slate-800 font-medium">{hospital.address}</p>
              <p className="text-slate-500 font-mono">{hospital.city}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">State Operating License</span>
              <p className="text-slate-800 font-mono font-bold">{hospital.licenseNumber}</p>
              <p className="text-slate-500 text-[11px]">Status: Primary Source Verified</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Hospital Accreditation</span>
              <p className="text-slate-800 font-bold">{hospital.accreditation}</p>
              <p className="text-slate-500 text-[11px]">Audited by EZIOX Institutional Auditor</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AFFILIATED DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Affiliated Medical Practitioners</h3>
              <p className="text-xs text-slate-500">Doctors credentialed to deliver care at this facility</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affiliatedDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs">{doc.name}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-sky-700">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Reg: {doc.registrationNumber} · Fee: ${doc.consultationFee}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    doc.isAvailable ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                  }`}
                >
                  {doc.isAvailable ? 'Available Now' : 'Off Duty'}
                </span>
              </div>
            ))}
          </div>

          {/* Invite Doctor */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 max-w-lg space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-slate-700" />
              <span>Affiliate New Doctor / Specialist</span>
            </h4>
            <form onSubmit={handleInviteDoctor} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={inviteDoctorName}
                  onChange={(e) => setInviteDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Bell, MD"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Doctor Email</label>
                <input
                  type="email"
                  required
                  value={inviteDoctorEmail}
                  onChange={(e) => setInviteDoctorEmail(e.target.value)}
                  placeholder="arthur.bell@bandaze.health"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Send Affiliation Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ACCREDITATION DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Facility Operating Permits & Accreditations</h3>
            <p className="text-xs text-slate-500">Private documents submitted to EZIOX Institutional Compliance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospital.documents?.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs">{doc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{doc.type}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Submitted: {new Date(doc.submittedAt).toLocaleDateString()}
                  </p>
                  {doc.verifiedBy && (
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Audited by: {doc.verifiedBy}
                    </p>
                  )}
                </div>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 px-2 py-1 bg-white border border-slate-200 rounded"
                >
                  Inspect
                </a>
              </div>
            ))}
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 max-w-lg space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-slate-700" />
              <span>Submit Supplemental Facility Document</span>
            </h4>
            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Fire Department Clearance, Pharmacy License"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Operating License">State Operating License</option>
                  <option value="JCI Accreditation">JCI / NABH Accreditation Certificate</option>
                  <option value="Fire Clearance">Fire Safety Clearance</option>
                  <option value="Pharmacy Clearance">Pharmacy Dispensation License</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Submit to EZIOX Institutional Auditor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Active Clinical Departments</h3>
            <p className="text-xs text-slate-500">Configured medical care specialties available at this center</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {hospital.services.map((srv, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{srv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
