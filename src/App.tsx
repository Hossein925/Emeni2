import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';

// Public Views
import { HomeMetroGrid } from './components/HomeMetroGrid';
import { PublicEducationView } from './components/PublicEducationView';
import { PublicSafetyAnnouncementsView } from './components/PublicSafetyAnnouncementsView';
import { PublicResolutionsView } from './components/PublicResolutionsView';
import { PublicScenariosView } from './components/PublicScenariosView';
import { PublicErrorReportView } from './components/PublicErrorReportView';
import { PublicQuizView } from './components/PublicQuizView';

// Dashboards
import { DeptManagerDashboard } from './components/DeptManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';

// Admin Sub-Views
import { DeptManagersAdmin } from './components/DeptManagersAdmin';
import { SafetyIndicatorsAdmin } from './components/SafetyIndicatorsAdmin';
import { StaffEvaluationAdmin } from './components/StaffEvaluationAdmin';
import { SafetyMeetingsAdmin } from './components/SafetyMeetingsAdmin';
import { ChecklistsAdmin } from './components/ChecklistsAdmin';
import { ErrorReportsAdmin } from './components/ErrorReportsAdmin';
import { EducationAdmin } from './components/EducationAdmin';
import { SafetyVisitsAdmin } from './components/SafetyVisitsAdmin';
import { TickerAdmin } from './components/TickerAdmin';

import { scrollToTopAndResetZoom } from './utils/scrollUtils';

export type CurrentView =
  | 'home'
  | 'public_education'
  | 'public_safety_announcements'
  | 'public_resolutions'
  | 'public_scenarios'
  | 'public_error_report'
  | 'public_quizzes'
  | 'dept_dashboard'
  | 'admin_dashboard'
  | 'admin_dept_managers'
  | 'admin_indicators'
  | 'admin_evaluations'
  | 'admin_meetings'
  | 'admin_checklists'
  | 'admin_error_reports'
  | 'admin_education'
  | 'admin_visits'
  | 'admin_ticker';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('app_current_user_v3');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [originalAdminUser, setOriginalAdminUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('app_orig_admin_v3');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<CurrentView>(() => {
    try {
      const saved = localStorage.getItem('app_current_view_v3');
      if (saved) return saved as CurrentView;
    } catch {}
    return 'home';
  });

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Persist current user state
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('app_current_user_v3', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('app_current_user_v3');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Persist original admin user state
  useEffect(() => {
    try {
      if (originalAdminUser) {
        localStorage.setItem('app_orig_admin_v3', JSON.stringify(originalAdminUser));
      } else {
        localStorage.removeItem('app_orig_admin_v3');
      }
    } catch (e) {
      console.error(e);
    }
  }, [originalAdminUser]);

  // Persist current view state
  useEffect(() => {
    try {
      localStorage.setItem('app_current_view_v3', currentView);
    } catch (e) {
      console.error(e);
    }
  }, [currentView]);

  // Scroll to top automatically & reset zoom state when switching views
  useEffect(() => {
    scrollToTopAndResetZoom();
  }, [currentView]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setOriginalAdminUser(null);
    if (user.role === 'super_admin') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('dept_dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOriginalAdminUser(null);
    setCurrentView('home');
  };

  const handleReturnToAdminPanel = () => {
    if (originalAdminUser) {
      setCurrentUser(originalAdminUser);
      setOriginalAdminUser(null);
      setCurrentView('admin_dept_managers');
    }
  };

  const handleSelectAdminSection = (
    section:
      | 'dept_managers'
      | 'indicators'
      | 'evaluations'
      | 'meetings'
      | 'checklists'
      | 'error_reports'
      | 'education'
      | 'visits'
      | 'ticker'
  ) => {
    setCurrentView(`admin_${section}` as CurrentView);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/80 to-blue-100 text-slate-900 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-slate-950" dir="rtl">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onLogout={handleLogout}
        onGoHome={() => setCurrentView('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'home' && (
          <HomeMetroGrid
            currentUser={currentUser}
            onSelectTile={(tile) => {
              if (tile === 'education') setCurrentView('public_education');
              if (tile === 'announcements') setCurrentView('public_safety_announcements');
              if (tile === 'resolutions') setCurrentView('public_resolutions');
              if (tile === 'scenarios') setCurrentView('public_scenarios');
              if (tile === 'error_report') setCurrentView('public_error_report');
              if (tile === 'quizzes') setCurrentView('public_quizzes');
            }}
            onEditTicker={() => {
              if (currentUser?.role === 'super_admin') {
                setCurrentView('admin_ticker');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        )}

        {/* Public Views */}
        {currentView === 'public_education' && (
          <PublicEducationView onBack={() => setCurrentView('home')} />
        )}
        {currentView === 'public_safety_announcements' && (
          <PublicSafetyAnnouncementsView
            onBack={() => setCurrentView('home')}
            onSelectOption={(option) => {
              if (option === 'resolutions') setCurrentView('public_resolutions');
              if (option === 'scenarios') setCurrentView('public_scenarios');
            }}
          />
        )}
        {currentView === 'public_resolutions' && (
          <PublicResolutionsView onBack={() => setCurrentView('public_safety_announcements')} />
        )}
        {currentView === 'public_scenarios' && (
          <PublicScenariosView onBack={() => setCurrentView('public_safety_announcements')} />
        )}
        {currentView === 'public_error_report' && (
          <PublicErrorReportView onBack={() => setCurrentView('home')} />
        )}
        {currentView === 'public_quizzes' && (
          <PublicQuizView onBack={() => setCurrentView('home')} />
        )}

        {/* Department Manager Panel */}
        {currentView === 'dept_dashboard' && currentUser && (
          <DeptManagerDashboard
            user={currentUser}
            currentUser={currentUser}
            onLogout={handleLogout}
            onReturnToAdminPanel={originalAdminUser ? handleReturnToAdminPanel : undefined}
          />
        )}

        {/* Super Admin Dashboard */}
        {currentView === 'admin_dashboard' && currentUser && (
          <AdminDashboard
            currentUser={currentUser}
            onSelectAdminSection={handleSelectAdminSection}
          />
        )}

        {/* Super Admin Sub-Sections */}
        {currentView === 'admin_dept_managers' && (
          <DeptManagersAdmin
            onBack={() => setCurrentView('admin_dashboard')}
            onEnterDeptPanel={(deptUser) => {
              setOriginalAdminUser(currentUser);
              setCurrentUser(deptUser);
              setCurrentView('dept_dashboard');
            }}
          />
        )}
        {currentView === 'admin_indicators' && (
          <SafetyIndicatorsAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
        {currentView === 'admin_evaluations' && (
          <StaffEvaluationAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
        {currentView === 'admin_meetings' && (
          <SafetyMeetingsAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
        {currentView === 'admin_checklists' && (
          <ChecklistsAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
        {currentView === 'admin_error_reports' && (
          <ErrorReportsAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
        {currentView === 'admin_education' && (
          <EducationAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
        {currentView === 'admin_visits' && (
          <SafetyVisitsAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
        {currentView === 'admin_ticker' && (
          <TickerAdmin onBack={() => setCurrentView('admin_dashboard')} />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleLoginSuccess}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
