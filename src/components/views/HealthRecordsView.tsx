import React, { useState } from 'react';
import {
  Plus,
  Search,
  Lock,
  FileText,
  Trash2,
  Download,
  Calendar,
  Building,
  UploadCloud
} from 'lucide-react';
import { HealthRecord } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface HealthRecordsViewProps {
  records: HealthRecord[];
  onRefreshRecords: () => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  records,
  onRefreshRecords
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [doctorOrClinic, setDoctorOrClinic] = useState('');
  const [category, setCategory] = useState<'Lab Report' | 'Prescription' | 'Radiology / Scan' | 'Discharge Summary' | 'Vaccination'>('Lab Report');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const categories = [
    'Reports',
    'Prescriptions',
    'Allergies',
    'Medical History',
    'Consultations'
  ];

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsUploading(true);
    try {
      await api.addRecord({
        title,
        category,
        doctorOrClinic: doctorOrClinic || 'General Health Clinic',
        date,
        fileName: `${title.toLowerCase().replace(/\s+/g, '_')}_document.pdf`,
        notes,
        tags: [category.toLowerCase()]
      });
      setIsAddModalOpen(false);
      setTitle('');
      setDoctorOrClinic('');
      setNotes('');
      onRefreshRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.doctorOrClinic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header with Title & Add Record Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
            BANDAZE
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
            Health Records
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Prescriptions, reports and history
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add record</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#1e6b75] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search records..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-2xs"
        />
      </div>

      {/* Records Content / Empty State */}
      {filteredRecords.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white/50">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            No records here yet. Add one to keep it safe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-5 border border-gray-150 shadow-2xs hover:shadow-md transition-all flex items-start justify-between"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{rec.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{rec.doctorOrClinic}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {rec.date}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {rec.category}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={rec.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-gray-400 hover:text-teal-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download / View"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Private Storage Security Note */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
        <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span>
          Your real records are stored on the BANDAZE server in private storage, never in this browser. Every file access is logged.
        </span>
      </div>

      {/* Add Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                Add Health Record
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Record Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC)"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Radiology / Scan">Radiology / Scan</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Vaccination">Vaccination</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Doctor or Diagnostic Clinic
                </label>
                <input
                  type="text"
                  value={doctorOrClinic}
                  onChange={(e) => setDoctorOrClinic(e.target.value)}
                  placeholder="e.g. Apex Diagnostics Lab"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes from consultation or test values..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-[#1e6b75] hover:bg-[#165860] text-white font-semibold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Encrypting & Saving...' : 'Save Record'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
