import { Course, RegistrationFormData } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://uruvelaforestmeditation-be.onrender.com/api/v1';

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

  const url = `${API_BASE_URL}/images/upload?folder=${encodeURIComponent(folder)}`;
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
    const url = `${API_BASE_URL}/images/${encodeURIComponent(key)}`;
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
    course_id: formData.courseId || 'default-course-id',
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
    candidate_photo_key: (formData as any).photoKey || null,
    aadhar_document_key: (formData as any).aadharPhotoKey || null,
    email: formData.email.trim() ? formData.email.trim() : null,
    street_address: formData.streetAddress.trim() ? formData.streetAddress.trim() : null,
    city: formData.city.trim() ? formData.city.trim() : null,
    state: formData.state.trim() ? formData.state.trim() : null,
    zip_code: formData.zipCode.trim() ? formData.zipCode.trim() : null,
    country: formData.country || 'India',
    illness_history: formData.illness.trim() ? formData.illness.trim() : null,
  };

  const response = await fetch(`${API_BASE_URL}/registrations`, {
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
