import React, { useState, useEffect } from 'react';
import { Language, ScreenType, Course, RegistrationFormData, DhammaTalk } from './types';
import { INITIAL_COURSES, DHAMMA_TALKS_LIST } from './data/monasteryData';
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
    // Support legacy /dashboard pathname as well
    if (window.location.pathname.includes('dashboard')) return 'dashboard';
    const hash = window.location.hash.replace('#', '').trim();
    return (HASH_TO_SCREEN[hash] as ScreenType) || 'home';
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(getScreenFromLocation);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTalk, setActiveTalk] = useState<DhammaTalk | null>(null);

  // ── Sync state → URL whenever currentScreen changes ─────────────────────
  useEffect(() => {
    const hash = SCREEN_TO_HASH[currentScreen];
    try {
      if (currentScreen === 'dashboard' || currentScreen === 'admin-login') {
        // keep the legacy pathname behaviour for admin
        window.history.pushState(null, '', `/${currentScreen === 'dashboard' ? 'dashboard' : '#admin-login'}`);
      } else {
        window.history.pushState(null, '', hash ? `#${hash}` : '/');
      }
    } catch (_) { /* sandboxed iframe fallback */ }
  }, [currentScreen]);

  // ── Sync URL → state on browser back / forward ──────────────────────────
  useEffect(() => {
    const onPop = () => {
      const screen = getScreenFromLocation();
      // Guard admin-only screens
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

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentScreen('admin-login');
  };

  const handleSelectCourseForRegistration = (course: Course) => {
    setSelectedCourse(course);
    setCurrentScreen('register');
  };

  const handleRegistrationSuccess = (data: RegistrationFormData) => {
    // Optionally update course available seats
    if (data.courseId) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === data.courseId
            ? { ...c, availableSeats: Math.max(0, c.availableSeats - 1) }
            : c
        )
      );
    }
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
    return (
      <AdminDashboardView
        onLogout={handleAdminLogout}
        onReturnToSite={() => handleNavigate('home')}
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
