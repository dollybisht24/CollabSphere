import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Award,
  Headphones
} from 'lucide-react';
import toast from 'react-hot-toast';

const LISTENING_EXERCISES = {
  Beginner: [
    {
      id: 'lis-beg-1',
      title: 'Airport Flight Announcement',
      situation: 'Listening for gates, times, and destinations in a noisy public terminal',
      audioScript: 'Attention passengers on flight AI-402 to London Heathrow. Boarding has now commenced at Gate 18. Please have your boarding pass and passport ready for inspection. Families with small children may board first.',
      duration: '0:25',
      questions: [
        {
          id: 'lq-1',
          question: 'What is the flight number and destination mentioned?',
          options: ['AI-402 to London Heathrow', 'AI-204 to New York JFK', 'BA-402 to Paris', 'AI-402 to Singapore'],
          correctAnswer: 'AI-402 to London Heathrow',
          explanation: 'The announcement says: "Attention passengers on flight AI-402 to London Heathrow."'
        },
        {
          id: 'lq-2',
          question: 'Which gate is boarding taking place at?',
          options: ['Gate 18', 'Gate 80', 'Gate 8', 'Gate 28'],
          correctAnswer: 'Gate 18',
          explanation: 'Spoken clearly as "Gate 18".'
        },
        {
          id: 'lq-3',
          question: 'Who is invited to board first?',
          options: ['Families with small children', 'Business class only', 'Passengers with heavy luggage', 'Flight crew members'],
          correctAnswer: 'Families with small children',
          explanation: '"Families with small children may board first."'
        }
      ]
    },
    {
      id: 'lis-beg-2',
      title: 'Ordering Breakfast at the Diner',
      situation: 'Understanding customer requests and barista questions',
      audioScript: 'Good morning! Could I get two scrambled eggs with whole wheat toast and a warm cup of black coffee, please? And could you put the butter on the side?',
      duration: '0:20',
      questions: [
        {
          id: 'lq-4',
          question: 'How does the customer want their eggs cooked?',
          options: ['Scrambled', 'Sunny side up', 'Boiled', 'Poached'],
          correctAnswer: 'Scrambled',
          explanation: 'Customer requested "two scrambled eggs".'
        },
        {
          id: 'lq-5',
          question: 'Where should the butter be placed?',
          options: ['On the side', 'Melted on the toast', 'Inside the coffee', 'No butter at all'],
          correctAnswer: 'On the side',
          explanation: '"And could you put the butter on the side?"'
        }
      ]
    }
  ],
  Intermediate: [
    {
      id: 'lis-inter-1',
      title: 'Sprint Planning Meeting',
      situation: 'Technical workplace conversation regarding software delivery dates',
      audioScript: 'Team, our primary objective this sprint is finalizing the OAuth authentication flow. While the frontend wireframes are nearly finished, our backend database migration encountered unexpected schema conflicts. We must resolve this before deploying to the staging server on Thursday.',
      duration: '0:35',
      questions: [
        {
          id: 'lq-6',
          question: 'What is the primary objective of the current sprint?',
          options: ['Finalizing the OAuth authentication flow', 'Redesigning the company logo', 'Purchasing new office computers', 'Hiring three junior engineers'],
          correctAnswer: 'Finalizing the OAuth authentication flow',
          explanation: 'Stated directly as the primary objective.'
        },
        {
          id: 'lq-7',
          question: 'What caused the unexpected setback on the backend?',
          options: ['Schema conflicts during database migration', 'Lost internet access', 'Server hardware failure', 'Missing documentation'],
          correctAnswer: 'Schema conflicts during database migration',
          explanation: '"Our backend database migration encountered unexpected schema conflicts."'
        },
        {
          id: 'lq-8',
          question: 'When is the planned deployment to the staging server?',
          options: ['Thursday', 'Friday afternoon', 'Next Monday', 'Tomorrow morning'],
          correctAnswer: 'Thursday',
          explanation: '"Before deploying to the staging server on Thursday."'
        }
      ]
    }
  ],
  Advanced: [
    {
      id: 'lis-adv-1',
      title: 'Macroeconomic Keynote Analysis',
      situation: 'Fast-paced keynote on decentralized systems and financial volatility',
      audioScript: 'The current fiscal volatility underscores a structural pivot toward decentralized liquidity networks. Traditional monetary intermediaries must adapt to automated smart contract protocols that mitigate counterparty risk while demanding unprecedented transparency from institutional actors.',
      duration: '0:40',
      questions: [
        {
          id: 'lq-9',
          question: 'What do automated smart contract protocols mitigate according to the speaker?',
          options: ['Counterparty risk', 'All inflation risks', 'Hardware depreciation', 'Employment turnover'],
          correctAnswer: 'Counterparty risk',
          explanation: 'The speaker states protocols "mitigate counterparty risk".'
        },
        {
          id: 'lq-10',
          question: 'What is demanded from institutional actors in this paradigm?',
          options: ['Unprecedented transparency', 'Lower tax rates', 'Zero regulation', 'Secret transactions'],
          correctAnswer: 'Unprecedented transparency',
          explanation: '"Demanding unprecedented transparency from institutional actors."'
        }
      ]
    }
  ]
};

export default function ListeningLabView({ userLevel = 'Beginner' }) {
  const activeLevel = LISTENING_EXERCISES[userLevel] ? userLevel : 'Beginner';
  const exerciseList = LISTENING_EXERCISES[activeLevel] || LISTENING_EXERCISES.Beginner;

  const [selectedExercise, setSelectedExercise] = useState(exerciseList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handlePlayAudio = () => {
    if (!window.speechSynthesis) {
      toast.error('Audio playback not supported in this browser');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedExercise.audioScript);
    utterance.lang = 'en-US';
    utterance.rate = playbackSpeed;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectExercise = (ex) => {
    if (isPlaying) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedExercise(ex);
    setAnswers({});
    setSubmitted(false);
  };

  const handleSubmitAnswers = () => {
    setSubmitted(true);
    let correct = 0;
    selectedExercise.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    toast.success(`You scored ${correct} / ${selectedExercise.questions.length}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
          <Headphones className="w-3.5 h-3.5" /> Listening Lab
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Audio Comprehension & Natural Dialogue
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Train your ear to natural conversational cadence, diverse accents, and critical information retrieval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Exercise List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Audio Exercises ({activeLevel})
          </h3>
          <div className="space-y-2">
            {exerciseList.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex)}
                className={`w-full text-left p-4 rounded-2xl border transition ${
                  selectedExercise.id === ex.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-700 mb-1">
                  <span>{ex.duration}</span>
                  <span>{ex.questions.length} Questions</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{ex.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1">
                  {ex.situation}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Audio Player & Questions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player Card */}
          <div className="rounded-[28px] border border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Spoken Audio Track
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedExercise.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedExercise.situation}</p>
              </div>

              {/* Speed controls */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
                {[0.75, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1 rounded-lg transition ${
                      playbackSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Play Button */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handlePlayAudio}
                className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause Audio' : '▶ Play Audio Clip'}</span>
              </button>
              <span className="text-xs text-slate-500 font-medium">
                {isPlaying ? 'Listening in progress...' : 'Click to listen before answering'}
              </span>
            </div>
          </div>

          {/* Questions */}
          <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-7 shadow-sm space-y-6">
            <h3 className="text-base font-black text-slate-900">Comprehension Questions</h3>

            <div className="space-y-5">
              {selectedExercise.questions.map((q, idx) => (
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
                              ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
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
                onClick={handleSubmitAnswers}
                disabled={submitted || Object.keys(answers).length < selectedExercise.questions.length}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition disabled:opacity-40 shadow-sm"
              >
                {submitted ? 'Answers Evaluated' : 'Submit Answers →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
