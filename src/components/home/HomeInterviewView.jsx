import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { interviewAPI } from '../../utils/api';
import RoleSelection, { rolesData } from '../interview/RoleSelection';
import InterviewConfiguration from '../interview/InterviewConfiguration';
import InterviewSession from '../interview/InterviewSession';
import InterviewSummary from '../interview/InterviewSummary';
import InterviewHistory from '../interview/InterviewHistory';
import InterviewCelebration from '../interview/InterviewCelebration';
import ProgressTrackingView from '../interview/ProgressTrackingView';
import CandidateDetailsForm from '../interview/CandidateDetailsForm';

const HomeInterviewView = ({ onNavigate }) => {
  const { user } = useAuth();
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

  // Load history count on mount and view changes
  useEffect(() => {
    interviewAPI.getHistory()
      .then((res) => {
        if (Array.isArray(res)) setHistoryCount(res.length);
      })
      .catch(() => {});
  }, [viewState]);

  // Candidate Details Form Completed
  const handleProceedFromCandidateForm = (candidateData) => {
    setCandidate(candidateData);
    const roleMatch = rolesData.find(r => r.name === candidateData.role) || rolesData[0];
    setSelectedRole(roleMatch);
    setViewState('config');
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCandidate(prev => ({ ...prev, role: role.name }));
    setError('');
    setViewState('config');
  };

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

  const handleSubmitAnswer = async ({ questionNumber, userAnswer, isSkipped }) => {
    if (!session?.sessionId) return;
    try {
      setSubmitting(true);
      setError('');

      // Evaluate behind the scenes (invisible to candidate!)
      await interviewAPI.evaluate({
        sessionId: session.sessionId,
        questionNumber,
        userAnswer,
        isSkipped
      });

      // If final question, complete interview
      if (questionNumber >= session.totalQuestions) {
        await handleCompleteInterview();
        return;
      }

      // Fetch next question
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
      setError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

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

      // Objective Reward Logic: Show celebration reward only if criteria met
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
        totalQuestions: data.totalQuestions,
        candidateName: data.candidateName || candidate.name,
        candidateEmail: data.candidateEmail || candidate.email,
        candidateClassYear: data.candidateClassYear || candidate.classYear,
        candidate: data.candidate || candidate,
        certificateId: data.certificateId
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

  const handleRetake = () => {
    if (selectedRole) {
      setViewState('config');
    } else {
      setViewState('roles');
    }
  };

  const handleStartRecommendedPractice = (planItem) => {
    if (selectedRole) {
      setViewState('config');
    } else {
      setViewState('roles');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10"
      style={{ fontFamily: 'inherit' }}
    >
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
    </motion.div>
  );
};

export default HomeInterviewView;
