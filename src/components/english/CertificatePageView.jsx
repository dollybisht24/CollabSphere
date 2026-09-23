import React from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import EnglishCertificateView from './EnglishCertificateView';

export default function CertificatePageView({
  profile,
  onOpenFinalAssessment
}) {
  const earnedCertificate = profile?.certificates && profile.certificates.length > 0
    ? profile.certificates[profile.certificates.length - 1]
    : null;

  if (earnedCertificate) {
    return (
      <div className="space-y-6">
        <EnglishCertificateView
          certificate={earnedCertificate}
          candidateName={profile?.fullName || 'Candidate'}
          level={earnedCertificate.level}
          score={earnedCertificate.score}
          certificateId={earnedCertificate.certificateId}
          issueDate={earnedCertificate.issueDate}
          isModal={false}
        />
      </div>
    );
  }

  // Pre-completion State
  const completedPhasesCount = profile?.phaseProgress?.filter(p => p.status === 'completed')?.length || 0;
  const overallSkillAvg = profile?.skillScores?.overall || 60;
  const isReadyForFinal = completedPhasesCount >= 3 || overallSkillAvg >= 65;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. HERO BANNER */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl">
          🎓
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            Official Certification Milestone
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Complete your learning journey to unlock your certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Earn your verified credential demonstrating English communication competency across reading, writing, listening, and conversational speaking.
          </p>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto pt-2 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Certificate Progress</span>
            <span className="text-purple-600 font-extrabold">{profile?.certificateProgress || 25}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-purple-600 transition-all duration-500"
              style={{ width: `${profile?.certificateProgress || 25}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. REQUIREMENTS CHECKLIST */}
      <div className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="font-extrabold text-slate-900 text-base">
          Certification Requirements Checklist
        </h3>

        <div className="space-y-3">
          {/* Requirement 1 */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                completedPhasesCount >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}>
                {completedPhasesCount >= 3 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : '1'}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Complete Key Learning Phases</h4>
                <p className="text-xs text-slate-500">Master at least 3 phases in your current level ({completedPhasesCount} completed)</p>
              </div>
            </div>
            <span className={`text-xs font-bold ${completedPhasesCount >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {completedPhasesCount >= 3 ? 'Satisfied ✓' : 'In Progress'}
            </span>
          </div>

          {/* Requirement 2 */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                overallSkillAvg >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}>
                {overallSkillAvg >= 60 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : '2'}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Balanced 6-Skill Proficiency</h4>
                <p className="text-xs text-slate-500">Maintain an overall score of 60%+ across reading, writing, listening, and speaking</p>
              </div>
            </div>
            <span className={`text-xs font-bold ${overallSkillAvg >= 60 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {overallSkillAvg}% Average
            </span>
          </div>

          {/* Requirement 3 */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Multi-Skill Final Assessment</h4>
                <p className="text-xs text-slate-500">Pass the comprehensive exit evaluation including the AI voice interview</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600">
              70%+ Required
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Ready to test your communication skills?
          </span>
          <button
            type="button"
            onClick={onOpenFinalAssessment}
            className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Take Final Assessment →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
