import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Check,
  Clock,
  XCircle,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { AdminRegistrationRecord, RegistrationStatus } from '../../types';
import {
  fetchAdminRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} from '../../services/api';
import { CourseRegistrationDetailView } from './CourseRegistrationDetailView';

interface CourseRegistrationManagementViewProps {
  onTotalCountChange?: (count: number) => void;
}

export const CourseRegistrationManagementView: React.FC<CourseRegistrationManagementViewProps> = ({
  onTotalCountChange,
}) => {
  const [registrations, setRegistrations] = useState<AdminRegistrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Delete modal state
  const [deletingRecord, setDeletingRecord] = useState<AdminRegistrationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load registrations
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminRegistrations();
      setRegistrations(data);
      if (onTotalCountChange) {
        onTotalCountChange(data.length);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update status handler
  const handleUpdateStatus = async (
    id: string,
    newStatus: RegistrationStatus,
    adminNotes?: string
  ) => {
    const target = registrations.find(r => r.id === id);
    if (target?.status === 'confirmed' && newStatus !== 'confirmed') {
      alert('Confirmed registrations are locked and cannot transition to another status. Only deletion is allowed.');
      return;
    }

    try {
      await updateRegistrationStatus(id, newStatus, adminNotes);
      setRegistrations(prev =>
        prev.map(r => (r.id === id ? { ...r, status: newStatus, adminNotes: adminNotes || r.adminNotes } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      await deleteRegistration(deletingRecord.id);
      setRegistrations(prev => prev.filter(r => r.id !== deletingRecord.id));
      if (onTotalCountChange) {
        onTotalCountChange(Math.max(0, registrations.length - 1));
      }
      setDeletingRecord(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete application.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered dataset
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.applicantName.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.passCode.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchQuery, statusFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: registrations.length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      pending: registrations.filter(r => r.status === 'pending').length,
      waitlisted: registrations.filter(r => r.status === 'waitlisted').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length,
    };
  }, [registrations]);

  // Reset current page when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  // Pagination calculations
  const totalItems = filteredRegistrations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Safeguard: clamp page if data shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRegistrations.slice(start, start + pageSize);
  }, [filteredRegistrations, currentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  // If viewing details of a record
  const currentSelectedRecord = registrations.find(r => r.id === selectedRecordId);
  if (currentSelectedRecord) {
    return (
      <CourseRegistrationDetailView
        registration={currentSelectedRecord}
        onBack={() => setSelectedRecordId(null)}
        onUpdateStatus={async (id, newStatus, adminNotes) => {
          await handleUpdateStatus(id, newStatus, adminNotes);
        }}
        onDelete={async (id) => {
          await deleteRegistration(id);
          setRegistrations(prev => prev.filter(r => r.id !== id));
          if (onTotalCountChange) {
            onTotalCountChange(Math.max(0, registrations.length - 1));
          }
          setSelectedRecordId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#231a15]">
      {/* 1. Breadcrumbs & Main Heading matching UI Mockup */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-[#705d53]">
          <span>Admin</span>
          <span>&gt;</span>
          <span className="font-semibold text-[#8c3c0b]">Registrations</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#231a15] font-normal tracking-tight">
          Course Registrations
        </h1>
      </div>

      {/* 2. Main White Card Container */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-6 space-y-6">
        {/* Controls Row: Status Filter, Search, & Applicant Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                id="admin-registration-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-[#f4ebe3] border border-[#dccbc0] rounded-xl px-3.5 py-2 text-[#231a15] font-medium outline-none focus:border-[#8c3c0b] transition-all cursor-pointer"
              >
                <option value="all">All Statuses ({counts.all})</option>
                <option value="confirmed">Confirmed ({counts.confirmed})</option>
                <option value="pending">Pending ({counts.pending})</option>
                <option value="waitlisted">Waitlisted ({counts.waitlisted})</option>
                <option value="cancelled">Cancelled ({counts.cancelled})</option>
              </select>
            </div>

            {/* Quick Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#887367] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applicant or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f4ebe3] border border-[#dccbc0]/60 rounded-xl pl-8 pr-3 py-2 text-xs text-[#231a15] placeholder:text-[#99867c] focus:outline-none focus:border-[#8c3c0b] focus:bg-white transition-all"
              />
            </div>

            {(statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#8c3c0b] hover:text-[#703100] flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-xs text-[#705d53] font-medium">
            {totalItems === 0
              ? '0 applicants'
              : `Showing ${startIndex}–${endIndex} of ${totalItems} retreat ${totalItems === 1 ? 'applicant' : 'applicants'}`}
          </div>
        </div>

        {/* Desktop & Tablet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#f3e7df] text-[#705d53] font-medium text-xs">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3e7df]">
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#887367]">
                    No registrations found matching the selected filter.
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => {
                  const isConfirmed = reg.status === 'confirmed';
                  const isPending = reg.status === 'pending';
                  const isWaitlisted = reg.status === 'waitlisted';
                  const isCancelled = reg.status === 'cancelled';

                  return (
                    <tr
                      key={reg.id}
                      className="hover:bg-[#fdfaf8] transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecordId(reg.id)}
                    >
                      {/* Applicant Column */}
                      <td className="py-4 px-4 font-semibold text-[#231a15]">
                        <div className="text-[#231a15] group-hover:text-[#8c3c0b] transition-colors">
                          {reg.applicantName}
                        </div>
                        <div className="text-[11px] text-[#887367] font-normal capitalize">
                          {reg.gender} • ID: {reg.passCode || reg.id}
                        </div>
                      </td>

                      {/* Course Column */}
                      <td className="py-4 px-4 text-[#554339]">
                        {reg.courseTitle}
                      </td>

                      {/* Contact Column */}
                      <td className="py-4 px-4 text-xs text-[#554339]">
                        <div>{reg.email}</div>
                        <div className="text-[11px] text-[#887367]">{reg.phone}</div>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 px-4 text-[#705d53] whitespace-nowrap">
                        {reg.date}
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            isConfirmed
                              ? 'bg-[#e8f5e9] text-[#2e7d32]'
                              : isPending
                              ? 'bg-[#fff3e0] text-[#e65100]'
                              : isWaitlisted
                              ? 'bg-[#fbe9e7] text-[#d84315]'
                              : 'bg-[#f5f5f5] text-[#757575]'
                          }`}
                        >
                          {isConfirmed && <Lock className="w-3 h-3 text-[#2e7d32]" />}
                          {reg.status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td
                        className="py-4 px-4 text-right"
                        onClick={(e) => e.stopPropagation() /* prevent row navigation when clicking buttons */}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* STATUS RULES:
                              - If CONFIRMED: Status is locked! Cannot change to Waitlist, Cancel, or Pending.
                                Only Delete action is permitted.
                          */}
                          {isConfirmed ? (
                            <span className="text-[11px] text-[#2e7d32] font-medium mr-1 inline-flex items-center gap-1 opacity-80" title="Confirmed status is locked">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          ) : (
                            <>
                              {/* Confirm / Approve button (available when not confirmed) */}
                              <button
                                onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                                className="px-2.5 py-1 bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
                                title="Confirm application and reserve seat"
                              >
                                Approve
                              </button>

                              {/* Waitlist button (available when not waitlisted) */}
                              {!isWaitlisted && (
                                <button
                                  onClick={() => handleUpdateStatus(reg.id, 'waitlisted')}
                                  className="px-2.5 py-1 bg-[#f4ebe3] hover:bg-[#e4d3c7] text-[#703100] text-xs font-medium rounded-lg transition-colors cursor-pointer border border-[#dbc1b4]/60"
                                  title="Move to waitlist"
                                >
                                  Waitlist
                                </button>
                              )}

                              {/* Cancel button (available when not cancelled) */}
                              {!isCancelled && (
                                <button
                                  onClick={() => handleUpdateStatus(reg.id, 'cancelled')}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-slate-300"
                                  title="Cancel application"
                                >
                                  Cancel
                                </button>
                              )}
                            </>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedRecordId(reg.id)}
                            className="p-1 rounded-lg text-[#705d53] hover:text-[#703100] hover:bg-[#f4ebe3] transition-colors cursor-pointer"
                            title="View Full Application Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Action (Available at ANY stage per specification) */}
                          <button
                            onClick={() => setDeletingRecord(reg)}
                            className="p-1 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls Footer */}
        <div className="pt-4 border-t border-[#f3e7df] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#705d53]">
          <div className="flex flex-wrap items-center gap-3">
            <span>
              {totalItems === 0
                ? 'No applicants found'
                : `Showing ${startIndex} to ${endIndex} of ${totalItems} ${totalItems === 1 ? 'applicant' : 'applicants'}`}
            </span>
            <div className="flex items-center gap-1.5 border-l border-[#dbc1b4]/60 pl-3">
              <span className="text-[#887367]">Per page:</span>
              <select
                aria-label="Registrations per page"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-[#f4ebe3] border border-[#dccbc0] rounded-lg px-2.5 py-1 text-xs text-[#231a15] font-medium outline-none cursor-pointer focus:border-[#8c3c0b]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#dbc1b4]/60 flex items-center justify-center text-[#554339] hover:bg-[#f4ebe3] hover:text-[#703100] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#554339] cursor-pointer disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers(currentPage, totalPages).map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-[#887367]">
                    …
                  </span>
                );
              }
              const pageNum = p as number;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#703100] text-white shadow-2xs'
                      : 'border border-[#dbc1b4]/60 bg-white text-[#554339] hover:bg-[#f4ebe3] hover:text-[#703100]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-lg border border-[#dbc1b4]/60 flex items-center justify-center text-[#554339] hover:bg-[#f4ebe3] hover:text-[#703100] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#554339] cursor-pointer disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Delete Confirmation Prompt Modal */}
      {deletingRecord && (
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
                Are you sure you want to delete this applicant from the course registry?
              </p>
              <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#f0e0d6] font-medium">
                <div className="text-sm font-bold text-[#231a15]">{deletingRecord.applicantName}</div>
                <div className="text-[11px] text-[#705d53]">ID: {deletingRecord.passCode || deletingRecord.id} • {deletingRecord.courseTitle}</div>
                <div className="text-[11px] text-[#705d53] capitalize">Status: {deletingRecord.status}</div>
              </div>

              {deletingRecord.status === 'confirmed' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Confirmed Seat Alert:</strong> This applicant is currently <strong>Confirmed</strong>. Deleting will immediately release 1 reserved seat back into available retreat course capacity.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#554339] hover:bg-[#f4ebe3] transition-colors cursor-pointer"
              >
                Keep Application
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
