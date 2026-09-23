import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FolderKanban, Users, Globe2, Lock, Sparkles, ArrowRight,
  MoreVertical, Share2, Trash2, ExternalLink, CheckCircle2,
  AlertCircle, Clock, Zap, Lightbulb, Image as ImageIcon
} from 'lucide-react';

const roleLabel = (role) => ({
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer'
}[role] || role || 'Member');

const ProjectCard = ({
  project,
  onOpen,
  onOpenAiReview,
  onDelete,
  onShare
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const menuRef = useRef(null);

  const handleOpenClick = async (e) => {
    if (e) e.stopPropagation();
    if (isOpening || isReviewing) return;
    const projectId = project?._id || project?.id;
    if (!projectId && !project?.isSample) {
      toast.error('Project ID not found');
      return;
    }
    setIsOpening(true);
    try {
      if (onOpen) {
        await onOpen(project);
      }
    } catch (err) {
      console.error('Open workspace error:', err);
    } finally {
      setTimeout(() => setIsOpening(false), 2000);
    }
  };

  const handleAiReviewClick = async (e) => {
    if (e) e.stopPropagation();
    if (isOpening || isReviewing) return;
    const projectId = project?._id || project?.id;
    if (!projectId && !project?.isSample) {
      toast.error('Project ID not found');
      return;
    }
    setIsReviewing(true);
    try {
      if (onOpenAiReview) {
        await onOpenAiReview(project);
      } else if (onOpen) {
        await onOpen(project);
      }
    } catch (err) {
      console.error('Open AI review error:', err);
    } finally {
      setTimeout(() => setIsReviewing(false), 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const score = project.latestReview?.overallScore;
  const isReviewed = score !== null && score !== undefined;
  const impCount = project.latestReview?.improvementsCount ?? (isReviewed ? 3 : 0);
  const featCount = project.latestReview?.featureIdeasCount ?? (isReviewed ? 4 : 0);
  const visCount = project.latestReview?.visualSuggestionsCount ?? (isReviewed ? 2 : 0);

  const formattedDate = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Recently';

  const analyzedDate = project.latestReview?.reviewedAt
    ? new Date(project.latestReview.reviewedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 shadow-[0_2px_14px_rgba(0,0,0,.03)] transition duration-200 hover:-translate-y-1 hover:border-black/30 hover:shadow-[0_12px_32px_rgba(0,0,0,.07)]">
      <div>
        {/* Card Header: Icon, Visibility badge, and Menu */}
        <div className="flex items-start justify-between gap-3">
          <div
            onClick={handleOpenClick}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black text-white transition group-hover:scale-105 cursor-pointer shadow-sm"
          >
            <FolderKanban className="h-6 w-6" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-black/65">
              {project.visibility === 'PUBLIC' ? (
                <Globe2 className="h-3 w-3 text-emerald-600" />
              ) : (
                <Lock className="h-3 w-3 text-black/45" />
              )}
              {project.visibility || 'PRIVATE'}
            </span>

            {/* More Options Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="rounded-lg p-1 text-black/40 hover:bg-neutral-100 hover:text-black transition"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded-xl border border-black/10 bg-white p-1.5 shadow-xl z-20 text-xs">
                  {onShare && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onShare(project); }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-black hover:bg-neutral-50 transition"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share workspace
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); handleOpenClick(e); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-black hover:bg-neutral-50 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open workspace
                  </button>
                  {onDelete && (project.role === 'OWNER' || project.role === 'ADMIN') && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project); }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete project
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h3
          onClick={handleOpenClick}
          className="mt-4 text-lg font-bold tracking-tight text-black group-hover:text-black cursor-pointer line-clamp-1"
        >
          {project.name}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-black/60 line-clamp-2">
          {project.description || 'No description provided for this developer workspace.'}
        </p>

        {/* Technology Stack Tags */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {(() => {
            const techStack = Array.isArray(project.technologyStack)
              ? project.technologyStack
              : (typeof project.technologyStack === 'string' && project.technologyStack.trim()
                ? project.technologyStack.split(',').map(s => s.trim()).filter(Boolean)
                : []);
            return techStack.length > 0 ? (
              <>
                {techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-neutral-100 border border-black/5 px-2 py-0.5 text-[11px] font-medium text-black/75"
                  >
                    {tech}
                  </span>
                ))}
                {techStack.length > 4 && (
                  <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-black/45">
                    +{techStack.length - 4}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-black/40 italic">Custom Stack</span>
            );
          })()}
        </div>

        {/* Project Metadata Information */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-black/50 pt-3 border-t border-black/5">
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-black/40 shrink-0" />
            <span>{project.memberCount || project.members?.length || 1} {project.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="font-semibold text-black/70">{roleLabel(project.role)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-black/40 shrink-0" />
            <span>Updated {formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-black/60 capitalize">{project.category || 'Full Stack'}</span>
          </div>
        </div>

        {/* AI PROJECT INSIGHT CARD SECTION */}
        <div className={`mt-4 rounded-xl border p-3 transition ${
          isReviewed
            ? 'border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-neutral-50'
            : 'border-black/10 bg-neutral-50/80'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
                isReviewed
                  ? score >= 80 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-black/10 text-black'
              }`}>
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 border border-indigo-200/60 rounded px-1.5 py-0.5">
                  AI PROJECT INSIGHT
                </span>
                <p className="text-xs font-semibold text-black truncate mt-0.5">
                  {isReviewed ? `${score}/100 Project Quality` : 'AI Review Available'}
                </p>
              </div>
            </div>

            {isReviewed && (
              <div className="shrink-0 flex items-center gap-1.5">
                <div className="w-14 h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-emerald-600' : score >= 65 ? 'bg-indigo-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {isReviewed ? (
            <div className="mt-2.5 pt-2 border-t border-indigo-100/70 text-[11px] text-black/65 flex flex-col gap-1">
              <p className="font-medium text-black/80 flex items-center gap-2">
                <span>{impCount} Improvements</span>
                <span>·</span>
                <span>{featCount} Ideas</span>
                <span>·</span>
                <span>{visCount} Visuals</span>
              </p>
              {analyzedDate && (
                <p className="text-[10px] text-black/45">Last analyzed {analyzedDate}</p>
              )}
            </div>
          ) : (
            <p className="mt-1.5 text-[11px] text-black/55 leading-snug">
              Analyze code, UX, architecture & feature opportunities
            </p>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-5 pt-4 border-t border-black/10 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={isOpening || isReviewing}
          onClick={handleOpenClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-neutral-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isOpening ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              <span>Opening...</span>
            </>
          ) : (
            <span>Open Workspace</span>
          )}
        </button>

        <button
          type="button"
          disabled={isOpening || isReviewing}
          onClick={handleAiReviewClick}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
            isReviewed
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              : 'bg-black text-white hover:bg-neutral-800'
          }`}
        >
          {isReviewing ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{isReviewed ? 'Opening...' : 'Analyzing...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isReviewed ? 'View AI Insights' : 'AI Review'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
