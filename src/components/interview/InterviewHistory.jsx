import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Calendar, Award, CheckCircle2, ChevronRight,
  RotateCcw, Sparkles, FolderKanban, BarChart3
} from 'lucide-react';
import { interviewAPI } from '../../utils/api';

const InterviewHistory = ({ onBack, onSelectSession }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    interviewAPI.getHistory()
      .then((data) => setHistory(data || []))
      .catch((err) => setError(err.message || 'Failed to load past interviews'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header with Back button */}
      <div className="flex items-center justify-between pb-6 border-b border-black/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-xl border border-black/15 bg-white p-2 text-black/60 hover:text-black hover:bg-neutral-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Interview History
            </h1>
            <p className="text-xs text-black/55">
              Review your previous mock interview attempts, scores, and AI recommendations.
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition"
        >
          Start New Practice
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-black/10 bg-neutral-50 p-6 h-24" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/20 bg-neutral-50/50 py-16 text-center space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-black text-white">
            <Clock className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-black">No Completed Interviews Yet</h3>
          <p className="text-xs text-black/60 max-w-sm mx-auto">
            Choose a developer role to take your first AI mock interview and build up your performance records.
          </p>
          <button
            onClick={onBack}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
          >
            Choose a Role & Start
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-black/10 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-neutral-50/70 text-black/50 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6">Questions</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {history.map((item) => {
                  const score = item.summary?.overallScore ?? Math.round((item.summary?.averageScore || 0) * 10);
                  const dateStr = item.completedAt || item.createdAt
                    ? new Date(item.completedAt || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent';

                  return (
                    <tr
                      key={item._id}
                      onClick={() => onSelectSession(item._id)}
                      className="hover:bg-neutral-50/80 cursor-pointer transition"
                    >
                      <td className="py-4 px-6 font-bold text-black">
                        {item.role}
                      </td>
                      <td className="py-4 px-6">
                        <span className="rounded-full border border-black/10 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-black/70">
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-black/60">
                        {item.interviewType || 'Technical'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                          score >= 75
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : score >= 50
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {score}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-black/60">
                        {item.totalQuestions || 5} Qs
                      </td>
                      <td className="py-4 px-6 text-black/45 text-xs">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-black hover:underline text-xs">
                          Review <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InterviewHistory;
