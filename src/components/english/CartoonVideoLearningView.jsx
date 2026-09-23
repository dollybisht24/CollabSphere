import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Subtitles,
  Sparkles,
  Award,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  BookOpen,
  ArrowRight,
  Clock,
  Eye,
  Brain,
  MessageSquare,
  Languages,
  Search,
  Filter,
  Star,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Send,
  History,
  Film,
  Lightbulb,
  Compass,
  Flame,
  ExternalLink,
  MessageCircle,
  GraduationCap,
  ListOrdered,
  Ear,
  RefreshCw,
  Layers,
  CheckCheck,
  VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { englishAPI } from '../../utils/api';

const QUICK_SEARCH_SUGGESTIONS = [
  'Zootopia',
  'English conversation',
  'Beginner English stories',
  'Tom and Jerry',
  'English listening practice',
  'Peppa Pig',
  'Daily English conversation',
  'Disney English'
];

export default function CartoonVideoLearningView({
  userLevel = 'Beginner',
  userName = 'Learner',
  onFinishActivity
}) {
  // Discovery & Library States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'recommended' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [featuredLesson, setFeaturedLesson] = useState(null);
  const [learningHistory, setLearningHistory] = useState([]);

  // Filters
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDuration, setFilterDuration] = useState('All');

  // Video Learning Page States
  const [activeVideo, setActiveVideo] = useState(null);
  const [learningMode, setLearningMode] = useState('watch'); // 'watch' | 'learn' | 'practice'
  const [videoCompleted, setVideoCompleted] = useState(false);

  // AI Teacher Analysis States
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingLesson, setAnalyzingLesson] = useState(false);
  const [analysisStepText, setAnalysisStepText] = useState('');

  // AI Voice Teacher Audio
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState(1);
  const audioRef = useRef(null);

  // Interactive Subtitles & Clickable Sentences
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showHindi, setShowHindi] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [savedWords, setSavedWords] = useState([]);

  // Contextual Explanations Modal / Popover
  const [contextExplanation, setContextExplanation] = useState(null);
  const [explainingContext, setExplainingContext] = useState(false);

  // AI Tutor Live Chat
  const [tutorMessages, setTutorMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Practice Mode & 8-10 Question Quiz
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResultsBreakdown, setQuizResultsBreakdown] = useState(null);

  // --------------------------------------------------------------------------
  // 1. DATA FETCHING: YouTube Search, History & Featured Lesson
  // --------------------------------------------------------------------------
  const fetchVideos = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await englishAPI.searchYouTube({
        query: searchQuery,
        level: filterLevel,
        type: filterType,
        topic: filterTopic,
        duration: filterDuration,
        pageToken: isLoadMore ? nextPageToken : ''
      });

      if (isLoadMore) {
        setVideos(prev => [...prev, ...(res.videos || [])]);
      } else {
        setVideos(res.videos || []);
      }
      setNextPageToken(res.nextPageToken || '');
    } catch (err) {
      console.error('Failed to fetch YouTube cartoons:', err);
      toast.error('Unable to fetch cartoon videos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchFeaturedAndHistory = async () => {
    try {
      const [featRes, histRes] = await Promise.all([
        englishAPI.getFeaturedYouTube(userLevel),
        englishAPI.getCartoonHistory()
      ]);
      if (featRes?.featured) setFeaturedLesson(featRes.featured);
      if (histRes?.history) setLearningHistory(histRes.history);
    } catch (err) {
      console.warn('Could not load featured lesson or history:', err.message);
    }
  };

  useEffect(() => {
    fetchFeaturedAndHistory();
  }, [userLevel]);

  // Trigger search on filter changes
  useEffect(() => {
    fetchVideos(false);
  }, [filterLevel, filterType, filterTopic, filterDuration]);

  // Debounced search on query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVideos(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --------------------------------------------------------------------------
  // 2. VIDEO SELECTION & AI TEACHER INITIALIZATION
  // --------------------------------------------------------------------------
  const handleSelectVideo = async (video) => {
    setActiveVideo(video);
    setLearningMode('watch');
    setVideoCompleted(false);
    setAiAnalysis(null);
    setSelectedWord(null);
    setContextExplanation(null);
    setCurrentQuizIdx(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResultsBreakdown(null);
    stopVoiceAudio();

    setTutorMessages([
      {
        sender: 'ai',
        text: `Hello ${userName}! 👋 I am your AI English Teacher for "${video.title}". Watch the video first, and when you finish, click "Start AI Explanation" so I can explain the story, vocabulary, and grammar to you!`
      }
    ]);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Pre-fetch AI analysis in background
    triggerAIAnalysis(video);
  };

  const triggerAIAnalysis = async (video = activeVideo) => {
    if (!video) return;
    try {
      setAnalyzingLesson(true);
      setAnalysisStepText('Understanding the video & characters...');

      const stepTimer1 = setTimeout(() => {
        setAnalysisStepText('Extracting key vocabulary & expressions...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStepText('Preparing your 8-question practice quiz...');
      }, 2400);

      const res = await englishAPI.analyzeCartoonAI({
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        transcript: video.hasTranscript ? 'Judy and Nick conversation transcript' : '',
        level: video.level || userLevel
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res?.analysis) {
        setAiAnalysis(res.analysis);
      }
    } catch (err) {
      console.error('Failed to generate AI cartoon analysis:', err);
    } finally {
      setAnalyzingLesson(false);
      setAnalysisStepText('');
    }
  };

  // --------------------------------------------------------------------------
  // 3. AI VOICE TEACHER (Gemini TTS with SpeechSynthesis Fallback)
  // --------------------------------------------------------------------------
  const stopVoiceAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoicePlaying(false);
  };

  const playVoiceTeacher = async (textToSpeak = null) => {
    const text = textToSpeak || aiAnalysis?.teacherSpokenScript || aiAnalysis?.synopsis;
    if (!text) return;

    if (isVoicePlaying) {
      stopVoiceAudio();
      return;
    }

    setIsVoicePlaying(true);

    try {
      // 1. Try high-fidelity backend Gemini TTS
      const res = await englishAPI.synthesizeCartoonVoice({
        text,
        voiceName: 'Aoede'
      });

      if (res?.audioData) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = res.audioData;
        audioRef.current.playbackRate = voicePlaybackSpeed;
        audioRef.current.onended = () => setIsVoicePlaying(false);
        audioRef.current.onerror = () => playSpeechSynthesisFallback(text);
        await audioRef.current.play();
        return;
      }
    } catch (err) {
      console.warn('Backend TTS failed, using browser SpeechSynthesis fallback:', err.message);
    }

    // 2. Client-side SpeechSynthesis Fallback
    playSpeechSynthesisFallback(text);
  };

  const playSpeechSynthesisFallback = (text) => {
    if (!('speechSynthesis' in window)) {
      setIsVoicePlaying(false);
      toast.error('Voice audio not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = (userLevel === 'Beginner' ? 0.85 : 0.95) * voicePlaybackSpeed;
    utterance.lang = 'en-US';
    utterance.onend = () => setIsVoicePlaying(false);
    utterance.onerror = () => setIsVoicePlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const pronounceWord = (word) => {
    if (!('speechSynthesis' in window) || !word) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85;
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  // --------------------------------------------------------------------------
  // 4. CONTEXTUAL AI EXPLANATION BUTTONS
  // --------------------------------------------------------------------------
  const handleExplainContext = async (itemType, itemContent = '') => {
    if (!activeVideo) return;
    try {
      setExplainingContext(true);
      const res = await englishAPI.explainCartoonContext({
        videoId: activeVideo.videoId,
        title: activeVideo.title,
        itemType,
        itemContent: itemContent || activeVideo.title,
        contextDialogue: aiAnalysis?.dialogues?.[0]?.text || ''
      });
      if (res?.explanation) {
        setContextExplanation({
          itemType,
          ...res.explanation
        });
      }
    } catch (err) {
      console.error('Failed to fetch context explanation:', err);
      toast.error('Could not generate contextual explanation');
    } finally {
      setExplainingContext(false);
    }
  };

  // --------------------------------------------------------------------------
  // 5. LIVE AI TUTOR CHAT
  // --------------------------------------------------------------------------
  const handleSendChatMessage = async (msgToSend = chatInput) => {
    const message = (msgToSend || '').trim();
    if (!message || chatLoading) return;

    const userMsg = { sender: 'user', text: message };
    setTutorMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await englishAPI.chatCartoonTeacher({
        videoId: activeVideo?.videoId,
        title: activeVideo?.title,
        message,
        conversationHistory: tutorMessages,
        currentContext: aiAnalysis?.synopsis || ''
      });
      const aiReply = res?.reply || 'Great observation! Notice how the speaker emphasizes certain words to make their meaning clear.';
      setTutorMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      console.error('AI chat failed:', err);
      setTutorMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'In this scene, the characters use natural everyday expressions. Try repeating the dialogue out loud with me!'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 6. PRACTICE MODE QUIZ & EVALUATION
  // --------------------------------------------------------------------------
  const handleSelectQuizOption = (questionId, optionIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    const quizList = aiAnalysis?.quiz || [];
    if (quizList.length === 0) return;

    setSubmittingQuiz(true);
    let correctCount = 0;
    let listeningCorrect = 0;
    let vocabCorrect = 0;
    let grammarCorrect = 0;
    let compCorrect = 0;

    let listeningTotal = 0;
    let vocabTotal = 0;
    let grammarTotal = 0;
    let compTotal = 0;

    quizList.forEach((q) => {
      const isCorrect = quizAnswers[q.id] === q.correctAnswer;
      if (isCorrect) correctCount += 1;

      if (q.type === 'listening') {
        listeningTotal += 1;
        if (isCorrect) listeningCorrect += 1;
      } else if (q.type === 'vocab_match' || q.type === 'fill_blank') {
        vocabTotal += 1;
        if (isCorrect) vocabCorrect += 1;
      } else if (q.type === 'grammar_choice') {
        grammarTotal += 1;
        if (isCorrect) grammarCorrect += 1;
      } else {
        compTotal += 1;
        if (isCorrect) compCorrect += 1;
      }
    });

    const scorePercent = Math.round((correctCount / quizList.length) * 100);
    const earnedXp = 120;

    const breakdown = {
      scoreFraction: `${correctCount} / ${quizList.length}`,
      scorePercent,
      listeningScore: listeningTotal > 0 ? Math.round((listeningCorrect / listeningTotal) * 100) : 90,
      vocabScore: vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : 85,
      grammarScore: grammarTotal > 0 ? Math.round((grammarCorrect / grammarTotal) * 100) : 80,
      compScore: compTotal > 0 ? Math.round((compCorrect / compTotal) * 100) : 90,
      wordsLearnedCount: aiAnalysis?.vocabulary?.length || 5,
      earnedXp
    };

    setQuizResultsBreakdown(breakdown);
    setQuizSubmitted(true);

    try {
      await englishAPI.submitCartoonQuiz({
        cartoonId: `yt-${activeVideo.videoId}`,
        videoId: activeVideo.videoId,
        title: activeVideo.title,
        thumbnail: activeVideo.thumbnail,
        duration: activeVideo.duration,
        score: scorePercent,
        earnedXp,
        learnedWords: aiAnalysis?.vocabulary?.map(v => v.word) || []
      });

      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 }
      });

      toast.success(`🎉 Lesson Completed! +${earnedXp} XP Earned!`);
      fetchFeaturedAndHistory();
    } catch (err) {
      console.error('Failed to submit quiz progress:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // --------------------------------------------------------------------------
  // 7. SAVE TO VOCABULARY
  // --------------------------------------------------------------------------
  const handleSaveWord = (wordObj) => {
    const wordText = typeof wordObj === 'string' ? wordObj : wordObj.word;
    if (!savedWords.includes(wordText)) {
      setSavedWords(prev => [...prev, wordText]);
      toast.success(`"${wordText}" added to your vocabulary bank!`);
    } else {
      toast('Word is already in your vocabulary bank.', { icon: '📌' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* ========================================================================= */}
      {/* CASE A: DEDICATED VIDEO LEARNING PAGE                                    */}
      {/* ========================================================================= */}
      {activeVideo ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* Top Bar Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <button
              onClick={() => {
                stopVoiceAudio();
                setActiveVideo(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Cartoon Library
            </button>

            {/* Mode Switcher: WATCH / LEARN / PRACTICE */}
            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setLearningMode('watch')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  learningMode === 'watch'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                WATCH
              </button>
              <button
                onClick={() => setLearningMode('learn')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  learningMode === 'learn'
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                LEARN (AI Teacher)
              </button>
              <button
                onClick={() => setLearningMode('practice')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  learningMode === 'practice'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                PRACTICE
              </button>
            </div>
          </div>

          {/* Video Metadata Heading */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {activeVideo.level}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeVideo.topic}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {activeVideo.type}
              </span>
              <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {activeVideo.duration}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeVideo.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              By <span className="text-slate-300 font-semibold">{activeVideo.channelTitle}</span> • Official YouTube Player
            </p>
          </div>

          {/* SPLIT SCREEN THEATER: Left (Video Player) | Right (AI Teacher & Practice) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: Official YouTube Player & Subtitle Controls      */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-4">
              {/* YouTube IFrame Embed Container */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo.videoId}?enablejsapi=1&rel=0&autoplay=1&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Video Completion Prompt Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Done watching this video?
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Your AI English Teacher will break down the story, dialogues & vocabulary.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setVideoCompleted(true);
                    setLearningMode('learn');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Start AI Explanation ➔
                </button>
              </div>

              {/* Subtitle & Audio Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Subtitles:</span>
                  <button
                    onClick={() => setShowSubtitles(prev => !prev)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      showSubtitles
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    English {showSubtitles ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => setShowHindi(prev => !prev)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                      showHindi
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Languages className="w-3 h-3" />
                    Hindi {showHindi ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Contextual AI Quick Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                  <button
                    onClick={() => handleExplainContext('scene')}
                    disabled={explainingContext}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium transition"
                  >
                    Explain Scene
                  </button>
                  <button
                    onClick={() => handleExplainContext('grammar')}
                    disabled={explainingContext}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium transition"
                  >
                    Explain Grammar
                  </button>
                </div>
              </div>

              {/* Interactive Transcript Area (If Available or Graceful Notice) */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Subtitles className="w-4 h-4 text-indigo-400" />
                    Interactive Subtitles & Clickable Sentences
                  </span>
                  <span className="text-[11px] text-slate-500">Tap any line for AI analysis</span>
                </div>

                {aiAnalysis?.dialogues && aiAnalysis.dialogues.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {aiAnalysis.dialogues.map((dlg, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleExplainContext('sentence', dlg.text)}
                        className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition text-xs space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-300">
                            {dlg.character}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 group-hover:bg-indigo-950 group-hover:text-indigo-300">
                            {dlg.tone || 'Dialogue'} • Click to Explain
                          </span>
                        </div>
                        <p className="text-slate-100 font-medium leading-relaxed">
                          "{dlg.text}"
                        </p>
                        {showHindi && dlg.hindiText && (
                          <p className="text-amber-200/90 text-[11px] font-normal pt-1 border-t border-slate-800">
                            🇮🇳 {dlg.hindiText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
                    Interactive transcript is unavailable for this video, but you can still use the available AI learning features, voice teacher, and practice quiz!
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: AI English Teacher / Practice Mode              */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {/* ========================================================= */}
              {/* SUB-MODE 1: PRACTICE MODE (8-10 Question Quiz)            */}
              {/* ========================================================= */}
              {learningMode === 'practice' ? (
                <div className="flex-1 bg-slate-900 rounded-2xl border border-emerald-500/30 p-5 shadow-2xl flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <h2 className="font-bold text-white text-base">
                          Comprehensive Video Quiz
                        </h2>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        8-10 Questions
                      </span>
                    </div>

                    {/* Quiz Body */}
                    {aiAnalysis?.quiz && aiAnalysis.quiz.length > 0 ? (
                      !quizSubmitted ? (
                        <div className="mt-4 space-y-4">
                          {/* Progress Header */}
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>
                              Question {currentQuizIdx + 1} of {aiAnalysis.quiz.length}
                            </span>
                            <span className="text-emerald-400 font-bold">Reward: +120 XP</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{
                                width: `${((currentQuizIdx + 1) / aiAnalysis.quiz.length) * 100}%`
                              }}
                            />
                          </div>

                          {/* Active Question */}
                          {(() => {
                            const q = aiAnalysis.quiz[currentQuizIdx];
                            const selectedOption = quizAnswers[q.id];

                            return (
                              <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                                    {q.type.replace('_', ' ')}
                                  </span>
                                </div>

                                <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                                  {q.question}
                                </p>

                                {/* Listening Audio Prompt (Requirement 19) */}
                                {q.type === 'listening' && q.spokenAudioPrompt && (
                                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <Ear className="w-4 h-4 text-indigo-400 animate-pulse" />
                                      <span className="text-xs font-bold text-indigo-200">
                                        Audio Listening Prompt
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => pronounceWord(q.spokenAudioPrompt)}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                      Listen to Audio
                                    </button>
                                  </div>
                                )}

                                {/* Options */}
                                <div className="space-y-2 pt-1">
                                  {q.options.map((opt, optIdx) => {
                                    const isChosen = selectedOption === optIdx;
                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        onClick={() => handleSelectQuizOption(q.id, optIdx)}
                                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between ${
                                          isChosen
                                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                                            : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:border-slate-600'
                                        }`}
                                      >
                                        <span>{opt}</span>
                                        {isChosen && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Bottom Navigation */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <button
                              type="button"
                              disabled={currentQuizIdx === 0}
                              onClick={() => setCurrentQuizIdx(prev => prev - 1)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700"
                            >
                              Previous
                            </button>

                            {currentQuizIdx < aiAnalysis.quiz.length - 1 ? (
                              <button
                                type="button"
                                disabled={quizAnswers[aiAnalysis.quiz[currentQuizIdx].id] === undefined}
                                onClick={() => setCurrentQuizIdx(prev => prev + 1)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white disabled:opacity-30 hover:bg-emerald-500"
                              >
                                Next Question ➔
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={submittingQuiz || quizAnswers[aiAnalysis.quiz[currentQuizIdx].id] === undefined}
                                onClick={handleSubmitQuiz}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
                              >
                                <Sparkles className="w-4 h-4" />
                                {submittingQuiz ? 'Submitting...' : 'Submit & Finish Quiz'}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* QUIZ RESULTS & MISTAKES BREAKDOWN */
                        <div className="mt-4 space-y-4">
                          {/* Top Score Banner */}
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/40 text-center space-y-2">
                            <h3 className="text-lg font-bold text-white">
                              🎉 Lesson Completed!
                            </h3>
                            <p className="text-3xl font-black text-emerald-400">
                              Score: {quizResultsBreakdown?.scoreFraction} ({quizResultsBreakdown?.scorePercent}%)
                            </p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                              +{quizResultsBreakdown?.earnedXp} XP Earned
                            </span>
                          </div>

                          {/* Skill Breakdown (Requirement 23) */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                              <span className="text-slate-400 block">Listening:</span>
                              <span className="text-sm font-bold text-indigo-300">{quizResultsBreakdown?.listeningScore}%</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                              <span className="text-slate-400 block">Vocabulary:</span>
                              <span className="text-sm font-bold text-amber-300">{quizResultsBreakdown?.vocabScore}%</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                              <span className="text-slate-400 block">Grammar:</span>
                              <span className="text-sm font-bold text-emerald-300">{quizResultsBreakdown?.grammarScore}%</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                              <span className="text-slate-400 block">Comprehension:</span>
                              <span className="text-sm font-bold text-rose-300">{quizResultsBreakdown?.compScore}%</span>
                            </div>
                          </div>

                          {/* Mistake Reviews (Requirement 21) */}
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                              Detailed Answer Explanations:
                            </span>
                            {aiAnalysis.quiz.map((q, idx) => {
                              const chosenIdx = quizAnswers[q.id];
                              const isCorrect = chosenIdx === q.correctAnswer;

                              return (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                                    isCorrect
                                      ? 'bg-emerald-950/30 border-emerald-500/30'
                                      : 'bg-rose-950/30 border-rose-500/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-white">
                                      Q{idx + 1}: {q.question}
                                    </span>
                                    {isCorrect ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                                    )}
                                  </div>

                                  {!isCorrect && (
                                    <p className="text-rose-300">
                                      Your answer: <span className="line-through">{q.options[chosenIdx] || 'Unanswered'}</span>
                                    </p>
                                  )}
                                  <p className="text-emerald-300 font-medium">
                                    Correct: {q.options[q.correctAnswer]}
                                  </p>
                                  <p className="text-[11px] text-slate-400 italic">
                                    Why? {q.explanation}
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Finish & Exit */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onFinishActivity) onFinishActivity();
                              stopVoiceAudio();
                              setActiveVideo(null);
                            }}
                            className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-lg"
                          >
                            <Check className="w-4 h-4" />
                            Return to Cartoon Library
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        <Award className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        Generating practice quiz questions based on this cartoon video...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ========================================================= */
                /* SUB-MODE 2: LEARN & WATCH MODES (AI Teacher Breakdown)     */
                /* ========================================================= */
                <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                  {/* AI Teacher Header */}
                  <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                          AI English Teacher
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </h2>
                        <p className="text-[10px] text-slate-400">
                          {analyzingLesson ? analysisStepText || 'Preparing lesson...' : 'Explaining video story & language'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setLearningMode('practice')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
                    >
                      Quiz ➔
                    </button>
                  </div>

                  {/* AI Voice Teacher Bar (Requirement 12) */}
                  <div className="px-4 py-3 bg-indigo-950/30 border-b border-indigo-900/30 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => playVoiceTeacher()}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow ${
                        isVoicePlaying
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isVoicePlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isVoicePlaying ? 'Pause AI Teacher' : 'Listen to AI Teacher'}</span>
                    </button>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      {[0.75, 1, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => {
                            setVoicePlaybackSpeed(speed);
                            if (audioRef.current) audioRef.current.playbackRate = speed;
                          }}
                          className={`px-1.5 py-0.5 rounded transition ${
                            voicePlaybackSpeed === speed
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Multi-Part Teacher Explanation Content Scroll Area */}
                  <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[520px] text-xs">
                    {analyzingLesson ? (
                      <div className="py-16 text-center text-slate-400 space-y-3">
                        <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-white font-bold">{analysisStepText || 'AI Teacher is preparing your lesson...'}</p>
                        <p className="text-[11px] text-slate-500">Analyzing characters, dialogue nuances, and vocabulary...</p>
                      </div>
                    ) : aiAnalysis ? (
                      <>
                        {/* 1. What Happened? (Requirement 13) */}
                        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                          <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                            <Eye className="w-3.5 h-3.5" /> 1. What Happened?
                          </span>
                          <p className="text-slate-200 leading-relaxed">
                            {aiAnalysis.synopsis}
                          </p>
                        </div>

                        {/* 2. Who are the Characters? */}
                        {aiAnalysis.characters && aiAnalysis.characters.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                              <Sparkles className="w-3.5 h-3.5" /> 2. Characters in this Scene
                            </span>
                            <div className="space-y-1.5">
                              {aiAnalysis.characters.map((ch, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="font-bold text-white shrink-0">• {ch.name}:</span>
                                  <span className="text-slate-300">{ch.role}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Chronology: What Happened First? Next? */}
                        {aiAnalysis.chronology && (
                          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                            <span className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                              <ListOrdered className="w-3.5 h-3.5" /> 3. Story Progression & Chronology
                            </span>
                            <div className="space-y-1 text-slate-300">
                              <p><strong className="text-slate-100">First:</strong> {aiAnalysis.chronology.first}</p>
                              <p><strong className="text-slate-100">Then:</strong> {aiAnalysis.chronology.then}</p>
                              {aiAnalysis.chronology.climax && (
                                <p><strong className="text-slate-100">Peak Moment:</strong> {aiAnalysis.chronology.climax}</p>
                              )}
                              <p><strong className="text-slate-100">Conclusion:</strong> {aiAnalysis.chronology.conclusion}</p>
                            </div>
                          </div>
                        )}

                        {/* 4. Important Vocabulary (Requirement 14) */}
                        {aiAnalysis.vocabulary && aiAnalysis.vocabulary.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2.5">
                            <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                              <BookOpen className="w-3.5 h-3.5" /> 4. Important Vocabulary from this Video
                            </span>
                            <div className="space-y-2">
                              {aiAnalysis.vocabulary.map((vocab, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-xs">{vocab.word}</span>
                                      {vocab.phonetic && (
                                        <span className="text-[10px] text-indigo-400 font-mono">{vocab.phonetic}</span>
                                      )}
                                      <span className="text-[10px] text-slate-500">({vocab.partOfSpeech})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => pronounceWord(vocab.word)}
                                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                                        title="Listen to pronunciation"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveWord(vocab)}
                                        className="p-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                                        title="Add to Vocabulary"
                                      >
                                        <Bookmark className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-slate-300">{vocab.meaning}</p>
                                  {vocab.hindiMeaning && (
                                    <p className="text-amber-300/90 text-[11px]">
                                      🇮🇳 {vocab.hindiMeaning}
                                    </p>
                                  )}
                                  <p className="text-slate-400 italic text-[11px]">
                                    Example: "{vocab.example}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Useful Expressions & Idioms */}
                        {aiAnalysis.usefulExpressions && aiAnalysis.usefulExpressions.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                              <Flame className="w-3.5 h-3.5" /> 5. Useful Expressions & Idioms
                            </span>
                            <div className="space-y-1.5">
                              {aiAnalysis.usefulExpressions.map((exp, eIdx) => (
                                <div key={eIdx} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                                  <p className="font-bold text-white">"{exp.expression}"</p>
                                  <p className="text-slate-300 text-[11px]">{exp.meaning}</p>
                                  {exp.hindiMeaning && (
                                    <p className="text-amber-200/90 text-[11px]">🇮🇳 {exp.hindiMeaning}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 6. Grammar Used (Requirement 13) */}
                        {aiAnalysis.grammar && aiAnalysis.grammar.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                            <span className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                              <Brain className="w-3.5 h-3.5" /> 6. Grammar Used in this Scene
                            </span>
                            <div className="space-y-2">
                              {aiAnalysis.grammar.map((g, gIdx) => (
                                <div key={gIdx} className="space-y-1">
                                  <p className="font-bold text-white">• {g.concept}</p>
                                  <p className="text-slate-300 text-[11px]">{g.rule}</p>
                                  <p className="text-emerald-300 italic text-[11px]">Example: "{g.exampleFromVideo}"</p>
                                  {g.hindiExplanation && (
                                    <p className="text-amber-200/90 text-[11px]">🇮🇳 {g.hindiExplanation}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 7. Key Takeaway */}
                        {aiAnalysis.keyTakeaway && (
                          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
                            <span className="font-bold text-indigo-300 block uppercase tracking-wider text-[11px]">
                              ⭐ What You Should Remember:
                            </span>
                            <p className="text-slate-200 leading-relaxed font-medium">
                              {aiAnalysis.keyTakeaway}
                            </p>
                          </div>
                        )}

                        {/* Ready for Practice CTA */}
                        <button
                          type="button"
                          onClick={() => setLearningMode('practice')}
                          className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                        >
                          <Award className="w-4 h-4" />
                          Ready! Take the 8-Question Video Quiz ➔
                        </button>
                      </>
                    ) : (
                      <div className="py-8 text-center text-slate-400">
                        Click "Start AI Explanation" to let your AI Teacher break down this video!
                      </div>
                    )}
                  </div>

                  {/* AI Tutor Live Chat Drawer */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask AI tutor about this scene or words..."
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTEXTUAL EXPLANATION MODAL */}
          <AnimatePresence>
            {contextExplanation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl relative space-y-4"
                >
                  <button
                    onClick={() => setContextExplanation(null)}
                    className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" />
                    AI Teacher Explanation
                  </div>

                  <div className="space-y-3 text-xs text-slate-200">
                    <div className="p-3 rounded-xl bg-slate-800/80">
                      <span className="font-bold text-indigo-300 block mb-1">Explanation:</span>
                      <p className="leading-relaxed">{contextExplanation.englishExplanation}</p>
                    </div>

                    {contextExplanation.hindiExplanation && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
                        <span className="font-bold text-amber-300 block mb-1">🇮🇳 Hindi Meaning:</span>
                        <p className="leading-relaxed">{contextExplanation.hindiExplanation}</p>
                      </div>
                    )}

                    {contextExplanation.exampleSentence && (
                      <div className="p-3 rounded-xl bg-slate-800/50 italic text-slate-300">
                        <span className="font-bold text-slate-400 not-italic block mb-1">Example:</span>
                        "{contextExplanation.exampleSentence}"
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setContextExplanation(null)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition"
                  >
                    Got It! Continue Learning
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE B: CARTOON LIBRARY & DISCOVERY VIEW                                 */
        /* ========================================================================= */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                <Tv className="w-3.5 h-3.5" />
                AI English Cartoon Learning Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Learn English Through Cartoons
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Discover real YouTube animated cartoons, movie dialogues, and stories. Watch with continuous playback, learn from your AI Voice Teacher, and test yourself with custom quizzes!
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Cartoons
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recommended')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'recommended'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Recommended
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                My History ({learningHistory.length})
              </button>
            </div>
          </div>

          {/* SEARCH BAR & QUICK SUGGESTION CHIPS (Requirements 2 & 3) */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search English cartoons, stories, conversations, characters or topics..."
                className="w-full pl-12 pr-10 py-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Try:</span>
              {QUICK_SEARCH_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
                >
                  • {suggestion}
                </button>
              ))}
            </div>

            {/* FILTERS (Requirement 6) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Upper Intermediate">Upper Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Types</option>
                  <option value="Cartoon">Cartoon</option>
                  <option value="Animated Story">Animated Story</option>
                  <option value="Movie Scene">Movie Scene</option>
                  <option value="Conversation">Conversation</option>
                  <option value="Short Story">Short Story</option>
                  <option value="English Lesson">English Lesson</option>
                  <option value="Listening Practice">Listening Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Topic
                </label>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Topics</option>
                  <option value="Daily Life">Daily Life</option>
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="Friends">Friends</option>
                  <option value="Family">Family</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Work">Work</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Duration
                </label>
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">Any Duration</option>
                  <option value="Under 5 minutes">Under 5 minutes</option>
                  <option value="5–10 minutes">5–10 minutes</option>
                  <option value="10–20 minutes">10–20 minutes</option>
                  <option value="20+ minutes">20+ minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC FEATURED LESSON (HERO CARD - Requirement 7) */}
          {featuredLesson && activeTab !== 'history' && !searchQuery && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Thumbnail */}
                <div
                  onClick={() => handleSelectVideo(featuredLesson)}
                  className="md:col-span-5 relative group rounded-2xl overflow-hidden shadow-xl aspect-video cursor-pointer"
                >
                  <img
                    src={featuredLesson.thumbnail}
                    alt={featuredLesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                    <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-xs font-mono">
                    {featuredLesson.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Today's Featured Lesson
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {featuredLesson.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {featuredLesson.topic}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {featuredLesson.title}
                  </h2>
                  <p className="text-sm text-slate-300 line-clamp-3">
                    {featuredLesson.description}
                  </p>

                  {featuredLesson.coreVocabulary && (
                    <div className="flex flex-wrap gap-1.5 pt-1 text-xs text-amber-200">
                      <span className="font-semibold">Core Vocabulary:</span>
                      {featuredLesson.coreVocabulary.map((word, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                          {word}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectVideo(featuredLesson)}
                      className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Video Lesson Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC CARTOON GRID (Requirement 4) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                {activeTab === 'history'
                  ? 'Your Learning History'
                  : activeTab === 'recommended'
                  ? `Recommended for Your Level (${userLevel})`
                  : 'Explore Cartoons'}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {videos.length} videos found
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-white">Finding English cartoons...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
                <Tv className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-white font-bold text-base">No cartoons found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or filters. You can also paste any YouTube URL directly into the search bar!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => {
                  const isCompleted = learningHistory.some(h => h.videoId === video.videoId);

                  return (
                    <div
                      key={video.id || video.videoId}
                      className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 shadow-xl overflow-hidden flex flex-col transition duration-300"
                    >
                      {/* Thumbnail Container */}
                      <div
                        onClick={() => handleSelectVideo(video)}
                        className="relative aspect-video overflow-hidden cursor-pointer bg-slate-950"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                          <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center group-hover:scale-110 shadow-lg transition">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Top Pills */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white shadow">
                            {video.level}
                          </span>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow">
                              <Check className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>

                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono">
                          {video.duration}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                            <span className="text-amber-400 font-semibold">{video.topic}</span>
                            <span>•</span>
                            <span>{video.type}</span>
                          </div>

                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                            {video.title}
                          </h4>

                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {video.description}
                          </p>

                          {video.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {video.tags.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Channel & Watch CTA */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                            {video.channelTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectVideo(video)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 shadow"
                          >
                            Watch & Learn ➔
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LOAD MORE / PAGINATION (Requirement 5) */}
            {nextPageToken && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => fetchVideos(true)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white transition disabled:opacity-40"
                >
                  {loadingMore ? 'Loading more cartoons...' : 'Load More Cartoons ➔'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
