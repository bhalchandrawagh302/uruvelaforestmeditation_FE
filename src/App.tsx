import React, { useState, useEffect, useCallback } from 'react';
import { Language, ScreenType, Course, RegistrationFormData, DhammaTalk, AdminUserProfile } from './types';
import { DHAMMA_TALKS_LIST } from './data/monasteryData';
import { fetchCourses, fetchAdminProfile, logoutAdmin } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { NavigationDrawer } from './components/NavigationDrawer';
import { HomeView } from './components/HomeView';
import { CoursesView } from './components/CoursesView';
import { RegistrationView } from './components/RegistrationView';
import { SanghaDanaView } from './components/SanghaDanaView';
import { AboutView } from './components/AboutView';
import { DhammaTalksView } from './components/DhammaTalksView';
import { LibraryView } from './components/LibraryView';
import { SupportView } from './components/SupportView';
import { VisitUsView } from './components/VisitUsView';
import { ZenAudioPlayer } from './components/ZenAudioPlayer';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';

export function App() {
  // ── Hash-based routing helpers ───────────────────────────────────────────
  const SCREEN_TO_HASH: Record<ScreenType, string> = {
    home:        '',
    courses:     'courses',
    register:    'register',
    dana:        'dana',
    about:       'about',
    talks:       'talks',
    library:     'library',
    support:     'support',
    visit:       'visit',
    dashboard:   'dashboard',
    'admin-login': 'admin-login',
  };

  const HASH_TO_SCREEN: Record<string, ScreenType> = Object.fromEntries(
    Object.entries(SCREEN_TO_HASH).map(([k, v]) => [v, k as ScreenType])
  );

  const getScreenFromLocation = (): ScreenType => {
    // 1. Pathname matches dashboard
    if (window.location.pathname.includes('dashboard')) return 'dashboard';

    // 2. Hash routing: check hash
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (!rawHash) return 'home';

    // Matches dashboard, dashboard?tab=..., or admin-login
    if (rawHash.startsWith('dashboard') || rawHash.startsWith('admin/')) return 'dashboard';
    if (rawHash === 'admin-login') return 'admin-login';

    const baseHash = rawHash.split('?')[0].split('/')[0];
    return (HASH_TO_SCREEN[baseHash] as ScreenType) || 'home';
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(getScreenFromLocation);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<AdminUserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTalk, setActiveTalk] = useState<DhammaTalk | null>(null);

  // ── Verify session on mount ──────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        const profile = await fetchAdminProfile();
        if (isMounted) {
          if (profile && profile.is_active) {
            setAdminProfile(profile);
            setIsAdminLoggedIn(true);
          } else {
            setAdminProfile(null);
            setIsAdminLoggedIn(false);
            if (window.location.pathname.includes('dashboard') || window.location.hash.includes('dashboard')) {
              setCurrentScreen('admin-login');
            }
          }
        }
      } catch {
        if (isMounted) {
          setAdminProfile(null);
          setIsAdminLoggedIn(false);
          if (window.location.pathname.includes('dashboard') || window.location.hash.includes('dashboard')) {
            setCurrentScreen('admin-login');
          }
        }
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── API: Load courses ────────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (err) {
      setCoursesError(err instanceof Error ? err.message : 'Failed to load courses.');
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // ── Sync state → URL whenever currentScreen changes ─────────────────────
  useEffect(() => {
    const hash = SCREEN_TO_HASH[currentScreen];
    try {
      if (currentScreen === 'dashboard') {
        const isDashboardPath = window.location.pathname.includes('dashboard');
        if (isDashboardPath) {
          // Preserve existing query params (?tab=...) and hash if already on /dashboard
          const target = `/dashboard${window.location.search || ''}${window.location.hash || ''}`;
          if (window.location.pathname !== '/dashboard') {
            window.history.pushState(null, '', target);
          }
        } else {
          // Hash-based routing: retain any ?tab= parameter or restore saved tab
          const currentHash = window.location.hash;
          if (!currentHash.includes('dashboard')) {
            const savedTab = localStorage.getItem('admin_active_tab');
            const targetHash = savedTab && savedTab !== 'overview'
              ? `#dashboard?tab=${savedTab}`
              : '#dashboard';
            window.history.pushState(null, '', `/${targetHash}`);
          }
        }
      } else if (currentScreen === 'admin-login') {
        window.history.pushState(null, '', '/#admin-login');
      } else {
        window.history.pushState(null, '', hash ? `#${hash}` : '/');
      }
    } catch (_) { /* sandboxed iframe fallback */ }
  }, [currentScreen]);

  // ── Sync URL → state on browser back / forward ──────────────────────────
  useEffect(() => {
    const onPop = () => {
      const screen = getScreenFromLocation();
      if (screen === 'dashboard' && !isAdminLoggedIn) {
        setCurrentScreen('admin-login');
      } else {
        setCurrentScreen(screen);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [isAdminLoggedIn]);

  // Scroll to top whenever the screen changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen]);

  // ── Navigation handler ───────────────────────────────────────────────────
  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'dashboard') {
      setCurrentScreen(isAdminLoggedIn ? 'dashboard' : 'admin-login');
    } else {
      setCurrentScreen(screen);
    }
    setIsDrawerOpen(false);
  };

  const handleLoginSuccess = async () => {
    try {
      const profile = await fetchAdminProfile();
      setAdminProfile(profile);
    } catch {}
    setIsAdminLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleAdminLogout = async () => {
    localStorage.removeItem('admin_active_tab');
    await logoutAdmin();
    setAdminProfile(null);
    setIsAdminLoggedIn(false);
    setCurrentScreen('admin-login');
  };

  const handleSelectCourseForRegistration = (course: Course) => {
    setSelectedCourse(course);
    setCurrentScreen('register');
  };

  // Re-fetch from backend so seat counts are always real after a registration
  const handleRegistrationSuccess = (_data: RegistrationFormData) => {
    loadCourses();
  };

  const handlePlayTalk = (talk: DhammaTalk) => {
    setActiveTalk(talk);
  };

  // Dedicated Admin Screen Renderers
  if (currentScreen === 'admin-login') {
    return (
      <AdminLoginView
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => handleNavigate('home')}
      />
    );
  }

  if (currentScreen === 'dashboard') {
    // Show calm loading screen while verifying session
    if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-[#ede3db] flex flex-col items-center justify-center p-6 select-none">
          <div className="flex flex-col items-center gap-3 animate-fade-in text-center">
            <div className="w-10 h-10 rounded-full border-3 border-[#8c3c0b]/20 border-t-[#8c3c0b] animate-spin" />
            <p className="font-serif text-sm text-[#705d53]">Verifying Vihara Stewardship Session...</p>
          </div>
        </div>
      );
    }

    // Redirect to login if unauthenticated
    if (!isAdminLoggedIn) {
      return (
        <AdminLoginView
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => handleNavigate('home')}
        />
      );
    }

    return (
      <AdminDashboardView
        onLogout={handleAdminLogout}
        onReturnToSite={() => handleNavigate('home')}
        adminProfile={adminProfile}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f5] text-[#231a15] font-sans transition-colors duration-300 selection:bg-[#ffdbc9] selection:text-[#703100]">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={setLanguage}
        onToggleMenu={() => setIsDrawerOpen(true)}
      />

      {/* Slide Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeView
            language={language}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'courses' && (
          <CoursesView
            courses={courses}
            language={language}
            onNavigate={handleNavigate}
            onSelectCourseForRegistration={handleSelectCourseForRegistration}
            isLoading={coursesLoading}
            error={coursesError}
            onRetry={loadCourses}
          />
        )}

        {currentScreen === 'register' && (
          <RegistrationView
            language={language}
            selectedCourse={selectedCourse}
            onBackToCourses={() => setCurrentScreen('courses')}
            onSubmitSuccess={handleRegistrationSuccess}
          />
        )}

        {currentScreen === 'dana' && (
          <SanghaDanaView language={language} />
        )}

        {currentScreen === 'about' && (
          <AboutView
            language={language}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'talks' && (
          <DhammaTalksView
            language={language}
            onPlayTalk={handlePlayTalk}
            activeTalkId={activeTalk?.id}
          />
        )}

        {currentScreen === 'library' && (
          <LibraryView language={language} />
        )}

        {currentScreen === 'support' && (
          <SupportView
            language={language}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'visit' && (
          <VisitUsView
            language={language}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Bottom Zen Audio Player */}
      <ZenAudioPlayer
        currentTalk={activeTalk}
        onClose={() => setActiveTalk(null)}
      />

      {/* Global Footer */}
      <Footer
        language={language}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;
