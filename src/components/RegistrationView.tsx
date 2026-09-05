import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, User, ArrowLeft, Printer, CreditCard, ShieldCheck, X, AlertCircle, Calendar } from 'lucide-react';
import { Course, Language, RegistrationFormData } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';
import { uploadImageToR2, deleteImageFromR2, submitCourseRegistration } from '../services/api';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface RegistrationViewProps {
  language: Language;
  selectedCourse?: Course | null;
  onBackToCourses: () => void;
  onSubmitSuccess: (data: RegistrationFormData) => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  language,
  selectedCourse,
  onBackToCourses,
  onSubmitSuccess,
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RegistrationFormData>({
    courseId: selectedCourse?.id || 'course-oct-2026',
    arrivalDate: selectedCourse?.rawStartDate || '2026-10-15',
    departureDate: selectedCourse?.rawEndDate || '2026-10-26',
    fullName: '',
    fatherName: '',
    dob: '',
    phone: '',
    age: '',
    gender: '',
    emergencyContact: '',
    email: '',
    aadharPan: '',
    previousCourses: '0',
    streetAddress: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    illness: '',
    photoUrl: null,
    photoKey: null,
    aadharPhotoUrl: null,
    aadharPhotoKey: null,
  });

  useEffect(() => {
    if (selectedCourse) {
      setFormData((prev) => ({
        ...prev,
        courseId: selectedCourse.id,
        arrivalDate: selectedCourse.rawStartDate || prev.arrivalDate,
        departureDate: selectedCourse.rawEndDate || prev.departureDate,
      }));
    }
  }, [selectedCourse]);

  // Profile Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoSize, setPhotoSize] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Aadhaar Document state
  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [aadharKey, setAadharKey] = useState<string | null>(null);
  const [aadharUploading, setAadharUploading] = useState(false);
  const [aadharSize, setAadharSize] = useState<string | null>(null);
  const [aadharError, setAadharError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<RegistrationFormData | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload Profile Photo with Instant Preview & Automatic R2 Cleanup on Reupload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setPhotoError(`Photo exceeds ${MAX_FILE_SIZE_MB}MB limit (${formatFileSize(file.size)}). Please choose a smaller image.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WebP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 1. Instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPhotoPreview(localPreviewUrl);
    setPhotoSize(formatFileSize(file.size));
    setPhotoError(null);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.photoUrl;
      return next;
    });

    // 2. If a previous photo was already uploaded, delete it from R2
    const previousKey = photoKey;
    if (previousKey) {
      deleteImageFromR2(previousKey).catch(console.warn);
    }

    // 3. Upload asynchronously to Cloudflare R2
    setPhotoUploading(true);
    try {
      const result = await uploadImageToR2(file, 'courses/selfies');
      setPhotoKey(result.key);
      setFormData((prev) => ({
        ...prev,
        photoUrl: result.url,
        photoKey: result.key,
      }));
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Upload Aadhaar Card Photo with Instant Preview & Automatic R2 Cleanup on Reupload
  const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setAadharError(`Aadhaar image exceeds ${MAX_FILE_SIZE_MB}MB limit (${formatFileSize(file.size)}). Please choose a smaller image.`);
      if (aadharInputRef.current) aadharInputRef.current.value = '';
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setAadharError('Please select a valid image or PDF document.');
      if (aadharInputRef.current) aadharInputRef.current.value = '';
      return;
    }

    // 1. Instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setAadharPreview(localPreviewUrl);
    setAadharSize(formatFileSize(file.size));
    setAadharError(null);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.aadharPhotoUrl;
      return next;
    });

    // 2. If a previous Aadhaar was already uploaded, delete it from R2
    const previousKey = aadharKey;
    if (previousKey) {
      deleteImageFromR2(previousKey).catch(console.warn);
    }

    // 3. Upload asynchronously to Cloudflare R2
    setAadharUploading(true);
    try {
      const result = await uploadImageToR2(file, 'courses/aadhar');
      setAadharKey(result.key);
      setFormData((prev) => ({
        ...prev,
        aadharPhotoUrl: result.url,
        aadharPhotoKey: result.key,
      }));
    } catch (err: any) {
      setAadharError(err.message || 'Failed to upload Aadhaar card. Please try again.');
    } finally {
      setAadharUploading(false);
    }
  };

  // Remove photo and clean up from Cloudflare R2
  const handleRemovePhoto = async (type: 'profile' | 'aadhar') => {
    if (type === 'profile') {
      const keyToDelete = photoKey;
      setPhotoPreview(null);
      setPhotoKey(null);
      setPhotoSize(null);
      setPhotoError(null);
      setFormData((prev) => ({ ...prev, photoUrl: null, photoKey: null }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (keyToDelete) {
        await deleteImageFromR2(keyToDelete);
      }
    } else {
      const keyToDelete = aadharKey;
      setAadharPreview(null);
      setAadharKey(null);
      setAadharSize(null);
      setAadharError(null);
      setFormData((prev) => ({ ...prev, aadharPhotoUrl: null, aadharPhotoKey: null }));
      if (aadharInputRef.current) aadharInputRef.current.value = '';
      if (keyToDelete) {
        await deleteImageFromR2(keyToDelete);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (apiError) setApiError(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 1. Photos
    if (!formData.photoUrl && !photoPreview) {
      errors.photoUrl = 'Candidate selfie photo is required';
    } else if (photoUploading) {
      errors.photoUrl = 'Please wait for your selfie photo to finish uploading';
    }

    if (!formData.aadharPhotoUrl && !aadharPreview) {
      errors.aadharPhotoUrl = 'Aadhaar card image is required';
    } else if (aadharUploading) {
      errors.aadharPhotoUrl = 'Please wait for your Aadhaar card to finish uploading';
    }

    // 2. Dates
    if (!formData.arrivalDate) errors.arrivalDate = 'Start date is required';
    if (!formData.departureDate) errors.departureDate = 'End date is required';

    // 3. Personal Info
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.fatherName.trim()) errors.fatherName = "Father's name is required";
    if (!formData.dob) errors.dob = 'Date of birth is required';

    // 4. Contact & Demographics
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.age.trim()) errors.age = 'Age is required';
    if (!formData.gender) errors.gender = 'Gender selection is required';

    // 5. Emergency Contact
    if (!formData.emergencyContact.trim()) errors.emergencyContact = 'Emergency contact is required';

    // 6. Email (Optional validation)
    if (formData.email.trim() && !formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }

    // 7. Identity & Experience
    if (!formData.aadharPan.trim()) errors.aadharPan = 'Aadhar / PAN number is required';
    if (formData.previousCourses === '' || formData.previousCourses === undefined) {
      errors.previousCourses = 'Previous courses count is required (enter 0 if none)';
    }

    // 8. Residential Address
    if (!formData.streetAddress.trim()) errors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.zipCode.trim()) errors.zipCode = 'PIN / Zip code is required';

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstKey = Object.keys(errors)[0];
      if (firstKey === 'photoUrl' || firstKey === 'aadharPhotoUrl') {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      } else {
        const el = document.getElementsByName(firstKey)[0];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        } else {
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitCourseRegistration(formData);

      const confirmedData: RegistrationFormData = {
        ...formData,
        passCode: response.pass_code,
        accommodationAssigned: response.accommodation_assigned,
        photoUrl: response.candidate_photo?.url || formData.photoUrl,
        aadharPhotoUrl: response.aadhar_document?.url || formData.aadharPhotoUrl,
      };

      setSubmittedData(confirmedData);
      onSubmitSuccess(confirmedData);
    } catch (err: any) {
      console.error('[Registration] Submission error:', err);
      setApiError(err.message || 'Failed to submit registration. Please try again.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-40 pb-20 px-4 md:px-6 min-h-screen">
      <div className="max-w-[1120px] mx-auto">
        {/* Back navigation button */}
        <div className="mb-6 max-w-[850px] mx-auto">
          <button
            onClick={onBackToCourses}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#703100] hover:text-[#b35c1e] transition-colors py-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses Schedule</span>
          </button>
        </div>

        {/* Main Form Container */}
        <div className="bg-[#fff1eb] rounded-2xl p-6 sm:p-8 md:p-12 max-w-[850px] mx-auto shadow-xs border border-[#dbc1b4]/40">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#703100] mb-6 border-b border-[#dbc1b4] pb-4 font-normal tracking-tight">
            {t.regTitle}
          </h2>

          <p className="text-[#554339] text-sm sm:text-base mb-8 max-w-prose leading-relaxed">
            {t.regSubtitle}
          </p>

          {/* Top API Error Alert */}
          {apiError && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Registration Could Not Be Completed</strong>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          {/* Photo & Identity Verification Section */}
          <div className="mb-10 p-5 sm:p-7 rounded-2xl bg-[#fff8f5] border border-[#dbc1b4]/60 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1.5">
              <ShieldCheck className="w-5 h-5 text-[#8c3c0b]" />
              <h3 className="font-serif text-xl font-medium text-[#703100]">
                Identity Verification
              </h3>
            </div>
            <p className="text-xs text-[#554339] mb-6">
              Please provide both a candidate selfie photo and an Aadhaar Card image for monastery identification and admittance pass issuance.
              <span className="block sm:inline sm:ml-1.5 font-semibold text-[#8c3c0b]">
                (Max file size: 5 MB each • JPG, PNG or WebP)
              </span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Candidate Profile Photo (Selfie) */}
              <div className="flex flex-col items-center justify-between p-5 rounded-xl border border-[#dbc1b4]/70 bg-white shadow-2xs text-center transition-all hover:border-[#b35c1e]/60">
                <div className="w-full flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#554339] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#8c3c0b]" />
                    <span>{t.profilePhoto} <span className="text-red-500 font-bold">*</span></span>
                  </span>
                  {photoUploading ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#b35c1e] bg-[#fff1eb] px-2.5 py-0.5 rounded-full">
                      <span className="w-2.5 h-2.5 border-2 border-[#b35c1e] border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : photoPreview ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d4739] bg-[#e8f5ee] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#2d4739]" />
                      Uploaded {photoSize ? `(${photoSize})` : ''}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#705d53] bg-[#f7e5dc] px-2 py-0.5 rounded-full">
                      Max 5 MB
                    </span>
                  )}
                </div>

                <div className="relative group my-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#f7e5dc] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-xs relative ${
                      formErrors.photoUrl ? 'border-red-500 bg-red-50/50' : 'border-[#dbc1b4] group-hover:border-[#703100]'
                    }`}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Candidate Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-[#887367] p-2">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 mb-1" />
                        <span className="text-[10px] font-medium text-[#705d53]">Click to Upload</span>
                      </div>
                    )}

                    {/* Spinner overlay while uploading */}
                    {photoUploading && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white backdrop-blur-2xs">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-[9px] font-semibold tracking-wider uppercase">Syncing...</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="profile-photo-upload"
                  />

                  {photoPreview && !photoUploading ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto('profile');
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white p-1.5 rounded-full shadow-md hover:bg-red-700 transition-all cursor-pointer"
                      title="Remove Selfie"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoUploading}
                      className="absolute bottom-0 right-0 bg-[#b35c1e] text-white p-2 rounded-full shadow-md hover:bg-[#944403] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                      title="Upload Selfie"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#554339] font-medium mt-1">
                  {t.uploadPhotoPrompt}
                </p>

                {(photoError || formErrors.photoUrl) && (
                  <div className="mt-3 w-full p-2.5 rounded-lg bg-red-50 border border-red-200 text-left flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{photoError || formErrors.photoUrl}</span>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-[#dbc1b4] bg-[#fff8f5] text-[#703100] hover:bg-[#fceae2] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{photoUploading ? 'Uploading...' : photoPreview ? 'Change Selfie' : 'Upload Selfie'}</span>
                  </button>
                </div>
              </div>

              {/* 2. Aadhaar Card Photo / Document */}
              <div className="flex flex-col items-center justify-between p-5 rounded-xl border border-[#dbc1b4]/70 bg-white shadow-2xs text-center transition-all hover:border-[#b35c1e]/60">
                <div className="w-full flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#554339] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#8c3c0b]" />
                    <span>{t.aadharPhoto || 'Aadhaar Card Photo'} <span className="text-red-500 font-bold">*</span></span>
                  </span>
                  {aadharUploading ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#b35c1e] bg-[#fff1eb] px-2.5 py-0.5 rounded-full">
                      <span className="w-2.5 h-2.5 border-2 border-[#b35c1e] border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : aadharPreview ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d4739] bg-[#e8f5ee] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-[#2d4739]" />
                      Uploaded {aadharSize ? `(${aadharSize})` : ''}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#705d53] bg-[#f7e5dc] px-2 py-0.5 rounded-full">
                      Max 5 MB
                    </span>
                  )}
                </div>

                <div className="relative group my-2 w-full max-w-[240px]">
                  <div
                    onClick={() => aadharInputRef.current?.click()}
                    className={`w-full h-28 sm:h-32 rounded-xl bg-[#f7e5dc] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all cursor-pointer shadow-xs p-1 relative ${
                      formErrors.aadharPhotoUrl ? 'border-red-500 bg-red-50/50' : 'border-[#dbc1b4] group-hover:border-[#703100]'
                    }`}
                  >
                    {aadharPreview ? (
                      <img
                        src={aadharPreview}
                        alt="Aadhaar Card Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-[#887367] p-2">
                        <CreditCard className="w-10 h-10 mb-1 text-[#887367]" />
                        <span className="text-[10px] font-medium text-[#705d53]">Click to Upload Aadhaar</span>
                      </div>
                    )}

                    {/* Spinner overlay while uploading */}
                    {aadharUploading && (
                      <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col items-center justify-center text-white backdrop-blur-2xs">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-[9px] font-semibold tracking-wider uppercase">Syncing...</span>
                      </div>
                    )}
                  </div>

                  <input
                    ref={aadharInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAadharUpload}
                    className="hidden"
                    id="aadhar-photo-upload"
                  />

                  {aadharPreview && !aadharUploading ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto('aadhar');
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white p-1.5 rounded-full shadow-md hover:bg-red-700 transition-all cursor-pointer"
                      title="Remove Aadhaar Document"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => aadharInputRef.current?.click()}
                      disabled={aadharUploading}
                      className="absolute bottom-1 right-1 bg-[#b35c1e] text-white p-2 rounded-full shadow-md hover:bg-[#944403] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                      title="Upload Aadhaar Card"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#554339] font-medium mt-1">
                  {t.uploadAadharPrompt || 'Upload front side of your Aadhaar Card'}
                </p>

                {(aadharError || formErrors.aadharPhotoUrl) && (
                  <div className="mt-3 w-full p-2.5 rounded-lg bg-red-50 border border-red-200 text-left flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{aadharError || formErrors.aadharPhotoUrl}</span>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => aadharInputRef.current?.click()}
                    disabled={aadharUploading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-[#dbc1b4] bg-[#fff8f5] text-[#703100] hover:bg-[#fceae2] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{aadharUploading ? 'Uploading...' : aadharPreview ? 'Change Aadhaar' : 'Upload Aadhaar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Start & End Dates (Fixed by selected course, non-editable by user) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.startDate} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    readOnly
                    tabIndex={-1}
                    aria-readonly="true"
                    className="form-input w-full text-sm text-[#554339] bg-[#f8f3ee] border-[#dbc1b4] cursor-not-allowed select-none font-medium pr-10"
                  />
                  <Calendar className="w-4 h-4 text-[#8a7266] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#8a7266] mt-1.5 leading-tight">
                  {t.dateFixedNotice}
                </p>
                {formErrors.arrivalDate && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.arrivalDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.endDate} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    readOnly
                    tabIndex={-1}
                    aria-readonly="true"
                    className="form-input w-full text-sm text-[#554339] bg-[#f8f3ee] border-[#dbc1b4] cursor-not-allowed select-none font-medium pr-10"
                  />
                  <Calendar className="w-4 h-4 text-[#8a7266] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#8a7266] mt-1.5 leading-tight">
                  {t.dateFixedNotice}
                </p>
                {formErrors.departureDate && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.departureDate}</p>
                )}
              </div>
            </div>

            {/* Personal Info: Full Name, Father's Name, Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.fullName} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.fullName && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.fatherName} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="fatherName"
                  placeholder="Father's full name"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.fatherName && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.fatherName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.dob} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.dob && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.dob}</p>
                )}
              </div>
            </div>

            {/* Contact & Demographics: Phone, Age, Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.phone} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.phone && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.age} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  placeholder="Years"
                  min="15"
                  max="99"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.age && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.gender} <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                >
                  <option value="" disabled>
                    {t.genderSelect}
                  </option>
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                  <option value="other">{t.genderOther}</option>
                </select>
                {formErrors.gender && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.gender}</p>
                )}
              </div>
            </div>

            {/* Additional Contact Info: Emergency Contact, Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.emergencyContact} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  placeholder="+91 (Name & Number)"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.emergencyContact && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.emergencyContact}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2 flex items-center justify-between">
                  <span>{t.emailAddress}</span>
                  <span className="text-[10px] font-normal normal-case text-[#887367] bg-[#f7e5dc] px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com (optional)"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.email && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.email}</p>
                )}
              </div>
            </div>

            {/* ID & Experience: Aadhar / PAN, Previous Courses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.aadharPan} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="aadharPan"
                  placeholder="ID Number"
                  value={formData.aadharPan}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.aadharPan && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.aadharPan}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                  {t.previousCourses} <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  name="previousCourses"
                  placeholder="0"
                  min="0"
                  value={formData.previousCourses}
                  onChange={handleChange}
                  required
                  className="form-input w-full text-sm text-[#231a15]"
                />
                {formErrors.previousCourses && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.previousCourses}</p>
                )}
              </div>
            </div>

            {/* Address (Required) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2">
                {t.address} <span className="text-red-500 font-bold">*</span>
              </label>
              <div>
                <input
                  type="text"
                  name="streetAddress"
                  placeholder={t.streetAddress}
                  value={formData.streetAddress}
                  onChange={handleChange}
                  required
                  className={`form-input w-full text-sm text-[#231a15] ${formErrors.streetAddress ? 'border-red-500' : ''}`}
                />
                {formErrors.streetAddress && (
                  <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.streetAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder={t.city}
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className={`form-input w-full text-sm text-[#231a15] ${formErrors.city ? 'border-red-500' : ''}`}
                  />
                  {formErrors.city && (
                    <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.city}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="state"
                    placeholder={t.state}
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className={`form-input w-full text-sm text-[#231a15] ${formErrors.state ? 'border-red-500' : ''}`}
                  />
                  {formErrors.state && (
                    <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.state}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="country"
                    placeholder={t.country}
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={`form-input w-full text-sm text-[#231a15] ${formErrors.country ? 'border-red-500' : ''}`}
                  />
                  {formErrors.country && (
                    <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.country}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder={t.zipCode}
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className={`form-input w-full text-sm text-[#231a15] ${formErrors.zipCode ? 'border-red-500' : ''}`}
                  />
                  {formErrors.zipCode && (
                    <p className="text-xs text-[#ba1a1a] mt-1">{formErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Health Info */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-2 flex items-center justify-between">
                <span>{t.illnessLabel}</span>
                <span className="text-[10px] font-normal normal-case text-[#887367] bg-[#f7e5dc] px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </label>
              <textarea
                name="illness"
                rows={4}
                value={formData.illness}
                onChange={handleChange}
                placeholder={t.illnessPlaceholder}
                className="form-input w-full h-32 resize-none text-sm text-[#231a15]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                id="submit-registration-btn"
                type="submit"
                disabled={isSubmitting || photoUploading || aadharUploading}
                className="bg-[#b35c1e] text-white px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#944403] active:scale-98 transition-all duration-300 w-full md:w-auto shadow-md cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Application to Monastery Registry...</span>
                  </>
                ) : photoUploading || aadharUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Documents...</span>
                  </>
                ) : (
                  <span>{t.btnSubmitRegistration}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation & Admittance Slip Modal */}
      {submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f5] border border-[#dbc1b4] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Header decoration */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#cbead7] text-[#2d4739] mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#703100] font-normal">
                Registration Confirmed
              </h3>
              <p className="text-xs text-[#554339] mt-1 uppercase tracking-widest font-semibold">
                Uruvela Forest Vihara • Bodhgaya
              </p>
            </div>

            <div className="bg-[#fff1eb] rounded-xl p-5 border border-[#dbc1b4]/60 space-y-3 text-xs sm:text-sm text-[#231a15] mb-6">
              <div className="flex justify-between border-b border-[#dbc1b4]/40 pb-2">
                <span className="text-[#554339]">Applicant:</span>
                <span className="font-semibold">{submittedData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-[#dbc1b4]/40 pb-2">
                <span className="text-[#554339]">Course Dates:</span>
                <span className="font-semibold text-[#b35c1e]">{submittedData.arrivalDate} to {submittedData.departureDate}</span>
              </div>
              <div className="flex justify-between border-b border-[#dbc1b4]/40 pb-2 items-center">
                <span className="text-[#554339]">Admittance Pass Code:</span>
                <span className="font-mono font-bold text-[#703100] bg-[#fae3d7] px-2.5 py-1 rounded-md text-sm border border-[#e8c0ab]">
                  {submittedData.passCode || 'UFV-CONFIRMED'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#dbc1b4]/40 pb-2">
                <span className="text-[#554339]">Email Confirmation:</span>
                <span>{submittedData.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between border-b border-[#dbc1b4]/40 pb-2">
                <span className="text-[#554339]">Accommodation:</span>
                <span>{submittedData.accommodationAssigned || 'Individual Forest Kuti Assigned'}</span>
              </div>
              {(submittedData.photoUrl || submittedData.aadharPhotoUrl) && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[#554339]">Verified Documents:</span>
                  <div className="flex items-center gap-2.5">
                    {submittedData.photoUrl && (
                      <div className="flex items-center gap-1.5 text-xs text-[#2d4739] font-medium bg-white px-2.5 py-1 rounded-md border border-[#dbc1b4]/60 shadow-2xs">
                        <img
                          src={submittedData.photoUrl}
                          alt="Candidate Selfie"
                          className="w-6 h-6 rounded-full object-cover border border-[#dbc1b4]"
                        />
                        <span>Selfie Saved</span>
                      </div>
                    )}
                    {submittedData.aadharPhotoUrl && (
                      <div className="flex items-center gap-1.5 text-xs text-[#2d4739] font-medium bg-white px-2.5 py-1 rounded-md border border-[#dbc1b4]/60 shadow-2xs">
                        <img
                          src={submittedData.aadharPhotoUrl}
                          alt="Aadhaar Document"
                          className="w-7 h-5 rounded-xs object-cover border border-[#dbc1b4]"
                        />
                        <span>Aadhaar Saved</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-[#554339] text-center mb-6 leading-relaxed">
              May this course bring deep tranquility, mindfulness, and liberation from stress. Please arrive at the registration office between 2:00 PM and 4:00 PM on your start date with your Admittance Pass Code.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-full border border-[#dbc1b4] text-xs font-semibold uppercase tracking-wider text-[#703100] hover:bg-[#fceae2] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => {
                  setSubmittedData(null);
                  onBackToCourses();
                }}
                className="px-6 py-2.5 rounded-full bg-[#b35c1e] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#944403] transition-colors cursor-pointer"
              >
                Return to Sanctuary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
