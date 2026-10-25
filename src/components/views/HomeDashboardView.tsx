import React from 'react';
import {
  Stethoscope,
  FileText,
  Share2,
  AlertCircle,
  Pill,
  MapPin,
  Activity,
  HeartPulse,
  Bot,
  Phone,
  FileCheck
} from 'lucide-react';
import { Appointment, HealthRecord, MedicineReminder } from '../../types/index.ts';

interface HomeDashboardViewProps {
  onNavigate: (view: string) => void;
  appointments: Appointment[];
  records: HealthRecord[];
  reminders: MedicineReminder[];
  onCall108: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigate,
  appointments,
  records,
  reminders,
  onCall108
}) => {
  const serviceCards = [
    {
      id: 'consult',
      title: 'Consult a Doctor',
      description: 'Find doctors and request a consultation',
      icon: Stethoscope,
    },
    {
      id: 'records',
      title: 'Health Records',
      description: 'Prescriptions, reports and history',
      icon: FileText,
    },
    {
      id: 'share',
      title: 'Share Reports',
      description: 'Share a report with a doctor',
      icon: Share2,
    },
    {
      id: 'emergency',
      title: 'Emergency',
      description: 'Emergency contacts and details',
      icon: AlertCircle,
    },
    {
      id: 'pharmacy',
      title: 'Medicine Locator',
      description: 'Pharmacies near you (OpenStreetMap)',
      icon: Pill,
    },
    {
      id: 'nearby',
      title: 'Nearby Care',
      description: 'Hospitals, clinics, labs',
      icon: MapPin,
    },
    {
      id: 'track',
      title: 'Health Tracking',
      description: 'Follow-ups and your own readings',
      icon: Activity,
    },
    {
      id: 'medicines',
      title: 'Medicine Reminders',
      description: 'Reminders for prescribed medicines',
      icon: HeartPulse,
    },
    {
      id: 'assistant',
      title: 'AI Health Assistant',
      description: 'Navigation help, not diagnosis',
      icon: Bot,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d2a30] tracking-tight">
          What do you need today?
        </h1>
      </div>

      {/* 9 Service Tiles (3x3 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {serviceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group flex flex-col justify-between h-40"
            >
              <div className="w-10 h-10 rounded-full bg-[#f0f9fa] text-[#1a6670] flex items-center justify-center group-hover:bg-[#1a6670] group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-800 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Bottom Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: UPCOMING CONSULTATION */}
        <div
          onClick={() => onNavigate('consult')}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs cursor-pointer hover:border-teal-200 transition-all flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1e6b75] mb-2.5">
              Upcoming Consultation
            </h4>
            {appointments.length > 0 ? (
              <div className="space-y-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {appointments[0].doctorName}
                </p>
                <p className="text-xs text-gray-500">
                  {appointments[0].date} at {appointments[0].time}
                </p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 capitalize border border-amber-200/50 mt-1">
                  {appointments[0].status}
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                No upcoming consultations.
              </p>
            )}
          </div>
        </div>

        {/* Card 2: TODAY'S REMINDERS */}
        <div
          onClick={() => onNavigate('medicines')}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs cursor-pointer hover:border-teal-200 transition-all flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1e6b75] mb-2.5">
              Today's Reminders
            </h4>
            {reminders.length > 0 ? (
              <div className="space-y-1.5">
                <p className="font-semibold text-gray-900 text-sm">
                  {reminders[0].medicationName} ({reminders[0].dosage})
                </p>
                <p className="text-xs text-gray-500">
                  {reminders[0].times.join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                No reminders yet.
              </p>
            )}
          </div>
        </div>

        {/* Card 3: RECENT RECORDS */}
        <div
          onClick={() => onNavigate('records')}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs cursor-pointer hover:border-teal-200 transition-all flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1e6b75] mb-2.5">
              Recent Records
            </h4>
            {records.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                <FileCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="truncate">{records[0].title}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>35 24 Oct 2026</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: EMERGENCY CALL 108 */}
        <div className="bg-[#fef2f2] rounded-2xl p-6 border border-[#fee2e2] shadow-2xs flex flex-col justify-between min-h-[160px]">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1">
              Emergency
            </h4>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Call 108
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              In an emergency, call 108 now. BANDAZE never dispatches an ambulance.
            </p>
          </div>

          <div className="mt-3">
            <button
              onClick={onCall108}
              className="bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.98] text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>108</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
