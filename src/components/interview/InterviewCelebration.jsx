import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles, Award, ArrowRight, RotateCcw, Calendar, CheckCircle2,
  TrendingUp, Compass, ShieldCheck, Download, History, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateFeedbackReportPDF } from '../../utils/pdfGenerator';
import CertificateView from './CertificateView';

const InterviewCelebration = ({
  session,
  summary,
  questions = session?.questions || [],
  onViewReport,
  onTryAdvanced,
  onPracticeAgain,
  onViewHistory
}) => {
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const overallScore = summary?.overallScore || 0;
  const achievement = summary?.achievement;
  const badgeEmoji = achievement?.badge || '🏆';
  const achievementTitle = achievement?.title || 'Interview Champion';
  const roleName = session?.role || 'Developer';
  const difficulty = session?.difficulty || 'Intermediate';
  const interviewType = session?.interviewType || 'Technical Interview';
  const certificateId = session?.certificateId || 'CS-INT-2026-X9A21';
  const candidateName = session?.candidateName || session?.candidate?.name || 'Candidate';
  const candidateEmail = session?.candidateEmail || session?.candidate?.email || '';
  const classYear = session?.candidateClassYear || session?.candidate?.classYear || '';
  const placementReadiness = summary?.placementReadiness || 'Placement Ready';
  const currentDate = new Date(session?.completedAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 350);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('Confetti effect failed', e);
    }
  }, []);

  const handleDownloadReport = async () => {
    if (isDownloadingReport) return;
    setIsDownloadingReport(true);
    const toastId = toast.loading('Generating comprehensive interview feedback report PDF...');
    try {
      await generateFeedbackReportPDF({
        session,
        summary,
        questions,
        candidateName,
        candidateEmail,
        candidateClassYear: classYear,
        certificateId
      });
      toast.success('Feedback report downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Download report error:', err);
      toast.error('Failed to generate PDF report. Please try again.', { id: toastId });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto space-y-8"
        style={{ fontFamily: 'inherit' }}
      >
        <div className="rounded-3xl border border-black/10 bg-white p-8 sm:p-12 shadow-xl text-center space-y-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Header Titles */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Placement Readiness: {placementReadiness}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Congratulations, {candidateName}!
            </h1>
            <p className="text-base sm:text-lg font-medium text-black/75">
              You Successfully Completed the Interview
            </p>
          </div>

          {/* Attractive Achievement Badge */}
          <div className="relative z-10 max-w-lg mx-auto rounded-3xl border border-black/10 bg-neutral-50/80 p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-black text-white text-4xl mx-auto shadow-md">
              {badgeEmoji}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-black/45 uppercase tracking-wider block">
                Achievement Unlocked
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-black">
                {achievementTitle}
              </h2>
            </div>

            <blockquote className="text-xs sm:text-sm text-black/70 italic leading-relaxed border-t border-black/5 pt-3">
              "{achievement?.earnedReason || achievement?.description || 'Congratulations! You demonstrated strong technical knowledge and interview performance.'}"
            </blockquote>
          </div>

          {/* Personalized Metadata Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Candidate Name</span>
              <span className="text-xs font-bold text-black truncate block">{candidateName}</span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Class / Year</span>
              <span className="text-xs font-bold text-indigo-700 truncate block">{classYear || 'General Candidate'}</span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Interview Role</span>
              <span className="text-xs font-bold text-black truncate block">{roleName}</span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Interview Type</span>
              <span className="text-xs font-bold text-black truncate block">{interviewType}</span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Difficulty</span>
              <span className="text-xs font-bold text-black block">{difficulty}</span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Overall Score</span>
              <span className="text-base font-bold text-black block">{overallScore}%</span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Readiness</span>
              <span className="text-xs font-bold text-emerald-800 truncate block">{placementReadiness}</span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider block">Certificate ID</span>
              <span className="text-xs font-mono font-bold text-indigo-700 truncate block">{certificateId}</span>
            </div>
          </div>

          {/* 6 Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary Row: View Full Report, Download Feedback Report, Download Certificate */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onViewReport}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-neutral-800 transition shadow-md"
              >
                <span>View Full Report</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleDownloadReport}
                disabled={isDownloadingReport}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-3 text-xs sm:text-sm font-bold transition shadow-sm disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloadingReport ? 'Generating Report...' : 'Download Feedback Report'}</span>
              </button>

              <button
                onClick={() => setShowCertificateModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-3 text-xs sm:text-sm font-bold transition shadow-md shadow-amber-600/20"
              >
                <Award className="h-4 w-4" />
                <span>Download Certificate</span>
              </button>
            </div>

            {/* Secondary Row: Try Advanced Interview, Practice Again, View Interview History */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onTryAdvanced}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-50 transition shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-black/60" />
                <span>Try Advanced Interview</span>
              </button>

              <button
                onClick={onPracticeAgain}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-50 transition shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 text-black/60" />
                <span>Practice Again</span>
              </button>

              {onViewHistory && (
                <button
                  onClick={onViewHistory}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-50 transition shadow-xs"
                >
                  <History className="h-3.5 w-3.5 text-black/60" />
                  <span>View Interview History</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateView
          session={session}
          candidateName={candidateName}
          classYear={classYear}
          role={roleName}
          difficulty={difficulty}
          interviewType={interviewType}
          overallScore={overallScore}
          placementReadiness={placementReadiness}
          certificateId={certificateId}
          completedAt={session?.completedAt}
          achievement={achievement}
          onClose={() => setShowCertificateModal(false)}
          isModal={true}
        />
      )}
    </>
  );
};

export default InterviewCelebration;
