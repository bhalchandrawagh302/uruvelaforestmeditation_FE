import React from 'react';
import { Compass, Sparkles, Building, Users, Leaf, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';

interface AboutViewProps {
  language: Language;
  onNavigate: (screen: ScreenType) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ language, onNavigate }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="pt-36 sm:pt-40 pb-20 px-4 md:px-6 min-h-screen">
      <div className="max-w-[1120px] mx-auto space-y-16">
        {/* Main Hero Header - Matching Image 21.png */}
        <section className="text-center md:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#231a15] font-light tracking-tight leading-tight">
            {t.aboutMainHeading}
          </h1>
          <p className="font-devanagari text-xl sm:text-2xl text-[#703100] mt-3 font-medium">
            {t.aboutSubHeading}
          </p>
        </section>

        {/* Monastery Narrative Section */}
        <section className="bg-[#fff1eb] rounded-2xl p-6 sm:p-8 md:p-12 border border-[#dbc1b4]/40 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#b35c1e]">
                Sacred Sanctuary • Dungeshwari Hills
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#703100] font-medium leading-snug">
                {t.aboutMonasteryName}
              </h2>
              <p className="text-[#554339] text-sm sm:text-base leading-relaxed">
                Situated in the sacred landscape where the Bodhisattva Siddhartha Gautama undertook six years of austere meditation before attaining complete Enlightenment under the Bodhi tree at Bodhgaya.
              </p>
              <p className="text-[#554339] text-sm sm:text-base leading-relaxed">
                The sanctuary has developed 75 consecrated kutis and buildings, each respectfully named and dedicated after the <strong>75 Foremost Disciples (Etadagga)</strong> of the Lord Buddha:
              </p>

              {/* 4 Disciples Categories Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/80 p-3.5 rounded-xl border border-[#dbc1b4]/40 text-center">
                  <div className="font-serif text-xl font-bold text-[#703100]">41</div>
                  <div className="text-xs font-semibold text-[#231a15] mt-0.5">Bhikkhus</div>
                  <div className="text-[10px] text-[#887367]">Monk Disciples</div>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-[#dbc1b4]/40 text-center">
                  <div className="font-serif text-xl font-bold text-[#703100]">13</div>
                  <div className="text-xs font-semibold text-[#231a15] mt-0.5">Bhikkhunis</div>
                  <div className="text-[10px] text-[#887367]">Nun Disciples</div>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-[#dbc1b4]/40 text-center">
                  <div className="font-serif text-xl font-bold text-[#703100]">11</div>
                  <div className="text-xs font-semibold text-[#231a15] mt-0.5">Laymen</div>
                  <div className="text-[10px] text-[#887367]">Upasaka</div>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-[#dbc1b4]/40 text-center">
                  <div className="font-serif text-xl font-bold text-[#703100]">10</div>
                  <div className="text-xs font-semibold text-[#231a15] mt-0.5">Laywomen</div>
                  <div className="text-[10px] text-[#887367]">Upasika</div>
                </div>
              </div>
            </div>

            {/* Right Visual / Bronze Bell Art */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-[#dbc1b4] bg-[#f7e5dc] group">
                <img
                  src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
                  alt="Uruvela Forest Monastery Bronze Bell"
                  className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                  <p className="text-white text-xs font-serif italic">
                    The Sanctuary Bell tolls at 04:00 AM each morning for Dawn Anapanasati Meditation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Our History & Lineage - Matching Image 21.png */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Our History */}
          <div className="bg-[#fff1eb] rounded-2xl p-6 sm:p-8 border border-[#dbc1b4]/40 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#b35c1e]/15 text-[#703100] rounded-full text-xs font-bold uppercase tracking-wider">
                  Est. 1985
                </span>
                <span className="font-devanagari text-sm font-semibold text-[#703100]">
                  {t.aboutHistoryHindi}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#231a15] font-medium">
                {t.aboutHistoryTitle}
              </h3>

              <p className="text-sm text-[#554339] leading-relaxed">
                Founded in 1985 amidst the quiet hills of ancient Magadha, Uruvela Forest Vihara began as a cluster of simple thatched kutis for secluded monastics.
              </p>

              <p className="text-sm text-[#554339] leading-relaxed">
                Over four decades, it has preserved pristine silence, forest reforestation, and the unadulterated method of Anapanasati and Vipassana meditation taught directly in the Pali Canon.
              </p>
            </div>

            <div className="pt-6 border-t border-[#dbc1b4]/40 mt-6 flex items-center gap-2 text-xs font-semibold text-[#703100]">
              <Leaf className="w-4 h-4 text-[#2d4739]" />
              <span>Dedicated to non-commercial Dhamma transmission</span>
            </div>
          </div>

          {/* Card 2: Lineage */}
          <div className="bg-[#fff1eb] rounded-2xl p-6 sm:p-8 border border-[#dbc1b4]/40 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#2d4739]/15 text-[#2d4739] rounded-full text-xs font-bold uppercase tracking-wider">
                  Thai Forest Tradition
                </span>
                <span className="font-devanagari text-sm font-semibold text-[#703100]">
                  {t.aboutLineageHindi}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#231a15] font-medium">
                {t.aboutLineageTitle}
              </h3>

              <p className="text-sm text-[#554339] leading-relaxed">
                Rooted in the austere practice lineage of Ajahn Mun Bhuridatta and Ajahn Chah, our monks and lay practitioners practice the noble Dhamma-Vinaya with unwavering dedication to simplicity.
              </p>

              <div className="bg-white/80 p-4 rounded-xl border border-[#dbc1b4]/40 space-y-1.5 text-xs text-[#231a15]">
                <div className="flex justify-between">
                  <span className="text-[#554339]">Primary Spiritual Guide:</span>
                  <span className="font-semibold text-[#703100]">Venerable Sujato Bhikkhu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#554339]">Tradition:</span>
                  <span className="font-semibold text-[#2d4739]">Theravada Forest Sangha</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#dbc1b4]/40 mt-6 flex items-center gap-2 text-xs font-semibold text-[#703100]">
              <ShieldCheck className="w-4 h-4 text-[#b35c1e]" />
              <span>Strict adherence to Vinaya code & Noble Silence</span>
            </div>
          </div>
        </section>

        {/* Quick Action Navigation */}
        <section className="text-center pt-8 border-t border-[#dbc1b4]/40">
          <h3 className="font-serif text-xl sm:text-2xl text-[#703100] mb-3">
            Experience the Forest Sanctuary
          </h3>
          <p className="text-sm text-[#554339] max-w-md mx-auto mb-6">
            Join an upcoming 10-Day course or reserve a meal offering for the resident Sangha.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('courses')}
              className="px-6 py-3 bg-[#b35c1e] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#944403] shadow-xs cursor-pointer"
            >
              View 10-Day Courses
            </button>
            <button
              onClick={() => onNavigate('dana')}
              className="px-6 py-3 bg-[#2d4739] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#1f3228] shadow-xs cursor-pointer"
            >
              Reserve Sangha Dana
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
