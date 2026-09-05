export type Language = 'en' | 'hi' | 'mr';

export type ScreenType = 'home' | 'courses' | 'register' | 'dana' | 'about' | 'talks' | 'library' | 'support' | 'visit' | 'dashboard' | 'admin-login';

export interface Course {
  id: string;
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
}

export interface AllocatedDanaItem {
  id: string;
  dateDisplay: string;
  meal: string;
  donor: string;
  occasion?: string;
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
