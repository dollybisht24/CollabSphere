import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

/**
 * Generate a high-resolution QR code data URL
 */
export const generateQRCodeDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return null;
  }
};

/**
 * Capture an existing DOM element and download as a PDF
 */
export const captureElementToPDF = async (element, options = {}) => {
  if (!element) {
    throw new Error('Element not provided for PDF capture');
  }

  const {
    filename = 'CollabSphere-Document.pdf',
    orientation = 'portrait',
    scale = 2,
    quality = 0.98
  } = options;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  const isLandscape = orientation === 'landscape';
  const pdfWidth = isLandscape ? 297 : 210;
  const pdfHeight = isLandscape ? 210 : 297;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const imgData = canvas.toDataURL('image/jpeg', quality);

  if (isLandscape) {
    // Single page certificate
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  } else {
    // Multi-page portrait report
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(filename);
};

/**
 * Download Certificate of Interview Completion
 */
export const downloadCertificatePDF = async (element, { certificateId = 'CS-INT', candidateName = 'Candidate' } = {}) => {
  const cleanId = (certificateId || 'CS-INT').replace(/[^a-zA-Z0-9-_]/g, '');
  const cleanName = (candidateName || 'Candidate').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  const filename = `CollabSphere-Certificate-${cleanName}-${cleanId}.pdf`;

  return await captureElementToPDF(element, {
    filename,
    orientation: 'landscape',
    scale: 2.5
  });
};

/**
 * Download Certificate of English Communication & Speaking Achievement
 */
export const downloadEnglishCertificatePDF = async (element, { certificateId = 'CS-ENG', candidateName = 'Candidate', level = 'English' } = {}) => {
  const cleanId = (certificateId || 'CS-ENG').replace(/[^a-zA-Z0-9-_]/g, '');
  const cleanName = (candidateName || 'Candidate').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  const cleanLevel = (level || 'English').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  const filename = `CollabSphere-English-Certificate-${cleanLevel}-${cleanName}-${cleanId}.pdf`;

  return await captureElementToPDF(element, {
    filename,
    orientation: 'landscape',
    scale: 2.5
  });
};

/**
 * Generate and download a comprehensive, professional multi-page Interview Feedback Report PDF
 */
export const generateFeedbackReportPDF = async ({
  session,
  summary = session?.summary || {},
  questions = session?.questions || [],
  candidateName = session?.candidateName || session?.candidate?.name || 'Candidate',
  candidateEmail = session?.candidateEmail || session?.candidate?.email || '',
  candidateClassYear = session?.candidateClassYear || session?.candidate?.classYear || '',
  certificateId = session?.certificateId || 'CS-INT-XXXX'
}) => {
  const role = session?.role || 'Frontend Developer';
  const difficulty = session?.difficulty || 'Intermediate';
  const interviewType = session?.interviewType || 'Technical Interview';
  const overallScore = summary?.overallScore ?? 75;
  const placementReadiness = summary?.placementReadiness || (overallScore >= 80 ? 'Placement Ready' : overallScore >= 60 ? 'Almost Ready' : 'Needs More Practice');
  const completedDate = new Date(session?.completedAt || session?.updatedAt || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const readinessColor = placementReadiness === 'Placement Ready'
    ? '#10b981'
    : placementReadiness === 'Almost Ready'
      ? '#f59e0b'
      : '#ef4444';

  const readinessBg = placementReadiness === 'Placement Ready'
    ? '#ecfdf5'
    : placementReadiness === 'Almost Ready'
      ? '#fffbeb'
      : '#fef2f2';

  // Create an offscreen DOM container with fixed A4 width (800px)
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.padding = '40px 48px';
  container.style.boxSizing = 'border-box';

  const dimensions = [
    { label: 'Technical Knowledge', val: summary?.technicalKnowledge ?? overallScore },
    { label: 'Concept Clarity', val: summary?.conceptClarity ?? overallScore },
    { label: 'Problem Solving', val: summary?.problemSolving ?? overallScore },
    { label: 'Communication', val: summary?.communication ?? overallScore },
    { label: 'Answer Quality', val: summary?.answerQuality ?? overallScore }
  ];

  const strengths = summary?.strengths || [];
  const weakAreas = summary?.weakAreas || [];
  const improvementPlan = summary?.improvementPlan || [];

  container.innerHTML = `
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
            ✦
          </div>
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">CollabSphere</span>
        </div>
        <div style="font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1px;">
          AI Mock Interview Evaluation Report
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: #64748b; font-weight: 500;">Certificate ID</div>
        <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #0f172a;">${certificateId}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Issued: ${completedDate}</div>
      </div>
    </div>

    <!-- Candidate & Interview Metadata Section -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 24px 0;">
      <!-- Candidate Information Card -->
      <div style="padding: 16px 18px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.5px; margin-bottom: 10px;">
          Candidate Information
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
          <div><strong style="color: #64748b;">Full Name:</strong> <span style="color: #0f172a; font-weight: 700;">${candidateName}</span></div>
          <div><strong style="color: #64748b;">Email Address:</strong> <span style="color: #0f172a; font-weight: 600;">${candidateEmail || 'Candidate Record'}</span></div>
          <div><strong style="color: #64748b;">Class / Year:</strong> <span style="color: #0f172a; font-weight: 600;">${candidateClassYear || 'Not Specified'}</span></div>
          <div><strong style="color: #64748b;">Target Role:</strong> <span style="color: #0f172a; font-weight: 600;">${role}</span></div>
        </div>
      </div>

      <!-- Interview Information Card -->
      <div style="padding: 16px 18px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.5px; margin-bottom: 10px;">
          Interview Information
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
          <div><strong style="color: #64748b;">Interview Type:</strong> <span style="color: #0f172a; font-weight: 600;">${interviewType}</span></div>
          <div><strong style="color: #64748b;">Difficulty Level:</strong> <span style="color: #4338ca; font-weight: 700;">${difficulty}</span></div>
          <div><strong style="color: #64748b;">Questions Evaluated:</strong> <span style="color: #0f172a; font-weight: 600;">${questions.length} Questions</span></div>
          <div><strong style="color: #64748b;">Completion Date:</strong> <span style="color: #0f172a; font-weight: 600;">${completedDate}</span></div>
        </div>
      </div>
    </div>

    <!-- Executive Performance Summary -->
    <div style="display: flex; gap: 20px; align-items: stretch; margin-bottom: 24px;">
      <!-- Score Circle Card -->
      <div style="width: 220px; background: linear-gradient(145deg, #0f172a, #1e1b4b); border-radius: 14px; padding: 22px; color: white; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #a5b4fc; letter-spacing: 0.5px;">Overall Score</div>
        <div style="font-size: 52px; font-weight: 900; line-height: 1; margin: 10px 0 6px 0; color: #ffffff;">${overallScore}<span style="font-size: 24px; color: #818cf8;">%</span></div>
        <div style="font-size: 12px; color: #cbd5e1; font-weight: 500;">AI Evaluated</div>
      </div>

      <!-- Placement Readiness Banner & Explanation -->
      <div style="flex: 1; padding: 20px; background-color: ${readinessBg}; border: 1.5px solid ${readinessColor}; border-radius: 14px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Placement Readiness Status</span>
            <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: ${readinessColor}; color: white; font-size: 12px; font-weight: 700;">
              ${placementReadiness}
            </span>
          </div>
          <div style="font-size: 14px; color: #1e293b; line-height: 1.5; font-weight: 500;">
            ${summary?.readinessExplanation || `Demonstrated solid engineering fundamentals in ${role}. Focus on deep architectural trade-offs to reach top placement tier.`}
          </div>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #475569; font-style: italic;">
          "${summary?.aiFeedback || 'Consistent technical performance with strong communicative delivery.'}"
        </div>
      </div>
    </div>

    <!-- Skill Dimension Score Bars -->
    <div style="margin-bottom: 28px; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-bottom: 14px; letter-spacing: 0.5px;">
        Core Dimension Breakdown
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px;">
        ${dimensions.map(d => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">
              <span>${d.label}</span>
              <span style="color: #4f46e5;">${d.val}%</span>
            </div>
            <div style="width: 100%; height: 7px; background-color: #e2e8f0; border-radius: 9999px; overflow: hidden;">
              <div style="width: ${d.val}%; height: 100%; background: linear-gradient(90deg, #4f46e5, #06b6d4); border-radius: 9999px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Strengths & Weak Areas Side-by-Side -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px;">
      <!-- Strengths -->
      <div style="padding: 18px 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 12px; text-transform: uppercase;">
          <span>✓</span> Key Technical Strengths
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${strengths.length ? strengths.map(s => `
            <div style="font-size: 12px; line-height: 1.4; color: #14532d;">
              <strong style="color: #166534;">${s.topic || s}:</strong> ${s.detail || 'Demonstrated confident grasp and articulate application.'}
            </div>
          `).join('') : '<div style="font-size: 12px; color: #14532d;">Clear understanding of primary concepts demonstrated.</div>'}
        </div>
      </div>

      <!-- Weak Areas -->
      <div style="padding: 18px 20px; background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #9a3412; margin-bottom: 12px; text-transform: uppercase;">
          <span>⚠</span> Recommended Focus Areas
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${weakAreas.length ? weakAreas.map(w => `
            <div style="font-size: 12px; line-height: 1.4; color: #7c2d12;">
              <strong style="color: #9a3412;">${w.topic || w}:</strong> ${w.explanation || 'Elaborate further on real-world constraints and edge case handling.'}
            </div>
          `).join('') : '<div style="font-size: 12px; color: #7c2d12;">Continue deepening production architecture practices.</div>'}
        </div>
      </div>
    </div>

    <!-- Prioritized 3-Tier Improvement Plan -->
    ${improvementPlan.length ? `
      <div style="margin-bottom: 28px; padding: 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-bottom: 14px; letter-spacing: 0.5px;">
          Targeted 3-Tier Action Plan
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${improvementPlan.map(plan => `
            <div style="display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid ${plan.priority === 1 ? '#ef4444' : plan.priority === 2 ? '#f59e0b' : '#3b82f6'};">
              <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; background-color: #0f172a; color: white; white-space: nowrap;">
                Priority ${plan.priority}
              </span>
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${plan.topic}</div>
                <div style="font-size: 12px; color: #475569; line-height: 1.4;">${plan.action}</div>
                ${plan.focusSkills && plan.focusSkills.length ? `
                  <div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
                    ${plan.focusSkills.map(skill => `
                      <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background-color: #e0e7ff; color: #3730a3;">${skill}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Question-by-Question Review -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-bottom: 14px; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        Question-by-Question Evaluation Transcript
      </div>
      <div style="display: flex; flex-direction: column; gap: 18px;">
        ${questions.map((q, idx) => {
          const qScore = q.evaluation?.score ?? (q.isSkipped ? 0 : 7);
          const scoreColor = qScore >= 8 ? '#10b981' : qScore >= 5 ? '#f59e0b' : '#ef4444';
          return `
            <div style="padding: 16px 18px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; page-break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase;">
                  Question ${idx + 1} • ${q.topic || 'Engineering Core'}
                </div>
                <div style="font-size: 13px; font-weight: 800; color: ${scoreColor};">
                  ${q.isSkipped ? 'Skipped' : `${qScore} / 10`}
                </div>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px; line-height: 1.4;">
                ${q.questionText}
              </div>
              <div style="font-size: 12px; color: #475569; margin-bottom: 8px; background-color: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.4;">
                <strong style="color: #0f172a;">Candidate Answer:</strong><br />
                ${q.userAnswer ? q.userAnswer.replace(/\n/g, '<br />') : '<em style="color: #94a3b8;">[No answer provided]</em>'}
              </div>
              ${q.evaluation?.suggestedAnswer ? `
                <div style="font-size: 11px; color: #1e3a8a; background-color: #eff6ff; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #3b82f6; line-height: 1.4;">
                  <strong>Model Answer / Key Points:</strong> ${q.evaluation.suggestedAnswer}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Official Report Footer -->
    <div style="margin-top: 32px; padding-top: 18px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b;">
      <div>
        <strong>CollabSphere AI Mock Interview System</strong> • Confidential Evaluation Record<br />
        <span>Verify online at: /verify/certificate/${certificateId}</span>
      </div>
      <div style="text-align: right;">
        <div style="font-family: 'Brush Script MT', 'Great Vibes', 'Playfair Display', cursive, serif; font-size: 16px; color: #0f172a; margin-bottom: 2px;">
          Dolly Bisht
        </div>
        <div style="font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase;">
          Dolly Bisht
        </div>
        <div style="font-size: 9px; color: #64748b;">
          Chair, Technical Assessment Committee
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const cleanId = certificateId.replace(/[^a-zA-Z0-9-_]/g, '');
    const cleanRole = role.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const filename = `CollabSphere-Interview-Report-${cleanRole}-${cleanId}.pdf`;

    await captureElementToPDF(container, {
      filename,
      orientation: 'portrait',
      scale: 2
    });
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
