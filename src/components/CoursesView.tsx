import React, { useState } from 'react';
import { Share2, Leaf, Calendar, CheckCircle2, AlertCircle, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Course, Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';
import { getCourseRegistrationStatus } from '../utils/courseSchedule';

interface CoursesViewProps {
  courses: Course[];
  language: Language;
  onNavigate: (screen: ScreenType) => void;
  onSelectCourseForRegistration: (course: Course) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  language,
  onNavigate,
  onSelectCourseForRegistration,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const t = TRANSLATIONS[language];
  const [copiedToast, setCopiedToast] = useState(false);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🙏 Join a 10-Day Vipassana Meditation Course Uruvela Forest Vihara, Bodhgaya. Practice in noble silence and deep peace. Register at: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // ── Skeleton row for loading state ─────────────────────────────────────
  const SkeletonRow = () => (
    <tr className="border-b border-[#dbc1b4]/40 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="py-6 px-6">
          <div className="h-4 bg-[#dbc1b4]/40 rounded-full w-3/4" />
        </td>
      ))}
    </tr>
  );

  const SkeletonCard = () => (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#dbc1b4]/60 shadow-xs animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2">
          <div className="h-3 bg-[#dbc1b4]/40 rounded-full w-12" />
          <div className="h-5 bg-[#dbc1b4]/40 rounded-full w-40" />
        </div>
        <div className="h-6 bg-[#dbc1b4]/30 rounded-full w-16" />
      </div>
      <div className="h-10 bg-[#dbc1b4]/30 rounded-lg mt-3 w-full" />
    </div>
  );

  return (
    <div className="pt-36 sm:pt-40 pb-20 px-4 md:px-6 min-h-screen">
      <div className="max-w-[1120px] mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2a2825] font-normal tracking-tight mb-4">
              {t.coursesTitle}
            </h1>
            <p className="text-base sm:text-lg text-[#554339] max-w-2xl leading-relaxed">
              {t.coursesDesc}
            </p>
          </div>

          {/* WhatsApp Share Button */}
          <div className="flex items-center gap-3">
            <button
              id="share-whatsapp-courses-btn"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2.5 px-6 py-3 border border-[#dbc1b4] rounded-full text-xs font-semibold uppercase tracking-wider text-[#496455] hover:bg-[#f7e5dc] transition-colors duration-300 bg-[#fff8f5] shadow-xs cursor-pointer active:scale-98"
            >
              <Share2 className="w-4 h-4 text-[#2d4739]" />
              <span>{t.shareWhatsApp}</span>
            </button>
          </div>
        </div>

        {/* Bento Layout / Data Display Container */}
        <div className="bg-[#fff1eb] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs border border-[#dbc1b4]/40">
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-hidden rounded-xl bg-white/70 backdrop-blur-xs border border-[#dbc1b4]/30 shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dbc1b4]/50 bg-[#fff1eb]/60">
                  <th className="py-4 px-6 text-xs font-bold text-[#554339] uppercase tracking-wider">
                    {t.thYear}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#554339] uppercase tracking-wider">
                    {t.thFromDate}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#554339] uppercase tracking-wider">
                    {t.thToDate}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#554339] uppercase tracking-wider text-right">
                    {t.thAction}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Loading skeleton rows */}
                {isLoading && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}

                {/* Error state */}
                {!isLoading && error && (
                  <tr>
                    <td colSpan={4} className="py-10 px-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-[#ba1a1a]" />
                        <p className="text-sm text-[#554339]">{error}</p>
                        {onRetry && (
                          <button
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#b35c1e] border border-[#b35c1e]/40 rounded-full hover:bg-[#fceae2] transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try Again
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!isLoading && !error && courses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 px-6 text-center">
                      <p className="text-sm text-[#705d53]">No courses scheduled at this time. Please check back soon.</p>
                    </td>
                  </tr>
                )}

                {/* Course rows */}
                {!isLoading && !error && courses.map((course) => {
                  const regStatus = getCourseRegistrationStatus(course);

                  if (regStatus.state === 'cancelled') {
                    return (
                      <tr
                        key={course.id}
                        className="bg-[#fff8f5]/40 opacity-60 border-b border-[#dbc1b4]/20"
                      >
                        <td className="py-6 px-6 font-medium text-[#554339] line-through">
                          {course.year}
                        </td>
                        <td className="py-6 px-6 text-[#554339] line-through">
                          {course.fromDate}
                        </td>
                        <td className="py-6 px-6 text-[#554339] line-through">
                          {course.toDate}
                        </td>
                        <td className="py-6 px-6 text-right">
                          <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">
                            {t.statusCancelled}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  if (regStatus.canRegister) {
                    return (
                      <tr
                        key={course.id}
                        className="border-b border-[#dbc1b4]/40 bg-white hover:bg-[#fff8f5] transition-colors duration-200"
                      >
                        <td className="py-6 px-6 font-semibold text-[#2a2825]">
                          {course.year}
                        </td>
                        <td className="py-6 px-6 text-[#231a15] font-medium">
                          <div className="flex items-center gap-2">
                            <span>{course.fromDate}</span>
                            {regStatus.state === 'ongoing' && (
                              <span className="bg-[#2d4739]/10 text-[#2d4739] text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                {regStatus.badgeLabel}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-6 px-6 text-[#231a15] font-medium">
                          {course.toDate}
                        </td>
                        <td className="py-6 px-6 text-right">
                          <button
                            id={`register-btn-${course.id}`}
                            onClick={() => onSelectCourseForRegistration(course)}
                            className="inline-flex justify-center items-center px-6 py-2.5 bg-[#b35c1e] text-white rounded-md hover:bg-[#944403] active:scale-95 transition-all duration-200 text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer"
                          >
                            {t.btnRegister}
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  // Not open for registration
                  return (
                    <tr
                      key={course.id}
                      className="border-b border-[#dbc1b4]/40 bg-[#fff8f5]/80 hover:bg-[#fff8f5] transition-colors duration-200"
                    >
                      <td className="py-6 px-6 font-medium text-[#2a2825]">
                        {course.year}
                      </td>
                      <td className="py-6 px-6 text-[#231a15]">
                        <div className="flex items-center gap-2">
                          <span>{course.fromDate}</span>
                          {regStatus.state === 'closed_day7' && (
                            <span className="bg-[#703100]/10 text-[#703100] text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                              {t.registrationClosedDay7 || 'Closed (Day 7+)'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-6 text-[#231a15]">
                        {course.toDate}
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className="inline-flex flex-col items-end">
                          <button
                            disabled
                            title={regStatus.reason}
                            className={`inline-flex justify-center items-center px-6 py-2.5 rounded-md cursor-not-allowed text-xs font-semibold tracking-wider ${
                              regStatus.state === 'closed_day7'
                                ? 'bg-[#703100]/15 text-[#703100] opacity-80'
                                : 'bg-[#2d4739]/20 text-[#554339] opacity-80'
                            }`}
                          >
                            {regStatus.state === 'closed_day7'
                              ? t.registrationClosedDay7 || 'Closed (Day 7+)'
                              : t.btnUpcoming}
                          </button>
                          {regStatus.opensOnFormatted && (
                            <span className="text-[10px] text-[#705d53] font-medium mt-1">
                              Opens {regStatus.opensOnFormatted}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Shown only on small screens) */}
          <div className="md:hidden space-y-4">
            {/* Loading skeleton cards */}
            {isLoading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

            {/* Error state */}
            {!isLoading && error && (
              <div className="bg-white p-6 rounded-xl border border-[#dbc1b4]/60 shadow-xs text-center">
                <AlertCircle className="w-6 h-6 text-[#ba1a1a] mx-auto mb-2" />
                <p className="text-sm text-[#554339] mb-3">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#b35c1e] border border-[#b35c1e]/40 rounded-full hover:bg-[#fceae2] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Again
                  </button>
                )}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && courses.length === 0 && (
              <div className="bg-white p-6 rounded-xl border border-[#dbc1b4]/60 shadow-xs text-center">
                <p className="text-sm text-[#705d53]">No courses scheduled at this time. Please check back soon.</p>
              </div>
            )}

            {/* Course cards */}
            {!isLoading && !error && courses.map((course) => {
              const regStatus = getCourseRegistrationStatus(course);

              if (regStatus.state === 'cancelled') {
                return (
                  <div
                    key={course.id}
                    className="bg-[#fff8f5] p-5 sm:p-6 rounded-xl border border-[#dbc1b4]/40 opacity-60"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-[#554339] block mb-1 line-through">
                          {course.year}
                        </span>
                        <h3 className="font-serif text-xl text-[#554339] line-through font-medium">
                          {course.fromDate} - {course.toDate}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">
                        {t.statusCancelled}
                      </span>
                    </div>
                  </div>
                );
              }

              if (regStatus.canRegister) {
                return (
                  <div
                    key={course.id}
                    className="bg-white p-5 sm:p-6 rounded-xl border border-[#dbc1b4]/60 shadow-xs"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-semibold text-[#554339] block mb-1">
                          {course.year}
                        </span>
                        <h3 className="font-serif text-xl text-[#2a2825] font-semibold">
                          {course.fromDate} - {course.toDate}
                        </h3>
                      </div>
                      <span className="bg-[#2d4739]/10 text-[#2d4739] px-3 py-1 rounded-full text-xs font-semibold">
                        {regStatus.badgeLabel}
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectCourseForRegistration(course)}
                      className="w-full inline-flex justify-center items-center px-6 py-3 bg-[#b35c1e] text-white rounded-lg hover:bg-[#944403] transition-colors duration-200 text-xs font-semibold uppercase tracking-wider mt-3 shadow-xs cursor-pointer"
                    >
                      {t.btnRegister}
                    </button>
                  </div>
                );
              }

              // Disabled registration card (Upcoming or Day 7+ closed)
              return (
                <div
                  key={course.id}
                  className="bg-[#fff8f5] p-5 sm:p-6 rounded-xl border border-[#dbc1b4]/60 shadow-xs"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold text-[#554339] block mb-1">
                        {course.year}
                      </span>
                      <h3 className="font-serif text-xl text-[#2a2825] font-semibold">
                        {course.fromDate} - {course.toDate}
                      </h3>
                    </div>
                    <span className="bg-[#f7e5dc] text-[#554339] px-3 py-1 rounded-full text-xs font-semibold">
                      {regStatus.state === 'closed_day7'
                        ? t.registrationClosedDay7 || 'Closed (Day 7+)'
                        : regStatus.badgeLabel}
                    </span>
                  </div>
                  <button
                    disabled
                    title={regStatus.reason}
                    className={`w-full inline-flex justify-center items-center px-6 py-3 rounded-lg cursor-not-allowed text-xs font-semibold tracking-wider mt-3 opacity-80 ${
                      regStatus.state === 'closed_day7'
                        ? 'bg-[#703100]/15 text-[#703100]'
                        : 'bg-[#2d4739]/20 text-[#554339]'
                    }`}
                  >
                    {regStatus.state === 'closed_day7'
                      ? t.registrationClosedDay7 || 'Closed (Day 7+)'
                      : t.btnUpcoming}
                  </button>
                  {regStatus.opensOnFormatted && (
                    <p className="text-[11px] text-center text-[#705d53] mt-2">
                      Registration opens on {regStatus.opensOnFormatted} (1 month before course)
                    </p>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* Quick Highlights / Meditation Guidance */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fff8f5] p-6 rounded-xl border border-[#dbc1b4]/40 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#fceae2] flex items-center justify-center shrink-0 text-[#703100]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-[#703100] mb-1">Noble Silence (Ariya Tuṇhībhāva)</h4>
              <p className="text-xs text-[#554339] leading-relaxed">
                Meditators observe complete silence of speech and gestures for 9 full days to deepen concentration.
              </p>
            </div>
          </div>

          <div className="bg-[#fff8f5] p-6 rounded-xl border border-[#dbc1b4]/40 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#cbead7] flex items-center justify-center shrink-0 text-[#2d4739]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-[#2d4739] mb-1">Strict Donation Basis</h4>
              <p className="text-xs text-[#554339] leading-relaxed">
                No fee is charged for food, accommodation, or teachings. Supported solely by past meditator dana.
              </p>
            </div>
          </div>

          <div className="bg-[#fff8f5] p-6 rounded-xl border border-[#dbc1b4]/40 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#fceae2] flex items-center justify-center shrink-0 text-[#b35c1e]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-base font-semibold text-[#b35c1e] mb-1">Forest Kutis</h4>
              <p className="text-xs text-[#554339] leading-relaxed">
                Individual living quarters amidst the natural greenery of ancient Dungeshwari hills for deep seclusion.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom organic leaf icon */}
        <div className="mt-16 flex justify-center opacity-40">
          <Leaf className="w-8 h-8 text-[#2d4739]" />
        </div>
      </div>
    </div>
  );
};
