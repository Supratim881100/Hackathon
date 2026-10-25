import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { AppHeader } from './components/AppHeader.tsx';
import { FloatingAiButton } from './components/FloatingAiButton.tsx';

// Views
import { HomeDashboardView } from './components/views/HomeDashboardView.tsx';
import { ConsultDoctorView } from './components/views/ConsultDoctorView.tsx';
import { HealthRecordsView } from './components/views/HealthRecordsView.tsx';
import { ShareReportsView } from './components/views/ShareReportsView.tsx';
import { EmergencyView } from './components/views/EmergencyView.tsx';
import { MedicineRemindersView } from './components/views/MedicineRemindersView.tsx';
import { MedicineLocatorView } from './components/views/MedicineLocatorView.tsx';
import { NearbyCareView } from './components/views/NearbyCareView.tsx';
import { HealthTrackingView } from './components/views/HealthTrackingView.tsx';
import { AiAssistantView } from './components/views/AiAssistantView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { LoginView } from './components/views/LoginView.tsx';

// Portal & Admin Views
import { DoctorDashboard } from './components/DoctorDashboard.tsx';
import { HospitalDashboard } from './components/HospitalDashboard.tsx';
import { EzioxAdminDashboard } from './components/EzioxAdminDashboard.tsx';

// Modals
import { BookingModal } from './components/BookingModal.tsx';
import { EmergencyModal } from './components/EmergencyModal.tsx';

// Types & Services
import {
  User,
  DoctorUser,
  HospitalUser,
  PatientUser,
  EzioxAdminUser,
  Appointment,
  HealthRecord,
  MedicineReminder,
  AdminNotification,
  UserRole
} from './types/index.ts';
import { api, getStoredUserId, setStoredUserId } from './services/api.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('home');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [hospitals, setHospitals] = useState<HospitalUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorUser | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Initial load
  const loadAppData = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);

      const dirData = await api.getVerifiedDirectory();
      setDoctors(dirData.doctors);
      setHospitals(dirData.hospitals);

      if (user) {
        const apts = await api.getAppointments();
        setAppointments(apts);

        const recs = await api.getRecords();
        setRecords(recs);

        const rems = await api.getReminders();
        setReminders(rems);

        if (user.role === 'admin') {
          const notifs = await api.getAdminNotifications();
          setNotifications(notifs.notifications);
        }
      }
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // Quick Persona / Role Switcher
  const handleSwitchUser = async (userId: string, targetView?: string) => {
    try {
      setLoading(true);
      const switchedUser = await api.switchDemo(userId);
      setCurrentUser(switchedUser);
      setStoredUserId(switchedUser.id);

      if (targetView) {
        setActiveView(targetView);
      } else {
        if (switchedUser.role === 'patient') setActiveView('home');
        else if (switchedUser.role === 'doctor') setActiveView('doctor-dashboard');
        else if (switchedUser.role === 'hospital') setActiveView('hospital-dashboard');
        else if (switchedUser.role === 'admin') setActiveView('eziox-admin');
      }

      await loadAppData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLoginSuccess = async (userId: string, role: UserRole) => {
    await handleSwitchUser(userId);
    if (role === 'patient') setActiveView('home');
    else if (role === 'doctor') setActiveView('doctor-dashboard');
    else if (role === 'hospital') setActiveView('hospital-dashboard');
  };

  // Booking confirmed
  const handleBookingConfirmed = async (bookingData: any) => {
    await api.createAppointment(bookingData);
    await loadAppData();
    setSelectedDoctorForBooking(null);
  };

  // Call 108 Emergency Trigger
  const handleCall108 = () => {
    setIsEmergencyModalOpen(true);
  };

  // Update User Profile Name
  const handleUpdateUserName = async (newName: string) => {
    if (currentUser) {
      const updated = { ...currentUser, name: newName };
      setCurrentUser(updated);
    }
  };

  // If on login view, render the split screen login layout
  if (activeView === 'login') {
    return (
      <LoginView
        language={language}
        onToggleLanguage={setLanguage}
        onLoginSuccess={handleLoginSuccess}
        onCall108={handleCall108}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fbfb] text-gray-900 flex font-sans selection:bg-teal-500 selection:text-white">
      {/* Deep Teal Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        isOpenOnMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentUserRole={currentUser?.role}
        onSwitchRole={(role) => {
          if (role === 'patient') handleSwitchUser('patient_supratim_paul', 'home');
          else if (role === 'doctor') handleSwitchUser('doc_sarah_connor', 'doctor-dashboard');
          else if (role === 'hospital') handleSwitchUser('hosp_apex_heart', 'hospital-dashboard');
          else if (role === 'admin') handleSwitchUser('admin_elena_vance', 'eziox-admin');
        }}
        onCall108={handleCall108}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <AppHeader
          currentUser={currentUser}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          language={language}
          onToggleLanguage={setLanguage}
          notifications={notifications}
          onOpenLogin={() => setActiveView('login')}
          onSwitchUser={handleSwitchUser}
        />

        {/* View Routing */}
        <main className="flex-1 p-4 sm:p-8">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-mono">Loading BANDAZE clinical network...</p>
            </div>
          ) : (
            <>
              {activeView === 'home' && (
                <HomeDashboardView
                  onNavigate={(v) => setActiveView(v)}
                  appointments={appointments}
                  records={records}
                  reminders={reminders}
                  onCall108={handleCall108}
                />
              )}

              {activeView === 'consult' && (
                <ConsultDoctorView
                  doctors={doctors}
                  onRequestBooking={(doc) => setSelectedDoctorForBooking(doc)}
                />
              )}

              {activeView === 'records' && (
                <HealthRecordsView
                  records={records}
                  onRefreshRecords={loadAppData}
                />
              )}

              {activeView === 'share' && (
                <ShareReportsView
                  records={records}
                  doctors={doctors}
                />
              )}

              {activeView === 'emergency' && (
                <EmergencyView />
              )}

              {activeView === 'medicines' && (
                <MedicineRemindersView
                  reminders={reminders}
                  onRefreshReminders={loadAppData}
                />
              )}

              {activeView === 'pharmacy' && (
                <MedicineLocatorView />
              )}

              {activeView === 'nearby' && (
                <NearbyCareView
                  hospitals={hospitals}
                  onCall108={handleCall108}
                />
              )}

              {activeView === 'track' && (
                <HealthTrackingView />
              )}

              {activeView === 'assistant' && (
                <AiAssistantView />
              )}

              {activeView === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  language={language}
                  onToggleLanguage={setLanguage}
                  onUpdateUserName={handleUpdateUserName}
                />
              )}

              {/* Doctor Dashboard */}
              {activeView === 'doctor-dashboard' && (
                <DoctorDashboard
                  doctor={
                    currentUser?.role === 'doctor'
                      ? (currentUser as DoctorUser)
                      : doctors[0] || ({} as DoctorUser)
                  }
                  appointments={appointments}
                  patientRecords={records}
                  onRefreshData={loadAppData}
                />
              )}

              {/* Hospital Dashboard */}
              {activeView === 'hospital-dashboard' && (
                <HospitalDashboard
                  hospital={
                    currentUser?.role === 'hospital'
                      ? (currentUser as HospitalUser)
                      : hospitals[0] || ({} as HospitalUser)
                  }
                  affiliatedDoctors={doctors}
                  onRefreshData={loadAppData}
                />
              )}

              {/* EZIOX Admin Panel */}
              {activeView === 'eziox-admin' && (
                <EzioxAdminDashboard
                  currentAdmin={
                    currentUser?.role === 'admin'
                      ? (currentUser as EzioxAdminUser)
                      : {
                          id: 'admin_elena_vance',
                          name: 'Dr. Elena Vance, MD',
                          email: 'dr.elena.vance@eziox.health',
                          role: 'admin',
                          adminTitle: 'Senior Medical Credentialing Officer',
                          badgeNumber: 'EZX-CRED-01',
                          permissions: ['verify_doctor', 'verify_hospital', 'manage_reviewers', 'audit_logs'],
                          isActive: true,
                          createdAt: '2026-01-10T08:00:00Z'
                        }
                  }
                  onRefreshData={loadAppData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Action Button for AI Assistant (hidden on assistant and login view) */}
      {activeView !== 'assistant' && activeView !== 'login' && (
        <FloatingAiButton onClick={() => setActiveView('assistant')} />
      )}

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onConfirmBooking={handleBookingConfirmed}
        />
      )}

      {/* Emergency Modal */}
      {isEmergencyModalOpen && (
        <EmergencyModal
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      )}
    </div>
  );
}
