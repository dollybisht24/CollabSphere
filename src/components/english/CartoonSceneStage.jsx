import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Sparkles,
  Volume2,
  Tv,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sun,
  Smile
} from 'lucide-react';

/**
 * Animated Vector Character Rig Component
 * Features:
 * - Walking motion across X axis
 * - Animated walking bounce & leg swing
 * - Dynamic mouth speaking animation
 * - Arm gestures (waving, holding coffee, pointing, sitting)
 * - Blinking eyes & emotional expressions
 */
export function CartoonCharacter({
  id,
  name,
  role,
  avatar,
  color = '#4f46e5',
  action = 'idle',
  isSpeaking = false,
  xPosition = 20, // percentage of stage width
  direction = 'right', // 'right' | 'left'
  holdingProp = null, // 'coffee' | 'book' | 'notepad'
  isSeated = false
}) {
  const [blink, setBlink] = useState(false);

  // Natural blinking interval
  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3200 + Math.random() * 2000);
    return () => clearInterval(timer);
  }, []);

  const isWalking = action.includes('walk') || action.includes('carry');
  const isWaving = action.includes('wave') || action.includes('enter_wave');
  const isOrdering = action.includes('order') || action.includes('request');

  return (
    <motion.div
      className="absolute bottom-6 flex flex-col items-center select-none pointer-events-none z-20"
      initial={{ x: `${xPosition}%`, opacity: 0 }}
      animate={{
        x: `${xPosition}%`,
        opacity: 1,
        y: isWalking ? [0, -8, 0, -8, 0] : isSeated ? 22 : 0,
        scaleX: direction === 'left' ? -1 : 1
      }}
      transition={{
        x: { duration: 1.4, ease: 'easeInOut' },
        y: isWalking ? { repeat: Infinity, duration: 0.6, ease: 'linear' } : { duration: 0.5 }
      }}
    >
      {/* Speech Indicator Beacon if Speaking */}
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -top-16 bg-white/95 text-slate-900 border border-slate-200 px-3 py-1 rounded-full shadow-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap z-30 pointer-events-auto"
          style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'none' }}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-extrabold text-indigo-600">{name}</span> is speaking...
          <Volume2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        </motion.div>
      )}

      {/* Stylized Vector Character SVG Canvas */}
      <div className="relative w-28 h-48 flex items-end justify-center">
        {/* Shadow */}
        <motion.div
          animate={{ scale: isWalking ? [1, 0.85, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="absolute bottom-1 w-20 h-4 bg-black/20 rounded-full blur-[2px]"
        />

        {/* CHARACTER RIG SVG */}
        <svg
          viewBox="0 0 100 180"
          className="w-full h-full filter drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-body-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="skin-tone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="hair-brunette" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* LEGS */}
          {!isSeated ? (
            <g className="legs">
              {/* Left Leg */}
              <motion.line
                x1="42"
                y1="120"
                x2="38"
                y2="168"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
                animate={isWalking ? { x2: [34, 48, 34] } : { x2: 38 }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              {/* Left Shoe */}
              <motion.ellipse
                cx="36"
                cy="168"
                rx="8"
                ry="5"
                fill="#0f172a"
                animate={isWalking ? { cx: [32, 46, 32] } : { cx: 36 }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />

              {/* Right Leg */}
              <motion.line
                x1="58"
                y1="120"
                x2="62"
                y2="168"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
                animate={isWalking ? { x2: [66, 52, 66] } : { x2: 62 }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              {/* Right Shoe */}
              <motion.ellipse
                cx="64"
                cy="168"
                rx="8"
                ry="5"
                fill="#0f172a"
                animate={isWalking ? { cx: [68, 54, 68] } : { cx: 64 }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            </g>
          ) : (
            /* Seated Legs */
            <g className="legs-seated">
              <path
                d="M 44 118 L 40 142 L 56 148"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 56 118 L 54 142 L 70 148"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ellipse cx="58" cy="148" rx="7" ry="5" fill="#0f172a" />
              <ellipse cx="72" cy="148" rx="7" ry="5" fill="#0f172a" />
            </g>
          )}

          {/* TORSO / OUTFIT */}
          <g className="torso">
            {/* Main Coat / Jacket / Shirt */}
            <path
              d="M 32 72 Q 50 68 68 72 L 64 122 Q 50 125 36 122 Z"
              fill={`url(#grad-body-${id})`}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Shirt Collar */}
            <polygon points="50,70 42,84 50,88 58,84" fill="#ffffff" />
            <line x1="50" y1="88" x2="50" y2="120" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* LEFT ARM */}
          <motion.g
            animate={
              isWaving
                ? { rotate: [0, -35, 10, -35, 0], originX: '36px', originY: '74px' }
                : isWalking
                ? { rotate: [-20, 20, -20], originX: '36px', originY: '74px' }
                : { rotate: 0 }
            }
            transition={{ repeat: isWaving || isWalking ? Infinity : 0, duration: 0.7 }}
          >
            <path
              d="M 34 74 Q 24 96 28 116"
              fill="none"
              stroke={`url(#grad-body-${id})`}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle cx="28" cy="116" r="5" fill="#fcd34d" />
          </motion.g>

          {/* RIGHT ARM & HELD PROP */}
          <motion.g
            animate={
              holdingProp === 'coffee' || isOrdering
                ? { rotate: [-15, -25, -15], originX: '64px', originY: '74px' }
                : isWalking
                ? { rotate: [20, -20, 20], originX: '64px', originY: '74px' }
                : { rotate: 0 }
            }
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            <path
              d={holdingProp === 'coffee' || isOrdering ? 'M 64 74 Q 78 88 74 104' : 'M 64 74 Q 72 96 68 116'}
              fill="none"
              stroke={`url(#grad-body-${id})`}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle
              cx={holdingProp === 'coffee' || isOrdering ? 74 : 68}
              cy={holdingProp === 'coffee' || isOrdering ? 104 : 116}
              r="5"
              fill="#fcd34d"
            />

            {/* Held Coffee Cup */}
            {(holdingProp === 'coffee' || isOrdering) && (
              <g transform="translate(68, 92)">
                <path d="M 0 4 L 14 4 L 12 18 L 2 18 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M 12 7 Q 17 7 17 11 Q 17 15 12 15" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Steaming effect */}
                <motion.path
                  d="M 4 2 Q 7 -3 5 -8"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ y: [-1, -5, -1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
                <motion.path
                  d="M 9 2 Q 12 -3 10 -8"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ y: [-1, -6, -1], opacity: [0.3, 0.9, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.4, delay: 0.3 }}
                />
              </g>
            )}
          </motion.g>

          {/* HEAD & FACE */}
          <g className="head">
            {/* Neck */}
            <rect x="46" y="60" width="8" height="14" fill="#fcd34d" rx="2" />

            {/* Face Oval */}
            <ellipse cx="50" cy="42" rx="18" ry="22" fill="url(#skin-tone)" />

            {/* Hair Style */}
            {name === 'Emma' ? (
              // Emma: Long styled hair
              <path
                d="M 30 38 C 30 18, 70 18, 70 38 C 72 50, 68 64, 66 68 C 62 48, 54 32, 50 32 C 46 32, 38 48, 34 68 C 32 64, 28 50, 30 38 Z"
                fill="url(#hair-brunette)"
              />
            ) : name === 'Waiter' ? (
              // Waiter: Chef / Barista hat
              <g>
                <path d="M 32 30 Q 50 14 68 30 Z" fill="#334155" />
                <path d="M 30 30 L 70 30 L 68 24 L 32 24 Z" fill="#0f172a" />
              </g>
            ) : (
              // Alex / Rohan: Short modern haircut
              <path
                d="M 32 34 C 32 18, 68 18, 68 34 C 64 26, 56 22, 50 22 C 44 22, 36 26, 32 34 Z"
                fill="#1e1b4b"
              />
            )}

            {/* Eyebrows */}
            <motion.line
              x1="38"
              y1="34"
              x2="45"
              y2="34"
              stroke="#451a03"
              strokeWidth="2"
              strokeLinecap="round"
              animate={isSpeaking ? { y1: [34, 32, 34] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
            <motion.line
              x1="55"
              y1="34"
              x2="62"
              y2="34"
              stroke="#451a03"
              strokeWidth="2"
              strokeLinecap="round"
              animate={isSpeaking ? { y1: [34, 32, 34] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />

            {/* Eyes (With Blinking Animation) */}
            {!blink ? (
              <g>
                <circle cx="42" cy="40" r="3.2" fill="#0f172a" />
                <circle cx="43" cy="39" r="1" fill="#ffffff" />
                <circle cx="58" cy="40" r="3.2" fill="#0f172a" />
                <circle cx="59" cy="39" r="1" fill="#ffffff" />
              </g>
            ) : (
              <g>
                <line x1="39" y1="40" x2="45" y2="40" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="55" y1="40" x2="61" y2="40" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
              </g>
            )}

            {/* Cheeks Blush */}
            <circle cx="37" cy="47" r="3.5" fill="#f43f5e" opacity="0.35" />
            <circle cx="63" cy="47" r="3.5" fill="#f43f5e" opacity="0.35" />

            {/* Mouth (Viseme Animation during Speaking) */}
            {isSpeaking ? (
              <motion.ellipse
                cx="50"
                cy="52"
                rx="4"
                ry="4"
                fill="#881337"
                animate={{ ry: [2, 5, 2], rx: [3, 4.5, 3] }}
                transition={{ repeat: Infinity, duration: 0.28 }}
              />
            ) : (
              <path
                d="M 45 50 Q 50 56 55 50"
                fill="none"
                stroke="#881337"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}
          </g>
        </svg>

        {/* Character Label Tag */}
        <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-black tracking-wide border border-white/20 shadow-md">
          {name}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Stage Environment Backgrounds
 * High-detail animated SVG backdrops for Café, Park, Boardroom, and Library
 */
export function StageEnvironment({ theme = 'cafe', sceneAction = '' }) {
  if (theme === 'cafe') {
    return (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200/90">
        {/* Warm Café Back Wall & Paneling */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20 border-b border-amber-900/10">
          {/* Subtle Brick / Wood slats */}
          <div className="w-full h-full opacity-15 flex flex-col justify-between py-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-px w-full bg-amber-950" />
            ))}
          </div>
        </div>

        {/* Left Side: Café Entrance Door with Glass & "OPEN" Bell */}
        <div className="absolute left-6 top-8 w-24 h-64 rounded-t-xl border-4 border-amber-900/40 bg-sky-200/50 backdrop-blur-sm shadow-inner overflow-hidden">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded tracking-widest shadow">
            OPEN
          </div>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-amber-400 border border-amber-600 animate-pulse" />
          {/* Glass glare line */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none" />
        </div>

        {/* Center: Ordering Counter with Coffee Machine */}
        <div className="absolute left-1/3 top-28 w-44 h-36 bg-gradient-to-b from-amber-900 to-amber-950 rounded-t-2xl shadow-2xl border-t-4 border-amber-700/60 z-10">
          {/* Counter Top Surface */}
          <div className="h-5 w-full bg-amber-800 rounded-t-xl border-b border-amber-950 flex items-center justify-between px-3">
            <span className="text-[8px] font-bold uppercase tracking-wider text-amber-200">
              Sunshine Counter
            </span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>

          {/* Espresso Machine on Counter */}
          <div className="absolute -top-12 left-4 w-16 h-14 bg-slate-800 rounded-md border border-slate-700 p-1 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-center text-[7px] text-emerald-400 font-mono">
              <span>92°C</span>
              <span>READY</span>
            </div>
            {/* Steam nozzels */}
            <div className="flex justify-around items-end h-4">
              <div className="w-1.5 h-3 bg-slate-400 rounded-sm" />
              <div className="w-1.5 h-3 bg-slate-400 rounded-sm" />
            </div>
            {/* Animated Coffee Steam */}
            <motion.div
              animate={{ y: [-2, -10, -2], opacity: [0.7, 0.1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-4 left-5 w-6 h-4 flex justify-center text-slate-300 text-xs"
            >
              ☁️
            </motion.div>
          </div>

          {/* Pastry Display Case */}
          <div className="absolute -top-10 right-3 w-16 h-12 bg-white/40 border-2 border-white/60 rounded-md shadow flex items-center justify-around p-1">
            <span className="text-sm">🧁</span>
            <span className="text-sm">🥐</span>
          </div>
        </div>

        {/* Right Side: Cozy Window with Sunlight & Table */}
        <div className="absolute right-6 top-6 w-52 h-56 rounded-t-full border-4 border-amber-900/30 bg-gradient-to-b from-sky-300 to-amber-100/60 overflow-hidden shadow-inner">
          {/* Animated Sky Cloud */}
          <motion.div
            animate={{ x: [-20, 180] }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="text-white/80 text-xl absolute top-6"
          >
            ☁️
          </motion.div>
          {/* Sun Rays */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-yellow-300/40 blur-xl" />
          {/* Window Panes Grid */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="border-r border-b border-amber-900/20" />
            <div className="border-b border-amber-900/20" />
            <div className="border-r border-amber-900/20" />
            <div />
          </div>
        </div>

        {/* Dining Table by Window */}
        <div className="absolute right-12 bottom-6 w-36 h-24 z-15">
          {/* Table Top */}
          <div className="w-36 h-8 bg-gradient-to-r from-amber-800 to-amber-900 rounded-full shadow-lg border border-amber-700/50 flex items-center justify-center gap-4">
            <span className="text-xs">☕</span>
            <span className="text-xs">🧁</span>
          </div>
          {/* Table Stand */}
          <div className="mx-auto w-3 h-16 bg-amber-950" />
          <div className="mx-auto w-16 h-3 bg-amber-950 rounded-full shadow" />
        </div>

        {/* Hanging Warm Pendant Lights */}
        <div className="absolute top-0 left-1/4 flex flex-col items-center">
          <div className="w-0.5 h-16 bg-slate-900" />
          <div className="w-7 h-5 bg-amber-400 rounded-b-full shadow-[0_0_25px_rgba(251,191,36,0.8)] border border-amber-600" />
        </div>
        <div className="absolute top-0 right-1/4 flex flex-col items-center">
          <div className="w-0.5 h-12 bg-slate-900" />
          <div className="w-7 h-5 bg-amber-400 rounded-b-full shadow-[0_0_25px_rgba(251,191,36,0.8)] border border-amber-600" />
        </div>

        {/* Polished Wooden Floor */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-amber-950 via-amber-900 to-amber-800/80 border-t-2 border-amber-700/30">
          <div className="h-full w-full opacity-10 flex justify-between">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-px h-full bg-black" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'park') {
    return (
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-sky-300 via-emerald-100 to-emerald-300">
        {/* Soft Moving Clouds */}
        <motion.div
          animate={{ x: [-40, 400] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          className="text-white text-3xl absolute top-6"
        >
          ☁️
        </motion.div>
        {/* Sun */}
        <div className="absolute top-6 right-12 w-16 h-16 rounded-full bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.8)] animate-pulse" />

        {/* Lush Park Trees in Background */}
        <div className="absolute bottom-16 inset-x-0 flex justify-around opacity-90">
          <span className="text-7xl -mb-2">🌳</span>
          <span className="text-8xl -mb-4">🌲</span>
          <span className="text-7xl -mb-2">🌳</span>
          <span className="text-8xl -mb-4">🌲</span>
        </div>

        {/* Park Bench under Tree */}
        <div className="absolute right-24 bottom-14 z-10 text-center">
          <div className="w-24 h-4 bg-amber-900 rounded-md shadow" />
          <div className="flex justify-between px-3">
            <div className="w-2 h-8 bg-slate-900" />
            <div className="w-2 h-8 bg-slate-900" />
          </div>
        </div>

        {/* Cobblestone Walking Pathway */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-r from-amber-200 via-stone-300 to-amber-200 border-t-2 border-emerald-600/30 shadow-inner" />
      </div>
    );
  }

  // Fallback Modern Boardroom / Classroom
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-800 via-slate-900 to-indigo-950 text-white">
      {/* City Skyline through Window */}
      <div className="absolute top-0 inset-x-0 h-36 opacity-30 flex items-end justify-around">
        <div className="w-16 h-28 bg-slate-600" />
        <div className="w-20 h-34 bg-slate-500" />
        <div className="w-14 h-24 bg-slate-600" />
        <div className="w-24 h-36 bg-slate-400" />
      </div>

      {/* Modern Presentation Screen */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-36 bg-indigo-950/80 border-2 border-indigo-400/40 rounded-xl shadow-2xl p-3 flex flex-col justify-between">
        <div className="flex justify-between text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
          <span>Key Project Goals</span>
          <span className="text-emerald-400">88% Complete</span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-3/4 bg-indigo-400/40 rounded" />
          <div className="h-2 w-1/2 bg-indigo-400/30 rounded" />
          <div className="h-2 w-5/6 bg-indigo-400/50 rounded" />
        </div>
      </div>

      {/* Conference Table */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-900 border-t-2 border-slate-700/60 shadow-2xl" />
    </div>
  );
}

/**
 * Main Cinematic Animated Cartoon Scene Stage Component
 * Orchestrates:
 * - Selected scenic environment (Café, Park, Boardroom, Library)
 * - Animated character rigs with positional movement, speech visibility, and action cues
 * - Scene action captions and audio speech indicator
 * - Support for future video / Lottie assets (Requirement 19)
 */
export default function CartoonSceneStage({
  scene,
  characters = [],
  activeSpeaker = null,
  isNarrationPlaying = false,
  onReplayScene,
  className = ''
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If a real video or Lottie asset is attached to this scene in the future, render it directly
  if (scene?.videoUrl) {
    return (
      <div className={`relative w-full rounded-3xl overflow-hidden bg-black shadow-2xl ${className}`}>
        <video
          src={scene.videoUrl}
          autoPlay
          controls
          className="w-full h-[400px] object-cover"
        />
      </div>
    );
  }

  // Derive active action cues from the current scene
  const actionCue = scene?.actionCue || scene?.action || 'idle';
  const backgroundTheme = scene?.background || 'cafe';

  // Determine dynamic character positions and states based on scene action
  const getCharacterState = (char) => {
    const charName = (char.name || '').toLowerCase();
    const isSpeaking = activeSpeaker?.toLowerCase() === charName || (activeSpeaker === 'Narrator' && charName === 'emma');

    if (backgroundTheme === 'cafe') {
      if (charName === 'emma') {
        if (actionCue === 'emma_walk_in') {
          return { x: 26, action: 'walk_in', direction: 'right', holdingProp: null, isSeated: false };
        }
        if (actionCue === 'talk_to_waiter' || actionCue === 'approach_counter') {
          return { x: 38, action: 'talk', direction: 'right', holdingProp: null, isSeated: false };
        }
        if (actionCue === 'order_coffee' || actionCue === 'emma_orders') {
          return { x: 42, action: 'order', direction: 'right', holdingProp: 'coffee', isSeated: false };
        }
        if (actionCue === 'sit_at_table' || actionCue === 'carry_cup_walk') {
          return { x: 74, action: 'sit', direction: 'left', holdingProp: 'coffee', isSeated: true };
        }
        if (actionCue === 'talk_with_alex') {
          return { x: 74, action: 'talk', direction: 'left', holdingProp: 'coffee', isSeated: true };
        }
        return { x: 40, action: 'idle', direction: 'right', holdingProp: null, isSeated: false };
      }

      if (charName === 'waiter') {
        const isInteracting = actionCue.includes('waiter') || actionCue.includes('order');
        return {
          x: 48,
          action: isInteracting ? 'serve' : 'idle',
          direction: 'left',
          holdingProp: null,
          isSeated: false
        };
      }

      if (charName === 'alex') {
        if (actionCue === 'talk_with_alex' || actionCue === 'alex_enter_wave') {
          return { x: 62, action: 'enter_wave', direction: 'right', holdingProp: null, isSeated: true };
        }
        return { x: 10, action: 'walk', direction: 'right', holdingProp: null, isSeated: false };
      }
    }

    // Default character layout
    return {
      x: 35 + characters.indexOf(char) * 25,
      action: isSpeaking ? 'talk' : 'idle',
      direction: characters.indexOf(char) % 2 === 0 ? 'right' : 'left',
      holdingProp: null,
      isSeated: false
    };
  };

  return (
    <div
      className={`relative w-full rounded-[32px] overflow-hidden border-2 border-slate-900/10 shadow-2xl min-h-[380px] sm:min-h-[440px] flex flex-col justify-between ${className}`}
    >
      {/* 1. SCENIC ENVIRONMENT BACKDROP */}
      <StageEnvironment theme={backgroundTheme} sceneAction={actionCue} />

      {/* 2. TOP CINEMATIC HEADER BAR */}
      <div className="relative z-30 p-5 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-black tracking-wide shadow-md border border-white/10">
            <Tv className="w-3.5 h-3.5 text-rose-400" />
            <span>Scene {scene?.sceneNumber || 1}: {scene?.title || 'Story Scene'}</span>
          </span>
          {scene?.setting && (
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-sm border border-black/5">
              📍 {scene.setting}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onReplayScene && (
            <button
              type="button"
              onClick={onReplayScene}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-800 backdrop-blur-sm shadow-sm border border-black/5 transition hover:scale-105 active:scale-95"
              title="Replay scene animation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. ACTIVE CHARACTERS STAGE */}
      <div className="relative flex-1 w-full overflow-hidden">
        {characters.map((char) => {
          const charState = getCharacterState(char);
          const isSpeaking = activeSpeaker?.toLowerCase() === char.name.toLowerCase();

          return (
            <CartoonCharacter
              key={char.id || char.name}
              id={char.id || char.name}
              name={char.name}
              role={char.role}
              avatar={char.avatar}
              color={char.color || '#4f46e5'}
              action={charState.action}
              isSpeaking={isSpeaking && isNarrationPlaying}
              xPosition={charState.x}
              direction={charState.direction}
              holdingProp={charState.holdingProp}
              isSeated={charState.isSeated}
            />
          );
        })}
      </div>

      {/* 4. BOTTOM ACTION HIGHLIGHT TICKER */}
      <div className="relative z-30 p-4 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent flex items-center justify-between text-xs text-white pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-extrabold uppercase tracking-wider text-[10px] text-rose-300">
            Action:
          </span>
          <span className="font-semibold text-white/90">
            {scene?.actionCue?.replace(/_/g, ' ') || 'Characters interacting in scene'}
          </span>
        </div>

        {isNarrationPlaying && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Voice Playing</span>
          </div>
        )}
      </div>
    </div>
  );
}
