import React from 'react';
import {
  Map,
  Heart,
  HandHeart,
  Timer,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';

interface HomeViewProps {
  language: Language;
  onNavigate: (screen: ScreenType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ language, onNavigate }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section with Forest Buddha Background */}
      <section className="relative min-h-[620px] md:min-h-[640px] lg:min-h-[580px] flex items-center justify-center pt-24 pb-16 px-4 md:px-6 overflow-hidden">
        {/* Atmospheric Forest Buddha Background Image with Soft Sunlight Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://imgs.search.brave.com/xXXqkKU7DTrSNDby358js57JJO_wm7_TeSpkpm68CJ0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kMzR2/bTNqNGg3Zjk3ei5j/bG91ZGZyb250Lm5l/dC9vcHRpbWl6ZWQv/M1gvYy83L2M3ODZm/ZWZiZTdjYjBmNWQ3/ZjY1ZGUyMThhMjVm/N2RmZGFjZmVlZWZf/Ml82NjZ4NTAwLmpw/ZWc"
            alt="Buddha meditating in misty forest sanctuary"
            className="w-full h-full object-cover object-top brightness-[0.82] contrast-[0.95]"
            referrerPolicy="no-referrer"
          />
          {/* Gentle Morning Mist and Golden Light Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff8f5]/40 via-transparent to-[#fff8f5]" />
          <div className="absolute inset-0 bg-radial from-amber-100/20 via-transparent to-[#fff8f5]/60" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fff8f5] via-[#fff8f5]/80 to-transparent" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[880px] mx-auto text-center flex flex-col items-center pt-10 pb-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fff8f5]/90 backdrop-blur-md border border-[#dbc1b4]/70 shadow-xs mb-5 animate-fade-in">
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#703100] uppercase font-sans">
              {t.homePill}
            </span>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1f1610] font-normal tracking-tight leading-[1.15] mb-5 drop-shadow-xs max-w-2xl">
            {t.homeHeroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-[#3b2d24] text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl mx-auto leading-relaxed font-normal mb-8 text-balance">
            {t.homeHeroSubtitle}
          </p>

          {/* Primary Call to Action Button */}
          <button
            id="hero-begin-journey-btn"
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#a84e18] hover:bg-[#8e3e0f] text-white text-xs sm:text-sm font-semibold tracking-wider rounded-full shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 group"
          >
            <span>{t.btnBeginJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* 2. Engage with the Practice Section */}
      <section className="relative z-10 max-w-[1120px] w-full mx-auto px-4 md:px-6 pt-4 pb-20 sm:pb-24">
        {/* Section Heading & Divider */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#231a15] font-normal tracking-tight">
            {t.homeEngageTitle}
          </h2>
          <div className="w-16 h-0.5 bg-[#dbc1b4] mx-auto mt-3 rounded-full" />
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {/* Card 1: Visit the Vihara */}
          <div
            id="card-visit-vihara"
            onClick={() => onNavigate('visit')}
            className="group relative bg-[#fff1eb] border border-[#dbc1b4]/40 hover:border-[#dbc1b4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer overflow-hidden"
          >
            {/* Watermark Silhouette: Walking monk / meditator */}
            <div className="absolute top-3 right-3 text-[#dbc1b4]/30 pointer-events-none transition-transform duration-500 group-hover:scale-110">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2.5" />
                <path d="M10 22v-6.5l-2-2.5 1.5-4.5 3 2.5 3-1.5" />
                <path d="M14 15.5l2 6.5" />
                <path d="M9 11l-3 3" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#703100]">
                <Map className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#231a15] font-semibold tracking-tight">
                {t.homeCardVisitTitle}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#554339] leading-relaxed">
                {t.homeCardVisitDesc}
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a84e18] group-hover:text-[#8e3e0f]">
                {t.homeCardVisitLink}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </div>
          </div>

          {/* Card 2: Sangha Dana */}
          <div
            id="card-sangha-dana"
            onClick={() => onNavigate('dana')}
            className="group relative bg-[#fff1eb] border border-[#dbc1b4]/40 hover:border-[#dbc1b4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer overflow-hidden"
          >
            {/* Watermark Silhouette: Heart */}
            <div className="absolute top-2 right-2 text-[#dbc1b4]/30 pointer-events-none transition-transform duration-500 group-hover:scale-110">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#703100]">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#231a15] font-semibold tracking-tight">
                {t.homeCardDanaTitle}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#554339] leading-relaxed">
                {t.homeCardDanaDesc}
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a84e18] group-hover:text-[#8e3e0f]">
                {t.homeCardDanaLink}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </div>
          </div>

          {/* Card 3: Support the Sangha */}
          <div
            id="card-support-sangha"
            onClick={() => onNavigate('support')}
            className="group relative bg-[#fff1eb] border border-[#dbc1b4]/40 hover:border-[#dbc1b4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer overflow-hidden"
          >
            {/* Watermark Silhouette: Offering Hands & Heart */}
            <div className="absolute top-2 right-2 text-[#dbc1b4]/30 pointer-events-none transition-transform duration-500 group-hover:scale-110">
              <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
                <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L15 13" />
                <path d="M19 8a3 3 0 0 0-3-3c-.8 0-1.5.3-2 1-.5-.7-1.2-1-2-1a3 3 0 0 0-3 3c0 2 3 5 5 6 2-1 5-4 5-6Z" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#703100]">
                <HandHeart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#231a15] font-semibold tracking-tight">
                {t.homeCardSupportTitle}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#554339] leading-relaxed">
                {t.homeCardSupportDesc}
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a84e18] group-hover:text-[#8e3e0f]">
                {t.homeCardSupportLink}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </div>
          </div>

          {/* Card 4: 10-Day Vipassana Course */}
          <div
            id="card-vipassana-course"
            onClick={() => onNavigate('courses')}
            className="group relative bg-[#fff1eb] border border-[#dbc1b4]/40 hover:border-[#dbc1b4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer overflow-hidden"
          >
            {/* Watermark Silhouette: Meditating seated yogi */}
            <div className="absolute top-2 right-2 text-[#dbc1b4]/30 pointer-events-none transition-transform duration-500 group-hover:scale-110">
              <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="4" r="2.5" />
                <path d="M12 7c-2 0-4 1-5 3l3 4.5V20h4v-5.5l3-4.5c-1-2-3-3-5-3Z" />
                <path d="M6 19c2 0 4-1 6-1s4 1 6 1" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#703100]">
                <Timer className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-[#231a15] font-semibold tracking-tight">
                {t.homeCardCourseTitle}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#554339] leading-relaxed">
                {t.homeCardCourseDesc}
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a84e18] group-hover:text-[#8e3e0f]">
                {t.homeCardCourseLink}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
