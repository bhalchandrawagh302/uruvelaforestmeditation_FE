export type Language = 'en' | 'hi' | 'mr';

export type ScreenType = 'home' | 'courses' | 'register' | 'dana' | 'about' | 'talks' | 'library' | 'support' | 'visit' | 'dashboard' | 'admin-login';

export interface Course {
  id: string;
  title: string;
  batchNumber?: string;
  year: string;
  fromDate: string;
  toDate: string;
  rawStartDate: string;
  rawEndDate: string;
  status: 'open' | 'upcoming' | 'cancelled' | 'completed';
  teacher: string;
  language: string;
  availableSeats: number;
  totalSeats?: number;
  location?: string;
  description?: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'waitlisted' | 'cancelled' | 'completed';

export interface AdminRegistrationRecord {
  id: string;
  passCode: string;
  applicantName: string;
  fatherName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'male' | 'female' | 'other';
  phone: string;
  email: string;
  emergencyContact: string;
  aadharPan: string;
  previousCourses: number;
  courseId: string;
  courseTitle: string;
  courseDates: string;
  teacher?: string;
  date: string; // Formatted application date, e.g. "Oct 12, 2026"
  status: RegistrationStatus;
  accommodationAssigned?: string;
  illnessHistory?: string;
  photoUrl?: string;
  aadharDocumentUrl?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  adminNotes?: string;
  createdAt?: string;
}

export interface RegistrationFormData {
  courseId?: string;
  arrivalDate: string;
  departureDate: string;
  fullName: string;
  fatherName: string;
  dob: string;
  phone: string;
  age: string;
  gender: 'male' | 'female' | 'other' | '';
  emergencyContact: string;
  email: string;
  aadharPan: string;
  previousCourses: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  illness: string;
  photoUrl: string | null;
  photoKey?: string | null;
  aadharPhotoUrl?: string | null;
  aadharPhotoKey?: string | null;
  passCode?: string;
  accommodationAssigned?: string;
}

export interface DanaMealSlot {
  day: number;
  dateStr: string; // "2026-10-02"
  breakfastBooked: boolean;
  breakfastDonor?: string;
  breakfastPending?: boolean;
  lunchBooked: boolean;
  lunchDonor?: string;
  lunchPending?: boolean;
  pendingDonor?: string;
  isEmpty?: boolean;
  expectedGuests?: number;
}

export interface AllocatedDanaItem {
  id: string;
  dateDisplay: string;
  meal: string;
  donor: string;
  occasion?: string;
  expectedGuests?: number;
  status: 'pending' | 'confirmed';
}

export interface DhammaTalk {
  id: string;
  title: string;
  paliTitle: string;
  speaker: string;
  duration: string;
  category: string;
  audioUrl?: string;
}

export interface AdminUserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
}
