import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Edit3, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  Sliders, 
  Info,
  CalendarDays
} from 'lucide-react';
import { 
  DanaDatePricing, 
  DanaBaselinePricing, 
  getBaselinePricing, 
  saveBaselinePricing, 
  getAllCustomPricingOverrides, 
  getDanaPricingForDate, 
  saveDanaPricingForDate, 
  deleteDanaPricingOverride,
  DANA_PRICING_UPDATED_EVENT 
} from '../../services/danaPricingService';

export const DanaAmountManagementView: React.FC = () => {
  const [baseline, setBaseline] = useState<DanaBaselinePricing>(getBaselinePricing);
  const [overrides, setOverrides] = useState<Record<string, DanaDatePricing>>(getAllCustomPricingOverrides);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10'); // YYYY-MM or 'all'
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'default'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Unified Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formDateStr, setFormDateStr] = useState<string>(''); // empty string = full month default
  const [formBreakfast, setFormBreakfast] = useState<number>(2500);
  const [formLunch, setFormLunch] = useState<number>(5000);
  const [formGilanpachhaya, setFormGilanpachhaya] = useState<number>(1500);
  const [formNote, setFormNote] = useState<string>('');

  // Sync state on events
  const refreshData = () => {
    setBaseline(getBaselinePricing());
    setOverrides(getAllCustomPricingOverrides());
  };

  useEffect(() => {
    window.addEventListener(DANA_PRICING_UPDATED_EVENT, refreshData);
    return () => {
      window.removeEventListener(DANA_PRICING_UPDATED_EVENT, refreshData);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Build dates list based on month filter
  const tableDates = useMemo(() => {
    const list: DanaDatePricing[] = [];

    if (selectedMonth === 'all') {
      const customDates = Object.values(overrides);
      customDates.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
      return customDates;
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      list.push(getDanaPricingForDate(dateStr));
    }

    return list;
  }, [selectedMonth, overrides, baseline]);

  // Apply search and custom/default filter
  const filteredTableDates = useMemo(() => {
    return tableDates.filter((item) => {
      if (filterType === 'custom' && !item.isCustom) return false;
      if (filterType === 'default' && item.isCustom) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const dateMatch = item.dateStr.toLowerCase().includes(q) || item.dateDisplay.toLowerCase().includes(q);
        const dayMatch = item.dayOfWeek?.toLowerCase().includes(q);
        const noteMatch = item.note?.toLowerCase().includes(q);
        if (!dateMatch && !dayMatch && !noteMatch) return false;
      }

      return true;
    });
  }, [tableDates, filterType, searchQuery]);

  // Open modal: either for full-month baseline or specific date
  const handleOpenModal = (targetDateStr?: string, item?: DanaDatePricing) => {
    if (item) {
      setFormDateStr(item.dateStr);
      setFormBreakfast(item.breakfast);
      setFormLunch(item.lunch);
      setFormGilanpachhaya(item.gilanpachhaya);
      setFormNote(item.note || '');
    } else if (targetDateStr) {
      const p = getDanaPricingForDate(targetDateStr);
      setFormDateStr(targetDateStr);
      setFormBreakfast(p.breakfast);
      setFormLunch(p.lunch);
      setFormGilanpachhaya(p.gilanpachhaya);
      setFormNote(p.note || '');
    } else {
      // Empty date = Default baseline for full month
      setFormDateStr('');
      setFormBreakfast(baseline.breakfast);
      setFormLunch(baseline.lunch);
      setFormGilanpachhaya(baseline.gilanpachhaya);
      setFormNote('');
    }
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const bf = Math.max(0, Number(formBreakfast) || 0);
    const lu = Math.max(0, Number(formLunch) || 0);
    const gi = Math.max(0, Number(formGilanpachhaya) || 0);

    if (formDateStr.trim()) {
      // Date provided -> Custom rates for that specific date
      saveDanaPricingForDate({
        dateStr: formDateStr.trim(),
        breakfast: bf,
        lunch: lu,
        gilanpachhaya: gi,
        note: formNote.trim() || undefined,
      });
      showToast(`Dana offering amounts updated for ${formDateStr.trim()}!`);
    } else {
      // Date NOT provided -> Updates default baseline for all days across the month
      saveBaselinePricing({
        breakfast: bf,
        lunch: lu,
        gilanpachhaya: gi,
      });
      showToast('Default baseline Dana rates updated for the full month!');
    }

    setIsModalOpen(false);
    refreshData();
  };

  // Reset a date's pricing back to baseline
  const handleResetDatePricing = (dateStr: string) => {
    deleteDanaPricingOverride(dateStr);
    refreshData();
    showToast(`Amounts for ${dateStr} reset to default baseline rates.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Description */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#231a15] tracking-tight">
          Dana Pricing & Amount Management
        </h1>
        <p className="text-xs sm:text-sm text-[#705d53] mt-1 max-w-2xl">
          Configure meal offering contributions for Breakfast, Lunch, and Gilanpachhaya. Leave date empty to set default monthly rates, or choose a specific date when outside monks or meditators visit.
        </p>
      </div>

      {/* Global Baseline Rates Overview Card */}
      <div className="bg-[#fff8f5] border border-[#dbc1b4]/70 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#dbc1b4]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fceae2] flex items-center justify-center text-[#703100]">
              <Sliders className="w-5 h-5 text-[#b35c1e]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#231a15]">Default Baseline Offering Rates</h3>
              <p className="text-[11px] text-[#705d53]">Applies to every day across the month unless a specific date override is set.</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#fdfbf7] text-[#703100] border border-[#dbc1b4] rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#b35c1e]" />
            <span>Edit Baseline Rates</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-white rounded-xl p-3 border border-[#dbc1b4]/40 text-center">
            <span className="text-[10px] font-bold text-[#887367] uppercase tracking-wider block">Breakfast</span>
            <span className="text-base sm:text-lg font-bold text-[#703100] mt-0.5 block">
              ₹{baseline.breakfast.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#dbc1b4]/40 text-center">
            <span className="text-[10px] font-bold text-[#887367] uppercase tracking-wider block">Lunch</span>
            <span className="text-base sm:text-lg font-bold text-[#703100] mt-0.5 block">
              ₹{baseline.lunch.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#dbc1b4]/40 text-center">
            <span className="text-[10px] font-bold text-[#887367] uppercase tracking-wider block">Gilanpachhaya</span>
            <span className="text-base sm:text-lg font-bold text-[#703100] mt-0.5 block">
              ₹{baseline.gilanpachhaya.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-[#fff1eb] rounded-xl p-3 border border-[#dbc1b4]/70 text-center">
            <span className="text-[10px] font-bold text-[#b35c1e] uppercase tracking-wider block">Full Day Total</span>
            <span className="text-base sm:text-lg font-bold text-[#703100] mt-0.5 block">
              ₹{baseline.fullDay.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/60 shadow-xs p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* 1. Month Filter */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-bold text-[#554339] uppercase tracking-wider">
              Select Month
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#887367]">
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs bg-[#fbf5f1] border border-[#dccbc0] rounded-xl text-[#231a15] font-medium outline-none focus:border-[#8c3c0b] focus:bg-white transition-all cursor-pointer"
              >
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-12">December 2026</option>
                <option value="all">All Dates with Custom Overrides</option>
              </select>
            </div>
          </div>

          {/* 2. Rate Type Filter */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-bold text-[#554339] uppercase tracking-wider">
              Rate Filter
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-[#fbf5f1] border border-[#dccbc0] rounded-xl text-[#231a15] font-medium outline-none focus:border-[#8c3c0b] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="custom">Custom Overrides Only</option>
              <option value="default">Default Baseline Rates Only</option>
            </select>
          </div>

          {/* 3. Search */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-bold text-[#554339] uppercase tracking-wider">
              Search Date or Note
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#887367]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="e.g., 2026-10-15 or Pavarana"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#fbf5f1] border border-[#dccbc0] rounded-xl text-[#231a15] outline-none focus:border-[#8c3c0b] focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Data Table */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/60 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#dbc1b4]/40 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#231a15]">
              Configured Rates ({filteredTableDates.length} Dates)
            </h3>
            <p className="text-xs text-[#705d53]">
              Amounts presented to devotees on the website for Sangha Dana booking.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#fff1eb]/60 text-[#703100] font-semibold uppercase tracking-wider text-[11px] border-b border-[#dbc1b4]/60">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Rate Status</th>
                <th className="py-3 px-4">Breakfast</th>
                <th className="py-3 px-4">Lunch</th>
                <th className="py-3 px-4">Gilanpachhaya</th>
                <th className="py-3 px-4 font-bold text-[#703100]">Full Day</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b4]/30 text-[#231a15]">
              {filteredTableDates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#887367]">
                    No dates match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredTableDates.map((item) => (
                  <tr 
                    key={item.dateStr}
                    className={`hover:bg-[#fff8f5]/60 transition-colors ${item.isCustom ? 'bg-[#fffbf7]' : ''}`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#231a15]">{item.dateDisplay}</div>
                      <div className="text-[11px] text-[#887367] flex items-center gap-1.5">
                        <span>{item.dayOfWeek}</span>
                        {item.note && (
                          <>
                            <span>•</span>
                            <span className="text-[#b35c1e] font-medium">{item.note}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.isCustom ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          <Sparkles className="w-3 h-3 text-[#b35c1e]" />
                          Custom Override
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Default Baseline
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-[#231a15]">
                      ₹{item.breakfast.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-[#231a15]">
                      ₹{item.lunch.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-[#231a15]">
                      ₹{item.gilanpachhaya.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#703100]">
                      ₹{item.fullDay.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(item.dateStr, item)}
                          className="p-1.5 text-[#703100] hover:bg-[#fceae2] rounded-lg transition-colors cursor-pointer"
                          title="Edit Amount for this Date"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {item.isCustom && (
                          <button
                            onClick={() => handleResetDatePricing(item.dateStr)}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset to Default Baseline"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Rate Editing Modal with Optional Date */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f5] border border-[#dbc1b4] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#554339] hover:text-[#703100] rounded-full hover:bg-[#f7e5dc] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-[#703100] mb-1 font-normal">
              {formDateStr ? 'Update Date Dana Rates' : 'Edit Default Baseline Rates'}
            </h3>
            <p className="text-xs text-[#554339] mb-5 leading-relaxed">
              {formDateStr
                ? 'Setting custom rates for this specific date (e.g. visiting outside monks or meditators).'
                : 'These rates apply automatically to all dates without custom overrides.'}
            </p>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Optional Date Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339]">
                    Specific Date (Optional)
                  </label>
                  {formDateStr ? (
                    <button
                      type="button"
                      onClick={() => setFormDateStr('')}
                      className="text-[11px] text-[#b35c1e] hover:underline cursor-pointer font-medium"
                    >
                      Clear (Apply to Full Month)
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#887367]">Leave blank for full month</span>
                  )}
                </div>
                <input
                  type="date"
                  value={formDateStr}
                  onChange={(e) => setFormDateStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#dbc1b4] rounded-xl outline-none focus:border-[#703100] transition-colors"
                />
                <div className="mt-1 text-[11px] leading-relaxed">
                  {formDateStr ? (
                    <span className="text-[#b35c1e] font-medium inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      Custom pricing for date: <strong>{formDateStr}</strong>
                    </span>
                  ) : (
                    <span className="text-[#887367]">
                      💡 No date provided: applies as default baseline for every day in the month.
                    </span>
                  )}
                </div>
              </div>

              {/* Breakfast Amount */}
              <div>
                <label className="block text-xs font-semibold text-[#554339] mb-1">
                  {formDateStr ? 'Breakfast Amount (₹)' : 'Default Breakfast Amount (₹)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  value={formBreakfast}
                  onChange={(e) => setFormBreakfast(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#dbc1b4] rounded-xl font-mono text-[#703100] font-semibold outline-none focus:border-[#703100]"
                />
              </div>

              {/* Lunch Amount */}
              <div>
                <label className="block text-xs font-semibold text-[#554339] mb-1">
                  {formDateStr ? 'Lunch Amount (₹)' : 'Default Lunch Amount (₹)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  value={formLunch}
                  onChange={(e) => setFormLunch(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#dbc1b4] rounded-xl font-mono text-[#703100] font-semibold outline-none focus:border-[#703100]"
                />
              </div>

              {/* Gilanpachhaya Amount */}
              <div>
                <label className="block text-xs font-semibold text-[#554339] mb-1">
                  {formDateStr ? 'Gilanpachhaya Amount (₹)' : 'Default Gilanpachhaya Amount (₹)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  value={formGilanpachhaya}
                  onChange={(e) => setFormGilanpachhaya(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#dbc1b4] rounded-xl font-mono text-[#703100] font-semibold outline-none focus:border-[#703100]"
                />
              </div>

              {/* Live Full Day Auto-Sum */}
              <div className="bg-[#fff1eb] border border-[#dbc1b4]/80 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#703100] block">
                    {formDateStr ? 'Calculated Full Day Amount' : 'Calculated Full Day Baseline'}
                  </span>
                  <span className="text-[11px] text-[#887367]">
                    Sum of all 3 meals
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-[#703100]">
                  ₹{(formBreakfast + formLunch + formGilanpachhaya).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Optional Occasion Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#554339] mb-1">
                  Reason / Occasion Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder={formDateStr ? "e.g., Visiting outside monks & meditators group" : "e.g., Monthly standard rate revision"}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#dbc1b4] rounded-xl outline-none focus:border-[#703100]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#dbc1b4] text-xs font-semibold uppercase tracking-wider text-[#554339] hover:bg-[#fceae2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#b35c1e] hover:bg-[#944403] text-white text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  {formDateStr ? 'Save For This Date' : 'Save Baseline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2d4739] text-white px-5 py-3 rounded-xl shadow-xl border border-white/20 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-emerald-300" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
