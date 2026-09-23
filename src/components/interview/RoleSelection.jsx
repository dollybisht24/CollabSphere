import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Layers, Database, Cpu, ArrowRight, Sparkles, CheckCircle2,
  TrendingUp, Award, Clock, BarChart3
} from 'lucide-react';

export const rolesData = [
  {
    id: 'Frontend Developer',
    name: 'Frontend Developer',
    tagline: 'Client Architecture, Modern React & Performance',
    description: 'Master browser rendering mechanics, React component architecture, state management patterns, CSS responsive systems, and API integration.',
    icon: Code2,
    accent: 'from-blue-500/10 to-transparent',
    iconBg: 'bg-black text-white',
    focusAreas: [
      'HTML & CSS',
      'JavaScript (ES6+)',
      'DOM Mechanics',
      'React.js',
      'Responsive Design',
      'Browser Concepts',
      'API Integration',
      'Git / GitHub',
      'Frontend Performance'
    ],
    questionCounts: '5 - 20 Questions',
    levels: 'Beginner to Advanced'
  },
  {
    id: 'Full Stack Developer',
    name: 'Full Stack Developer',
    tagline: 'End-to-End Systems, APIs & Scalability',
    description: 'Master full-stack system architecture, client-server communication, relational and NoSQL databases, secure JWT authentication, and cloud deployment.',
    icon: Layers,
    accent: 'from-emerald-500/10 to-transparent',
    iconBg: 'bg-black text-white',
    focusAreas: [
      'Frontend (React)',
      'Backend (Node/Express)',
      'REST APIs',
      'Authentication (JWT/OAuth)',
      'Databases (SQL & NoSQL)',
      'Deployment & CI/CD',
      'System Fundamentals',
      'Performance Optimization'
    ],
    questionCounts: '5 - 20 Questions',
    levels: 'Beginner to Advanced'
  },
  {
    id: 'MERN Stack Developer',
    name: 'MERN Stack Developer',
    tagline: 'MongoDB, Express, React & Node Mastery',
    description: 'Comprehensive evaluation of MongoDB schema modeling, Express middleware pipelines, React hooks lifecycle, Node async event loops, and production MERN security.',
    icon: Database,
    accent: 'from-violet-500/10 to-transparent',
    iconBg: 'bg-black text-white',
    focusAreas: [
      'MongoDB & Aggregations',
      'Express.js Middleware',
      'React.js State & Hooks',
      'Node.js Event Loop',
      'RESTful CRUD APIs',
      'Authentication & RBAC',
      'Mongoose Schemas',
      'Cloud Deployment'
    ],
    questionCounts: '5 - 20 Questions',
    levels: 'Beginner to Advanced'
  },
  {
    id: 'AI/ML Developer',
    name: 'AI/ML Developer',
    tagline: 'Machine Learning, Deep Learning & GenAI',
    description: 'Prove your expertise in Python data pipelines, mathematical machine learning models, neural network architectures, Transformers, and production LLM/RAG pipelines.',
    icon: Cpu,
    accent: 'from-rose-500/10 to-transparent',
    iconBg: 'bg-black text-white',
    focusAreas: [
      'Python Data Science',
      'Machine Learning Algos',
      'Deep Learning & CNNs',
      'Data Preprocessing',
      'Model Evaluation Metrics',
      'Overfitting / Underfitting',
      'Neural Networks & PyTorch',
      'Generative AI & LLMs'
    ],
    questionCounts: '5 - 20 Questions',
    levels: 'Beginner to Advanced'
  }
];

const RoleSelection = ({ onSelectRole, onOpenHistory, onOpenProgress, historyCount = 0 }) => {
  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-[.18em] text-black/60 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Mock Interview Platform
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
            Choose Your Interview Role
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60 sm:text-base">
            Practice real technical, HR, and project-based questions with adaptive AI evaluation, detailed scorecards, and interview-ready feedback.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {onOpenProgress && historyCount > 0 && (
            <button
              onClick={onOpenProgress}
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-xs font-semibold text-black hover:border-black/30 hover:bg-neutral-50 transition shadow-xs"
            >
              <BarChart3 className="h-3.5 w-3.5 text-black/60" />
              <span>Progress Analytics</span>
            </button>
          )}

          {historyCount > 0 && (
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black hover:border-black/30 hover:bg-neutral-50 transition shadow-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Past Interviews</span>
              <span className="rounded-full bg-black text-white px-2 py-0.5 text-[10px] font-bold">
                {historyCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {rolesData.map((role) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={role.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.18 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/10 bg-white p-7 shadow-[0_4px_24px_rgba(0,0,0,.03)] hover:border-black/30 hover:shadow-[0_16px_46px_rgba(0,0,0,.08)] transition-all"
            >
              <div>
                {/* Top bar */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${role.iconBg} shadow-sm group-hover:scale-105 transition`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-black">
                        {role.name}
                      </h3>
                      <p className="text-xs font-medium text-black/50">
                        {role.tagline}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-black/60">
                    {role.levels}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm leading-6 text-black/70">
                  {role.description}
                </p>

                {/* Skill & Technology Focus Tags */}
                <div className="mt-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-black/45 mb-2">
                    Core Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.focusAreas.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-black/5 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-black/75 transition group-hover:bg-neutral-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-7 pt-5 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs text-black/50 font-medium">
                  {role.questionCounts}
                </span>

                <button
                  onClick={() => onSelectRole(role)}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
                >
                  <span>Start Interview</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Highlights Banner */}
      <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 sm:p-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-black/60 mb-4">
          Why Practice With CollabSphere AI
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-black">Adaptive Difficulty</p>
              <p className="text-xs text-black/60 mt-0.5">
                The AI dynamically increases or adjusts question complexity based on your answers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-black">Comprehensive Feedback</p>
              <p className="text-xs text-black/60 mt-0.5">
                Receive score breakdown, what you did well, missing points, and expected model answers.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-black shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-black">Voice Answering Enabled</p>
              <p className="text-xs text-black/60 mt-0.5">
                Speak your answers out loud with speech-to-text to simulate a real live interview call.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
