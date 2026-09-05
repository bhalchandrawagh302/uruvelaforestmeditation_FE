import React from 'react';
import { Menu, Globe } from 'lucide-react';
import { Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';
import { MahabodhiLogo } from './MahabodhiLogo';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onToggleMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  language,
  onLanguageChange,
  onToggleMenu,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#fff8f5]/95 backdrop-blur-md border-b border-[#dbc1b4]/40 transition-all duration-300">
      <div className="max-w-[1120px] mx-auto px-4 md:px-6 h-20 flex items-center">
        {/* Left: Hamburger & Brand Name with Logo */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            id="nav-menu-btn"
            onClick={onToggleMenu}
            aria-label="Open Navigation Menu"
            className="p-2 -ml-2 rounded-full text-[#703100] hover:bg-[#f7e5dc] active:scale-95 transition-all duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo and Site Title right after hamburger icon */}
          <button
            id="nav-brand-btn"
            onClick={() => onNavigate('home')}
            className="group flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none"
            aria-label={`${t.siteTitle} Home`}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <MahabodhiLogo className="w-11 h-11 sm:w-13 sm:h-13 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#703100] group-hover:text-[#944403] transition-colors leading-tight">
                {t.siteTitle}
              </span>
              {t.siteSubtitle && (
                <span className="text-[10px] sm:text-[11px] text-[#887367] tracking-wider font-medium hidden xs:block">
                  {t.siteSubtitle}
                </span>
              )}
            </div>
          </button>
        </div>


        {/* Right: Language Switcher */}
        <div className="flex items-center ml-auto pr-2 md:pr-16">
          <div className="inline-flex items-center rounded-full bg-[#fceae2] p-1 border border-[#dbc1b4]/50">
            <button
              id="lang-en-btn"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${
                language === 'en'
                  ? 'bg-[#703100] text-white shadow-xs'
                  : 'text-[#703100] hover:bg-[#f7e5dc]'
              }`}
            >
              EN
            </button>
            <span className="text-[#887367] text-xs px-0.5 select-none">|</span>
            <button
              id="lang-hi-btn"
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 font-devanagari ${
                language === 'hi'
                  ? 'bg-[#703100] text-white shadow-xs'
                  : 'text-[#703100] hover:bg-[#f7e5dc]'
              }`}
            >
              हिं
            </button>
            <span className="text-[#887367] text-xs px-0.5 select-none">|</span>
            <button
              id="lang-mr-btn"
              onClick={() => onLanguageChange('mr')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 font-devanagari ${
                language === 'mr'
                  ? 'bg-[#703100] text-white shadow-xs'
                  : 'text-[#703100] hover:bg-[#f7e5dc]'
              }`}
            >
              मरा
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb bar — visible on all non-home screens */}
      {currentScreen !== 'home' && (
        <div className="border-t border-[#dbc1b4]/30 bg-[#fff8f5]/90">
          <div className="max-w-[1120px] mx-auto px-4 md:px-6 h-9 flex items-center gap-2 text-xs text-[#887367]">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1 hover:text-[#703100] transition-colors font-medium"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12L12 3l9 9M4 10v10a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10" />
              </svg>
              Home
            </button>
            <span className="text-[#dbc1b4]">/</span>
            <span className="text-[#554339] font-medium capitalize truncate">
              {currentScreen === 'courses' ? 'Retreats'
                : currentScreen === 'register' ? 'Registration'
                : currentScreen === 'dana' ? 'Sangha Dana'
                : currentScreen === 'about' ? 'About'
                : currentScreen === 'talks' ? 'Dhamma Talks'
                : currentScreen === 'library' ? 'Library'
                : currentScreen === 'support' ? 'Support'
                : currentScreen === 'visit' ? 'Visit Us'
                : currentScreen}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
