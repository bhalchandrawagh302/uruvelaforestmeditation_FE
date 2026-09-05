import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, X, Heart, Shield, HelpCircle } from 'lucide-react';
import { Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';

interface FooterProps {
  language: Language;
  onNavigate: (screen: ScreenType) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const t = TRANSLATIONS[language];
  const [activeModal, setActiveModal] = useState<'contact' | 'visit' | 'privacy' | 'accessibility' | null>(null);

  return (
    <>
      <footer className="w-full bg-[#fff1eb] border-t border-[#dbc1b4]/40 mt-auto py-12 sm:py-14 transition-colors duration-300">
        <div className="max-w-[1120px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">
            {/* Left: Sanctuary tagline */}
            <div className="text-left">
              <p className="text-sm text-[#554339] max-w-xs leading-relaxed">
                A digital sanctuary for mindful living and spiritual practice.
              </p>
            </div>

            {/* Middle: Links in clean stacked column */}
            <div className="flex flex-col space-y-2 text-left md:items-start">
              <button
                id="footer-contact-btn"
                onClick={() => setActiveModal('contact')}
                className="text-sm text-[#554339] hover:text-[#703100] transition-colors duration-200 cursor-pointer text-left w-fit"
              >
                {t.navContact}
              </button>

              <button
                id="footer-privacy-btn"
                onClick={() => setActiveModal('privacy')}
                className="text-sm text-[#554339] hover:text-[#703100] transition-colors duration-200 cursor-pointer text-left w-fit"
              >
                {t.navPrivacy}
              </button>

              <button
                id="footer-visit-btn"
                onClick={() => onNavigate('visit')}
                className="text-sm text-[#554339] hover:text-[#703100] transition-colors duration-200 cursor-pointer text-left w-fit"
              >
                {t.navVisitUs}
              </button>

              <button
                id="footer-access-btn"
                onClick={() => setActiveModal('accessibility')}
                className="text-sm text-[#554339] hover:text-[#703100] transition-colors duration-200 cursor-pointer text-left w-fit"
              >
                {t.navAccessibility}
              </button>

              {/* <button
                id="footer-admin-btn"
                onClick={() => onNavigate('dashboard')}
                className="text-xs text-[#8c3c0b] hover:underline transition-colors duration-200 cursor-pointer text-left w-fit pt-1 font-medium"
              >
                Admin Portal
              </button> */}

              <a
                id="footer-github-btn"
                href="https://github.com/uruvela-forest-vihara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#554339] hover:text-[#703100] transition-colors duration-200 text-left w-fit flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>

              <a
                id="footer-developer-btn"
                href="https://github.com/chandansahoo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#554339] hover:text-[#703100] transition-colors duration-200 text-left w-fit"
              >
                Developer
              </a>
            </div>

            {/* Right: Mail Icon & Copyright */}
            <div className="flex flex-col md:items-end space-y-4 text-left md:text-right">
              <div className="flex items-center gap-2">
                {/* Mail */}
                <button
                  id="footer-email-icon-btn"
                  onClick={() => setActiveModal('contact')}
                  aria-label="Send email to sanctuary"
                  className="w-10 h-10 rounded-lg border border-[#dbc1b4] flex items-center justify-center text-[#703100] hover:bg-[#fceae2] transition-colors shadow-xs"
                >
                  <Mail className="w-5 h-5" />
                </button>

                {/* YouTube */}
                <a
                  id="footer-youtube-btn"
                  href="https://www.youtube.com/@UruvelajForestVihara"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube channel"
                  className="w-10 h-10 rounded-lg border border-[#dbc1b4] flex items-center justify-center text-[#703100] hover:bg-[#fceae2] transition-colors shadow-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  id="footer-instagram-btn"
                  href="https://www.instagram.com/uruvela.vihara"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram profile"
                  className="w-10 h-10 rounded-lg border border-[#dbc1b4] flex items-center justify-center text-[#703100] hover:bg-[#fceae2] transition-colors shadow-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  id="footer-facebook-btn"
                  href="https://www.facebook.com/UruvelajForestVihara"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook page"
                  className="w-10 h-10 rounded-lg border border-[#dbc1b4] flex items-center justify-center text-[#703100] hover:bg-[#fceae2] transition-colors shadow-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>

              <p className="text-xs text-[#887367]">
                {t.copyright}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Modal Dialogs */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-[#fff8f5] border border-[#dbc1b4] rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 text-[#554339] hover:text-[#703100] rounded-full hover:bg-[#f7e5dc] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'contact' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#703100]">Contact Sanctuary</h3>
                <p className="text-sm text-[#554339] leading-relaxed">
                  The monastic attendants are available to answer queries regarding retreat registration, Sangha Dana, and travel arrangements.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-[#231a15]">
                    <MapPin className="w-4 h-4 text-[#b35c1e] shrink-0" />
                    <span>Uruvela Forest Vihara, Dungeshwari, Bodhgaya, Bihar, India</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#231a15]">
                    <Phone className="w-4 h-4 text-[#b35c1e] shrink-0" />
                    <span>+91 94312 88421 / +91 80023 11904</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#231a15]">
                    <Mail className="w-4 h-4 text-[#b35c1e] shrink-0" />
                    <span>retreats@satisanctuary.org</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#231a15]">
                    <Clock className="w-4 h-4 text-[#b35c1e] shrink-0" />
                    <span>Office Hours: 08:30 AM – 11:30 AM & 02:00 PM – 05:00 PM IST</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'visit' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#703100]">Visiting the Sanctuary</h3>
                <p className="text-sm text-[#554339] leading-relaxed">
                  Uruvela Forest Vihara is located in the sacred hills of Dungeshwari (Mahakala Cave vicinity), 8 km southeast of the Mahabodhi Temple, Bodhgaya.
                </p>
                <div className="bg-[#fceae2] p-4 rounded-xl space-y-2 text-xs text-[#554339]">
                  <p className="font-semibold text-[#703100]">How to Reach:</p>
                  <p>• Nearest Airport: Gaya International Airport (GAY) - 16 km</p>
                  <p>• Nearest Railway: Gaya Junction (GAYA) - 18 km</p>
                  <p>• Auto-rickshaws and pre-arranged sanctuary shuttles are available from Bodhgaya center.</p>
                </div>
                <p className="text-xs text-[#887367] italic">
                  Note: Visitors are requested to dress modestly in white or neutral colors and maintain quietude on the monastery grounds.
                </p>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#703100]">Privacy & Mindful Data Care</h3>
                <p className="text-sm text-[#554339] leading-relaxed">
                  All personal details, health disclosures, and identification documents submitted during Vipassana course registration or Dana reservations are strictly confidential.
                </p>
                <p className="text-xs text-[#554339]">
                  Data is used solely for spiritual retreat preparation, emergency care during the stay, and dietary coordination with the Sangha kitchen. No data is ever sold or shared with external parties.
                </p>
              </div>
            )}

            {activeModal === 'accessibility' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#703100]">Sanctuary Accessibility</h3>
                <p className="text-sm text-[#554339] leading-relaxed">
                  The Dhamma Hall, dining pavilion, and primary walking meditation pathways have step-free ramp access. Wheelchair-accessible kutis (living huts) are reserved for meditators with mobility needs upon request in the registration form.
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-[#b35c1e] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#944403] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
