import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Pill,
  Clock,
  ShieldCheck,
  Plus,
  AlertCircle,
  Building2,
  Stethoscope,
  CheckCircle2,
  PhoneCall,
  Search,
  Filter,
  Sparkles,
  Heart
} from 'lucide-react';
import {
  PatientUser,
  DoctorUser,
  HospitalUser,
  Appointment,
  HealthRecord,
  MedicineReminder
} from '../types/index.ts';
import { api } from '../services/api.ts';

interface PatientDashboardProps {
  patient: PatientUser;
  appointments: Appointment[];
  records: HealthRecord[];
  reminders: MedicineReminder[];
  verifiedDoctors: DoctorUser[];
  verifiedHospitals: HospitalUser[];
  onOpenBooking: (doctor: DoctorUser) => void;
  onOpenEmergency: () => void;
  onOpenAiChat: () => void;
  onRefreshData: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  appointments,
  records,
  reminders,
  verifiedDoctors,
  verifiedHospitals,
  onOpenBooking,
  onOpenEmergency,
  onOpenAiChat,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'discovery' | 'appointments' | 'records' | 'medicines'>('overview');
  
  // Search & Filter in Discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [availabilityOnly, setAvailabilityOnly] = useState(false);

  // New Record Modal State
  const [showUploadRecordModal, setShowUploadRecordModal] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordCategory, setRecordCategory] = useState<any>('Lab Report');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordDoctor, setRecordDoctor] = useState('Dr. Sarah Connor, MD');

  // New Medicine Modal State
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medInstructions, setMedInstructions] = useState('');
  const [medTime, setMedTime] = useState('08:00 AM');

  // Toggle Reminder
  const handleToggleReminder = async (id: string) => {
    try {
      await api.toggleReminder(id);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.updateAppointmentStatus(id, 'cancelled');
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Health Record
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle) return;
    try {
      await api.addRecord({
        title: recordTitle,
        category: recordCategory,
        doctorOrClinic: recordDoctor,
        notes: recordNotes
      });
      setShowUploadRecordModal(false);
      setRecordTitle('');
      setRecordNotes('');
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Medicine Reminder
  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage) return;
    try {
      await api.addReminder({
        medicationName: medName,
        dosage: medDosage,
        instructions: medInstructions,
        times: [medTime]
      });
      setShowAddMedicineModal(false);
      setMedName('');
      setMedDosage('');
      setMedInstructions('');
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Doctors
  const filteredDoctors = verifiedDoctors.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.affiliation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || d.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesAvailability = !availabilityOnly || d.isAvailable;
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const specialtiesList = ['Cardiology', 'Orthopedic', 'Pediatrics', 'Neurology', 'Dermatology'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Patient Profile Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{patient.name}</h2>
              <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Patient Health ID: {patient.id}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Age: <strong className="text-slate-700">{patient.age || 38}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Blood Group: <strong className="text-rose-700 font-mono">{patient.bloodGroup || 'O+'}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Allergies: <strong className="text-amber-700">{patient.allergies?.join(', ') || 'Penicillin'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiChat}
            className="px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-xl transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>AI CareGuide Triage</span>
          </button>
          
          <button
            onClick={onOpenEmergency}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Health Overview
        </button>
        <button
          onClick={() => setActiveTab('discovery')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'discovery'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Find Doctors & Hospitals ({verifiedDoctors.length + verifiedHospitals.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'appointments'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'records'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Medical Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('medicines')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'medicines'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Medicine Reminders ({reminders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Next Upcoming Appointment */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Consultations</h3>
              </div>
              <button
                onClick={() => setActiveTab('discovery')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                + Book New
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active appointments scheduled. Find verified doctors in the directory.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                        <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                          {apt.doctorSpecialty}
                        </span>
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
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span>{apt.date} at {apt.time}</span>
                        <span>·</span>
                        <span>{apt.type}</span>
                        {apt.hospitalName && (
                          <>
                            <span>·</span>
                            <span>{apt.hospitalName}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 italic">"{apt.reason}"</p>
                      {apt.doctorNotes && (
                        <div className="p-2 bg-white rounded border border-slate-200 text-xs text-slate-700 mt-2">
                          <strong>Doctor's Clinical Note:</strong> {apt.doctorNotes}
                        </div>
                      )}
                    </div>

                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Medicine Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Today's Medicines</h3>
              </div>
              <button
                onClick={() => setShowAddMedicineModal(true)}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                + Add
              </button>
            </div>

            <div className="space-y-3">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    rem.takenToday
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className={`font-bold text-xs ${rem.takenToday ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                      {rem.medicationName} ({rem.dosage})
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {rem.times.join(', ')} · {rem.instructions}
                    </p>
                    <p className="text-[10px] text-teal-700 font-medium">
                      🔥 {rem.streakDays} Day Streak
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleReminder(rem.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      rem.takenToday
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: VERIFIED DISCOVERY */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          
          {/* Discovery Filter Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search verified doctors by name, hospital, or specialty..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Availability Filter Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 shrink-0">
                <input
                  type="checkbox"
                  checked={availabilityOnly}
                  onChange={(e) => setAvailabilityOnly(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
                <span>Show Only Available Now</span>
              </label>

            </div>

            {/* Specialty segmented tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedSpecialty('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                  selectedSpecialty === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Specialties
              </button>
              {specialtiesList.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSpecialty(sp)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                    selectedSpecialty === sp
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Doctor Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Verified Physicians & Specialists ({filteredDoctors.length})
              </h3>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Audited by EZIOX Verification Center
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          EZIOX Verified
                        </span>
                        <div className="text-[11px] font-mono font-bold text-slate-800 mt-1">
                          ${doc.consultationFee} <span className="font-normal text-slate-500">/ consult</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                      <p className="text-xs font-medium text-sky-700">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {doc.affiliation}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.bio}
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Experience: <strong>{doc.experienceYears} Years</strong></span>
                      <span className="font-mono">License: {doc.registrationNumber}</span>
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

                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => onOpenBooking(doc)}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Consultation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Hospital Facilities */}
          <div className="pt-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Accredited Hospitals & Clinics ({verifiedHospitals.length})
            </h3>
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
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-indigo-700 font-medium">{hosp.facilityType} · {hosp.accreditation}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    {hosp.address}, {hosp.city}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
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
                    <span>ER Hotline: <strong className="text-slate-900 font-mono">{hosp.emergencyHotline}</strong></span>
                    <span className="font-semibold text-slate-800">
                      {hosp.icuBedsAvailable !== undefined ? `${hosp.icuBedsAvailable} ICU Beds Available` : 'Call for Triage'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">My Appointments History</h3>
              <p className="text-xs text-slate-500">Track consultation requests, doctor notes, and scheduling</p>
            </div>
            <button
              onClick={() => setActiveTab('discovery')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              + Find Doctor
            </button>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                    <span className="text-xs text-sky-700 font-medium">({apt.doctorSpecialty})</span>
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
                  <p className="text-xs text-slate-700">Reason: {apt.reason}</p>
                  {apt.doctorNotes && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800">
                      <span className="font-bold block text-slate-900 mb-0.5">Doctor Clinical Notes:</span>
                      {apt.doctorNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {apt.status === 'requested' && (
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MEDICAL RECORDS */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Encrypted Health Vault</h3>
              <p className="text-xs text-slate-500">Chronological diagnostic reports, lab panels, and imaging scans</p>
            </div>
            <button
              onClick={() => setShowUploadRecordModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Medical Record</span>
            </button>
          </div>

          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-slate-900 text-sm">{rec.title}</span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {rec.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Issued By: <strong className="text-slate-700">{rec.doctorOrClinic}</strong></span>
                    <span>·</span>
                    <span className="font-mono">{rec.date}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-slate-400">{rec.fileName} ({rec.fileSize})</span>
                  </div>
                  {rec.notes && (
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                      {rec.notes}
                    </p>
                  )}
                  <div className="flex gap-1.5 pt-1">
                    {rec.tags?.map((tg, idx) => (
                      <span key={idx} className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={rec.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-lg transition-colors"
                  >
                    View Document
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MEDICINE REMINDERS */}
      {activeTab === 'medicines' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Medication Regimen & Reminders</h3>
              <p className="text-xs text-slate-500">Track daily dosages, compliance streaks, and clinical prescriptions</p>
            </div>
            <button
              onClick={() => setShowAddMedicineModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between ${
                  rem.takenToday
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rem.medicationName}</span>
                    <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      {rem.dosage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{rem.instructions}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    Schedule: {rem.times.join(', ')} · Duration: {rem.durationDays} days
                  </p>
                  <div className="text-xs text-teal-800 font-bold pt-1">
                    🔥 {rem.streakDays} Consecutive Days Logged
                  </div>
                </div>

                <button
                  onClick={() => handleToggleReminder(rem.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    rem.takenToday
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {rem.takenToday ? 'Taken Today ✓' : 'Mark as Taken'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Health Record Modal */}
      {showUploadRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Upload Clinical Record</h3>
            <form onSubmit={handleCreateRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Title</label>
                <input
                  type="text"
                  required
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="e.g. Lipid Profile, Echocardiogram Report"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={recordCategory}
                    onChange={(e: any) => setRecordCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Radiology / Scan">Radiology / Scan</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Physician / Facility</label>
                  <input
                    type="text"
                    value={recordDoctor}
                    onChange={(e) => setRecordDoctor(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes / Summary</label>
                <textarea
                  value={recordNotes}
                  onChange={(e) => setRecordNotes(e.target.value)}
                  placeholder="Key findings or doctor instructions..."
                  rows={3}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadRecordModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                >
                  Save to Health Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Medicine Reminder</h3>
            <form onSubmit={handleCreateMedicine} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Amoxicillin, Lisinopril"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="e.g. 500 mg, 10 ml"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
                <input
                  type="text"
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  placeholder="e.g. Take with water after breakfast"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedicineModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg"
                >
                  Set Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
