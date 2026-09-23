import React, { useState, useEffect, useRef } from 'react';
import { Download, Check, Copy, ExternalLink, Award, ShieldCheck, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateQRCodeDataUrl, downloadEnglishCertificatePDF } from '../../utils/pdfGenerator';

const EnglishCertificateView = ({
  certificate,
  candidateName = certificate?.candidateName || certificate?.fullName || 'Candidate',
  level = certificate?.level || 'Intermediate',
  score = certificate?.score || 85,
  certificateId = certificate?.certificateId || 'CS-ENG-2026-X01A',
  issueDate = certificate?.issueDate || new Date().toISOString(),
  onClose,
  isModal = true
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const certificateRef = useRef(null);

  const formattedDate = new Date(issueDate).toLocaleDateString(undefined, {
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
    const toastId = toast.loading('Generating high-resolution 1-page certificate PDF...');
    try {
      await downloadEnglishCertificatePDF(certificateRef.current, {
        certificateId,
        candidateName,
        level
      });
      toast.success('Certificate PDF downloaded successfully!', { id: toastId });
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

  const certificateContent = (
    <div className="flex flex-col items-center w-full">
      {/* Top Action Bar (hidden when printing) */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-4 px-2 print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Official English Credential
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {certificateId}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified by CollabSphere English Assessment Council
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Copy Verification Link'}</span>
          </button>

          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify Online</span>
          </a>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-1"
              aria-label="Close certificate preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Certificate Print-Ready Canvas (Exact 1000px x 707px A4 Landscape Ratio) */}
      <div className="w-full overflow-x-auto pb-4 flex justify-center">
        <div
          ref={certificateRef}
          id="printable-english-certificate"
          style={{
            width: '1000px',
            minWidth: '1000px',
            height: '707px',
            boxSizing: 'border-box'
          }}
          className="relative bg-gradient-to-br from-[#fbf9f4] via-[#ffffff] to-[#f8f5ee] p-10 border-[10px] border-[#0f172a] rounded-2xl shadow-2xl flex flex-col justify-between select-none text-black"
        >
          {/* Inner Decorative Gold/Navy Frames */}
          <div className="absolute inset-3 border-2 border-amber-600/70 rounded-xl pointer-events-none" />
          <div className="absolute inset-5 border border-slate-300 pointer-events-none" />

          {/* Corner Flourishes */}
          <div className="absolute top-7 left-7 w-8 h-8 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute top-7 right-7 w-8 h-8 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-7 left-7 w-8 h-8 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-7 right-7 w-8 h-8 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

          {/* Background Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
            <span className="text-[300px] font-serif font-black tracking-widest text-slate-900">CS</span>
          </div>

          {/* Header Section */}
          <div className="relative z-10 text-center pt-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-amber-400 font-black shadow-md border border-amber-400/40">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-lg font-black tracking-wider text-slate-900 uppercase font-serif">
                  CollabSphere Academy
                </div>
                <div className="text-[10px] tracking-[0.25em] text-amber-700 uppercase font-semibold">
                  English Communication & Speaking Certification Authority
                </div>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-extrabold tracking-[0.3em] uppercase text-amber-900 bg-amber-100/90 border border-amber-300/80 px-4 py-1 rounded-full inline-block shadow-sm">
                Certificate of Achievement
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 font-medium tracking-wider uppercase">
              This credential is proudly awarded to
            </p>
          </div>

          {/* Candidate Name & Achievement Description */}
          <div className="relative z-10 text-center my-auto py-2">
            <h1
              className="text-4xl font-serif font-black text-slate-900 tracking-wide uppercase underline decoration-amber-500/50 decoration-2 underline-offset-8"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {candidateName}
            </h1>

            <p className="max-w-2xl mx-auto text-xs text-slate-700 leading-relaxed mt-4 font-normal">
              for successfully mastering the comprehensive curriculum in <strong>{level.toUpperCase()} ENGLISH COMMUNICATION & SPEAKING</strong>, demonstrating high conversational fluency, vocabulary competence, accurate pronunciation, and active listening skills in all rigorous evaluations.
            </p>

            {/* Badges: Level, Final Score, Issue Date */}
            <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-3 px-6 py-2.5 rounded-xl bg-slate-900 text-white shadow-lg border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Track: <strong className="text-white">{level} English</strong>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-amber-300">
                Score: <strong className="text-white">{score} / 100</strong>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-slate-300">
                Date: <strong className="text-white">{formattedDate}</strong>
              </span>
            </div>
          </div>

          {/* Footer Section: Signatures, Seal & QR Code */}
          <div className="relative z-10 flex items-end justify-between pt-4 border-t border-slate-200">
            {/* Left: Authorized Signature */}
            <div className="text-left w-56">
              <div
                className="text-2xl font-serif text-slate-800 italic mb-0.5"
                style={{ fontFamily: "'Brush Script MT', 'Great Vibes', 'Playfair Display', cursive, serif" }}
              >
                Dolly Bisht
              </div>
              <div className="h-0.5 w-36 bg-slate-400 mb-1" />
              <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Dolly Bisht
              </div>
              <div className="text-[9px] text-slate-500 font-medium">
                Chair, Technical Assessment Committee
              </div>
              <div className="text-[8px] text-emerald-700 font-semibold mt-0.5">
                ✓ Digitally Signed & Authorized
              </div>
            </div>

            {/* Center: Gold Embossed Seal */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center p-1 text-center">
                  <Award className="w-5 h-5 text-amber-300 mb-0.5" />
                  <span className="text-[7px] font-black text-amber-300 uppercase tracking-wider leading-none">
                    VERIFIED
                  </span>
                  <span className="text-[6px] text-slate-400 leading-none mt-0.5">
                    CREDENTIAL
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-600 tracking-wider uppercase mt-1">
                CollabSphere Verified
              </span>
            </div>

            {/* Right: Real Scannable QR Code & ID */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Credential ID
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-900 tracking-wider">
                  {certificateId}
                </div>
                <div className="text-[8px] text-slate-400 mt-0.5">
                  Scan to verify online
                </div>
              </div>

              <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center shrink-0">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Certificate QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">
                    QR
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return certificateContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-white/20 bg-slate-900 p-4 sm:p-6 text-white shadow-2xl my-8">
        {certificateContent}
      </div>

      {/* Print CSS rules: Ensures ONLY the certificate is printed on 1 single landscape page if printed via browser */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-english-certificate,
          #printable-english-certificate * {
            visibility: visible !important;
          }
          #printable-english-certificate {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 24px !important;
            box-sizing: border-box !important;
            border-width: 8px !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EnglishCertificateView;
