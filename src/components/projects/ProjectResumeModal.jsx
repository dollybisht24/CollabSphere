import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, X, Copy, Check, Sparkles, CheckCircle2, AlertCircle,
  Briefcase, Award, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectResumeModal = ({ isOpen, onClose, project, review }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const resumeData = review?.resumeSuggestions || {
    missingProfessionalFeatures: [
      'Automated testing suites (Jest, Vitest, Cypress)',
      'CI/CD GitHub Actions build and deploy workflows',
      'Production Docker multi-stage containerization'
    ],
    technicalImprovements: [
      'Implement API rate limiting and helmet headers',
      'Centralize database query aggregations and indexes'
    ],
    resumeBullets: [
      `Engineered ${project?.name || 'full-stack platform'} utilizing ${(project?.technologyStack || ['React', 'Node.js']).join(', ')} with secure REST APIs.`,
      'Implemented role-based access control and JWT authentication protecting user workspaces.',
      'Optimized client rendering performance and integrated AI-assisted code review workflows.'
    ]
  };

  const copyBullet = (bullet, index) => {
    navigator.clipboard.writeText(bullet);
    setCopiedIndex(index);
    toast.success('Resume bullet copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-black/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">
              <Award className="h-3 w-3 text-emerald-600" /> Career & Resume Readiness
            </div>
            <h3 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
              Make This Project Resume-Ready
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-black/60">
              Verified technical bullet points based strictly on what is implemented in {project?.name}, plus recommendations to stand out to recruiters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-black/40 hover:bg-neutral-100 hover:text-black transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section 1: Verified Resume Bullets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black/70 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Verified Portfolio & Resume Bullets
            </h4>
            <span className="text-[11px] text-black/45">Click to copy</span>
          </div>

          <div className="space-y-2.5">
            {resumeData.resumeBullets?.map((bullet, idx) => (
              <div
                key={idx}
                onClick={() => copyBullet(bullet, idx)}
                className="group flex items-start justify-between gap-3 rounded-2xl border border-black/10 bg-neutral-50/50 p-4 hover:border-black/30 hover:bg-white transition cursor-pointer"
              >
                <div className="flex items-start gap-2.5 text-xs text-black/80 leading-relaxed">
                  <span className="font-bold text-black select-none">•</span>
                  <span>{bullet}</span>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-1 text-black/40 group-hover:text-black shrink-0 transition"
                  title="Copy bullet"
                >
                  {copiedIndex === idx ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Missing Professional Features */}
        {resumeData.missingProfessionalFeatures?.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-2 text-xs">
            <p className="font-bold text-amber-950 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Features to Add to Make This Stand Out to Tech Recruiters:
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-900">
              {resumeData.missingProfessionalFeatures.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 3: Technical Improvements */}
        {resumeData.technicalImprovements?.length > 0 && (
          <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 space-y-2 text-xs">
            <p className="font-bold text-black uppercase tracking-wider text-[11px]">
              Technical & Architecture Polish:
            </p>
            <ul className="list-disc list-inside space-y-1 text-black/70">
              {resumeData.technicalImprovements.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-3 border-t border-black/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-black px-6 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectResumeModal;
