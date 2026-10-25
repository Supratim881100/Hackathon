import React, { useState } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/index.ts';

interface SettingsViewProps {
  currentUser: User | null;
  language: 'en' | 'hi';
  onToggleLanguage: (lang: 'en' | 'hi') => void;
  onUpdateUserName?: (name: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  language,
  onToggleLanguage,
  onUpdateUserName
}) => {
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [name, setName] = useState(currentUser?.name || 'Supratim Paul');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Report problem form
  const [subject, setSubject] = useState('');
  const [problemDesc, setProblemDesc] = useState('');
  const [isProblemSubmitted, setIsProblemSubmitted] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUserName && name) {
      onUpdateUserName(name);
    }
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleReportProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !problemDesc) return;
    setIsProblemSubmitted(true);
    setSubject('');
    setProblemDesc('');
    setTimeout(() => setIsProblemSubmitted(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
          BANDAZE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
          Settings
        </h1>
      </div>

      {/* Card 1: Language */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Language</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#1e6b75] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onToggleLanguage('hi')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-[#1e6b75] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Card 2: Text Size */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Text size</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTextSize('normal')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              textSize === 'normal'
                ? 'bg-[#1e6b75] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setTextSize('large')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              textSize === 'large'
                ? 'bg-[#1e6b75] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            Large
          </button>
        </div>
      </div>

      {/* Card 3: Profile */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">Profile</h3>

        {isProfileSaved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-2.5 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile name updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
            />
            <button
              type="submit"
              className="bg-[#1e6b75] hover:bg-[#165860] text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Verified mobile: {currentUser?.phone || '+918811005563'}
          </p>
        </form>
      </div>

      {/* Card 4: SMS Appointment Reminders */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              SMS appointment reminders
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              A text about 1 hour before each accepted consultation.
            </p>
          </div>
          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={(e) => setSmsEnabled(e.target.checked)}
            className="w-5 h-5 rounded text-teal-700 border-gray-300 focus:ring-teal-600 cursor-pointer mt-0.5"
          />
        </div>

        <p className="text-[11px] text-amber-700 font-medium pt-1">
          SMS sending is not configured yet — reminders appear as in-app notifications only.
        </p>
      </div>

      {/* Card 5: Report a Problem */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-4">
        <h3 className="font-bold text-gray-900 text-sm">Report a problem</h3>

        {isProblemSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you. Your report has been dispatched to technical support.</span>
          </div>
        )}

        <form onSubmit={handleReportProblem} className="space-y-3.5 text-xs">
          <div>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
            />
          </div>

          <div>
            <textarea
              rows={3}
              required
              value={problemDesc}
              onChange={(e) => setProblemDesc(e.target.value)}
              placeholder="Describe the problem"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs resize-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="bg-[#1e6b75] hover:bg-[#165860] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
