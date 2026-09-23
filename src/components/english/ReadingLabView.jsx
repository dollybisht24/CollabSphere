import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Volume2,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  X,
  Play,
  Pause
} from 'lucide-react';
import toast from 'react-hot-toast';

const READING_PASSAGES = {
  Beginner: [
    {
      id: 'read-beg-1',
      title: 'The Sunny Bakery',
      category: 'Daily Life & Food',
      passage: 'Every morning at sunrise, Kabir unlocks the door of his small neighborhood bakery. The air soon fills with the comforting aroma of warm cinnamon rolls and freshly baked sourdough bread. Neighbors stop by on their morning walks to purchase warm loaves and exchange polite greetings. Kabir believes that baking with care and speaking with genuine warmth brings happiness to the whole street.',
      sentences: [
        { text: 'Every morning at sunrise, Kabir unlocks the door of his small neighborhood bakery.', grammarNote: 'Simple present indicates daily routine ("unlocks").' },
        { text: 'The air soon fills with the comforting aroma of warm cinnamon rolls and freshly baked sourdough bread.', grammarNote: '"Aroma" refers to an agreeable, pleasant smell.' },
        { text: 'Neighbors stop by on their morning walks to purchase warm loaves and exchange polite greetings.', grammarNote: 'Phrasal verb "stop by" means to pay a brief, casual visit.' },
        { text: 'Kabir believes that baking with care and speaking with genuine warmth brings happiness to the whole street.', grammarNote: 'Gerunds ("baking", "speaking") function as subjects.' }
      ],
      questions: [
        {
          id: 'rq-1',
          question: 'What fills the air soon after Kabir opens the bakery?',
          options: ['The comforting aroma of cinnamon rolls and sourdough bread', 'Thick dark smoke from the oven', 'Loud vehicle noise from the highway', 'Cold wind from the mountains'],
          correctAnswer: 'The comforting aroma of cinnamon rolls and sourdough bread',
          explanation: 'The passage explicitly mentions warm cinnamon rolls and sourdough.'
        },
        {
          id: 'rq-2',
          question: 'What does the phrasal verb "stop by" mean in this context?',
          options: ['To pay a brief casual visit', 'To permanently halt', 'To refuse to enter', 'To run away quickly'],
          correctAnswer: 'To pay a brief casual visit',
          explanation: '"Stop by" means visiting informally for a short period.'
        }
      ]
    }
  ],
  Intermediate: [
    {
      id: 'read-inter-1',
      title: 'The Architecture of Remote Teams',
      category: 'Workplace & Technology',
      passage: 'The transition from co-located office hubs to distributed remote organizations has profoundly reshaped contemporary corporate culture. While skeptics initially forecasted an irreversible decline in productivity, empirical data demonstrates that asynchronous workflows and clear documentation often foster superior focus. However, mitigating isolation and cultivating spontaneous camaraderie require deliberate, empathetic leadership.',
      sentences: [
        { text: 'The transition from co-located office hubs to distributed remote organizations has profoundly reshaped contemporary corporate culture.', grammarNote: 'Present perfect ("has reshaped") reflects past changes impacting modern culture.' },
        { text: 'While skeptics initially forecasted an irreversible decline in productivity, empirical data demonstrates that asynchronous workflows and clear documentation often foster superior focus.', grammarNote: 'Subordinating conjunction "while" introduces contrast.' },
        { text: 'However, mitigating isolation and cultivating spontaneous camaraderie require deliberate, empathetic leadership.', grammarNote: 'Parallel subjects ("mitigating", "cultivating") take plural verb "require".' }
      ],
      questions: [
        {
          id: 'rq-3',
          question: 'What did skeptics initially forecast about remote work?',
          options: ['An irreversible decline in productivity', 'An immediate surge in corporate profits', 'A shortage of laptop computers', 'Complete disappearance of meetings'],
          correctAnswer: 'An irreversible decline in productivity',
          explanation: 'The passage states: "While skeptics initially forecasted an irreversible decline in productivity..."'
        },
        {
          id: 'rq-4',
          question: 'What is necessary to mitigate isolation in distributed teams?',
          options: ['Deliberate, empathetic leadership', 'Mandatory overtime work', 'Lower salaries', 'Eliminating all video calls'],
          correctAnswer: 'Deliberate, empathetic leadership',
          explanation: 'The concluding sentence highlights deliberate, empathetic leadership.'
        }
      ]
    }
  ],
  Advanced: [
    {
      id: 'read-adv-1',
      title: 'The Epistemology of Algorithmic Judgment',
      category: 'Philosophy & Artificial Intelligence',
      passage: 'The contemporary reliance on predictive algorithmic heuristics has engendered a profound ontological tension between statistical optimization and humanistic jurisprudence. When decision-making architectures operate as opaque black boxes, the fundamental right to explanatory recourse is compromised. Consequently, robust regulatory governance must mandate interpretability not as an auxiliary amenity, but as a foundational pillar.',
      sentences: [
        { text: 'The contemporary reliance on predictive algorithmic heuristics has engendered a profound ontological tension between statistical optimization and humanistic jurisprudence.', grammarNote: 'High-register philosophical vocabulary.' },
        { text: 'When decision-making architectures operate as opaque black boxes, the fundamental right to explanatory recourse is compromised.', grammarNote: 'Passive voice ("is compromised") highlights systemic vulnerability.' },
        { text: 'Consequently, robust regulatory governance must mandate interpretability not as an auxiliary amenity, but as a foundational pillar.', grammarNote: 'Correlative contrast: "not as X, but as Y".' }
      ],
      questions: [
        {
          id: 'rq-5',
          question: 'What is compromised when decision-making architectures operate as black boxes?',
          options: ['The fundamental right to explanatory recourse', 'The computer processor speed', 'The electricity grid', 'The price of software licenses'],
          correctAnswer: 'The fundamental right to explanatory recourse',
          explanation: 'Stated explicitly: "the fundamental right to explanatory recourse is compromised."'
        }
      ]
    }
  ]
};

export default function ReadingLabView({ userLevel = 'Beginner' }) {
  const activeLevel = READING_PASSAGES[userLevel] ? userLevel : 'Beginner';
  const stories = READING_PASSAGES[activeLevel] || READING_PASSAGES.Beginner;

  const [selectedStory, setSelectedStory] = useState(stories[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSentence, setActiveSentence] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const toggleNarration = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedStory.passage);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSentenceClick = (st) => {
    setActiveSentence(st);
  };

  const handleAnswerSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    selectedStory.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    toast.success(`You scored ${correct} / ${selectedStory.questions.length}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Reading Lab & AI Stories
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Immersive Reading & Comprehension
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Read adaptive passages, listen to professional voice narration, tap sentences for grammar analysis, and test your understanding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stories Selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Reading Library ({activeLevel})
          </h3>
          <div className="space-y-2">
            {stories.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setSelectedStory(st);
                  setAnswers({});
                  setSubmitted(false);
                  setActiveSentence(null);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition ${
                  selectedStory.id === st.id
                    ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-[10px] font-bold text-rose-700 uppercase">{st.category}</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">{st.title}</h4>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Passage Reader */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[28px] border border-rose-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  {selectedStory.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedStory.title}</h3>
              </div>

              <button
                type="button"
                onClick={toggleNarration}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-rose-700 transition shadow-sm w-fit"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause Narration' : '▶ Listen to Story'}</span>
              </button>
            </div>

            {/* Clickable Paragraph Sentences */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 leading-relaxed text-sm sm:text-base font-medium text-slate-800 space-y-2">
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2">
                Tip: Click any sentence below to reveal grammatical breakdown:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStory.sentences?.map((sent, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleSentenceClick(sent)}
                    className="cursor-pointer hover:bg-amber-200/60 hover:text-amber-950 p-1 rounded transition border-b border-dotted border-amber-400"
                  >
                    {sent.text}{' '}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Sentence Drawer */}
            <AnimatePresence>
              {activeSentence && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-700">Sentence Analysis</span>
                    <button type="button" onClick={() => setActiveSentence(null)}>
                      <X className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-purple-950 italic">"{activeSentence.text}"</p>
                  <p className="text-xs text-purple-900 font-medium">💡 {activeSentence.grammarNote}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comprehension Quiz */}
          <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900">Comprehension Questions</h3>

            <div className="space-y-4">
              {selectedStory.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {idx + 1}. {q.question}
                  </h4>

                  <div className="space-y-1.5">
                    {q.options.map((opt, i) => {
                      const isSelected = answers[q.id] === opt;
                      const isCorrect = submitted && opt === q.correctAnswer;
                      const isWrong = submitted && isSelected && opt !== q.correctAnswer;

                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
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
                      <strong className="text-slate-900">Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAnswerSubmit}
                disabled={submitted || Object.keys(answers).length < selectedStory.questions.length}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-40"
              >
                {submitted ? 'Checked' : 'Submit Answers →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
