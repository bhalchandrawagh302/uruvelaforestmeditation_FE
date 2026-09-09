import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Check, 
  Calendar as CalendarIcon, 
  Eye, 
  EyeOff, 
  XCircle, 
  Edit3, 
  Plus, 
  Inbox, 
  Paperclip, 
  History, 
  Utensils, 
  Coffee, 
  Clock, 
  AlertCircle,
  Save,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { SanghaDanaDaySchedule, SanghaDanaMealSlot } from '../../data/adminDanaData';
import { 
  confirmDanaMealSlot, 
  rejectDanaMealSlot, 
  resetDanaMealSlot,
  computeDayStatus
} from '../../services/danaBookingService';

interface SanghaDanaDetailViewProps {
  schedule: SanghaDanaDaySchedule;
  onBack: () => void;
  onUpdateSchedule: (updated: SanghaDanaDaySchedule) => void;
}

export const SanghaDanaDetailView: React.FC<SanghaDanaDetailViewProps> = ({
  schedule,
  onBack,
  onUpdateSchedule,
}) => {
  const [showBreakfastPhone, setShowBreakfastPhone] = useState(false);
  const [showLunchPhone, setShowLunchPhone] = useState(false);
  const [showGilanpachhayaPhone, setShowGilanpachhayaPhone] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  // Modals state
  const [editingMeal, setEditingMeal] = useState<SanghaDanaMealSlot | null>(null);
  const [allocatingMealType, setAllocatingMealType] = useState<'Breakfast' | 'Lunch' | 'Gilanpachhaya' | null>(null);
  const [cancellingMealType, setCancellingMealType] = useState<'Breakfast' | 'Lunch' | 'Gilanpachhaya' | null>(null);
  const [rejectingMealType, setRejectingMealType] = useState<'Breakfast' | 'Lunch' | 'Gilanpachhaya' | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Form State for Allocate / Edit
  const [formSponsorName, setFormSponsorName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDedication, setFormDedication] = useState('');
  const [formAttendees, setFormAttendees] = useState(4);

  const breakfastSlot: SanghaDanaMealSlot = schedule.breakfast || {
    mealType: 'Breakfast',
    time: '07:00 AM - 08:30 AM',
    isAllocated: false,
    status: 'Available',
  };

  const lunchSlot: SanghaDanaMealSlot = schedule.lunch || {
    mealType: 'Lunch',
    time: '11:00 AM - 12:30 PM',
    isAllocated: false,
    status: 'Available',
  };

  const gilanpachhayaSlot: SanghaDanaMealSlot = schedule.gilanpachhaya || {
    mealType: 'Gilanpachhaya',
    time: '05:00 PM - 06:00 PM',
    isAllocated: false,
    status: 'Available',
  };

  const safeAdminNotes = Array.isArray(schedule.adminNotes) ? schedule.adminNotes : [];
  const safeAuditTrail = Array.isArray(schedule.auditTrail) ? schedule.auditTrail : [];

  const formatMaskedPhone = (phone?: string, showFull = false) => {
    if (!phone) return '—';
    if (showFull) return phone;
    const parts = phone.split(' ');
    if (parts.length >= 3) {
      return `${parts[0]} ${parts[1]} *** ${parts[parts.length - 1]}`;
    }
    return phone.replace(/(\d{3})\d{4}(\d{2})/, '$1****$2');
  };

  const handleSaveNote = () => {
    if (!newNote.trim()) return;
    const newNoteObj = {
      id: `note-${Date.now()}`,
      text: newNote.trim(),
      author: 'Admin User',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };

    const newAudit = {
      id: `audit-${Date.now()}`,
      action: 'Admin Note Added',
      actor: 'Admin User',
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    const updated: SanghaDanaDaySchedule = {
      ...schedule,
      adminNotes: [newNoteObj, ...safeAdminNotes],
      auditTrail: [newAudit, ...safeAuditTrail],
    };

    onUpdateSchedule(updated);
    setNewNote('');
  };

  const handleOpenEdit = (meal: SanghaDanaMealSlot) => {
    setEditingMeal(meal);
    setFormSponsorName(meal.sponsorName || '');
    setFormPhone(meal.contactPhone || '');
    setFormEmail(meal.email || '');
    setFormDedication(meal.dedication || '');
    setFormAttendees(meal.attendeesCount || 4);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    const updatedSlot: SanghaDanaMealSlot = {
      ...editingMeal,
      sponsorName: formSponsorName,
      contactPhone: formPhone,
      email: formEmail,
      dedication: formDedication,
      attendeesCount: formAttendees,
    };

    const updatedAudit = {
      id: `audit-${Date.now()}`,
      action: `${editingMeal.mealType} Details Updated`,
      actor: 'Admin User',
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    const updated: SanghaDanaDaySchedule = {
      ...schedule,
      breakfast: editingMeal.mealType === 'Breakfast' ? updatedSlot : schedule.breakfast,
      lunch: editingMeal.mealType === 'Lunch' ? updatedSlot : schedule.lunch,
      gilanpachhaya: editingMeal.mealType === 'Gilanpachhaya' ? updatedSlot : gilanpachhayaSlot,
      auditTrail: [updatedAudit, ...schedule.auditTrail],
    };

    onUpdateSchedule(updated);
    setEditingMeal(null);
  };

  const handleOpenAllocate = (mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya') => {
    setAllocatingMealType(mealType);
    setFormSponsorName('');
    setFormPhone('');
    setFormEmail('');
    setFormDedication('');
    setFormAttendees(4);
  };

  const handleConfirmAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingMealType) return;

    const slotTime = allocatingMealType === 'Breakfast' 
      ? '07:00 AM - 08:30 AM' 
      : allocatingMealType === 'Lunch' 
      ? '11:00 AM - 12:30 PM' 
      : '05:00 PM - 06:00 PM';

    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newSlot: SanghaDanaMealSlot = {
      mealType: allocatingMealType,
      time: slotTime,
      isAllocated: true,
      status: 'Confirmed',
      sponsorName: formSponsorName || 'Generous Donor Family',
      contactPhone: formPhone || '+94 77 123 4567',
      email: formEmail || 'donor@vihara.org',
      dedication: formDedication || 'May the merits of this dana offering bring peace to all beings.',
      bookedOn: now,
      attendeesCount: formAttendees,
    };

    const nextBreakfast = allocatingMealType === 'Breakfast' ? newSlot : schedule.breakfast;
    const nextLunch = allocatingMealType === 'Lunch' ? newSlot : schedule.lunch;
    const nextGilan = allocatingMealType === 'Gilanpachhaya' ? newSlot : gilanpachhayaSlot;

    const newStatus = computeDayStatus(nextBreakfast, nextLunch, nextGilan);

    const newAudit = {
      id: `audit-${Date.now()}`,
      action: `${allocatingMealType} Manually Allocated to ${formSponsorName || 'Donor'}`,
      actor: 'Admin User',
      timestamp: now,
    };

    const updated: SanghaDanaDaySchedule = {
      ...schedule,
      status: newStatus,
      breakfast: nextBreakfast,
      lunch: nextLunch,
      gilanpachhaya: nextGilan,
      auditTrail: [newAudit, ...schedule.auditTrail],
    };

    onUpdateSchedule(updated);
    setAllocatingMealType(null);
  };

  const handleConfirmCancel = () => {
    if (!cancellingMealType) return;

    const slotTime = cancellingMealType === 'Breakfast' 
      ? '07:00 AM - 08:30 AM' 
      : cancellingMealType === 'Lunch' 
      ? '11:00 AM - 12:30 PM' 
      : '05:00 PM - 06:00 PM';

    const emptySlot: SanghaDanaMealSlot = {
      mealType: cancellingMealType,
      time: slotTime,
      isAllocated: false,
      status: 'Available',
    };

    const nextBreakfast = cancellingMealType === 'Breakfast' ? emptySlot : schedule.breakfast;
    const nextLunch = cancellingMealType === 'Lunch' ? emptySlot : schedule.lunch;
    const nextGilan = cancellingMealType === 'Gilanpachhaya' ? emptySlot : gilanpachhayaSlot;

    const newStatus = computeDayStatus(nextBreakfast, nextLunch, nextGilan);

    const newAudit = {
      id: `audit-${Date.now()}`,
      action: `${cancellingMealType} Booking Cancelled`,
      actor: 'Admin User',
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    const updated: SanghaDanaDaySchedule = {
      ...schedule,
      status: newStatus,
      breakfast: nextBreakfast,
      lunch: nextLunch,
      gilanpachhaya: nextGilan,
      auditTrail: [newAudit, ...schedule.auditTrail],
    };

    onUpdateSchedule(updated);
    setCancellingMealType(null);
  };

  /** Confirm pending dana booking */
  const handleConfirmMealSlot = (mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya') => {
    const updated = confirmDanaMealSlot(schedule.id, mealType, 'Admin User');
    if (updated) {
      onUpdateSchedule(updated);
    } else {
      const now = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const confirmSlot = (slot: SanghaDanaMealSlot): SanghaDanaMealSlot => ({
        ...slot,
        status: 'Confirmed',
        isAllocated: true,
      });
      const newBf = mealType === 'Breakfast' ? confirmSlot(schedule.breakfast) : schedule.breakfast;
      const newLu = mealType === 'Lunch' ? confirmSlot(schedule.lunch) : schedule.lunch;
      const newTea = mealType === 'Gilanpachhaya' ? confirmSlot(gilanpachhayaSlot) : gilanpachhayaSlot;
      const updatedSchedule: SanghaDanaDaySchedule = {
        ...schedule,
        breakfast: newBf,
        lunch: newLu,
        gilanpachhaya: newTea,
        status: computeDayStatus(newBf, newLu, newTea),
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            action: `${mealType} Dana Confirmed & Allocated (Payment Verified)`,
            actor: 'Admin User',
            timestamp: now,
          },
          ...schedule.auditTrail,
        ],
      };
      onUpdateSchedule(updatedSchedule);
    }
  };

  /** Open reject modal */
  const handleOpenRejectModal = (mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya') => {
    setRejectingMealType(mealType);
    setRejectionReasonInput('');
  };

  /** Confirm rejection */
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingMealType) return;
    const updated = rejectDanaMealSlot(schedule.id, rejectingMealType, rejectionReasonInput.trim(), 'Admin User');
    if (updated) {
      onUpdateSchedule(updated);
    } else {
      const now = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const rejectSlot = (slot: SanghaDanaMealSlot): SanghaDanaMealSlot => ({
        ...slot,
        status: 'Rejected',
        isAllocated: false,
        rejectionReason: rejectionReasonInput.trim() || 'Booking rejected by monastery administration',
      });
      const newBf = rejectingMealType === 'Breakfast' ? rejectSlot(schedule.breakfast) : schedule.breakfast;
      const newLu = rejectingMealType === 'Lunch' ? rejectSlot(schedule.lunch) : schedule.lunch;
      const newTea = rejectingMealType === 'Gilanpachhaya' ? rejectSlot(gilanpachhayaSlot) : gilanpachhayaSlot;
      const updatedSchedule: SanghaDanaDaySchedule = {
        ...schedule,
        breakfast: newBf,
        lunch: newLu,
        gilanpachhaya: newTea,
        status: computeDayStatus(newBf, newLu, newTea),
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            action: `${rejectingMealType} Dana Booking Rejected${rejectionReasonInput.trim() ? ` (Reason: ${rejectionReasonInput.trim()})` : ''}`,
            actor: 'Admin User',
            timestamp: now,
          },
          ...schedule.auditTrail,
        ],
      };
      onUpdateSchedule(updatedSchedule);
    }
    setRejectingMealType(null);
  };

  /** Re-open a rejected slot for other devotees */
  const handleResetSlotToAvailable = (mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya') => {
    const updated = resetDanaMealSlot(schedule.id, mealType, 'Admin User');
    if (updated) {
      onUpdateSchedule(updated);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  /** Helper to render each meal slot card */
  const renderMealCard = (
    mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya',
    title: string,
    timeDesc: string,
    icon: React.ReactNode,
    slot: SanghaDanaMealSlot,
    showPhone: boolean,
    setShowPhone: (val: boolean) => void
  ) => {
    const isPending = slot.status === 'Pending';
    const isConfirmed = slot.status === 'Confirmed';
    const isRejected = slot.status === 'Rejected';
    const hasSponsor = slot.isAllocated || isPending || isRejected;

    return (
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/60 shadow-xs overflow-hidden p-6 sm:p-7 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#f8ece4] border border-[#d8c8bd]/60 flex items-center justify-center text-[#8c3c0b]">
              {icon}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#231a15] tracking-tight">
                {title}
              </h2>
              <span className="text-xs text-[#705d53] font-medium">
                {slot.time || timeDesc}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isConfirmed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
              <Check className="w-3.5 h-3.5" />
              <span>Confirmed & Allocated</span>
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff8e1] text-[#b45309] border border-[#fde68a] animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Confirmation</span>
            </span>
          )}
          {isRejected && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]">
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
            </span>
          )}
          {!hasSponsor && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff3e0] text-[#b35c1e] border border-[#ffe0b2]">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Available</span>
            </span>
          )}
        </div>

        {/* Meal Body */}
        {hasSponsor ? (
          <div className="space-y-5">
            {/* Pending Notice Banner */}
            {isPending && (
              <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#92400e]">
                <Clock className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#78350f]">Awaiting WhatsApp Payment Screenshot Verification</p>
                  <p className="text-[11px] text-[#92400e] leading-relaxed">
                    The devotee submitted this booking on the calendar. Once you verify their transaction screenshot, click <strong>Confirm Dana</strong> to allocate this slot, or <strong>Reject</strong> if payment is not received.
                  </p>
                </div>
              </div>
            )}

            {/* Rejected Notice Banner */}
            {isRejected && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#991b1b]">
                <XCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#7f1d1d]">Offering Request Rejected</p>
                  <p className="text-[11px] text-[#b91c1c]">
                    {slot.rejectionReason || 'This booking was rejected. Click below to re-open the slot for devotees.'}
                  </p>
                </div>
              </div>
            )}

            {/* Sponsor & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#887367] font-medium block mb-0.5">Sponsor</span>
                <span className="font-serif text-base text-[#231a15] font-semibold">
                  {slot.sponsorName || '—'}
                </span>
              </div>
              <div>
                <span className="text-[#887367] font-medium block mb-0.5">Contact</span>
                <div className="flex items-center gap-2 text-sm text-[#231a15] font-medium">
                  <span>{formatMaskedPhone(slot.contactPhone, showPhone)}</span>
                  <button
                    type="button"
                    onClick={() => setShowPhone(!showPhone)}
                    className="text-[#887367] hover:text-[#703100] transition-colors p-1"
                    title={showPhone ? "Mask number" : "Reveal full number"}
                  >
                    {showPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Dedication Message Box */}
            {slot.dedication && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#554339]">Dedication / Message</span>
                <div className="bg-[#fbf4ee] border border-[#edd5c8] rounded-xl p-4 text-xs sm:text-sm italic text-[#554339] leading-relaxed">
                  "{slot.dedication}"
                </div>
              </div>
            )}

            {/* Booked On & Attendees */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#887367] pt-1">
              <div>
                <span>Booked On </span>
                <span className="text-[#554339] font-medium">{slot.bookedOn || 'Recently'}</span>
              </div>
              {slot.attendeesCount && (
                <div>
                  <span>Expected Guests: </span>
                  <span className="text-[#554339] font-medium">{slot.attendeesCount} persons</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3 border-t border-[#f3e7df]">
              {/* 1. When PENDING (Not confirmed or rejected already): Show Confirm & Reject buttons */}
              {isPending && (
                <>
                  <button
                    onClick={() => handleConfirmMealSlot(mealType)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2e7d32] hover:bg-[#1b5e20] active:bg-[#144717] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Dana (Allocate)</span>
                  </button>

                  <button
                    onClick={() => handleOpenRejectModal(mealType)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#f5c2c7] hover:bg-[#fff5f5] text-red-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Booking</span>
                  </button>
                </>
              )}

              {/* 2. When CONFIRMED: Show Cancel Booking (Confirm/Reject are hidden) */}
              {isConfirmed && (
                <button
                  onClick={() => setCancellingMealType(mealType)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#f5c2c7] hover:bg-[#fff5f5] text-red-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Booking</span>
                </button>
              )}

              {/* 3. When REJECTED: Show Re-open Slot */}
              {isRejected && (
                <button
                  onClick={() => handleResetSlotToAvailable(mealType)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#c4a99b] hover:bg-[#f6eee8] text-[#703100] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Re-open Slot for Devotees</span>
                </button>
              )}

              {/* Edit Details is available for any active record (except rejected) */}
              {!isRejected && (
                <button
                  onClick={() => handleOpenEdit(slot)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#d6c5ba] hover:bg-[#faf4f0] text-[#703100] text-xs font-semibold rounded-xl transition-colors cursor-pointer ml-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#8c3c0b]" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty Slot - Dashed Box */
          <div className="border-2 border-dashed border-[#e6d7cf] rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 bg-[#fdfaf8]">
            <div className="w-10 h-10 rounded-full bg-[#f6eee8] flex items-center justify-center text-[#8c3c0b]">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#705d53] font-medium max-w-sm">
              No sponsor currently allocated for {title.toLowerCase()}.
            </p>
            <button
              onClick={() => handleOpenAllocate(mealType)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#8c3c0b] hover:bg-[#722f07] active:bg-[#5a2404] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Manually Allocate</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-[#dbc1b4]/60 hover:bg-[#f8ede6] flex items-center justify-center text-[#554339] hover:text-[#703100] transition-colors shadow-xs"
            aria-label="Back to Sangha Schedule"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231a15] tracking-tight">
                {schedule.dateStr}
              </h1>
              {/* Day Status Badge */}
              {schedule.status === 'Allocated' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                  <Check className="w-3 h-3" />
                  <span>Allocated</span>
                </span>
              )}
              {schedule.status === 'Partially Allocated' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff3e0] text-[#b35c1e] border border-[#ffe0b2]">
                  <span>Partially Allocated</span>
                </span>
              )}
              {schedule.status === 'Pending' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff8e1] text-[#b45309] border border-[#fde68a] animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>Pending Confirmation</span>
                </span>
              )}
              {schedule.status === 'Open' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5efe9] text-[#705d53] border border-[#dccbc0]">
                  <span>Open</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#705d53] font-medium mt-0.5">
              Sangha Dana Schedule • {schedule.dayOfWeek}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#c4a99b] hover:bg-[#f6eee8] text-[#703100] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer w-fit"
        >
          <Printer className="w-4 h-4 text-[#8c3c0b]" />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Span 2): Meals Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Breakfast Dana Card */}
          {renderMealCard(
            'Breakfast',
            'Breakfast Dana',
            '07:00 AM - 08:30 AM',
            <Coffee className="w-5 h-5" />,
            breakfastSlot,
            showBreakfastPhone,
            setShowBreakfastPhone
          )}

          {/* 2. Lunch Dana Card */}
          {renderMealCard(
            'Lunch',
            'Lunch Dana',
            '11:00 AM - 12:30 PM',
            <Utensils className="w-5 h-5" />,
            lunchSlot,
            showLunchPhone,
            setShowLunchPhone
          )}

          {/* 3. Gilanpachhaya Dana Card */}
          {renderMealCard(
            'Gilanpachhaya',
            'Gilanpachhaya Dana',
            '05:00 PM - 06:00 PM (Evening Tea & Refreshments)',
            <Sparkles className="w-5 h-5" />,
            gilanpachhayaSlot,
            showGilanpachhayaPhone,
            setShowGilanpachhayaPhone
          )}
        </div>

        {/* Right Column (Span 1): Admin Notes & Audit Trail */}
        <div className="space-y-6">
          {/* Panel 1: Admin Notes */}
          <div className="bg-white rounded-2xl border border-[#dbc1b4]/60 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#231a15]">
              <Paperclip className="w-4 h-4 text-[#8c3c0b]" />
              <span>Admin Notes</span>
            </div>

            {/* Note input area */}
            <div className="space-y-2.5">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private notes regarding this day's arrangements..."
                rows={3}
                className="w-full bg-[#fdfaf8] border border-[#dccbc0] rounded-xl p-3 text-xs text-[#231a15] placeholder:text-[#a6958b] focus:outline-none focus:border-[#8c3c0b] focus:bg-white resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-1.5 bg-white border border-[#c4a99b] hover:bg-[#f6eee8] text-[#703100] text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Previous Notes Section */}
            {safeAdminNotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#f3e7df]">
                <span className="text-[11px] font-semibold text-[#705d53] uppercase tracking-wider block">
                  Previous Notes
                </span>
                <div className="space-y-2.5">
                  {safeAdminNotes.map((note) => (
                    <div 
                      key={note.id} 
                      className="bg-[#fbf4ee] border border-[#edd5c8] rounded-xl p-3.5 text-xs text-[#44352d] space-y-1.5"
                    >
                      <p className="leading-relaxed font-normal">{note.text}</p>
                      <div className="text-[10px] text-[#887367] flex items-center justify-end gap-1 font-medium">
                        <span>- {note.author}</span>
                        <span>({note.date})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel 2: Audit Trail */}
          <div className="bg-white rounded-2xl border border-[#dbc1b4]/60 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#231a15]">
              <History className="w-4 h-4 text-[#8c3c0b]" />
              <span>Audit Trail</span>
            </div>

            <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#eddcd2]">
              {safeAuditTrail.map((item, index) => {
                const isFirst = index === 0;
                return (
                  <div key={item.id} className="relative text-xs space-y-0.5">
                    {/* Circle Dot */}
                    <div 
                      className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        isFirst ? 'bg-[#8c3c0b] ring-2 ring-[#f4dcd0]' : 'bg-[#c9b2a6]'
                      }`} 
                    />
                    <p className="text-[#231a15] font-medium leading-snug">
                      {item.action}
                    </p>
                    <p className="text-[11px] text-[#887367]">
                      {item.actor} • {item.timestamp}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Manually Allocate Modal */}
      {allocatingMealType && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dbc1b4] shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#f3e7df] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#231a15]">
                  Manually Allocate {allocatingMealType}
                </h3>
                <p className="text-xs text-[#705d53]">
                  {schedule.dateStr} • {schedule.dayOfWeek}
                </p>
              </div>
              <button
                onClick={() => setAllocatingMealType(null)}
                className="text-[#887367] hover:text-[#231a15] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAllocate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Sponsor / Family / Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silva Family or Upasaka Sangha"
                  value={formSponsorName}
                  onChange={(e) => setFormSponsorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Attendees</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Email Address</label>
                <input
                  type="email"
                  placeholder="donor@example.org"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Dedication / Intention</label>
                <textarea
                  rows={2}
                  placeholder="In memory of departed loved ones or for family blessings..."
                  value={formDedication}
                  onChange={(e) => setFormDedication(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f3e7df]">
                <button
                  type="button"
                  onClick={() => setAllocatingMealType(null)}
                  className="px-4 py-2 rounded-xl text-[#705d53] hover:bg-[#f4ebe3] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8c3c0b] hover:bg-[#722f07] text-white font-semibold shadow-xs"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Details Modal */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dbc1b4] shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#f3e7df] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#231a15]">
                  Edit {editingMeal.mealType} Details
                </h3>
                <p className="text-xs text-[#705d53]">
                  {schedule.dateStr} • {schedule.dayOfWeek}
                </p>
              </div>
              <button
                onClick={() => setEditingMeal(null)}
                className="text-[#887367] hover:text-[#231a15] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Sponsor Name *</label>
                <input
                  type="text"
                  required
                  value={formSponsorName}
                  onChange={(e) => setFormSponsorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Contact Phone</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Attendees</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Dedication / Message</label>
                <textarea
                  rows={3}
                  value={formDedication}
                  onChange={(e) => setFormDedication(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f3e7df]">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 rounded-xl text-[#705d53] hover:bg-[#f4ebe3] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8c3c0b] hover:bg-[#722f07] text-white font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Cancel Booking Confirmation */}
      {cancellingMealType && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#dbc1b4] shadow-2xl space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#231a15]">
                Cancel {cancellingMealType} Booking?
              </h3>
              <p className="text-xs text-[#705d53]">
                This will release the slot back to available status for {schedule.dateStr}.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCancellingMealType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#554339] bg-[#f4ebe3] hover:bg-[#e4d3c7]"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-700 hover:bg-red-800 shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Reject Booking Modal */}
      {rejectingMealType && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dbc1b4] shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#f3e7df] pb-3">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#231a15]">
                    Reject {rejectingMealType} Booking
                  </h3>
                  <p className="text-xs text-[#705d53]">
                    {schedule.dateStr} • {schedule.dayOfWeek}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectingMealType(null)}
                className="text-[#887367] hover:text-[#231a15] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#fff5f5] border border-[#fed7d7] rounded-xl text-red-800 space-y-1">
                <p className="font-semibold">Reject this offering request?</p>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  This will mark the booking as Rejected. The devotee's request will not be allocated. You can re-open the slot for other devotees at any time.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Rejection Reason (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Payment screenshot not received / Incomplete details / Duplicate request..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f3e7df]">
                <button
                  type="button"
                  onClick={() => setRejectingMealType(null)}
                  className="px-4 py-2 rounded-xl text-[#705d53] hover:bg-[#f4ebe3] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
