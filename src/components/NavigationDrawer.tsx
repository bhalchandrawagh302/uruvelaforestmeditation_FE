import React, { useState } from 'react';
import { X, BookOpen, Heart, Sparkles, Compass, Music, Shield, Info, ArrowRight, Lock, Share2, Check } from 'lucide-react';
import { Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';
import { MahabodhiLogo } from './MahabodhiLogo';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  language,
  onLanguageChange,
}) => {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleLinkClick = (screen: ScreenType) => {
    onNavigate(screen);
    onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mahabodhi Meditation Centre | Uruvela Forest Vihara',
      text: 'Discover peace within at Mahabodhi Meditation Centre (Uruvela Forest Vihara). Silent retreats, Dhamma talks, and Sangha Dana.',
      url: window.location.origin || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: clipboard copy or whatsapp
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        const msg = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
        window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
      }
    } catch {
      const msg = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#231a15]/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-sm bg-[#fff8f5] text-[#231a15] h-full shadow-2xl flex flex-col z-10 border-r border-[#dbc1b4]/60 overflow-y-auto">
        {/* Top bar */}
        <div className="p-5 border-b border-[#dbc1b4]/40 flex items-center justify-between bg-[#fff1eb]">
          <div className="flex items-center gap-3">
            <MahabodhiLogo className="w-12 h-12 shrink-0 drop-shadow-xs" />
            <div>
              <span className="font-serif text-lg font-bold text-[#703100] leading-tight block">
                {t.siteTitle}
              </span>
              <p className="text-[11px] text-[#705d53] font-medium mt-0.5">
                {t.siteSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-full text-[#554339] hover:text-[#703100] hover:bg-[#f7e5dc] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-4 py-6 space-y-1">
          <button
            onClick={() => handleLinkClick('home')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
              currentScreen === 'home'
                ? 'bg-[#fceae2] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100]'
            }`}
          >
            <Compass className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm">Home (Sanctuary)</div>
              <div className="text-xs text-[#887367]">A Path to Stillness</div>
            </div>
            {currentScreen === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-[#b35c1e]" />}
          </button>

          <button
            onClick={() => handleLinkClick('about')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
              currentScreen === 'about'
                ? 'bg-[#fceae2] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100]'
            }`}
          >
            <Compass className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm">{t.navMonasticLife}</div>
              <div className="text-xs text-[#887367]">History & Lineage</div>
            </div>
            {currentScreen === 'about' && <span className="w-1.5 h-1.5 rounded-full bg-[#b35c1e]" />}
          </button>


          <button
            onClick={() => handleLinkClick('visit')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
              currentScreen === 'visit'
                ? 'bg-[#fceae2] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100]'
            }`}
          >
            <Compass className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm">Visit Us</div>
              <div className="text-xs text-[#887367]">Location & How to Reach</div>
            </div>
            {currentScreen === 'visit' && <span className="w-1.5 h-1.5 rounded-full bg-[#b35c1e]" />}
          </button>

          <button
            onClick={() => handleLinkClick('dana')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
              currentScreen === 'dana'
                ? 'bg-[#fceae2] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100]'
            }`}
          >
            <Heart className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm">{t.navSanghaDana}</div>
              <div className="text-xs text-[#887367]">Meal Offering Calendar</div>
            </div>
            {currentScreen === 'dana' && <span className="w-1.5 h-1.5 rounded-full bg-[#b35c1e]" />}
          </button>

          <button
            onClick={() => handleLinkClick('talks')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
              currentScreen === 'talks'
                ? 'bg-[#fceae2] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100]'
            }`}
          >
            <Music className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm">{t.navDhammaTalks}</div>
              <div className="text-xs text-[#887367]">Audio & Reflections</div>
            </div>
            {currentScreen === 'talks' && <span className="w-1.5 h-1.5 rounded-full bg-[#b35c1e]" />}
          </button>

          <button
            onClick={() => handleLinkClick('library')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
              currentScreen === 'library'
                ? 'bg-[#fceae2] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100]'
            }`}
          >
            <BookOpen className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm">{t.navLibrary}</div>
              <div className="text-xs text-[#887367]">Pali Chants & Texts</div>
            </div>
            {currentScreen === 'library' && <span className="w-1.5 h-1.5 rounded-full bg-[#b35c1e]" />}
          </button>

          <button
            onClick={() => handleLinkClick('support')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
              currentScreen === 'support'
                ? 'bg-[#fceae2] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100]'
            }`}
          >
            <Shield className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm">{t.navSupport}</div>
              <div className="text-xs text-[#887367]">Dana & Voluntary Service</div>
            </div>
            {currentScreen === 'support' && <span className="w-1.5 h-1.5 rounded-full bg-[#b35c1e]" />}
          </button>

          {/* Share Option */}
          <button
            id="drawer-share-btn"
            onClick={handleShare}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left font-medium transition-all text-[#554339] hover:bg-[#f7e5dc] hover:text-[#703100] cursor-pointer"
          >
            <Share2 className="w-5 h-5 text-[#b35c1e]" />
            <div className="flex-1">
              <div className="text-sm flex items-center gap-2">
                <span>{copied ? t.linkCopied : t.navShare}</span>
                {copied && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs text-[#887367]">
                {copied ? 'Link copied to clipboard' : t.shareSubtitle}
              </div>
            </div>
          </button>

          {/* <div className="pt-2 border-t border-[#dbc1b4]/30 my-1">
            <button
              onClick={() => handleLinkClick('dashboard')}
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-left font-medium text-[#705d53] hover:bg-[#fceae2] hover:text-[#703100] transition-all"
            >
              <Lock className="w-4 h-4 text-[#8c3c0b]" />
              <div className="flex-1">
                <div className="text-xs font-semibold">Admin Portal</div>
                <div className="text-[10px] text-[#887367]">Stewardship & Registry</div>
              </div>
            </button>
          </div> */}
        </div>

        {/* Bottom Language & Quick Action */}
        <div className="p-6 bg-[#fff1eb] border-t border-[#dbc1b4]/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#554339]">
              Language
            </span>
            <div className="inline-flex rounded-full bg-[#fceae2] p-1 border border-[#dbc1b4]/40">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  language === 'en' ? 'bg-[#703100] text-white' : 'text-[#703100]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-devanagari ${
                  language === 'hi' ? 'bg-[#703100] text-white' : 'text-[#703100]'
                }`}
              >
                हिं
              </button>
              <button
                onClick={() => onLanguageChange('mr')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-devanagari ${
                  language === 'mr' ? 'bg-[#703100] text-white' : 'text-[#703100]'
                }`}
              >
                मरा
              </button>
            </div>
          </div>

          <button
            onClick={() => handleLinkClick('courses')}
            className="w-full py-3 bg-[#b35c1e] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#944403] flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>{t.btnRegister}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
