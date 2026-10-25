import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  UserCheck,
  Building2,
  Stethoscope,
  Filter,
  Eye,
  KeyRound,
  History,
  Lock,
  ExternalLink
} from 'lucide-react';
import {
  EzioxAdminUser,
  VerificationApplication,
  AdminNotification,
  User
} from '../types/index.ts';
import { api } from '../services/api.ts';

interface EzioxAdminDashboardProps {
  currentAdmin: EzioxAdminUser;
  onRefreshData: () => void;
}

export const EzioxAdminDashboard: React.FC<EzioxAdminDashboardProps> = ({
  currentAdmin,
  onRefreshData
}) => {
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, verified: 0, needsInfo: 0, rejected: 0 });
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Selected Application for Review Drawer / Modal
  const [selectedApp, setSelectedApp] = useState<VerificationApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // AI Audit State
  const [isRunningAi, setIsRunningAi] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const appData = await api.getAdminApplications({
        status: statusFilter,
        type: typeFilter
      });
      setApplications(appData.applications);
      setCounts(appData.counts);

      const notifData = await api.getAdminNotifications();
      setNotifications(notifData.notifications);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter, typeFilter]);

  const handleOpenReview = (app: VerificationApplication) => {
    setSelectedApp(app);
    setReviewNotes('');
    setReviewError(null);
    setAiAuditResult(app.aiAuditSummary || null);
  };

  const handleRunAiAudit = async () => {
    if (!selectedApp) return;
    try {
      setIsRunningAi(true);
      const res = await api.runAiAudit(selectedApp.id);
      setAiAuditResult(res.audit);
      // update local
      selectedApp.aiAuditSummary = res.audit;
    } catch (err: any) {
      alert(err.message || 'AI audit failed');
    } finally {
      setIsRunningAi(false);
    }
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (!reviewNotes.trim()) {
      setReviewError('Official audit justification notes are required for institutional compliance.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError(null);
      await api.reviewApplication(selectedApp.id, reviewAction, reviewNotes);
      setSelectedApp(null);
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      setReviewError(err.message || 'Review action failed');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 4 Authorized Team Members reference list
  const authorizedTeam = [
    { name: 'Dr. Elena Vance, MD', role: 'Senior Medical Credentialing Officer', badge: 'EZX-CRED-01', email: 'dr.elena.vance@eziox.health' },
    { name: 'Marcus Chen, JD / MS', role: 'Lead Healthcare Compliance Officer', badge: 'EZX-COMP-02', email: 'marcus.chen@eziox.health' },
    { name: 'Sarah Jenkins, RN / BSN', role: 'Clinical Verification Specialist', badge: 'EZX-CLIN-03', email: 'sarah.jenkins@eziox.health' },
    { name: 'Arjun Patel, MHA', role: 'Hospital & Institutional Auditor', badge: 'EZX-INST-04', email: 'arjun.patel@eziox.health' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* EZIOX Command Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  SECURE INSTITUTIONAL PORTAL
                </span>
                <span className="text-xs text-slate-400">/eziox-admin</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                EZIOX Medical Credentialing & Verification Center
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Primary-source validation authority for doctors, clinics, and trauma centers.
              </p>
            </div>
          </div>

          {/* Active Reviewer Identity */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-0.5 shrink-0">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <UserCheck className="w-4 h-4" />
              <span>{currentAdmin.name}</span>
            </div>
            <p className="text-[11px] text-slate-400">{currentAdmin.adminTitle}</p>
            <p className="text-[10px] text-slate-500 font-mono">
              Badge: {currentAdmin.badgeNumber} · Active Session
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">PENDING AUDIT</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600 font-mono">{counts.pending}</span>
            <span className="text-xs text-slate-400">Awaiting Action</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">OFFICIALLY VERIFIED</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">{counts.verified}</span>
            <span className="text-xs text-slate-400">Directory Live</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">NEEDS INFORMATION</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-sky-600 font-mono">{counts.needsInfo}</span>
            <span className="text-xs text-slate-400">In Triage</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">REJECTED / INELIGIBLE</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600 font-mono">{counts.rejected}</span>
            <span className="text-xs text-slate-400">Denied Badges</span>
          </div>
        </div>
      </div>

      {/* Main Review Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Application Queue */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-800">Filter Queue:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
              >
                <option value="all">All Verification Statuses</option>
                <option value="pending">Pending Review Only</option>
                <option value="needs_info">Needs More Information</option>
                <option value="verified">Verified Only</option>
                <option value="rejected">Rejected Only</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium"
              >
                <option value="all">All Provider Types</option>
                <option value="doctor">Doctors & Practitioners</option>
                <option value="hospital">Hospitals & Clinics</option>
              </select>
            </div>
          </div>

          {/* Queue Cards */}
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className={`p-5 bg-white rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  app.status === 'pending'
                    ? 'border-amber-300/80 ring-1 ring-amber-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {app.applicantType === 'doctor' ? (
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    )}
                    <span className="font-bold text-slate-900 text-sm">{app.applicantName}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      ({app.applicantType})
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        app.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : app.status === 'needs_info'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{app.specialtyOrType}</span> · Reg ID:{' '}
                    <span className="font-mono font-bold text-slate-700">{app.registrationNumber}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{app.documents.length} Submitted Documents</span>
                    {app.reviews.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-slate-600">
                          Last audit by {app.reviews[0].reviewerName}
                        </span>
                      </>
                    )}
                  </div>

                  {app.aiAuditSummary && (
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        AI Audit Score: <strong className="text-sky-700 font-mono">{app.aiAuditSummary.score}/100</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenReview(app)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Audit Application</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Col: 4 Authorized Team Members & Compliance Standards */}
        <div className="space-y-6">
          
          {/* Institutional Team List */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Authorized Credentialing Team
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Only authorized EZIOX members can issue verification badges. Self-approvals are strictly blocked by backend rule assertions.
            </p>

            <div className="space-y-2.5">
              {authorizedTeam.map((member, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs ${
                    currentAdmin.email === member.email
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{member.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{member.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{member.role}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{member.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Protocol Notice */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-700" />
              <span>EZIOX 4-Point Audit Standard:</span>
            </h4>
            <ul className="space-y-1 list-disc list-inside text-[11px]">
              <li>Direct primary source cross-reference with State Medical Registry.</li>
              <li>Verification of clean malpractice and disciplinary records.</li>
              <li>Establishment and environmental safety permits for trauma centers.</li>
              <li>Continuous CME re-certification checks every 24 months.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Review Modal / Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Clinical Credential Audit: {selectedApp.applicantName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Application ID: {selectedApp.id} · Type: {selectedApp.applicantType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Conflict of interest warning */}
              {selectedApp.applicantId === currentAdmin.id && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-xs text-rose-800 rounded-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Conflict of Interest: You cannot audit your own provider application.</span>
                </div>
              )}

              {/* Applicant Profile Snapshot */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Specialty / Type:</span>
                  <p className="font-bold text-slate-900">{selectedApp.specialtyOrType}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">State License / Reg Number:</span>
                  <p className="font-bold text-slate-900 font-mono">{selectedApp.registrationNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Affiliation / Address:</span>
                  <p className="text-slate-800">{selectedApp.affiliationOrAddress}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Current Status:</span>
                  <p className="font-bold uppercase tracking-wider text-slate-800">{selectedApp.status}</p>
                </div>
              </div>

              {/* Submitted Private Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Submitted Private Documents ({selectedApp.documents.length})
                </h4>
                {selectedApp.documents.length === 0 ? (
                  <p className="text-xs text-rose-600 italic">No verification documents attached to this file.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{doc.title}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{doc.type}</p>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-medium flex items-center gap-1"
                        >
                          <span>Inspect Original</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI-Assisted Verification Tool (Gemini) */}
              <div className="p-5 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-bold text-sky-950">
                      AI Credential Pre-Check & Consistency Audit
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAiAudit}
                    disabled={isRunningAi}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isRunningAi ? 'Analyzing Documents...' : 'Run Gemini AI Pre-Check'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-sky-800">
                  Rule-based pre-validation checks formatting, name cross-referencing, and missing documents. The human reviewer retains complete final decision authority.
                </p>

                {aiAuditResult && (
                  <div className="mt-3 p-4 bg-white rounded-lg border border-sky-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800">
                        AI Consistency Score: <strong className="text-sky-700 font-mono">{aiAuditResult.score}/100</strong>
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          aiAuditResult.status === 'pass'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {aiAuditResult.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {aiAuditResult.checklist?.map((chk: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                          {chk.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800">{chk.item}:</span>
                          <span className="text-slate-500">{chk.note}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded">
                      <strong>AI Summary:</strong> {aiAuditResult.analysis}
                    </p>
                  </div>
                )}
              </div>

              {/* Previous Review History / Audit Trail */}
              {selectedApp.reviews.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Historical Audit Logs ({selectedApp.reviews.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedApp.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-700 font-medium">
                          <span>
                            {rev.reviewerName} ({rev.reviewerTitle})
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{new Date(rev.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 italic font-sans">"{rev.notes}"</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Action: {rev.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Decision Form */}
              <form onSubmit={handleSubmitDecision} className="space-y-4 pt-4 border-t border-slate-200">
                {reviewError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg">
                    {reviewError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    Official Reviewer Decision
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewAction('approve')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        reviewAction === 'approve'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                      <span className="text-xs block">Approve & Verify</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewAction('request_info')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        reviewAction === 'request_info'
                          ? 'bg-sky-50 border-sky-600 text-sky-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 mx-auto mb-1 text-sky-600" />
                      <span className="text-xs block">Request More Info</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewAction('reject')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        reviewAction === 'reject'
                          ? 'bg-rose-50 border-rose-600 text-rose-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                      <span className="text-xs block">Reject Application</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Institutional Audit Notes & Feedback (Required)
                  </label>
                  <textarea
                    required
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter explicit clinical justification, verified registry details, or specific missing documents requested from the provider..."
                    rows={3}
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || selectedApp.applicantId === currentAdmin.id}
                    className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
                  >
                    {isSubmittingReview ? 'Recording Audit...' : 'Commit Audit Decision'}
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
