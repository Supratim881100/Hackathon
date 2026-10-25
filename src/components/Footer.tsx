import React from 'react';
import { HeartPulse, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenEmergency: () => void;
  onOpenAiChat: () => void;
  setActiveView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenEmergency,
  onOpenAiChat,
  setActiveView
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-1">
            <div className="inline-block bg-white rounded-2xl px-4 py-2 shadow-xs mb-3">
              <img
                src="/assets/aistudio/BANDAZE_transparent_06792d84.png"
                alt="BANDAZE — Bandaging the Gap of Healthcare"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Bridging the gap between patients, verified medical practitioners, and accredited healthcare institutions.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>EZIOX Institutional Verification Standard</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Patient Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveView('directory')}
                  className="hover:text-white transition-colors"
                >
                  Verified Doctor Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('patient-records')}
                  className="hover:text-white transition-colors"
                >
                  Health Records Vault
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAiChat}
                  className="hover:text-white transition-colors"
                >
                  BANDAZE AI CareGuide
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEmergency}
                  className="text-rose-400 hover:text-rose-300 transition-colors font-medium"
                >
                  Emergency SOS Dispatch
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Provider Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveView('doctor-dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Doctor Credentialing & Practice
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('hospital-dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Hospital & Clinic Operations
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('eziox-admin')}
                  className="hover:text-amber-300 transition-colors text-amber-400/90"
                >
                  EZIOX Verification Center (Restricted)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Clinical Integrity Notice
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              BANDAZE is a technology platform for medical appointment discovery and clinical document verification. All medical diagnoses and treatments are delivered independently by verified physicians. In the event of acute trauma, chest pain, or life-threatening symptoms, dial local emergency services (911) immediately.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 BANDAZE Healthcare Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>HIPAA-Aligned Architecture</span>
            <span aria-hidden="true">·</span>
            <span>EZIOX Primary-Source Auditing</span>
            <span aria-hidden="true">·</span>
            <span>Confidential Medical Records</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
