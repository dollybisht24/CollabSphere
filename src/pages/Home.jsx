import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Menu, X, KeyRound, Sparkles, User, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HomeLandingView from '../components/home/HomeLandingView';
import HomeProjectsView from '../components/home/HomeProjectsView';
import HomeAIView from '../components/home/HomeAIView';
import HomeFeaturesView from '../components/home/HomeFeaturesView';
import HomeInterviewView from '../components/home/HomeInterviewView';
import HeaderNav from '../components/common/HeaderNav';
import EnglishLearning from './EnglishLearning';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'ai', label: 'AI Assistant' },
  { id: 'english', label: 'English Learning' },
  { id: 'interview', label: 'Interview Practice' },
  { id: 'features', label: 'Features' }
];

const Logo = ({ dark = false, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 cursor-pointer select-none">
    <span className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-semibold ${dark ? 'border-white/15 bg-white text-black' : 'border-black/10 bg-black text-white'}`}>C</span>
    <span className="min-w-0">
      <span className={`block truncate text-sm font-semibold tracking-tight ${dark ? 'text-white' : 'text-black'}`}>CollabSphere</span>
      <span className={`block truncate text-[11px] font-medium ${dark ? 'text-white/45' : 'text-black/45'}`}>Developer collaboration workspace</span>
    </span>
  </div>
);

const Home = ({ defaultTab = 'home' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine active tab from URL query param, path, or defaultTab prop
  const getInitialTab = () => {
    const qTab = searchParams.get('tab');
    if (qTab && navItems.some(item => item.id === qTab)) return qTab;
    if (location.pathname === '/projects') return 'projects';
    if (location.pathname === '/ai') return 'ai';
    if (location.pathname === '/english') return 'english';
    if (location.pathname === '/interview') return 'interview';
    if (location.pathname === '/features') return 'features';
    return defaultTab || 'home';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync tab when prop or path changes
  useEffect(() => {
    const current = getInitialTab();
    if (current !== activeTab) {
      setActiveTab(current);
    }
  }, [location.pathname, defaultTab, searchParams]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setMobileOpen(false);
    const targetPath = tabId === 'home' ? '/' : `/${tabId}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthAction = () => {
    if (user) {
      switchTab('projects');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen scroll-smooth bg-white text-black flex flex-col justify-between" style={{ fontFamily: 'Inter, Geist, Manrope, "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Sticky Header with unified Pill Navigation */}
      <HeaderNav activeTab={activeTab} onTabChange={switchTab} />

      {/* Main Content Area: Renders the active tab in Home's clean style */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeLandingView key="home-landing" onNavigate={switchTab} />
          )}
          {activeTab === 'projects' && (
            <HomeProjectsView key="home-projects" onNavigate={switchTab} />
          )}
          {activeTab === 'ai' && (
            <HomeAIView key="home-ai" onNavigate={switchTab} />
          )}
          {activeTab === 'english' && (
            <EnglishLearning key="home-english" />
          )}
          {activeTab === 'interview' && (
            <HomeInterviewView key="home-interview" onNavigate={switchTab} />
          )}
          {activeTab === 'features' && (
            <HomeFeaturesView key="home-features" onNavigate={switchTab} />
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Minimalist Footer */}
      <footer className="bg-black text-white border-t border-black/10 mt-20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo dark onClick={() => switchTab('home')} />
              <p className="mt-6 max-w-xs text-sm leading-6 text-white/45">
                Developer collaboration workspace for projects, files, documentation, activity, and AI assistance.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/35">Product</p>
              <div className="mt-5 space-y-3 text-sm text-white/50">
                <button onClick={() => switchTab('projects')} className="block hover:text-white transition">Projects</button>
                <button onClick={() => switchTab('ai')} className="block hover:text-white transition">AI Assistant</button>
                <button onClick={() => switchTab('interview')} className="block hover:text-white transition">Interview Practice</button>
                <button onClick={() => switchTab('features')} className="block hover:text-white transition">Features</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/35">Workspaces</p>
              <div className="mt-5 space-y-3 text-sm text-white/50">
                <button onClick={() => switchTab('projects')} className="block hover:text-white transition">Repositories & Files</button>
                <button onClick={() => switchTab('features')} className="block hover:text-white transition">Team Permissions</button>
                <button onClick={() => switchTab('ai')} className="block hover:text-white transition">Contextual AI</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/35">Get Started</p>
              <div className="mt-5 space-y-3 text-sm text-white/50">
                {!user ? (
                  <>
                    <button onClick={() => navigate('/signup')} className="block hover:text-white transition">Sign Up Free</button>
                    <button onClick={() => navigate('/login')} className="block hover:text-white transition">Account Login</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => switchTab('projects')} className="block hover:text-white transition">My Workspaces</button>
                    <button onClick={() => navigate('/app/settings')} className="block hover:text-white transition">Settings</button>
                  </>
                )}
                <span className="block text-white/25">GitHub Integration</span>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} CollabSphere. All rights reserved.</span>
            <span className="inline-flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Private project spaces for modern developer teams
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
