import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  FilterX, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  MinusCircle, 
  CalendarDays, 
  Plus, 
  ArrowRight,
  UtensilsCrossed,
  Clock,
  Bell,
  Sparkles
} from 'lucide-react';
import { SanghaDanaDaySchedule } from '../../data/adminDanaData';
import { SanghaDanaDetailView } from './SanghaDanaDetailView';

interface SanghaDanaManagementViewProps {
  schedules: SanghaDanaDaySchedule[];
  onUpdateSchedule: (updated: SanghaDanaDaySchedule) => void;
  onAddNewBooking: () => void;
}

export const SanghaDanaManagementView: React.FC<SanghaDanaManagementViewProps> = ({
  schedules,
  onUpdateSchedule,
  onAddNewBooking,
}) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Filters state
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sponsorSearch, setSponsorSearch] = useState<string>('');

  // Reset filters
  const handleResetFilters = () => {
    setDateRangeFilter('all');
    setMealTypeFilter('all');
    setStatusFilter('all');
    setSponsorSearch('');
  };

  // Filter schedules
  const filteredSchedules = schedules.filter((sch) => {
    // Status filter
    if (statusFilter !== 'all' && sch.status !== statusFilter) {
      return false;
    }

    // Meal type filter
    if (mealTypeFilter === 'breakfast' && !sch.breakfast.isAllocated) {
      return false;
    }
    if (mealTypeFilter === 'lunch' && !sch.lunch.isAllocated) {
      return false;
    }

    // Sponsor search filter
    if (sponsorSearch.trim()) {
      const q = sponsorSearch.toLowerCase();
      const bSponsor = sch.breakfast.sponsorName?.toLowerCase() || '';
      const lSponsor = sch.lunch.sponsorName?.toLowerCase() || '';
      const dateText = `${sch.dateStr} ${sch.dayOfWeek}`.toLowerCase();
      if (!bSponsor.includes(q) && !lSponsor.includes(q) && !dateText.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // If a date is selected, show the SanghaDanaDetailView
  const currentSelectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  if (currentSelectedSchedule) {
    return (
      <SanghaDanaDetailView
        schedule={currentSelectedSchedule}
        onBack={() => setSelectedScheduleId(null)}
        onUpdateSchedule={(updated) => {
          onUpdateSchedule(updated);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#231a15] tracking-tight">
            Sangha Schedule
          </h1>
          <p className="text-xs sm:text-sm text-[#705d53] mt-1 max-w-2xl">
            Manage daily Dana offerings, track sponsor allocations, and ensure all meal requirements for the monastic community are met.
          </p>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/60 shadow-xs p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* 1. Date Range */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-bold text-[#554339] uppercase tracking-wider">
              Date Range
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#887367]">
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs bg-[#fbf5f1] border border-[#dccbc0] rounded-xl text-[#231a15] font-medium outline-none focus:border-[#8c3c0b] focus:bg-white transition-all cursor-pointer"
              >
                <option value="all">This Month (October)</option>
                <option value="next-month">Next Month (November)</option>
                <option value="september">September 2026</option>
                <option value="all-dates">All Recorded Dates</option>
              </select>
            </div>
          </div>

          {/* 2. Meal Type */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-bold text-[#554339] uppercase tracking-wider">
              Meal Type
            </label>
            <select
              value={mealTypeFilter}
              onChange={(e) => setMealTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#fbf5f1] border border-[#dccbc0] rounded-xl text-[#231a15] font-medium outline-none focus:border-[#8c3c0b] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast Dana</option>
              <option value="lunch">Lunch Dana</option>
            </select>
          </div>

          {/* 3. Status */}
          <div className="lg:col-span-3 space-y-1.5">
            <label className="block text-[11px] font-bold text-[#554339] uppercase tracking-wider">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#fbf5f1] border border-[#dccbc0] rounded-xl text-[#231a15] font-medium outline-none focus:border-[#8c3c0b] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Allocated">Allocated</option>
              <option value="Partially Allocated">Partially Allocated</option>
              <option value="Open">Open</option>
            </select>
          </div>

          {/* 4. Search Sponsor & Clear Button */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <div className="flex-1 space-y-1.5">
              <label className="block text-[11px] font-bold text-[#554339] uppercase tracking-wider">
                Search Sponsor
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#887367]">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Name or Organization..."
                  value={sponsorSearch}
                  onChange={(e) => setSponsorSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#fbf5f1] border border-[#dccbc0] rounded-xl text-[#231a15] placeholder:text-[#a6958b] outline-none focus:border-[#8c3c0b] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Clear Filter Button */}
            <div className="pt-5">
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                className="w-9 h-9 rounded-xl bg-[#f4ebe3] hover:bg-[#ebdcd2] border border-[#dccbc0] flex items-center justify-center text-[#705d53] hover:text-[#703100] transition-colors cursor-pointer"
              >
                <FilterX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sangha Schedule Table Card */}
      <div className="bg-white rounded-2xl border border-[#dbc1b4]/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#f3e7df] text-[#705d53] font-semibold text-xs bg-[#faf5f0]">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-5">Breakfast Sponsor</th>
                <th className="py-3.5 px-5">Lunch Sponsor</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3e7df]">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((sch, index) => {
                  return (
                    <tr 
                      key={sch.id}
                      className="hover:bg-[#fcf7f3] transition-colors group cursor-pointer"
                      onClick={() => setSelectedScheduleId(sch.id)}
                    >
                      {/* Date & Day */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#231a15]">
                          {sch.dateStr}
                        </div>
                        <div className="text-xs text-[#705d53] font-normal">
                          {sch.dayOfWeek}
                        </div>
                      </td>

                      {/* Breakfast Sponsor */}
                      <td className="py-4 px-5 text-[#231a15]">
                        {sch.breakfast.isAllocated ? (
                          <div className="font-medium text-[#231a15]">
                            {sch.breakfast.sponsorName}
                          </div>
                        ) : (
                          <span className="text-[#a6958b] text-base">—</span>
                        )}
                      </td>

                      {/* Lunch Sponsor */}
                      <td className="py-4 px-5 text-[#231a15]">
                        {sch.lunch.isAllocated ? (
                          <div className="font-medium text-[#231a15]">
                            {sch.lunch.sponsorName}
                          </div>
                        ) : (
                          <span className="text-[#a6958b] text-base">—</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5">
                        {sch.status === 'Allocated' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Allocated</span>
                          </span>
                        )}
                        {sch.status === 'Partially Allocated' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff3e0] text-[#b35c1e] border border-[#ffe0b2]">
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span>Partially Allocated</span>
                          </span>
                        )}
                        {sch.status === 'Open' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f5efe9] text-[#705d53] border border-[#dccbc0]">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScheduleId(sch.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8c3c0b] hover:text-[#703100] group-hover:underline transition-all"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-[#887367]">
                    No Sangha Dana entries match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 sm:px-6 bg-[#faf5f0] border-t border-[#f3e7df] flex items-center justify-between text-xs text-[#705d53]">
          <div>
            Showing 1 to {filteredSchedules.length} of {schedules.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="w-7 h-7 rounded-lg border border-[#dbc1b4]/60 flex items-center justify-center text-[#887367] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled
              className="w-7 h-7 rounded-lg border border-[#dbc1b4]/60 flex items-center justify-center text-[#887367] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
