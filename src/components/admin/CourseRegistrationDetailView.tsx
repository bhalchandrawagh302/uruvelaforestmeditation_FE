import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  XCircle,
  Trash2,
  Lock,
  Calendar,
  Phone,
  Mail,
  User,
  Shield,
  Home,
  FileText,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Save,
  CheckCircle2,
  Copy,
  Printer
} from 'lucide-react';
import { AdminRegistrationRecord, RegistrationStatus } from '../../types';

interface CourseRegistrationDetailViewProps {
  registration: AdminRegistrationRecord;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: RegistrationStatus, adminNotes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const CourseRegistrationDetailView: React.FC<CourseRegistrationDetailViewProps> = ({
  registration,
  onBack,
  onUpdateStatus,
  onDelete,
}) => {
  const [currentRecord, setCurrentRecord] = useState<AdminRegistrationRecord>(registration);
  const [adminNotes, setAdminNotes] = useState(registration.adminNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isConfirmed = currentRecord.status === 'confirmed';

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = async (newStatus: RegistrationStatus) => {
    if (isConfirmed && newStatus !== 'confirmed') {
      alert('Confirmed registrations are locked and cannot be changed to another status. Only deletion is permitted.');
      return;
    }
    setActionLoading(true);
    try {
      await onUpdateStatus(currentRecord.id, newStatus, adminNotes);
      setCurrentRecord(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdateStatus(currentRecord.id, currentRecord.status, adminNotes);
      setCurrentRecord(prev => ({ ...prev, adminNotes }));
      setNotesSavedAlert(true);
      setTimeout(() => setNotesSavedAlert(false), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(currentRecord.id);
      setShowDeleteModal(false);
      onBack();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete registration');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#231a15]">
      {/* 1. Header Navigation & Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-[#705d53] hover:text-[#703100] hover:bg-[#f4ebe3] transition-colors cursor-pointer"
              title="Return to registrations listing"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#705d53]">
                <span>Admin</span>
                <span>&gt;</span>
                <button onClick={onBack} className="hover:text-[#8c3c0b] underline cursor-pointer">
                  Registrations
                </button>
                <span>&gt;</span>
                <span className="font-semibold text-[#8c3c0b]">{currentRecord.passCode}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231a15] mt-0.5">
                {currentRecord.applicantName}
              </h1>
            </div>
          </div>

          {/* Status Badge & Header Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                currentRecord.status === 'confirmed'
                  ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]'
                  : currentRecord.status === 'pending'
                  ? 'bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2]'
                  : currentRecord.status === 'waitlisted'
                  ? 'bg-[#fbe9e7] text-[#d84315] border border-[#ffccbc]'
                  : 'bg-[#f5f5f5] text-[#757575] border border-[#e0e0e0]'
              }`}
            >
              {currentRecord.status === 'confirmed' && <Lock className="w-3.5 h-3.5" />}
              {currentRecord.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
              {currentRecord.status === 'waitlisted' && <Clock className="w-3.5 h-3.5" />}
              {currentRecord.status === 'cancelled' && <XCircle className="w-3.5 h-3.5" />}
              <span>Status: {currentRecord.status}</span>
            </span>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dccbc0] bg-[#faf5f0] hover:bg-[#f4ebe3] text-xs font-medium text-[#554339] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* Status Actions Bar */}
        <div className="pt-4 border-t border-[#f3e7df] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Policy Notice */}
          <div className="text-xs text-[#705d53]">
            {isConfirmed ? (
              <span className="inline-flex items-center gap-1.5 text-[#2e7d32] font-medium bg-[#e8f5e9]/70 px-2.5 py-1 rounded-lg border border-[#c8e6c9]">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                Status locked upon confirmation. Only deletion is permitted.
              </span>
            ) : (
              <span>Transition status or permanently delete applicant record:</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isConfirmed && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange('confirmed')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Application</span>
                </button>

                {currentRecord.status !== 'waitlisted' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('waitlisted')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f4ebe3] hover:bg-[#e4d3c7] text-[#703100] text-xs font-semibold rounded-xl border border-[#dbc1b4] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Waitlist</span>
                  </button>
                )}

                {currentRecord.status !== 'cancelled' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('cancelled')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </>
            )}

            <button
              disabled={actionLoading}
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer disabled:opacity-50 ml-auto sm:ml-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Responsive Multi-Card Layout (Desktop 3-col / Tablet 2-col / Mobile 1-col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Card 1: Applicant Bio-data */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
            <User className="w-4 h-4 text-[#8c3c0b]" />
            <h3>Personal Bio-data</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#887367] block">Legal Full Name</span>
              <span className="font-semibold text-sm text-[#231a15]">{currentRecord.applicantName}</span>
            </div>

            <div>
              <span className="text-[#887367] block">Father / Guardian Name</span>
              <span className="font-medium text-[#231a15]">{currentRecord.fatherName || '—'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[#887367] block">Age</span>
                <span className="font-medium text-[#231a15]">{currentRecord.age} years</span>
              </div>
              <div>
                <span className="text-[#887367] block">Gender</span>
                <span className="font-medium text-[#231a15] capitalize">{currentRecord.gender}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[#887367] block">Date of Birth</span>
                <span className="font-medium text-[#231a15]">{currentRecord.dob || '—'}</span>
              </div>
              <div>
                <span className="text-[#887367] block">Prior Courses</span>
                <span className="font-medium text-[#231a15]">{currentRecord.previousCourses} Vipassana (10-Day)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#f3e7df]">
              <span className="text-[#887367] block">Pass Code</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-mono font-bold text-[#8c3c0b]">{currentRecord.passCode}</span>
                <button
                  onClick={() => copyToClipboard(currentRecord.passCode, 'passCode')}
                  className="text-xs text-[#705d53] hover:text-[#703100] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'passCode' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Contact & Residential Address */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
            <Home className="w-4 h-4 text-[#8c3c0b]" />
            <h3>Contact & Residence</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#887367] block">Phone Number</span>
              <div className="flex items-center justify-between mt-0.5">
                <a href={`tel:${currentRecord.phone}`} className="font-medium text-[#8c3c0b] hover:underline">
                  {currentRecord.phone}
                </a>
                <button
                  onClick={() => copyToClipboard(currentRecord.phone, 'phone')}
                  className="text-xs text-[#705d53] hover:text-[#703100] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[#887367] block">Email Address</span>
              <div className="flex items-center justify-between mt-0.5">
                <a href={`mailto:${currentRecord.email}`} className="font-medium text-[#8c3c0b] hover:underline truncate max-w-[200px]">
                  {currentRecord.email}
                </a>
                <button
                  onClick={() => copyToClipboard(currentRecord.email, 'email')}
                  className="text-xs text-[#705d53] hover:text-[#703100] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[#887367] block">Emergency Contact</span>
              <span className="font-medium text-[#231a15]">{currentRecord.emergencyContact || '—'}</span>
            </div>

            <div className="pt-2 border-t border-[#f3e7df]">
              <span className="text-[#887367] block">Residential Address</span>
              <p className="font-medium text-[#231a15] mt-0.5 leading-relaxed">
                {currentRecord.streetAddress ? (
                  <>
                    {currentRecord.streetAddress}
                    <br />
                    {[currentRecord.city, currentRecord.state, currentRecord.zipCode].filter(Boolean).join(', ')}
                    <br />
                    {currentRecord.country || 'India'}
                  </>
                ) : (
                  'Address details on file.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Identification & Uploaded Documents */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
            <Shield className="w-4 h-4 text-[#8c3c0b]" />
            <h3>Identity Documents</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[#887367] block">Aadhaar / PAN / Govt ID Number</span>
              <span className="font-mono font-semibold text-sm text-[#231a15]">{currentRecord.aadharPan}</span>
            </div>

            {/* Document Previews */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Candidate Selfie */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#705d53] font-medium block">Applicant Photo</span>
                {currentRecord.photoUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#dbc1b4] aspect-square bg-[#f4ebe3]">
                    <img
                      src={currentRecord.photoUrl}
                      alt="Candidate Selfie"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setPreviewImageUrl(currentRecord.photoUrl || null)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer text-[11px] font-medium"
                    >
                      Enlarge
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-[#f4ebe3] border border-dashed border-[#dbc1b4] flex items-center justify-center text-[11px] text-[#887367]">
                    No Photo
                  </div>
                )}
              </div>

              {/* Aadhaar Card Document */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#705d53] font-medium block">Aadhaar / ID Card</span>
                {currentRecord.aadharDocumentUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#dbc1b4] aspect-square bg-[#f4ebe3]">
                    <img
                      src={currentRecord.aadharDocumentUrl}
                      alt="Aadhaar ID Proof"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setPreviewImageUrl(currentRecord.aadharDocumentUrl || null)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer text-[11px] font-medium"
                    >
                      Enlarge
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl bg-[#f4ebe3] border border-dashed border-[#dbc1b4] flex items-center justify-center text-[11px] text-[#887367]">
                    No Document
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-[#887367]">
              Documents securely stored and verified against vihara admissions registry.
            </div>
          </div>
        </div>

        {/* Card 4: Course & Accommodation Details */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
            <Calendar className="w-4 h-4 text-[#8c3c0b]" />
            <h3>Course & Retreat Logistics</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#887367] block">Retreat Course</span>
              <span className="font-semibold text-sm text-[#231a15]">{currentRecord.courseTitle}</span>
            </div>

            <div>
              <span className="text-[#887367] block">Retreat Schedule</span>
              <span className="font-medium text-[#231a15]">{currentRecord.courseDates}</span>
            </div>

            <div>
              <span className="text-[#887367] block">Teacher / Sayadaw</span>
              <span className="font-medium text-[#231a15]">{currentRecord.teacher || 'Senior Sayadaw'}</span>
            </div>

            <div className="pt-2 border-t border-[#f3e7df]">
              <span className="text-[#887367] block">Assigned Lodging</span>
              <span className="font-medium text-[#703100] bg-[#fff8f5] px-2.5 py-1 rounded-lg border border-[#f0e0d6] inline-block mt-0.5">
                {currentRecord.accommodationAssigned || 'Individual Forest Kuti Assigned'}
              </span>
            </div>

            <div>
              <span className="text-[#887367] block">Application Submitted On</span>
              <span className="font-medium text-[#231a15]">{currentRecord.date}</span>
            </div>
          </div>
        </div>

        {/* Card 5: Health & Medical Declarations */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
            <AlertTriangle className="w-4 h-4 text-[#8c3c0b]" />
            <h3>Medical & Special Needs</h3>
          </div>

          <div className="space-y-3 text-xs">
            <span className="text-[#887367] block">Health Conditions / Dietary Needs</span>
            <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f0e0d6] text-[#554339] leading-relaxed">
              {currentRecord.illnessHistory || 'No physical or mental health conditions declared. Applicant has consented to full retreat code of discipline.'}
            </div>
          </div>
        </div>

        {/* Card 6: Stewardship & Internal Admin Notes */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f3e7df]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#231a15]">
              <FileText className="w-4 h-4 text-[#8c3c0b]" />
              <h3>Internal Admin Notes</h3>
            </div>
            {notesSavedAlert && (
              <span className="text-[11px] text-[#2e7d32] font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          <div className="space-y-3">
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal remarks (e.g. verified identity, seat assignment notes, interview feedback)..."
              rows={4}
              className="w-full text-xs p-3 rounded-xl border border-[#dbc1b4] bg-[#faf5f0] text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white resize-none transition-all"
            />
            <button
              disabled={isSavingNotes}
              onClick={handleSaveNotes}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#8c3c0b] hover:bg-[#722f07] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingNotes ? 'Saving Notes...' : 'Save Stewardship Notes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Image Lightbox Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-serif font-semibold text-sm text-[#231a15]">Document Preview</span>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="text-slate-500 hover:text-black text-xs font-bold px-2 py-1 cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="max-h-[80vh] flex items-center justify-center overflow-auto">
              <img
                src={previewImageUrl}
                alt="Enlarged Document"
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200 animate-scale-up">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#231a15]">
                  Delete Registration Application
                </h3>
                <p className="text-xs text-[#705d53]">Permanent and irreversible action</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#554339]">
              <p>
                Are you sure you want to permanently delete the application for:
              </p>
              <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f0e0d6] font-medium">
                <div className="text-sm font-bold text-[#231a15]">{currentRecord.applicantName}</div>
                <div className="text-[11px] text-[#705d53]">ID: {currentRecord.passCode} • Course: {currentRecord.courseTitle}</div>
                <div className="text-[11px] text-[#705d53] capitalize">Status: {currentRecord.status}</div>
              </div>

              {isConfirmed && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Capacity Alert:</strong> This application is currently <strong>Confirmed</strong>. Deleting it will restore 1 reserved seat back to the retreat course availability.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#554339] hover:bg-[#f4ebe3] transition-colors cursor-pointer"
              >
                Keep Application
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
