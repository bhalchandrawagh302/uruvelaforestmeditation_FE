import { Course } from '../types';

export interface CourseRegistrationStatus {
  canRegister: boolean;
  state: 'open' | 'ongoing' | 'upcoming' | 'closed_day7' | 'completed' | 'cancelled' | 'full';
  buttonLabel: string;
  badgeLabel: string;
  opensOnFormatted?: string;
  dayOfCourse?: number;
  reason?: string;
}

/**
 * Computes course registration eligibility dynamically based on:
 * 1. Opens exactly 1 month prior to start date (e.g. Oct 1 opens Sep 1, Oct 15 opens Sep 15).
 * 2. Allows registration while running up until the 7th day of the course (Day 1 through Day 6).
 * 3. On or after Day 7 (or after course finishes), registration closes automatically.
 * 4. Closed if marked cancelled/completed by admin, or if seats are full.
 */
export function getCourseRegistrationStatus(
  course: Course,
  referenceDate: Date = new Date()
): CourseRegistrationStatus {
  // Normalize reference date to midnight
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  // Admin cancelled
  if (course.status === 'cancelled') {
    return {
      canRegister: false,
      state: 'cancelled',
      buttonLabel: 'Cancelled',
      badgeLabel: 'Cancelled',
      reason: 'Course has been cancelled by administration.',
    };
  }

  // Parse ISO date strings (avoiding UTC timezone shift)
  const [sY, sM, sD] = (course.rawStartDate || '2026-10-15').split('-').map(Number);
  const startDate = new Date(sY, sM - 1, sD);
  startDate.setHours(0, 0, 0, 0);

  const [eY, eM, eD] = (course.rawEndDate || '2026-10-26').split('-').map(Number);
  const endDate = new Date(eY, eM - 1, eD);
  endDate.setHours(23, 59, 59, 999);

  // 1. Registration Open Date (1 month prior to start date)
  const openDate = new Date(startDate);
  openDate.setMonth(openDate.getMonth() - 1);
  openDate.setHours(0, 0, 0, 0);

  // 2. Day 7 Cutoff Date (startDate + 6 days = 7th day of the retreat)
  const day7Date = new Date(startDate);
  day7Date.setDate(day7Date.getDate() + 6);
  day7Date.setHours(0, 0, 0, 0);

  // Check seat capacity
  if (course.availableSeats !== undefined && course.availableSeats <= 0) {
    return {
      canRegister: false,
      state: 'full',
      buttonLabel: 'Seats Full',
      badgeLabel: 'Full',
      reason: 'All available kutis/seats have been reserved.',
    };
  }

  // Course has completely concluded
  if (today > endDate) {
    return {
      canRegister: false,
      state: 'completed',
      buttonLabel: 'Completed',
      badgeLabel: 'Completed',
      reason: 'This course has already concluded.',
    };
  }

  // Course is running, but today is Day 7 or later -> Disabled
  if (today >= day7Date) {
    return {
      canRegister: false,
      state: 'closed_day7',
      buttonLabel: 'Registration Closed',
      badgeLabel: 'Closed (Day 7+)',
      reason: 'Registration closes on the 7th day of the course.',
    };
  }

  // Course is currently running (Day 1 through Day 6) -> Enabled
  if (today >= startDate && today < day7Date) {
    const diffMs = today.getTime() - startDate.getTime();
    const currentDay = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return {
      canRegister: true,
      state: 'ongoing',
      buttonLabel: 'REGISTER FOR COURSE',
      badgeLabel: `Ongoing (Day ${currentDay})`,
      dayOfCourse: currentDay,
      reason: 'Course is in progress. Registrations accepted until Day 7.',
    };
  }

  // Course is upcoming and within 1 month of start date -> Enabled
  if (today >= openDate && today < startDate) {
    return {
      canRegister: true,
      state: 'open',
      buttonLabel: 'REGISTER FOR COURSE',
      badgeLabel: 'Open',
      reason: 'Registration is open.',
    };
  }

  // Course is upcoming, but more than 1 month before start date -> Disabled
  const openMonthStr = openDate.toLocaleString('en-US', { month: 'short' });
  const openDayStr = String(openDate.getDate()).padStart(2, '0');
  const opensOn = `${openMonthStr} ${openDayStr}`;

  return {
    canRegister: false,
    state: 'upcoming',
    buttonLabel: 'Upcoming',
    badgeLabel: `Opens ${opensOn}`,
    opensOnFormatted: opensOn,
    reason: `Registration opens on ${opensOn} (1 month before course start).`,
  };
}
