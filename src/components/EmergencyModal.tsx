import React, { useState, useEffect } from 'react';
import {
  X,
  PhoneCall,
  AlertOctagon,
  Ambulance,
  MapPin,
  Clock,
  Heart,
  Droplet,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { TraumaCenter } from '../types/index.ts';
import { api } from '../services/api.ts';

interface EmergencyModalProps {
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose }) => {
  const [traumaCenters, setTraumaCenters] = useState<TraumaCenter[]>([]);
  const [emergencyType, setEmergencyType] = useState('Cardiac / Chest Pain');
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [contactNotified, setContactNotified] = useState(false);

  useEffect(() => {
    api.getTraumaCenters().then(setTraumaCenters).catch(console.error);
  }, []);

  const handleTriggerSOS = async () => {
    setIsDispatching(true);
    try {
      const res = await api.triggerEmergencyDispatch({
        location: 'Current Geolocation (40.7589° N, 73.9851° W - Midtown Manhattan)',
        emergencyType,
        bloodGroup: 'O+ (from Patient Profile)'
      });
      setDispatchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-rose-300 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                BANDAZE Emergency Response & Trauma Triage
              </h3>
              <p className="text-xs text-rose-100">
                Direct CAD Ambulance Dispatch & Trauma Center Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Dispatch State */}
          {dispatchResult ? (
            <div className="p-5 bg-rose-50 border border-rose-300 rounded-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded font-bold">
                    PRIORITY 1 DISPATCH ACTIVATED
                  </span>
                  <h4 className="font-extrabold text-lg text-rose-950 mt-1">
                    Emergency Unit En Route
                  </h4>
                  <p className="text-xs text-rose-800">
                    Dispatch Reference: <span className="font-mono font-bold">{dispatchResult.dispatchId}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-rose-700 font-mono">
                    ~{dispatchResult.etaMinutes} MIN
                  </div>
                  <span className="text-[10px] text-rose-600 font-medium">Estimated Paramedic ETA</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-rose-200">
                <div>
                  <span className="text-slate-500 text-[11px]">Assigned Unit:</span>
                  <p className="font-semibold text-slate-900">{dispatchResult.assignedAmbulanceUnit}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Designated Trauma Facility:</span>
                  <p className="font-semibold text-slate-900">{dispatchResult.nearestCenter}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-rose-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Paramedic Instructions:</p>
                {dispatchResult.instructions?.map((inst: string, idx: number) => (
                  <p key={idx} className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{inst}</span>
                  </p>
                ))}
              </div>

              {/* Notify Emergency Contact */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setContactNotified(true)}
                  disabled={contactNotified}
                  className={`text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    contactNotified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {contactNotified ? 'Spouse Alerted with Live GPS Tracker' : 'Broadcast Live GPS Alert to Emergency Contact'}
                </button>
              </div>
            </div>
          ) : (
            /* SOS Trigger Box */
            <div className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                      Immediate Clinical Response
                    </span>
                    <h4 className="text-xl font-extrabold text-white">
                      Request Priority ALS Ambulance
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Direct GPS telemetry transmission to local emergency medical services.
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerSOS}
                    disabled={isDispatching}
                    className="px-6 py-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shrink-0"
                  >
                    <Ambulance className="w-5 h-5 text-white animate-bounce" />
                    {isDispatching ? 'Transmitting CAD...' : 'TRIGGER SOS DISPATCH'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Emergency Chief Complaint
                    </label>
                    <select
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="Cardiac / Chest Pain">Cardiac / Severe Chest Pressure</option>
                      <option value="Stroke Warning Signs (FAST)">Acute Stroke Signs (FAST)</option>
                      <option value="Severe Trauma / Hemorrhage">Major Trauma or Hemorrhage</option>
                      <option value="Acute Respiratory Distress">Severe Respiratory Distress</option>
                      <option value="Anaphylaxis / Allergic Reaction">Anaphylactic Shock</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Registered Triage Profile
                    </label>
                    <div className="px-3 py-2 bg-slate-800 rounded-lg text-slate-300 flex items-center justify-between font-mono">
                      <span>Blood Type: O+</span>
                      <span className="text-amber-400">Allergies: Penicillin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nearest Accredited Trauma Facilities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Nearest Accredited Trauma Centers (Live Bed & ICU Status)
              </h4>
              <span className="text-[11px] text-slate-500">Live Hospital Telemetry</span>
            </div>

            <div className="space-y-3">
              {traumaCenters.map((tc) => (
                <div
                  key={tc.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{tc.name}</span>
                      <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {tc.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {tc.address} ({tc.distance})
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {tc.openBeds} Open ER Beds
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] pt-1">
                      <span className={`flex items-center gap-1 ${tc.icuAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <Heart className="w-3 h-3" />
                        {tc.icuAvailable ? 'ICU Beds Ready' : 'ICU At Capacity'}
                      </span>
                      <span className={`flex items-center gap-1 ${tc.bloodBankReady ? 'text-rose-700' : 'text-slate-400'}`}>
                        <Droplet className="w-3 h-3" />
                        {tc.bloodBankReady ? 'Blood Bank O+ Stocked' : 'Blood Bank Standby'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`tel:${tc.hotline}`}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shrink-0 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                    <span>Call Hotline: {tc.hotline}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick First-Aid Protocols */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h5 className="font-bold text-slate-900 mb-2">Essential First-Aid Reminder while help arrives:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">1. Chest Pain</span>
                <span>Rest in comfortable sitting posture. Do not allow patient to exert themselves.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">2. Severe Bleeding</span>
                <span>Apply continuous firm direct pressure with clean gauze or towel without releasing.</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">3. Unconscious</span>
                <span>Check breathing. If absent, begin chest compressions immediately at 100-120 bpm.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
