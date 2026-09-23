import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Sparkles,
  Volume2,
  Mic,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Check,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { englishAPI } from '../../utils/api';

export default function DailyChallengeSection({ profile, onStreakUpdate }) {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // User input states
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState([]);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Result state
  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const res = await englishAPI.getDailyChallenge();
      setChallengeData(res);

      if (res.challenge?.items) {
        setSequenceOrder(res.challenge.items.map(i => i.id));
      }
    } catch (err) {
      console.error('Error loading daily challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const challenge = challengeData?.challenge;
  const alreadyCompleted = challengeData?.alreadyCompleted;

  // Web Speech API for Friday Speak Challenge
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Listening... Speak your thought!');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript(transcript);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  // Audio Playback for Thursday Listen Challenge
  const playAudio = (text) => {
    if (!window.speechSynthesis) {
      toast.error('Audio playback not supported');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setAudioPlaying(true);
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      let payloadAnswer = selectedAnswer;
      if (challenge?.type === 'story_sequence') {
        payloadAnswer = sequenceOrder;
      } else if (challenge?.type === 'speak_30s') {
        payloadAnswer = spokenTranscript;
      }

      const res = await englishAPI.submitDailyChallenge({
        challengeType: challenge?.type,
        userAnswer: payloadAnswer,
        spokenTranscript
      });

      setResult(res);
      if (res.isCorrect) {
        confetti({ particleCount: 70, spread: 50 });
        toast.success(`Challenge Completed! +${res.earnedXp} XP 🔥`);
      } else {
        toast.success(`Challenge Attempted! +${res.earnedXp} XP`);
      }

      if (onStreakUpdate && res.profile) {
        onStreakUpdate(res.profile);
      }
    } catch (err) {
      console.error('Error submitting daily challenge:', err);
      toast.error('Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Daily Fun Challenge • {challenge?.dayName || 'Today'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              +{challenge?.xpReward || 60} XP Reward
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 mt-2">
            {challenge?.title || 'Daily English Challenge'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {challenge?.description || 'Maintain your daily streak with today’s rotating English mini-game.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-2 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-800">Streak</div>
            <div className="text-base font-black text-amber-900 flex items-center justify-center gap-1">
              <span>{profile?.streak || challengeData?.currentStreak || 1}</span>
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* CHALLENGE BODY */}
      {!result && (
        <div className="space-y-5">
          {/* TYPE 1: MCQ (Find word, complete conversation, guess meaning, fix grammar) */}
          {(challenge?.type === 'find_word' || challenge?.type === 'complete_conversation' || challenge?.type === 'guess_meaning' || challenge?.type === 'fix_grammar') && (
            <div className="space-y-4">
              {challenge.sentence && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800">
                  {challenge.sentence}
                </div>
              )}

              {challenge.dialogue && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                  {challenge.dialogue.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <strong className="text-slate-900 shrink-0">{d.speaker}:</strong>
                      <span className="text-slate-700">{d.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {challenge.idiom && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="text-xs font-bold text-amber-800 uppercase">Idiom to Guess:</div>
                  <div className="text-base font-black text-amber-950">"{challenge.idiom}"</div>
                  <p className="text-xs text-amber-800/90 font-medium">Context: {challenge.contextSentence}</p>
                </div>
              )}

              {challenge.erroneousSentence && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="text-xs font-bold text-rose-800 uppercase">Identify and repair this error:</div>
                  <div className="text-sm font-semibold text-rose-950">"{challenge.erroneousSentence}"</div>
                </div>
              )}

              <div className="space-y-2">
                {challenge.options?.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAnswer(opt)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition ${
                      selectedAnswer === opt
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TYPE 2: LISTEN AND CHOOSE */}
          {challenge?.type === 'listen_choose' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-indigo-950">Spoken Announcement</h4>
                  <p className="text-xs text-indigo-700">Listen carefully and identify the speaker's main purpose.</p>
                </div>
                <button
                  type="button"
                  onClick={() => playAudio(challenge.audioText)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-700 transition"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{audioPlaying ? 'Playing...' : '▶ Listen'}</span>
                </button>
              </div>

              <div className="text-sm font-bold text-slate-800">{challenge.question}</div>

              <div className="space-y-2">
                {challenge.options?.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAnswer(opt)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition ${
                      selectedAnswer === opt
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TYPE 3: SPEAK FOR 30 SECONDS */}
          {challenge?.type === 'speak_30s' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs sm:text-sm font-semibold text-purple-950 leading-relaxed">
                {challenge.promptText}
              </div>

              <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-purple-600 text-white hover:scale-105'
                  }`}
                >
                  <Mic className="w-7 h-7" />
                </button>
                <div className="text-xs font-bold text-slate-800">
                  {isRecording ? 'Listening... Tap to stop' : 'Tap to Record Voice Response'}
                </div>
              </div>

              <textarea
                value={spokenTranscript}
                onChange={(e) => setSpokenTranscript(e.target.value)}
                placeholder="Spoken words appear here or type directly..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none resize-none"
              />
            </div>
          )}

          {/* TYPE 4: STORY SEQUENCE */}
          {challenge?.type === 'story_sequence' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">Click items in order to arrange the story:</p>
              <div className="space-y-2">
                {challenge.items?.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-medium text-slate-800 flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">Streak boosts your profile rating</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || (!selectedAnswer && !spokenTranscript && challenge?.type !== 'story_sequence')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-40 disabled:pointer-events-none shadow-sm"
            >
              {submitting ? 'Checking...' : 'Submit Daily Challenge →'}
            </button>
          </div>
        </div>
      )}

      {/* RESULT VIEW */}
      {result && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            {result.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <h4 className="text-sm font-bold text-slate-900">
              {result.isCorrect ? 'Challenge Mastered!' : 'Challenge Completed'}
            </h4>
            <span className="text-xs font-extrabold text-amber-600 ml-auto">
              +{result.earnedXp} XP Earned
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {result.feedback}
          </p>
        </div>
      )}
    </div>
  );
}
