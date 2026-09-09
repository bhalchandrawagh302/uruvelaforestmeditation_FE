import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Share2, Heart, Check, Plus, Calendar, Sparkles, X, Copy, MessageCircle, ExternalLink, QrCode } from 'lucide-react';
import { Language, DanaMealSlot, AllocatedDanaItem } from '../types';
import { TRANSLATIONS, INITIAL_OCT_DANA_SLOTS, INITIAL_ALLOCATED_LIST } from '../data/monasteryData';
import { getDanaPricingForDate, DANA_PRICING_UPDATED_EVENT } from '../services/danaPricingService';
import { SanghaDanaDaySchedule } from '../data/adminDanaData';
import { 
  getDanaSchedules, 
  createPendingBookingFromUser, 
  DANA_SCHEDULES_UPDATED_EVENT 
} from '../services/danaBookingService';

interface SanghaDanaViewProps {
  language: Language;
}

// Build a lookup map: "2026-10-05" → DanaMealSlot (from seed data)
const SEED_BOOKING_MAP: Record<string, DanaMealSlot> = {};
INITIAL_OCT_DANA_SLOTS.forEach((slot) => {
  if (!slot.isEmpty && slot.dateStr) {
    SEED_BOOKING_MAP[slot.dateStr] = slot;
  }
});

/** Generate calendar slots (with leading empty offsets) for a given year/month,
 *  merging in any existing booking data from danaSchedules and bookingOverrides. */
function generateMonthSlots(
  year: number,
  month: number, // 0-indexed (0=Jan, 8=Sep)
  bookingOverrides: Record<string, Partial<DanaMealSlot>>,
  danaSchedules: SanghaDanaDaySchedule[]
): DanaMealSlot[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const slots: DanaMealSlot[] = [];

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) {
    slots.push({ day: 0, dateStr: '', breakfastBooked: false, lunchBooked: false, isEmpty: true });
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;

    const sch = danaSchedules.find((s) => s.rawDate === dateStr);

    let scheduleData: Partial<DanaMealSlot> = {};
    if (sch) {
      const bfConfirmed = sch.breakfast.isAllocated && sch.breakfast.status === 'Confirmed';
      const bfPending = sch.breakfast.isAllocated && sch.breakfast.status === 'Pending';
      const luConfirmed = sch.lunch.isAllocated && sch.lunch.status === 'Confirmed';
      const luPending = sch.lunch.isAllocated && sch.lunch.status === 'Pending';
      const gpConfirmed = sch.gilanpachhaya?.isAllocated && sch.gilanpachhaya?.status === 'Confirmed';
      const gpPending = sch.gilanpachhaya?.isAllocated && sch.gilanpachhaya?.status === 'Pending';

      scheduleData = {
        breakfastBooked: bfConfirmed,
        breakfastPending: bfPending,
        breakfastDonor: (bfConfirmed || bfPending) ? sch.breakfast.sponsorName : undefined,
        lunchBooked: luConfirmed,
        lunchPending: luPending,
        lunchDonor: (luConfirmed || luPending) ? sch.lunch.sponsorName : undefined,
        gilanpachhayaBooked: !!gpConfirmed,
        gilanpachhayaPending: !!gpPending,
        gilanpachhayaDonor: (gpConfirmed || gpPending) ? sch.gilanpachhaya?.sponsorName : undefined,
        expectedGuests: sch.breakfast.attendeesCount || sch.lunch.attendeesCount || sch.gilanpachhaya?.attendeesCount,
        phone: sch.breakfast.contactPhone || sch.lunch.contactPhone || sch.gilanpachhaya?.contactPhone,
        email: sch.breakfast.email || sch.lunch.email || sch.gilanpachhaya?.email,
      };
    } else {
      const seed = SEED_BOOKING_MAP[dateStr] || {};
      scheduleData = { ...seed };
    }

    const override = bookingOverrides[dateStr] || {};
    slots.push({
      day: d,
      dateStr,
      breakfastBooked: false,
      lunchBooked: false,
      ...scheduleData,
      ...override,
      isEmpty: false,
    });
  }

  return slots;
}

/** Build the list of months to show: current month + next 3 months */
function buildMonthList(): { year: number; month: number; name: string }[] {
  const now = new Date();
  const list = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    list.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      name: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    });
  }
  return list;
}

export const SanghaDanaView: React.FC<SanghaDanaViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const MONTH_LIST = useMemo(() => buildMonthList(), []);

  const [allocatedList, setAllocatedList] = useState<AllocatedDanaItem[]>(INITIAL_ALLOCATED_LIST);
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // 0 = current real month

  // Per-month booking overrides (user bookings applied on top of seed data)
  const [bookingOverrides, setBookingOverrides] = useState<Record<string, Partial<DanaMealSlot>>>({}); 

  const [bookingModalSlot, setBookingModalSlot] = useState<DanaMealSlot | null>(null);
  const [bookingStep, setBookingStep] = useState<'form' | 'payment'>('form');
  const [submittedBookingInfo, setSubmittedBookingInfo] = useState<{
    dateDisplay: string;
    mealLabel: string;
    amount: number;
    donorName: string;
    phone: string;
    occasion?: string;
  } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [bookingMealType, setBookingMealType] = useState<'breakfast' | 'lunch' | 'evening_tea' | 'both'>('breakfast');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [dedicationNote, setDedicationNote] = useState('');
  const [expectedGuests, setExpectedGuests] = useState('');
  const [bookingSuccessToast, setBookingSuccessToast] = useState<string | null>(null);

  // Live Dana Schedules synchronized with Admin operations
  const [danaSchedules, setDanaSchedules] = useState<SanghaDanaDaySchedule[]>(() => getDanaSchedules());

  useEffect(() => {
    const handleSchedulesSync = () => {
      setDanaSchedules(getDanaSchedules());
    };
    window.addEventListener(DANA_SCHEDULES_UPDATED_EVENT, handleSchedulesSync);
    return () => window.removeEventListener(DANA_SCHEDULES_UPDATED_EVENT, handleSchedulesSync);
  }, []);

  // Re-render when admin updates pricing
  const [, setPricingVersion] = useState(0);
  useEffect(() => {
    const handlePricingUpdated = () => setPricingVersion((v) => v + 1);
    window.addEventListener(DANA_PRICING_UPDATED_EVENT, handlePricingUpdated);
    return () => window.removeEventListener(DANA_PRICING_UPDATED_EVENT, handlePricingUpdated);
  }, []);

  // Dynamically resolve pricing for the selected modal date
  const activeDatePricing = useMemo(() => {
    if (!bookingModalSlot || !bookingModalSlot.dateStr) {
      return getDanaPricingForDate('');
    }
    return getDanaPricingForDate(bookingModalSlot.dateStr);
  }, [bookingModalSlot]);

  const currentMonth = MONTH_LIST[currentMonthIndex];

  // Derive slots for the currently-viewed month, merging in any user overrides and live schedules
  const danaSlots = useMemo(
    () => generateMonthSlots(currentMonth.year, currentMonth.month, bookingOverrides, danaSchedules),
    [currentMonth, bookingOverrides, danaSchedules]
  );

  // Occasion lookup for initial/seeded allocated dates
  const SEED_OCCASION_MAP = useMemo(() => {
    const map: Record<string, string> = {
      '2026-10-01': 'Ancestral blessings and peace',
      '2026-10-02': 'Gratitude for the Dhamma',
      '2026-10-04': 'In memory of loved ones',
      '2026-10-05': 'Family health and merit generation',
      '2026-10-07': 'Birthday Dana',
      '2026-10-08': 'Vassa Offering',
    };
    return map;
  }, []);

  // Compute complete month's allocated dana list for the selected calendar month
  const monthAllocatedItems = useMemo(() => {
    // Only real calendar day slots (excluding empty leading cells)
    const daySlots = danaSlots.filter((s) => !s.isEmpty && s.dateStr);

    interface MonthAllocatedRow {
      id: string;
      dateDisplay: string;
      meal: string;
      donor: string;
      occasion: string;
      expectedGuests?: number;
      status: 'pending' | 'confirmed' | 'unallocated';
    }

    const rows: MonthAllocatedRow[] = [];

    daySlots.forEach((slot) => {
      const [y, m, d] = slot.dateStr.split('-').map(Number);
      const dateDisplay = new Date(y, m - 1, d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const bfAllocated = slot.breakfastBooked || slot.breakfastPending;
      const luAllocated = slot.lunchBooked || slot.lunchPending;
      const gpAllocated = slot.gilanpachhayaBooked || slot.gilanpachhayaPending;

      const sch = danaSchedules.find((s) => s.rawDate === slot.dateStr);
      const schOccasion = sch?.breakfast?.dedication || sch?.lunch?.dedication || sch?.gilanpachhaya?.dedication;

      // Find user dedication note and guests if created in this session
      const userItem = allocatedList.find((item) => item.id.includes(slot.dateStr));
      const seedOccasion = schOccasion || SEED_OCCASION_MAP[slot.dateStr] || userItem?.occasion || 'Blessings for all beings';
      const guestsCount = slot.expectedGuests || userItem?.expectedGuests;

      // Case 1: Neither is allocated -> Show a single row with "- -"
      if (!bfAllocated && !luAllocated && !gpAllocated) {
        rows.push({
          id: `${slot.dateStr}-none`,
          dateDisplay,
          meal: '- -',
          donor: '- -',
          occasion: '- -',
          status: 'unallocated',
        });
        return;
      }

      // Case 2: Full Day (All three allocated to SAME donor)
      if (
        bfAllocated &&
        luAllocated &&
        gpAllocated &&
        slot.breakfastDonor &&
        slot.lunchDonor &&
        slot.gilanpachhayaDonor &&
        slot.breakfastDonor.trim().toLowerCase() === slot.lunchDonor.trim().toLowerCase() &&
        slot.breakfastDonor.trim().toLowerCase() === slot.gilanpachhayaDonor.trim().toLowerCase()
      ) {
        const anyPending = slot.breakfastPending || slot.lunchPending || slot.gilanpachhayaPending;
        rows.push({
          id: `${slot.dateStr}-fullday`,
          dateDisplay,
          meal: 'Full Day (Breakfast, Lunch & Gilanpachhaya)',
          donor: slot.breakfastDonor,
          occasion: seedOccasion,
          expectedGuests: guestsCount,
          status: anyPending ? 'pending' : 'confirmed',
        });
        return;
      }

      // Case 3: Both Breakfast and Lunch allocated to the SAME donor
      if (
        bfAllocated &&
        luAllocated &&
        !gpAllocated &&
        slot.breakfastDonor &&
        slot.lunchDonor &&
        slot.breakfastDonor.trim().toLowerCase() === slot.lunchDonor.trim().toLowerCase() &&
        slot.breakfastPending === slot.lunchPending
      ) {
        rows.push({
          id: `${slot.dateStr}-both`,
          dateDisplay,
          meal: 'Breakfast & Lunch',
          donor: slot.breakfastDonor,
          occasion: seedOccasion,
          expectedGuests: guestsCount,
          status: slot.breakfastPending ? 'pending' : 'confirmed',
        });
        return;
      }

      // Case 4: Individual rows per meal
      if (bfAllocated) {
        rows.push({
          id: `${slot.dateStr}-breakfast`,
          dateDisplay,
          meal: 'Breakfast',
          donor: slot.breakfastDonor || 'Devotee',
          occasion: sch?.breakfast?.dedication || seedOccasion,
          expectedGuests: sch?.breakfast?.attendeesCount || guestsCount,
          status: slot.breakfastPending ? 'pending' : 'confirmed',
        });
      }

      if (luAllocated) {
        rows.push({
          id: `${slot.dateStr}-lunch`,
          dateDisplay,
          meal: 'Lunch',
          donor: slot.lunchDonor || 'Devotee',
          occasion: sch?.lunch?.dedication || seedOccasion,
          expectedGuests: sch?.lunch?.attendeesCount || guestsCount,
          status: slot.lunchPending ? 'pending' : 'confirmed',
        });
      }

      if (gpAllocated) {
        rows.push({
          id: `${slot.dateStr}-gilanpachhaya`,
          dateDisplay,
          meal: 'Gilanpachhaya (Evening Tea)',
          donor: slot.gilanpachhayaDonor || 'Devotee',
          occasion: sch?.gilanpachhaya?.dedication || seedOccasion,
          expectedGuests: sch?.gilanpachhaya?.attendeesCount || guestsCount,
          status: slot.gilanpachhayaPending ? 'pending' : 'confirmed',
        });
      }
    });

    return rows;
  }, [danaSlots, allocatedList, SEED_OCCASION_MAP, danaSchedules]);

  const months = MONTH_LIST; // alias for JSX use

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : prev));
  };

  const handleSlotClick = (slot: DanaMealSlot, meal?: 'breakfast' | 'lunch' | 'evening_tea') => {
    if (slot.isEmpty || !slot.dateStr) return;

    // Disallow booking past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = slot.dateStr.split('-').map(Number);
    const slotDate = new Date(y, m - 1, d);
    slotDate.setHours(0, 0, 0, 0);

    if (slotDate < today) {
      return;
    }
    
    // Check if slot has available options (booked OR pending blocks the slot)
    const bfUnavailable = slot.breakfastBooked || slot.breakfastPending;
    const luUnavailable = slot.lunchBooked || slot.lunchPending;
    const gpUnavailable = slot.gilanpachhayaBooked || slot.gilanpachhayaPending;
    if (meal === 'breakfast' && bfUnavailable) return;
    if (meal === 'lunch' && luUnavailable) return;
    if (meal === 'evening_tea' && gpUnavailable) return;
    if (bfUnavailable && luUnavailable && gpUnavailable) return;

    setBookingModalSlot(slot);
    setBookingStep('form');
    setSubmittedBookingInfo(null);
    setDonorName('');
    setDonorPhone('');
    setDonorEmail('');
    setDedicationNote('');
    setExpectedGuests('');
    if (meal) {
      setBookingMealType(meal);
    } else if (!bfUnavailable && !luUnavailable && !gpUnavailable) {
      setBookingMealType('both');
    } else if (!bfUnavailable) {
      setBookingMealType('breakfast');
    } else if (!luUnavailable) {
      setBookingMealType('lunch');
    } else {
      setBookingMealType('evening_tea');
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalSlot || !donorName.trim() || !donorPhone.trim()) return;

    const targetDateStr = bookingModalSlot.dateStr;
    const isBf = bookingMealType === 'breakfast' || bookingMealType === 'both';
    const isLu = bookingMealType === 'lunch' || bookingMealType === 'both';
    const isGp = bookingMealType === 'evening_tea' || bookingMealType === 'both';
    const parsedGuests = expectedGuests.trim() ? parseInt(expectedGuests, 10) || undefined : undefined;
    const cleanPhone = donorPhone.trim();
    const cleanEmail = donorEmail.trim() || undefined;

    // Set slot to PENDING in the overrides map
    setBookingOverrides((prev) => {
      const existing = prev[targetDateStr] || {};
      return {
        ...prev,
        [targetDateStr]: {
          ...existing,
          breakfastPending: isBf ? true : existing.breakfastPending,
          breakfastDonor: isBf ? donorName : existing.breakfastDonor,
          lunchPending: isLu ? true : existing.lunchPending,
          lunchDonor: isLu ? donorName : existing.lunchDonor,
          gilanpachhayaPending: isGp ? true : existing.gilanpachhayaPending,
          gilanpachhayaDonor: isGp ? donorName : existing.gilanpachhayaDonor,
          pendingDonor: donorName,
          phone: cleanPhone,
          email: cleanEmail,
          expectedGuests: parsedGuests,
        },
      };
    });

    // Create pending booking in shared service so admin sees it immediately with Pending status
    createPendingBookingFromUser({
      dateStr: targetDateStr,
      mealType: bookingMealType,
      donorName: donorName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      dedication: dedicationNote.trim() || undefined,
      attendeesCount: parsedGuests,
    });

    // Determine label & amount
    const mealLabel =
      bookingMealType === 'both'
        ? 'Full Day (Breakfast, Lunch & Gilanpachhaya)'
        : bookingMealType === 'breakfast'
        ? 'Breakfast'
        : bookingMealType === 'lunch'
        ? 'Lunch'
        : 'Gilanpachhaya (Evening Tea)';

    const mealAmount =
      bookingMealType === 'both'
        ? activeDatePricing.fullDay
        : bookingMealType === 'breakfast'
        ? activeDatePricing.breakfast
        : bookingMealType === 'lunch'
        ? activeDatePricing.lunch
        : activeDatePricing.gilanpachhaya;

    let dateDisplay = `Day ${bookingModalSlot.day}`;
    if (bookingModalSlot.dateStr) {
      const [y, m, d] = bookingModalSlot.dateStr.split('-').map(Number);
      dateDisplay = new Date(y, m - 1, d).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const newItem: AllocatedDanaItem = {
      id: `dana-${targetDateStr}-${Date.now()}`,
      dateDisplay,
      meal: mealLabel,
      donor: donorName,
      phone: cleanPhone,
      email: cleanEmail,
      occasion: dedicationNote.trim() || 'Merit offering for Sangha',
      expectedGuests: parsedGuests,
      status: 'pending',
    };

    setAllocatedList((prev) => [newItem, ...prev]);

    // Save submitted details and transition to Step 2: Payment & WhatsApp screenshot
    setSubmittedBookingInfo({
      dateDisplay,
      mealLabel,
      amount: mealAmount,
      donorName: donorName.trim(),
      phone: cleanPhone,
      occasion: dedicationNote.trim() || undefined,
    });
    setBookingStep('payment');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('satisanctuary@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleSendWhatsAppScreenshot = () => {
    if (!submittedBookingInfo) return;
    const message = `Vandami Bhante 🙏\n\nI have submitted a Sangha Dana offering on the website:\n• Date: ${submittedBookingInfo.dateDisplay}\n• Meal: ${submittedBookingInfo.mealLabel} (₹${submittedBookingInfo.amount.toLocaleString('en-IN')})\n• Donor: ${submittedBookingInfo.donorName}\n• Phone: ${submittedBookingInfo.phone}${submittedBookingInfo.occasion ? `\n• Dedication: ${submittedBookingInfo.occasion}` : ''}\n\nI am attaching my payment screenshot below for verification. Sadhu! 🙏`;
    window.open(`https://api.whatsapp.com/send?phone=919623603288&text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleContactCoordinator = () => {
    const message = `Vandami Bhante 🙏\n\nI would like to inquire about Sangha Dana offerings at Uruvela Forest Vihara. Could the Dana Coordinator please assist me?\n\nThank you!`;
    window.open(`https://api.whatsapp.com/send?phone=919623603288&text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCloseModal = () => {
    if (bookingStep === 'payment' && submittedBookingInfo) {
      setBookingSuccessToast(
        `Your Sangha Dana request for ${submittedBookingInfo.dateDisplay} is recorded as Pending. Attendants will confirm upon payment screenshot verification. Sādhu! 🙏`
      );
      setTimeout(() => setBookingSuccessToast(null), 6000);
    }
    setBookingModalSlot(null);
    setBookingStep('form');
    setSubmittedBookingInfo(null);
    setDonorName('');
    setDonorPhone('');
    setDonorEmail('');
    setDedicationNote('');
    setExpectedGuests('');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🙏 Sangha Dana Offering at Uruvela Forest Vihara. Offer breakfast or lunch to the resident Buddhist monastic community: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="pt-[117px] pb-20 min-h-screen">
      {/* Hero Section with Lattice pattern - Exactly matching Image 17.png */}
      <section className="relative w-full bg-[#fff1eb] bg-lattice border-b border-[#dbc1b4]/40 py-20 px-4 md:px-6 overflow-hidden">
        <div className="max-w-[1120px] mx-auto text-center relative z-10">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#703100] tracking-tight uppercase font-medium mb-4">
            {t.danaHeroTitle}
          </h1>
          <p className="text-base sm:text-lg text-[#554339] max-w-xl mx-auto mb-8 font-normal">
            {t.danaHeroSubtitle}
          </p>

          <button
            id="book-a-date-hero-btn"
            onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Find first available slot on or after today
              const firstAvailable = danaSlots.find((s) => {
                if (s.isEmpty || !s.dateStr) return false;
                const [y, m, d] = s.dateStr.split('-').map(Number);
                const slotDate = new Date(y, m - 1, d);
                slotDate.setHours(0, 0, 0, 0);
                if (slotDate < today) return false;
                return !s.breakfastBooked || !s.lunchBooked;
              });

              if (firstAvailable) {
                handleSlotClick(firstAvailable);
              } else {
                // If no slot available in current month, scroll down to calendar
                document.getElementById('reservation-calendar')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#b35c1e] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#944403] active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.btnBookDate}</span>
          </button>
        </div>
      </section>

      {/* Main Reservation Calendar Section */}
      <main id="reservation-calendar" className="max-w-[1120px] mx-auto px-4 md:px-6 pt-16">
        <div className="mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#703100] font-normal tracking-tight mb-6">
            {t.danaReservationTitle}
          </h2>

          {/* Month Navigation Switcher */}
          <div className="flex items-center justify-between bg-[#fff8f5] border border-[#dbc1b4]/60 rounded-xl px-4 py-3 mb-6 shadow-xs">
            <button
              onClick={handlePrevMonth}
              disabled={currentMonthIndex === 0}
              aria-label="Previous Month"
              className="p-2 text-[#554339] hover:text-[#703100] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f7e5dc] rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="font-serif text-lg md:text-xl font-medium text-[#231a15]">
              {months[currentMonthIndex].name}
            </span>

            <button
              onClick={handleNextMonth}
              disabled={currentMonthIndex === months.length - 1}
              aria-label="Next Month"
              className="p-2 text-[#554339] hover:text-[#703100] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f7e5dc] rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 7-Column Calendar Grid - Dual Split Half Cells for Breakfast / Lunch */}
          <div className="border border-[#dbc1b4] rounded-xl overflow-hidden bg-white shadow-xs">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-[#dbc1b4] bg-[#fff1eb]/80 text-center font-semibold text-xs text-[#554339] py-3">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#dbc1b4]/40">
              {danaSlots.map((slot, index) => {
                if (slot.isEmpty) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[80px] sm:min-h-[105px] bg-[#fdfbf7]/50"
                    />
                  );
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let isPast = false;
                if (slot.dateStr) {
                  const [y, m, d] = slot.dateStr.split('-').map(Number);
                  const slotDate = new Date(y, m - 1, d);
                  slotDate.setHours(0, 0, 0, 0);
                  isPast = slotDate < today;
                }

                return (
                  <div
                    key={slot.day}
                    className={`min-h-[80px] sm:min-h-[105px] flex flex-col relative group select-none transition-all ${
                      isPast ? 'opacity-40 grayscale-[50%] cursor-not-allowed bg-gray-50/70' : ''
                    }`}
                  >
                    {/* Day Number */}
                    <span className={`absolute top-1.5 left-2 text-xs font-semibold z-20 pointer-events-none drop-shadow-xs ${
                      isPast ? 'text-gray-400' : 'text-[#231a15]'
                    }`}>
                      {slot.day}
                    </span>

                    {/* Top Half: Breakfast */}
                    <div
                      onClick={() => !isPast && handleSlotClick(slot, 'breakfast')}
                      title={
                        isPast
                          ? `Day ${slot.day}: Past date`
                          : `Day ${slot.day} Breakfast: ${
                              slot.breakfastBooked
                                ? `Booked (${slot.breakfastDonor || 'Devotee'})`
                                : slot.breakfastPending
                                ? `Pending (${slot.breakfastDonor || 'Devotee'})`
                                : 'Available to Offer'
                            }`
                      }
                      className={`flex-1 flex items-center justify-center text-[10px] sm:text-xs font-medium transition-all duration-200 border-b border-white/20 ${
                        isPast
                          ? 'bg-[#a3948b] text-white/80 cursor-not-allowed'
                          : slot.breakfastBooked
                          ? 'bg-[#2d4739] text-white hover:brightness-110 cursor-default'
                          : slot.breakfastPending
                          ? 'bg-[#b91c1c] text-white cursor-default'
                          : 'bg-[#b35c1e] text-white hover:bg-[#944403] cursor-pointer'
                      }`}
                    >
                      <span className="hidden sm:inline pl-3">
                        {isPast ? 'Past' : slot.breakfastBooked ? 'Booked' : slot.breakfastPending ? 'Pending' : 'Open'}
                      </span>
                    </div>

                    {/* Bottom Half: Lunch */}
                    <div
                      onClick={() => !isPast && handleSlotClick(slot, 'lunch')}
                      title={
                        isPast
                          ? `Day ${slot.day}: Past date`
                          : `Day ${slot.day} Lunch: ${
                              slot.lunchBooked
                                ? `Booked (${slot.lunchDonor || 'Devotee'})`
                                : slot.lunchPending
                                ? `Pending (${slot.lunchDonor || 'Devotee'})`
                                : 'Available to Offer'
                            }`
                      }
                      className={`flex-1 flex items-center justify-center text-[10px] sm:text-xs font-medium transition-all duration-200 ${
                        isPast
                          ? 'bg-[#a3948b] text-white/80 cursor-not-allowed'
                          : slot.lunchBooked
                          ? 'bg-[#2d4739] text-white hover:brightness-110 cursor-default'
                          : slot.lunchPending
                          ? 'bg-[#b91c1c] text-white cursor-default'
                          : 'bg-[#b35c1e] text-white hover:bg-[#944403] cursor-pointer'
                      }`}
                    >
                      <span className="hidden sm:inline pl-3">
                        {isPast ? 'Past' : slot.lunchBooked ? 'Booked' : slot.lunchPending ? 'Pending' : 'Open'}
                      </span>
                    </div>

                    {/* Gilanpachhaya Indicator (if booked or pending) */}
                    {(slot.gilanpachhayaBooked || slot.gilanpachhayaPending) && (
                      <div
                        onClick={() => !isPast && handleSlotClick(slot, 'evening_tea')}
                        title={
                          isPast
                            ? `Day ${slot.day}: Past date`
                            : `Day ${slot.day} Gilanpachhaya: ${
                                slot.gilanpachhayaBooked
                                  ? `Booked (${slot.gilanpachhayaDonor || 'Devotee'})`
                                  : `Pending (${slot.gilanpachhayaDonor || 'Devotee'})`
                              }`
                        }
                        className={`py-0.5 flex items-center justify-center text-[9px] font-medium border-t border-white/20 transition-all ${
                          isPast
                            ? 'bg-[#8a7c73] text-white/70 cursor-not-allowed'
                            : slot.gilanpachhayaBooked
                            ? 'bg-[#1b3b28] text-white hover:brightness-110 cursor-default'
                            : 'bg-[#991b1b] text-white cursor-default'
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {slot.gilanpachhayaBooked ? 'Tea: Booked' : 'Tea: Pending'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Below Calendar: Color Legend & Contact Coordinator Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            {/* Color Legend */}
            <div className="flex flex-wrap items-center justify-start gap-6 sm:gap-8 text-xs text-[#554339]">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 bg-[#2d4739] rounded-xs shadow-2xs inline-block" />
                <span className="font-medium">{t.legendAllocated}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 bg-[#b91c1c] rounded-xs shadow-2xs inline-block" />
                <span className="font-medium">Pending Confirmation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 bg-[#b35c1e] rounded-xs shadow-2xs inline-block" />
                <span className="font-medium">{t.legendAvailable}</span>
              </div>
            </div>

            {/* Contact Coordinator WhatsApp Button */}
            <button
              id="contact-dana-coordinator-btn"
              type="button"
              onClick={handleContactCoordinator}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer self-start sm:self-auto shrink-0"
              title="Contact Dana Coordinator on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contact Coordinator</span>
            </button>
          </div>
        </div>

        {/* Collapsible Accordion Table: "Allocated dana list" */}
        <div className="mt-12 bg-[#fff8f5] rounded-xl border border-[#dbc1b4]/60 overflow-hidden shadow-xs">
          <button
            id="toggle-allocated-list-btn"
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="w-full flex items-center justify-between p-5 text-left bg-[#fff1eb]/60 hover:bg-[#fff1eb] transition-colors cursor-pointer border-b border-[#dbc1b4]/40"
          >
            <span className="font-serif text-lg text-[#703100] font-medium">
              {t.allocatedDanaList} ({currentMonth.name}) — {monthAllocatedItems.filter(i => i.status !== 'unallocated').length} Booked
            </span>
            {isListExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#703100]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#703100]" />
            )}
          </button>

          {isListExpanded && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#dbc1b4]/30 bg-[#fceae2]/40 text-xs font-semibold text-[#554339] uppercase tracking-wider">
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">{t.thMeal}</th>
                    <th className="py-3 px-6">{t.thDonor}</th>
                    <th className="py-3 px-6">{t.thOccasion}</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dbc1b4]/30 text-[#231a15]">
                  {monthAllocatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        item.status === 'unallocated'
                          ? 'hover:bg-[#fdfbf7]/60 opacity-60'
                          : 'hover:bg-[#fff1eb]/40'
                      }`}
                    >
                      <td className="py-4 px-6 font-medium text-[#703100]">
                        {item.dateDisplay}
                      </td>
                      <td
                        className={`py-4 px-6 font-semibold ${
                          item.status === 'unallocated'
                            ? 'text-gray-400 font-normal tracking-wider'
                            : 'text-[#2d4739]'
                        }`}
                      >
                        {item.meal}
                      </td>
                      <td
                        className={`py-4 px-6 ${
                          item.status === 'unallocated'
                            ? 'text-gray-400 font-normal tracking-wider'
                            : 'text-[#231a15]'
                        }`}
                      >
                        <div>{item.donor}</div>
                        {item.expectedGuests ? (
                          <div className="text-[11px] text-[#8c3c0b] font-medium mt-0.5">
                            {item.expectedGuests} {item.expectedGuests === 1 ? 'guest' : 'guests'} attending
                          </div>
                        ) : null}
                      </td>
                      <td
                        className={`py-4 px-6 text-xs italic ${
                          item.status === 'unallocated'
                            ? 'text-gray-400 not-italic tracking-wider'
                            : 'text-[#554339]'
                        }`}
                      >
                        {item.occasion}
                      </td>
                      <td className="py-4 px-6">
                        {item.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                            Pending
                          </span>
                        ) : item.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[#e8f5ee] text-[#2d4739] border border-[#2d4739]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2d4739] inline-block" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs font-normal tracking-wider">
                            - -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* WhatsApp Share Link */}
        <div className="mt-8 text-center md:text-left">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#496455] hover:text-[#2d4739] hover:underline cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareWhatsApp}</span>
          </button>
        </div>
      </main>

      {/* Booking Modal */}
      {bookingModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f5] border border-[#dbc1b4] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-[#554339] hover:text-[#703100] rounded-full hover:bg-[#f7e5dc] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingStep === 'payment' && submittedBookingInfo ? (
              <div className="space-y-4 sm:space-y-5">
                {/* Header with Step Indicator */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-[#703100] border border-amber-300/80">
                      <Sparkles className="w-3 h-3 text-[#b35c1e]" />
                      Payment & Screenshot Verification
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#703100] font-normal tracking-tight">
                    Dana Offering & Contribution
                  </h3>
                  <p className="text-xs text-[#554339] leading-relaxed mt-1">
                    Your offering request has been registered as pending. Scan the QR code below or use UPI, then share the payment screenshot on WhatsApp to confirm.
                  </p>
                </div>

                {/* Offering Summary Card */}
                <div className="bg-[#fff1eb] border border-[#dbc1b4]/80 rounded-xl p-3.5 sm:p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#887367]">Offering Date</span>
                    <span className="font-semibold text-[#231a15]">{submittedBookingInfo.dateDisplay}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#887367]">Meal Offering</span>
                    <span className="font-semibold text-[#231a15]">{submittedBookingInfo.mealLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#887367]">Devotee / Family</span>
                    <span className="font-semibold text-[#231a15]">{submittedBookingInfo.donorName}</span>
                  </div>
                  {submittedBookingInfo.occasion && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#887367]">Occasion / Dedication</span>
                      <span className="font-semibold text-[#231a15] truncate max-w-[200px]">{submittedBookingInfo.occasion}</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-[#dbc1b4]/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#703100] block">
                        Contribution Amount
                      </span>
                      <span className="text-[11px] text-[#887367]">Sangha Dana Support</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-[#703100]">
                      ₹{submittedBookingInfo.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* QR Code & UPI Card */}
                <div className="bg-white border border-[#dbc1b4] rounded-xl p-4 text-center shadow-xs space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#703100] uppercase tracking-wider">
                    <QrCode className="w-4 h-4 text-[#b35c1e]" />
                    <span>Scan with Any UPI App</span>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-2.5 bg-[#fff8f5] border border-[#dbc1b4]/70 rounded-2xl shadow-xs inline-block">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `upi://pay?pa=satisanctuary@upi&pn=Uruvela%20Forest%20Vihara&am=${submittedBookingInfo.amount}&cu=INR&tn=${encodeURIComponent(`Sangha Dana ${submittedBookingInfo.mealLabel}`)}`
                        )}`}
                        alt="UPI Payment QR Code"
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#887367]">
                    Google Pay • PhonePe • Paytm • BHIM • Cred • Banking Apps
                  </p>

                  {/* Copy UPI Box */}
                  <div className="bg-[#fff1eb] p-3 rounded-xl flex items-center justify-between border border-[#dbc1b4]/60 text-left">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] uppercase font-semibold text-[#887367] tracking-wider block">
                        Monastery UPI ID
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-semibold text-[#703100] truncate block">
                        satisanctuary@upi
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="shrink-0 px-3 py-1.5 bg-[#fceae2] hover:bg-[#f7e5dc] text-[#703100] rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold border border-[#dbc1b4]/60 cursor-pointer active:scale-95"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2d4739]" />
                          <span className="text-[#2d4739]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Screenshot Verification Card */}
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#22c55e]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle className="w-4 h-4 text-[#15803d]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                        Verification Required
                      </h4>
                      <p className="text-xs text-[#166534]/90 mt-0.5 leading-relaxed">
                        After paying, click below to share the payment screenshot with the monastery attendants at <strong>+91 9623603288</strong> so they can verify and confirm your Dana booking.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendWhatsAppScreenshot}
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Share Payment Screenshot on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Done / Close Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-3 rounded-full bg-[#703100] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#572600] shadow-xs cursor-pointer active:scale-98 transition-all"
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-serif text-2xl text-[#703100] mb-1 font-normal">
                  Offer Sangha Dana
                </h3>
                <p className="text-xs text-[#554339] mb-3 font-medium">
                  Selected Date:{' '}
                  {(() => {
                    if (bookingModalSlot.dateStr) {
                      const [y, m, d] = bookingModalSlot.dateStr.split('-').map(Number);
                      const dateObj = new Date(y, m - 1, d);
                      return dateObj.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }
                    return `Day ${bookingModalSlot.day}`;
                  })()}
                </p>

                {activeDatePricing.isCustom && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#b35c1e]" />
                    <span className="font-semibold">Special Date Pricing</span>
                    {activeDatePricing.note && (
                      <span className="text-amber-800">({activeDatePricing.note})</span>
                    )}
                  </div>
                )}

                <form onSubmit={handleConfirmBooking} className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339]">
                        Select Meal Offering
                      </label>
                      <span className="text-xs font-medium text-[#703100]">
                        Suggested Dana
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Option 1: Breakfast */}
                      <button
                        type="button"
                        disabled={bookingModalSlot.breakfastBooked || bookingModalSlot.breakfastPending}
                        onClick={() => setBookingMealType('breakfast')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          bookingMealType === 'breakfast'
                            ? 'bg-[#703100] text-white border-[#703100] shadow-xs'
                            : bookingModalSlot.breakfastBooked || bookingModalSlot.breakfastPending
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-[#231a15] border-[#dbc1b4] hover:bg-[#fceae2]'
                        }`}
                      >
                        <span className="font-semibold">Breakfast</span>
                        <span className={`text-[11px] font-bold ${bookingMealType === 'breakfast' ? 'text-amber-200' : 'text-[#703100]'}`}>
                          ₹{activeDatePricing.breakfast.toLocaleString('en-IN')}
                        </span>
                      </button>

                      {/* Option 2: Lunch */}
                      <button
                        type="button"
                        disabled={bookingModalSlot.lunchBooked || bookingModalSlot.lunchPending}
                        onClick={() => setBookingMealType('lunch')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          bookingMealType === 'lunch'
                            ? 'bg-[#703100] text-white border-[#703100] shadow-xs'
                            : bookingModalSlot.lunchBooked || bookingModalSlot.lunchPending
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-[#231a15] border-[#dbc1b4] hover:bg-[#fceae2]'
                        }`}
                      >
                        <span className="font-semibold">Lunch</span>
                        <span className={`text-[11px] font-bold ${bookingMealType === 'lunch' ? 'text-amber-200' : 'text-[#703100]'}`}>
                          ₹{activeDatePricing.lunch.toLocaleString('en-IN')}
                        </span>
                      </button>

                      {/* Option 3: Gilanpachhaya (Evening Tea) */}
                      <button
                        type="button"
                        disabled={bookingModalSlot.gilanpachhayaBooked || bookingModalSlot.gilanpachhayaPending}
                        onClick={() => setBookingMealType('evening_tea')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          bookingMealType === 'evening_tea'
                            ? 'bg-[#703100] text-white border-[#703100] shadow-xs'
                            : bookingModalSlot.gilanpachhayaBooked || bookingModalSlot.gilanpachhayaPending
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-[#231a15] border-[#dbc1b4] hover:bg-[#fceae2]'
                        }`}
                      >
                        <span className="font-semibold text-[11px] sm:text-xs">Gilanpachhaya</span>
                        <span className={`text-[9px] ${bookingMealType === 'evening_tea' ? 'text-amber-100' : 'text-[#887367]'}`}>
                          (Evening Tea)
                        </span>
                        <span className={`text-[11px] font-bold ${bookingMealType === 'evening_tea' ? 'text-amber-200' : 'text-[#703100]'}`}>
                          ₹{activeDatePricing.gilanpachhaya.toLocaleString('en-IN')}
                        </span>
                      </button>

                      {/* Option 4: Full Day */}
                      <button
                        type="button"
                        disabled={
                          bookingModalSlot.breakfastBooked ||
                          bookingModalSlot.lunchBooked ||
                          bookingModalSlot.gilanpachhayaBooked ||
                          bookingModalSlot.breakfastPending ||
                          bookingModalSlot.lunchPending ||
                          bookingModalSlot.gilanpachhayaPending
                        }
                        onClick={() => setBookingMealType('both')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          bookingMealType === 'both'
                            ? 'bg-[#703100] text-white border-[#703100] shadow-xs'
                            : bookingModalSlot.breakfastBooked ||
                              bookingModalSlot.lunchBooked ||
                              bookingModalSlot.gilanpachhayaBooked ||
                              bookingModalSlot.breakfastPending ||
                              bookingModalSlot.lunchPending ||
                              bookingModalSlot.gilanpachhayaPending
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-[#231a15] border-[#dbc1b4] hover:bg-[#fceae2]'
                        }`}
                      >
                        <span className="font-semibold">Full Day</span>
                        <span className={`text-[11px] font-bold ${bookingMealType === 'both' ? 'text-amber-200' : 'text-[#703100]'}`}>
                          ₹{activeDatePricing.fullDay.toLocaleString('en-IN')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Amount to Pay Highlight Box */}
                  <div className="bg-[#fff1eb] border border-[#dbc1b4]/70 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#554339] font-medium block">
                        Dana Offering Amount
                      </span>
                      <span className="text-[11px] text-[#887367]">
                        {bookingMealType === 'both'
                          ? 'Full Day: Breakfast, Lunch & Gilanpachhaya for Sangha'
                          : bookingMealType === 'breakfast'
                          ? 'Morning Breakfast for Monastic Sangha'
                          : bookingMealType === 'lunch'
                          ? 'Afternoon Main Lunch for Monastic Sangha'
                          : 'Gilanpachhaya (Evening Tea & Refreshments) for Sangha'}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-base sm:text-lg font-bold text-[#703100]">
                        {bookingMealType === 'both'
                          ? `₹${activeDatePricing.fullDay.toLocaleString('en-IN')}`
                          : bookingMealType === 'breakfast'
                          ? `₹${activeDatePricing.breakfast.toLocaleString('en-IN')}`
                          : bookingMealType === 'lunch'
                          ? `₹${activeDatePricing.lunch.toLocaleString('en-IN')}`
                          : `₹${activeDatePricing.gilanpachhaya.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-1">
                      Family / Donor Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Sharma Family / Anonymous"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="form-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g., +91 98765 43210"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="form-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g., donor@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="form-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-1">
                      Occasion or Dedication (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Birthday, In Memory of Ancestors, Peace"
                      value={dedicationNote}
                      onChange={(e) => setDedicationNote(e.target.value)}
                      className="form-input w-full text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-1">
                      Expected Guests Arriving (Optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      placeholder="e.g., 2, 4 (leave blank if offering remotely)"
                      value={expectedGuests}
                      onChange={(e) => setExpectedGuests(e.target.value)}
                      className="form-input w-full text-sm"
                    />
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 py-2.5 rounded-full border border-[#dbc1b4] text-xs font-semibold uppercase tracking-wider text-[#554339] hover:bg-[#fceae2]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-full bg-[#b35c1e] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#944403] shadow-xs cursor-pointer active:scale-98"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Notification Toast */}
      {bookingSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#b91c1c] text-white px-6 py-4 rounded-xl shadow-xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2.5 h-2.5 rounded-full bg-red-200 inline-block animate-pulse flex-shrink-0" />
          <span className="text-sm font-medium">{bookingSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
