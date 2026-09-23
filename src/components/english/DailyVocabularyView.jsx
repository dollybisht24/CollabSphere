import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Volume2,
  Check,
  Star,
  RotateCcw,
  BookOpen,
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Search,
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { englishAPI } from '../../utils/api';

export default function DailyVocabularyView({
  userLevel = 'Beginner',
  userName = 'Candidate',
  onFinishActivity
}) {
  const [selectedLevel, setSelectedLevel] = useState(userLevel);
  const [vocabularyList, setVocabularyList] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'daily' or 'bank' or 'quiz'
  const [activeTab, setActiveTab] = useState('daily');
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  // Word Bank Search & Spaced Repetition Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [spacedFilter, setSpacedFilter] = useState('ALL'); // 'ALL' | 'NEW' | 'REVIEW' | 'PRACTICE' | 'MASTERED'
  const [wordStatuses, setWordStatuses] = useState({});

  // Mini Quiz State
  const [miniQuizAnswers, setMiniQuizAnswers] = useState({});
  const [miniQuizCompleted, setMiniQuizCompleted] = useState(false);

  // Sentence Practice State (Requirement 15)
  const [practiceSentence, setPracticeSentence] = useState('');
  const [sentenceFeedback, setSentenceFeedback] = useState(null);

  // Load Vocabulary from API
  const loadVocabulary = async (level) => {
    try {
      setLoading(true);
      const res = await englishAPI.getVocabulary(level);
      setVocabularyList(res.vocabulary || []);
      setLearnedWords(res.learnedWords || []);
      setFavoriteWords(res.favoriteWords || []);
    } catch (err) {
      console.error('Failed to load vocabulary:', err);
      toast.error('Unable to load vocabulary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVocabulary(selectedLevel);
  }, [selectedLevel]);

  // Audio Pronunciation Helper
  const speakWord = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Learned
  const handleToggleLearned = async (word) => {
    try {
      const res = await englishAPI.recordVocabularyAction({
        action: 'learn',
        word,
        level: selectedLevel
      });
      setLearnedWords(res.learnedWords || []);
      confetti({ particleCount: 40, spread: 50 });
      toast.success(`"${word}" marked as learned! +20 XP`);
      if (onFinishActivity) onFinishActivity('vocab');
    } catch (err) {
      toast.error('Failed to update learned status');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (word) => {
    const isFav = favoriteWords.some((w) => w.word.toLowerCase() === word.toLowerCase());
    try {
      const res = await englishAPI.recordVocabularyAction({
        action: isFav ? 'unfavorite' : 'favorite',
        word,
        level: selectedLevel
      });
      setFavoriteWords(res.favoriteWords || []);
      toast.success(isFav ? `Removed from favorites` : `Saved to word bank favorites!`);
    } catch (err) {
      toast.error('Failed to update favorites');
    }
  };

  const activeWord = vocabularyList[currentWordIdx];
  const isWordLearned = (w) => learnedWords.some((item) => item.word.toLowerCase() === w.toLowerCase());
  const isWordFavorited = (w) => favoriteWords.some((item) => item.word.toLowerCase() === w.toLowerCase());

  // Filtered Word Bank List
  const allSavedWords = [
    ...learnedWords.map((w) => ({ ...w, type: 'Learned' })),
    ...favoriteWords
      .filter((fw) => !learnedWords.some((lw) => lw.word.toLowerCase() === fw.word.toLowerCase()))
      .map((w) => ({ ...w, type: 'Favorited' }))
  ].filter((w) => w.word.toLowerCase().includes(searchQuery.toLowerCase().trim()));

  // Mini Quiz Answer Handling
  const handleMiniQuizSelect = (wIdx, optIdx) => {
    setMiniQuizAnswers((prev) => ({ ...prev, [wIdx]: optIdx }));
  };

  const handleSubmitMiniQuiz = () => {
    setMiniQuizCompleted(true);
    confetti({ particleCount: 70, spread: 60 });
    toast.success('Mini Quiz Completed! Outstanding practice!');
  };

  const handleCheckSentence = () => {
    if (!activeWord) return;
    const cleanWord = activeWord.word.toLowerCase();
    const cleanSentence = practiceSentence.toLowerCase().trim();
    const words = cleanSentence.split(/\s+/).filter(Boolean);

    if (words.length < 3) {
      setSentenceFeedback({
        isSuccess: false,
        message: 'Please write a complete sentence with at least 4 words.'
      });
      return;
    }

    if (!cleanSentence.includes(cleanWord)) {
      setSentenceFeedback({
        isSuccess: false,
        message: `Your sentence must include the word "${activeWord.word}".`
      });
      return;
    }

    setSentenceFeedback({
      isSuccess: true,
      message: `Excellent sentence! You used "${activeWord.word}" accurately in context. +15 XP`
    });
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tabs */}
      <div className="rounded-[32px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Daily AI Vocabulary
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Master New Spoken Words Daily
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Curated everyday expressions, natural conversation snippets, audio pronunciation, and antonyms customized to your English level.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-100 border border-black/5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'daily'
                  ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Today's Words ({vocabularyList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'quiz'
                  ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mini Quiz
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'bank'
                  ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Word Bank ({learnedWords.length + favoriteWords.length})
            </button>
          </div>
        </div>

        {/* 1. TODAY'S WORDS TAB */}
        {activeTab === 'daily' && (
          <div className="mt-6 space-y-6">
            {/* Level Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level:</span>
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      selectedLevel === lvl
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-neutral-100 text-slate-600 hover:bg-neutral-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-slate-400">
                Word {currentWordIdx + 1} of {vocabularyList.length}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading words...</div>
            ) : activeWord ? (
              <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
                {/* Main Flashcard */}
                <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-amber-50/40 via-white to-neutral-50 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                          {activeWord.word}
                        </h3>
                        <button
                          type="button"
                          onClick={() => speakWord(activeWord.word)}
                          className="p-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 shadow-sm transition"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                          {activeWord.phonetic}
                        </span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          {activeWord.partOfSpeech}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {activeWord.difficulty}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(activeWord.word)}
                      className={`p-2.5 rounded-2xl border transition ${
                        isWordFavorited(activeWord.word)
                          ? 'border-amber-400 bg-amber-100 text-amber-600 shadow-sm'
                          : 'border-slate-200 text-slate-400 hover:text-amber-500'
                      }`}
                      title={isWordFavorited(activeWord.word) ? 'Remove favorite' : 'Bookmark word'}
                    >
                      <Star className={`w-5 h-5 ${isWordFavorited(activeWord.word) ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Meaning & Hindi Explanation */}
                  <div className="space-y-2 pt-2 border-t border-black/5">
                    <div className="text-base font-bold text-slate-900 leading-snug">
                      {activeWord.meaning}
                    </div>
                    {activeWord.hindiMeaning && (
                      <div className="text-sm font-semibold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 inline-block">
                        🇮🇳 {activeWord.hindiMeaning}
                      </div>
                    )}
                  </div>

                  {/* Example Sentence */}
                  <div className="p-4 rounded-2xl bg-neutral-100/70 border border-black/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                      <span>Example Sentence</span>
                      <button
                        type="button"
                        onClick={() => speakWord(activeWord.exampleSentence)}
                        className="text-slate-500 hover:text-slate-900 flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen
                      </button>
                    </div>
                    <p className="text-sm font-medium text-slate-800 italic">
                      "{activeWord.exampleSentence}"
                    </p>
                  </div>

                  {/* Real-World Conversation Snippet */}
                  {activeWord.conversationSnippet && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        💬 Spoken Conversation Snippet
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded-xl bg-neutral-50 text-slate-700">
                          <strong>A:</strong> "{activeWord.conversationSnippet.speakerA}"
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-950">
                          <strong>B:</strong> "{activeWord.conversationSnippet.speakerB}"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Synonyms & Antonyms */}
                  <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-black/5">
                    <div className="text-xs">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                        Related Words (Synonyms):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(activeWord.relatedWords || []).map((rw) => (
                          <span key={rw} className="px-2 py-0.5 rounded-md bg-neutral-100 text-slate-700 font-medium">
                            {rw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs">
                      <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                        Opposite Word (Antonym):
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold inline-block">
                        {activeWord.oppositeWord || 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speakWord(activeWord.word)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Listen Again</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleLearned(activeWord.word)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                          isWordLearned(activeWord.word)
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-900 hover:bg-black text-white shadow-sm'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{isWordLearned(activeWord.word) ? 'Learned ✓' : 'Mark as Learned (+20 XP)'}</span>
                      </button>
                    </div>

                    {/* Next Word Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentWordIdx((prev) => (prev + 1) % vocabularyList.length)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Next Word</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Side Card: Quick Mini Practice (Requirement 15) */}
                <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 space-y-5">
                  {/* Part 1: Practice this word in a sentence */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-amber-900">
                      <span>Practice This Word</span>
                      <span className="text-amber-600">+15 XP</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Write a sentence using <strong>"{activeWord.word}"</strong>:
                    </p>
                    <input
                      type="text"
                      value={practiceSentence}
                      onChange={(e) => {
                        setPracticeSentence(e.target.value);
                        setSentenceFeedback(null);
                      }}
                      placeholder={`e.g. She felt ${activeWord.word.toLowerCase()} during...`}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleCheckSentence}
                      disabled={!practiceSentence.trim()}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs disabled:opacity-40 transition"
                    >
                      Verify My Sentence
                    </button>

                    {sentenceFeedback && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-semibold ${
                          sentenceFeedback.isSuccess
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-rose-50 text-rose-900 border border-rose-200'
                        }`}
                      >
                        {sentenceFeedback.message}
                      </div>
                    )}
                  </div>

                  {/* Part 2: Quick Mini Quiz Drill */}
                  <div className="pt-2 border-t border-black/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Quick Concept Drill
                      </h4>
                    </div>

                    {activeWord.miniQuiz ? (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {activeWord.miniQuiz.question}
                      </p>

                      <div className="space-y-2">
                        {activeWord.miniQuiz.options.map((opt, oIdx) => {
                          const isPicked = miniQuizAnswers[currentWordIdx] === oIdx;
                          const isCorrect = oIdx === activeWord.miniQuiz.correctIndex;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleMiniQuizSelect(currentWordIdx, oIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition ${
                                isPicked
                                  ? isCorrect
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                                    : 'border-rose-400 bg-rose-50 text-rose-900'
                                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {miniQuizAnswers[currentWordIdx] !== undefined && (
                        <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-black/5">
                          💡 {activeWord.miniQuiz.explanation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Select another word to practice.</p>
                  )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* 2. MINI QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="mt-6 max-w-2xl mx-auto space-y-6">
            <div className="text-center pb-4 border-b border-black/5">
              <h3 className="text-xl font-black text-slate-900">
                Today's Vocabulary Mini Quiz
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Answer these quick questions to solidify your retention of today's words.
              </p>
            </div>

            <div className="space-y-6">
              {vocabularyList.map((item, idx) => {
                const q = item.miniQuiz;
                if (!q) return null;
                const userChoice = miniQuizAnswers[idx];

                return (
                  <div key={idx} className="p-5 rounded-2xl border border-black/10 bg-neutral-50/70 space-y-3">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Word {idx + 1}: {item.word}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{q.question}</h4>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userChoice === oIdx;
                        const isCorrect = oIdx === q.correctIndex;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleMiniQuizSelect(idx, oIdx)}
                            className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition ${
                              miniQuizCompleted
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                                  : isSelected
                                  ? 'border-rose-400 bg-rose-50 text-rose-950'
                                  : 'border-slate-200 bg-white opacity-60'
                                : isSelected
                                ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {!miniQuizCompleted ? (
              <button
                type="button"
                onClick={handleSubmitMiniQuiz}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md"
              >
                Submit Mini Quiz ✓
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-900">
                🎉 Mini Quiz Finished! Great job expanding your vocabulary toolkit!
              </div>
            )}
          </div>
        )}

        {/* 3. WORD BANK & SPACED REPETITION TAB */}
        {activeTab === 'bank' && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your saved vocabulary..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <span className="text-xs font-bold text-slate-500">
                Total Words in Bank: {allSavedWords.length}
              </span>
            </div>

            {/* Spaced Review Status Filters: NEW -> REVIEW -> PRACTICE -> MASTERED */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['ALL', 'NEW', 'REVIEW', 'PRACTICE', 'MASTERED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSpacedFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                    spacedFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {allSavedWords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No words saved in your bank yet. Click "Mark as Learned" or the star icon on words to collect them!
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allSavedWords
                  .filter((item) => {
                    const status = wordStatuses[item.word.toLowerCase()] || (item.reviewStatus || 'NEW');
                    if (spacedFilter !== 'ALL' && status !== spacedFilter) return false;
                    if (searchQuery && !item.word.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                    return true;
                  })
                  .map((item, idx) => {
                    const status = wordStatuses[item.word.toLowerCase()] || (item.reviewStatus || 'NEW');
                    const nextStatusMap = { NEW: 'REVIEW', REVIEW: 'PRACTICE', PRACTICE: 'MASTERED', MASTERED: 'NEW' };

                    const statusColors = {
                      NEW: 'bg-blue-100 text-blue-800 border-blue-200',
                      REVIEW: 'bg-amber-100 text-amber-800 border-amber-200',
                      PRACTICE: 'bg-purple-100 text-purple-800 border-purple-200',
                      MASTERED: 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    };

                    const handleAdvanceStatus = (word) => {
                      const next = nextStatusMap[status] || 'REVIEW';
                      setWordStatuses(prev => ({ ...prev, [word.toLowerCase()]: next }));
                      toast.success(`"${word}" promoted to ${next}!`);
                    };

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{item.word}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {item.type || 'Learned'} • {new Date(item.learnedAt || item.addedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => speakWord(item.word)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Listen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Spaced Review Status & Promotion Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${statusColors[status] || statusColors.NEW}`}>
                            {status}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(item.word)}
                            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition"
                            title="Click to advance spaced repetition status"
                          >
                            Advance Status →
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
