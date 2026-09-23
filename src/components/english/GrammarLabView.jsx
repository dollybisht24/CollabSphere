import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

export default function GrammarLabView({ userLevel = 'Beginner' }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const res = await englishAPI.getGrammarTopics();
      setTopics(res.topics || []);
      if (res.topics && res.topics.length > 0) {
        setSelectedTopic(res.topics[0]);
      }
    } catch (err) {
      console.error('Error loading grammar topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (top) => {
    setSelectedTopic(top);
    setAnswers({});
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await englishAPI.submitGrammarPractice({
        topicId: selectedTopic.id,
        answers
      });
      setSubmitted(true);
      toast.success(`Grammar Practice Evaluated! Score: ${res.score}% (+${res.earnedXp} XP)`);
    } catch (err) {
      console.error('Error submitting grammar practice:', err);
      toast.error('Failed to submit grammar practice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Contextual Grammar Lab
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Learn Grammar in Real Context
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Say goodbye to dry textbooks. Understand why grammatical tenses exist through real conversational stories and targeted exercises.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Grammar Topics List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Grammar Lessons
          </h3>
          <div className="space-y-2">
            {topics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTopic(t)}
                className={`w-full text-left p-4 rounded-2xl border transition ${
                  selectedTopic?.id === t.id
                    ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-[10px] font-bold text-rose-700 uppercase">{t.level}</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">{t.title}</h4>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Context Story & Rule Explanation */}
        {selectedTopic && (
          <div className="lg:col-span-2 space-y-6">
            {/* Story Card */}
            <div className="rounded-[28px] border border-rose-200 bg-gradient-to-br from-rose-50/40 to-amber-50/40 p-6 sm:p-7 shadow-sm space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                Real-Life Scenario Context
              </span>
              <h3 className="text-lg font-black text-slate-900">{selectedTopic.title}</h3>

              <div className="p-4 rounded-2xl bg-white/80 border border-rose-200/60 text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed italic">
                "{selectedTopic.contextStory}"
              </div>

              {/* Rule Explanation */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Why is this grammar used?
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {selectedTopic.ruleExplanation}
                </p>
                {selectedTopic.keyDifference && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    💡 <strong>Crucial Difference:</strong> {selectedTopic.keyDifference}
                  </div>
                )}
              </div>
            </div>

            {/* Practice Exercises */}
            <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <h3 className="text-base font-black text-slate-900">Contextual Practice Questions</h3>

              <div className="space-y-4">
                {selectedTopic.practiceQuestions?.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {idx + 1}. {q.question}
                    </h4>

                    <div className="space-y-1.5">
                      {q.options?.map((opt, i) => {
                        const isSelected = answers[idx] === opt;
                        const isCorrect = submitted && opt === q.correctAnswer;
                        const isWrong = submitted && isSelected && opt !== q.correctAnswer;

                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={submitted}
                            onClick={() => setAnswers({ ...answers, [idx]: opt })}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition ${
                              isCorrect
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                                : isWrong
                                ? 'border-rose-500 bg-rose-50 text-rose-950'
                                : isSelected
                                ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="text-xs text-slate-600 pt-1 font-medium">
                        <strong className="text-slate-900">Why?</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || submitted || Object.keys(answers).length < (selectedTopic.practiceQuestions?.length || 1)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-40"
                >
                  {submitted ? 'Practice Completed' : 'Submit Grammar Practice →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
