import { INITIAL_DANA_SCHEDULES, SanghaDanaDaySchedule, SanghaDanaMealSlot } from '../data/adminDanaData';

const STORAGE_KEY_DANA_SCHEDULES = 'uruvela_dana_schedules';
export const DANA_SCHEDULES_UPDATED_EVENT = 'dana-schedules-updated';

function notifyUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DANA_SCHEDULES_UPDATED_EVENT));
  }
}

const DEFAULT_TIMES = {
  Breakfast: '07:00 AM - 08:30 AM',
  Lunch: '11:00 AM - 12:30 PM',
  Gilanpachhaya: '05:00 PM - 06:00 PM',
};

export const defaultEmptyMealSlot = (mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya'): SanghaDanaMealSlot => ({
  mealType,
  time: DEFAULT_TIMES[mealType],
  isAllocated: false,
  status: 'Available',
});

/** Helper to ensure all schedules and meal slots are safely normalized */
export function normalizeSchedule(sch: any): SanghaDanaDaySchedule {
  if (!sch || typeof sch !== 'object') {
    return {
      id: `dana-${Date.now()}`,
      dateStr: '',
      dayOfWeek: '',
      rawDate: '',
      status: 'Open',
      breakfast: defaultEmptyMealSlot('Breakfast'),
      lunch: defaultEmptyMealSlot('Lunch'),
      gilanpachhaya: defaultEmptyMealSlot('Gilanpachhaya'),
      adminNotes: [],
      auditTrail: [],
    };
  }

  const normalizeSlot = (
    slot: any,
    mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya'
  ): SanghaDanaMealSlot => {
    const base = defaultEmptyMealSlot(mealType);
    if (!slot || typeof slot !== 'object') return base;
    return {
      mealType,
      time: slot.time || base.time,
      isAllocated: Boolean(slot.isAllocated || slot.status === 'Confirmed' || slot.status === 'Pending'),
      status: slot.status || (slot.isAllocated ? 'Confirmed' : 'Available'),
      sponsorName: slot.sponsorName || undefined,
      contactPhone: slot.contactPhone || undefined,
      email: slot.email || undefined,
      dedication: slot.dedication || undefined,
      bookedOn: slot.bookedOn || undefined,
      attendeesCount: typeof slot.attendeesCount === 'number' ? slot.attendeesCount : undefined,
      dietaryNotes: slot.dietaryNotes || undefined,
      rejectionReason: slot.rejectionReason || undefined,
    };
  };

  const bf = normalizeSlot(sch.breakfast, 'Breakfast');
  const lu = normalizeSlot(sch.lunch, 'Lunch');
  const gp = normalizeSlot(sch.gilanpachhaya, 'Gilanpachhaya');

  return {
    id: String(sch.id || `dana-${sch.rawDate || Date.now()}`),
    dateStr: String(sch.dateStr || ''),
    dayOfWeek: String(sch.dayOfWeek || ''),
    rawDate: String(sch.rawDate || ''),
    status: sch.status || computeDayStatus(bf, lu, gp),
    breakfast: bf,
    lunch: lu,
    gilanpachhaya: gp,
    adminNotes: Array.isArray(sch.adminNotes) ? sch.adminNotes : [],
    auditTrail: Array.isArray(sch.auditTrail) ? sch.auditTrail : [],
  };
}

/** Compute overall day status based on the 3 meal slots */
export function computeDayStatus(
  breakfast?: SanghaDanaMealSlot | null,
  lunch?: SanghaDanaMealSlot | null,
  gilanpachhaya?: SanghaDanaMealSlot | null
): 'Allocated' | 'Partially Allocated' | 'Open' | 'Pending' {
  const bf = breakfast || defaultEmptyMealSlot('Breakfast');
  const lu = lunch || defaultEmptyMealSlot('Lunch');
  const gp = gilanpachhaya || defaultEmptyMealSlot('Gilanpachhaya');

  const bAllocated = Boolean(bf.isAllocated && bf.status === 'Confirmed');
  const lAllocated = Boolean(lu.isAllocated && lu.status === 'Confirmed');
  const gAllocated = Boolean(gp.isAllocated && gp.status === 'Confirmed');

  const hasPending = Boolean(
    (bf.isAllocated && bf.status === 'Pending') ||
    (lu.isAllocated && lu.status === 'Pending') ||
    (gp.isAllocated && gp.status === 'Pending')
  );

  if (bAllocated && lAllocated && gAllocated) {
    return 'Allocated';
  }

  if (hasPending && !bAllocated && !lAllocated && !gAllocated) {
    return 'Pending';
  }

  if (bAllocated || lAllocated || gAllocated || hasPending) {
    return 'Partially Allocated';
  }

  return 'Open';
}

/** Get all dana schedules */
export function getDanaSchedules(): SanghaDanaDaySchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DANA_SCHEDULES);
    if (raw) {
      const parsed: SanghaDanaDaySchedule[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeSchedule);
      }
    }
  } catch (err) {
    console.warn('Failed to parse dana schedules from storage:', err);
  }
  return INITIAL_DANA_SCHEDULES.map(normalizeSchedule);
}

/** Save all dana schedules and notify subscribers */
export function saveDanaSchedules(schedules: SanghaDanaDaySchedule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DANA_SCHEDULES, JSON.stringify(schedules));
  } catch (err) {
    console.error('Failed to save dana schedules to storage:', err);
  }
  notifyUpdated();
}

/** Create a Pending booking from a devotee booking via calendar */
export function createPendingBookingFromUser(data: {
  dateStr: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'evening_tea' | 'both';
  donorName: string;
  phone: string;
  email?: string;
  dedication?: string;
  attendeesCount?: number;
}): SanghaDanaDaySchedule {
  const schedules = getDanaSchedules();
  const dateObj = new Date(data.dateStr + 'T00:00:00');
  const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isBf = data.mealType === 'breakfast' || data.mealType === 'both';
  const isLu = data.mealType === 'lunch' || data.mealType === 'both';
  const isTea = data.mealType === 'evening_tea' || data.mealType === 'both';

  const makePendingSlot = (type: 'Breakfast' | 'Lunch' | 'Gilanpachhaya'): SanghaDanaMealSlot => ({
    mealType: type,
    time: DEFAULT_TIMES[type],
    isAllocated: true,
    status: 'Pending',
    sponsorName: data.donorName.trim(),
    contactPhone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    dedication: data.dedication?.trim() || 'Merit offering for Sangha',
    bookedOn: now,
    attendeesCount: data.attendeesCount || 4,
  });

  const mealLabel =
    data.mealType === 'both'
      ? 'Full Day Dana (All Meals)'
      : data.mealType === 'breakfast'
      ? 'Breakfast Dana'
      : data.mealType === 'lunch'
      ? 'Lunch Dana'
      : 'Gilanpachhaya Dana';

  const auditEntry = {
    id: `audit-${Date.now()}`,
    action: `${mealLabel} Booked by ${data.donorName} (Status: Pending verification)`,
    actor: 'Devotee / WhatsApp Flow',
    timestamp: now,
  };

  const existingIndex = schedules.findIndex((s) => s.rawDate === data.dateStr);

  let updatedSchedule: SanghaDanaDaySchedule;

  if (existingIndex >= 0) {
    const existing = schedules[existingIndex];
    const newBf = isBf ? makePendingSlot('Breakfast') : existing.breakfast;
    const newLu = isLu ? makePendingSlot('Lunch') : existing.lunch;
    const newTea = isTea ? makePendingSlot('Gilanpachhaya') : (existing.gilanpachhaya || defaultEmptyMealSlot('Gilanpachhaya'));

    updatedSchedule = {
      ...existing,
      breakfast: newBf,
      lunch: newLu,
      gilanpachhaya: newTea,
      status: computeDayStatus(newBf, newLu, newTea),
      auditTrail: [auditEntry, ...existing.auditTrail],
    };

    schedules[existingIndex] = updatedSchedule;
  } else {
    const newBf = isBf ? makePendingSlot('Breakfast') : defaultEmptyMealSlot('Breakfast');
    const newLu = isLu ? makePendingSlot('Lunch') : defaultEmptyMealSlot('Lunch');
    const newTea = isTea ? makePendingSlot('Gilanpachhaya') : defaultEmptyMealSlot('Gilanpachhaya');

    updatedSchedule = {
      id: `dana-${data.dateStr}`,
      dateStr: dateDisplay,
      dayOfWeek,
      rawDate: data.dateStr,
      status: computeDayStatus(newBf, newLu, newTea),
      breakfast: newBf,
      lunch: newLu,
      gilanpachhaya: newTea,
      adminNotes: [],
      auditTrail: [
        auditEntry,
        {
          id: `audit-init-${Date.now()}`,
          action: 'Day Schedule Created',
          actor: 'System',
          timestamp: now,
        },
      ],
    };

    schedules.unshift(updatedSchedule);
  }

  saveDanaSchedules(schedules);
  return updatedSchedule;
}

/** Confirm a pending meal booking (Admin approves payment) */
export function confirmDanaMealSlot(
  scheduleId: string,
  mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya',
  adminName = 'Admin User'
): SanghaDanaDaySchedule | null {
  const schedules = getDanaSchedules();
  const index = schedules.findIndex((s) => s.id === scheduleId);
  if (index === -1) return null;

  const target = schedules[index];
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

  const newBf = mealType === 'Breakfast' ? confirmSlot(target.breakfast) : target.breakfast;
  const newLu = mealType === 'Lunch' ? confirmSlot(target.lunch) : target.lunch;
  const newTea = mealType === 'Gilanpachhaya' ? confirmSlot(target.gilanpachhaya || defaultEmptyMealSlot('Gilanpachhaya')) : (target.gilanpachhaya || defaultEmptyMealSlot('Gilanpachhaya'));

  const auditEntry = {
    id: `audit-${Date.now()}`,
    action: `${mealType} Dana Confirmed & Allocated (Payment Verified)`,
    actor: adminName,
    timestamp: now,
  };

  const updated: SanghaDanaDaySchedule = {
    ...target,
    breakfast: newBf,
    lunch: newLu,
    gilanpachhaya: newTea,
    status: computeDayStatus(newBf, newLu, newTea),
    auditTrail: [auditEntry, ...target.auditTrail],
  };

  schedules[index] = updated;
  saveDanaSchedules(schedules);
  return updated;
}

/** Reject a pending meal booking (Admin rejects payment or invalid request) */
export function rejectDanaMealSlot(
  scheduleId: string,
  mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya',
  reason?: string,
  adminName = 'Admin User'
): SanghaDanaDaySchedule | null {
  const schedules = getDanaSchedules();
  const index = schedules.findIndex((s) => s.id === scheduleId);
  if (index === -1) return null;

  const target = schedules[index];
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
    rejectionReason: reason || 'Booking request rejected by monastery administration',
  });

  const newBf = mealType === 'Breakfast' ? rejectSlot(target.breakfast) : target.breakfast;
  const newLu = mealType === 'Lunch' ? rejectSlot(target.lunch) : target.lunch;
  const newTea = mealType === 'Gilanpachhaya' ? rejectSlot(target.gilanpachhaya || defaultEmptyMealSlot('Gilanpachhaya')) : (target.gilanpachhaya || defaultEmptyMealSlot('Gilanpachhaya'));

  const reasonText = reason ? ` (Reason: ${reason})` : '';
  const auditEntry = {
    id: `audit-${Date.now()}`,
    action: `${mealType} Dana Booking Rejected${reasonText}`,
    actor: adminName,
    timestamp: now,
  };

  const updated: SanghaDanaDaySchedule = {
    ...target,
    breakfast: newBf,
    lunch: newLu,
    gilanpachhaya: newTea,
    status: computeDayStatus(newBf, newLu, newTea),
    auditTrail: [auditEntry, ...target.auditTrail],
  };

  schedules[index] = updated;
  saveDanaSchedules(schedules);
  return updated;
}

/** Reset a rejected or cancelled slot back to Available */
export function resetDanaMealSlot(
  scheduleId: string,
  mealType: 'Breakfast' | 'Lunch' | 'Gilanpachhaya',
  adminName = 'Admin User'
): SanghaDanaDaySchedule | null {
  const schedules = getDanaSchedules();
  const index = schedules.findIndex((s) => s.id === scheduleId);
  if (index === -1) return null;

  const target = schedules[index];
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const emptySlot = defaultEmptyMealSlot(mealType);

  const newBf = mealType === 'Breakfast' ? emptySlot : target.breakfast;
  const newLu = mealType === 'Lunch' ? emptySlot : target.lunch;
  const newTea = mealType === 'Gilanpachhaya' ? emptySlot : (target.gilanpachhaya || defaultEmptyMealSlot('Gilanpachhaya'));

  const auditEntry = {
    id: `audit-${Date.now()}`,
    action: `${mealType} Slot Re-opened for Booking`,
    actor: adminName,
    timestamp: now,
  };

  const updated: SanghaDanaDaySchedule = {
    ...target,
    breakfast: newBf,
    lunch: newLu,
    gilanpachhaya: newTea,
    status: computeDayStatus(newBf, newLu, newTea),
    auditTrail: [auditEntry, ...target.auditTrail],
  };

  schedules[index] = updated;
  saveDanaSchedules(schedules);
  return updated;
}
