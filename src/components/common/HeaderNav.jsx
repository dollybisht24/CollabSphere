import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navItems = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'projects', label: 'Projects', path: '/projects' },
  { id: 'ai', label: 'AI Assistant', path: '/ai' },
  { id: 'english', label: 'English Learning', path: '/english' },
  { id: 'interview', label: 'Interview Practice', path: '/interview' },
  { id: 'features', label: 'Features', path: '/features' }
];

export const HeaderLogo = ({ onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 cursor-pointer select-none">
    <span className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-black text-white text-sm font-semibold">
      C
    </span>
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold tracking-tight text-black">
        CollabSphere
      </span>
      <span className="block truncate text-[11px] font-medium text-black/45">
        Developer collaboration workspace
      </span>
    </span>
  </div>
);

const HeaderNav = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine current active tab if not passed explicitly
  const currentTab = activeTab || (() => {
    if (location.pathname === '/projects' || location.pathname.startsWith('/projects/')) return 'projects';
    if (location.pathname === '/ai') return 'ai';
    if (location.pathname === '/english') return 'english';
    if (location.pathname === '/interview') return 'interview';
    if (location.pathname === '/features') return 'features';
    return 'home';
  })();

  const handleNavClick = (item) => {
    setMobileOpen(false);
    if (onTabChange) {
      onTabChange(item.id);
    } else {
      navigate(item.path);
    }
  };

  const handleLogoClick = () => {
    if (onTabChange) {
      onTabChange('home');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <HeaderLogo onClick={handleLogoClick} />

        {/* Desktop Central Navigation Pill Bar */}
        <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 text-sm font-medium text-black/55 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-black/60 hover:text-black'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="headerNavPill"
                    className="absolute inset-0 rounded-full bg-black shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Header Controls */}
        <div className="hidden items-center gap-3 sm:flex">
          {!user ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-full px-4 py-2 text-sm font-medium text-black/60 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
              >
                Start your journey <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-black">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-white text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </span>
                <span className="max-w-[120px] truncate">{user.name || 'User'}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full p-2 text-black/50 hover:bg-neutral-100 hover:text-red-600 transition"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-white/70 sm:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-black/10 bg-white px-4 py-4 sm:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  currentTab === item.id
                    ? 'bg-black text-white font-semibold'
                    : 'bg-neutral-50 text-black/80 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="mt-2 pt-2 border-t border-black/10 grid gap-2">
              {!user ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); navigate('/login'); }}
                    className="rounded-xl bg-neutral-100 px-4 py-3 text-left text-sm font-medium text-black"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); navigate('/signup'); }}
                    className="rounded-xl bg-black px-4 py-3 text-left text-sm font-semibold text-white"
                  >
                    Start your journey
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-white text-xs font-semibold">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </span>
                    <span className="text-xs font-bold text-black">{user.name || 'User'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderNav;
