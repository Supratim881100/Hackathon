import React, { useState } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Clock,
  Calendar,
  FileCheck,
  Upload,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { DoctorUser, Appointment, HealthRecord } from '../types/index.ts';
import { api } from '../services/api.ts';

interface DoctorDashboardProps {
  doctor: DoctorUser;
  appointments: Appointment[];
  patientRecords: HealthRecord[];
  onRefreshData: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctor,
  appointments,
  patientRecords,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'availability' | 'credentials' | 'records'>('appointments');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Availability state
  const [isAvailable, setIsAvailable] = useState(doctor.isAvailable);
  const [availableHours, setAvailableHours] = useState(doctor.availableHours || '09:00 - 17:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(doctor.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [consultationFee, setConsultationFee] = useState(doctor.consultationFee || 140);
  const [bio, setBio] = useState(doctor.bio || '');

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Medical Board License');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Appointment action state
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveAvailability = async () => {
    try {
      setIsUpdating(true);
      setStatusMessage(null);
      await api.updateDoctorProfile({
        isAvailable,
        availableDays: selectedDays,
        availableHours,
        consultationFee: Number(consultationFee),
        bio
      });
      setStatusMessage('Availability & Practice Profile successfully updated.');
      onRefreshData();
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to update schedule');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    try {
      setIsUploadingDoc(true);
      await api.uploadVerificationDocument({
        title: docTitle,
        type: docType
      });
      setDocTitle('');
      setStatusMessage('Document uploaded. EZIOX compliance team has been notified.');
      onRefreshData();
    } catch (err: any) {
      setStatusMessage(err.message || 'Document upload failed');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleUpdateAppointment = async (aptId: string, status: string) => {
    try {
      await api.updateAppointmentStatus(aptId, status, doctorNotes, prescriptionNotes);
      setSelectedApt(null);
      setDoctorNotes('');
      setPrescriptionNotes('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment');
    }
  };

  const isVerified = doctor.verificationStatus === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Doctor Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{doctor.name}</h2>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  EZIOX Verified
                </span>
              ) : doctor.verificationStatus === 'needs_info' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Needs More Information
                </span>
              ) : doctor.verificationStatus === 'rejected' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Application Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-300">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  Pending EZIOX Review
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Specialty: <strong className="text-slate-800">{doctor.specialty}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Reg License: <strong className="font-mono text-slate-800">{doctor.registrationNumber}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Affiliation: <strong className="text-slate-800">{doctor.affiliation}</strong></span>
            </div>
          </div>
        </div>

        {/* 3 State Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">1. Account State</span>
            <span className="font-bold text-emerald-700">● Authenticated</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">2. EZIOX Audit</span>
            <span className={`font-bold ${isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isVerified ? '● Verified Badge Active' : '● Verification In Progress'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">3. Patient Booking</span>
            <span className={`font-bold ${doctor.isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
              {doctor.isAvailable ? '● Accepting Bookings' : '● Off Duty / Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Reviewer Feedback Notice if Needs Info */}
      {doctor.verificationStatus === 'needs_info' && doctor.reviewerNotes && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900">
            <h4 className="font-bold">EZIOX Reviewer Feedback Required:</h4>
            <p className="leading-relaxed">{doctor.reviewerNotes}</p>
            <p className="text-[11px] text-amber-700 pt-1 font-medium">
              Please submit the requested documentation below in the "Private Verification Vault" tab.
            </p>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl font-medium">
          {statusMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'appointments'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Patient Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'availability'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Availability & Schedule
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'credentials'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Private Verification Vault ({doctor.documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'records'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Authorized Patient Records ({patientRecords.length})
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Practice Appointments Queue</h3>
              <p className="text-xs text-slate-500">Review patient consultation requests, add prescriptions, and track status</p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No patient appointments currently booked. Make sure your availability schedule is active.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                      <span className="font-mono text-xs text-slate-500">{apt.patientPhone}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'requested'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      {apt.date} at {apt.time} · {apt.type} · Ref: {apt.id}
                    </div>

                    <p className="text-xs text-slate-700">
                      <strong>Patient Note:</strong> {apt.reason}
                    </p>

                    {apt.doctorNotes && (
                      <div className="mt-2 p-2.5 bg-white rounded border border-slate-200 text-xs text-slate-800">
                        <strong>My Clinical Note:</strong> {apt.doctorNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {apt.status === 'requested' && (
                      <button
                        onClick={() => handleUpdateAppointment(apt.id, 'confirmed')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Accept & Confirm
                      </button>
                    )}

                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => setSelectedApt(apt)}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                      >
                        Add Clinical Notes & Complete
                      </button>
                    )}

                    {apt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateAppointment(apt.id, 'cancelled')}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVAILABILITY & PRACTICE SCHEDULE */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Practice Schedule & Consultation Fee</h3>
            <p className="text-xs text-slate-500">
              Only EZIOX Verified doctors can enable live booking availability on the public directory.
            </p>
          </div>

          {!isVerified && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Your profile is currently under review by the EZIOX team. Once approved, you can activate public patient bookings.
              </span>
            </div>
          )}

          <div className="space-y-4 max-w-xl">
            {/* Live Availability Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Public Appointment Availability
                </span>
                <span className="text-[11px] text-slate-500">
                  When enabled, patients can book slots directly from your profile.
                </span>
              </div>
              <input
                type="checkbox"
                disabled={!isVerified}
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* Operating Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Consultation Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedDays.includes(day)
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Consultation Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  placeholder="09:00 - 16:30"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Fee ($ USD)
                </label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Professional Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Bio & Areas of Focus
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of your clinical qualifications and areas of care..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              onClick={handleSaveAvailability}
              disabled={isUpdating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Availability & Profile'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CREDENTIALS & PRIVATE DOCUMENTS */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">EZIOX Verification Document Vault</h3>
              <p className="text-xs text-slate-500">
                All submitted licenses and certifications are kept strictly confidential and only accessible to authorized EZIOX reviewers.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Institutional Audit Trail</span>
            </div>
          </div>

          {/* Current Documents */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submitted Clinical Credentials ({doctor.documents?.length || 0})
            </h4>

            {(!doctor.documents || doctor.documents.length === 0) ? (
              <p className="text-xs text-slate-400 py-4">No documents submitted yet. Upload your State Medical License below.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.documents.map((doc) => (
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
                          Verified by: {doc.verifiedBy}
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
            )}
          </div>

          {/* Upload New Document Form */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 max-w-lg space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-700" />
              <span>Submit Supplemental Credential Document</span>
            </h4>

            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. State Medical License 2026-2028, CME Certificate"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Medical Board License">Medical Board License</option>
                  <option value="Specialty Board Certification">Specialty Board Certification</option>
                  <option value="Degree / Diploma">Doctor of Medicine Degree</option>
                  <option value="Malpractice Insurance">Malpractice Insurance Clearance</option>
                  <option value="CME Proof">Continuing Medical Education (CME)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUploadingDoc}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isUploadingDoc ? 'Uploading...' : 'Submit to EZIOX Audit Queue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUTHORIZED PATIENT RECORDS */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Authorized Patient Clinical Records</h3>
            <p className="text-xs text-slate-500">
              Diagnostic reports and lab history shared by patients who have booked consultations with your practice.
            </p>
          </div>

          {patientRecords.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No patient records currently accessible. Once patients schedule appointments, their authorized records will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {patientRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span className="font-bold text-slate-900 text-xs">{rec.title}</span>
                      <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Date: {rec.date} · File: {rec.fileName} ({rec.fileSize})
                    </p>
                    {rec.notes && (
                      <p className="text-xs text-slate-700 italic">"{rec.notes}"</p>
                    )}
                  </div>

                  <a
                    href={rec.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-lg shrink-0"
                  >
                    Open Document
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete Appointment Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Complete Consultation with {selectedApt.patientName}
            </h3>

            <div className="text-xs text-slate-500 font-mono">
              {selectedApt.date} at {selectedApt.time} · {selectedApt.type}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Consultation Notes (Visible to Patient)
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Findings, clinical assessment, and follow-up recommendations..."
                rows={3}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescription / Treatment Plan
              </label>
              <textarea
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                placeholder="Medication names, dosage, frequency, lifestyle changes..."
                rows={2}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateAppointment(selectedApt.id, 'completed')}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
              >
                Finalize & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
