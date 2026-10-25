import React, { useState } from 'react';
import { AlertTriangle, Clock, Check, Trash2, Pill } from 'lucide-react';
import { MedicineReminder } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface MedicineRemindersViewProps {
  reminders: MedicineReminder[];
  onRefreshReminders: () => void;
}

export const MedicineRemindersView: React.FC<MedicineRemindersViewProps> = ({
  reminders,
  onRefreshReminders
}) => {
  const [medName, setMedName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;

    setIsSubmitting(true);
    try {
      await api.addReminder({
        medicationName: medName,
        dosage: schedule || '1 Tablet after meal',
        instructions: schedule || 'As prescribed',
        times: [time],
        durationDays: 14
      });
      setMedName('');
      setSchedule('');
      setTime('09:00 AM');
      onRefreshReminders();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleReminder(id);
      onRefreshReminders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
          BANDAZE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
          Medicine Reminders
        </h1>
      </div>

      {/* Yellow Disclaimer Banner */}
      <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-4 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400e] leading-relaxed">
          Reminders are saved to your account, but alerts appear only while this page is open. Background/SMS notifications are not enabled in this prototype. Add only medicines prescribed by your doctor.
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Today's Reminders */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1e6b75]">
            Today
          </h4>

          {reminders.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50/50">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                No reminders yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    rem.takenToday
                      ? 'bg-emerald-50/60 border-emerald-200 text-gray-500'
                      : 'bg-white border-gray-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(rem.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                        rem.takenToday
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-gray-300 hover:border-teal-600 bg-white'
                      }`}
                    >
                      {rem.takenToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          rem.takenToday ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {rem.medicationName}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {rem.dosage} · {rem.times.join(', ')}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      rem.takenToday
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-teal-50 text-teal-800 border border-teal-100'
                    }`}
                  >
                    {rem.takenToday ? 'Taken' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Add Reminder Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-4">
          <form onSubmit={handleSaveReminder} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Medicine name
              </label>
              <input
                type="text"
                required
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Prescribed schedule
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="As written on prescription"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Time
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs pr-10"
                />
                <Clock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save reminder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
