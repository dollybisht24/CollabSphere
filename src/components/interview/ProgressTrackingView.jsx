import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Award,
  Sparkles, RotateCcw, ArrowLeft, Brain, Compass, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { interviewAPI } from '../../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-black/10 bg-black text-white p-3 shadow-xl text-xs space-y-1">
        <p className="font-semibold text-white/90">{data.role || label}</p>
        <p className="text-white/60 text-[11px]">{data.date}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-bold text-base text-white">{data.score}%</span>
          <span className="text-[10px] text-white/50">Overall Score</span>
        </div>
      </div>
    );
  }
  return null;
};

const ProgressTrackingView = ({ onBack, onStartInterview }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    interviewAPI.getProgress()
      .then((data) => {
        if (mounted) {
          setProgress(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to load progress analytics');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
        <p className="text-xs text-black/50">Synthesizing your interview trajectory...</p>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-red-600 font-medium">{error || 'Unable to load progress data'}</p>
        <button
          onClick={onBack}
          className="rounded-xl border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-black"
        >
          Return to Practice
        </button>
      </div>
    );
  }

  const {
    hasHistory,
    totalInterviews,
    currentScore,
    previousScore,
    scoreDelta,
    latestReadiness,
    trendData = [],
    radarData = [],
    aiProgressFeedback
  } = progress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-black/55 hover:text-black mb-2 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Roles</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Interview Analytics & Progress
          </h1>
          <p className="text-xs sm:text-sm text-black/55">
            AI-monitored growth, historical scores, and dimensional readiness benchmark.
          </p>
        </div>

        {onStartInterview && (
          <button
            onClick={onStartInterview}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 transition shadow-sm self-start sm:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span>Practice Another Session</span>
          </button>
        )}
      </div>

      {/* Metrics Banner & Score Delta */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-1 shadow-xs">
          <span className="text-xs font-medium text-black/50">Total Mock Interviews</span>
          <p className="text-3xl font-bold text-black">{totalInterviews}</p>
          <span className="text-[11px] text-black/45 block pt-1">Completed practice sessions</span>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-1 shadow-xs">
          <span className="text-xs font-medium text-black/50">Latest Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black">{currentScore}%</span>
            {previousScore !== null && (
              <span
                className={`inline-flex items-center text-xs font-bold ${
                  scoreDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {scoreDelta >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3.5 w-3.5" /> +{scoreDelta}
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3.5 w-3.5" /> {scoreDelta}
                  </>
                )}
              </span>
            )}
          </div>
          <span className="text-[11px] text-black/45 block pt-1">
            {previousScore !== null ? `From previous session (${previousScore}%)` : 'Baseline session'}
          </span>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-1 shadow-xs">
          <span className="text-xs font-medium text-black/50">Placement Readiness</span>
          <p className="text-lg font-bold text-black mt-1">
            {latestReadiness || 'In Progress'}
          </p>
          <span className="text-[11px] text-black/45 block pt-1">Current hiring classification</span>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black text-white p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Improvement Delta</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {scoreDelta > 0 ? `+${scoreDelta} pts` : scoreDelta === 0 ? 'Consistent' : `${scoreDelta} pts`}
          </p>
          <span className="text-[11px] text-white/50 block pt-1">Session-over-session trend</span>
        </div>
      </div>

      {/* AI Progress Feedback Note */}
      {aiProgressFeedback && (
        <div className="rounded-2xl border border-black/10 bg-neutral-50 p-5 sm:p-6 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-black">
            <Sparkles className="h-4 w-4 text-black/70" />
            <span>AI Coach Commentary</span>
          </div>
          <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
            {aiProgressFeedback}
          </p>
        </div>
      )}

      {/* Charts Section */}
      {hasHistory && trendData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Historical Score Progression Line Chart */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black">Performance Trajectory</h3>
                <p className="text-xs text-black/50">Overall score across consecutive attempts</p>
              </div>
              <TrendingUp className="h-4 w-4 text-black/40" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#000000"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#000000', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#000000' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Dimensions Radar Chart */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black">Skill Competency vs. Placement Bar</h3>
                <p className="text-xs text-black/50">Current scores compared to industry benchmark (80%)</p>
              </div>
              <Award className="h-4 w-4 text-black/40" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" stroke="#4b5563" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#d1d5db" fontSize={10} />
                  <Radar
                    name="Your Score"
                    dataKey="score"
                    stroke="#000000"
                    fill="#000000"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Placement Bar"
                    dataKey="benchmark"
                    stroke="#9ca3af"
                    fill="#9ca3af"
                    fillOpacity={0.08}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProgressTrackingView;
