import React, { useState } from 'react';
import { BookOpen, Sparkles, ScrollText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';

interface LibraryViewProps {
  language: Language;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'chants' | 'precepts' | 'faq'>('chants');

  return (
    <div className="pt-36 sm:pt-40 pb-20 px-4 md:px-6 min-h-screen">
      <div className="max-w-[1120px] mx-auto space-y-12">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#231a15] font-normal tracking-tight mb-3">
            {t.navLibrary}
          </h1>
          <p className="text-[#554339] text-base sm:text-lg max-w-2xl leading-relaxed">
            Essential Pali chants, meditation guidelines, and reference texts for students of the Forest Tradition.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-[#dbc1b4]/60 pb-3">
          <button
            onClick={() => setActiveTab('chants')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'chants'
                ? 'bg-[#703100] text-white shadow-xs'
                : 'bg-[#fff1eb] text-[#554339] hover:bg-[#f7e5dc]'
            }`}
          >
            Pali Chants (वंदना)
          </button>
          <button
            onClick={() => setActiveTab('precepts')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'precepts'
                ? 'bg-[#703100] text-white shadow-xs'
                : 'bg-[#fff1eb] text-[#554339] hover:bg-[#f7e5dc]'
            }`}
          >
            Noble Code (शीला)
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'faq'
                ? 'bg-[#703100] text-white shadow-xs'
                : 'bg-[#fff1eb] text-[#554339] hover:bg-[#f7e5dc]'
            }`}
          >
            Retreat Rules & FAQs
          </button>
        </div>

        {/* Chants Tab */}
        {activeTab === 'chants' && (
          <div className="space-y-6">
            <div className="bg-[#fff1eb] p-6 sm:p-8 rounded-2xl border border-[#dbc1b4]/40 space-y-4">
              <div className="flex justify-between items-center border-b border-[#dbc1b4]/40 pb-3">
                <h3 className="font-serif text-xl font-medium text-[#703100]">
                  Namo Tassa (नमो तस्स भगवतो)
                </h3>
                <span className="text-xs text-[#887367]">Homage to the Exalted One</span>
              </div>
              <p className="font-serif text-base text-[#231a15] italic">
                "Namo tassa bhagavato arahato sammāsambuddhassa" (3x)
              </p>
              <p className="text-xs text-[#554339]">
                Homage to the Blessed, Noble, and Perfectly Enlightened One.
              </p>
            </div>

            <div className="bg-[#fff1eb] p-6 sm:p-8 rounded-2xl border border-[#dbc1b4]/40 space-y-4">
              <div className="flex justify-between items-center border-b border-[#dbc1b4]/40 pb-3">
                <h3 className="font-serif text-xl font-medium text-[#703100]">
                  Karaṇīya Mettā Sutta (करणीय मेत्त सुत्त)
                </h3>
                <span className="text-xs text-[#887367]">The Discourse on Loving-Kindness</span>
              </div>
              <p className="font-serif text-base text-[#231a15] italic leading-relaxed">
                "Mātā yathā检测 niyam puttam āyusā ekaputtam anurakkhe,<br />
                Evampi sabbabhūtesu mānasaṁ bhāvaye aparimāṇaṁ."
              </p>
              <p className="text-xs text-[#554339] leading-relaxed">
                Even as a mother protects with her life her child, her only child, so with a boundless heart should one cherish all living beings.
              </p>
            </div>
          </div>
        )}

        {/* Precepts Tab */}
        {activeTab === 'precepts' && (
          <div className="bg-[#fff1eb] p-6 sm:p-8 rounded-2xl border border-[#dbc1b4]/40 space-y-6">
            <h3 className="font-serif text-2xl text-[#703100] font-medium">
              The 8 Sīla Precepts Observed During Retreat
            </h3>
            <div className="space-y-3">
              {[
                { pali: '1. Pāṇātipātā veramaṇī sikkhāpadaṁ samādiyāmi', en: 'To abstain from taking the life of any living creature.' },
                { pali: '2. Adinnādānā veramaṇī sikkhāpadaṁ samādiyāmi', en: 'To abstain from taking what is not freely given.' },
                { pali: '3. Abrahmacariyā veramaṇī sikkhāpadaṁ samādiyāmi', en: 'To abstain from all sexual and sensual activity (Noble Celibacy).' },
                { pali: '4. Musāvādā veramaṇī sikkhāpadaṁ samādiyāmi', en: 'To abstain from false speech and observe Noble Silence.' },
                { pali: '5. Surāmerayamajjapamādaṭṭhānā veramaṇī', en: 'To abstain from intoxicants, liquor, and drugs.' },
                { pali: '6. Vikālabhojanā veramaṇī sikkhāpadaṁ samādiyāmi', en: 'To abstain from eating after solar noon.' },
                { pali: '7. Nacca-gīta-vādita-visūkadassanā mālā-gandha', en: 'To abstain from entertainment, music, cosmetics, and bodily ornaments.' },
                { pali: '8. Uccāsayana-mahāsayanā veramaṇī', en: 'To abstain from sleeping on high or luxurious beds.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/80 p-4 rounded-xl border border-[#dbc1b4]/40 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#fceae2] text-[#703100] flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-serif font-semibold text-[#703100]">{item.pali}</div>
                    <div className="text-xs text-[#554339] mt-0.5">{item.en}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {[
              {
                q: 'What should I bring for a 10-day retreat?',
                a: 'Modest white or loose neutral clothing covering shoulders and knees, personal toiletries, a flashlight, refillable water bottle, and any personal prescribed medications disclosed during registration.'
              },
              {
                q: 'Are mobile phones permitted?',
                a: 'All phones, electronic devices, books, and writing materials are safely deposited in the monastery vault on Day 0 and returned upon course conclusion on Day 11.'
              },
              {
                q: 'Can beginners attend the 10-day Vipassana retreat?',
                a: 'Yes, both newcomers and experienced meditators are welcome. Complete instructions are imparted step-by-step each evening by the resident teacher.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#fff1eb] p-6 rounded-xl border border-[#dbc1b4]/40">
                <h4 className="font-serif text-base font-semibold text-[#703100] mb-2">{faq.q}</h4>
                <p className="text-xs text-[#554339] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
