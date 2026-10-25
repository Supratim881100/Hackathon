import React from 'react';
import { BandazeLogo } from './BandazeLogo.tsx';
import {
  Home,
  Stethoscope,
  FileText,
  Share2,
  AlertCircle,
  HeartPulse,
  Pill,
  MapPin,
  Activity,
  Bot,
  Settings,
  Phone,
  ShieldCheck,
  Building2,
  UserCheck,
  X
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  currentUserRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onCall108: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isOpenOnMobile,
  onCloseMobile,
  currentUserRole,
  onSwitchRole,
  onCall108
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'consult', label: 'Consult a Doctor', icon: Stethoscope },
    { id: 'records', label: 'Health Records', icon: FileText },
    { id: 'share', label: 'Share Reports', icon: Share2 },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'medicines', label: 'Medicine Reminders', icon: HeartPulse },
    { id: 'pharmacy', label: 'Medicine Locator', icon: Pill },
    { id: 'nearby', label: 'Nearby Care', icon: MapPin },
    { id: 'track', label: 'Health Tracking', icon: Activity },
    { id: 'assistant', label: 'AI Health Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#10353a] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-[#194850] shadow-xl lg:shadow-none lg:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header with Logo */}
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => handleSelect('home')}
              className="flex-1 min-w-0 text-left focus:outline-none cursor-pointer"
            >
              <BandazeLogo />
            </button>
            <button
              onClick={onCloseMobile}
              className="lg:hidden shrink-0 p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#1b4e57] text-white font-semibold shadow-inner'
                    : 'text-[#8fadba] hover:text-white hover:bg-[#16424a]'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 flex-shrink-0 ${
                    isActive ? 'text-teal-300' : 'text-[#8fadba]'
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Role Portals Section (Discreet & Professional for Testing & Role Separation) */}
          <div className="pt-3 pb-1 border-t border-[#18444c] mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#638b93] px-3.5 block mb-1">
              Portals & Roles
            </span>
            <button
              onClick={() => handleSelect('doctor-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs transition-colors text-left ${
                activeView === 'doctor-dashboard'
                  ? 'bg-[#1b4e57] text-white font-semibold'
                  : 'text-[#8fadba] hover:text-white hover:bg-[#16424a]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Doctor Portal</span>
            </button>
            <button
              onClick={() => handleSelect('hospital-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs transition-colors text-left ${
                activeView === 'hospital-dashboard'
                  ? 'bg-[#1b4e57] text-white font-semibold'
                  : 'text-[#8fadba] hover:text-white hover:bg-[#16424a]'
              }`}
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Hospital & Clinic</span>
            </button>
            <button
              onClick={() => handleSelect('eziox-admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs transition-colors text-left ${
                activeView === 'eziox-admin'
                  ? 'bg-[#1b4e57] text-white font-semibold'
                  : 'text-[#8fadba] hover:text-white hover:bg-[#16424a]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>EZIOX Admin Panel</span>
            </button>
          </div>
        </div>

        {/* Bottom Red Emergency Button */}
        <div className="p-3 border-t border-[#18444c]/60">
          <button
            onClick={onCall108}
            className="w-full bg-[#dc2626] hover:bg-[#c81e1e] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-red-950/40 transition-all text-sm cursor-pointer"
          >
            <Phone className="w-4.5 h-4.5" strokeWidth={2.5} />
            <span>Call 108</span>
          </button>
        </div>
      </aside>
    </>
  );
};
