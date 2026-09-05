import React, { useState } from 'react';
import { Heart, Sparkles, Coffee, ShieldCheck, Check, Copy } from 'lucide-react';
import { Language, ScreenType } from '../types';
import { TRANSLATIONS } from '../data/monasteryData';

interface SupportViewProps {
  language: Language;
  onNavigate: (screen: ScreenType) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ language, onNavigate }) => {
  const t = TRANSLATIONS[language];
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const copyUpi = () => {
    navigator.clipboard.writeText('satisanctuary@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const copyAccount = () => {
    navigator.clipboard.writeText('1234567890');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 min-h-screen">
      <div className="max-w-[1120px] mx-auto space-y-12">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#231a15] font-normal tracking-tight mb-3">
            Dana & Voluntary Service
          </h1>
          <p className="text-[#554339] text-base sm:text-lg max-w-2xl leading-relaxed">
            In accordance with Buddhist tradition, the Dhamma is given freely without price. Sati Sanctuary operates entirely on voluntary contributions from past students and benevolent supporters.
          </p>
        </div>

        {/* 3 Pillars of Dana */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fff1eb] p-6 rounded-2xl border border-[#dbc1b4]/40 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#fceae2] flex items-center justify-center text-[#703100]">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#703100] font-medium">Sangha Meal Dana</h3>
              <p className="text-xs text-[#554339] leading-relaxed">
                Provide daily nourishing vegetarian breakfast and lunch for the monastic community and resident meditators.
              </p>
            </div>
            <button
              onClick={() => onNavigate('dana')}
              className="mt-6 py-2.5 px-4 bg-[#b35c1e] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#944403] transition-colors"
            >
              Book a Dana Date
            </button>
          </div>

          <div className="bg-[#fff1eb] p-6 rounded-2xl border border-[#dbc1b4]/40 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#cbead7] flex items-center justify-center text-[#2d4739]">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#2d4739] font-medium">Dhamma Seva (Volunteering)</h3>
              <p className="text-xs text-[#554339] leading-relaxed">
                Offer selfless service in course management, meal preparation, gardening, or cleaning to support fellow meditators.
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="mt-6 py-2.5 px-4 bg-[#2d4739] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#1f3228] transition-colors"
            >
              Offer Dhamma Seva
            </button>
          </div>

          <div className="bg-[#fff1eb] p-6 rounded-2xl border border-[#dbc1b4]/40 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#fceae2] flex items-center justify-center text-[#703100]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#703100] font-medium">Sanctuary Kutis & Maintenance</h3>
              <p className="text-xs text-[#554339] leading-relaxed">
                Support the ongoing conservation of the 75 disciples kutis, solar energy, and herbal medicinal gardens.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-[#dbc1b4]/40 flex items-center justify-between text-xs text-[#703100] font-semibold">
              <span>Tax Exemption 80G</span>
              <ShieldCheck className="w-4 h-4 text-[#2d4739]" />
            </div>
          </div>
        </div>

        {/* Bank & UPI Details Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dbc1b4] shadow-xs max-w-2xl mx-auto text-center space-y-4">
          <h3 className="font-serif text-2xl text-[#703100]">Bank & UPI Transfer</h3>
          <p className="text-xs text-[#554339]">
            Official Monastery Trust Account for Indian & International Remittances:
          </p>

          <div className="bg-[#fff1eb] p-4 rounded-xl flex items-center justify-between max-w-sm mx-auto border border-[#dbc1b4]/40">
            <span className="font-mono text-sm font-semibold text-[#703100]">satisanctuary@upi</span>
            <button
              onClick={copyUpi}
              className="p-2 text-[#703100] hover:bg-[#f7e5dc] rounded-full transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              {copiedUpi ? <Check className="w-4 h-4 text-[#2d4739]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[#dbc1b4]/40 pt-4">
            <p className="text-xs text-[#554339] mb-3 font-medium">Bank Account Details:</p>
            <div className="bg-[#fff1eb] p-4 rounded-xl border border-[#dbc1b4]/40 max-w-sm mx-auto space-y-2.5 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#887367]">Account Name</span>
                <span className="font-semibold text-[#231a15]">Uruvela Forest Vihara Trust</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#887367]">Account No.</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-[#703100]">1234567890</span>
                  <button
                    onClick={copyAccount}
                    className="p-1 text-[#703100] hover:bg-[#f7e5dc] rounded-full transition-colors flex items-center gap-0.5 text-xs font-semibold"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-[#2d4739]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#887367]">IFSC Code</span>
                <span className="font-mono font-semibold text-[#231a15]">SBIN0001234</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#887367]">Bank</span>
                <span className="font-semibold text-[#231a15]">State Bank of India</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#887367]">Branch</span>
                <span className="font-semibold text-[#231a15]">Bodh Gaya, Bihar</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#887367] italic">
            Receipts for all voluntary donations are sent via email within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};
