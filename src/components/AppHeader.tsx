import React, { useState } from 'react';
import { Menu, Bell, Check, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { User, AdminNotification } from '../types/index.ts';

interface AppHeaderProps {
  currentUser: User | null;
  onOpenMobileMenu: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: (lang: 'en' | 'hi') => void;
  notifications: AdminNotification[];
  onOpenLogin: () => void;
  onSwitchUser?: (userId: string, targetView?: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  onOpenMobileMenu,
  language,
  onToggleLanguage,
  notifications,
  onOpenLogin,
  onSwitchUser
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Compute initials
  const getInitials = (name?: string) => {
    if (!name) return 'SP';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const unreadNotifs = notifications.filter(n => !n.isRead);

  return (
    <header className="sticky top-0 z-30 bg-[#f9fbfb]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-gray-100">
      {/* Left Mobile Toggle & Mobile Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl shadow-xs cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <img
          src="/assets/aistudio/BANDAZE_transparent_06792d84.png"
          alt="BANDAZE"
          className="h-11 sm:h-12 w-auto object-contain lg:hidden select-none"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Language Switcher Pill */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200/80 shadow-2xs">
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              language === 'en'
                ? 'bg-[#1e6b75] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onToggleLanguage('hi')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              language === 'hi'
                ? 'bg-[#1e6b75] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Notification Bell Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-700 hover:text-teal-800 hover:border-teal-300 transition-all cursor-pointer relative"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Notifications ({unreadNotifs.length})
                </span>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-teal-700 hover:underline"
                >
                  Close
                </button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-2.5 text-xs">
                      <p className="font-semibold text-gray-800">{n.title}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="w-10 h-10 rounded-full bg-[#1b5e67] hover:bg-[#144950] text-white font-bold text-sm flex items-center justify-center shadow-xs transition-all cursor-pointer ring-2 ring-transparent hover:ring-teal-200"
            title={currentUser ? currentUser.name : 'User Profile'}
          >
            {getInitials(currentUser?.name)}
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {currentUser?.name || 'Supratim Paul'}
                </p>
                <p className="text-xs text-teal-700 capitalize mt-0.5 font-medium">
                  {currentUser?.role || 'Patient'} Account
                </p>
                {currentUser?.phone && (
                  <p className="text-[11px] text-gray-500 mt-0.5">{currentUser.phone}</p>
                )}
              </div>

              {/* Quick Persona Switcher for Verification & Testing */}
              <div className="p-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-2 block">
                  Quick Switch Role
                </span>
                <button
                  onClick={() => {
                    onSwitchUser?.('patient_supratim_paul', 'home');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between"
                >
                  <span>Patient (Supratim Paul)</span>
                  {currentUser?.role === 'patient' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
                <button
                  onClick={() => {
                    onSwitchUser?.('doc_sarah_connor', 'doctor-dashboard');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between"
                >
                  <span>Doctor (Dr. Sarah Connor)</span>
                  {currentUser?.role === 'doctor' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
                <button
                  onClick={() => {
                    onSwitchUser?.('hosp_apex_heart', 'hospital-dashboard');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between"
                >
                  <span>Hospital (Apex Trauma)</span>
                  {currentUser?.role === 'hospital' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
                <button
                  onClick={() => {
                    onSwitchUser?.('admin_elena_vance', 'eziox-admin');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between"
                >
                  <span>EZIOX Admin (Dr. Elena Vance)</span>
                  {currentUser?.role === 'admin' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              </div>

              <div className="pt-1 mt-1 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Switch Account / Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
