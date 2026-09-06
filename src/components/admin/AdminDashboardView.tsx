import React, { useState } from 'react';
import { 
  LayoutGrid, 
  UserCheck, 
  Layers, 
  UtensilsCrossed, 
  HeartHandshake, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle, 
  ArrowUpRight, 
  Check, 
  Clock, 
  Calendar as CalendarIcon, 
  TrendingUp,
  LogOut,
  ChevronRight,
  Filter,
  Plus,
  MoreVertical,
  Download,
  ExternalLink,
  Shield,
  Compass,
  Users,
  Box,
  HelpCircle as HelpIcon,
  X
} from 'lucide-react';
import { INITIAL_DANA_SCHEDULES, SanghaDanaDaySchedule } from '../../data/adminDanaData';
import { SanghaDanaManagementView } from './SanghaDanaManagementView';
import { CourseRegistrationManagementView } from './CourseRegistrationManagementView';
import { CourseBatchesManagementView } from './CourseBatchesManagementView';
import { MahabodhiLogo } from '../MahabodhiLogo';
import { AdminUserProfile, AdminRegistrationRecord, Course } from '../../types';
import { fetchAdminRegistrations, fetchCourses } from '../../services/api';

interface AdminDashboardViewProps {
  onLogout: () => void;
  onReturnToSite: () => void;
  adminProfile?: AdminUserProfile | null;
}

type AdminTab = 'overview' | 'registrations' | 'batches' | 'dana' | 'donations' | 'settings';

interface RegistrationRecord {
  id: string;
  name: string;
  course: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Waitlisted' | 'Completed';
  email: string;
  phone: string;
  gender: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onLogout,
  onReturnToSite,
  adminProfile,
}) => {
  const validTabs: AdminTab[] = ['overview', 'registrations', 'batches', 'dana', 'donations', 'settings'];

  const getInitialTab = (): AdminTab => {
    // 1. Check URL query params: ?tab=dana or ?tab=registrations
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab')?.toLowerCase();
    if (tabParam && validTabs.includes(tabParam as AdminTab)) {
      return tabParam as AdminTab;
    }

    // 2. Check hash query params: e.g. #dashboard?tab=dana or #tab=dana
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (rawHash) {
      if (rawHash.includes('tab=')) {
        const queryStr = rawHash.includes('?') ? rawHash.split('?')[1] : rawHash;
        const hashParams = new URLSearchParams(queryStr);
        const hashTab = hashParams.get('tab')?.toLowerCase();
        if (hashTab && validTabs.includes(hashTab as AdminTab)) {
          return hashTab as AdminTab;
        }
      }

      // Check if hash matches a tab directly: e.g. #dana or #registrations or dashboard/dana
      const parts = rawHash.split('/');
      const lastPart = parts[parts.length - 1].split('?')[0];
      if (validTabs.includes(lastPart as AdminTab)) {
        return lastPart as AdminTab;
      }
    }

    // 3. Check localStorage (persistent across browser refresh)
    const savedTab = localStorage.getItem('admin_active_tab')?.toLowerCase();
    if (savedTab && validTabs.includes(savedTab as AdminTab)) {
      return savedTab as AdminTab;
    }

    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialTab);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    localStorage.setItem('admin_active_tab', tab);
    try {
      if (window.location.pathname.includes('dashboard')) {
        const url = new URL(window.location.href);
        if (tab === 'overview') {
          url.searchParams.delete('tab');
        } else {
          url.searchParams.set('tab', tab);
        }
        url.hash = '';
        window.history.replaceState(null, '', url.toString());
      } else {
        const targetHash = tab === 'overview' ? '#dashboard' : `#dashboard?tab=${tab}`;
        window.history.replaceState(null, '', `/${targetHash}`);
      }
    } catch (_) {}
  };

  // Sync tab on browser back/forward and hash/popstate changes
  React.useEffect(() => {
    const handleLocationChange = () => {
      const currentTab = getInitialTab();
      setActiveTab(currentTab);
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [totalRegistrationsCount, setTotalRegistrationsCount] = useState<number>(7);

  // Dana Schedules State
  const [danaSchedules, setDanaSchedules] = useState<SanghaDanaDaySchedule[]>(INITIAL_DANA_SCHEDULES);
  
  // New Booking Modal State
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [newBookingDate, setNewBookingDate] = useState('2026-10-25');
  const [newBookingMealType, setNewBookingMealType] = useState<'Breakfast' | 'Lunch'>('Breakfast');
  const [newBookingSponsor, setNewBookingSponsor] = useState('');
  const [newBookingPhone, setNewBookingPhone] = useState('');
  const [newBookingEmail, setNewBookingEmail] = useState('');
  const [newBookingDedication, setNewBookingDedication] = useState('');
  const [newBookingAttendees, setNewBookingAttendees] = useState(4);

  const handleUpdateDanaSchedule = (updatedSchedule: SanghaDanaDaySchedule) => {
    setDanaSchedules(prev => 
      prev.map(item => item.id === updatedSchedule.id ? updatedSchedule : item)
    );
  };

  const handleCreateNewBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(newBookingDate + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const scheduleId = `dana-${newBookingDate}`;

    const existingIndex = danaSchedules.findIndex(s => s.rawDate === newBookingDate);
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newSlot = {
      mealType: newBookingMealType,
      time: newBookingMealType === 'Breakfast' ? '07:00 AM - 08:30 AM' : '11:00 AM - 12:30 PM',
      isAllocated: true,
      status: 'Confirmed' as const,
      sponsorName: newBookingSponsor || 'Anonymous Sponsor',
      contactPhone: newBookingPhone || '+94 77 123 4567',
      email: newBookingEmail || 'donor@dhamma.org',
      dedication: newBookingDedication || 'Merits dedicated to peace and monastic wellbeing.',
      bookedOn: now,
      attendeesCount: newBookingAttendees,
    };

    if (existingIndex >= 0) {
      const existing = danaSchedules[existingIndex];
      const isBreakfast = newBookingMealType === 'Breakfast';
      const updatedSlot = isBreakfast ? { breakfast: newSlot } : { lunch: newSlot };
      const otherIsAllocated = isBreakfast ? existing.lunch.isAllocated : existing.breakfast.isAllocated;
      const updatedStatus = otherIsAllocated ? 'Allocated' as const : 'Partially Allocated' as const;

      const updated: SanghaDanaDaySchedule = {
        ...existing,
        ...updatedSlot,
        status: updatedStatus,
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            action: `${newBookingMealType} Booking Added for ${newBookingSponsor}`,
            actor: 'Admin User',
            timestamp: now,
          },
          ...existing.auditTrail,
        ]
      };

      setDanaSchedules(prev => prev.map((s, idx) => idx === existingIndex ? updated : s));
    } else {
      const newSchedule: SanghaDanaDaySchedule = {
        id: scheduleId,
        dateStr,
        dayOfWeek,
        rawDate: newBookingDate,
        status: 'Partially Allocated',
        breakfast: newBookingMealType === 'Breakfast' ? newSlot : {
          mealType: 'Breakfast',
          time: '07:00 AM - 08:30 AM',
          isAllocated: false,
          status: 'Available',
        },
        lunch: newBookingMealType === 'Lunch' ? newSlot : {
          mealType: 'Lunch',
          time: '11:00 AM - 12:30 PM',
          isAllocated: false,
          status: 'Available',
        },
        adminNotes: [],
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            action: `New Day Schedule Created with ${newBookingMealType} for ${newBookingSponsor}`,
            actor: 'Admin User',
            timestamp: now,
          }
        ]
      };

      setDanaSchedules(prev => [newSchedule, ...prev]);
    }

    setShowNewBookingModal(false);
    handleTabChange('dana');
    // Reset form
    setNewBookingSponsor('');
    setNewBookingPhone('');
    setNewBookingEmail('');
    setNewBookingDedication('');
  };

  // Live Data State for Overview Dashboard
  const [liveRegistrations, setLiveRegistrations] = useState<AdminRegistrationRecord[]>([]);
  const [liveCourses, setLiveCourses] = useState<Course[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState<boolean>(true);

  const loadOverviewData = async () => {
    setIsOverviewLoading(true);
    try {
      const [regs, crs] = await Promise.all([
        fetchAdminRegistrations(),
        fetchCourses(),
      ]);
      setLiveRegistrations(regs);
      setLiveCourses(crs);
      setTotalRegistrationsCount(regs.length);
    } catch (err) {
      console.warn('[Admin Dashboard] Live data fetch error:', err);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  React.useEffect(() => {
    loadOverviewData();
  }, []);

  // Filtered registrations for overview display
  const filteredRegistrations = React.useMemo(() => {
    return liveRegistrations.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        r.applicantName.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.passCode.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || r.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [liveRegistrations, searchQuery, filterStatus]);

  const confirmedRegistrationsCount = React.useMemo(() => {
    return liveRegistrations.filter(r => r.status === 'confirmed').length;
  }, [liveRegistrations]);

  const upcomingBatchesCount = React.useMemo(() => {
    return liveCourses.filter(c => c.status === 'open' || c.status === 'upcoming').length;
  }, [liveCourses]);

  return (
    <div className="min-h-screen bg-[#faf5f0] text-[#231a15] flex flex-col md:flex-row font-sans selection:bg-[#ffdbc9] selection:text-[#703100]">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#ebdcd2] border-r border-[#dbc1b4]/60 flex flex-col justify-between shrink-0 p-5 md:min-h-screen">
        <div className="space-y-6">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3 px-1">
            <MahabodhiLogo className="w-10 h-10 shrink-0 drop-shadow-xs" />
            <div>
              <h2 className="font-serif text-base font-bold text-[#231a15] tracking-tight leading-none">
                Mahabodhi Admin
              </h2>
              <span className="text-[10px] text-[#705d53] font-medium">
                Vihara Stewardship
              </span>
            </div>
          </div>

          {/* New Booking Primary Action Button */}
          <button
            id="admin-btn-new-booking"
            onClick={() => setShowNewBookingModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#8c3c0b] hover:bg-[#722f07] active:bg-[#5a2404] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Booking</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-sm">
            <button
              id="admin-nav-overview"
              onClick={() => handleTabChange('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#f6eee8] text-[#703100] font-semibold shadow-xs'
                  : 'text-[#554339] hover:bg-[#e4d3c7] hover:text-[#703100]'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-[#8c3c0b]" />
              <span>Dashboard</span>
            </button>

            <button
              id="admin-nav-dana"
              onClick={() => handleTabChange('dana')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-medium transition-all ${
                activeTab === 'dana'
                  ? 'bg-[#f6eee8] text-[#703100] font-semibold shadow-xs'
                  : 'text-[#554339] hover:bg-[#e4d3c7] hover:text-[#703100]'
              }`}
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-4 h-4 text-[#8c3c0b]" />
                <span>Meal Bookings</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
            </button>

            <button
              id="admin-nav-registrations"
              onClick={() => handleTabChange('registrations')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-medium transition-all ${
                activeTab === 'registrations'
                  ? 'bg-[#f6eee8] text-[#703100] font-semibold shadow-xs'
                  : 'text-[#554339] hover:bg-[#e4d3c7] hover:text-[#703100]'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-[#8c3c0b]" />
                <span>Registrations</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#dfcdc1] text-[#703100] font-bold">
                {totalRegistrationsCount}
              </span>
            </button>

            <button
              id="admin-nav-batches"
              onClick={() => handleTabChange('batches')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium transition-all ${
                activeTab === 'batches'
                  ? 'bg-[#f6eee8] text-[#703100] font-semibold shadow-xs'
                  : 'text-[#554339] hover:bg-[#e4d3c7] hover:text-[#703100]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#8c3c0b]" />
              <span>Course Batches</span>
            </button>

            <button
              id="admin-nav-donations"
              onClick={() => handleTabChange('donations')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium transition-all ${
                activeTab === 'donations'
                  ? 'bg-[#f6eee8] text-[#703100] font-semibold shadow-xs'
                  : 'text-[#554339] hover:bg-[#e4d3c7] hover:text-[#703100]'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-[#8c3c0b]" />
              <span>Donors & Ledger</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions: Settings & Exit */}
        <div className="pt-6 border-t border-[#dbc1b4]/60 space-y-1.5 text-sm">
          <button
            id="admin-nav-settings"
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-left font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-[#f6eee8] text-[#703100] font-semibold'
                : 'text-[#554339] hover:bg-[#e4d3c7]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={onReturnToSite}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-left text-xs font-medium text-[#705d53] hover:text-[#703100] hover:bg-[#e4d3c7] transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>View Sanctuary Site</span>
          </button>

          {adminProfile && (
            <div className="p-2.5 rounded-xl bg-[#f4ebe3] border border-[#dbc1b4]/60 text-xs">
              <div className="font-semibold text-[#231a15] truncate">
                {adminProfile.full_name || 'Administrator'}
              </div>
              <div className="text-[11px] text-[#705d53] truncate">
                {adminProfile.email}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#dfcdc1] text-[#703100] uppercase tracking-wider">
                  {adminProfile.role}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" title="Active Session" />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('admin_active_tab');
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-left text-xs font-medium text-red-700 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#faf5f0] border-b border-[#dbc1b4]/40 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-[#887367] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donors or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f4ebe3] border border-[#dccbc0]/60 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-[#231a15] placeholder:text-[#99867c] focus:outline-none focus:border-[#8c3c0b] focus:bg-white transition-all"
            />
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-full hover:bg-[#ebdcd2] flex items-center justify-center text-[#554339] transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8c3c0b]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#dbc1b4] p-4 text-xs space-y-3 z-30 animate-fade-in">
                  <div className="flex items-center justify-between font-bold text-[#231a15] border-b pb-2">
                    <span>Notifications</span>
                    <span className="text-[10px] text-[#8c3c0b] font-normal">2 new</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-[#fff8f5] border border-[#f0e0d6]">
                      <p className="font-medium text-[#703100]">New Dana Offering</p>
                      <p className="text-[11px] text-[#554339]">Oct 28 Breakfast booked by Verma family.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#fff8f5] border border-[#f0e0d6]">
                      <p className="font-medium text-[#703100]">Registration Request</p>
                      <p className="text-[11px] text-[#554339]">Devendra Sharma submitted 10-day application.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help / Docs */}
            <button
              onClick={() => alert('Vihara Stewardship Manual: Accessible for authenticated senior monastics and authorized center managers.')}
              className="w-9 h-9 rounded-full hover:bg-[#ebdcd2] flex items-center justify-center text-[#554339] transition-colors"
              aria-label="Help Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Admin Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#dbc1b4]/60">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                alt="Monastic Administrator"
                className="w-8 h-8 rounded-full object-cover border border-[#8c3c0b]/40 shadow-xs"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-6 sm:p-8 space-y-7 max-w-7xl">
          {/* Breadcrumb & Main Heading (Only when not in Dana, Registrations, or Batches tab, as they have their own matching header) */}
          {activeTab !== 'dana' && activeTab !== 'registrations' && activeTab !== 'batches' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#705d53]">
                <span>Admin</span>
                <span>&gt;</span>
                <span className="font-semibold text-[#8c3c0b] capitalize">{activeTab}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#231a15] font-normal tracking-tight">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'registrations' && 'Course Registrations'}
                {activeTab === 'batches' && 'Vipassana Retreat Batches'}
                {activeTab === 'donations' && 'Donations & Upkeep Ledger'}
                {activeTab === 'settings' && 'Sanctuary Settings'}
              </h1>
            </div>
          )}

          {/* OVERVIEW TAB CONTENT */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 4 Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Donations */}
                <div className="bg-white rounded-2xl p-6 border border-[#dbc1b4]/50 shadow-xs flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[#554339]">Total Donations</span>
                    <div className="w-7 h-7 rounded-lg bg-[#fff1eb] flex items-center justify-center text-[#8c3c0b]">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-3">
                    <div className="font-serif text-3xl font-normal text-[#703100] tracking-tight">
                      $24,500
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#2e7d32] font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12% this month</span>
                  </div>
                  {/* Decorative subtle wave */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-16 opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 50" fill="none" stroke="#703100" strokeWidth="6">
                      <path d="M0 30 Q25 10 50 30 T100 30" />
                    </svg>
                  </div>
                </div>

                {/* 2. Confirmed Meditators */}
                <div className="bg-white rounded-2xl p-6 border border-[#dbc1b4]/50 shadow-xs flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[#554339]">Confirmed Meditators</span>
                    <div className="w-7 h-7 rounded-lg bg-[#fff1eb] flex items-center justify-center text-[#8c3c0b]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-3">
                    <div className="font-serif text-3xl font-normal text-[#231a15] tracking-tight">
                      {isOverviewLoading ? '...' : confirmedRegistrationsCount}
                    </div>
                  </div>
                  <div className="text-xs text-[#705d53]">
                    {liveRegistrations.length} total applications received
                  </div>
                </div>

                {/* 3. Dana Days (Oct) */}
                <div className="bg-white rounded-2xl p-6 border border-[#dbc1b4]/50 shadow-xs flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[#554339]">Dana Days (Oct)</span>
                    <div className="w-7 h-7 rounded-lg bg-[#fff1eb] flex items-center justify-center text-[#8c3c0b]">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-3">
                    <div className="font-serif text-3xl font-normal text-[#231a15] tracking-tight">
                      28<span className="text-xl text-[#887367]">/31</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-[#f4ebe3] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#703100] h-full rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>

                {/* 4. Upcoming Batches */}
                <div className="bg-white rounded-2xl p-6 border border-[#dbc1b4]/50 shadow-xs flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[#554339]">Scheduled Batches</span>
                    <div className="w-7 h-7 rounded-lg bg-[#fff1eb] flex items-center justify-center text-[#8c3c0b]">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-3">
                    <div className="font-serif text-3xl font-normal text-[#231a15] tracking-tight">
                      {isOverviewLoading ? '...' : upcomingBatchesCount}
                    </div>
                  </div>
                  <div className="text-xs text-[#705d53]">
                    {liveCourses.length} retreat batches on schedule
                  </div>
                </div>
              </div>

              {/* Two Panels: Recent Registrations & Sangha Dana Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Panel (2 Columns): Recent Registrations Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs overflow-hidden">
                  <div className="p-6 pb-4 flex items-center justify-between border-b border-[#f3e7df]">
                    <h2 className="font-serif text-xl text-[#231a15] font-semibold">
                      Recent Registrations
                    </h2>
                    <button
                      onClick={() => handleTabChange('registrations')}
                      className="text-xs font-bold text-[#8c3c0b] hover:text-[#703100] flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-[#f3e7df] text-[#705d53] font-medium text-xs">
                          <th className="py-3 px-6">Name</th>
                          <th className="py-3 px-4">Course</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f3e7df]">
                        {filteredRegistrations.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-[#887367] text-xs">
                              {isOverviewLoading ? 'Loading registrations from database...' : 'No registrations found.'}
                            </td>
                          </tr>
                        ) : (
                          filteredRegistrations.slice(0, 5).map((reg, index) => {
                            const isWarmRow = index % 2 === 1;
                            const statusStr = reg.status.toLowerCase();
                            return (
                              <tr 
                                key={reg.id} 
                                className={`transition-colors hover:bg-[#fbf4ee] ${
                                  isWarmRow ? 'bg-[#fff9f5]' : 'bg-white'
                                }`}
                              >
                                <td className="py-4 px-6 font-medium text-[#231a15]">
                                  {reg.applicantName}
                                </td>
                                <td className="py-4 px-4 text-[#554339]">
                                  {reg.courseTitle}
                                </td>
                                <td className="py-4 px-4 text-[#705d53] whitespace-nowrap">
                                  {reg.date}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                      statusStr === 'confirmed'
                                        ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]'
                                        : statusStr === 'pending'
                                        ? 'bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2]'
                                        : statusStr === 'waitlisted'
                                        ? 'bg-[#fbe9e7] text-[#d84315] border border-[#ffccbc]'
                                        : 'bg-[#ede7f6] text-[#5e35b1] border border-[#d1c4e9]'
                                    }`}
                                  >
                                    {reg.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Panel (1 Column): Sangha Dana Calendar */}
                <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-semibold text-[#231a15]">
                      Sangha Dana Status
                    </h2>
                    <CalendarIcon className="w-5 h-5 text-[#8c3c0b]" />
                  </div>

                  {/* Calendar Widget */}
                  <div className="space-y-4">
                    <div className="text-center font-semibold text-sm text-[#231a15]">
                      October 2026
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#705d53] font-medium">
                      <div>S</div>
                      <div>M</div>
                      <div>T</div>
                      <div>W</div>
                      <div>T</div>
                      <div>F</div>
                      <div>S</div>
                    </div>

                    {/* October 2026 grid (Starts on Thursday Oct 1) */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {/* Week 1 */}
                      <div className="py-2 text-[#554339]">1</div>
                      <div className="py-2 text-[#554339]">2</div>
                      <div className="py-2 text-[#554339]">3</div>
                      <div className="py-2 text-[#554339]">4</div>
                      <div className="py-2 text-[#554339] relative flex flex-col items-center">
                        <span>5</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] mt-0.5" />
                      </div>
                      <div className="py-2 text-[#554339] relative flex flex-col items-center">
                        <span>6</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] mt-0.5" />
                      </div>
                      <div className="py-2 bg-[#fff1eb] rounded-lg border border-[#dbc1b4]/60 text-[#703100] font-semibold relative flex flex-col items-center">
                        <span>7</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-0.5" />
                      </div>

                      {/* Week 2 */}
                      <div className="py-2 text-[#554339]">8</div>
                      <div className="py-2 text-[#554339]">9</div>
                      <div className="py-2 text-[#554339]">10</div>
                      <div className="py-2 text-[#554339] relative flex flex-col items-center">
                        <span>11</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] mt-0.5" />
                      </div>
                      <div className="py-2 text-[#554339]">12</div>
                      <div className="py-2 text-[#554339]">13</div>
                      <div className="py-2 text-[#554339]">14</div>

                      {/* Week 3 */}
                      <div className="py-2 bg-[#fff1eb] rounded-lg border border-[#dbc1b4]/60 text-[#703100] font-semibold relative flex flex-col items-center">
                        <span>15</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#703100] mt-0.5" />
                      </div>
                      <div className="py-2 text-[#554339]">16</div>
                      <div className="py-2 text-[#554339]">17</div>
                      <div className="py-2 text-[#554339]">18</div>
                      <div className="py-2 text-[#554339] relative flex flex-col items-center">
                        <span>19</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-0.5" />
                      </div>
                      <div className="py-2 text-[#554339]">20</div>
                      <div className="py-2 text-[#554339]">21</div>

                      {/* Week 4 */}
                      <div className="py-2 text-[#554339]">22</div>
                      <div className="py-2 text-[#554339]">23</div>
                      <div className="py-2 text-[#554339]">24</div>
                      <div className="py-2 text-[#554339]">25</div>
                      <div className="py-2 text-[#554339]">26</div>
                      <div className="py-2 text-[#554339]">27</div>
                      <div className="py-2 text-[#554339]">28</div>

                      {/* Week 5 */}
                      <div className="py-2 text-[#554339]">29</div>
                      <div className="py-2 text-[#554339]">30</div>
                      <div className="py-2 text-[#554339]">31</div>
                      <div className="py-2 text-[#d8c8bd] opacity-40">1</div>
                      <div className="py-2 text-[#d8c8bd] opacity-40">2</div>
                      <div className="py-2 text-[#d8c8bd] opacity-40">3</div>
                      <div className="py-2 text-[#d8c8bd] opacity-40">4</div>
                    </div>
                  </div>

                  {/* Calendar Legend */}
                  <div className="pt-4 border-t border-[#f3e7df] flex items-center justify-between text-xs text-[#705d53]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32]" />
                      <span>Allocated</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-[#887367] bg-white" />
                      <span>Open</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REGISTRATIONS TAB CONTENT */}
          {activeTab === 'registrations' && (
            <CourseRegistrationManagementView onTotalCountChange={setTotalRegistrationsCount} />
          )}

          {/* COURSE BATCHES TAB */}
          {activeTab === 'batches' && (
            <CourseBatchesManagementView />
          )}

          {/* SANGHA DANA / MEAL BOOKINGS TAB */}
          {activeTab === 'dana' && (
            <SanghaDanaManagementView
              schedules={danaSchedules}
              onUpdateSchedule={handleUpdateDanaSchedule}
              onAddNewBooking={() => setShowNewBookingModal(true)}
            />
          )}

          {/* DONATIONS LEDGER TAB */}
          {activeTab === 'donations' && (
            <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl text-[#231a15]">Voluntary Dana & Upkeep Ledger</h3>
                  <p className="text-xs text-[#705d53]">All offerings are tax exempt under Section 80G</p>
                </div>
                <button 
                  onClick={() => alert('Exporting 80G receipts.')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f4ebe3] text-[#703100] text-xs font-semibold hover:bg-[#e4d3c7]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export 80G Ledger</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#fff1eb] border border-[#dbc1b4]/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#887367]">Fiscal Year Dana Total</div>
                  <div className="font-serif text-3xl font-bold text-[#703100]">$24,500.00</div>
                </div>
                <div className="text-right text-xs text-[#554339]">
                  <div>84 benevolent donors</div>
                  <div className="text-[#2e7d32] font-semibold">100% applied to kuti maintenance & Sangha care</div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-[#dbc1b4]/50 shadow-xs p-6 space-y-6">
              <h3 className="font-serif text-xl text-[#231a15]">Monastery Stewardship Configuration</h3>
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#fff8f5] border border-[#f0e4dc] space-y-2">
                  <span className="font-semibold text-[#703100]">Monastic Admin Email</span>
                  <input
                    type="text"
                    defaultValue="monk@vihara.org"
                    className="w-full p-2.5 rounded-lg border border-[#dccbc0] bg-white text-xs text-[#231a15]"
                  />
                </div>
                <div className="p-4 rounded-xl bg-[#fff8f5] border border-[#f0e4dc] space-y-2">
                  <span className="font-semibold text-[#703100]">WhatsApp Alert Dispatch Number</span>
                  <input
                    type="text"
                    defaultValue="+91 94231 00000"
                    className="w-full p-2.5 rounded-lg border border-[#dccbc0] bg-white text-xs text-[#231a15]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* NEW BOOKING MODAL */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#dbc1b4] shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#f3e7df] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f8ece4] flex items-center justify-center text-[#8c3c0b]">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#231a15]">
                    New Sangha Dana Offering
                  </h3>
                  <p className="text-xs text-[#705d53]">Allocate meal sponsor on the vihara calendar</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewBookingModal(false)}
                className="text-[#887367] hover:text-[#231a15] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Offering Date *</label>
                  <input
                    type="date"
                    required
                    value={newBookingDate}
                    onChange={(e) => setNewBookingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Meal Slot *</label>
                  <select
                    value={newBookingMealType}
                    onChange={(e) => setNewBookingMealType(e.target.value as 'Breakfast' | 'Lunch')}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  >
                    <option value="Breakfast">Breakfast (07:00 - 08:30 AM)</option>
                    <option value="Lunch">Lunch (11:00 AM - 12:30 PM)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Sponsor / Family / Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upasika Silva Family or Dhammapala Circle"
                  value={newBookingSponsor}
                  onChange={(e) => setNewBookingSponsor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 891 4321"
                    value={newBookingPhone}
                    onChange={(e) => setNewBookingPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#3b2e27]">Expected Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newBookingAttendees}
                    onChange={(e) => setNewBookingAttendees(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Email Address</label>
                <input
                  type="email"
                  placeholder="donor@example.org"
                  value={newBookingEmail}
                  onChange={(e) => setNewBookingEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#3b2e27]">Dedication / Intentional Blessings</label>
                <textarea
                  rows={2}
                  placeholder="In loving memory of... / For health and prosperity of family..."
                  value={newBookingDedication}
                  onChange={(e) => setNewBookingDedication(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#dccbc0] bg-[#fdfaf8] text-xs text-[#231a15] focus:outline-none focus:border-[#8c3c0b] focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f3e7df]">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="px-4 py-2 rounded-xl text-[#705d53] hover:bg-[#f4ebe3] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8c3c0b] hover:bg-[#722f07] active:bg-[#5a2404] text-white font-semibold shadow-xs"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
