import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  HeartPulse,
  User as UserIcon,
  Stethoscope,
  Building2,
  Lock,
  ChevronDown,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { User, AdminNotification } from '../types/index.ts';

interface NavbarProps {
  currentUser: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAuth: (defaultRole?: string) => void;
  onOpenAiChat: () => void;
  onOpenEmergency: () => void;
  notifications: AdminNotification[];
  onMarkNotificationsRead: () => void;
  onSwitchUser: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenAuth,
  onOpenAiChat,
  onOpenEmergency,
  notifications,
  onMarkNotificationsRead,
  onSwitchUser
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  // Role display helpers
  const getRoleLabel = () => {
    if (!currentUser) return 'Sign In';
    switch (currentUser.role) {
      case 'patient':
        return `Patient: ${currentUser.name.split(' ')[0]}`;
      case 'doctor':
        return `Dr. ${currentUser.name.replace(/^Dr\.\s*/i, '').split(' ')[0]}`;
      case 'hospital':
        return currentUser.name.length > 18 ? `${currentUser.name.slice(0, 15)}...` : currentUser.name;
      case 'admin':
        return 'EZIOX Auditor';
    }
  };

  const getRoleBadgeColor = () => {
    if (!currentUser) return 'text-slate-600 bg-slate-100';
    switch (currentUser.role) {
      case 'patient':
        return 'text-sky-700 bg-sky-50 border border-sky-200';
      case 'doctor':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'hospital':
        return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
      case 'admin':
        return 'text-amber-800 bg-amber-50 border border-amber-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-8">
          
          {/* Zone 1: Authentic Uploaded Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center text-left group cursor-pointer focus:outline-none py-1"
            >
              <img
                src="/assets/aistudio/BANDAZE_transparent_06792d84.png"
                alt="BANDAZE — Bandaging the Gap of Healthcare"
                className="h-13 sm:h-14 w-auto object-contain transition-transform group-hover:scale-102"
              />
            </button>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('directory')}
              className={`hover:text-sky-600 transition-colors whitespace-nowrap ${
                activeView === 'directory' ? 'text-sky-600 font-semibold' : ''
              }`}
            >
              Verified Directory
            </button>

            {currentUser?.role === 'patient' && (
              <>
                <button
                  onClick={() => setActiveView('patient-dashboard')}
                  className={`hover:text-sky-600 transition-colors whitespace-nowrap ${
                    activeView === 'patient-dashboard' ? 'text-sky-600 font-semibold' : ''
                  }`}
                >
                  My Health Portal
                </button>
                <button
                  onClick={() => setActiveView('patient-records')}
                  className={`hover:text-sky-600 transition-colors whitespace-nowrap ${
                    activeView === 'patient-records' ? 'text-sky-600 font-semibold' : ''
                  }`}
                >
                  Health Records
                </button>
              </>
            )}

            {currentUser?.role === 'doctor' && (
              <button
                onClick={() => setActiveView('doctor-dashboard')}
                className={`hover:text-sky-600 transition-colors whitespace-nowrap ${
                  activeView === 'doctor-dashboard' ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                Doctor Practice Portal
              </button>
            )}

            {currentUser?.role === 'hospital' && (
              <button
                onClick={() => setActiveView('hospital-dashboard')}
                className={`hover:text-sky-600 transition-colors whitespace-nowrap ${
                  activeView === 'hospital-dashboard' ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                Hospital Operations
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveView('eziox-admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors whitespace-nowrap font-semibold ${
                  activeView === 'eziox-admin' ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                EZIOX Verification Center
              </button>
            )}

            <button
              onClick={onOpenAiChat}
              className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              AI CareGuide
            </button>
          </nav>

          {/* Zone 3: Primary Actions, Emergency & Role Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 1-Click Emergency SOS Button */}
            <button
              onClick={onOpenEmergency}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
              title="Immediate Emergency Triage & Dispatch"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span className="hidden sm:inline">Emergency</span> SOS
            </button>

            {/* Admin Notifications Popover (if Admin) */}
            {currentUser?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    if (!showNotifMenu) onMarkNotificationsRead();
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative transition-colors"
                  aria-label="Admin Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-900">EZIOX Verification Feed</span>
                      <span className="text-[11px] text-slate-500">{notifications.length} alerts</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-slate-400 py-4 text-center">No new verification submissions</p>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setActiveView('eziox-admin');
                              setShowNotifMenu(false);
                            }}
                            className="p-2 hover:bg-slate-50 rounded cursor-pointer border border-slate-100"
                          >
                            <p className="font-semibold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current Identity / Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${getRoleBadgeColor()}`}
              >
                <span>{getRoleLabel()}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Quick Experience Switcher</p>
                    <p className="text-[11px] text-slate-500">Test all three login experiences & EZIOX admin</p>
                  </div>

                  <div className="py-1 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        onSwitchUser('patient_david_miller');
                        setActiveView('patient-dashboard');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 flex items-center gap-2.5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-sky-600" />
                      <div>
                        <p className="font-semibold text-slate-800">Patient: David Miller</p>
                        <p className="text-[10px] text-slate-500">Records, reminders, booking & triage</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchUser('doc_sarah_connor');
                        setActiveView('doctor-dashboard');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-slate-800">Doctor: Dr. Sarah Connor</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Verified Cardiologist · Active</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchUser('doc_michael_torres');
                        setActiveView('doctor-dashboard');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Stethoscope className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-semibold text-slate-800">Doctor: Dr. Michael Torres</p>
                        <p className="text-[10px] text-amber-600 font-medium">Pending EZIOX Verification</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchUser('hosp_apex_heart');
                        setActiveView('hospital-dashboard');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-slate-800">Hospital: Apex Heart Pavilion</p>
                        <p className="text-[10px] text-indigo-600 font-medium">Level 1 Trauma Center</p>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <p className="px-3 py-1 text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                        EZIOX Verification Team
                      </p>
                      <button
                        onClick={() => {
                          onSwitchUser('admin_elena_vance');
                          setActiveView('eziox-admin');
                          setShowRoleMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <div>
                          <p className="font-semibold text-slate-800">Dr. Elena Vance, MD</p>
                          <p className="text-[10px] text-amber-700">Senior Credentialing Officer</p>
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setShowRoleMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sky-700 font-medium flex items-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Create New Public Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Register / Login CTA for visitors */}
            <button
              onClick={() => onOpenAuth()}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Sign Up
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
