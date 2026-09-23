import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, Award, Calendar, Hash, User, Briefcase, ArrowLeft, Download, ExternalLink, Sparkles } from 'lucide-react';
import { certificateAPI } from '../utils/api';
import CertificateView from '../components/interview/CertificateView';
import EnglishCertificateView from '../components/english/EnglishCertificateView';

const CertificateVerificationPage = () => {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certData, setCertData] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const isEnglish = Boolean(
    certData?.isEnglishCertificate ||
    certData?.certificateId?.startsWith('CS-ENG') ||
    certData?.interviewType?.toLowerCase().includes('english') ||
    certData?.system?.toLowerCase().includes('english')
  );

  useEffect(() => {
    let isMounted = true;
    const verifyCert = async () => {
      if (!certificateId) {
        setError('No certificate ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await certificateAPI.verify(certificateId);
        if (isMounted) {
          setCertData(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Certificate verification error:', err);
          setError(err.message || 'Certificate record not found or could not be verified.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyCert();
    return () => {
      isMounted = false;
    };
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 text-slate-900 dark:text-white py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to CollabSphere</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
              CS
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">
              CollabSphere
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Verifying Certificate Credential...
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              Querying ID: {certificateId}
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-900/50 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-900">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Certificate Not Verified
            </h1>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-2 max-w-md mx-auto">
              {error}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">
              Please double check the Certificate ID in your link or ensure the candidate completed the full interview evaluation session.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow hover:opacity-90 transition-opacity"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}

        {/* Verified Certificate Details */}
        {!loading && certData && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Top Verification Status Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider text-emerald-100 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified & Authentic Credential
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    CollabSphere Certified Assessment
                  </h1>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-emerald-100 uppercase font-semibold">
                  Status
                </div>
                <div className="text-lg font-black text-white flex items-center sm:justify-end gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
                  Official / Valid
                </div>
              </div>
            </div>

            {/* Candidate & Assessment Metadata */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Candidate Name */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    <User className="w-4 h-4 text-indigo-500" />
                    Candidate Name
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {certData.candidateName || 'Candidate'}
                  </div>
                </div>

                {/* Class / Year */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    <Award className="w-4 h-4 text-indigo-500" />
                    Class / Year
                  </div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {certData.candidateClassYear || certData.classYear || 'General Candidate'}
                  </div>
                </div>

                {/* Target Role / Track */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    {isEnglish ? 'Certification Track' : 'Interview Role'}
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {certData.role}
                  </div>
                </div>

                {/* Interview / Assessment Type & Level */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    {isEnglish ? 'Proficiency Level' : 'Type & Difficulty'}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold">
                      {certData.interviewType || (isEnglish ? 'English Fluency Assessment' : 'Technical Interview')}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                      {certData.difficulty || certData.level}
                    </span>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    Overall Score
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {certData.overallScore}% Overall
                  </div>
                </div>

                {/* Date & Certificate ID */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    Completion Date
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {new Date(certData.completedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                    ID: {certData.certificateId}
                  </div>
                </div>
              </div>

              {/* Achievement Badge if present */}
              {certData.achievement && certData.achievement.earned && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 flex items-center justify-center text-2xl shrink-0">
                    {certData.achievement.badge || '🏆'}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      Distinction Earned
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {certData.achievement.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {certData.achievement.description}
                    </p>
                  </div>
                </div>
              )}

              {/* System Verification Notice */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  {isEnglish ? (
                    <>
                      <strong className="font-semibold block mb-0.5">
                        This credential was verified via CollabSphere's AI-Powered English Learning & Voice Practice System.
                      </strong>
                      The assessment validates spoken fluency, interactive conversational competence, grammatical structure, active listening comprehension, and professional communication standards.
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold block mb-0.5">
                        This interview was conducted using CollabSphere's AI-Powered Interview System.
                      </strong>
                      Assessment included role-specific interactive technical questioning, evaluation against production standards, concept clarity analysis, and objective criterion-based benchmarking.
                    </>
                  )}
                </div>
              </div>

              {/* Actions: View Certificate Preview Modal & Start Practice */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Official Certificate</span>
                </button>

                <Link
                  to={isEnglish ? "/english" : "/#interview"}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>{isEnglish ? "Practice English Speaking" : "Practice an Interview"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Certificate Preview Modal */}
      {showCertificateModal && certData && (
        isEnglish ? (
          <EnglishCertificateView
            certificate={{
              certificateId: certData.certificateId,
              candidateName: certData.candidateName,
              level: certData.level || certData.difficulty || 'Intermediate',
              score: certData.score || certData.overallScore || 85,
              issueDate: certData.completedAt || certData.issueDate || new Date().toISOString(),
              issuer: certData.issuer || 'CollabSphere Academy Certification Authority'
            }}
            onClose={() => setShowCertificateModal(false)}
          />
        ) : (
          <CertificateView
            certificateId={certData.certificateId}
            candidateName={certData.candidateName}
            classYear={certData.candidateClassYear || certData.classYear}
            role={certData.role}
            difficulty={certData.difficulty}
            interviewType={certData.interviewType}
            overallScore={certData.overallScore}
            placementReadiness={certData.placementReadiness}
            completedAt={certData.completedAt}
            achievement={certData.achievement}
            onClose={() => setShowCertificateModal(false)}
            isModal={true}
          />
        )
      )}
    </div>
  );
};

export default CertificateVerificationPage;
