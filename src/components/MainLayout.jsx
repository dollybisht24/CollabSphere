import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Calendar as CalendarIcon,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Settings,
  User,
  HelpCircle,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle2,
      title: 'Course Completed!',
      message: 'You completed React Advanced Patterns',
      time: '5 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      icon: AlertCircle,
      title: 'Assignment Due Soon',
      message: 'UI/UX Design project due in 2 hours',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      icon: TrendingUp,
      title: 'New Achievement!',
      message: 'You earned "7-Day Streak" badge',
      time: '2 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'info',
      icon: Zap,
      title: 'Study Reminder',
      message: 'Time for your daily Data Science lesson',
      time: '3 hours ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Task Schedule' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="hidden lg:flex lg:flex-col w-72 bg-white shadow-elevation-2 fixed h-screen z-30"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-elevation-1">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EduPro</h1>
              <p className="text-xs text-gray-500">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary/5 text-primary font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full ring-2 ring-primary/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-white rounded-xl shadow-elevation-2 flex items-center justify-center"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden flex flex-col w-72 bg-white shadow-elevation-2 fixed h-screen z-50"
            >
              {/* Mobile sidebar content (same as desktop) */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">EduPro</h1>
                    <p className="text-xs text-gray-500">Learning Platform</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-primary/5 text-primary font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-xl ml-12 lg:ml-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses, tasks, or notes..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-purple-50">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          <p className="text-sm text-gray-500">{unreadCount} unread messages</p>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notif) => {
                            const Icon = notif.icon;
                            const colorMap = {
                              success: 'text-green-600 bg-green-50',
                              warning: 'text-yellow-600 bg-yellow-50',
                              info: 'text-blue-600 bg-blue-50'
                            };
                            return (
                              <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 ${notif.unread ? 'bg-primary/5' : ''}`}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[notif.type]}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                                    <p className="text-sm text-gray-600 truncate">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        <div className="p-3 bg-gray-50 text-center">
                          <button className="text-sm text-primary hover:text-primary-dark font-semibold">
                            View All Notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-2 transition-colors duration-200"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-9 h-9 rounded-lg ring-2 ring-primary/20"
                    />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-4 bg-gradient-to-br from-primary/5 to-purple-50">
                          <div className="flex items-center gap-3">
                            <img
                              src={user?.avatar}
                              alt={user?.name}
                              className="w-12 h-12 rounded-xl ring-2 ring-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">My Profile</span>
                          </Link>
                          <Link
                            to="/achievements"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Award className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Achievements</span>
                            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">8</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Settings className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Settings</span>
                          </Link>
                          <button 
                            onClick={() => {
                              setShowProfileMenu(false);
                              alert('Help & Support: Contact us at support@edupro.com or visit our documentation at https://docs.edupro.com');
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                          >
                            <HelpCircle className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Help & Support</span>
                          </button>
                        </div>

                        <div className="p-2 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              logout();
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors w-full text-left text-red-600"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-semibold">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
