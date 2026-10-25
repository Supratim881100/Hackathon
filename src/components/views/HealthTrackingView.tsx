import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Activity,
  Plus,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { HealthTrackingReading, FollowUpItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export const HealthTrackingView: React.FC = () => {
  const [readings, setReadings] = useState<HealthTrackingReading[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);

  // Add reading form
  const [readingType, setReadingType] = useState<'Blood pressure' | 'Blood sugar' | 'Weight' | 'SpO2'>('Blood pressure');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [singleValue, setSingleValue] = useState('');

  // Add follow-up form
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const loadData = async () => {
    const r = await api.getHealthReadings();
    setReadings(r);
    const f = await api.getFollowUps();
    setFollowUps(f);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveReading = async (e: React.FormEvent) => {
    e.preventDefault();
    let newReading: HealthTrackingReading;

    if (readingType === 'Blood pressure') {
      if (!systolic || !diastolic) return;
      newReading = {
        id: `reading_${Date.now()}`,
        type: 'Blood pressure',
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        unit: 'mmHg',
        date: readingDate
      };
    } else {
      if (!singleValue) return;
      const unitMap = {
        'Blood sugar': 'mg/dL',
        'Weight': 'kg',
        'SpO2': '%'
      };
      newReading = {
        id: `reading_${Date.now()}`,
        type: readingType,
        value: Number(singleValue),
        unit: unitMap[readingType],
        date: readingDate
      };
    }

    await api.saveHealthReading(newReading);
    setSystolic('');
    setDiastolic('');
    setSingleValue('');
    await loadData();
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpTitle || !followUpDate) return;

    await api.addFollowUp({
      id: `fu_${Date.now()}`,
      title: followUpTitle,
      date: followUpDate,
      completed: false
    });
    setFollowUpTitle('');
    setFollowUpDate('');
    await loadData();
  };

  // Helper to get latest reading display
  const getLatest = (type: string) => {
    const list = readings.filter(r => r.type === type);
    if (list.length === 0) return null;
    const latest = list[0];
    if (type === 'Blood pressure') {
      return `${latest.systolic}/${latest.diastolic} mmHg`;
    }
    return `${latest.value} ${latest.unit}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1b646e] uppercase tracking-wider block">
          BANDAZE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e2c31] tracking-tight mt-0.5">
          Health Tracking
        </h1>
      </div>

      {/* Yellow Disclaimer Banner */}
      <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-4 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400e] leading-relaxed">
          These are readings YOU enter (self-reported). BANDAZE does not connect to devices and does not interpret values — discuss them with your doctor.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blood Pressure */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">Blood pressure</h4>
          <div className="text-xl font-extrabold text-gray-800">
            {getLatest('Blood pressure') || '— mmHg'}
          </div>
          <p className="text-[11px] text-gray-400">
            {readings.filter(r => r.type === 'Blood pressure').length >= 2
              ? `${readings.filter(r => r.type === 'Blood pressure').length} readings recorded`
              : 'Add 2+ readings to see a trend'}
          </p>
        </div>

        {/* Card 2: Blood Sugar */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">Blood sugar</h4>
          <div className="text-xl font-extrabold text-gray-800">
            {getLatest('Blood sugar') || '— mg/dL'}
          </div>
          <p className="text-[11px] text-gray-400">
            {readings.filter(r => r.type === 'Blood sugar').length >= 2
              ? `${readings.filter(r => r.type === 'Blood sugar').length} readings recorded`
              : 'Add 2+ readings to see a trend'}
          </p>
        </div>

        {/* Card 3: Weight */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">Weight</h4>
          <div className="text-xl font-extrabold text-gray-800">
            {getLatest('Weight') || '— kg'}
          </div>
          <p className="text-[11px] text-gray-400">
            {readings.filter(r => r.type === 'Weight').length >= 2
              ? `${readings.filter(r => r.type === 'Weight').length} readings recorded`
              : 'Add 2+ readings to see a trend'}
          </p>
        </div>

        {/* Card 4: SpO2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">SpO₂</h4>
          <div className="text-xl font-extrabold text-gray-800">
            {getLatest('SpO2') || '— %'}
          </div>
          <p className="text-[11px] text-gray-400">
            {readings.filter(r => r.type === 'SpO2').length >= 2
              ? `${readings.filter(r => r.type === 'SpO2').length} readings recorded`
              : 'Add 2+ readings to see a trend'}
          </p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Add a reading */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-gray-900 text-base">
            Add a reading
          </h3>

          <form onSubmit={handleSaveReading} className="space-y-4 text-xs">
            {/* Row 1: Type and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={readingType}
                  onChange={(e) => setReadingType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                >
                  <option value="Blood pressure">Blood pressure</option>
                  <option value="Blood sugar">Blood sugar</option>
                  <option value="Weight">Weight</option>
                  <option value="SpO2">SpO₂</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={readingDate}
                  onChange={(e) => setReadingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                />
              </div>
            </div>

            {/* Row 2: Inputs */}
            {readingType === 'Blood pressure' ? (
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Systolic
                  </label>
                  <input
                    type="number"
                    required
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Diastolic
                  </label>
                  <input
                    type="number"
                    required
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {readingType} Value ({readingType === 'Blood sugar' ? 'mg/dL' : readingType === 'Weight' ? 'kg' : '%'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={singleValue}
                  onChange={(e) => setSingleValue(e.target.value)}
                  placeholder="Enter reading"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.98] text-white font-semibold py-2.5 px-6 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Save reading
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Follow-ups */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-150 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-gray-900 text-base">
            Follow-ups
          </h3>

          {followUps.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium">
                No follow-ups yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {followUps.map((fu) => (
                <div
                  key={fu.id}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-800">{fu.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Date: {fu.date}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-100">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add Follow-up Form */}
          <form onSubmit={handleAddFollowUp} className="pt-2 border-t border-gray-100 text-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
              <div className="flex-1">
                <label className="block font-semibold text-gray-700 mb-1">
                  Follow-up
                </label>
                <input
                  type="text"
                  required
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  placeholder="e.g. Check blood pressure with Dr. Ananya"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                />
              </div>

              <button
                type="submit"
                className="bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.98] text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap self-stretch sm:self-auto"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
