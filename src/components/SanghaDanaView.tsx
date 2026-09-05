import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Share2, Heart, Check, Plus, Calendar, Sparkles, X } from 'lucide-react';
import { Language, DanaMealSlot, AllocatedDanaItem } from '../types';
import { TRANSLATIONS, INITIAL_OCT_DANA_SLOTS, INITIAL_ALLOCATED_LIST } from '../data/monasteryData';

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
 *  merging in any existing booking data from bookingOverrides. */
function generateMonthSlots(
  year: number,
  month: number, // 0-indexed (0=Jan, 8=Sep)
  bookingOverrides: Record<string, Partial<DanaMealSlot>>
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
    const seed = SEED_BOOKING_MAP[dateStr] || {};
    const override = bookingOverrides[dateStr] || {};
    slots.push({
      day: d,
      dateStr,
      breakfastBooked: false,
      lunchBooked: false,
      ...seed,
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

  // Booking Modal State
  const [bookingModalSlot, setBookingModalSlot] = useState<DanaMealSlot | null>(null);
  const [bookingMealType, setBookingMealType] = useState<'breakfast' | 'lunch' | 'both'>('breakfast');
  const [donorName, setDonorName] = useState('');
  const [dedicationNote, setDedicationNote] = useState('');
  const [bookingSuccessToast, setBookingSuccessToast] = useState<string | null>(null);

  const currentMonth = MONTH_LIST[currentMonthIndex];

  // Derive slots for the currently-viewed month, merging in any user overrides
  const danaSlots = useMemo(
    () => generateMonthSlots(currentMonth.year, currentMonth.month, bookingOverrides),
    [currentMonth, bookingOverrides]
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

      // Find user dedication note if created in this session
      const userItem = allocatedList.find((item) => item.id.includes(slot.dateStr));
      const seedOccasion = SEED_OCCASION_MAP[slot.dateStr] || userItem?.occasion || 'Blessings for all beings';

      // Case 1: Neither is allocated -> Show a single row with "- -"
      if (!bfAllocated && !luAllocated) {
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

      // Case 2: Both allocated to the SAME donor
      if (
        bfAllocated &&
        luAllocated &&
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
          status: slot.breakfastPending ? 'pending' : 'confirmed',
        });
        return;
      }

      // Case 3: Distinct donors or distinct meal bookings -> individual rows per meal
      if (bfAllocated) {
        rows.push({
          id: `${slot.dateStr}-breakfast`,
          dateDisplay,
          meal: 'Breakfast',
          donor: slot.breakfastDonor || 'Devotee',
          occasion: seedOccasion,
          status: slot.breakfastPending ? 'pending' : 'confirmed',
        });
      }

      if (luAllocated) {
        rows.push({
          id: `${slot.dateStr}-lunch`,
          dateDisplay,
          meal: 'Lunch',
          donor: slot.lunchDonor || 'Devotee',
          occasion: seedOccasion,
          status: slot.lunchPending ? 'pending' : 'confirmed',
        });
      }
    });

    return rows;
  }, [danaSlots, allocatedList, SEED_OCCASION_MAP]);

  const months = MONTH_LIST; // alias for JSX use

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : prev));
  };

  const handleSlotClick = (slot: DanaMealSlot, meal?: 'breakfast' | 'lunch') => {
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
    if (meal === 'breakfast' && bfUnavailable) return;
    if (meal === 'lunch' && luUnavailable) return;
    if (bfUnavailable && luUnavailable) return;

    setBookingModalSlot(slot);
    if (meal) {
      setBookingMealType(meal);
    } else if (!bfUnavailable && !luUnavailable) {
      setBookingMealType('both');
    } else if (!bfUnavailable) {
      setBookingMealType('breakfast');
    } else {
      setBookingMealType('lunch');
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalSlot || !donorName.trim()) return;

    const targetDateStr = bookingModalSlot.dateStr;
    const isBf = bookingMealType === 'breakfast' || bookingMealType === 'both';
    const isLu = bookingMealType === 'lunch' || bookingMealType === 'both';

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
          pendingDonor: donorName,
        },
      };
    });

    // Add to allocated list with Pending status
    const mealLabel =
      bookingMealType === 'both'
        ? 'Breakfast & Lunch'
        : bookingMealType === 'breakfast'
        ? 'Breakfast'
        : 'Lunch';

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
      occasion: dedicationNote.trim() || 'Merit offering for Sangha',
      status: 'pending',
    };

    setAllocatedList((prev) => [newItem, ...prev]);

    setBookingSuccessToast(
      `Your Sangha Dana request for ${dateDisplay} is pending confirmation. Sādhu! 🙏`
    );
    setTimeout(() => setBookingSuccessToast(null), 5000);

    setBookingModalSlot(null);
    setDonorName('');
    setDedicationNote('');
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-start gap-8 mt-6 text-xs text-[#554339]">
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
                        {item.donor}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fff8f5] border border-[#dbc1b4] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setBookingModalSlot(null)}
              className="absolute top-4 right-4 p-2 text-[#554339] hover:text-[#703100] rounded-full hover:bg-[#f7e5dc]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-[#703100] mb-1 font-normal">
              Offer Sangha Dana
            </h3>
            <p className="text-xs text-[#554339] mb-6 font-medium">
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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={bookingModalSlot.breakfastBooked || bookingModalSlot.breakfastPending}
                    onClick={() => setBookingMealType('breakfast')}
                    className={`py-2.5 px-2 rounded-lg text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      bookingMealType === 'breakfast'
                        ? 'bg-[#703100] text-white border-[#703100]'
                        : bookingModalSlot.breakfastBooked || bookingModalSlot.breakfastPending
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-[#231a15] border-[#dbc1b4] hover:bg-[#fceae2]'
                    }`}
                  >
                    <span className="font-semibold">Breakfast</span>
                    <span className={`text-[11px] ${bookingMealType === 'breakfast' ? 'text-amber-200' : 'text-[#703100]'}`}>
                      ₹2,500
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={bookingModalSlot.lunchBooked || bookingModalSlot.lunchPending}
                    onClick={() => setBookingMealType('lunch')}
                    className={`py-2.5 px-2 rounded-lg text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      bookingMealType === 'lunch'
                        ? 'bg-[#703100] text-white border-[#703100]'
                        : bookingModalSlot.lunchBooked || bookingModalSlot.lunchPending
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-[#231a15] border-[#dbc1b4] hover:bg-[#fceae2]'
                    }`}
                  >
                    <span className="font-semibold">Lunch</span>
                    <span className={`text-[11px] ${bookingMealType === 'lunch' ? 'text-amber-200' : 'text-[#703100]'}`}>
                      ₹5,000
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={bookingModalSlot.breakfastBooked || bookingModalSlot.lunchBooked || bookingModalSlot.breakfastPending || bookingModalSlot.lunchPending}
                    onClick={() => setBookingMealType('both')}
                    className={`py-2.5 px-2 rounded-lg text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      bookingMealType === 'both'
                        ? 'bg-[#703100] text-white border-[#703100]'
                        : bookingModalSlot.breakfastBooked || bookingModalSlot.lunchBooked || bookingModalSlot.breakfastPending || bookingModalSlot.lunchPending
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-[#231a15] border-[#dbc1b4] hover:bg-[#fceae2]'
                    }`}
                  >
                    <span className="font-semibold">Full Day</span>
                    <span className={`text-[11px] ${bookingMealType === 'both' ? 'text-amber-200' : 'text-[#703100]'}`}>
                      ₹7,500
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
                      ? 'Breakfast & Lunch for Monastic Sangha'
                      : bookingMealType === 'breakfast'
                      ? 'Morning Breakfast for Monastic Sangha'
                      : 'Afternoon Main Lunch for Monastic Sangha'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#703100]">
                    {bookingMealType === 'both' ? '₹7,500' : bookingMealType === 'breakfast' ? '₹2,500' : '₹5,000'}
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

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setBookingModalSlot(null)}
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
