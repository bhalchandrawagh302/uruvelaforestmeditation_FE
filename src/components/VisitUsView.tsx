import React from 'react';
import { MapPin, Car, Train, Clock, Phone, Mail, AlertCircle } from 'lucide-react';
import { Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';
import monasteryMap from '../../assets/monastery_map.jpg';

interface VisitUsViewProps {
  language: Language;
  onNavigate: (screen: ScreenType) => void;
}

export const VisitUsView: React.FC<VisitUsViewProps> = ({ language, onNavigate }) => {
  const t = TRANSLATIONS[language];

  const etiquetteRules = [
    {
      title: 'Silence',
      desc: 'Please observe noble silence in and around the meditation halls and monastic dwellings.',
    },
    {
      title: 'Dress Modestly',
      desc: 'Wear loose, comfortable clothing that covers shoulders and knees. White or earthy tones are preferred.',
    },
    {
      title: 'Offerings',
      desc: 'If you wish to bring offerings, simple provisions like rice, fruit, or tea are appreciated during the morning meal time.',
    },
    {
      title: 'Mindful Movement',
      desc: 'Move slowly and deliberately. Be aware of your steps on the gravel paths to maintain the quiet atmosphere.',
    },
    {
      title: 'Photography',
      desc: 'Photography is permitted in the gardens and grounds. Please refrain from photographing monastics without permission.',
    },
    {
      title: 'Footwear',
      desc: 'Remove footwear before entering any hall or shrine room. Sandals are recommended for the forest paths.',
    },
  ];

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 min-h-screen bg-[#fff8f5]">
      <div className="max-w-[1120px] mx-auto space-y-14">

        {/* ── Hero Heading ── */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#703100] font-normal tracking-tight">
            Journey to the Forest
          </h1>
          <p className="text-[#554339] text-base sm:text-lg leading-relaxed">
            Uruvela Forest Meditation Vihara is a place of quiet refuge. We welcome those seeking solitude and guidance on the path of Dhamma. Please plan your visit mindfully.
          </p>
        </div>

        {/* ── Illustrated Map Section ── */}
        <div className="relative rounded-2xl overflow-hidden border border-[#dbc1b4]/50 shadow-sm bg-[#fdf6f0]">
          <img
            src={monasteryMap}
            alt="Illustrated map of Uruvela Forest Meditation Vihara grounds"
            className="w-full h-auto object-cover"
          />

          {/* Location overlay card */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-[#dbc1b4]/40 max-w-[220px] sm:max-w-xs">
            <h3 className="font-serif text-lg text-[#703100] mb-1">Location</h3>
            <p className="text-xs text-[#554339] leading-relaxed mb-3">
              108 Bodhi Tree Lane,<br />
              Silent Valley, Near The Great River
            </p>
            <a
              href="https://maps.google.com/?q=Uruvela+Forest+Meditation+Vihara"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#703100] hover:bg-[#944403] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors duration-200"
            >
              <MapPin className="w-3.5 h-3.5" />
              Get Directions
            </a>
          </div>
        </div>

        {/* ── How to Reach + Etiquette ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* How to Reach Us */}
          <div className="bg-white rounded-2xl border border-[#dbc1b4]/40 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#fceae2] rounded-full flex items-center justify-center shrink-0">
                <Car className="w-4 h-4 text-[#b35c1e]" />
              </div>
              <h2 className="font-serif text-xl text-[#231a15]">How to Reach Us</h2>
            </div>

            <div className="space-y-5">
              {/* By Public Transport */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Train className="w-4 h-4 text-[#b35c1e]" />
                  <span className="text-[10px] font-bold tracking-widest text-[#887367] uppercase">By Public Transport</span>
                </div>
                <p className="text-sm text-[#554339] leading-relaxed pl-6">
                  Take the morning train to the River Crossing Station. From there, local buses depart every hour to the Silent Valley outpost. The Vihara is a mindful 2-mile walk from the bus stop.
                </p>
              </div>

              <div className="border-t border-[#dbc1b4]/30" />

              {/* By Car */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-[#b35c1e]" />
                  <span className="text-[10px] font-bold tracking-widest text-[#887367] uppercase">By Car</span>
                </div>
                <p className="text-sm text-[#554339] leading-relaxed pl-6">
                  Drive north on Highway 7 past the rolling hills. Take exit 42 towards the Great River. Follow the dirt road for 5 miles. Please drive slowly to respect the local wildlife and the silence of the area.
                </p>
              </div>

              <div className="border-t border-[#dbc1b4]/30" />

              {/* Note */}
              <div className="flex items-start gap-2 bg-[#fff8f5] rounded-xl p-3 border border-[#dbc1b4]/30">
                <AlertCircle className="w-4 h-4 text-[#b35c1e] mt-0.5 shrink-0" />
                <p className="text-xs text-[#554339] leading-relaxed">
                  Day visitors are welcome <strong>daily from 8am–5pm</strong>. Overnight guests must pre-register via our Courses or Dana pages.
                </p>
              </div>
            </div>
          </div>

          {/* Monastery Etiquette */}
          <div className="bg-white rounded-2xl border border-[#dbc1b4]/40 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#fceae2] rounded-full flex items-center justify-center shrink-0">
                {/* Lotus icon SVG */}
                <svg className="w-4 h-4 text-[#b35c1e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22c0 0-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11z" />
                  <path d="M12 22c0 0 7-5 7-11" />
                  <path d="M5 11c0 0 3-5 7-5s7 5 7 5" />
                </svg>
              </div>
              <h2 className="font-serif text-xl text-[#231a15]">Monastery Etiquette</h2>
            </div>

            <ul className="space-y-4">
              {etiquetteRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#b35c1e] mt-0.5 text-lg leading-none select-none">✦</span>
                  <p className="text-sm text-[#554339] leading-relaxed">
                    <strong className="text-[#231a15] font-semibold">{rule.title}:</strong>{' '}
                    {rule.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Visiting Hours + Contact Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#fceae2] rounded-2xl p-6 flex items-start gap-4 border border-[#dbc1b4]/30">
            <Clock className="w-5 h-5 text-[#b35c1e] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold tracking-widest text-[#887367] uppercase mb-1">Visiting Hours</p>
              <p className="text-sm text-[#231a15] font-semibold">Daily 8:00 am – 5:00 pm</p>
              <p className="text-xs text-[#554339] mt-1">Meditation sittings at 6am & 6pm</p>
            </div>
          </div>

          <div className="bg-[#fceae2] rounded-2xl p-6 flex items-start gap-4 border border-[#dbc1b4]/30">
            <Phone className="w-5 h-5 text-[#b35c1e] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold tracking-widest text-[#887367] uppercase mb-1">Phone</p>
              <p className="text-sm text-[#231a15] font-semibold">+91 98765 43210</p>
              <p className="text-xs text-[#554339] mt-1">Mon–Sat, 9am–12pm only</p>
            </div>
          </div>

          <div className="bg-[#fceae2] rounded-2xl p-6 flex items-start gap-4 border border-[#dbc1b4]/30">
            <Mail className="w-5 h-5 text-[#b35c1e] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold tracking-widest text-[#887367] uppercase mb-1">Email</p>
              <p className="text-sm text-[#231a15] font-semibold break-all">info@uruvela.org</p>
              <p className="text-xs text-[#554339] mt-1">Replies within 2–3 days</p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-[#554339] text-sm">
            Planning a longer stay? Explore our meditation courses or support the Sangha.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('courses')}
              className="px-6 py-2.5 bg-[#703100] hover:bg-[#944403] text-white text-sm font-semibold rounded-full transition-colors duration-200"
            >
              View Retreats
            </button>
            <button
              onClick={() => onNavigate('dana')}
              className="px-6 py-2.5 border border-[#703100] text-[#703100] hover:bg-[#fceae2] text-sm font-semibold rounded-full transition-colors duration-200"
            >
              Offer Dana
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
