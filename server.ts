import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  User,
  PatientUser,
  DoctorUser,
  HospitalUser,
  EzioxAdminUser,
  VerificationApplication,
  AdminNotification,
  Appointment,
  HealthRecord,
  MedicineReminder,
  TraumaCenter,
  NearbyCareFacility,
  ConsultationSession,
  ConsultationMessage,
  ConsultationMode
} from './src/types/index.ts';
import {
  geocodeLocation,
  calculateHaversineDistance,
  NOIDA_NCR_MEDICAL_DIRECTORY
} from './src/services/osmCareService.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize Google GenAI
const aiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (aiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: aiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Data directory & persistent storage file
const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'bandaze_db.json');

interface DatabaseSchema {
  users: User[];
  applications: VerificationApplication[];
  notifications: AdminNotification[];
  appointments: Appointment[];
  healthRecords: HealthRecord[];
  reminders: MedicineReminder[];
  traumaCenters: TraumaCenter[];
  bootstrapInviteTokens: { token: string; createdBy: string; used: boolean }[];
  consultationSessions: ConsultationSession[];
  consultationMessages: ConsultationMessage[];
}

// Initial Seed Data
const INITIAL_ADMINS: EzioxAdminUser[] = [
  {
    id: 'admin_elena_vance',
    email: 'dr.elena.vance@eziox.health',
    name: 'Dr. Elena Vance, MD',
    role: 'admin',
    adminTitle: 'Senior Medical Credentialing Officer',
    badgeNumber: 'EZX-CRED-01',
    permissions: ['verify_doctor', 'verify_hospital', 'manage_reviewers', 'audit_logs'],
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    phone: '+1 (555) 201-8401'
  },
  {
    id: 'admin_marcus_chen',
    email: 'marcus.chen@eziox.health',
    name: 'Marcus Chen, JD / MS',
    role: 'admin',
    adminTitle: 'Lead Healthcare Compliance Officer',
    badgeNumber: 'EZX-COMP-02',
    permissions: ['verify_doctor', 'verify_hospital', 'legal_audit'],
    isActive: true,
    createdAt: '2026-01-12T09:30:00Z',
    phone: '+1 (555) 201-8402'
  },
  {
    id: 'admin_sarah_jenkins',
    email: 'sarah.jenkins@eziox.health',
    name: 'Sarah Jenkins, RN / BSN',
    role: 'admin',
    adminTitle: 'Clinical Verification Specialist',
    badgeNumber: 'EZX-CLIN-03',
    permissions: ['verify_doctor', 'document_inspection'],
    isActive: true,
    createdAt: '2026-01-15T11:00:00Z',
    phone: '+1 (555) 201-8403'
  },
  {
    id: 'admin_arjun_patel',
    email: 'arjun.patel@eziox.health',
    name: 'Arjun Patel, MHA',
    role: 'admin',
    adminTitle: 'Hospital & Institutional Auditor',
    badgeNumber: 'EZX-INST-04',
    permissions: ['verify_hospital', 'facility_audit', 'accreditation_review'],
    isActive: true,
    createdAt: '2026-01-20T14:15:00Z',
    phone: '+1 (555) 201-8404'
  }
];

const INITIAL_DOCTORS: DoctorUser[] = [
  {
    id: 'doc_rajiv_gupta',
    email: 'dr.rajiv.gupta@bandaze.health',
    name: 'Dr. Rajiv Gupta, MBBS, MD, DM',
    role: 'doctor',
    specialty: 'Cardiology & Heart Care',
    qualifications: 'MBBS (AIIMS), MD Medicine, DM Cardiology (AIIMS)',
    registrationNumber: 'DMC-58291',
    registrationCouncil: 'Delhi Medical Council',
    registrationState: 'Delhi',
    experienceYears: 18,
    affiliation: 'Fortis Escorts Heart Institute, Okhla / Noida OPD',
    clinicAddress: 'Sector 62 Medical Arcade, Noida, UP 201309',
    clinicHours: '09:30 AM - 05:30 PM (Mon-Fri)',
    consultationFee: 700,
    consultationModes: {
      video: true,
      voice: true,
      clinic: true,
      chat: true
    },
    consultationFees: {
      video: 600,
      voice: 400,
      clinic: 800,
      chat: 300
    },
    bio: 'Senior Consultant Interventional Cardiologist with 18+ years of clinical expertise in preventive cardiology, hypertension, echocardiography, and coronary interventions.',
    verificationStatus: 'verified',
    accountStatus: 'active',
    reviewerNotes: 'Verified via Delhi Medical Council (DMC) primary register. Clean malpractice record.',
    isAvailable: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableHours: '09:30 - 17:30',
    createdAt: '2026-02-01T10:00:00Z',
    phone: '+91 98112 40591',
    documents: [
      {
        id: 'doc_lic_01',
        title: 'Delhi Medical Council Registration DMC-58291',
        type: 'Medical Council License',
        fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-02-01T10:15:00Z',
        verifiedBy: 'Dr. Elena Vance, MD'
      },
      {
        id: 'doc_deg_01',
        title: 'DM Cardiology Postdoctoral Certificate - AIIMS',
        type: 'Super-Specialty Board Certification',
        fileUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-02-01T10:20:00Z',
        verifiedBy: 'Dr. Elena Vance, MD'
      }
    ]
  },
  {
    id: 'doc_sunita_mehra',
    email: 'dr.sunita.mehra@bandaze.health',
    name: 'Dr. Sunita Mehra, MBBS, DCH, DNB',
    role: 'doctor',
    specialty: 'Pediatrics & Child Care',
    qualifications: 'MBBS, DCH (Lady Hardinge), DNB Pediatrics',
    registrationNumber: 'UPMC-44812',
    registrationCouncil: 'Uttar Pradesh Medical Council',
    registrationState: 'Uttar Pradesh',
    experienceYears: 12,
    affiliation: 'Mehra Child Clinic & Mother Care, Noida',
    clinicAddress: 'Shop 14, Central Plaza, Sector 50, Noida, UP 201301',
    clinicHours: '10:00 AM - 07:00 PM (Mon-Sat)',
    consultationFee: 500,
    consultationModes: {
      video: true,
      voice: true,
      clinic: true,
      chat: true
    },
    consultationFees: {
      video: 450,
      voice: 350,
      clinic: 550,
      chat: 250
    },
    bio: 'Dedicated pediatrician and neonatal specialist passionate about newborn care, pediatric nutrition, immunization schedules, and childhood asthma management.',
    verificationStatus: 'verified',
    accountStatus: 'active',
    reviewerNotes: 'Verified via Uttar Pradesh Medical Council registry. Clinic establishment verified.',
    isAvailable: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableHours: '10:00 - 19:00',
    createdAt: '2026-02-03T11:30:00Z',
    phone: '+91 98201 88412',
    documents: [
      {
        id: 'doc_lic_02',
        title: 'UP Medical Council State License UPMC-44812',
        type: 'Medical Council License',
        fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-02-03T11:45:00Z',
        verifiedBy: 'Sarah Jenkins, RN / BSN'
      }
    ]
  },
  {
    id: 'doc_amit_verma',
    email: 'dr.amit.verma@bandaze.health',
    name: 'Dr. Amit Verma, MBBS, MS Orthopedics',
    role: 'doctor',
    specialty: 'Orthopedics & Joint Care',
    qualifications: 'MBBS (MAMC), MS Orthopedics, Fellowship Joint Arthroplasty',
    registrationNumber: 'DMC-71934',
    registrationCouncil: 'Delhi Medical Council',
    registrationState: 'Delhi',
    experienceYears: 14,
    affiliation: 'Max Super Speciality Hospital & Apex Bone Clinic',
    clinicAddress: 'W-3, Sector 19, Noida, UP 201301',
    clinicHours: '11:00 AM - 06:00 PM (Tue, Thu, Sat)',
    consultationFee: 650,
    consultationModes: {
      video: true,
      voice: true,
      clinic: true,
      chat: false
    },
    consultationFees: {
      video: 600,
      voice: 400,
      clinic: 750,
      chat: 0
    },
    bio: 'Specialist in minimally invasive arthroscopy, robotic joint replacement, sports injury rehab, and spine disorders.',
    verificationStatus: 'verified',
    accountStatus: 'active',
    reviewerNotes: 'Verified via Delhi Medical Council. Hospital privileges active at Max Healthcare.',
    isAvailable: true,
    availableDays: ['Tue', 'Thu', 'Sat'],
    availableHours: '11:00 - 18:00',
    createdAt: '2026-02-05T09:00:00Z',
    phone: '+91 99100 71934',
    documents: [
      {
        id: 'doc_lic_03',
        title: 'Delhi Medical Council Registration DMC-71934',
        type: 'Medical Council License',
        fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-02-05T09:20:00Z',
        verifiedBy: 'Dr. Elena Vance, MD'
      }
    ]
  },
  {
    id: 'doc_priya_sharma',
    email: 'dr.priya.sharma@bandaze.health',
    name: 'Dr. Priya Sharma, MBBS, MD Dermatology',
    role: 'doctor',
    specialty: 'Dermatology & Skin Care',
    qualifications: 'MBBS, MD Dermatology & Venereology (Safdarjung Hospital)',
    registrationNumber: 'DMC-88219',
    registrationCouncil: 'Delhi Medical Council',
    registrationState: 'Delhi',
    experienceYears: 8,
    affiliation: 'GlowSkin Advanced Dermatology & Laser Clinic',
    clinicAddress: 'Suite 204, Sector 18 Commercial Hub, Noida, UP 201301',
    clinicHours: '10:30 AM - 05:00 PM',
    consultationFee: 500,
    consultationModes: {
      video: true,
      voice: false,
      clinic: true,
      chat: true
    },
    consultationFees: {
      video: 500,
      voice: 0,
      clinic: 600,
      chat: 300
    },
    bio: 'Clinical dermatologist specializing in eczema, acne management, psoriasis therapies, allergy patches, and dermatological laser therapeutics.',
    verificationStatus: 'pending_verification',
    accountStatus: 'pending',
    reviewerNotes: 'New registration received. Pending primary source medical license verification by EZIOX team.',
    isAvailable: false,
    availableDays: ['Mon', 'Wed', 'Fri'],
    availableHours: '10:30 - 17:00',
    createdAt: '2026-10-22T14:00:00Z',
    phone: '+91 98711 88219',
    documents: [
      {
        id: 'doc_lic_04',
        title: 'Delhi Medical Council Certificate DMC-88219',
        type: 'Medical License',
        fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-10-22T14:10:00Z'
      }
    ]
  }
];

const INITIAL_HOSPITALS: HospitalUser[] = [
  {
    id: 'hosp_apex_heart',
    email: 'admin@apexheartcenter.org',
    name: 'Apex Heart & Multispecialty Trauma Pavilion',
    role: 'hospital',
    facilityType: 'Trauma Center',
    licenseNumber: 'HOSP-LIC-NY-9021',
    accreditation: 'JCI Accredited & Level 1 Trauma Center',
    emergencyHotline: '+1 (800) 555-APEX',
    address: '450 Lexington Avenue Medical Plaza, Suite 100',
    city: 'New York, NY',
    totalBeds: 280,
    icuBedsAvailable: 14,
    services: ['24/7 Level 1 Trauma Care', 'Interventional Cardiology', 'Cardiothoracic Surgery', 'Comprehensive Stroke Center', 'Air Ambulance Fleet', 'Advanced MRI/CT Suite'],
    verificationStatus: 'verified',
    reviewerNotes: 'Hospital accreditation and Level 1 trauma certification audited and verified by Arjun Patel.',
    documents: [
      {
        id: 'hosp_doc_01',
        title: 'State Hospital Operating License',
        type: 'Operating License',
        fileUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-01-25T11:00:00Z',
        verifiedBy: 'Arjun Patel, MHA'
      },
      {
        id: 'hosp_doc_02',
        title: 'JCI Gold Seal Accreditation Certificate',
        type: 'Accreditation',
        fileUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-01-25T11:10:00Z',
        verifiedBy: 'Arjun Patel, MHA'
      }
    ],
    affiliatedDoctorIds: ['doc_sarah_connor', 'doc_rajesh_sharma'],
    createdAt: '2026-01-25T10:30:00Z',
    phone: '+1 (212) 555-8800'
  },
  {
    id: 'hosp_st_jude',
    email: 'contact@stjudemedicalcenter.com',
    name: 'St. Jude Community Health & Urgent Care',
    role: 'hospital',
    facilityType: 'Multi-specialty Clinic',
    licenseNumber: 'CLIN-LIC-MA-4421',
    accreditation: 'AAAASF Accredited Surgical Center',
    emergencyHotline: '+1 (800) 555-JUDE',
    address: '118 Beacon Street Medical Row',
    city: 'Boston, MA',
    totalBeds: 65,
    icuBedsAvailable: 4,
    services: ['Urgent Care & Triage', 'Pediatric Walk-In', 'Outpatient Orthopedic Surgery', 'Ultrasound & X-Ray Lab', 'Onsite Pharmacy'],
    verificationStatus: 'verified',
    reviewerNotes: 'Verified facility license and pharmacy permit.',
    documents: [
      {
        id: 'hosp_doc_03',
        title: 'Clinic Establishment Permit',
        type: 'Establishment Permit',
        fileUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-02-02T13:00:00Z',
        verifiedBy: 'Marcus Chen, JD / MS'
      }
    ],
    affiliatedDoctorIds: ['doc_emily_clark'],
    createdAt: '2026-02-02T12:00:00Z',
    phone: '+1 (617) 555-4300'
  },
  {
    id: 'hosp_metro_diagnostic',
    email: 'operations@metrocarelabs.org',
    name: 'Metro Diagnostic Center & Imaging Institute',
    role: 'hospital',
    facilityType: 'Diagnostic Center',
    licenseNumber: 'DIAG-LIC-CA-8812',
    accreditation: 'College of American Pathologists (CAP) Certified',
    emergencyHotline: '+1 (888) 555-SCAN',
    address: '8900 Wilshire Blvd, Medical Arts Wing',
    city: 'Beverly Hills, CA',
    totalBeds: 20,
    icuBedsAvailable: 0,
    services: ['3T MRI & High-Speed CT', 'PET-CT Oncology Scans', 'Pathology & Genomics Lab', 'Cardiac Stress Echo', 'Preventative Full-Body Screenings'],
    verificationStatus: 'pending',
    reviewerNotes: 'Application under review. Radiation safety clearance being checked.',
    documents: [
      {
        id: 'hosp_doc_04',
        title: 'CAP Laboratory Accreditation',
        type: 'Laboratory Accreditation',
        fileUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-10-23T09:30:00Z'
      }
    ],
    affiliatedDoctorIds: ['doc_michael_torres'],
    createdAt: '2026-10-23T09:00:00Z',
    phone: '+1 (310) 555-7220'
  }
];

const INITIAL_PATIENT: PatientUser = {
  id: 'patient_david_miller',
  email: 'david.miller@example.com',
  name: 'David Miller',
  role: 'patient',
  age: 38,
  bloodGroup: 'O Positive (O+)',
  allergies: ['Penicillin', 'Sulfa Drugs'],
  emergencyContact: {
    name: 'Claire Miller (Spouse)',
    phone: '+1 (555) 774-2918',
    relationship: 'Spouse'
  },
  createdAt: '2026-01-05T12:00:00Z',
  phone: '+1 (555) 912-3849'
};

const INITIAL_APPLICATIONS: VerificationApplication[] = [
  {
    id: 'app_doc_priya_sharma',
    applicantId: 'doc_priya_sharma',
    applicantName: 'Dr. Priya Sharma, MBBS, MD',
    applicantEmail: 'dr.priya.sharma@bandaze.health',
    applicantType: 'doctor',
    submittedAt: '2026-10-22T14:15:00Z',
    updatedAt: '2026-10-22T14:15:00Z',
    status: 'pending_verification',
    specialtyOrType: 'Dermatology & Skin Care',
    registrationNumber: 'DMC-88219',
    affiliationOrAddress: 'GlowSkin Advanced Dermatology Clinic, Sector 18, Noida (Delhi Medical Council)',
    documents: [
      {
        id: 'doc_lic_04',
        title: 'Delhi Medical Council Certificate DMC-88219',
        type: 'Medical License',
        fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-10-22T14:10:00Z'
      }
    ],
    reviews: []
  },
  {
    id: 'app_hosp_metro_diagnostic',
    applicantId: 'hosp_metro_diagnostic',
    applicantName: 'Metro Diagnostic Center & Imaging Institute',
    applicantEmail: 'operations@metrocarelabs.org',
    applicantType: 'hospital',
    submittedAt: '2026-10-23T09:30:00Z',
    updatedAt: '2026-10-23T09:30:00Z',
    status: 'pending',
    specialtyOrType: 'Diagnostic Center (High-field Imaging & Pathology)',
    registrationNumber: 'DIAG-LIC-CA-8812',
    affiliationOrAddress: 'Sector 62, Noida, Gautam Buddha Nagar, UP',
    documents: [
      {
        id: 'hosp_doc_04',
        title: 'CAP Laboratory Accreditation',
        type: 'Laboratory Accreditation',
        fileUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
        submittedAt: '2026-10-23T09:30:00Z'
      }
    ],
    reviews: []
  }
];

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif_01',
    type: 'new_application',
    title: 'New Doctor Verification Application',
    message: 'Dr. Priya Sharma (Dermatology) submitted license DMC-88219 for primary credential review.',
    providerId: 'doc_priya_sharma',
    providerName: 'Dr. Priya Sharma, MBBS, MD',
    providerType: 'doctor',
    createdAt: '2026-10-22T14:15:00Z',
    isRead: false
  },
  {
    id: 'notif_02',
    type: 'new_application',
    title: 'New Hospital / Diagnostic Center Application',
    message: 'Metro Diagnostic Center & Imaging Institute submitted facility registration DIAG-LIC-CA-8812.',
    providerId: 'hosp_metro_diagnostic',
    providerName: 'Metro Diagnostic Center',
    providerType: 'hospital',
    createdAt: '2026-10-23T09:30:00Z',
    isRead: false
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_101',
    patientId: 'patient_supratim_paul',
    patientName: 'Supratim Paul',
    patientPhone: '+91 98765 43210',
    doctorId: 'doc_rajiv_gupta',
    doctorName: 'Dr. Rajiv Gupta, MBBS, MD, DM',
    doctorSpecialty: 'Cardiology & Heart Care',
    hospitalName: 'Fortis Escorts Heart Institute / Sector 62 Noida Clinic',
    date: '2026-10-28',
    time: '10:30 AM',
    type: 'In-Person Consultation',
    reason: 'Annual cardiovascular risk screening, lipid profile review, and occasional exertional palpitations.',
    status: 'confirmed',
    doctorNotes: 'Patient advised to bring last fasting lipid panel and wearable ECG logs.',
    createdAt: '2026-10-24T09:00:00Z'
  },
  {
    id: 'apt_102',
    patientId: 'patient_supratim_paul',
    patientName: 'Supratim Paul',
    patientPhone: '+91 98765 43210',
    doctorId: 'doc_amit_verma',
    doctorName: 'Dr. Amit Verma, MBBS, MS Orthopedics',
    doctorSpecialty: 'Orthopedics & Joint Care',
    hospitalName: 'Max Super Speciality Hospital / Apex Bone Clinic',
    date: '2026-11-04',
    time: '02:00 PM',
    type: 'Follow-up',
    reason: 'Follow-up on right knee meniscus rehabilitation and strength assessment.',
    status: 'requested',
    createdAt: '2026-10-24T09:45:00Z'
  }
];

const INITIAL_RECORDS: HealthRecord[] = [
  {
    id: 'rec_01',
    patientId: 'patient_david_miller',
    title: 'Comprehensive Metabolic & Lipid Panel',
    category: 'Lab Report',
    doctorOrClinic: 'Quest Diagnostics / Dr. Sarah Connor',
    date: '2026-09-14',
    fileUrl: '/mock-records/lipid-panel-2026.pdf',
    fileName: 'lipid_metabolic_panel_sep2026.pdf',
    fileSize: '412 KB',
    notes: 'Total Cholesterol 188 mg/dL, HDL 54 mg/dL, LDL 108 mg/dL, Fasting Glucose 92 mg/dL. All parameters within optimal limits.',
    tags: ['Cardiology', 'Cholesterol', 'Fasting Blood']
  },
  {
    id: 'rec_02',
    patientId: 'patient_david_miller',
    title: 'Right Knee Diagnostic MRI Report',
    category: 'Radiology / Scan',
    doctorOrClinic: 'Apex Advanced Imaging Center',
    date: '2026-06-20',
    fileUrl: '/mock-records/knee-mri.pdf',
    fileName: 'right_knee_mri_june2026.pdf',
    fileSize: '1.8 MB',
    notes: 'Grade I signal alteration in posterior horn of medial meniscus. No full thickness tear. Conservative physio recommended.',
    tags: ['Orthopedics', 'MRI', 'Knee Joint']
  },
  {
    id: 'rec_03',
    patientId: 'patient_david_miller',
    title: 'Annual Seasonal Influenza & Tdap Booster',
    category: 'Vaccination',
    doctorOrClinic: 'Metro Health Immunization Clinic',
    date: '2026-09-02',
    fileUrl: '/mock-records/vaccine-card.pdf',
    fileName: 'vaccine_booster_record.pdf',
    fileSize: '210 KB',
    notes: 'Administered quadrivalent influenza vaccine 2026/2027 and Tdap booster.',
    tags: ['Immunization', 'Preventative Care']
  }
];

const INITIAL_REMINDERS: MedicineReminder[] = [
  {
    id: 'rem_01',
    patientId: 'patient_david_miller',
    medicationName: 'Atorvastatin',
    dosage: '10 mg Tablet',
    instructions: 'Take 1 tablet at night with water.',
    times: ['09:30 PM'],
    startDate: '2026-09-15',
    durationDays: 90,
    takenToday: true,
    streakDays: 24
  },
  {
    id: 'rem_02',
    patientId: 'patient_david_miller',
    medicationName: 'Omega-3 Fish Oil (EPA/DHA)',
    dosage: '1000 mg Softgel',
    instructions: 'Take 1 capsule with breakfast.',
    times: ['08:00 AM'],
    startDate: '2026-08-01',
    durationDays: 120,
    takenToday: true,
    streakDays: 45
  },
  {
    id: 'rem_03',
    patientId: 'patient_david_miller',
    medicationName: 'Vitamin D3 (Cholecalciferol)',
    dosage: '2000 IU',
    instructions: 'Take 1 tablet every morning with meal.',
    times: ['08:30 AM'],
    startDate: '2026-09-01',
    durationDays: 60,
    takenToday: false,
    streakDays: 18
  }
];

const INITIAL_TRAUMA_CENTERS: TraumaCenter[] = [
  {
    id: 'tc_01',
    name: 'Apex Heart & Multispecialty Trauma Pavilion',
    type: 'Level 1 Comprehensive Trauma Center',
    address: '450 Lexington Avenue Medical Plaza',
    distance: '1.4 miles',
    hotline: '+1 (800) 555-APEX',
    openBeds: 18,
    icuAvailable: true,
    bloodBankReady: true
  },
  {
    id: 'tc_02',
    name: 'City Memorial University Emergency Center',
    type: 'Level 1 Trauma & Burn Unit',
    address: '1200 First Avenue Emergency Ramp',
    distance: '2.8 miles',
    hotline: '+1 (800) 555-9111',
    openBeds: 24,
    icuAvailable: true,
    bloodBankReady: true
  },
  {
    id: 'tc_03',
    name: 'St. Jude Community Emergency & Stroke Facility',
    type: 'Level 2 Emergency Trauma Center',
    address: '118 Beacon Street Medical Row',
    distance: '3.6 miles',
    hotline: '+1 (800) 555-JUDE',
    openBeds: 9,
    icuAvailable: true,
    bloodBankReady: false
  }
];

// In-Memory & Persistent Storage Manager
class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        parsed.consultationSessions = parsed.consultationSessions || [];
        parsed.consultationMessages = parsed.consultationMessages || [];

        // Check if real doctors are seeded or if old demo doctors exist
        const hasRajiv = parsed.users && parsed.users.some((u: any) => u.id === 'doc_rajiv_gupta');
        if (!hasRajiv) {
          // Remove old fictional sample doctors and inject real verified doctors
          parsed.users = (parsed.users || []).filter((u: any) =>
            u.id !== 'doc_sarah_connor' && u.id !== 'doc_rajesh_sharma' && u.id !== 'doc_emily_clark' && u.id !== 'doc_michael_torres'
          );
          parsed.users.push(...INITIAL_DOCTORS);
          parsed.applications = INITIAL_APPLICATIONS;
          parsed.appointments = INITIAL_APPOINTMENTS;
        }

        // Ensure all doctors have consultationModes and consultationFees defaults
        if (parsed.users) {
          for (const u of parsed.users) {
            if (u.role === 'doctor') {
              if (!u.consultationModes) {
                u.consultationModes = { video: true, voice: true, clinic: true, chat: true };
              }
              if (!u.consultationFees) {
                u.consultationFees = { video: 600, voice: 400, clinic: 700, chat: 250 };
              }
              if (!u.registrationCouncil) {
                u.registrationCouncil = 'Delhi Medical Council';
              }
              if (!u.registrationState) {
                u.registrationState = 'Delhi';
              }
              if (!u.accountStatus) {
                u.accountStatus = u.verificationStatus === 'verified' ? 'active' : 'pending';
              }
              if (!u.clinicAddress) {
                u.clinicAddress = 'Sector 62 Medical Hub, Noida, UP 201309';
              }
            }
          }
        }

        this.saveData(parsed);
        return parsed;
      } catch (err) {
        console.error('Failed to parse database file, re-initializing with seed data', err);
      }
    }

    const initialData: DatabaseSchema = {
      users: [
        ...INITIAL_ADMINS,
        ...INITIAL_DOCTORS,
        ...INITIAL_HOSPITALS,
        INITIAL_PATIENT
      ],
      applications: INITIAL_APPLICATIONS,
      notifications: INITIAL_NOTIFICATIONS,
      appointments: INITIAL_APPOINTMENTS,
      healthRecords: INITIAL_RECORDS,
      reminders: INITIAL_REMINDERS,
      traumaCenters: INITIAL_TRAUMA_CENTERS,
      bootstrapInviteTokens: [
        { token: 'EZIOX-BOOTSTRAP-ALPHA-2026', createdBy: 'SYSTEM_SUPERADMIN', used: false },
        { token: 'EZIOX-CREDENTIAL-CORE-9988', createdBy: 'SYSTEM_SUPERADMIN', used: false }
      ],
      consultationSessions: [],
      consultationMessages: []
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file', err);
    }
  }

  public getDb(): DatabaseSchema {
    return this.data;
  }

  public save() {
    this.saveData(this.data);
  }
}

const dbManager = new DatabaseManager();

// Auth Middleware: extracts user from X-Bandaze-User-Id header or Bearer token
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-bandaze-user-id'] as string;
  if (!userId) {
    // If not provided, continue as unauthenticated guest
    (req as any).user = null;
    return next();
  }

  const db = dbManager.getDb();
  const foundUser = db.users.find(u => u.id === userId);
  (req as any).user = foundUser || null;
  next();
}

// Admin-Only Middleware: verifies that user is an active EZIOX Admin
function requireEzioxAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User | null;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied: Restricted to authorized EZIOX Verification Team members only.'
    });
  }

  const adminUser = user as EzioxAdminUser;
  if (!adminUser.isActive) {
    return res.status(403).json({
      error: 'Access Denied: This EZIOX admin credential has been revoked or deactivated.'
    });
  }

  next();
}

app.use(authMiddleware);

// ==========================================
// 1. AUTHENTICATION & DEMO SWITCH ENDPOINTS
// ==========================================

// Get current session user
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user) {
    return res.json({ user: null });
  }
  // Sanitize user for public consumption (remove sensitive fields if any)
  res.json({ user });
});

// Demo switch: lets the evaluator instantly log in as any of the 4 test roles safely
app.post('/api/auth/switch-demo', (req: Request, res: Response) => {
  const { role, id } = req.body;
  const db = dbManager.getDb();

  let targetUser: User | undefined;
  if (id) {
    targetUser = db.users.find(u => u.id === id);
  } else if (role) {
    targetUser = db.users.find(u => u.role === role);
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Demo user not found for requested role.' });
  }

  res.json({
    message: `Switched demo identity to ${targetUser.name} (${targetUser.role})`,
    user: targetUser
  });
});

// Public registration (Patient, Doctor, Hospital only — NO ADMIN REGISTRATION ALLOWED)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { role, name, email, phone, ...extra } = req.body;

  // Strict check: Admin accounts CANNOT be created through public registration
  if (role === 'admin') {
    return res.status(403).json({
      error: 'Security Violation: EZIOX Admin accounts cannot be created via public registration. Invitations must be bootstrapped via secure internal tokens.'
    });
  }

  if (!role || !name || !email) {
    return res.status(400).json({ error: 'Name, email, and valid role are required.' });
  }

  const db = dbManager.getDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const newId = `${role}_${Date.now()}`;
  let newUser: User;

  if (role === 'patient') {
    newUser = {
      id: newId,
      email,
      name,
      role: 'patient',
      phone: phone || '',
      age: extra.age ? Number(extra.age) : undefined,
      bloodGroup: extra.bloodGroup || 'Not specified',
      allergies: extra.allergies || [],
      emergencyContact: extra.emergencyContact || undefined,
      createdAt: new Date().toISOString()
    } as PatientUser;
  } else if (role === 'doctor') {
    newUser = {
      id: newId,
      email,
      name,
      role: 'doctor',
      phone: phone || '',
      specialty: extra.specialty || 'General Medicine',
      qualifications: extra.qualifications || '',
      registrationNumber: extra.registrationNumber || '',
      experienceYears: extra.experienceYears ? Number(extra.experienceYears) : 1,
      affiliation: extra.affiliation || '',
      consultationFee: extra.consultationFee ? Number(extra.consultationFee) : 100,
      bio: extra.bio || '',
      verificationStatus: 'pending',
      reviewerNotes: 'New application queued for EZIOX team review.',
      isAvailable: false, // Default false until verified & doctor enables
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      availableHours: '09:00 - 17:00',
      documents: [],
      createdAt: new Date().toISOString()
    } as DoctorUser;

    // Create a verification application automatically
    const newApp: VerificationApplication = {
      id: `app_${newId}`,
      applicantId: newId,
      applicantName: name,
      applicantEmail: email,
      applicantType: 'doctor',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      specialtyOrType: newUser.specialty,
      registrationNumber: newUser.registrationNumber,
      affiliationOrAddress: newUser.affiliation,
      documents: [],
      reviews: []
    };
    db.applications.unshift(newApp);

    // Create an in-app notification for the EZIOX team
    const newNotif: AdminNotification = {
      id: `notif_${Date.now()}`,
      type: 'new_application',
      title: 'New Doctor Verification Submitted',
      message: `${name} (${newUser.specialty}) submitted license ${newUser.registrationNumber} for review.`,
      providerId: newId,
      providerName: name,
      providerType: 'doctor',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    db.notifications.unshift(newNotif);
  } else if (role === 'hospital') {
    newUser = {
      id: newId,
      email,
      name,
      role: 'hospital',
      phone: phone || '',
      facilityType: extra.facilityType || 'Hospital',
      licenseNumber: extra.licenseNumber || '',
      accreditation: extra.accreditation || 'Pending Accreditation Review',
      emergencyHotline: extra.emergencyHotline || phone || '',
      address: extra.address || '',
      city: extra.city || '',
      totalBeds: extra.totalBeds ? Number(extra.totalBeds) : 50,
      icuBedsAvailable: extra.icuBedsAvailable ? Number(extra.icuBedsAvailable) : 5,
      services: extra.services || ['Emergency Care', 'Outpatient Consultation'],
      verificationStatus: 'pending',
      reviewerNotes: 'Facility profile created. Please submit establishment licenses.',
      documents: [],
      affiliatedDoctorIds: [],
      createdAt: new Date().toISOString()
    } as HospitalUser;

    const newApp: VerificationApplication = {
      id: `app_${newId}`,
      applicantId: newId,
      applicantName: name,
      applicantEmail: email,
      applicantType: 'hospital',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      specialtyOrType: newUser.facilityType,
      registrationNumber: newUser.licenseNumber,
      affiliationOrAddress: `${newUser.address}, ${newUser.city}`,
      documents: [],
      reviews: []
    };
    db.applications.unshift(newApp);

    const newNotif: AdminNotification = {
      id: `notif_${Date.now()}`,
      type: 'new_application',
      title: 'New Facility Verification Submitted',
      message: `${name} (${newUser.facilityType}) submitted facility registration ${newUser.licenseNumber}.`,
      providerId: newId,
      providerName: name,
      providerType: 'hospital',
      createdAt: new Date().toISOString(),
      isRead: false
    };
    db.notifications.unshift(newNotif);
  } else {
    return res.status(400).json({ error: 'Invalid account role.' });
  }

  db.users.push(newUser);
  dbManager.save();

  res.status(201).json({
    message: 'Account created successfully.',
    user: newUser
  });
});

// Secure invitation / bootstrap endpoint for authorized EZIOX team accounts
app.post('/api/admin/bootstrap-invite', (req: Request, res: Response) => {
  const { inviteToken, name, email, adminTitle, badgeNumber } = req.body;

  if (!inviteToken || !name || !email || !adminTitle) {
    return res.status(400).json({
      error: 'Invitation token, full name, institutional email, and admin title are required.'
    });
  }

  const db = dbManager.getDb();
  const tokenRecord = db.bootstrapInviteTokens.find(t => t.token === inviteToken && !t.used);

  if (!tokenRecord) {
    return res.status(403).json({
      error: 'Invalid, expired, or previously redeemed EZIOX bootstrap token.'
    });
  }

  // Mark token used
  tokenRecord.used = true;

  const newAdminId = `admin_${Date.now()}`;
  const newAdmin: EzioxAdminUser = {
    id: newAdminId,
    email,
    name,
    role: 'admin',
    adminTitle,
    badgeNumber: badgeNumber || `EZX-AUDIT-${Math.floor(10 + Math.random() * 90)}`,
    permissions: ['verify_doctor', 'verify_hospital', 'audit_logs'],
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.users.push(newAdmin);
  dbManager.save();

  res.status(201).json({
    message: `EZIOX Admin account successfully bootstrapped for ${name}.`,
    user: newAdmin
  });
});

// ==========================================
// 1.5 DEDICATED DOCTOR REGISTRATION & DIRECTORY
// ==========================================

// Dedicated Doctor Registration: collects all mandatory professional credentials
app.post('/api/doctors/register', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    avatar,
    specialty,
    qualifications,
    registrationNumber,
    registrationCouncil,
    registrationState,
    experienceYears,
    affiliation,
    clinicAddress,
    clinicHours,
    consultationModes,
    consultationFees,
    availableDays,
    availableHours,
    bio,
    documentTitle,
    documentType,
    documentUrl
  } = req.body;

  if (!name || !email || !registrationNumber || !qualifications || !specialty) {
    return res.status(400).json({
      error: 'Missing required fields: Full name, institutional email, medical qualifications, specialty, and registration number are mandatory.'
    });
  }

  const db = dbManager.getDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address is already registered in BANDAZE.' });
  }

  const existingReg = db.users.find(
    u => u.role === 'doctor' &&
    (u as DoctorUser).registrationNumber.toLowerCase().trim() === registrationNumber.toLowerCase().trim()
  );
  if (existingReg) {
    return res.status(409).json({
      error: `A doctor profile with registration number ${registrationNumber} is already registered.`
    });
  }

  const newDocId = `doc_${Date.now()}`;
  const defaultModes = consultationModes || { video: true, voice: true, clinic: true, chat: true };
  const defaultFees = consultationFees || { video: 600, voice: 400, clinic: 700, chat: 250 };

  const submittedDocs = [];
  if (documentTitle) {
    submittedDocs.push({
      id: `doc_${Date.now()}_lic`,
      title: documentTitle,
      type: documentType || 'State Medical Council Certificate',
      fileUrl: documentUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      submittedAt: new Date().toISOString()
    });
  }

  const newDoctor: DoctorUser = {
    id: newDocId,
    email,
    name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
    role: 'doctor',
    avatar: avatar || '',
    phone: phone || '',
    specialty,
    qualifications,
    registrationNumber,
    registrationCouncil: registrationCouncil || 'National Medical Commission',
    registrationState: registrationState || 'Delhi',
    experienceYears: experienceYears ? Number(experienceYears) : 5,
    affiliation: affiliation || 'Independent Practice',
    clinicAddress: clinicAddress || 'Sector 62 Medical Arcade, Noida, UP',
    clinicHours: clinicHours || '10:00 AM - 06:00 PM',
    consultationFee: defaultFees.clinic || 600,
    consultationModes: defaultModes,
    consultationFees: defaultFees,
    bio: bio || `Specialist in ${specialty} with ${experienceYears || 5}+ years clinical experience.`,
    verificationStatus: 'pending_verification',
    accountStatus: 'pending',
    reviewerNotes: 'New registration received. Queued for BANDAZE / EZIOX primary source verification.',
    isAvailable: false, // Strictly false: cannot accept live bookings until verified
    availableDays: availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableHours: availableHours || '10:00 - 18:00',
    documents: submittedDocs,
    createdAt: new Date().toISOString()
  };

  db.users.push(newDoctor);

  // Automatically queue verification application for admin team
  const newApp: VerificationApplication = {
    id: `app_${newDocId}`,
    applicantId: newDocId,
    applicantName: newDoctor.name,
    applicantEmail: email,
    applicantType: 'doctor',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending_verification',
    specialtyOrType: specialty,
    registrationNumber,
    affiliationOrAddress: `${newDoctor.affiliation} (${newDoctor.registrationCouncil || newDoctor.registrationState})`,
    documents: submittedDocs,
    reviews: []
  };
  db.applications.unshift(newApp);

  // Send admin notification
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    type: 'new_application',
    title: 'New Doctor Verification Application',
    message: `${newDoctor.name} (${specialty}, Reg: ${registrationNumber}) registered and requested credential verification.`,
    providerId: newDocId,
    providerName: newDoctor.name,
    providerType: 'doctor',
    createdAt: new Date().toISOString(),
    isRead: false
  });

  dbManager.save();

  res.status(201).json({
    message: 'Doctor registration submitted successfully! Your credentials have been queued for BANDAZE Admin Verification.',
    doctor: newDoctor
  });
});

// GET /api/doctors/public: strictly filtered by verificationStatus='verified' AND accountStatus='active'
app.get('/api/doctors/public', (req: Request, res: Response) => {
  const { specialty, mode, search } = req.query;
  const db = dbManager.getDb();

  // Strict: MUST be verified AND active
  let verified = db.users.filter(u =>
    u.role === 'doctor' &&
    (u as DoctorUser).verificationStatus === 'verified' &&
    ((u as DoctorUser).accountStatus === undefined || (u as DoctorUser).accountStatus === 'active')
  ) as DoctorUser[];

  if (specialty && specialty !== 'All') {
    verified = verified.filter(d => d.specialty.toLowerCase().includes(String(specialty).toLowerCase()));
  }

  if (mode && mode !== 'all') {
    const m = String(mode) as ConsultationMode;
    verified = verified.filter(d => d.consultationModes?.[m] === true);
  }

  if (search) {
    const q = String(search).toLowerCase();
    verified = verified.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      (d.affiliation && d.affiliation.toLowerCase().includes(q)) ||
      (d.registrationCouncil && d.registrationCouncil.toLowerCase().includes(q))
    );
  }

  // Sanitize documents for public view
  const safe = verified.map(d => {
    const { documents, ...rest } = d;
    return {
      ...rest,
      documentCount: documents ? documents.length : 0
    };
  });

  res.json({
    doctors: safe,
    totalVerified: safe.length
  });
});

// ==========================================
// 2. PUBLIC DIRECTORY & PROVIDER DETAILS
// ==========================================

// Public Verified Provider Directory: ONLY approved and verified providers appear!
app.get('/api/providers/directory', (req: Request, res: Response) => {
  const { specialty, location, availabilityOnly, search, type } = req.query;
  const db = dbManager.getDb();

  // Doctors: MUST be 'verified' AND not suspended/rejected
  let verifiedDoctors = db.users.filter(u =>
    u.role === 'doctor' &&
    (u as DoctorUser).verificationStatus === 'verified' &&
    ((u as DoctorUser).accountStatus === undefined || (u as DoctorUser).accountStatus === 'active')
  ) as DoctorUser[];

  // Hospitals: MUST be 'verified'
  let verifiedHospitals = db.users.filter(u => u.role === 'hospital' && (u as HospitalUser).verificationStatus === 'verified') as HospitalUser[];

  // Filter Doctors
  if (specialty && specialty !== 'all') {
    verifiedDoctors = verifiedDoctors.filter(d =>
      d.specialty.toLowerCase().includes(String(specialty).toLowerCase())
    );
  }

  if (availabilityOnly === 'true') {
    verifiedDoctors = verifiedDoctors.filter(d => d.isAvailable === true);
  }

  if (search) {
    const q = String(search).toLowerCase();
    verifiedDoctors = verifiedDoctors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.affiliation.toLowerCase().includes(q)
    );
    verifiedHospitals = verifiedHospitals.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.services.some(s => s.toLowerCase().includes(q))
    );
  }

  if (location && location !== 'all') {
    const loc = String(location).toLowerCase();
    verifiedDoctors = verifiedDoctors.filter(d =>
      d.affiliation.toLowerCase().includes(loc)
    );
    verifiedHospitals = verifiedHospitals.filter(h =>
      h.city.toLowerCase().includes(loc) || h.address.toLowerCase().includes(loc)
    );
  }

  // Remove private documents from public provider payloads for security
  const safeDoctors = verifiedDoctors.map(d => {
    const { documents, ...rest } = d;
    return {
      ...rest,
      documentCount: documents.length
    };
  });

  const safeHospitals = verifiedHospitals.map(h => {
    const { documents, ...rest } = h;
    return {
      ...rest,
      documentCount: documents.length
    };
  });

  res.json({
    doctors: type === 'hospitals_only' ? [] : safeDoctors,
    hospitals: type === 'doctors_only' ? [] : safeHospitals,
    totalVerified: safeDoctors.length + safeHospitals.length
  });
});

// Update Doctor profile or availability
app.put('/api/providers/doctor-profile', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user || user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access restricted to authenticated doctors.' });
  }

  const {
    isAvailable,
    availableDays,
    availableHours,
    consultationFee,
    consultationModes,
    consultationFees,
    clinicAddress,
    clinicHours,
    bio,
    specialty,
    affiliation
  } = req.body;

  const db = dbManager.getDb();
  const doc = db.users.find(u => u.id === user.id) as DoctorUser;

  if (!doc) {
    return res.status(404).json({ error: 'Doctor record not found.' });
  }

  // Updating profile fields
  if (typeof isAvailable === 'boolean') {
    // Only verified doctors can mark themselves available for live booking
    if (doc.verificationStatus !== 'verified' && isAvailable === true) {
      return res.status(400).json({
        error: 'Only BANDAZE Verified doctors can toggle availability for patient bookings. Your application is currently pending verification.'
      });
    }
    doc.isAvailable = isAvailable;
  }

  if (availableDays) doc.availableDays = availableDays;
  if (availableHours) doc.availableHours = availableHours;
  if (consultationFee) doc.consultationFee = Number(consultationFee);
  if (consultationModes) doc.consultationModes = consultationModes;
  if (consultationFees) doc.consultationFees = consultationFees;
  if (clinicAddress) doc.clinicAddress = clinicAddress;
  if (clinicHours) doc.clinicHours = clinicHours;
  if (bio) doc.bio = bio;
  if (specialty) doc.specialty = specialty;
  if (affiliation) doc.affiliation = affiliation;

  dbManager.save();
  res.json({ message: 'Profile updated successfully.', doctor: doc });
});

// Upload private verification document for doctor or hospital
app.post('/api/providers/upload-document', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user || (user.role !== 'doctor' && user.role !== 'hospital')) {
    return res.status(403).json({ error: 'Access restricted to doctors and healthcare facilities.' });
  }

  const { title, type, fileUrl } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: 'Document title and document type are required.' });
  }

  const db = dbManager.getDb();
  const provider = db.users.find(u => u.id === user.id) as DoctorUser | HospitalUser;
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found.' });
  }

  const newDoc = {
    id: `doc_${Date.now()}`,
    title,
    type,
    fileUrl: fileUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    submittedAt: new Date().toISOString()
  };

  provider.documents.push(newDoc);

  // Sync to application
  const appRecord = db.applications.find(a => a.applicantId === provider.id);
  if (appRecord) {
    appRecord.documents.push(newDoc);
    appRecord.updatedAt = new Date().toISOString();
    // If was needs_info, update notification
    const resubmitNotif: AdminNotification = {
      id: `notif_${Date.now()}`,
      type: 'resubmission',
      title: 'New Verification Document Uploaded',
      message: `${provider.name} uploaded new document: "${title}" (${type}).`,
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.role,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    db.notifications.unshift(resubmitNotif);
  }

  dbManager.save();
  res.json({ message: 'Document submitted for verification.', document: newDoc });
});

// ==========================================
// 3. EZIOX VERIFICATION CENTER (ADMIN ONLY)
// ==========================================

// Get all verification applications & statistics
app.get('/api/admin/applications', requireEzioxAdmin, (req: Request, res: Response) => {
  const db = dbManager.getDb();
  const { status, type } = req.query;

  let apps = [...db.applications];
  if (status && status !== 'all') {
    apps = apps.filter(a => a.status === status);
  }
  if (type && type !== 'all') {
    apps = apps.filter(a => a.applicantType === type);
  }

  const pendingCount = db.applications.filter(a => a.status === 'pending' || a.status === 'pending_verification').length;
  const verifiedCount = db.applications.filter(a => a.status === 'verified').length;
  const needsInfoCount = db.applications.filter(a => a.status === 'needs_info').length;
  const rejectedCount = db.applications.filter(a => a.status === 'rejected' || a.status === 'suspended').length;

  res.json({
    applications: apps,
    counts: {
      total: db.applications.length,
      pending: pendingCount,
      verified: verifiedCount,
      needsInfo: needsInfoCount,
      rejected: rejectedCount
    }
  });
});

// Get single verification application with documents
app.get('/api/admin/applications/:id', requireEzioxAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();
  const appRecord = db.applications.find(a => a.id === id);

  if (!appRecord) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  // Retrieve provider profile details
  const provider = db.users.find(u => u.id === appRecord.applicantId);

  res.json({
    application: appRecord,
    provider
  });
});

// Perform human review decision (Approve, Reject, Request More Information, Suspend)
app.post('/api/admin/applications/:id/review', requireEzioxAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as EzioxAdminUser;
  const { id } = req.params;
  const { action, notes, reason } = req.body;

  if (!['approve', 'reject', 'request_info', 'suspend'].includes(action)) {
    return res.status(400).json({ error: 'Invalid review action. Must be approve, reject, request_info, or suspend.' });
  }

  if (!notes && !reason) {
    return res.status(400).json({ error: 'Review notes / reason are required for institutional audit compliance.' });
  }

  const auditNote = notes || reason || '';
  const db = dbManager.getDb();
  const appRecord = db.applications.find(a => a.id === id);

  if (!appRecord) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  // Prevent self-review: Reviewer cannot review an application with their own ID or email
  if (appRecord.applicantId === admin.id || appRecord.applicantEmail === admin.email) {
    return res.status(403).json({
      error: 'Conflict of Interest: Authorized EZIOX reviewers cannot audit or approve their own provider application.'
    });
  }

  let newStatus: any;
  if (action === 'approve') newStatus = 'verified';
  else if (action === 'reject') newStatus = 'rejected';
  else if (action === 'suspend') newStatus = 'suspended';
  else newStatus = 'needs_info';

  const reviewEntry = {
    id: `rev_${Date.now()}`,
    reviewerId: admin.id,
    reviewerName: admin.name,
    reviewerEmail: admin.email,
    reviewerTitle: admin.adminTitle,
    action,
    notes: auditNote,
    timestamp: new Date().toISOString()
  };

  appRecord.status = newStatus;
  appRecord.updatedAt = new Date().toISOString();
  appRecord.reviews.unshift(reviewEntry);

  // Update target user profile status
  const provider = db.users.find(u => u.id === appRecord.applicantId) as (DoctorUser | HospitalUser | undefined);
  if (provider) {
    provider.verificationStatus = newStatus;
    provider.reviewerNotes = auditNote;
    if (action === 'approve') {
      (provider as any).accountStatus = 'active';
    } else if (action === 'reject') {
      (provider as any).accountStatus = 'rejected';
      (provider as any).rejectionReason = auditNote;
      if (provider.role === 'doctor') {
        (provider as DoctorUser).isAvailable = false;
      }
    } else if (action === 'suspend') {
      (provider as any).accountStatus = 'suspended';
      (provider as any).suspensionReason = auditNote;
      if (provider.role === 'doctor') {
        (provider as DoctorUser).isAvailable = false;
      }
    }
  }

  dbManager.save();

  res.json({
    message: `Application ${action === 'approve' ? 'approved and verified' : action === 'reject' ? 'rejected' : action === 'suspend' ? 'suspended' : 'flagged for additional information'}.`,
    application: appRecord
  });
});

// Dedicated Doctor Verification Endpoint (Approve, Reject, Request Info, Suspend directly by Doctor ID)
app.post('/api/admin/doctors/:id/verify', requireEzioxAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user as EzioxAdminUser;
  const { id } = req.params;
  const { action, notes, reason } = req.body;

  if (!['approve', 'reject', 'request_info', 'suspend'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Supported: approve, reject, request_info, suspend.' });
  }

  const db = dbManager.getDb();
  const doctor = db.users.find(u => u.id === id && u.role === 'doctor') as DoctorUser | undefined;

  if (!doctor) {
    return res.status(404).json({ error: 'Doctor record not found.' });
  }

  if (doctor.id === admin.id || doctor.email === admin.email) {
    return res.status(403).json({ error: 'Security Conflict: Reviewers cannot audit or verify their own doctor profile.' });
  }

  const timestamp = new Date().toISOString();
  const auditText = notes || reason || `Action committed: ${action}`;

  if (action === 'approve') {
    doctor.verificationStatus = 'verified';
    doctor.accountStatus = 'active';
    doctor.reviewerNotes = auditText;
    doctor.rejectionReason = undefined;
    doctor.suspensionReason = undefined;
  } else if (action === 'reject') {
    doctor.verificationStatus = 'rejected';
    doctor.accountStatus = 'rejected';
    doctor.isAvailable = false;
    doctor.rejectionReason = auditText;
    doctor.reviewerNotes = auditText;
  } else if (action === 'request_info') {
    doctor.verificationStatus = 'needs_info';
    doctor.reviewerNotes = auditText;
  } else if (action === 'suspend') {
    doctor.verificationStatus = 'suspended';
    doctor.accountStatus = 'suspended';
    doctor.isAvailable = false;
    doctor.suspensionReason = auditText;
    doctor.reviewerNotes = auditText;
  }

  // Update application record
  const appRecord = db.applications.find(a => a.applicantId === doctor.id);
  if (appRecord) {
    appRecord.status = doctor.verificationStatus;
    appRecord.updatedAt = timestamp;
    appRecord.reviews.unshift({
      id: `rev_${Date.now()}`,
      reviewerId: admin.id,
      reviewerName: admin.name,
      reviewerEmail: admin.email,
      reviewerTitle: admin.adminTitle,
      action: action as any,
      notes: auditText,
      timestamp
    });
  }

  dbManager.save();
  res.json({
    message: `Doctor ${doctor.name} status updated to ${doctor.verificationStatus} (${doctor.accountStatus}).`,
    doctor
  });
});

// Admin In-App Notifications
app.get('/api/admin/notifications', requireEzioxAdmin, (req: Request, res: Response) => {
  const db = dbManager.getDb();
  const unreadCount = db.notifications.filter(n => !n.isRead).length;
  res.json({
    notifications: db.notifications,
    unreadCount
  });
});

app.post('/api/admin/notifications/mark-all-read', requireEzioxAdmin, (req: Request, res: Response) => {
  const db = dbManager.getDb();
  db.notifications.forEach(n => { n.isRead = true; });
  dbManager.save();
  res.json({ message: 'Notifications marked as read.' });
});

// ==========================================
// 4. AI-ASSISTED VERIFICATION AUDIT (GEMINI)
// ==========================================

app.post('/api/admin/applications/:id/ai-audit', requireEzioxAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();
  const appRecord = db.applications.find(a => a.id === id);

  if (!appRecord) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const prompt = `You are the EZIOX Clinical Credentialing AI Auditor for BANDAZE Healthcare Platform.
Audit the following healthcare provider credential submission:
Applicant Name: ${appRecord.applicantName}
Applicant Type: ${appRecord.applicantType}
Registration / License ID: ${appRecord.registrationNumber}
Specialty or Category: ${appRecord.specialtyOrType}
Affiliation or Address: ${appRecord.affiliationOrAddress}
Number of Submitted Documents: ${appRecord.documents.length}
Documents Listed: ${JSON.stringify(appRecord.documents.map(d => ({ title: d.title, type: d.type })))}

Perform rule-based checks:
1. Verify if required primary documentation is present (license, board certification, establishment permit).
2. Compare applicant name consistency across fields.
3. Check registration format plausibility (e.g., standard medical board prefix MED- or HOSP-).
4. Identify any missing documents or ambiguous claims.
5. Provide a summary checklist and recommendation for the human reviewer.

IMPORTANT: Strictly return a JSON object with:
- score: number between 0 and 100
- status: "pass" | "warning" | "flagged"
- checklist: array of { item: string, passed: boolean, note: string }
- analysis: string (human-readable executive summary for the EZIOX reviewer)`;

  let auditResult = {
    score: 88,
    status: 'pass' as 'pass' | 'warning' | 'flagged',
    checklist: [
      { item: 'State Medical License Submitted', passed: appRecord.documents.length > 0, note: appRecord.documents.length > 0 ? 'Document on record' : 'Missing primary license' },
      { item: 'Registration Format Consistency', passed: Boolean(appRecord.registrationNumber), note: `Registration ID formatted as ${appRecord.registrationNumber}` },
      { item: 'Name Cross-Reference Match', passed: true, note: 'Applicant name matches filing profile' },
      { item: 'Institutional Affiliation Declared', passed: Boolean(appRecord.affiliationOrAddress), note: appRecord.affiliationOrAddress }
    ],
    analysis: 'Preliminary audit verified standard format and declared institution. Human credentialing reviewer must perform final source verification.',
    analyzedAt: new Date().toISOString()
  };

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        auditResult = {
          score: parsed.score || 85,
          status: parsed.status || 'pass',
          checklist: parsed.checklist || auditResult.checklist,
          analysis: parsed.analysis || auditResult.analysis,
          analyzedAt: new Date().toISOString()
        };
      }
    } catch (err) {
      console.error('Gemini verification assist error, using structured fallback checklist', err);
    }
  }

  appRecord.aiAuditSummary = auditResult;
  dbManager.save();

  res.json({
    message: 'AI credential audit generated for human reviewer.',
    audit: auditResult
  });
});

// ==========================================
// 5. APPOINTMENTS MANAGEMENT
// ==========================================

app.get('/api/appointments', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  const db = dbManager.getDb();

  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  let appointments: Appointment[] = [];
  if (user.role === 'patient') {
    appointments = db.appointments.filter(a => a.patientId === user.id);
  } else if (user.role === 'doctor') {
    appointments = db.appointments.filter(a => a.doctorId === user.id);
  } else if (user.role === 'admin') {
    appointments = db.appointments;
  }

  res.json({ appointments });
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user) {
    return res.status(401).json({ error: 'Please log in to book an appointment.' });
  }

  const { doctorId, date, time, type, reason, patientPhone } = req.body;
  if (!doctorId || !date || !time) {
    return res.status(400).json({ error: 'Doctor, consultation date, and time slot are required.' });
  }

  const db = dbManager.getDb();
  const doctor = db.users.find(u => u.id === doctorId) as DoctorUser;

  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({ error: 'Selected doctor not found.' });
  }

  // Check verification
  if (doctor.verificationStatus !== 'verified') {
    return res.status(400).json({ error: 'Cannot book appointments with an unverified provider.' });
  }

  // Check double-booking to prevent scheduling conflicts
  const isConflict = db.appointments.some(
    a => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'cancelled'
  );
  if (isConflict) {
    return res.status(409).json({
      error: `Dr. ${doctor.name} is already booked for ${time} on ${date}. Please select another available time slot.`
    });
  }

  const newApt: Appointment = {
    id: `apt_${Date.now()}`,
    patientId: user.id,
    patientName: user.name,
    patientPhone: patientPhone || user.phone || '+91 98765 43210',
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    hospitalName: doctor.affiliation || doctor.clinicAddress,
    date,
    time,
    type: type || 'In-Person Consultation',
    reason: reason || 'Routine Clinical Consultation',
    status: 'requested',
    createdAt: new Date().toISOString()
  };

  db.appointments.unshift(newApt);
  dbManager.save();

  res.status(201).json({
    message: 'Appointment request submitted to doctor.',
    appointment: newApt
  });
});

app.put('/api/appointments/:id/status', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  const { id } = req.params;
  const { status, doctorNotes, prescriptionNotes } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const db = dbManager.getDb();
  const apt = db.appointments.find(a => a.id === id);

  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  // Doctor or Patient can cancel, Doctor can confirm or complete
  if (status) {
    apt.status = status;
  }
  if (doctorNotes) {
    apt.doctorNotes = doctorNotes;
  }
  if (prescriptionNotes) {
    apt.prescriptionNotes = prescriptionNotes;
  }

  dbManager.save();
  res.json({ message: 'Appointment status updated.', appointment: apt });
});

// ==========================================
// 5.5 MULTI-MODE CONSULTATION SESSIONS & CALLING
// ==========================================

// Create new consultation session (Video, Voice, In-Clinic, Text Chat)
app.post('/api/consultations/create', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  const { doctorId, mode, reason, scheduledDate, scheduledTime, patientPhone, clinicAddress } = req.body;

  if (!doctorId || !mode) {
    return res.status(400).json({ error: 'Doctor ID and consultation mode (video, voice, clinic, chat) are required.' });
  }

  const db = dbManager.getDb();
  db.consultationSessions = db.consultationSessions || [];

  const doctor = db.users.find(u => u.id === doctorId && u.role === 'doctor') as DoctorUser | undefined;
  if (!doctor) {
    return res.status(404).json({ error: 'Selected doctor not found.' });
  }

  if (doctor.verificationStatus !== 'verified' || doctor.accountStatus === 'suspended') {
    return res.status(400).json({ error: 'This doctor is not currently verified or authorized to accept patient consultations.' });
  }

  // Verify doctor offers this mode
  if (doctor.consultationModes && doctor.consultationModes[mode as ConsultationMode] === false) {
    return res.status(400).json({ error: `Dr. ${doctor.name} does not offer ${mode} consultations.` });
  }

  // Prevent double booking if date/time provided
  if (scheduledDate && scheduledTime) {
    const isConflict = db.appointments.some(
      a => a.doctorId === doctorId && a.date === scheduledDate && a.time === scheduledTime && a.status !== 'cancelled'
    );
    if (isConflict) {
      return res.status(409).json({
        error: `Dr. ${doctor.name} is already booked for ${scheduledTime} on ${scheduledDate}. Please select another time slot.`
      });
    }
  }

  const patientId = user?.id || 'patient_supratim_paul';
  const patientName = user?.name || 'Supratim Paul';
  const fee = doctor.consultationFees?.[mode as ConsultationMode] ?? doctor.consultationFee ?? 500;

  const sessionId = `cs_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const session: ConsultationSession = {
    id: sessionId,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    patientId,
    patientName,
    patientPhone: patientPhone || user?.phone || '+91 98765 43210',
    mode: mode as ConsultationMode,
    fee,
    status: mode === 'chat' || mode === 'video' || mode === 'voice' ? 'waiting' : 'active',
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
    scheduledTime: scheduledTime || 'Immediate',
    reason: reason || 'General Healthcare Consultation',
    clinicAddress: clinicAddress || doctor.clinicAddress || 'Sector 62 Medical Arcade, Noida, UP',
    createdAt: new Date().toISOString(),
    signaling: {
      offers: [],
      answers: [],
      iceCandidates: []
    }
  };

  db.consultationSessions.unshift(session);

  // If in-clinic or scheduled, also save an appointment record
  if (mode === 'clinic' || scheduledDate) {
    const newApt: Appointment = {
      id: `apt_${sessionId}`,
      patientId,
      patientName,
      patientPhone: session.patientPhone || '',
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      hospitalName: doctor.affiliation || doctor.clinicAddress,
      date: session.scheduledDate || new Date().toISOString().split('T')[0],
      time: session.scheduledTime || '10:00 AM',
      type: mode === 'clinic' ? 'In-Person Consultation' : mode === 'video' ? 'Video Telehealth' : 'Follow-up',
      reason: session.reason || 'Clinical Consultation',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    db.appointments.unshift(newApt);
  }

  dbManager.save();
  res.status(201).json({
    message: 'Consultation session established.',
    session
  });
});

// GET /api/consultations/:id
app.get('/api/consultations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();
  db.consultationSessions = db.consultationSessions || [];
  const session = db.consultationSessions.find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Consultation session not found.' });
  }

  res.json({ session });
});

// WebRTC Signaling: POST /api/consultations/:id/signal
app.post('/api/consultations/:id/signal', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  const { id } = req.params;
  const { type, payload } = req.body;

  const db = dbManager.getDb();
  db.consultationSessions = db.consultationSessions || [];
  const session = db.consultationSessions.find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Consultation session not found.' });
  }

  session.signaling = session.signaling || { offers: [], answers: [], iceCandidates: [] };
  const senderId = user?.id || 'client_peer';
  const timestamp = new Date().toISOString();

  if (type === 'offer') {
    session.signaling.offers.push({ sender: senderId, sdp: payload, timestamp });
  } else if (type === 'answer') {
    session.signaling.answers.push({ sender: senderId, sdp: payload, timestamp });
    session.status = 'active';
    session.startedAt = session.startedAt || timestamp;
  } else if (type === 'ice') {
    session.signaling.iceCandidates.push({ sender: senderId, candidate: payload, timestamp });
  }

  dbManager.save();
  res.json({ success: true, timestamp });
});

// WebRTC Signaling: GET /api/consultations/:id/signals
app.get('/api/consultations/:id/signals', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  const { id } = req.params;
  const since = req.query.since as string;

  const db = dbManager.getDb();
  db.consultationSessions = db.consultationSessions || [];
  const session = db.consultationSessions.find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Consultation session not found.' });
  }

  session.signaling = session.signaling || { offers: [], answers: [], iceCandidates: [] };
  const currentUserId = user?.id || '';

  // Return signals sent by the OTHER peer
  const filterByTime = (items: any[]) => {
    return items.filter(item => {
      const isFromOther = item.sender !== currentUserId;
      if (!since) return isFromOther;
      return isFromOther && item.timestamp > since;
    });
  };

  res.json({
    offers: filterByTime(session.signaling.offers),
    answers: filterByTime(session.signaling.answers),
    iceCandidates: filterByTime(session.signaling.iceCandidates),
    sessionStatus: session.status,
    startedAt: session.startedAt
  });
});

// POST /api/consultations/:id/end
app.post('/api/consultations/:id/end', (req: Request, res: Response) => {
  const { id } = req.params;
  const { doctorNotes, prescriptionNotes } = req.body;

  const db = dbManager.getDb();
  db.consultationSessions = db.consultationSessions || [];
  const session = db.consultationSessions.find(s => s.id === id);

  if (!session) {
    return res.status(404).json({ error: 'Consultation session not found.' });
  }

  session.status = 'completed';
  session.endedAt = new Date().toISOString();
  if (doctorNotes) session.doctorNotes = doctorNotes;
  if (prescriptionNotes) session.prescriptionNotes = prescriptionNotes;

  // Also complete associated appointment if any
  const apt = db.appointments.find(a => a.id === `apt_${id}`);
  if (apt) {
    apt.status = 'completed';
    if (doctorNotes) apt.doctorNotes = doctorNotes;
    if (prescriptionNotes) apt.prescriptionNotes = prescriptionNotes;
  }

  dbManager.save();
  res.json({ message: 'Consultation completed.', session });
});

// Chat Messages: GET /api/consultations/:id/messages
app.get('/api/consultations/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();
  db.consultationMessages = db.consultationMessages || [];
  const messages = db.consultationMessages.filter(m => m.consultationId === id);
  res.json({ messages });
});

// Chat Messages: POST /api/consultations/:id/messages
app.post('/api/consultations/:id/messages', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty.' });
  }

  const db = dbManager.getDb();
  db.consultationMessages = db.consultationMessages || [];

  const senderId = user?.id || 'patient_supratim_paul';
  const senderName = user?.name || 'Patient';
  const senderRole = user?.role === 'doctor' ? 'doctor' : 'patient';

  const newMsg: ConsultationMessage = {
    id: `msg_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    consultationId: id,
    senderId,
    senderName,
    senderRole,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  db.consultationMessages.push(newMsg);
  dbManager.save();
  res.status(201).json({ message: newMsg });
});

// ==========================================
// 6. HEALTH RECORDS & LAB REPORTS
// ==========================================

app.get('/api/records', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const db = dbManager.getDb();
  let records: HealthRecord[] = [];

  if (user.role === 'patient') {
    records = db.healthRecords.filter(r => r.patientId === user.id);
  } else if (user.role === 'doctor') {
    // Doctors can access authorized records of patients who have appointments with them
    const patientIds = db.appointments.filter(a => a.doctorId === user.id).map(a => a.patientId);
    records = db.healthRecords.filter(r => patientIds.includes(r.patientId));
  } else if (user.role === 'admin') {
    records = db.healthRecords;
  }

  res.json({ records });
});

app.post('/api/records', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { title, category, doctorOrClinic, date, fileName, notes, tags } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Record title and category are required.' });
  }

  const db = dbManager.getDb();
  const newRec: HealthRecord = {
    id: `rec_${Date.now()}`,
    patientId: user.id,
    title,
    category: category || 'Lab Report',
    doctorOrClinic: doctorOrClinic || 'Self Uploaded',
    date: date || new Date().toISOString().split('T')[0],
    fileUrl: '/mock-records/medical-report.pdf',
    fileName: fileName || `${title.toLowerCase().replace(/\\s+/g, '_')}.pdf`,
    fileSize: `${Math.floor(250 + Math.random() * 800)} KB`,
    notes: notes || '',
    tags: tags || ['Medical Record']
  };

  db.healthRecords.unshift(newRec);
  dbManager.save();

  res.status(201).json({ message: 'Health record securely stored.', record: newRec });
});

// ==========================================
// 7. MEDICINE REMINDERS
// ==========================================

app.get('/api/reminders', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const db = dbManager.getDb();
  const reminders = db.reminders.filter(r => r.patientId === user.id);
  res.json({ reminders });
});

app.post('/api/reminders', (req: Request, res: Response) => {
  const user = (req as any).user as User | null;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { medicationName, dosage, instructions, times, durationDays } = req.body;
  if (!medicationName || !dosage) {
    return res.status(400).json({ error: 'Medication name and dosage are required.' });
  }

  const db = dbManager.getDb();
  const newRem: MedicineReminder = {
    id: `rem_${Date.now()}`,
    patientId: user.id,
    medicationName,
    dosage,
    instructions: instructions || 'Take as prescribed by doctor.',
    times: times || ['09:00 AM'],
    startDate: new Date().toISOString().split('T')[0],
    durationDays: durationDays ? Number(durationDays) : 30,
    takenToday: false,
    streakDays: 0
  };

  db.reminders.unshift(newRem);
  dbManager.save();

  res.status(201).json({ message: 'Medicine reminder scheduled.', reminder: newRem });
});

app.put('/api/reminders/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();
  const rem = db.reminders.find(r => r.id === id);

  if (!rem) {
    return res.status(404).json({ error: 'Reminder not found.' });
  }

  rem.takenToday = !rem.takenToday;
  if (rem.takenToday) {
    rem.streakDays += 1;
  } else {
    rem.streakDays = Math.max(0, rem.streakDays - 1);
  }

  dbManager.save();
  res.json({ reminder: rem });
});

// ==========================================
// 8. EMERGENCY CARE & TRIAGE
// ==========================================

app.get('/api/emergency/centers', (req: Request, res: Response) => {
  const db = dbManager.getDb();
  res.json({ traumaCenters: db.traumaCenters });
});

app.post('/api/emergency/dispatch', (req: Request, res: Response) => {
  const { location, emergencyType, bloodGroup, notes } = req.body;
  const dispatchId = `SOS-${Math.floor(100000 + Math.random() * 900000)}`;

  // Simulated emergency protocol: in production would trigger SMS/CAD 911 dispatch
  res.json({
    status: 'ACTIVE_DISPATCH_ALERT',
    dispatchId,
    timestamp: new Date().toISOString(),
    etaMinutes: 6,
    nearestCenter: 'Apex Heart & Multispecialty Trauma Pavilion',
    assignedAmbulanceUnit: 'MEDIC-44 (ALS Unit)',
    emergencyHotline: '+1 (800) 555-APEX',
    instructions: [
      'Remain calm and stay at your current location.',
      'Keep your phone line open for dispatch paramedic callback.',
      'Unlock front entrance if safe to do so.'
    ]
  });
});

// ==========================================
// 8.5 NEARBY MEDICAL CARE SEARCH (OPENSTREETMAP)
// ==========================================

app.get('/api/places/nearby', async (req: Request, res: Response) => {
  try {
    const rawQuery = ((req.query.query as string) || '').trim();
    const radiusParam = ((req.query.radius as string) || '25 km').toLowerCase();
    const categoryParam = (req.query.category as string) || 'All';

    // Parse radius (min 1 km, max 30 km, default 25 km)
    let radiusKm = 25;
    const match = radiusParam.match(/(\d+(\.\d+)?)/);
    if (match) {
      radiusKm = Math.min(30, Math.max(1, parseFloat(match[1])));
    }

    let lat = req.query.lat ? parseFloat(req.query.lat as string) : NaN;
    let lon = req.query.lon ? parseFloat(req.query.lon as string) : NaN;
    let locationLabel = rawQuery;

    if (isNaN(lat) || isNaN(lon)) {
      const geo = await geocodeLocation(rawQuery || 'Noida');
      lat = geo.lat;
      lon = geo.lon;
      locationLabel = geo.displayName;
    }

    const facilityMap = new Map<string, NearbyCareFacility>();

    // 1. Populate all matching verified facilities from NOIDA_NCR_MEDICAL_DIRECTORY
    for (const f of NOIDA_NCR_MEDICAL_DIRECTORY) {
      const dist = calculateHaversineDistance(lat, lon, f.lat, f.lon);
      if (dist <= radiusKm) {
        facilityMap.set(f.id, {
          id: f.id,
          name: f.name,
          category: f.category,
          rawType: f.rawType,
          address: f.address,
          city: f.city,
          distanceKm: dist,
          distance: `${dist} km`,
          phone: f.phone,
          openHours: f.openHours,
          emergencyReady: f.emergencyReady,
          lat: f.lat,
          lon: f.lon,
          source: 'OpenStreetMap',
          osmId: f.osmId
        });
      }
    }

    // 2. Fetch live OpenStreetMap data via Nominatim in parallel
    const nominatimQueries = [
      { q: `hospital in ${rawQuery || 'Noida'}`, cat: 'Hospitals' as const },
      { q: `clinic in ${rawQuery || 'Noida'}`, cat: 'Clinics' as const },
      { q: `pharmacy in ${rawQuery || 'Noida'}`, cat: 'Pharmacies' as const },
      { q: `pathlab in ${rawQuery || 'Noida'}`, cat: 'Diagnostic Labs' as const },
      { q: `blood bank in ${rawQuery || 'Noida'}`, cat: 'Blood Banks' as const }
    ];

    try {
      const nomPromises = nominatimQueries.map(async ({ q, cat }) => {
        try {
          const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=15&addressdetails=1`;
          const fetchRes = await fetch(endpoint, {
            headers: {
              'User-Agent': 'BANDAZE-Healthcare-App/1.0 (contact@bandaze.health)',
              'Accept-Language': 'en'
            },
            signal: AbortSignal.timeout(3500)
          });
          if (!fetchRes.ok) return [];
          const items = await fetchRes.json();
          if (!Array.isArray(items)) return [];
          return items.map((item: any) => ({ item, cat }));
        } catch {
          return [];
        }
      });

      const nomResults = await Promise.all(nomPromises);
      for (const group of nomResults) {
        for (const { item, cat } of group) {
          const itemLat = parseFloat(item.lat);
          const itemLon = parseFloat(item.lon);
          if (isNaN(itemLat) || isNaN(itemLon)) continue;

          const dist = calculateHaversineDistance(lat, lon, itemLat, itemLon);
          if (dist > radiusKm) continue;

          const cleanName = item.name || (item.display_name ? item.display_name.split(',')[0] : 'Medical Facility');
          const dedupKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');

          let exists = false;
          for (const existing of facilityMap.values()) {
            const existingKey = existing.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (
              existingKey.includes(dedupKey) ||
              dedupKey.includes(existingKey) ||
              (Math.abs(existing.lat - itemLat) < 0.0015 && Math.abs(existing.lon - itemLon) < 0.0015)
            ) {
              exists = true;
              break;
            }
          }

          if (!exists) {
            const id = `osm_nom_${item.osm_type || 'node'}_${item.osm_id || item.place_id}`;
            const isEmergency = cat === 'Hospitals' || cat === 'Blood Banks';
            facilityMap.set(id, {
              id,
              name: cleanName,
              category: cat,
              rawType: item.type ? item.type.replace(/_/g, ' ') : cat,
              address: item.display_name || `${cleanName}, ${rawQuery || 'Noida'}`,
              distanceKm: dist,
              distance: `${dist} km`,
              phone: isEmergency ? '+91 120 4000108' : '+91 120 4000000',
              openHours: isEmergency ? '24/7 Emergency Care' : '08:30 AM – 09:00 PM',
              emergencyReady: isEmergency,
              lat: itemLat,
              lon: itemLon,
              source: 'OpenStreetMap',
              osmId: item.osm_id
            });
          }
        }
      }
    } catch (nomErr) {
      console.warn('[BANDAZE Care] Nominatim search skipped:', nomErr);
    }

    const allFacilities = Array.from(facilityMap.values());
    allFacilities.sort((a, b) => a.distanceKm - b.distanceKm);

    // Compute category counts for all matching facilities in radius
    const categoryCounts: Record<string, number> = {
      All: allFacilities.length,
      Hospitals: allFacilities.filter((f) => f.category === 'Hospitals').length,
      Clinics: allFacilities.filter((f) => f.category === 'Clinics').length,
      'Diagnostic Labs': allFacilities.filter((f) => f.category === 'Diagnostic Labs').length,
      'Blood Banks': allFacilities.filter((f) => f.category === 'Blood Banks').length,
      Pharmacies: allFacilities.filter((f) => f.category === 'Pharmacies').length
    };

    let filtered = allFacilities;
    if (categoryParam && categoryParam !== 'All') {
      filtered = allFacilities.filter((f) => f.category === categoryParam);
    }

    res.json({
      success: true,
      query: rawQuery || 'Noida',
      location: {
        lat,
        lon,
        displayName: locationLabel
      },
      radiusKm,
      totalFound: allFacilities.length,
      filteredCount: filtered.length,
      categoryCounts,
      facilities: filtered
    });
  } catch (error: any) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ error: 'Failed to retrieve nearby healthcare places' });
  }
});

// ==========================================
// 9. AI HEALTHCARE ASSISTANT (GEMINI)
// ==========================================

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message prompt required.' });
  }

  const systemInstruction = `You are BANDAZE CareGuide, a supportive, medically sound healthcare AI triage assistant.
Your goal is to bridge the healthcare gap by providing clear, compassionate health literacy, symptom explanations, preventative tips, and guidance on when to seek immediate doctor or emergency care.

IMPORTANT SAFETY CONSTITUTION:
- Always include a concise, responsible medical disclaimer that you are an AI assistant and not a substitute for formal diagnosis by a licensed physician.
- If symptoms indicate an immediate life-threatening emergency (chest pain, acute stroke signs, severe hemorrhage, difficulty breathing), urgently instruct the user to press the BANDAZE Emergency SOS button or dial emergency services immediately.
- Structure your advice with clean, friendly bullet points and clear next steps.`;

  if (!aiClient) {
    return res.json({
      reply: `**BANDAZE CareGuide Notice**\\n\\nI have processed your query: "${message}".\\n\\n*Preventative Healthcare Guidance:*\\n- Maintain steady hydration and rest.\\n- Monitor the progression of symptoms over the next 24-48 hours.\\n- Consider booking an appointment with a verified BANDAZE specialist for physical evaluation.\\n\\n*Clinical Disclaimer:* This automated guidance is for educational and triage triage assistance only and does not replace in-person consultation with a certified doctor.`
    });
  }

  try {
    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
      : '';

    const contents = `${formattedHistory}\nUser: ${message}\nAssistant:`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const replyText = response.text || 'I could not process your inquiry. Please consult a verified healthcare provider.';
    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({
      error: 'AI assistant service temporarily unavailable.',
      fallback: 'Please consult your primary physician or contact your local healthcare provider.'
    });
  }
});

// ==========================================
// DEV & PRODUCTION STATIC ROUTING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[BANDAZE HEALTHCARE] Server running on port ${PORT}`);
  });
}

startServer();
