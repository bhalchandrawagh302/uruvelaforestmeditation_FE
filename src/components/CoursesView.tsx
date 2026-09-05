import React, { useState } from 'react';
import { Share2, Leaf, Calendar, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Course, Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';

interface CoursesViewProps {
  courses: Course[];
  language: Language;
  onNavigate: (screen: ScreenType) => void;
  onSelectCourseForRegistration: (course: Course) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  language,
  onNavigate,
  onSelectCourseForRegistration,
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

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 min-h-screen">
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
                {courses.map((course) => {
                  if (course.status === 'open') {
                    return (
                      <tr
                        key={course.id}
                        className="border-b border-[#dbc1b4]/40 bg-white hover:bg-[#fff8f5] transition-colors duration-200"
                      >
                        <td className="py-6 px-6 font-semibold text-[#2a2825]">
                          {course.year}
                        </td>
                        <td className="py-6 px-6 text-[#231a15] font-medium">
                          {course.fromDate}
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

                  if (course.status === 'upcoming') {
                    return (
                      <tr
                        key={course.id}
                        className="border-b border-[#dbc1b4]/40 bg-[#fff8f5]/80 hover:bg-[#fff8f5] transition-colors duration-200"
                      >
                        <td className="py-6 px-6 font-medium text-[#2a2825]">
                          {course.year}
                        </td>
                        <td className="py-6 px-6 text-[#231a15]">
                          {course.fromDate}
                        </td>
                        <td className="py-6 px-6 text-[#231a15]">
                          {course.toDate}
                        </td>
                        <td className="py-6 px-6 text-right">
                          <button
                            disabled
                            className="inline-flex justify-center items-center px-6 py-2.5 bg-[#2d4739]/20 text-[#554339] rounded-md cursor-not-allowed text-xs font-semibold tracking-wider opacity-80"
                          >
                            {t.btnUpcoming}
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  // Cancelled
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
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Shown only on small screens) */}
          <div className="md:hidden space-y-4">
            {courses.map((course) => {
              if (course.status === 'open') {
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
                        Open
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectCourseForRegistration(course)}
                      className="w-full inline-flex justify-center items-center px-6 py-3 bg-[#b35c1e] text-white rounded-lg hover:bg-[#944403] transition-colors duration-200 text-xs font-semibold uppercase tracking-wider mt-3 shadow-xs"
                    >
                      {t.btnRegister}
                    </button>
                  </div>
                );
              }

              if (course.status === 'upcoming') {
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
                        {t.btnUpcoming}
                      </span>
                    </div>
                    <button
                      disabled
                      className="w-full inline-flex justify-center items-center px-6 py-3 bg-[#2d4739]/20 text-[#554339] rounded-lg cursor-not-allowed text-xs font-semibold tracking-wider mt-3 opacity-80"
                    >
                      {t.btnNotOpen}
                    </button>
                  </div>
                );
              }

              // Cancelled
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
