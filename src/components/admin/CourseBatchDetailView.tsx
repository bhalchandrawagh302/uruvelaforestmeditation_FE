import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Users,
  Globe,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Trash2,
  Edit3,
  Sparkles,
  Layers,
  Save
} from 'lucide-react';
import { Course } from '../../types';
import { updateCourse, deleteCourse, UpdateCoursePayload } from '../../services/api';

interface CourseBatchDetailViewProps {
  course: Course;
  onBack: () => void;
  onUpdateCourse: (updated: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CourseBatchDetailView: React.FC<CourseBatchDetailViewProps> = ({
  course,
  onBack,
  onUpdateCourse,
  onDeleteCourse,
}) => {
  const [currentCourse, setCurrentCourse] = useState<Course>(course);
  const [status, setStatus] = useState<'open' | 'upcoming' | 'cancelled' | 'completed'>(
    currentCourse.status
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(currentCourse.title);
  const [editStartDate, setEditStartDate] = useState(currentCourse.rawStartDate || '');
  const [editEndDate, setEditEndDate] = useState(currentCourse.rawEndDate || '');
  const [editTeacher, setEditTeacher] = useState(currentCourse.teacher);
  const [editLocation, setEditLocation] = useState(currentCourse.location || 'Dungeshwari Hall');
  const [editLanguage, setEditLanguage] = useState(currentCourse.language || 'Hindi / English');
  const [editTotalSeats, setEditTotalSeats] = useState(currentCourse.totalSeats || 30);
  const [editAvailableSeats, setEditAvailableSeats] = useState(currentCourse.availableSeats);
  const [editDescription, setEditDescription] = useState(currentCourse.description || '');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmedCount = (currentCourse.totalSeats || 30) - currentCourse.availableSeats;
  const occupancyPercentage = Math.round(
    (confirmedCount / (currentCourse.totalSeats || 30)) * 100
  );

  const handleStatusChange = async (newStatus: 'open' | 'upcoming' | 'cancelled' | 'completed') => {
    setIsUpdatingStatus(true);
    setStatus(newStatus);
    try {
      const updated = await updateCourse(currentCourse.id, { status: newStatus });
      const merged: Course = { ...currentCourse, status: newStatus };
      setCurrentCourse(merged);
      onUpdateCourse(merged);
      setStatusSuccessMessage(true);
      setTimeout(() => setStatusSuccessMessage(false), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update course status.');
      setStatus(currentCourse.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let fromDateStr = currentCourse.fromDate;
      let toDateStr = currentCourse.toDate;
      let yearStr = currentCourse.year;

      if (editStartDate) {
        const sDate = new Date(editStartDate + 'T00:00:00');
        fromDateStr = sDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        yearStr = String(sDate.getFullYear());
      }
      if (editEndDate) {
        const eDate = new Date(editEndDate + 'T00:00:00');
        toDateStr = eDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      }

      const payload: UpdateCoursePayload = {
        title: editTitle,
        rawStartDate: editStartDate,
        rawEndDate: editEndDate,
        year: parseInt(yearStr, 10),
        teacher: editTeacher,
        location: editLocation,
        language: editLanguage,
        totalSeats: editTotalSeats,
        availableSeats: editAvailableSeats,
        description: editDescription,
      };
      await updateCourse(currentCourse.id, payload);
      const updated: Course = {
        ...currentCourse,
        title: editTitle,
        fromDate: fromDateStr,
        toDate: toDateStr,
        year: yearStr,
        rawStartDate: editStartDate,
        rawEndDate: editEndDate,
        teacher: editTeacher,
        location: editLocation,
        language: editLanguage,
        totalSeats: editTotalSeats,
        availableSeats: editAvailableSeats,
        description: editDescription,
      };
      setCurrentCourse(updated);
      onUpdateCourse(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save course changes.');
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCourse(currentCourse.id);
      onDeleteCourse(currentCourse.id);
      onBack();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete retreat batch.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#231a15]">
      {/* 1. Top Navigation & Quick Actions Bar */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-[#705d53] hover:text-[#703100] hover:bg-[#f4ebe3] transition-colors cursor-pointer"
              title="Return to batches listing"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#705d53]">
                <span>Admin</span>
                <span>&gt;</span>
                <button onClick={onBack} className="hover:text-[#8c3c0b] underline cursor-pointer">
                  Batches
                </button>
                <span>&gt;</span>
                <span className="font-semibold text-[#8c3c0b]">
                  {currentCourse.batchNumber || `Batch #${currentCourse.year}`}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231a15] mt-0.5">
                {currentCourse.title}
              </h1>
            </div>
          </div>

          {/* Status Badge & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                currentCourse.status === 'open'
                  ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]'
                  : currentCourse.status === 'upcoming'
                  ? 'bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2]'
                  : currentCourse.status === 'completed'
                  ? 'bg-[#f5f5f5] text-[#757575] border border-[#e0e0e0]'
                  : 'bg-[#fbe9e7] text-[#d84315] border border-[#ffccbc]'
              }`}
            >
              <span>Status: {currentCourse.status}</span>
              <span className="font-normal text-[11px] opacity-80">
                ({currentCourse.availableSeats} left)
              </span>
            </span>

            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#dccbc0] bg-[#faf5f0] hover:bg-[#f4ebe3] text-xs font-semibold text-[#554339] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Status Switcher Bar */}
        <div className="pt-4 border-t border-[#f3e7df] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#705d53]">
            <span>Course Status Control:</span>
            {statusSuccessMessage && (
              <span className="text-[#2e7d32] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Updated!
              </span>
            )}
          </div>

          {/* Quick status selector buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange('open')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentCourse.status === 'open'
                  ? 'bg-[#2e7d32] text-white shadow-xs'
                  : 'bg-[#f4ebe3] text-[#554339] hover:bg-[#e4d3c7]'
              }`}
            >
              Open (Accepting)
            </button>

            <button
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange('upcoming')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentCourse.status === 'upcoming'
                  ? 'bg-[#e65100] text-white shadow-xs'
                  : 'bg-[#f4ebe3] text-[#554339] hover:bg-[#e4d3c7]'
              }`}
            >
              Upcoming
            </button>

            <button
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange('cancelled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentCourse.status === 'cancelled'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-[#f4ebe3] text-[#554339] hover:bg-[#e4d3c7]'
              }`}
            >
              Cancelled
            </button>

            <button
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentCourse.status === 'completed'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-[#f4ebe3] text-[#554339] hover:bg-[#e4d3c7]'
              }`}
            >
              Completed
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="ml-auto p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer"
              title="Delete Retreat Batch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content Dossier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Card 1: Capacity & Occupancy Meter */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
            <Users className="w-4 h-4 text-[#8c3c0b]" />
            <h3>Seat Capacity & Occupancy</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#887367]">Total Capacity</span>
              <span className="font-bold text-sm text-[#231a15]">
                {currentCourse.totalSeats || 30} seats
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#887367]">Confirmed Meditators</span>
              <span className="font-semibold text-[#2e7d32]">{confirmedCount} filled</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#887367]">Available Remaining</span>
              <span className="font-semibold text-[#8c3c0b]">
                {currentCourse.availableSeats} seats open
              </span>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-[11px] text-[#705d53]">
                <span>Occupancy</span>
                <span className="font-semibold">{occupancyPercentage}%</span>
              </div>
              <div className="w-full bg-[#f4ebe3] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#703100] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, occupancyPercentage))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Schedule & Hall Location */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#f3e7df]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#231a15]">
              <Calendar className="w-4 h-4 text-[#8c3c0b]" />
              <h3>Schedule & Location</h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-[#8c3c0b] hover:text-[#703100] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#887367] block">Retreat Dates</span>
              <span className="font-semibold text-sm text-[#231a15]">
                {currentCourse.fromDate} – {currentCourse.toDate}, {currentCourse.year}
              </span>
              {currentCourse.rawStartDate && currentCourse.rawEndDate && (
                <span className="text-[11px] text-[#705d53] block mt-0.5 font-mono">
                  ({currentCourse.rawStartDate} to {currentCourse.rawEndDate})
                </span>
              )}
            </div>

            <div>
              <span className="text-[#887367] block">Meditation Hall</span>
              <span className="font-medium text-[#231a15] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#8c3c0b]" />
                {currentCourse.location || 'Dungeshwari Hall'}
              </span>
            </div>

            <div>
              <span className="text-[#887367] block">Discourse Language</span>
              <span className="font-medium text-[#231a15] flex items-center gap-1 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-[#8c3c0b]" />
                {currentCourse.language || 'Hindi / English'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Lead Teacher / Sayadaw */}
        <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
            <User className="w-4 h-4 text-[#8c3c0b]" />
            <h3>Monastic Teacher</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#887367] block">Lead Sayadaw</span>
              <span className="font-semibold text-sm text-[#231a15]">{currentCourse.teacher}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f0e0d6] text-[#554339] leading-relaxed">
              Resident monastic teacher guiding personal interviews, dhamma discourses, and daily meditation instructions.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Description & Curriculum Panel */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#231a15] pb-2 border-b border-[#f3e7df]">
          <FileText className="w-4 h-4 text-[#8c3c0b]" />
          <h3>Course Syllabus & Retreat Guidelines</h3>
        </div>
        <p className="text-xs sm:text-sm text-[#554339] leading-relaxed">
          {currentCourse.description ||
            'Foundational 10-day intensive Vipassana residential retreat in noble silence. Meditators practice continuous mindfulness across sitting, walking, and daily monastic activities according to the traditional satipatthana method.'}
        </p>
      </div>

      {/* 4. Edit Course Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#dbc1b4] shadow-2xl space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto text-xs text-[#231a15]">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#231a15]">Edit Retreat Schedule & Details</h3>
                <p className="text-[11px] text-[#705d53]">Update dates, capacities, and monastic assignment</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-black cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdits} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] focus:outline-none focus:border-[#8c3c0b]"
                />
              </div>

              {/* Editable Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Start Date (Arrival) *</label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] focus:outline-none focus:border-[#8c3c0b]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">End Date (Departure) *</label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] focus:outline-none focus:border-[#8c3c0b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Teacher / Sayadaw</label>
                  <input
                    type="text"
                    required
                    value={editTeacher}
                    onChange={(e) => setEditTeacher(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#dccbc0] bg-[#fdfaf8]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Location / Hall</label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#dccbc0] bg-[#fdfaf8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Total Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editTotalSeats}
                    onChange={(e) => setEditTotalSeats(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl border border-[#dccbc0] bg-[#fdfaf8]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Available Remaining</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editAvailableSeats}
                    onChange={(e) => setEditAvailableSeats(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl border border-[#dccbc0] bg-[#fdfaf8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Teaching Language</label>
                <input
                  type="text"
                  required
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#dccbc0] bg-[#fdfaf8]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description / Syllabus</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#554339] hover:bg-[#f4ebe3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8c3c0b] text-white text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200 animate-scale-up">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#231a15]">
                  Delete Retreat Batch
                </h3>
                <p className="text-xs text-[#705d53]">Permanent and irreversible action</p>
              </div>
            </div>

            <p className="text-xs text-[#554339]">
              Are you sure you want to permanently delete <strong>{currentCourse.title}</strong> (
              {currentCourse.batchNumber || currentCourse.fromDate}) from the vihara schedule?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#554339] hover:bg-[#f4ebe3]"
              >
                Keep Batch
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Batch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
