import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { HealthRecord, DoctorUser, SharedReportItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface ShareReportsViewProps {
  records: HealthRecord[];
  doctors: DoctorUser[];
}

export const ShareReportsView: React.FC<ShareReportsViewProps> = ({
  records,
  doctors
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [accessType, setAccessType] = useState<'View only' | 'Full access'>('View only');
  const [accessExpires, setAccessExpires] = useState('24 hours');
  const [hasConsent, setHasConsent] = useState(false);
  const [sharedReports, setSharedReports] = useState<SharedReportItem[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const loadSharedReports = async () => {
    const list = await api.getSharedReports();
    setSharedReports(list);
  };

  useEffect(() => {
    loadSharedReports();
  }, []);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId || !selectedDoctorId || !hasConsent) return;

    const rec = records.find(r => r.id === selectedRecordId);
    const doc = doctors.find(d => d.id === selectedDoctorId);

    const newItem: SharedReportItem = {
      id: `share_${Date.now()}`,
      recordId: selectedRecordId,
      recordTitle: rec ? rec.title : 'Diagnostic Report',
      doctorId: selectedDoctorId,
      doctorName: doc ? doc.name : 'Selected Doctor',
      accessType,
      expiresIn: accessExpires,
      sharedDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    await api.addSharedReport(newItem);
    await loadSharedReports();
    setSelectedRecordId('');
    setSelectedDoctorId('');
    setHasConsent(false);
    setSuccessMessage('Report shared securely with doctor.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleRevoke = async (id: string) => {
    await api.revokeSharedReport(id);
    await loadSharedReports();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
          BANDAZE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
          Share Reports
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Share a report with a doctor
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Share Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-5">
          <form onSubmit={handleShare} className="space-y-4 text-xs">
            {/* Report Select */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">
                Report
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 appearance-none focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs pr-10"
                >
                  <option value="">Choose a record</option>
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.date})
                    </option>
                  ))}
                  {records.length === 0 && (
                    <option value="rec_demo_1">Demo Complete Blood Count (CBC)</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Doctor Select */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">
                Doctor
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 appearance-none focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs pr-10"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Access & Expiry in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">
                  Access
                </label>
                <div className="relative">
                  <select
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 appearance-none focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs pr-10"
                  >
                    <option value="View only">View only</option>
                    <option value="Full access">Full access (downloadable)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">
                  Access expires
                </label>
                <div className="relative">
                  <select
                    value={accessExpires}
                    onChange={(e) => setAccessExpires(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 appearance-none focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs pr-10"
                  >
                    <option value="24 hours">24 hours</option>
                    <option value="48 hours">48 hours</option>
                    <option value="7 days">7 days</option>
                    <option value="30 days">30 days</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="w-4 h-4 rounded text-teal-700 border-gray-300 focus:ring-teal-600 mt-0.5 cursor-pointer"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I consent to share this record with the selected doctor until it expires or I revoke it.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!hasConsent}
              className="w-full bg-[#82abb0] hover:bg-[#1e6b75] active:scale-[0.99] text-white font-semibold py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              Share securely
            </button>

            {/* Footer Disclaimer */}
            <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-2">
              No email or link is sent. The doctor sees the record in their BANDAZE portal while access is active.
            </p>
          </form>
        </div>

        {/* Right Column: Sharing Status */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-gray-900 text-lg">
            Sharing status
          </h3>

          {sharedReports.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-white/50">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Nothing shared yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedReports.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-gray-150 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-xs">
                      {item.recordTitle}
                    </p>
                    <p className="text-xs text-teal-800 font-medium">
                      Shared with {item.doctorName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Expires in {item.expiresIn}
                      </span>
                      <span>·</span>
                      <span>{item.accessType}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(item.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Revoke Access Immediately"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
