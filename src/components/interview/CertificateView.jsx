import React, { useState, useEffect, useRef } from 'react';
import { Download, Check, Copy, ExternalLink, Award, ShieldCheck, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateQRCodeDataUrl, downloadCertificatePDF } from '../../utils/pdfGenerator';

const CertificateView = ({
  session,
  candidateName = session?.candidateName || session?.candidate?.name || 'Candidate',
  classYear = session?.candidateClassYear || session?.candidate?.classYear || '',
  role = session?.role || 'Frontend Developer',
  difficulty = session?.difficulty || 'Intermediate',
  interviewType = session?.interviewType || 'Technical Interview',
  overallScore = session?.summary?.overallScore ?? 80,
  placementReadiness = session?.summary?.placementReadiness || 'Placement Ready',
  certificateId = session?.certificateId || 'CS-INT-2026-X9A21',
  completedAt = session?.completedAt || session?.updatedAt || new Date().toISOString(),
  achievement = session?.summary?.achievement,
  onClose,
  isModal = true
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const certificateRef = useRef(null);

  const formattedDate = new Date(completedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/certificate/${certificateId}`
    : `/verify/certificate/${certificateId}`;

  useEffect(() => {
    let isMounted = true;
    generateQRCodeDataUrl(verificationUrl).then((url) => {
      if (isMounted && url) {
        setQrCodeUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [verificationUrl]);

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading) return;
    setIsDownloading(true);
    const toastId = toast.loading('Rendering high-resolution certificate PDF...');
    try {
      await downloadCertificatePDF(certificateRef.current, {
        certificateId,
        candidateName
      });
      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Download certificate error:', err);
      toast.error('Failed to download certificate. Please try again.', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast.success('Certificate verification link copied!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Could not copy link');
    }
  };

  const certificateBody = (
    <div className="flex flex-col items-center w-full">
      {/* Top Action Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-4 px-2 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Official Interview Credential
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {certificateId}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified by CollabSphere AI Assessment Committee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Verification Link'}</span>
          </button>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify Online</span>
          </a>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close certificate preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Certificate Print-Ready Canvas (Fixed Landscape Aspect Ratio for PDF capture) */}
      <div className="w-full overflow-x-auto pb-4 flex justify-center">
        <div
          ref={certificateRef}
          id="collabsphere-certificate"
          style={{
            width: '1000px',
            minWidth: '1000px',
            height: '707px',
            boxSizing: 'border-box'
          }}
          className="relative bg-gradient-to-br from-amber-50/40 via-white to-slate-50 p-10 border-[10px] border-slate-900 rounded-2xl shadow-2xl flex flex-col justify-between select-none"
        >
          {/* Inner Decorative Gold/Navy Frame */}
          <div className="absolute inset-3 border-2 border-amber-500/60 rounded-xl pointer-events-none" />
          <div className="absolute inset-5 border border-slate-200 pointer-events-none" />

          {/* Corner Flourishes */}
          <div className="absolute top-7 left-7 w-8 h-8 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute top-7 right-7 w-8 h-8 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-7 left-7 w-8 h-8 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-7 right-7 w-8 h-8 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

          {/* Background Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <span className="text-[320px] font-serif font-black tracking-widest text-slate-900">CS</span>
          </div>

          {/* Header Section */}
          <div className="relative z-10 text-center pt-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-amber-300 font-black shadow-md border border-amber-400/40">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-lg font-black tracking-wider text-slate-900 uppercase font-serif">
                  CollabSphere Academy
                </div>
                <div className="text-[10px] tracking-[0.25em] text-indigo-600 uppercase font-semibold">
                  Engineering Assessment & Certification Authority
                </div>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-extrabold tracking-[0.3em] uppercase text-amber-700 bg-amber-100/70 border border-amber-300/60 px-4 py-1 rounded-full inline-block">
                Certificate of Interview Completion
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">
              This is to certify that
            </p>
          </div>

          {/* Candidate Name, Class / Year & Interview Scope */}
          <div className="relative z-10 text-center my-auto py-2">
            <h1
              className="text-4xl font-serif font-black text-slate-900 tracking-wide uppercase underline decoration-amber-500/50 decoration-2 underline-offset-8"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {candidateName}
            </h1>

            {classYear && (
              <div className="text-sm font-extrabold uppercase tracking-widest text-indigo-700 mt-2 font-sans">
                {classYear}
              </div>
            )}

            <p className="max-w-2xl mx-auto text-xs text-slate-600 leading-relaxed mt-3 font-normal">
              has successfully completed the <strong>{role.toUpperCase()} INTERVIEW</strong> conducted through CollabSphere's AI-Powered Mock Interview Platform, demonstrating technical proficiency, conceptual clarity, and professional communication.
            </p>

            {/* Role, Interview Type, Difficulty & Score Badges */}
            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Type: <strong className="text-white">{interviewType}</strong>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                {difficulty} Level
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-extrabold text-emerald-400">
                Score: {overallScore}/100
              </span>
            </div>

            {/* Objective Achievement Badge if Earned */}
            {achievement && achievement.earned && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
                <span className="text-sm">{achievement.badge || '🏆'}</span>
                <span>Honor Distinction: <strong>{achievement.title}</strong></span>
              </div>
            )}
          </div>

          {/* Footer: Signatures, Seal & QR Code */}
          <div className="relative z-10 grid grid-cols-3 items-end pt-4 border-t border-slate-200">
            {/* Left: Authority Signature & Date */}
            <div className="text-left">
              <div className="w-44 border-b border-slate-700 pb-1 mb-1">
                <span
                  className="text-xl text-slate-900 tracking-wider select-none font-serif italic"
                  style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Dancing Script', 'Playfair Display', cursive, serif" }}
                >
                  Dolly Bisht
                </span>
              </div>
              <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                Dolly Bisht
              </div>
              <div className="text-[9px] text-slate-500">
                Chair, Technical Interview Committee
              </div>
              <div className="text-[9px] text-slate-500 mt-1">
                Issued: <strong>{formattedDate}</strong>
              </div>
            </div>

            {/* Center: Official CollabSphere Gold Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-amber-600/80 bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 p-1 shadow-md flex flex-col items-center justify-center text-center text-slate-900 relative">
                <div className="w-full h-full rounded-full border border-amber-700/40 flex flex-col items-center justify-center p-1">
                  <Award className="w-6 h-6 text-slate-900 mb-0.5" />
                  <span className="text-[7px] font-black uppercase tracking-tighter leading-none">
                    COLLABSPHERE
                  </span>
                  <span className="text-[6px] font-bold uppercase tracking-widest text-slate-800">
                    VERIFIED
                  </span>
                </div>
              </div>
              <div className="text-[9px] font-mono font-bold text-slate-600 mt-1">
                ID: {certificateId}
              </div>
            </div>

            {/* Right: QR Code for Public Verification */}
            <div className="flex flex-col items-end text-right">
              <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Certificate QR Code"
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">
                    QR Code
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-500 mt-1">
                Scan to verify credential authenticity
              </div>
              <div className="text-[8px] font-mono text-indigo-600">
                collabsphere.io/verify
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return (
      <div className="p-4 sm:p-6 w-full flex justify-center">
        {certificateBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 my-auto">
        {certificateBody}
      </div>
    </div>
  );
};

export default CertificateView;
