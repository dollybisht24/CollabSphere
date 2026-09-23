import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Mic,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
  Volume2,
  X,
  AlertCircle,
  ArrowRight,
  Download,
  ShieldCheck,
  Star,
  Briefcase,
  Check,
  Zap,
  TrendingUp,
  FileCheck,
  Tv,
  PenTool,
  MessageSquare,
  Home,
  HelpCircle,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { englishAPI } from '../utils/api';
import toast from 'react-hot-toast';
import EnglishCertificateView from '../components/english/EnglishCertificateView';
import TodayPlanSection from '../components/english/TodayPlanSection';
import CartoonVideoLearningView from '../components/english/CartoonVideoLearningView';
import DailyVocabularyView from '../components/english/DailyVocabularyView';
import WritingPracticeView from '../components/english/WritingPracticeView';
import AITutorView from '../components/english/AITutorView';
import PlacementAssessmentModal from '../components/english/PlacementAssessmentModal';
import SkillDashboardSection from '../components/english/SkillDashboardSection';
import DailyChallengeSection from '../components/english/DailyChallengeSection';
import SpeakingLabView from '../components/english/SpeakingLabView';
import ListeningLabView from '../components/english/ListeningLabView';
import ReadingLabView from '../components/english/ReadingLabView';
import GrammarLabView from '../components/english/GrammarLabView';
import FinalAssessmentModal from '../components/english/FinalAssessmentModal';
import LearningPathView from '../components/english/LearningPathView';
import PracticeQuizCenterView from '../components/english/PracticeQuizCenterView';
import CertificatePageView from '../components/english/CertificatePageView';
import AchievementsView from '../components/english/AchievementsView';

const LEARNING_GOAL_OPTIONS = [
  'Improve basic English',
  'Speak English confidently',
  'Improve daily communication',
  'Improve grammar',
  'Improve vocabulary',
  'Improve pronunciation',
  'Prepare for interviews',
  'Prepare for placements',
  'Improve professional/company communication'
];

const CONFIDENCE_LEVELS = ['Very Low', 'Low', 'Average', 'Good', 'Very Good'];
const DURATION_OPTIONS = ['10 minutes/day', '20 minutes/day', '30 minutes/day', '45+ minutes/day'];
const EDUCATION_OPTIONS = ['High School', 'Undergraduate', 'Postgraduate', 'Working Professional', 'Other'];

export const SIDEBAR_NAV_GROUPS = [
  {
    title: 'Core Learning',
    items: [
      { id: 'overview', label: 'Home Dashboard', icon: Home, badge: null },
      { id: 'path', label: 'Learning Path', icon: Zap, badge: '50 Phases' },
      { id: 'quizzes', label: 'Practice & Quizzes', icon: Target, badge: '10 Formats' },
    ]
  },
  {
    title: 'Skill Labs',
    items: [
      { id: 'speaking', label: 'Speaking Lab', icon: Mic, badge: 'Voice AI' },
      { id: 'writing', label: 'Writing Center', icon: PenTool, badge: null },
      { id: 'listening', label: 'Listening Hub', icon: Volume2, badge: null },
      { id: 'reading', label: 'Reading Library', icon: BookOpen, badge: null },
      { id: 'vocab', label: 'Vocabulary Bank', icon: Sparkles, badge: null },
      { id: 'grammar', label: 'Grammar Lab', icon: ShieldCheck, badge: null },
      { id: 'cartoons', label: 'Cartoon Library', icon: Tv, badge: 'YouTube' },
    ]
  },
  {
    title: 'AI & Challenges',
    items: [
      { id: 'tutor', label: 'AI English Tutor', icon: GraduationCap, badge: '24/7' },
      { id: 'daily_challenge', label: 'Daily Challenge', icon: Star, badge: 'Streak' },
    ]
  },
  {
    title: 'Progress & Awards',
    items: [
      { id: 'progress', label: 'My Progress', icon: TrendingUp, badge: null },
      { id: 'achievements', label: 'Achievements', icon: Trophy, badge: null },
      { id: 'certificate', label: 'My Certificate', icon: Award, badge: 'Official' },
    ]
  }
];

export default function EnglishLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'path' | 'quizzes' | 'speaking' | etc.
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [dailyPlanMetrics, setDailyPlanMetrics] = useState(null);

  // Dashboard Data State
  const [profile, setProfile] = useState(null);
  const [journey, setJourney] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showDailyQuizModal, setShowDailyQuizModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showFinalAssessmentModal, setShowFinalAssessmentModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Active items in modals
  const [activeStep, setActiveStep] = useState(null);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [celebrationData, setCelebrationData] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    age: '',
    education: 'Undergraduate',
    college: '',
    currentCourse: '',
    englishLevel: 'Beginner',
    learningGoals: ['Speak English confidently'],
    speakingConfidence: 'Average',
    preferredDuration: '20 minutes/day'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Daily Quiz State
  const [dailyQuiz, setDailyQuiz] = useState(null);
  const [dailyQuizAnswers, setDailyQuizAnswers] = useState({});
  const [dailyQuizResult, setDailyQuizResult] = useState(null);
  const [dailyQuizTimeLeft, setDailyQuizTimeLeft] = useState(120);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await englishAPI.getDashboard();
      setProfile(data.profile || null);
      setJourney(data.journey || null);
      setRecommendations(data.recommendations || []);
      setAvailableBadges(data.availableBadges || []);

      try {
        const planData = await englishAPI.getDailyPlan();
        setDailyPlan(planData.dailyPlan || null);
        setDailyPlanMetrics(planData.metrics || null);
      } catch (planErr) {
        console.warn('Could not load daily plan:', planErr);
      }

      if (data.profile) {
        setProfileForm({
          fullName: data.profile.fullName || user?.name || '',
          age: data.profile.age || '',
          education: data.profile.education || 'Undergraduate',
          college: data.profile.college || '',
          currentCourse: data.profile.currentCourse || '',
          englishLevel: data.profile.englishLevel || 'Beginner',
          learningGoals: data.profile.learningGoals?.length ? data.profile.learningGoals : ['Speak English confidently'],
          speakingConfidence: data.profile.speakingConfidence || 'Average',
          preferredDuration: data.profile.preferredDuration || '20 minutes/day'
        });

        // If candidate has not completed onboarding, trigger profile modal
        if (!data.profile.onboardingCompleted) {
          setShowProfileModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to load English dashboard:', err);
      toast.error('Unable to load English learning dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlanTask = async (taskKey) => {
    try {
      const res = await englishAPI.toggleDailyPlanTask(taskKey);
      setDailyPlan(res.dailyPlan);
      if (res.profile) setProfile(res.profile);
      if (res.earnedXp > 0) {
        confetti({ particleCount: 50, spread: 60 });
        toast.success(`Task completed! +${res.earnedXp} XP`);
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleActivityCompleted = async (taskKey) => {
    try {
      const res = await englishAPI.toggleDailyPlanTask(taskKey);
      setDailyPlan(res.dailyPlan);
      if (res.profile) setProfile(res.profile);
      loadDashboard();
    } catch (_) {}
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  // Audio pronunciation helper for vocabulary words
  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.rate = 0.85;
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  // Trigger celebratory confetti blast
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch (_) {}
  };

  // SAVE CANDIDATE PROFILE
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await englishAPI.saveProfile({
        ...profileForm,
        onboardingCompleted: true
      });
      setProfile(res.profile);
      setShowProfileModal(false);
      toast.success('Learning profile saved!');

      // If assessment score is 0, invite to determine level
      if ((res.profile.assessmentScore || 0) === 0) {
        setShowAssessmentModal(true);
      } else {
        loadDashboard();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // START DAILY ENGLISH CHALLENGE
  const handleStartDailyQuiz = async () => {
    try {
      setLoadingQuiz(true);
      setDailyQuizAnswers({});
      setDailyQuizResult(null);
      setDailyQuizTimeLeft(120);

      const quizData = await englishAPI.getDailyQuiz();
      setDailyQuiz(quizData);
      setShowDailyQuizModal(true);
    } catch (err) {
      toast.error('Failed to load daily quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Timer for Daily Quiz
  useEffect(() => {
    let timer;
    if (showDailyQuizModal && dailyQuiz && !dailyQuizResult && dailyQuizTimeLeft > 0) {
      timer = setInterval(() => {
        setDailyQuizTimeLeft((t) => t - 1);
      }, 1000);
    } else if (dailyQuizTimeLeft === 0 && showDailyQuizModal && !dailyQuizResult) {
      handleDailyQuizSubmit();
    }
    return () => clearInterval(timer);
  }, [showDailyQuizModal, dailyQuiz, dailyQuizResult, dailyQuizTimeLeft]);

  // SUBMIT DAILY QUIZ
  const handleDailyQuizSubmit = async () => {
    if (!dailyQuiz) return;
    try {
      setSubmittingQuiz(true);
      const result = await englishAPI.submitDailyQuiz(dailyQuizAnswers);
      setDailyQuizResult(result);
      setProfile(result.profile);
      triggerConfetti();
      toast.success(`Quiz Completed! +${result.earnedXp} XP earned!`);
      loadDashboard();
    } catch (err) {
      toast.error('Failed to submit quiz answers');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // COMPLETE JOURNEY STEP
  const handleCompleteStep = async (stepId) => {
    try {
      const res = await englishAPI.completeJourneyStep(stepId);
      setProfile(res.profile);
      toast.success('Step completed! +60 XP earned!');
      triggerConfetti();
      setShowStepModal(false);
      loadDashboard();
    } catch (err) {
      toast.error('Failed to mark step as completed');
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-black/60">Loading English Learning Journey...</p>
        </div>
      </div>
    );
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 leading-none">English Mastery</div>
              <div className="text-[10px] font-bold text-purple-700 tracking-wider uppercase mt-0.5">AI Learning Suite</div>
            </div>
          </div>
          {mobileSidebarOpen && (
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Level & Streak Indicator */}
        <div className="mt-4 rounded-2xl bg-neutral-50 border border-black/5 p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Level</div>
            <div className="text-xs font-black text-slate-800">{profile?.englishLevel || 'Beginner'} • Phase {profile?.currentPhase || 1}</div>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-100/60 px-2 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>{profile?.streak || 1}d</span>
          </div>
        </div>

        {/* Sidebar Nav Groups */}
        <nav className="mt-4 space-y-4">
          {SIDEBAR_NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider px-3 mb-1">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeSection === item.id ||
                    (item.id === 'path' && activeSection === 'journey') ||
                    (item.id === 'progress' && activeSection === 'skills') ||
                    (item.id === 'reading' && activeSection === 'stories');

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile Info */}
      <div className="pt-4 border-t border-black/10 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-purple-100 border border-purple-200 text-purple-800 font-black text-xs flex items-center justify-center shrink-0">
              {(profile?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {profile?.fullName || user?.name || 'Learner'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {profile?.xp || 250} XP Earned
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowProfileModal(true);
              setMobileSidebarOpen(false);
            }}
            className="text-[11px] font-bold text-purple-700 hover:underline shrink-0"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-black selection:bg-purple-500 selection:text-white flex">
      {/* 1. DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-black/10 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto p-4 z-20">
        {renderSidebarContent()}
      </aside>

      {/* 2. MOBILE DRAWER WITH BACKDROP */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 p-4 flex flex-col justify-between overflow-y-auto shadow-2xl lg:hidden"
            >
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT CANVAS */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Header Bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-black/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-purple-700">English Platform</div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[150px] sm:max-w-[250px]">
                {profile?.englishLevel || 'Beginner'} • Phase {profile?.currentPhase || 1}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{profile?.streak || 1}d</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAssessmentModal(true)}
              className="rounded-full bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1"
            >
              Test
            </button>
          </div>
        </header>

        {/* Inner Scrollable Workspace */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top SaaS Status Bar */}
          <div className="rounded-[28px] border border-black/10 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-purple-700">
                <GraduationCap className="h-3.5 w-3.5" /> AI English Mastery Suite
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {(() => {
                  const hour = new Date().getHours();
                  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
                  return `${greeting}, ${profile?.fullName || user?.name || 'Learner'}`;
                })()}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Structured 5-level journey with AI coaching, interactive exercises, and verified certification.
              </p>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-black/10 bg-neutral-50 px-3 py-1.5 text-center">
                <div className="text-[9px] uppercase font-bold text-black/40">Level</div>
                <div className="text-xs font-black text-slate-900">{profile?.englishLevel || 'Beginner'}</div>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/50 px-3 py-1.5 text-center">
                <div className="text-[9px] uppercase font-bold text-purple-600">Phase</div>
                <div className="text-xs font-black text-purple-900">Phase {profile?.currentPhase || 1}/50</div>
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50/50 px-3 py-1.5 text-center">
                <div className="text-[9px] uppercase font-bold text-orange-600">Streak</div>
                <div className="text-xs font-black text-orange-700 flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                  {profile?.streak || 1}d
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 text-white px-3 py-1.5 text-center shadow-xs">
                <div className="text-[9px] uppercase font-bold text-white/50">XP</div>
                <div className="text-xs font-black text-yellow-400 flex items-center justify-center gap-0.5">
                  <Zap className="w-3 h-3 fill-yellow-400" />
                  {profile?.xp || 250}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAssessmentModal(true)}
                className="rounded-xl border border-purple-300 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-800 hover:bg-purple-100 transition flex items-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Placement Test</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold text-black hover:border-black transition"
              >
                Profile
              </button>
            </div>
          </div>

          {/* DYNAMIC VIEW ROUTER */}
          {/* VIEW 1: HOME DASHBOARD */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-purple-300">
                    <Sparkles className="w-3.5 h-3.5" /> 50 Structured Phases • 5 CEFR Levels
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    Build Your English Skills — From Beginner to Advanced
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    Master conversational fluency, grammar drills, pronunciation with Speech AI, and 10 quiz formats. Earn your verified certificate when you complete the final assessment.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSection('path')}
                      className="rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm px-6 py-3 transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
                    >
                      <span>Explore 50-Phase Path</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('quizzes')}
                      className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 transition flex items-center gap-2"
                    >
                      <Target className="w-4 h-4 text-purple-300" />
                      <span>Practice Quiz Center</span>
                    </button>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400 via-pink-500 to-transparent pointer-events-none" />
              </div>

              {/* 5 Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-xs">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">CEFR Level</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{profile?.englishLevel || 'Beginner'}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Diagnosed placement</div>
                </div>
                <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs">
                  <div className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider">Active Phase</div>
                  <div className="text-lg font-black text-purple-900 mt-1">Phase {profile?.currentPhase || 1} / 50</div>
                  <div className="text-[11px] text-purple-600 mt-0.5">Structured roadmap</div>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 shadow-xs">
                  <div className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">Study Streak</div>
                  <div className="text-lg font-black text-orange-700 mt-1 flex items-center gap-1">
                    <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                    <span>{profile?.streak || 1} Days</span>
                  </div>
                  <div className="text-[11px] text-orange-600 mt-0.5">Keep momentum</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-slate-900 text-white p-4 shadow-xs">
                  <div className="text-[10px] font-extrabold uppercase text-white/50 tracking-wider">Total XP</div>
                  <div className="text-lg font-black text-yellow-400 mt-1 flex items-center gap-1">
                    <Zap className="w-4 h-4 fill-yellow-400" />
                    <span>{profile?.xp || 250} XP</span>
                  </div>
                  <div className="text-[11px] text-white/60 mt-0.5">Earned from drills</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Vocabulary Bank</div>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {profile?.vocabularyBank?.length || 18} Words
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">Mastered & reviewed</div>
                </div>
              </div>

              {/* Continue Learning Plan Card */}
              {(() => {
                const currentPhaseNum = profile?.currentPhase || 1;
                const currentPhaseProg = (profile?.phaseProgress || []).find((p) => p.phaseNumber === currentPhaseNum);
                const completedLessons = currentPhaseProg?.completedLessons || 0;
                const pct = currentPhaseProg?.progressPercent || Math.round((completedLessons / 8) * 100);

                return (
                  <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                        <Zap className="w-3.5 h-3.5" /> Continue Your Active Phase
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                        Phase {currentPhaseNum}: {currentPhaseProg?.title || 'Meet English & Basic Greetings'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {completedLessons} of 8 lessons completed ({pct}%). Finish 8 modules to unlock the Phase Capstone Quiz!
                      </p>
                      <div className="h-2 w-full max-w-md rounded-full bg-slate-100 overflow-hidden mt-2">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection('path')}
                      className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3.5 transition flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <span>Resume Phase {currentPhaseNum}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}

              {/* Hero Actions Grid: Talk with AI + Daily Challenge */}
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Voice Practice Card */}
                <div className="rounded-[28px] border border-black/10 bg-gradient-to-tr from-[#111827] to-[#1f2937] p-7 text-white shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-300">
                        <Mic className="h-3.5 w-3.5 animate-pulse" /> Real-time Voice Interaction
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        AI Voice Ready
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      Talk With Your AI English Partner
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
                      Practice spoken English without typing. Speak into your microphone, listen to natural AI voice answers, and get real-time corrections.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs text-white/90">
                      <span>Mode: <strong>{profile?.englishLevel || 'Beginner'} Spoken Practice</strong></span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/english/talk')}
                      className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/40 hover:scale-105 transition"
                    >
                      <Mic className="h-4 w-4" /> Start Spoken Conversation
                    </button>
                    <span className="text-xs text-white/50">Zero typing required • Instant feedback</span>
                  </div>
                </div>

                {/* Daily 2-Minute English Quiz Card */}
                <div className="rounded-[28px] border border-black/10 bg-white p-7 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Daily English Challenge
                      </span>
                      <span className="text-xs font-mono font-semibold text-black/50">5 Questions • 2 Min</span>
                    </div>

                    <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-black">
                      Today's 2-Minute English Quiz
                    </h2>
                    <p className="mt-2 text-sm text-black/60 leading-relaxed">
                      Test your vocabulary, grammar, and sentence structure. Maintain your learning streak and earn bonus XP!
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 text-xs">
                        <span className="text-black/50">Streak:</span> <strong>{profile?.streak || 1} Days 🔥</strong>
                      </div>
                      <div className="rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 text-xs">
                        <span className="text-black/50">Reward:</span> <strong>+50 to +100 XP ⚡</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleStartDailyQuiz}
                      disabled={loadingQuiz}
                      className="w-full rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 shadow-md disabled:opacity-60"
                    >
                      {loadingQuiz ? 'Preparing Quiz...' : 'Start Daily Quiz'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Today's 8-Step Daily Schedule Plan */}
              <TodayPlanSection
                dailyPlan={dailyPlan}
                onToggleTask={handleTogglePlanTask}
                onNavigateTab={(tabKey) => {
                  if (tabKey === 'journey') setActiveSection('path');
                  else if (tabKey === 'stories') setActiveSection('reading');
                  else setActiveSection(tabKey);
                }}
                onOpenQuiz={handleStartDailyQuiz}
                metrics={dailyPlanMetrics}
                streak={profile?.streak || 1}
                xp={profile?.xp || 250}
              />

              {/* Section 42: YOUR CORE ENGLISH SKILLS */}
              <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Your Core English Skills</h3>
                    <p className="text-xs text-slate-500">Calculated dynamically from quizzes, speaking sessions, and writing labs.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('progress')}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <span>Full Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Reading', value: profile?.skillScores?.reading || 75, color: 'bg-emerald-500', icon: BookOpen },
                    { label: 'Writing', value: profile?.skillScores?.writing || 65, color: 'bg-indigo-500', icon: PenTool },
                    { label: 'Listening', value: profile?.skillScores?.listening || 72, color: 'bg-blue-500', icon: Volume2 },
                    { label: 'Speaking', value: profile?.skillScores?.speaking || 62, color: 'bg-purple-500', icon: Mic },
                    { label: 'Vocabulary', value: profile?.skillScores?.vocabulary || 78, color: 'bg-amber-500', icon: Sparkles },
                    { label: 'Grammar', value: profile?.skillScores?.grammar || 68, color: 'bg-rose-500', icon: ShieldCheck }
                  ].map((s) => {
                    const SIcon = s.icon;
                    return (
                      <div key={s.label} className="p-3.5 rounded-2xl bg-neutral-50/80 border border-black/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <SIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-xs font-black text-slate-900">{s.value}%</span>
                        </div>
                        <div className="text-xs font-bold text-slate-700">{s.label}</div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.value}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7-Day Rotating Daily Fun Challenge */}
              <DailyChallengeSection
                profile={profile}
                onStreakUpdate={(updatedProfile) => {
                  setProfile(updatedProfile);
                  loadDashboard();
                }}
              />

              {/* Section 42: LEARNING JOURNEY TIMELINE */}
              <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Your 5-Tier English Journey</h3>
                    <p className="text-xs text-slate-500">From Basic English to Advanced Professional Mastery (50 Structured Phases).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('path')}
                    className="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>View 50-Phase Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { id: 'Beginner', level: 'Level 1', name: 'Beginner', phases: 'Phases 1–10', icon: '🌱' },
                    { id: 'Elementary', level: 'Level 2', name: 'Elementary', phases: 'Phases 11–20', icon: '🌿' },
                    { id: 'Intermediate', level: 'Level 3', name: 'Intermediate', phases: 'Phases 21–30', icon: '🌳' },
                    { id: 'Upper-Intermediate', level: 'Level 4', name: 'Upper-Intermediate', phases: 'Phases 31–40', icon: '🦅' },
                    { id: 'Advanced', level: 'Level 5', name: 'Advanced', phases: 'Phases 41–50', icon: '🏆' }
                  ].map((tier) => {
                    const isCurrent = (profile?.englishLevel || 'Beginner') === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setActiveSection('path')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isCurrent
                            ? 'border-purple-500 bg-purple-50/60 shadow-sm ring-2 ring-purple-500/20'
                            : 'border-black/10 bg-neutral-50/60 hover:bg-white hover:border-black/25'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{tier.icon}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isCurrent ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {tier.level}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-black text-slate-900">{tier.name}</div>
                        <div className="text-[11px] text-slate-500">{tier.phases}</div>
                        {isCurrent && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-ping" />
                            Current Tier
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended For You AI activities */}
              {recommendations.length > 0 && (
                <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-black/10">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Recommended For You</h3>
                      <p className="text-xs text-slate-500">Personalized activities based on your performance.</p>
                    </div>
                    <span className="text-xs uppercase font-extrabold text-purple-600 tracking-wider">AI Powered</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="rounded-2xl border border-black/10 bg-neutral-50/70 p-4 flex flex-col justify-between gap-3 hover:border-black/30 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-black px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              {rec.tag}
                            </span>
                            <span className="text-xs font-semibold text-black/70">{rec.type}</span>
                          </div>
                          <h4 className="mt-2 font-bold text-sm text-black">{rec.title}</h4>
                          <p className="text-xs text-black/55 mt-0.5">{rec.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (rec.actionRoute) {
                              navigate(rec.actionRoute);
                            } else if (rec.actionType === 'quiz') {
                              handleStartDailyQuiz();
                            } else {
                              setActiveSection('path');
                            }
                          }}
                          className="w-full text-center rounded-xl border border-black/15 bg-white py-2 text-xs font-bold text-black hover:border-black transition mt-2"
                        >
                          Start Activity →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: CENTRAL LEARNING PATH (50 PHASES) */}
          {(activeSection === 'path' || activeSection === 'journey') && (
            <LearningPathView
              profile={profile}
              onPhaseProgressUpdate={loadDashboard}
              onNavigateLab={(tabKey) => {
                if (tabKey === 'journey') setActiveSection('path');
                else if (tabKey === 'stories') setActiveSection('reading');
                else setActiveSection(tabKey);
              }}
            />
          )}

          {/* VIEW 3: PRACTICE & QUIZZES CENTER */}
          {activeSection === 'quizzes' && (
            <PracticeQuizCenterView
              profile={profile}
              onQuizCompleted={loadDashboard}
            />
          )}

          {/* VIEW 4: SPEAKING LAB */}
          {activeSection === 'speaking' && (
            <SpeakingLabView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
              onFinishActivity={handleActivityCompleted}
            />
          )}

          {/* VIEW 5: WRITING CENTER */}
          {activeSection === 'writing' && (
            <WritingPracticeView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
              onFinishActivity={handleActivityCompleted}
            />
          )}

          {/* VIEW 6: LISTENING HUB */}
          {activeSection === 'listening' && (
            <ListeningLabView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
              onFinishActivity={handleActivityCompleted}
            />
          )}

          {/* VIEW 7: READING LIBRARY */}
          {(activeSection === 'reading' || activeSection === 'stories') && (
            <ReadingLabView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
              onFinishActivity={handleActivityCompleted}
            />
          )}

          {/* VIEW 8: VOCABULARY BANK */}
          {activeSection === 'vocab' && (
            <DailyVocabularyView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
              onFinishActivity={handleActivityCompleted}
            />
          )}

          {/* VIEW 9: GRAMMAR LAB */}
          {activeSection === 'grammar' && (
            <GrammarLabView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
              onFinishActivity={handleActivityCompleted}
            />
          )}

          {/* VIEW 10: CARTOON LIBRARY */}
          {activeSection === 'cartoons' && (
            <CartoonVideoLearningView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
              onFinishActivity={handleActivityCompleted}
            />
          )}

          {/* VIEW 11: AI ENGLISH TUTOR */}
          {activeSection === 'tutor' && (
            <AITutorView
              userLevel={profile?.englishLevel || 'Beginner'}
              userName={profile?.fullName || 'Candidate'}
            />
          )}

          {/* VIEW 12: DAILY CHALLENGE */}
          {activeSection === 'daily_challenge' && (
            <DailyChallengeSection
              profile={profile}
              onStreakUpdate={(updatedProfile) => {
                setProfile(updatedProfile);
                loadDashboard();
              }}
            />
          )}

          {/* VIEW 13: MY PROGRESS */}
          {(activeSection === 'progress' || activeSection === 'skills') && (
            <SkillDashboardSection
              profile={profile}
              onNavigateLab={(tabKey) => {
                if (tabKey === 'journey') setActiveSection('path');
                else if (tabKey === 'stories') setActiveSection('reading');
                else setActiveSection(tabKey);
              }}
            />
          )}

          {/* VIEW 14: ACHIEVEMENTS */}
          {activeSection === 'achievements' && (
            <AchievementsView profile={profile} />
          )}

          {/* VIEW 15: MY CERTIFICATE */}
          {activeSection === 'certificate' && (
            <CertificatePageView
              profile={profile}
              onOpenFinalAssessment={() => setShowFinalAssessmentModal(true)}
            />
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CANDIDATE PROFILE ONBOARDING MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-black shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold">Candidate Learning Profile</h2>
                  <p className="text-xs text-black/60 mt-0.5">Customize your English practice goals and background</p>
                </div>
                {profile?.onboardingCompleted && (
                  <button type="button" onClick={() => setShowProfileModal(false)} className="rounded-full p-2 hover:bg-neutral-100">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">Full Name</span>
                    <input
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-black"
                      required
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">Age</span>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      placeholder="e.g. 21"
                      className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-black"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">Education Level</span>
                    <select
                      value={profileForm.education}
                      onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                      className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-black"
                    >
                      {EDUCATION_OPTIONS.map((ed) => <option key={ed}>{ed}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">College / University</span>
                    <input
                      value={profileForm.college}
                      onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                      placeholder="e.g. Delhi Technological University"
                      className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-black"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">Current Course / Major</span>
                    <input
                      value={profileForm.currentCourse}
                      onChange={(e) => setProfileForm({ ...profileForm, currentCourse: e.target.value })}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-black"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">Speaking Confidence</span>
                    <select
                      value={profileForm.speakingConfidence}
                      onChange={(e) => setProfileForm({ ...profileForm, speakingConfidence: e.target.value })}
                      className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-black"
                    >
                      {CONFIDENCE_LEVELS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>

                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-bold text-black/70 uppercase tracking-wider">Daily Practice Time</span>
                    <select
                      value={profileForm.preferredDuration}
                      onChange={(e) => setProfileForm({ ...profileForm, preferredDuration: e.target.value })}
                      className="w-full rounded-xl border border-black/15 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-black"
                    >
                      {DURATION_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </label>
                </div>

                {/* Multi-select English Learning Goals */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-black/70 uppercase tracking-wider">
                    English Learning Goals (Select one or more)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {LEARNING_GOAL_OPTIONS.map((goal) => {
                      const selected = profileForm.learningGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => {
                            const current = profileForm.learningGoals;
                            const next = selected
                              ? current.filter((g) => g !== goal)
                              : [...current, goal];
                            setProfileForm({ ...profileForm, learningGoals: next.length ? next : [goal] });
                          }}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                            selected
                              ? 'bg-black text-white shadow-sm'
                              : 'border border-black/10 bg-neutral-100 text-black/70 hover:border-black/30'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '} {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving...' : 'Save & Continue →'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: 6-SKILL PLACEMENT ASSESSMENT MODAL */}
      {/* ========================================================================= */}
      <PlacementAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        onComplete={(res) => {
          if (res?.profile) setProfile(res.profile);
          setShowAssessmentModal(false);
          loadDashboard();
        }}
        userLevel={profile?.englishLevel || 'Beginner'}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: DAILY ENGLISH CHALLENGE RUNNER MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDailyQuizModal && dailyQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-black shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {dailyQuiz.title}
                  </div>
                  <h2 className="text-2xl font-bold mt-1">Daily English Challenge</h2>
                </div>
                {!dailyQuizResult && (
                  <div className="rounded-full bg-neutral-100 border border-black/10 px-3 py-1 font-mono font-bold text-xs">
                    ⏱️ {Math.floor(dailyQuizTimeLeft / 60)}:{String(dailyQuizTimeLeft % 60).padStart(2, '0')}
                  </div>
                )}
                <button type="button" onClick={() => setShowDailyQuizModal(false)} className="rounded-full p-2 hover:bg-neutral-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!dailyQuizResult ? (
                /* QUIZ QUESTIONS RUNNER */
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {dailyQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="rounded-2xl border border-black/10 bg-neutral-50 p-4 space-y-3">
                      <div className="text-xs font-bold text-black/50 uppercase tracking-wider">Question {idx + 1} of 5</div>
                      <p className="text-sm font-semibold text-black">{q.question}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isSelected = dailyQuizAnswers[idx] === letter;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDailyQuizAnswers({ ...dailyQuizAnswers, [idx]: letter })}
                              className={`rounded-xl border p-3 text-left text-xs font-medium transition ${
                                isSelected
                                  ? 'border-black bg-black text-white'
                                  : 'border-black/10 bg-white text-black/80 hover:border-black/30'
                              }`}
                            >
                              <span className="font-bold mr-1.5">{letter}.</span> {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t border-black/10">
                    <span className="text-xs text-black/50">
                      {Object.keys(dailyQuizAnswers).length} / 5 Answered
                    </span>
                    <button
                      type="button"
                      onClick={handleDailyQuizSubmit}
                      disabled={submittingQuiz}
                      className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition disabled:opacity-50"
                    >
                      {submittingQuiz ? 'Evaluating...' : 'Submit Quiz →'}
                    </button>
                  </div>
                </div>
              ) : (
                /* QUIZ RESULT BREAKDOWN */
                <div className="space-y-6 text-center py-2">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-3xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold">Quiz Completed!</h3>
                    <div className="mt-2 text-5xl font-black text-black">
                      {dailyQuizResult.score} / {dailyQuizResult.totalQuestions}
                    </div>
                    <p className="mt-1 text-sm font-bold text-emerald-600">
                      {dailyQuizResult.percentage}% Score • +{dailyQuizResult.earnedXp} XP Earned!
                    </p>
                    <p className="mt-1 text-xs text-black/60">
                      You're building a strong English learning streak: {dailyQuizResult.streak} Days 🔥
                    </p>
                  </div>

                  {/* Review Explanations */}
                  <div className="text-left space-y-3 max-h-56 overflow-y-auto pr-2">
                    {dailyQuizResult.review?.map((rev, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3 text-xs ${
                          rev.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
                        }`}
                      >
                        <div className="font-semibold text-black">Q{idx + 1}: {rev.question}</div>
                        <div className="mt-1">
                          <span className={rev.isCorrect ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                            {rev.isCorrect ? '✓ Correct' : `✗ Correct Answer: ${rev.correctAnswer}`}
                          </span>
                        </div>
                        {rev.explanation && (
                          <p className="mt-1 text-black/60 italic">{rev.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDailyQuizModal(false)}
                    className="rounded-full bg-black px-8 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition"
                  >
                    Continue Learning
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: INTERACTIVE LEARNING JOURNEY STEP MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showStepModal && activeStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-black shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div>
                  <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black/70">
                    Step {activeStep.stepNumber} • {activeStep.category}
                  </span>
                  <h2 className="text-2xl font-bold mt-1.5">{activeStep.title}</h2>
                </div>
                <button type="button" onClick={() => setShowStepModal(false)} className="rounded-full p-2 hover:bg-neutral-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 text-sm leading-relaxed">
                {/* Concept */}
                <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-black/50 mb-1">Core Concept</div>
                  <p className="text-black/80">{activeStep.concept}</p>
                </div>

                {/* Vocabulary with Voice Audio */}
                {activeStep.vocabulary && activeStep.vocabulary.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-black/50">
                      Key Vocabulary & Audio Pronunciation
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeStep.vocabulary.map((v) => (
                        <div key={v.word} className="rounded-xl border border-black/10 bg-white p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-black">{v.word}</span>
                            <button
                              type="button"
                              onClick={() => speakWord(v.word)}
                              className="rounded-full p-1.5 bg-neutral-100 text-black hover:bg-black hover:text-white transition"
                              title="Listen to pronunciation"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-[11px] font-mono text-black/45">{v.phonetic}</div>
                          <p className="text-xs text-black/70">{v.meaning}</p>
                          <p className="text-xs text-black/50 italic">"{v.example}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grammar Rule */}
                {activeStep.grammarRule && (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 text-xs text-purple-950">
                    <div className="font-bold uppercase tracking-wider text-purple-700 mb-1">Grammar Rule</div>
                    <p>{activeStep.grammarRule}</p>
                  </div>
                )}

                {/* Practice Check Drill */}
                {activeStep.exercise && (
                  <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-black/50">Practice Drill</div>
                    <p className="font-semibold text-xs text-black">{activeStep.exercise.prompt}</p>
                    <div className="grid gap-2">
                      {activeStep.exercise.options.map((opt, idx) => (
                        <div key={opt} className="rounded-xl border border-black/10 bg-white p-2.5 text-xs text-black/80">
                          <span className="font-bold mr-1.5">{String.fromCharCode(65 + idx)}.</span> {opt}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-emerald-800 bg-emerald-50 rounded-lg p-2.5">
                      💡 <strong>Key takeaway: </strong>{activeStep.exercise.explanation}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/10">
                <span className="text-xs font-bold text-purple-600">
                  Reward: +{activeStep.xpReward} XP
                </span>
                <button
                  type="button"
                  onClick={() => handleCompleteStep(activeStep.id)}
                  className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition"
                >
                  Mark as Completed ✓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: FINAL LEVEL ASSESSMENT MODAL */}
      {/* ========================================================================= */}
      <FinalAssessmentModal
        isOpen={showFinalAssessmentModal}
        onClose={() => setShowFinalAssessmentModal(false)}
        onCertificateEarned={(cert) => {
          setActiveCertificate(cert);
          setShowCertificateModal(true);
          loadDashboard();
        }}
        profile={profile}
      />

      {/* ========================================================================= */}
      {/* MODAL 6: SHINING REWARD CELEBRATION POPUP */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showCelebrationModal && celebrationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl border-2 border-yellow-400/60 bg-gradient-to-b from-[#1c1917] to-[#0c0a09] p-8 text-center text-white shadow-[0_0_80px_rgba(234,179,8,0.35)] space-y-6"
            >
              {/* Shining Header Icon */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 shadow-[0_0_30px_rgba(234,179,8,0.6)] text-black text-4xl">
                🏆
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-yellow-300">
                  <Sparkles className="h-3.5 w-3.5" /> LEVEL COMPLETED
                </div>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                  Congratulations!
                </h2>
                <p className="mt-1 text-sm text-yellow-200/80">
                  {celebrationData.level}
                </p>
              </div>

              {/* Score & Rewards Box */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Final Score</div>
                  <div className="text-3xl font-black text-yellow-400 mt-0.5">{celebrationData.score} / 100</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Reward</div>
                  <div className="text-3xl font-black text-emerald-400 mt-0.5">+{celebrationData.xpAwarded} XP</div>
                </div>
              </div>

              {/* Unlocked Badge */}
              {celebrationData.unlockedBadge && (
                <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-3.5 flex items-center gap-3 text-left">
                  <div className="text-2xl">{celebrationData.unlockedBadge.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-yellow-300">New Badge Unlocked!</div>
                    <div className="text-sm font-bold text-white">{celebrationData.unlockedBadge.title}</div>
                    <div className="text-[11px] text-white/60">{celebrationData.unlockedBadge.description}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebrationModal(false);
                    setShowCertificateModal(true);
                  }}
                  className="w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-black hover:scale-105 transition shadow-lg shadow-yellow-400/30"
                >
                  View Certificate 🎓
                </button>
                <button
                  type="button"
                  onClick={() => setShowCelebrationModal(false)}
                  className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition"
                >
                  Continue to Next Level →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 7: OFFICIAL CERTIFICATE MODAL */}
      {/* ========================================================================= */}
      {showCertificateModal && activeCertificate && (
        <EnglishCertificateView
          certificate={activeCertificate}
          candidateName={profile?.fullName || 'Candidate'}
          level={activeCertificate.level}
          score={activeCertificate.score}
          certificateId={activeCertificate.certificateId}
          issueDate={activeCertificate.issueDate}
          onClose={() => setShowCertificateModal(false)}
          isModal={true}
        />
      )}

    </div>
  );
}
