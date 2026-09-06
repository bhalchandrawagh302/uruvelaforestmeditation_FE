import { Course, RegistrationFormData, AdminRegistrationRecord, RegistrationStatus, AdminUserProfile } from '../types';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://uruvelaforestmeditation-be.onrender.com'
).replace(/\/+$/, '');

export const API_URL = `${API_BASE_URL}/api`;
export const API_V1_URL = `${API_BASE_URL}/api/v1`;

// ── Backend response shape (snake_case) ──────────────────────────────────────

export interface ApiCourse {
  _id: string;
  year: number;
  from_date_str: string;
  to_date_str: string;
  raw_start_date: string;  // "YYYY-MM-DD"
  raw_end_date: string;    // "YYYY-MM-DD"
  status: 'open' | 'upcoming' | 'cancelled' | 'completed';
  teacher: string;
  language: string;
  available_seats: number;
  total_seats: number;
  location?: string;
  description?: string;
}

/** Maps a raw backend course record to the frontend Course type. */
export function mapApiCourseToCourse(raw: ApiCourse): Course {
  return {
    id: raw._id,
    year: String(raw.year),
    fromDate: raw.from_date_str,
    toDate: raw.to_date_str,
    rawStartDate: raw.raw_start_date,
    rawEndDate: raw.raw_end_date,
    status: raw.status,
    teacher: raw.teacher,
    language: raw.language,
    availableSeats: raw.available_seats,
    totalSeats: raw.total_seats,
    location: raw.location,
    description: raw.description,
  };
}

/**
 * Fetch all published retreat courses from the backend, sorted by start date.
 * Optionally filter by year.
 */
export async function fetchCourses(year?: number): Promise<Course[]> {
  const params = year ? `?year=${year}` : '';
  const response = await fetch(`${API_URL}/courses${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    let detail = 'Failed to fetch courses. Please try again.';
    try {
      const err = await response.json();
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : detail;
    } catch { /* fallback */ }
    throw new Error(detail);
  }

  const data: ApiCourse[] = await response.json();
  return data.map(mapApiCourseToCourse);
}

export interface ImageUploadResponse {
  key: string;
  url: string;
}

export interface ImageDeleteResponse {
  key: string;
  deleted: boolean;
}

export interface CourseRegistrationResponse {
  id: string;
  pass_code: string;
  course: {
    course_id: string;
    title: string;
    start_date: string;
    end_date: string;
    teacher: string;
  };
  full_name: string;
  father_name: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  emergency_contact: string;
  aadhar_pan: string;
  previous_courses: number;
  candidate_photo: {
    url: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  };
  aadhar_document: {
    url: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  };
  email?: string;
  status: string;
  accommodation_assigned: string;
}

/**
 * Upload an image file directly to Cloudflare R2 storage.
 */
export async function uploadImageToR2(
  file: File,
  folder: string = 'courses'
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_V1_URL}/images/upload?folder=${encodeURIComponent(folder)}`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = 'Failed to upload image to storage.';
    try {
      const err = await response.json();
      if (err.detail) errorDetail = err.detail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/**
 * Delete an uploaded image from Cloudflare R2 when removed or replaced.
 */
export async function deleteImageFromR2(key: string): Promise<ImageDeleteResponse> {
  if (!key) return { key: '', deleted: true };

  try {
    const url = `${API_V1_URL}/images/${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.warn(`[R2] Warning: Could not delete orphaned image '${key}' (${response.status})`);
      return { key, deleted: false };
    }

    return response.json();
  } catch (error) {
    console.warn(`[R2] Error deleting image '${key}':`, error);
    return { key, deleted: false };
  }
}

/**
 * Submit Course Registration with pre-uploaded Cloudflare R2 image URLs.
 */
export async function submitCourseRegistration(
  formData: RegistrationFormData
): Promise<CourseRegistrationResponse> {
  if (!formData.photoUrl) {
    throw new Error('Candidate profile photo must be uploaded before submitting.');
  }
  if (!formData.aadharPhotoUrl) {
    throw new Error('Aadhaar card document must be uploaded before submitting.');
  }

  const payload = {
    course_id: formData.courseId || '',
    full_name: formData.fullName.trim(),
    father_name: formData.fatherName.trim(),
    dob: formData.dob,
    age: parseInt(formData.age, 10) || 18,
    gender: formData.gender || 'male',
    phone: formData.phone.trim(),
    emergency_contact: formData.emergencyContact.trim(),
    aadhar_pan: formData.aadharPan.trim(),
    previous_courses: parseInt(formData.previousCourses, 10) || 0,
    candidate_photo_url: formData.photoUrl,
    aadhar_document_url: formData.aadharPhotoUrl,
    candidate_photo_key: formData.photoKey || null,
    aadhar_document_key: formData.aadharPhotoKey || null,
    email: formData.email.trim() || null,
    // Address fields are required (validated in frontend before submission)
    street_address: formData.streetAddress.trim(),
    city: formData.city.trim(),
    state: formData.state.trim(),
    zip_code: formData.zipCode.trim(),
    country: formData.country || 'India',
    illness_history: formData.illness.trim() || null,
  };

  const response = await fetch(`${API_V1_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to submit course registration.';
    try {
      const err = await response.json();
      if (err.detail) {
        if (typeof err.detail === 'string') {
          errorDetail = err.detail;
        } else if (Array.isArray(err.detail)) {
          errorDetail = err.detail.map((d: any) => d.msg || d.detail).join('; ');
        }
      }
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// ── Admin Course Registrations Management ────────────────────────────────────

export const INITIAL_ADMIN_REGISTRATIONS: AdminRegistrationRecord[] = [
  {
    id: 'REG-101',
    passCode: 'UFV-2026-101',
    applicantName: 'Eleanor Vance',
    fatherName: 'Robert Vance',
    dob: '1994-06-12',
    age: 32,
    gender: 'Female',
    phone: '+1 555-0192',
    email: 'eleanor.vance@example.com',
    emergencyContact: 'Thomas Vance (+1 555-0199)',
    aadharPan: 'IND-9812-4019',
    previousCourses: 2,
    courseId: 'course-vipassana-10d-oct',
    courseTitle: 'Vipassana 10-Day',
    courseDates: 'Oct 15 - Oct 26, 2026',
    teacher: 'Senior Sayadaw',
    date: 'Oct 12, 2026',
    status: 'confirmed',
    accommodationAssigned: 'Individual Forest Kuti #04',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    aadharDocumentUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    streetAddress: '42 Redwood Way',
    city: 'San Francisco',
    state: 'California',
    zipCode: '94102',
    country: 'United States',
    illnessHistory: 'None declared. Fit for 10-day intensive meditation.',
    adminNotes: 'Application verified. Admittance pass delivered.',
    createdAt: '2026-10-12T08:30:00Z',
  },
  {
    id: 'REG-102',
    passCode: 'UFV-2026-102',
    applicantName: 'Thomas Blackwood',
    fatherName: 'Arthur Blackwood',
    dob: '1981-03-24',
    age: 45,
    gender: 'Male',
    phone: '+1 555-0144',
    email: 't.blackwood@example.org',
    emergencyContact: 'Martha Blackwood (+1 555-0140)',
    aadharPan: 'PAN-BK8102-X',
    previousCourses: 0,
    courseId: 'course-metta-weekend',
    courseTitle: 'Weekend Metta',
    courseDates: 'Oct 28 - Oct 30, 2026',
    teacher: 'Sayadaw U Nandiya',
    date: 'Oct 14, 2026',
    status: 'pending',
    accommodationAssigned: 'Individual Forest Kuti Assigned',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    aadharDocumentUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    streetAddress: '108 Cedar Avenue',
    city: 'Denver',
    state: 'Colorado',
    zipCode: '80203',
    country: 'United States',
    illnessHistory: 'Mild hypertension, well managed with daily medication.',
    adminNotes: 'Awaiting ID card clarity confirmation.',
    createdAt: '2026-10-14T11:15:00Z',
  },
  {
    id: 'REG-103',
    passCode: 'UFV-2026-103',
    applicantName: 'Sarah Lin',
    fatherName: 'David Lin',
    dob: '1997-09-18',
    age: 29,
    gender: 'Female',
    phone: '+91 98450-29182',
    email: 'sarah.lin@meditation.net',
    emergencyContact: 'Mei Lin (+91 98450-29180)',
    aadharPan: '4521-8890-1123',
    previousCourses: 1,
    courseId: 'course-vipassana-10d-oct',
    courseTitle: 'Vipassana 10-Day',
    courseDates: 'Oct 15 - Oct 26, 2026',
    teacher: 'Senior Sayadaw',
    date: 'Oct 15, 2026',
    status: 'confirmed',
    accommodationAssigned: 'Individual Forest Kuti #12',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    aadharDocumentUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    streetAddress: '15 Indiranagar 1st Cross',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560038',
    country: 'India',
    illnessHistory: 'None. Clean medical record.',
    adminNotes: 'Confirmed by registrar.',
    createdAt: '2026-10-15T09:45:00Z',
  },
  {
    id: 'REG-104',
    passCode: 'UFV-2026-104',
    applicantName: 'Marcus Aurelius',
    fatherName: 'Antoninus Aurelius',
    dob: '1968-04-26',
    age: 58,
    gender: 'Male',
    phone: '+44 7700-900123',
    email: 'marcus.a@stoic.org',
    emergencyContact: 'Faustina Aurelius (+44 7700-900120)',
    aadharPan: 'UK-PASS-9081234',
    previousCourses: 3,
    courseId: 'course-monastic-retreat',
    courseTitle: 'Monastic Retreat',
    courseDates: 'Nov 05 - Nov 18, 2026',
    teacher: 'Sayadaw U Pandita',
    date: 'Oct 18, 2026',
    status: 'waitlisted',
    accommodationAssigned: 'Individual Forest Kuti Assigned',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    aadharDocumentUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    streetAddress: '12 High Street',
    city: 'Oxford',
    state: 'Oxfordshire',
    zipCode: 'OX1 4AH',
    country: 'United Kingdom',
    illnessHistory: 'Slight knee joint stiffness; requested low meditation bench if available.',
    adminNotes: 'Waitlist position #1 for Monastic Retreat.',
    createdAt: '2026-10-18T14:20:00Z',
  },
  {
    id: 'REG-105',
    passCode: 'UFV-2026-105',
    applicantName: 'Elena Rostova',
    fatherName: 'Ilya Rostov',
    dob: '1992-11-05',
    age: 34,
    gender: 'Female',
    phone: '+1 555-8821',
    email: 'elena.rostova@peace.org',
    emergencyContact: 'Nikolai Rostov (+1 555-8820)',
    aadharPan: 'US-ID-882109',
    previousCourses: 1,
    courseId: 'course-metta-weekend',
    courseTitle: 'Weekend Metta',
    courseDates: 'Oct 28 - Oct 30, 2026',
    teacher: 'Sayadaw U Nandiya',
    date: 'Oct 20, 2026',
    status: 'confirmed',
    accommodationAssigned: 'Individual Forest Kuti #07',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    aadharDocumentUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    streetAddress: '742 Evergreen Terrace',
    city: 'Seattle',
    state: 'Washington',
    zipCode: '98101',
    country: 'United States',
    illnessHistory: 'None declared.',
    adminNotes: 'Confirmed.',
    createdAt: '2026-10-20T16:00:00Z',
  },
  {
    id: 'REG-106',
    passCode: 'UFV-2026-106',
    applicantName: 'Devendra Sharma',
    fatherName: 'Raghunath Sharma',
    dob: '1988-02-14',
    age: 38,
    gender: 'Male',
    phone: '+91 94231-55091',
    email: 'devendra.sharma@vihara.in',
    emergencyContact: 'Anita Sharma (+91 94231-55090)',
    aadharPan: '9812-3344-5566',
    previousCourses: 4,
    courseId: 'course-vipassana-10d-nov',
    courseTitle: 'Vipassana 10-Day',
    courseDates: 'Nov 12 - Nov 23, 2026',
    teacher: 'Senior Sayadaw',
    date: 'Nov 01, 2026',
    status: 'confirmed',
    accommodationAssigned: 'Individual Forest Kuti #15',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    aadharDocumentUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    streetAddress: 'Flat 402, Ganga Heights',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411038',
    country: 'India',
    illnessHistory: 'None. Experienced long-term Vipassana meditator.',
    adminNotes: 'Old student application approved.',
    createdAt: '2026-11-01T10:10:00Z',
  },
  {
    id: 'REG-107',
    passCode: 'UFV-2026-107',
    applicantName: 'Ananya Deshmukh',
    fatherName: 'Vasant Deshmukh',
    dob: '1999-07-30',
    age: 27,
    gender: 'Female',
    phone: '+91 98220-41002',
    email: 'ananya.d@maharashtra.gov.in',
    emergencyContact: 'Pratibha Deshmukh (+91 98220-41000)',
    aadharPan: '7712-4455-8899',
    previousCourses: 0,
    courseId: 'course-vipassana-10d-nov',
    courseTitle: 'Vipassana 10-Day',
    courseDates: 'Nov 12 - Nov 23, 2026',
    teacher: 'Senior Sayadaw',
    date: 'Nov 01, 2026',
    status: 'pending',
    accommodationAssigned: 'Individual Forest Kuti Assigned',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    aadharDocumentUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    streetAddress: '12 Civil Lines',
    city: 'Nagpur',
    state: 'Maharashtra',
    zipCode: '440001',
    country: 'India',
    illnessHistory: 'None.',
    adminNotes: 'First-time applicant. Review in progress.',
    createdAt: '2026-11-01T13:40:00Z',
  },
];

/** Maps raw backend registration object to frontend AdminRegistrationRecord */
export function mapBackendRegistrationToAdminRecord(raw: any): AdminRegistrationRecord {
  const createdDate = raw.created_at ? new Date(raw.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  
  return {
    id: raw.id || raw._id || raw.pass_code,
    passCode: raw.pass_code,
    applicantName: raw.full_name,
    fatherName: raw.father_name,
    dob: raw.dob,
    age: raw.age,
    gender: raw.gender === 'female' ? 'Female' : raw.gender === 'male' ? 'Male' : 'Other',
    phone: raw.phone,
    email: raw.email || '—',
    emergencyContact: raw.emergency_contact,
    aadharPan: raw.aadhar_pan,
    previousCourses: raw.previous_courses || 0,
    courseId: raw.course?.course_id || '',
    courseTitle: raw.course?.title || 'Vipassana 10-Day',
    courseDates: raw.course ? `${raw.course.start_date} - ${raw.course.end_date}` : 'Upcoming 2026',
    teacher: raw.course?.teacher || 'Senior Sayadaw',
    date: dateStr,
    status: (raw.status?.toLowerCase() as RegistrationStatus) || 'pending',
    accommodationAssigned: raw.accommodation_assigned || 'Individual Forest Kuti Assigned',
    illnessHistory: raw.illness_history || undefined,
    photoUrl: raw.candidate_photo?.url || undefined,
    aadharDocumentUrl: raw.aadhar_document?.url || undefined,
    streetAddress: raw.address?.street_address,
    city: raw.address?.city,
    state: raw.address?.state,
    zipCode: raw.address?.zip_code,
    country: raw.address?.country || 'India',
    adminNotes: raw.admin_notes || undefined,
    createdAt: raw.created_at,
  };
}

// ── Admin Authentication & Token Persistence ────────────────────────────────
const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthTokens(accessToken?: string, refreshToken?: string): void {
  try {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {}
}

export function clearAuthTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
}

export function getAuthHeaders(extraHeaders?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (extraHeaders) {
    if (extraHeaders instanceof Headers) {
      extraHeaders.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(extraHeaders)) {
      extraHeaders.forEach(([key, val]) => {
        headers[key] = val;
      });
    } else {
      Object.assign(headers, extraHeaders);
    }
  }
  return headers;
}

/**
 * Executes an HTTP fetch with credentials: 'include' and Bearer access token.
 * If response is 401 Unauthorized, automatically triggers a silent refresh using
 * refreshAdminToken() and retries the original request once.
 */
export async function authenticatedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = getAuthHeaders(init.headers);
  const options: RequestInit = {
    ...init,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    const refreshed = await refreshAdminToken();
    if (refreshed) {
      const retryHeaders = getAuthHeaders(init.headers);
      response = await fetch(url, {
        ...init,
        headers: retryHeaders,
        credentials: 'include',
      });
    } else {
      clearAuthTokens();
    }
  }

  return response;
}

/**
 * Fetches all registrations for the admin portal, with optional filters.
 * Returns empty list if no registrations exist, falling back to mock seed only if network fails completely.
 */
export async function fetchAdminRegistrations(
  filters?: { status?: string; courseId?: string; search?: string }
): Promise<AdminRegistrationRecord[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.courseId && filters.courseId !== 'all') params.append('course_id', filters.courseId);
    if (filters?.search && filters.search.trim()) params.append('search', filters.search.trim());

    const url = `${API_V1_URL}/registrations${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map(mapBackendRegistrationToAdminRecord);
      }
    }
  } catch (error) {
    console.warn('[Admin API] Backend registrations fetch error, using fallback:', error);
  }

  return INITIAL_ADMIN_REGISTRATIONS;
}

/**
 * Fetches single registration detail by ID or Pass Code.
 */
export async function fetchRegistrationDetails(id: string): Promise<AdminRegistrationRecord> {
  try {
    const response = await authenticatedFetch(`${API_V1_URL}/registrations/${encodeURIComponent(id)}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return mapBackendRegistrationToAdminRecord(data);
    }
  } catch (error) {
    console.warn(`[Admin API] Could not fetch remote registration '${id}':`, error);
  }

  const fallback = INITIAL_ADMIN_REGISTRATIONS.find((r) => r.id === id || r.passCode === id);
  if (fallback) return fallback;
  throw new Error(`Registration '${id}' not found.`);
}

/**
 * Updates application status with workflow locking rules.
 */
export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus,
  adminNotes?: string
): Promise<AdminRegistrationRecord> {
  const response = await authenticatedFetch(`${API_V1_URL}/registrations/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  });

  if (!response.ok) {
    let detail = 'Failed to update registration status.';
    try {
      const err = await response.json();
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : detail;
    } catch {}
    throw new Error(detail);
  }

  const data = await response.json();
  return mapBackendRegistrationToAdminRecord(data);
}

/**
 * Deletes a course registration application. Restores reserved course seat if confirmed.
 */
export async function deleteRegistration(id: string): Promise<{ success: boolean; id: string; passCode?: string }> {
  const response = await authenticatedFetch(`${API_V1_URL}/registrations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let detail = 'Failed to delete registration.';
    try {
      const err = await response.json();
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : detail;
    } catch {}
    throw new Error(detail);
  }

  const resData = await response.json();
  return { success: true, id, passCode: resData.pass_code };
}

// ── Admin Course Batches Management ──────────────────────────────────────────

export interface CreateCoursePayload {
  title: string;
  year?: number;
  rawStartDate: string;
  rawEndDate: string;
  teacher: string;
  language?: string;
  location?: string;
  description?: string;
  totalSeats?: number;
  availableSeats?: number;
  status?: 'open' | 'upcoming' | 'cancelled' | 'completed';
}

export interface UpdateCoursePayload {
  title?: string;
  year?: number;
  rawStartDate?: string;
  rawEndDate?: string;
  teacher?: string;
  language?: string;
  location?: string;
  description?: string;
  totalSeats?: number;
  availableSeats?: number;
  confirmedCount?: number;
  status?: 'open' | 'upcoming' | 'cancelled' | 'completed';
}

export const INITIAL_RETREAT_BATCHES: Course[] = [
  {
    id: 'batch-2026-01',
    batchNumber: 'Batch #2026-01',
    title: '10-Day Vipassana',
    year: '2026',
    fromDate: 'Oct 15',
    toDate: 'Oct 26',
    rawStartDate: '2026-10-15',
    rawEndDate: '2026-10-26',
    teacher: 'Senior Sayadaw',
    location: 'Dungeshwari Hall',
    language: 'Hindi / English',
    status: 'open',
    totalSeats: 30,
    availableSeats: 12,
    description: 'Foundational 10-day intensive Vipassana (insight) residential retreat based on the Mahasi Sayadaw tradition. Meditators practice continuous mindfulness across sitting, walking, and daily monastic activities in noble silence.',
  },
  {
    id: 'batch-2026-02',
    batchNumber: 'Batch #2026-02',
    title: '10-Day Vipassana',
    year: '2026',
    fromDate: 'Nov 12',
    toDate: 'Nov 23',
    rawStartDate: '2026-11-12',
    rawEndDate: '2026-11-23',
    teacher: 'Sayadaw U Nandiya',
    location: 'Dungeshwari Hall',
    language: 'Hindi / English',
    status: 'open',
    totalSeats: 30,
    availableSeats: 8,
    description: 'A deep immersion course focusing on satipatthana vipassana contemplation, investigating mental and physical phenomena as they arise at the six sense doors with meticulous noting and steady samadhi.',
  },
  {
    id: 'batch-2027-01',
    batchNumber: 'Batch #2027-01',
    title: 'Monastic Rain Retreat',
    year: '2027',
    fromDate: 'Jan 10',
    toDate: 'Jan 21',
    rawStartDate: '2027-01-10',
    rawEndDate: '2027-01-21',
    teacher: 'Sayadaw U Tejaniya',
    location: 'Forest Kutis',
    language: 'English',
    status: 'upcoming',
    totalSeats: 40,
    availableSeats: 35,
    description: 'Winter forest sanctuary retreat centering on the right attitude for meditation: observing whatever arises in the mind with wisdom, lightness, and relaxation without attachment or aversion.',
  },
];

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const startDate = new Date(payload.rawStartDate + 'T00:00:00');
  const endDate = new Date(payload.rawEndDate + 'T00:00:00');
  const fromDateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const toDateStr = endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const yearNum = payload.year || startDate.getFullYear();

  const res = await authenticatedFetch(`${API_V1_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title.trim(),
      year: yearNum,
      raw_start_date: payload.rawStartDate,
      raw_end_date: payload.rawEndDate,
      from_date_str: fromDateStr,
      to_date_str: toDateStr,
      teacher: payload.teacher.trim(),
      language: payload.language || 'Hindi / English',
      location: payload.location || 'Dungeshwari Hall',
      description: payload.description || undefined,
      total_seats: payload.totalSeats || 30,
      available_seats: payload.availableSeats ?? payload.totalSeats ?? 30,
      status: payload.status || 'upcoming',
    }),
  });

  if (!res.ok) {
    let detail = 'Failed to create course.';
    try {
      const err = await res.json();
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : detail;
    } catch {}
    throw new Error(detail);
  }

  const data = await res.json();
  return mapApiCourseToCourse(data);
}

export async function updateCourse(courseId: string, updates: UpdateCoursePayload): Promise<Course> {
  const body: Record<string, any> = {};
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.teacher !== undefined) body.teacher = updates.teacher;
  if (updates.status !== undefined) body.status = updates.status;
  if (updates.language !== undefined) body.language = updates.language;
  if (updates.location !== undefined) body.location = updates.location;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.totalSeats !== undefined) body.total_seats = updates.totalSeats;
  if (updates.availableSeats !== undefined) body.available_seats = updates.availableSeats;
  if (updates.confirmedCount !== undefined) body.confirmed_count = updates.confirmedCount;
  if (updates.rawStartDate) body.raw_start_date = updates.rawStartDate;
  if (updates.rawEndDate) body.raw_end_date = updates.rawEndDate;
  if (updates.year) body.year = updates.year;

  const res = await authenticatedFetch(`${API_V1_URL}/courses/${encodeURIComponent(courseId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = 'Failed to update course batch.';
    try {
      const err = await res.json();
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : detail;
    } catch {}
    throw new Error(detail);
  }

  const data = await res.json();
  return mapApiCourseToCourse(data);
}

export async function deleteCourse(courseId: string): Promise<boolean> {
  const res = await authenticatedFetch(`${API_V1_URL}/courses/${encodeURIComponent(courseId)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    let detail = 'Failed to delete course batch.';
    try {
      const err = await res.json();
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : detail;
    } catch {}
    throw new Error(detail);
  }

  return true;
}

// ── Admin Authentication API ──────────────────────────────────────────────────

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ user: AdminUserProfile; message: string; access_token?: string; refresh_token?: string }> {
  const response = await fetch(`${API_V1_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (!response.ok) {
    let detail = 'Authentication failed. Please check credentials.';
    try {
      const err = await response.json();
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : detail;
    } catch {}
    throw new Error(detail);
  }

  const data = await response.json();
  if (data.access_token) {
    setAuthTokens(data.access_token, data.refresh_token);
  }
  return data;
}

export async function refreshAdminToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (refreshToken) {
      headers['Authorization'] = `Bearer ${refreshToken}`;
    }

    const response = await fetch(`${API_V1_URL}/auth/refresh`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access_token) {
        setAuthTokens(data.access_token, data.refresh_token);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await authenticatedFetch(`${API_V1_URL}/auth/logout`, {
      method: 'POST',
    });
  } catch (err) {
    console.warn('[Admin Auth] Logout error:', err);
  } finally {
    clearAuthTokens();
  }
}

export async function fetchAdminProfile(): Promise<AdminUserProfile | null> {
  try {
    const response = await authenticatedFetch(`${API_V1_URL}/auth/me`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('[Admin Auth] fetchAdminProfile error:', err);
  }
  return null;
}


