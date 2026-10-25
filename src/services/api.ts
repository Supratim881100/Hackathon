import {
  User,
  DoctorUser,
  HospitalUser,
  VerificationApplication,
  AdminNotification,
  Appointment,
  HealthRecord,
  MedicineReminder,
  TraumaCenter,
  NearbyCareFacility
} from '../types/index.ts';

// Get current active user from localStorage or default
export function getStoredUserId(): string {
  return localStorage.getItem('bandaze_user_id') || 'patient_supratim_paul';
}

export function setStoredUserId(id: string) {
  localStorage.setItem('bandaze_user_id', id);
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-bandaze-user-id': getStoredUserId()
  };
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    const data = await res.json();
    return data.user || null;
  },

  async switchDemo(id?: string, role?: string): Promise<User> {
    const res = await fetch('/api/auth/switch-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to switch demo user');
    setStoredUserId(data.user.id);
    return data.user;
  },

  async register(payload: any): Promise<User> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setStoredUserId(data.user.id);
    return data.user;
  },

  async bootstrapAdminInvite(payload: {
    inviteToken: string;
    name: string;
    email: string;
    adminTitle: string;
    badgeNumber?: string;
  }): Promise<User> {
    const res = await fetch('/api/admin/bootstrap-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Bootstrap failed');
    return data.user;
  },

  // Dedicated Doctor Registration
  async registerDoctor(payload: any): Promise<DoctorUser> {
    const res = await fetch('/api/doctors/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Doctor registration failed');
    setStoredUserId(data.doctor.id);
    return data.doctor;
  },

  // Public Verified Doctor Directory (Strictly verified & active only)
  async getPublicDoctors(params?: {
    specialty?: string;
    mode?: string;
    search?: string;
  }): Promise<{ doctors: DoctorUser[]; totalVerified: number }> {
    const query = new URLSearchParams();
    if (params?.specialty) query.set('specialty', params.specialty);
    if (params?.mode) query.set('mode', params.mode);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/doctors/public?${query.toString()}`);
    return res.json();
  },

  // Directory
  async getVerifiedDirectory(params?: {
    specialty?: string;
    location?: string;
    availabilityOnly?: boolean;
    search?: string;
    type?: string;
  }): Promise<{ doctors: DoctorUser[]; hospitals: HospitalUser[]; totalVerified: number }> {
    const query = new URLSearchParams();
    if (params?.specialty) query.set('specialty', params.specialty);
    if (params?.location) query.set('location', params.location);
    if (params?.availabilityOnly) query.set('availabilityOnly', 'true');
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);

    const res = await fetch(`/api/providers/directory?${query.toString()}`);
    return res.json();
  },

  // Provider Updates
  async updateDoctorProfile(payload: Partial<DoctorUser>): Promise<DoctorUser> {
    const res = await fetch('/api/providers/doctor-profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data.doctor;
  },

  async uploadVerificationDocument(payload: {
    title: string;
    type: string;
    fileUrl?: string;
  }): Promise<any> {
    const res = await fetch('/api/providers/upload-document', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload document');
    return data;
  },

  // EZIOX Admin
  async getAdminApplications(params?: { status?: string; type?: string }): Promise<{
    applications: VerificationApplication[];
    counts: { total: number; pending: number; verified: number; needsInfo: number; rejected: number };
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);

    const res = await fetch(`/api/admin/applications?${query.toString()}`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Admin access forbidden');
    }
    return res.json();
  },

  async getApplicationDetail(id: string): Promise<{ application: VerificationApplication; provider: User }> {
    const res = await fetch(`/api/admin/applications/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch application');
    }
    return res.json();
  },

  async reviewApplication(
    id: string,
    action: 'approve' | 'reject' | 'request_info' | 'suspend',
    notes: string,
    reason?: string
  ): Promise<any> {
    const res = await fetch(`/api/admin/applications/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, notes, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Review submission failed');
    return data;
  },

  async adminVerifyDoctor(
    id: string,
    action: 'approve' | 'reject' | 'request_info' | 'suspend',
    notes?: string,
    reason?: string
  ): Promise<any> {
    const res = await fetch(`/api/admin/doctors/${id}/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, notes, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Doctor verification action failed');
    return data;
  },

  async runAiAudit(id: string): Promise<any> {
    const res = await fetch(`/api/admin/applications/${id}/ai-audit`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI audit failed');
    return data;
  },

  async getAdminNotifications(): Promise<{ notifications: AdminNotification[]; unreadCount: number }> {
    const res = await fetch('/api/admin/notifications', {
      headers: getHeaders()
    });
    return res.json();
  },

  async markNotificationsRead(): Promise<void> {
    await fetch('/api/admin/notifications/mark-all-read', {
      method: 'POST',
      headers: getHeaders()
    });
  },

  // Multi-Mode Consultation Sessions & WebRTC Calling
  async createConsultation(payload: {
    doctorId: string;
    mode: string;
    reason?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    patientPhone?: string;
    clinicAddress?: string;
  }): Promise<any> {
    const res = await fetch('/api/consultations/create', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create consultation session');
    return data.session;
  },

  async getConsultation(id: string): Promise<any> {
    const res = await fetch(`/api/consultations/${id}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Consultation session not found');
    return data.session;
  },

  async sendConsultationSignal(id: string, type: 'offer' | 'answer' | 'ice', payload: any): Promise<any> {
    const res = await fetch(`/api/consultations/${id}/signal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ type, payload })
    });
    return res.json();
  },

  async getConsultationSignals(id: string, since?: string): Promise<any> {
    const url = since ? `/api/consultations/${id}/signals?since=${encodeURIComponent(since)}` : `/api/consultations/${id}/signals`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async endConsultation(id: string, doctorNotes?: string, prescriptionNotes?: string): Promise<any> {
    const res = await fetch(`/api/consultations/${id}/end`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ doctorNotes, prescriptionNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to end consultation');
    return data.session;
  },

  async getConsultationMessages(id: string): Promise<any[]> {
    const res = await fetch(`/api/consultations/${id}/messages`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.messages || [];
  },

  async sendConsultationMessage(id: string, text: string): Promise<any> {
    const res = await fetch(`/api/consultations/${id}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data.message;
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch('/api/appointments', { headers: getHeaders() });
    const data = await res.json();
    return data.appointments || [];
  },

  async createAppointment(payload: {
    doctorId: string;
    date: string;
    time: string;
    type?: string;
    reason?: string;
    patientPhone?: string;
  }): Promise<Appointment> {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to book appointment');
    return data.appointment;
  },

  async updateAppointmentStatus(
    id: string,
    status?: string,
    doctorNotes?: string,
    prescriptionNotes?: string
  ): Promise<Appointment> {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, doctorNotes, prescriptionNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update appointment');
    return data.appointment;
  },

  // Health Records
  async getRecords(): Promise<HealthRecord[]> {
    const res = await fetch('/api/records', { headers: getHeaders() });
    const data = await res.json();
    return data.records || [];
  },

  async addRecord(payload: {
    title: string;
    category: string;
    doctorOrClinic?: string;
    date?: string;
    fileName?: string;
    notes?: string;
    tags?: string[];
  }): Promise<HealthRecord> {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add record');
    return data.record;
  },

  // Medicine Reminders
  async getReminders(): Promise<MedicineReminder[]> {
    const res = await fetch('/api/reminders', { headers: getHeaders() });
    const data = await res.json();
    return data.reminders || [];
  },

  async addReminder(payload: {
    medicationName: string;
    dosage: string;
    instructions?: string;
    times?: string[];
    durationDays?: number;
  }): Promise<MedicineReminder> {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add reminder');
    return data.reminder;
  },

  async toggleReminder(id: string): Promise<MedicineReminder> {
    const res = await fetch(`/api/reminders/${id}/toggle`, {
      method: 'PUT',
      headers: getHeaders()
    });
    const data = await res.json();
    return data.reminder;
  },

  // Emergency Care
  async getTraumaCenters(): Promise<TraumaCenter[]> {
    const res = await fetch('/api/emergency/centers');
    const data = await res.json();
    return data.traumaCenters || [];
  },

  async triggerEmergencyDispatch(payload: {
    location?: string;
    emergencyType?: string;
    bloodGroup?: string;
    notes?: string;
  }): Promise<any> {
    const res = await fetch('/api/emergency/dispatch', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // AI Healthcare Chat
  async sendAiChat(message: string, history: { sender: string; text: string }[]): Promise<string> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI assistance failed');
    return data.reply;
  },

  // Emergency Profile
  async getEmergencyDetails(): Promise<any> {
    try {
      const stored = localStorage.getItem('bandaze_emergency_details');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return {
      contactName: 'manu tomar',
      contactNumber: '9460636567',
      bloodGroup: 'B+',
      addressLandmark: 'noida',
      keyConditions: '',
      allergies: ''
    };
  },

  async saveEmergencyDetails(details: any): Promise<any> {
    localStorage.setItem('bandaze_emergency_details', JSON.stringify(details));
    return details;
  },

  // Health Tracking Readings
  async getHealthReadings(): Promise<any[]> {
    try {
      const stored = localStorage.getItem('bandaze_health_readings');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return [];
  },

  async saveHealthReading(reading: any): Promise<any> {
    const readings = await this.getHealthReadings();
    readings.unshift(reading);
    localStorage.setItem('bandaze_health_readings', JSON.stringify(readings));
    return reading;
  },

  // Follow-ups
  async getFollowUps(): Promise<any[]> {
    try {
      const stored = localStorage.getItem('bandaze_follow_ups');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return [];
  },

  async addFollowUp(item: any): Promise<any> {
    const items = await this.getFollowUps();
    items.unshift(item);
    localStorage.setItem('bandaze_follow_ups', JSON.stringify(items));
    return item;
  },

  // Shared Reports
  async getSharedReports(): Promise<any[]> {
    try {
      const stored = localStorage.getItem('bandaze_shared_reports');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return [];
  },

  async addSharedReport(item: any): Promise<any> {
    const list = await this.getSharedReports();
    list.unshift(item);
    localStorage.setItem('bandaze_shared_reports', JSON.stringify(list));
    return item;
  },

  async revokeSharedReport(id: string): Promise<void> {
    const list = await this.getSharedReports();
    const filtered = list.filter((x: any) => x.id !== id);
    localStorage.setItem('bandaze_shared_reports', JSON.stringify(filtered));
  },

  // Nearby Healthcare Search (OSM & Live Providers)
  async getNearbyCare(params: {
    query?: string;
    radius?: string;
    category?: string;
    lat?: number;
    lon?: number;
  }): Promise<{
    success: boolean;
    query: string;
    location: { lat: number; lon: number; displayName: string };
    radiusKm: number;
    totalFound: number;
    filteredCount: number;
    categoryCounts: Record<string, number>;
    facilities: NearbyCareFacility[];
  }> {
    const q = new URLSearchParams();
    if (params.query) q.set('query', params.query);
    if (params.radius) q.set('radius', params.radius);
    if (params.category && params.category !== 'All') q.set('category', params.category);
    if (params.lat !== undefined) q.set('lat', params.lat.toString());
    if (params.lon !== undefined) q.set('lon', params.lon.toString());

    const res = await fetch(`/api/places/nearby?${q.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to retrieve nearby healthcare places');
    }
    return res.json();
  }
};

