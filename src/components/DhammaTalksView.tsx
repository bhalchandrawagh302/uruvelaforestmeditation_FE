import React from 'react';
import { Play, Sparkles, Clock, User, Download, Share2 } from 'lucide-react';
import { DhammaTalk, Language } from '../types';
import { DHAMMA_TALKS_LIST, TRANSLATIONS } from '../data/monasteryData';

interface DhammaTalksViewProps {
  language: Language;
  onPlayTalk: (talk: DhammaTalk) => void;
  activeTalkId?: string;
}

export const DhammaTalksView: React.FC<DhammaTalksViewProps> = ({
  language,
  onPlayTalk,
  activeTalkId,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="pt-28 pb-24 px-4 md:px-6 min-h-screen">
      <div className="max-w-[1120px] mx-auto space-y-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#231a15] font-normal tracking-tight mb-3">
            {t.navDhammaTalks}
          </h1>
          <p className="text-[#554339] text-base sm:text-lg max-w-2xl leading-relaxed">
            Recordings of evening discourses, guided Anapanasati sessions, and monastic chants recorded live in the Dhamma Hall of Uruvela Forest Vihara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DHAMMA_TALKS_LIST.map((talk) => {
            const isCurrent = activeTalkId === talk.id;
            return (
              <div
                key={talk.id}
                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#fceae2] border-[#703100] shadow-md ring-1 ring-[#703100]'
                    : 'bg-[#fff1eb] border-[#dbc1b4]/50 hover:border-[#703100]/60 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-[#b35c1e]/15 text-[#703100] rounded-full text-xs font-semibold uppercase tracking-wider">
                      {talk.category}
                    </span>
                    <span className="font-devanagari text-xs text-[#703100] font-semibold">
                      {talk.paliTitle}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-[#231a15] font-medium mb-2">
                    {talk.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#554339] mb-6">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#b35c1e]" />
                      <span>{talk.speaker}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#b35c1e]" />
                      <span>{talk.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#dbc1b4]/40 flex items-center justify-between">
                  <button
                    onClick={() => onPlayTalk(talk)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d4739] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#1f3228] transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isCurrent ? 'Now Playing' : 'Listen Now'}</span>
                  </button>

                  <span className="text-xs text-[#887367]">Free Stream</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
