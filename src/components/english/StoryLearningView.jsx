import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Award,
  CheckCircle2,
  XCircle,
  Languages,
  Check,
  ArrowRight,
  ChevronRight,
  Flame,
  Star,
  RefreshCw,
  X,
  Info,
  Clock,
  Layers,
  Subtitles,
  ListOrdered
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { englishAPI } from '../../utils/api';
import CartoonSceneStage from './CartoonSceneStage';

export default function StoryLearningView({
  userLevel = 'Beginner',
  userName = 'Candidate',
  onFinishActivity
}) {
  const [selectedLevel, setSelectedLevel] = useState(userLevel);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);

  // Story Continuous Theater State
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showHindiSubtitles, setShowHindiSubtitles] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isStoryComplete, setIsStoryComplete] = useState(false);

  // AI Explanation Drawer / Popover
  const [showAiExplanation, setShowAiExplanation] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState(null);

  // Post-Story Quiz State
  const [inQuizMode, setInQuizMode] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [orderedEvents, setOrderedEvents] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Speech Synthesis & Timeline Ref
  const speechUtteranceRef = useRef(null);
  const autoPlayNextTimeoutRef = useRef(null);

  // Load Stories from API
  const loadStories = async (level) => {
    try {
      setLoading(true);
      const res = await englishAPI.getStories(level);
      const list = res.stories || [];
      setStories(list);

      // If user hasn't chosen a story yet, highlight the flagship story
      if (!activeStory && list.length > 0) {
        const flagship = list.find((s) => s.isFlagship) || list[0];
        // Keep activeStory null until user clicks "Start Story" or selects one
      }
    } catch (err) {
      console.error('Failed to load stories:', err);
      toast.error('Unable to load stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories(selectedLevel);
  }, [selectedLevel]);

  // Audio Playback & Auto-Advance Engine
  const stopAudio = () => {
    if (autoPlayNextTimeoutRef.current) {
      clearTimeout(autoPlayNextTimeoutRef.current);
      autoPlayNextTimeoutRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playSentence = (sentenceText, onEndCallback) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech synthesis not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(sentenceText);
    utterance.rate = 0.9 * playbackSpeed;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      if (onEndCallback) {
        onEndCallback();
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Continuous Playback Controller
  const currentScene = activeStory?.scenes?.[currentSceneIdx];
  const currentSentence = currentScene?.sentences?.[currentSentenceIdx];

  const advanceToNextBeat = () => {
    if (!activeStory || !currentScene) return;

    if (currentSentenceIdx < currentScene.sentences.length - 1) {
      // Advance to next sentence within current scene
      setCurrentSentenceIdx((prev) => prev + 1);
    } else if (currentSceneIdx < activeStory.scenes.length - 1) {
      // Transition to next scene automatically
      setCurrentSceneIdx((prev) => prev + 1);
      setCurrentSentenceIdx(0);
      toast(`🎬 Moving to Scene ${currentSceneIdx + 2}: ${activeStory.scenes[currentSceneIdx + 1]?.title}`, {
        icon: '🍿'
      });
    } else {
      // Entire story has naturally finished!
      stopAudio();
      setIsStoryComplete(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  // When story is playing, speak the active sentence and auto-advance on completion
  useEffect(() => {
    if (isPlaying && currentSentence && !isStoryComplete && !inQuizMode) {
      playSentence(currentSentence.audioText || currentSentence.text, () => {
        // Natural pacing pause between sentences (600ms)
        autoPlayNextTimeoutRef.current = setTimeout(() => {
          advanceToNextBeat();
        }, 650);
      });
    }

    return () => {
      if (autoPlayNextTimeoutRef.current) {
        clearTimeout(autoPlayNextTimeoutRef.current);
      }
    };
  }, [isPlaying, currentSceneIdx, currentSentenceIdx, activeStory, isStoryComplete]);

  // Open & Start Story Immediately in continuous mode
  const handleStartStory = (story) => {
    stopAudio();
    setActiveStory(story);
    setCurrentSceneIdx(0);
    setCurrentSentenceIdx(0);
    setSelectedWord(null);
    setShowAiExplanation(false);
    setIsStoryComplete(false);
    setInQuizMode(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizResult(null);

    // Initialize sequence order question state if quiz contains it
    const seqQ = story.quiz?.find((q) => q.type === 'sequence_order');
    if (seqQ && seqQ.items) {
      // Shuffle initially for the test
      const shuffled = seqQ.items.map((item, idx) => ({ id: idx, text: item }))
        .sort(() => Math.random() - 0.5);
      setOrderedEvents(shuffled);
    }

    // Begin playback immediately
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      setIsPlaying(true);
    }
  };

  const handleReplayCurrentScene = () => {
    stopAudio();
    setCurrentSentenceIdx(0);
    setTimeout(() => {
      setIsPlaying(true);
    }, 150);
  };

  const handleSpeedChange = (spd) => {
    setPlaybackSpeed(spd);
    if (isPlaying && currentSentence) {
      stopAudio();
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }
  };

  // Fetch AI Scene Explanation
  const handleFetchExplanation = async () => {
    if (!activeStory || !currentScene) return;
    try {
      setLoadingExplanation(true);
      setShowAiExplanation(true);
      const data = await englishAPI.explainStoryScene({
        storyId: activeStory.id,
        sceneNumber: currentScene.sceneNumber,
        language: 'en'
      });
      setExplanationData(data);
    } catch (err) {
      // Fallback to embedded metadata
      setExplanationData({
        title: currentScene.title,
        englishExplanation: currentScene.aiExplanation || 'This scene describes the characters interacting naturally in English.',
        hindiHelp: currentScene.hindiHelp || 'यह दृश्य पात्रों के बीच बातचीत को दर्शाता है।',
        keyTakeaway: currentScene.keyTakeaway || 'Focus on everyday polite verbs and descriptions.'
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Speak Word / Audio helper
  const handleSpeakAudio = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Launch Quiz after Complete Story
  const handleStartQuiz = () => {
    stopAudio();
    setInQuizMode(true);
    setCurrentQuizIdx(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSelectAnswer = (qIdx, ans) => {
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: ans }));
  };

  // Sequence Order Reorder Helpers
  const handleMoveEvent = (index, direction) => {
    const newItems = [...orderedEvents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setOrderedEvents(newItems);
  };

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    if (!activeStory?.quiz) return;

    let correctCount = 0;
    const questions = activeStory.quiz;

    questions.forEach((q, idx) => {
      if (q.type === 'sequence_order') {
        const currentOrderIds = orderedEvents.map((e) => e.id);
        const expected = q.correctOrder || [0, 1, 2, 3, 4];
        const isMatch = JSON.stringify(currentOrderIds) === JSON.stringify(expected);
        if (isMatch) correctCount++;
      } else {
        const userAns = quizAnswers[idx];
        if (userAns === q.correctAnswer) {
          correctCount++;
        }
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);

    try {
      setSubmittingQuiz(true);
      const res = await englishAPI.submitStoryQuiz({
        storyId: activeStory.id,
        score: correctCount,
        totalQuestions: questions.length
      });

      setQuizResult({
        score: correctCount,
        totalQuestions: questions.length,
        percent,
        earnedXp: res.earnedXp || 120,
        vocabulary: activeStory.storyVocabulary
      });
      setQuizSubmitted(true);
      confetti({ particleCount: 90, spread: 80 });
      toast.success(`Story Quiz Complete! ${percent}% score! +${res.earnedXp || 120} XP`);

      if (onFinishActivity) onFinishActivity('story');
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. STORIES CATALOG VIEW (When no story is playing) */}
      {/* ========================================================================= */}
      {!activeStory && (
        <div className="rounded-[32px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-8">
          {/* Header & Level Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Animated Cartoon Stories
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Learn English Through Animated Stories
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Sit back, watch the educational cartoon unfold, and listen to natural AI voice narration. No clicking "Next" required!
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-100 border border-black/5 self-start md:self-auto">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedLevel === lvl
                      ? 'bg-white text-slate-900 shadow-sm border border-black/5'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading animated stories...</span>
              </div>
            ) : (
              stories.map((story) => {
                const isFlagship = story.isFlagship || story.id === 'story-beg-cafe';
                return (
                  <motion.div
                    key={story.id}
                    whileHover={{ y: -5 }}
                    className={`rounded-3xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                      isFlagship
                        ? 'border-rose-400/60 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/50 shadow-lg ring-2 ring-rose-500/20'
                        : 'border-black/10 bg-white hover:border-black/25 shadow-sm'
                    }`}
                  >
                    {isFlagship && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow">
                        ★ Featured Story
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-white">
                          {story.level}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {story.duration}
                        </span>
                        <span className="text-xs font-bold text-rose-600">
                          {story.scenes?.length || 5} Animated Scenes
                        </span>
                      </div>

                      {/* Story Visual Thumbnail */}
                      <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-amber-100 via-rose-50 to-orange-100 border border-black/5 flex flex-col items-center justify-center p-4 mb-4 shadow-inner relative overflow-hidden">
                        <div className="text-4xl filter drop-shadow">
                          {story.backgroundTheme === 'cafe' ? '☕ 🧁' : story.backgroundTheme === 'park' ? '🐶 🌳' : '📊 💼'}
                        </div>
                        <span className="mt-2 text-xs font-black text-slate-700 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                          {story.characters ? story.characters.map((c) => c.name).join(' & ') : 'Cartoon Story'}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 leading-snug">
                        {story.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {story.summary}
                      </p>

                      {/* Vocabulary Preview Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(story.storyVocabulary || []).slice(0, 4).map((word) => (
                          <span
                            key={word}
                            className="px-2 py-0.5 rounded-md bg-white border border-black/10 text-[11px] font-bold text-slate-700 shadow-sm"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                      <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                        <Award className="w-4 h-4" /> +120 XP
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartStory(story)}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-rose-600/30 transition hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Story</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTINUOUS ANIMATED STORY THEATER PLAYER */}
      {/* ========================================================================= */}
      {activeStory && !inQuizMode && (
        <div className="rounded-[36px] border border-black/10 bg-white p-6 sm:p-8 shadow-2xl max-w-5xl mx-auto space-y-6">
          {/* Top Bar: Story Title, Scene Indicator & Close */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {activeStory.level} Animated Cartoon
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Scene {currentSceneIdx + 1} of {activeStory.scenes.length}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {activeStory.title}
              </h2>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFetchExplanation}
                className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 transition flex items-center gap-1.5 shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Explain This Scene</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHindiSubtitles(!showHindiSubtitles)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  showHindiSubtitles
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-neutral-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{showHindiSubtitles ? 'Hindi: ON' : 'Hindi Help'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  setActiveStory(null);
                }}
                className="p-2.5 text-slate-400 hover:text-slate-700 rounded-2xl hover:bg-neutral-100 transition"
                title="Exit story player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isStoryComplete ? (
            <>
              {/* CENTRAL ANIMATED CARTOON STAGE */}
              <CartoonSceneStage
                scene={currentScene}
                characters={activeStory.characters || [
                  { id: 'emma', name: 'Emma', role: 'Main', avatar: '👩', color: '#f43f5e' },
                  { id: 'waiter', name: 'Waiter', role: 'Barista', avatar: '🧑‍🍳', color: '#f59e0b' },
                  { id: 'alex', name: 'Alex', role: 'Friend', avatar: '👨', color: '#3b82f6' }
                ]}
                activeSpeaker={currentSentence?.character || 'Narrator'}
                isNarrationPlaying={isPlaying}
                onReplayScene={handleReplayCurrentScene}
              />

              {/* LIVE SYNCHRONIZED SUBTITLES & VOCABULARY POPUP */}
              {showSubtitles && currentSentence && (
                <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Subtitles className="w-3.5 h-3.5" />
                      <span>{currentSentence.character || 'AI Narrator'}</span>
                    </span>
                    <span className="text-[11px] text-white/50 font-mono">
                      Sentence {currentSentenceIdx + 1}/{currentScene?.sentences?.length || 1} • Tap highlighted words
                    </span>
                  </div>

                  {/* Main Spoken Sentence with Clickable Vocabulary Tokens */}
                  <div className="text-lg sm:text-xl font-medium leading-relaxed">
                    {(currentSentence.text || '').split(' ').map((word, wIdx) => {
                      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
                      const matchedKeyword = (currentSentence.keywords || []).find(
                        (k) => k.word.toLowerCase() === cleanWord
                      );

                      return (
                        <span
                          key={wIdx}
                          onClick={() => matchedKeyword && setSelectedWord(matchedKeyword)}
                          className={`inline-block mr-1.5 transition ${
                            matchedKeyword
                              ? 'underline decoration-amber-400 decoration-2 font-bold cursor-pointer text-amber-300 hover:text-amber-200 bg-amber-400/10 px-1 rounded'
                              : 'text-white'
                          }`}
                          title={matchedKeyword ? `Learn meaning of "${matchedKeyword.word}"` : undefined}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </div>

                  {/* Optional Hindi Subtitle Line */}
                  <AnimatePresence>
                    {showHindiSubtitles && currentSentence.hindiText && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-sm text-amber-200/90 font-medium bg-white/5 p-3 rounded-xl border border-white/10"
                      >
                        🇮🇳 {currentSentence.hindiText}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Word Definition Popup */}
                  <AnimatePresence>
                    {selectedWord && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-4 rounded-2xl bg-white text-slate-900 border border-amber-300 shadow-2xl relative"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedWord(null)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-base font-black text-rose-600">
                            {selectedWord.word}
                          </h4>
                          <span className="text-xs font-mono text-slate-500">
                            {selectedWord.phonetic}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSpeakAudio(selectedWord.word)}
                            className="p-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                            title="Pronounce word"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 font-medium">
                          <strong>Meaning:</strong> {selectedWord.meaning}
                        </p>
                        {selectedWord.hindiMeaning && (
                          <p className="text-xs text-rose-800 font-medium mt-0.5">
                            <strong>Hindi:</strong> {selectedWord.hindiMeaning}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 italic mt-1 bg-neutral-50 p-2 rounded-lg">
                          "{selectedWord.example}"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* PLAYER CONTROLS & SCENE PROGRESS BAR */}
              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 flex flex-wrap items-center justify-between gap-4">
                {/* Left: Speed selector */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span>Speed:</span>
                  {[0.8, 1, 1.2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2.5 py-1 rounded-xl font-mono text-xs transition ${
                        playbackSpeed === spd
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* Center: Play / Pause / Replay Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReplayCurrentScene}
                    className="p-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition"
                    title="Replay scene"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="px-7 py-3.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-sm flex items-center gap-2.5 shadow-lg shadow-rose-600/30 transition hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isPlaying ? 'Pause Story' : 'Resume Story'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`p-3 rounded-2xl border transition ${
                      showSubtitles
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                    title="Toggle Subtitles"
                  >
                    <Subtitles className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Scene progression indicators */}
                <div className="flex items-center gap-1.5">
                  {activeStory.scenes.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        stopAudio();
                        setCurrentSceneIdx(idx);
                        setCurrentSentenceIdx(0);
                        setTimeout(() => setIsPlaying(true), 150);
                      }}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === currentSceneIdx
                          ? 'w-6 bg-rose-600'
                          : idx < currentSceneIdx
                          ? 'w-2.5 bg-emerald-500'
                          : 'w-2.5 bg-slate-300'
                      }`}
                      title={`Jump to Scene ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* AI SCENE EXPLANATION MODAL / DRAWER */}
              <AnimatePresence>
                {showAiExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200 text-slate-900 space-y-3 relative shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Scene Explanation • Scene {currentScene?.sceneNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAiExplanation(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      💡 {explanationData?.englishExplanation || currentScene?.aiExplanation}
                    </p>

                    <div className="p-3 rounded-2xl bg-white/80 border border-indigo-100 flex items-start gap-2 text-xs text-indigo-950 font-medium">
                      <span>🇮🇳</span>
                      <div>
                        <strong>Hindi Translation:</strong> {explanationData?.hindiHelp || currentScene?.hindiHelp}
                      </div>
                    </div>

                    {currentScene?.keyTakeaway && (
                      <p className="text-[11px] text-indigo-700 font-bold">
                        🎯 Key Learning: {currentScene.keyTakeaway}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* ========================================================================= */
            /* 3. STORY END CELEBRATION SCREEN (Requirement 8) */
            /* ========================================================================= */
            <div className="py-10 text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center text-5xl mx-auto shadow-xl shadow-rose-500/20 animate-bounce">
                🎉
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                  Story Complete
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  You just completed: {activeStory.title}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Outstanding work! You listened to the full cartoon story and practiced natural English vocabulary.
                </p>
              </div>

              {/* Performance Metrics Badges */}
              <div className="max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Listening</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">92%</div>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Vocabulary</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">90%</div>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Words Learned</div>
                  <div className="text-lg font-black text-rose-600 mt-0.5">
                    {activeStory.storyVocabulary?.length || 8}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 text-white border border-black/10">
                  <div className="text-[10px] uppercase font-bold text-amber-300">XP Earned</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">+120 XP</div>
                </div>
              </div>

              {/* Actions: Replay or Start Quiz */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSceneIdx(0);
                    setCurrentSentenceIdx(0);
                    setIsStoryComplete(false);
                    setIsPlaying(true);
                  }}
                  className="px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Watch & Listen Again
                </button>

                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2.5 transition hover:scale-105 active:scale-95"
                >
                  <span>Test Your Understanding →</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STORY-SPECIFIC COMPREHENSION QUIZ (Requirement 9) */}
      {/* ========================================================================= */}
      {activeStory && inQuizMode && (
        <div className="rounded-[36px] border border-black/10 bg-white p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto space-y-6">
          {!quizSubmitted ? (
            <>
              {/* Quiz Header & Progress Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Story Quiz • Question {currentQuizIdx + 1} of {activeStory.quiz.length}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {activeStory.title}
                  </h3>
                </div>

                <div className="text-xs font-black px-3.5 py-1 rounded-full bg-slate-900 text-white">
                  {Math.round(((currentQuizIdx + 1) / activeStory.quiz.length) * 100)}%
                </div>
              </div>

              {/* Active Question Body */}
              {(() => {
                const q = activeStory.quiz[currentQuizIdx];
                if (!q) return null;

                // 1. SEQUENCE / EVENT ORDER QUESTION TYPE
                if (q.type === 'sequence_order') {
                  return (
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                        <ListOrdered className="w-3.5 h-3.5" />
                        <span>Timeline Ordering</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-snug">
                        {q.question}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Use the arrows to arrange the story events from first to last:
                      </p>

                      <div className="space-y-2 pt-2">
                        {orderedEvents.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-neutral-50 flex items-center justify-between gap-3 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-sm font-semibold text-slate-800">
                                {item.text}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveEvent(idx, 'up')}
                                className="p-1.5 rounded-xl border bg-white hover:bg-slate-100 disabled:opacity-30 text-xs font-bold"
                                title="Move up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === orderedEvents.length - 1}
                                onClick={() => handleMoveEvent(idx, 'down')}
                                className="p-1.5 rounded-xl border bg-white hover:bg-slate-100 disabled:opacity-30 text-xs font-bold"
                                title="Move down"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // 2. AUDIO / LISTENING QUESTION TYPE
                if (q.type === 'listening') {
                  return (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-rose-900 block">
                            🎧 Audio Comprehension
                          </span>
                          <span className="text-xs text-rose-700">
                            Listen to the phrase Emma spoke, then select the answer.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSpeakAudio(q.audioText)}
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow hover:bg-rose-700 transition"
                        >
                          <Volume2 className="w-4 h-4" /> Listen
                        </button>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 leading-snug">
                        {q.question}
                      </h4>

                      <div className="grid gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[currentQuizIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectAnswer(currentQuizIdx, oIdx)}
                              className={`p-4 rounded-2xl border text-left font-medium text-sm transition flex items-center justify-between ${
                                isSelected
                                  ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-sm'
                                  : 'border-slate-200 bg-neutral-50/50 hover:bg-white text-slate-800'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // 3. STANDARD MCQ / MATCHING / COMPREHENSION
                return (
                  <div className="space-y-4">
                    <h4 className="text-lg font-black text-slate-900 leading-snug">
                      {q.question}
                    </h4>

                    <div className="grid gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[currentQuizIdx] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(currentQuizIdx, oIdx)}
                            className={`p-4 rounded-2xl border text-left font-medium text-sm transition flex items-center justify-between ${
                              isSelected
                                ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-sm'
                                : 'border-slate-200 bg-neutral-50/50 hover:bg-white text-slate-800'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentQuizIdx === 0}
                  onClick={() => setCurrentQuizIdx((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                >
                  Previous
                </button>

                {currentQuizIdx < activeStory.quiz.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuizIdx((p) => p + 1)}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submittingQuiz}
                    onClick={handleSubmitQuiz}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-rose-600/20 transition flex items-center gap-1.5"
                  >
                    {submittingQuiz ? 'Evaluating...' : 'Complete & View Results'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* QUIZ RESULTS & LEARNING EXPLANATIONS */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl flex items-center justify-center mx-auto">
                  🏆
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Quiz Completed! Score: {quizResult?.percent}%
                </h3>
                <p className="text-xs text-slate-500">
                  Earned <strong className="text-amber-600">+{quizResult?.earnedXp} XP</strong> • Review why each answer was correct below:
                </p>
              </div>

              {/* Explanations List for Every Question */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {activeStory.quiz.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900">
                      Q{idx + 1}: {q.question}
                    </div>
                    <p className="text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      ✓ <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInQuizMode(false);
                    setIsStoryComplete(false);
                    setActiveStory(null);
                  }}
                  className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
                >
                  Back to All Stories
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
