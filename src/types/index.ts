export type UserRole = 'patient' | 'doctor' | 'hospital' | 'admin';

export type VerificationStatus =
  | 'pending_verification'
  | 'pending'
  | 'needs_info'
  | 'verified'
  | 'rejected'
  | 'suspended';

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'rejected';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface PatientUser extends BaseUser {
  role: 'patient';
  age?: number;
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface VerificationDocument {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  submittedAt: string;
  verifiedBy?: string;
  notes?: string;
}

export interface ConsultationModes {
  video: boolean;
  voice: boolean;
  clinic: boolean;
  chat: boolean;
}

export interface ConsultationFees {
  video: number;
  voice: number;
  clinic: number;
  chat: number;
}

export interface DoctorUser extends BaseUser {
  role: 'doctor';
  specialty: string;
  qualifications: string;
  registrationNumber: string;
  registrationCouncil?: string;
  registrationState?: string;
  experienceYears: number;
  affiliation: string;
  clinicAddress?: string;
  clinicHours?: string;
  consultationFee: number; // legacy default or primary fee
  consultationModes?: ConsultationModes;
  consultationFees?: ConsultationFees;
  bio: string;
  verificationStatus: VerificationStatus;
  accountStatus?: AccountStatus;
  reviewerNotes?: string;
  rejectionReason?: string;
  suspensionReason?: string;
  isAvailable: boolean;
  availableDays: string[];
  availableHours: string;
  documents: VerificationDocument[];
}

export interface HospitalUser extends BaseUser {
  role: 'hospital';
  facilityType: 'Hospital' | 'Multi-specialty Clinic' | 'Diagnostic Center' | 'Trauma Center';
  licenseNumber: string;
  accreditation: string;
  emergencyHotline: string;
  address: string;
  city: string;
  totalBeds?: number;
  icuBedsAvailable?: number;
  services: string[];
  verificationStatus: VerificationStatus;
  reviewerNotes?: string;
  documents: VerificationDocument[];
  affiliatedDoctorIds: string[];
}

export interface EzioxAdminUser extends BaseUser {
  role: 'admin';
  adminTitle: string;
  badgeNumber: string;
  permissions: string[];
  isActive: boolean;
}

export type User = PatientUser | DoctorUser | HospitalUser | EzioxAdminUser;

export interface VerificationReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerTitle: string;
  action: 'approve' | 'reject' | 'request_info';
  notes: string;
  timestamp: string;
}

export interface AiAuditSummary {
  score: number;
  status: 'pass' | 'warning' | 'flagged';
  checklist: {
    item: string;
    passed: boolean;
    note: string;
  }[];
  analysis: string;
  analyzedAt: string;
}

export interface VerificationApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantType: 'doctor' | 'hospital';
  submittedAt: string;
  updatedAt: string;
  status: VerificationStatus;
  specialtyOrType: string;
  registrationNumber: string;
  affiliationOrAddress: string;
  documents: VerificationDocument[];
  aiAuditSummary?: AiAuditSummary;
  reviews: VerificationReview[];
}

export interface AdminNotification {
  id: string;
  type: 'new_application' | 'profile_update' | 'resubmission';
  title: string;
  message: string;
  providerId: string;
  providerName: string;
  providerType: 'doctor' | 'hospital';
  createdAt: string;
  isRead: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName?: string;
  date: string;
  time: string;
  type: 'In-Person Consultation' | 'Video Telehealth' | 'Follow-up';
  reason: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  doctorNotes?: string;
  prescriptionNotes?: string;
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  category: 'Lab Report' | 'Prescription' | 'Radiology / Scan' | 'Discharge Summary' | 'Vaccination';
  doctorOrClinic: string;
  date: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  notes?: string;
  tags: string[];
}

export interface MedicineReminder {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  times: string[];
  startDate: string;
  durationDays: number;
  takenToday: boolean;
  streakDays: number;
}

export interface TraumaCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  distance: string;
  hotline: string;
  openBeds: number;
  icuAvailable: boolean;
  bloodBankReady: boolean;
}

export interface HealthTrackingReading {
  id: string;
  type: 'Blood pressure' | 'Blood sugar' | 'Weight' | 'SpO2';
  value?: number;
  systolic?: number;
  diastolic?: number;
  unit: string;
  date: string;
}

export interface FollowUpItem {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface SharedReportItem {
  id: string;
  recordId: string;
  recordTitle: string;
  doctorId: string;
  doctorName: string;
  accessType: 'View only' | 'Full access';
  expiresIn: string;
  sharedDate: string;
}

export interface EmergencyDetails {
  contactName: string;
  contactNumber: string;
  bloodGroup: string;
  addressLandmark: string;
  keyConditions?: string;
  allergies?: string;
}

export type MedicalCareCategory =
  | 'All'
  | 'Hospitals'
  | 'Clinics'
  | 'Diagnostic Labs'
  | 'Blood Banks'
  | 'Pharmacies';

export interface NearbyCareFacility {
  id: string;
  name: string;
  category: 'Hospitals' | 'Clinics' | 'Diagnostic Labs' | 'Blood Banks' | 'Pharmacies';
  rawType?: string;
  address: string;
  city?: string;
  distanceKm: number;
  distance: string;
  phone?: string;
  openHours: string;
  emergencyReady: boolean;
  lat: number;
  lon: number;
  source: 'OpenStreetMap' | 'BANDAZE Directory';
  osmId?: string | number;
  osmType?: string;
  website?: string;
}

export type ConsultationMode = 'video' | 'voice' | 'clinic' | 'chat';

export interface ConsultationSession {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  mode: ConsultationMode;
  fee: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  scheduledDate?: string;
  scheduledTime?: string;
  reason?: string;
  clinicAddress?: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  doctorNotes?: string;
  prescriptionNotes?: string;
  // WebRTC signaling mailbox
  signaling?: {
    offers: Array<{ sender: string; sdp: any; timestamp: string }>;
    answers: Array<{ sender: string; sdp: any; timestamp: string }>;
    iceCandidates: Array<{ sender: string; candidate: any; timestamp: string }>;
  };
}

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor';
  text: string;
  timestamp: string;
}
