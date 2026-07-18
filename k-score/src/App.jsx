import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeProvider';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence, motion } from 'framer-motion';
import React, { lazy, Suspense } from 'react';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Dilemmas = lazy(() => import('./pages/Dilemmas'));
const Lessons = lazy(() => import('./pages/Lessons'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Affirmations = lazy(() => import('./pages/Affirmations'));
const Social = lazy(() => import('./pages/Social'));
const Journey = lazy(() => import('./pages/Journey'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const AdminExport = lazy(() => import('./pages/AdminExport'));
const Progress = lazy(() => import('./pages/Progress'));

const { Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? "Home";

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.22, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <LayoutWrapper currentPageName={mainPageKey}>
              <PageTransition><Home /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Home" element={
            <LayoutWrapper currentPageName="Home">
              <PageTransition><Home /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Dilemmas" element={
            <LayoutWrapper currentPageName="Dilemmas">
              <PageTransition><Dilemmas /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Lessons" element={
            <LayoutWrapper currentPageName="Lessons">
              <PageTransition><Lessons /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Challenges" element={
            <LayoutWrapper currentPageName="Challenges">
              <PageTransition><Challenges /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Affirmations" element={
            <LayoutWrapper currentPageName="Affirmations">
              <PageTransition><Affirmations /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Social" element={
            <LayoutWrapper currentPageName="Social">
              <PageTransition><Social /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Journey" element={
            <LayoutWrapper currentPageName="Journey">
              <PageTransition><Journey /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/Progress" element={
            <LayoutWrapper currentPageName="Progress">
              <PageTransition><Progress /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/AccountSettings" element={
            <LayoutWrapper currentPageName="AccountSettings">
              <PageTransition><AccountSettings /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="/AdminExport" element={
            <LayoutWrapper currentPageName="AdminExport">
              <PageTransition><AdminExport /></PageTransition>
            </LayoutWrapper>
          } />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App