import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, ArrowRight, BookOpen, Clock,
  KeyRound, LogOut, CheckCircle2, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../utils/api';
import RoleSelection, { rolesData } from '../components/interview/RoleSelection';
import InterviewConfiguration from '../components/interview/InterviewConfiguration';
import InterviewSession from '../components/interview/InterviewSession';
import InterviewSummary from '../components/interview/InterviewSummary';
import InterviewHistory from '../components/interview/InterviewHistory';
import InterviewCelebration from '../components/interview/InterviewCelebration';
import ProgressTrackingView from '../components/interview/ProgressTrackingView';
import CandidateDetailsForm from '../components/interview/CandidateDetailsForm';

const Logo = ({ onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 cursor-pointer select-none">
    <span className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-black text-white text-sm font-semibold">C</span>
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold tracking-tight text-black">CollabSphere</span>
      <span className="block truncate text-[11px] font-medium text-black/45">AI Mock Interview Platform</span>
    </span>
  </div>
);

const InterviewPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [viewState, setViewState] = useState('candidate'); // 'candidate' | 'roles' | 'config' | 'session' | 'celebration' | 'summary' | 'history' | 'progress'
  const [candidate, setCandidate] = useState({
    name: user?.name || '',
    email: user?.email || '',
    classYear: user?.classYear || user?.grade || '',
    role: 'Frontend Developer'
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [historyCount, setHistoryCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Sync user profile data to candidate state
  useEffect(() => {
    if (user) {
      setCandidate(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        classYear: prev.classYear || user.classYear || user.grade || ''
      }));
    }
  }, [user]);

  // Load history count on mount
  useEffect(() => {
    interviewAPI.getHistory()
      .then((res) => {
        if (Array.isArray(res)) setHistoryCount(res.length);
      })
      .catch(() => {});
  }, [viewState]);

  // Check if role passed via query param (e.g. /interview?role=Frontend+Developer)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const match = rolesData.find(r => r.name.toLowerCase() === roleParam.toLowerCase());
      if (match) {
        setSelectedRole(match);
        setCandidate(prev => ({ ...prev, role: match.name }));
        setViewState('config');
      }
    }
  }, [searchParams]);

  // Handler: Candidate info confirmed -> proceed to setup
  const handleProceedFromCandidateForm = (candidateData) => {
    setCandidate(candidateData);
    const roleMatch = rolesData.find(r => r.name === candidateData.role) || rolesData[0];
    setSelectedRole(roleMatch);
    setViewState('config');
  };

  // Handler: Select a role from cards
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCandidate(prev => ({ ...prev, role: role.name }));
    setError('');
    setViewState('config');
  };

  // Handler: Start interview session from configuration
  const handleStartInterview = async (config) => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        ...config,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidateClassYear: candidate.classYear,
        candidate
      };
      const data = await interviewAPI.start(payload);
      setSession({
        sessionId: data.sessionId,
        role: data.role,
        difficulty: data.difficulty,
        interviewType: data.interviewType,
        totalQuestions: data.totalQuestions,
        currentQuestionIndex: data.currentQuestionIndex || 0,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidateClassYear: candidate.classYear,
        candidate
      });
      setCurrentQuestion(data.question);
      setQuestions([data.question]);
      setViewState('session');
    } catch (err) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Submit answer & continue to next question (real interviewer behavior)
  const handleSubmitAnswer = async ({ questionNumber, userAnswer, isSkipped }) => {
    if (!session?.sessionId) return;
    try {
      setSubmitting(true);
      setError('');

      // Evaluate behind the scenes (student does NOT see scores during interview)
      await interviewAPI.evaluate({
        sessionId: session.sessionId,
        questionNumber,
        userAnswer,
        isSkipped
      });

      // If this was the last question, complete interview
      if (questionNumber >= session.totalQuestions) {
        await handleCompleteInterview();
        return;
      }

      // Fetch next question with interviewer remark
      const data = await interviewAPI.nextQuestion(session.sessionId);
      if (data.isComplete) {
        await handleCompleteInterview();
        return;
      }

      setCurrentQuestion(data.question);
      setQuestions((prev) => {
        const exists = prev.some(q => q.questionNumber === data.question.questionNumber);
        return exists ? prev : [...prev, data.question];
      });
    } catch (err) {
      setError(err.message || 'Failed to process answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Complete interview and generate final analysis
  const handleCompleteInterview = async () => {
    if (!session?.sessionId) return;
    try {
      setSubmitting(true);
      setError('');
      const data = await interviewAPI.complete(session.sessionId, {
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidateClassYear: candidate.classYear,
        candidate
      });
      setSession(prev => ({
        ...prev,
        ...data,
        candidateName: data.candidateName || candidate.name,
        candidateEmail: data.candidateEmail || candidate.email,
        candidateClassYear: data.candidateClassYear || candidate.classYear,
        candidate: data.candidate || candidate
      }));
      setSummary(data.summary);
      setQuestions(data.questions || questions);

      // Objective Reward Logic:
      // If student met the objective criteria (overallScore >= 80 and categories met), show reward screen
      if (data.summary?.achievement?.earned === true) {
        setViewState('celebration');
      } else {
        setViewState('summary');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete interview');
      setViewState('summary');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Try Advanced Interview
  const handleTryAdvanced = () => {
    if (selectedRole) {
      handleStartInterview({
        role: selectedRole.name,
        difficulty: 'Advanced',
        interviewType: session?.interviewType || 'Technical Interview',
        totalQuestions: session?.totalQuestions || 5,
        projectContext: ''
      });
    } else {
      setViewState('roles');
    }
  };

  // Handler: Review a past session from history
  const handleSelectPastSession = async (id) => {
    try {
      setLoading(true);
      setError('');
      const data = await interviewAPI.getById(id);
      setSession({
        sessionId: data._id,
        role: data.role,
        difficulty: data.difficulty,
        interviewType: data.interviewType,
        totalQuestions: data.totalQuestions
      });
      setSummary(data.summary);
      setQuestions(data.questions || []);
      setViewState('summary');
    } catch (err) {
      setError(err.message || 'Failed to load interview session');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Retake same interview
  const handleRetake = () => {
    if (selectedRole) {
      setViewState('config');
    } else {
      setViewState('roles');
    }
  };

  // Handler: Start practice from recommended plan
  const handleStartRecommendedPractice = (planItem) => {
    if (selectedRole) {
      setViewState('config');
    } else {
      setViewState('roles');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between" style={{ fontFamily: 'Inter, Geist, Manrope, "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Logo onClick={() => navigate('/')} />

          {/* Center quick links */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 text-sm font-medium text-black/60">
            <button
              onClick={() => navigate('/')}
              className="rounded-full px-4 py-2 hover:text-black transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="rounded-full px-4 py-2 hover:text-black transition"
            >
              Projects
            </button>
            <button
              onClick={() => navigate('/ai')}
              className="rounded-full px-4 py-2 hover:text-black transition"
            >
              AI Assistant
            </button>
            <button
              onClick={() => setViewState('roles')}
              className="rounded-full bg-black text-white px-4 py-2 font-medium shadow-sm"
            >
              Interview Practice
            </button>
            <button
              onClick={() => navigate('/features')}
              className="rounded-full px-4 py-2 hover:text-black transition"
            >
              Features
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {viewState !== 'roles' && (
              <button
                onClick={() => setViewState('roles')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-black/60 hover:text-black transition mr-2"
              >
                Roles Overview
              </button>
            )}

            {!user ? (
              <button
                onClick={() => navigate('/login')}
                className="rounded-full border border-black/10 bg-neutral-50 px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-100 transition"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-black">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-white text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </span>
                <span className="max-w-[100px] truncate">{user.name || 'User'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-10">
        <AnimatePresence mode="wait">
          {viewState === 'candidate' && (
            <motion.div key="candidate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CandidateDetailsForm
                initialData={candidate}
                isLoggedIn={Boolean(user)}
                onProceed={handleProceedFromCandidateForm}
              />
            </motion.div>
          )}

          {viewState === 'roles' && (
            <motion.div key="roles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {candidate.name && (
                <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-black/10">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <span className="font-bold">Candidate:</span>
                    <span className="font-semibold text-black">{candidate.name}</span>
                    {candidate.classYear && (
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600 font-medium">
                        {candidate.classYear}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setViewState('candidate')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                  >
                    Edit Candidate Info
                  </button>
                </div>
              )}
              <RoleSelection
                onSelectRole={handleSelectRole}
                onOpenHistory={() => setViewState('history')}
                onOpenProgress={() => setViewState('progress')}
                historyCount={historyCount}
              />
            </motion.div>
          )}

          {viewState === 'config' && selectedRole && (
            <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewConfiguration
                role={selectedRole}
                candidate={candidate}
                onEditCandidate={() => setViewState('candidate')}
                onBack={() => setViewState('roles')}
                onStart={handleStartInterview}
                loading={loading}
                error={error}
              />
            </motion.div>
          )}

          {viewState === 'session' && session && currentQuestion && (
            <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewSession
                session={session}
                currentQuestion={currentQuestion}
                onSubmitAnswer={handleSubmitAnswer}
                submitting={submitting}
                error={error}
              />
            </motion.div>
          )}

          {viewState === 'celebration' && session && summary && (
            <motion.div key="celebration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewCelebration
                session={session}
                summary={summary}
                questions={questions}
                onViewReport={() => setViewState('summary')}
                onTryAdvanced={handleTryAdvanced}
                onPracticeAgain={handleRetake}
                onViewHistory={() => setViewState('history')}
              />
            </motion.div>
          )}

          {viewState === 'summary' && session && summary && (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewSummary
                session={session}
                summary={summary}
                questions={questions}
                onRestart={handleRetake}
                onSelectNewRole={() => setViewState('roles')}
                onViewHistory={() => setViewState('history')}
                onViewProgress={() => setViewState('progress')}
                onStartRecommendedPractice={handleStartRecommendedPractice}
              />
            </motion.div>
          )}

          {viewState === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewHistory
                onBack={() => setViewState('roles')}
                onSelectSession={handleSelectPastSession}
              />
            </motion.div>
          )}

          {viewState === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressTrackingView
                onBack={() => setViewState('roles')}
                onStartInterview={() => setViewState('roles')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimalist Footer */}
      <footer className="bg-black text-white border-t border-black/10 mt-20">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <div className="flex items-center gap-2 text-white/70 font-semibold">
            <Sparkles className="h-4 w-4" /> CollabSphere AI Interview Practice
          </div>
          <span>Practice real engineering questions. Get instant feedback. Ace your placement interview.</span>
          <span>© {new Date().getFullYear()} CollabSphere</span>
        </div>
      </footer>
    </div>
  );
};

export default InterviewPage;
