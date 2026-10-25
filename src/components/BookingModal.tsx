import React, { useState } from 'react';
import { X, Calendar, Clock, Stethoscope, Building2, CheckCircle2, MapPin, ShieldCheck, Phone } from 'lucide-react';
import { DoctorUser } from '../types/index.ts';

interface BookingModalProps {
  doctor: DoctorUser | null;
  onClose: () => void;
  onConfirmBooking: (bookingData: {
    doctorId: string;
    date: string;
    time: string;
    type: string;
    reason: string;
    patientPhone: string;
    clinicAddress?: string;
  }) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  onClose,
  onConfirmBooking
}) => {
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState('In-Person Clinic Visit');
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!doctor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a brief reason for your consultation.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmBooking({
        doctorId: doctor.id,
        date,
        time,
        type,
        reason,
        patientPhone: phone,
        clinicAddress: doctor.clinicAddress || 'Sector 62 Medical Arcade, Noida'
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit appointment request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTimeSlots = [
    '09:30 AM',
    '10:30 AM',
    '11:30 AM',
    '02:30 PM',
    '03:30 PM',
    '04:30 PM',
    '05:30 PM'
  ];

  const clinicFee = doctor.consultationFees?.clinic || doctor.consultationFee || 700;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Schedule In-Clinic Consultation</h3>
              <p className="text-[11px] text-slate-500">Verified doctor appointment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Summary Banner */}
        <div className="p-5 bg-teal-50/60 border-b border-teal-100 flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-sm truncate">{doctor.name}</h4>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>
            <p className="text-xs text-teal-800 font-semibold mt-0.5">{doctor.specialty}</p>
            
            <div className="mt-2 space-y-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{doctor.clinicAddress || 'Sector 62 Medical Arcade, Noida, UP'}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
                <span>Council: {doctor.registrationCouncil || 'Delhi Medical Council'}</span>
                <span>·</span>
                <span className="font-bold text-slate-900">Fee: ₹{clinicFee}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content / Form */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">In-Clinic Appointment Confirmed!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your appointment with <strong>{doctor.name}</strong> is confirmed. Please arrive 10 minutes prior to your slot.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-mono text-slate-700 max-w-xs mx-auto space-y-1">
              <div>Date & Time: <strong>{date} at {time}</strong></div>
              <div>Location: <strong>{doctor.clinicAddress || 'Sector 62 Medical Arcade, Noida'}</strong></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full text-xs px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="In-Person Clinic Visit">In-Person Clinic Visit</option>
                  <option value="Follow-up Consultation">Follow-up Clinical Visit</option>
                  <option value="Second Opinion Evaluation">Second Opinion Evaluation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Select Available Time Slot *</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Clinic Hours: {doctor.clinicHours || doctor.availableHours || '10:00 AM - 06:00 PM'}
                </span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      time === slot
                        ? 'bg-[#1e6b75] text-white border-[#1e6b75] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3 h-3 opacity-70" />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Visit / Symptoms *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Briefly describe what you would like to consult ${doctor.name} about...`}
                rows={2}
                required
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone for Confirmation *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#1e6b75] hover:bg-[#165860] active:scale-[0.99] rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Checking Schedule...' : `Confirm Clinic Visit (₹${clinicFee})`}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
