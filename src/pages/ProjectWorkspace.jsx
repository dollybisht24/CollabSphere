import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Code2, Download, Eye, FileText, Globe2, Lock, Save,
  Trash2, Upload, UserMinus, UserPlus, Users, Sparkles, Lightbulb,
  Map, FileCode, Clock, ShieldAlert, CheckCircle2, ChevronRight,
  MessageSquare, Briefcase, RefreshCw, Layers, Sliders, ExternalLink,
  Copy, Check, Terminal, Play, AlertTriangle, ChevronDown, CheckCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { projectsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Subcomponents
import AIProjectAdvisorView from '../components/projects/AIProjectAdvisorView';
import ProjectReviewView from '../components/projects/ProjectReviewView';
import ProjectIdeasView from '../components/projects/ProjectIdeasView';
import ProjectRoadmapView from '../components/projects/ProjectRoadmapView';
import ProjectChatDrawer from '../components/projects/ProjectChatDrawer';
import ProjectResumeModal from '../components/projects/ProjectResumeModal';
import ImplementationPlanModal from '../components/projects/ImplementationPlanModal';
import HeaderNav from '../components/common/HeaderNav';

const roles = ['ADMIN', 'MEMBER', 'VIEWER'];
const roleLabel = role => ({ OWNER: 'Owner', ADMIN: 'Admin', MEMBER: 'Member', VIEWER: 'Viewer' }[role] || role);
const textExtensions = new Set(['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'txt', 'md', 'csv', 'yml', 'yaml', 'env', 'sql']);
const fileAccept = '.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.gif,.svg';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'files', label: 'Files', icon: Code2 },
  { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
  { id: 'ideas', label: 'AI Ideas', icon: Lightbulb },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'docs', label: 'Documentation', icon: FileText },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'activity', label: 'Activity', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Sliders }
];

const ProjectWorkspace = ({ defaultTab }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Primary State
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [review, setReview] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [roadmapTasks, setRoadmapTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [error, setError] = useState('');

  // Active Tab from URL query or /ai-review pathname or defaultTab or 'overview'
  const isAiReviewRoute = location.pathname.endsWith('/ai-review');
  const rawTab = searchParams.get('tab') || (isAiReviewRoute ? 'advisor' : (defaultTab || 'overview'));
  const activeTab = rawTab === 'review' ? 'advisor' : rawTab;
  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Files Tab State
  const [fileSearch, setFileSearch] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL');
  const [preview, setPreview] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [fileExplaining, setFileExplaining] = useState(null);
  const [fileExplanation, setFileExplanation] = useState('');

  // Settings / Form State
  const [form, setForm] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');

  // Documentation Tab State
  const [docsContent, setDocsContent] = useState('');
  const [docsEditing, setDocsEditing] = useState(false);
  const [savingDocs, setSavingDocs] = useState(false);
  const [generatingDocs, setGeneratingDocs] = useState(false);

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [selectedPlanItem, setSelectedPlanItem] = useState(null);

  // Current Role & Permissions
  const currentRole = useMemo(() => {
    if (!project || !user) return null;
    const currentId = user.id || user._id;
    if (String(project.ownerId?._id || project.ownerId) === String(currentId)) return 'OWNER';
    return project.members?.find(member => String(member.userId?._id || member.userId) === String(currentId))?.role?.toUpperCase() || null;
  }, [project, user]);

  const canManage = currentRole === 'OWNER' || currentRole === 'ADMIN';
  const isOwner = currentRole === 'OWNER';

  // Load all project data
  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projData, fileList] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getFiles(id)
      ]);

      const safeFileList = Array.isArray(fileList) ? fileList : (fileList?.files || []);
      setProject(projData);
      setFiles(safeFileList);
      setForm({
        name: projData?.name || '',
        description: projData?.description || '',
        technologyStack: Array.isArray(projData?.technologyStack)
          ? projData.technologyStack.join(', ')
          : (projData?.technologyStack || ''),
        category: projData?.category || '',
        visibility: projData?.visibility || 'PRIVATE'
      });

      // Load AI analysis, roadmap, and history asynchronously without blocking
      const fetchAnalysis = projectsAPI.getLatestAnalysis || projectsAPI.getAnalysis;
      if (typeof fetchAnalysis === 'function') {
        fetchAnalysis(id)
          .then(res => {
            if (res?.review) setReview(res.review);
          })
          .catch(() => {});
      }

      if (typeof projectsAPI.getAnalysisHistory === 'function') {
        projectsAPI.getAnalysisHistory(id)
          .then(res => {
            if (res?.history && Array.isArray(res.history)) setReviewHistory(res.history);
          })
          .catch(() => {});
      }

      if (typeof projectsAPI.getRoadmap === 'function') {
        projectsAPI.getRoadmap(id)
          .then(res => {
            if (res?.tasks && Array.isArray(res.tasks)) setRoadmapTasks(res.tasks);
          })
          .catch(() => {});
      }

      // Look for README.md in files
      const readmeFile = safeFileList.find(f => f?.originalName?.toLowerCase() === 'readme.md');
      if (readmeFile) {
        projectsAPI.getFileContent(id, readmeFile._id)
          .then(blob => blob.text())
          .then(text => setDocsContent(text))
          .catch(() => {});
      } else {
        const stackList = Array.isArray(projData?.technologyStack) ? projData.technologyStack : [];
        setDocsContent(`# ${projData?.name || 'Project'}\n\n${projData?.description || 'Welcome to the project documentation.'}\n\n### Tech Stack\n${stackList.map(t => `- ${t}`).join('\n')}\n\n### Getting Started\n1. Install dependencies\n2. Configure environment variables\n3. Run development server`);
      }

    } catch (err) {
      let friendlyMessage = 'Unable to open workspace. Please try again.';
      const status = err.status;
      const rawMsg = (err.message || '').toLowerCase();

      if (status === 404 || rawMsg.includes('not found')) {
        friendlyMessage = 'Project not found';
      } else if (status === 403 || rawMsg.includes('permission') || rawMsg.includes('access') || rawMsg.includes('denied')) {
        friendlyMessage = "You don't have permission to access this workspace.";
      } else if (rawMsg.includes('reach the server') || rawMsg.includes('network') || rawMsg.includes('failed to fetch')) {
        friendlyMessage = 'Unable to open workspace. Please try again.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }

      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadProjectData();
  }, [id]);

  // AI Analysis Handler
  const handleAnalyzeProject = async (type = 'full') => {
    try {
      setAnalyzing(true);
      toast.loading(review ? 'AI is re-evaluating project improvements & architecture...' : 'AI is analyzing code quality, architecture & security...', { id: 'ai-analysis' });

      let result;
      if (review && type === 'reanalyze') {
        result = await projectsAPI.reanalyzeProject(id);
      } else {
        result = await projectsAPI.analyzeProject(id, type);
      }

      setReview(result.review);
      if (result.project) {
        setProject(prev => ({ ...prev, latestReview: result.project.latestReview }));
      }

      // Refresh history & roadmap
      const [histRes, roadRes] = await Promise.all([
        projectsAPI.getAnalysisHistory(id),
        projectsAPI.getRoadmap(id)
      ]);
      if (histRes?.history) setReviewHistory(histRes.history);
      if (roadRes?.tasks) setRoadmapTasks(roadRes.tasks);

      toast.success(
        result.review.comparisonWithPrevious
          ? `Analysis complete! Score changed by ${result.review.comparisonWithPrevious.scoreDelta >= 0 ? '+' : ''}${result.review.comparisonWithPrevious.scoreDelta} pts.`
          : 'AI Project Review complete!',
        { id: 'ai-analysis' }
      );
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.', { id: 'ai-analysis' });
    } finally {
      setAnalyzing(false);
    }
  };

  // AI Refresh Feature Ideas
  const handleRefreshIdeas = async () => {
    try {
      setLoadingIdeas(true);
      toast.loading('Generating innovative feature ideas...', { id: 'ideas' });
      const res = await projectsAPI.generateFeatureIdeas(id);
      if (res.featureIdeas && review) {
        setReview({ ...review, featureIdeas: res.featureIdeas });
      }
      toast.success('Generated fresh feature ideas!', { id: 'ideas' });
    } catch (err) {
      toast.error('Failed to generate ideas', { id: 'ideas' });
    } finally {
      setLoadingIdeas(false);
    }
  };

  // Roadmap Actions
  const handleAddTaskToRoadmap = async (taskData) => {
    try {
      const res = await projectsAPI.addRoadmapTask(id, taskData);
      setRoadmapTasks(prev => [res.task, ...prev]);
      return res.task;
    } catch (err) {
      toast.error('Failed to add task to roadmap');
      throw err;
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const res = await projectsAPI.updateRoadmapTask(id, taskId, { status });
      setRoadmapTasks(prev => prev.map(t => (t._id === taskId ? res.task : t)));
      toast.success(`Task status moved to ${status}`);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteRoadmapTask = async (taskId) => {
    try {
      await projectsAPI.deleteRoadmapTask(id, taskId);
      setRoadmapTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task removed from roadmap');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Save Settings
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await projectsAPI.update(id, {
        ...form,
        technologyStack: form.technologyStack.split(',').map(item => item.trim()).filter(Boolean)
      });
      setProject(res.project);
      toast.success('Project settings updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  // Member Management
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      setSaving(true);
      const res = await projectsAPI.addMember(id, memberEmail.trim(), memberRole);
      setProject(res.project);
      setMemberEmail('');
      toast.success('Member added successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (memberId, role) => {
    try {
      const res = await projectsAPI.updateMemberRole(id, memberId, role);
      setProject(res.project);
      toast.success('Role updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this collaborator from the project?')) return;
    try {
      const res = await projectsAPI.removeMember(id, memberId);
      setProject(res.project);
      toast.success('Member removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  // Delete & Leave Project
  const handleDeleteProject = async () => {
    if (!window.confirm(`Permanently delete "${project.name}"? This action cannot be undone.`)) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted successfully.');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm(`Leave project "${project.name}"?`)) return;
    try {
      await projectsAPI.leave(id);
      toast.success('You have left the project.');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message || 'Failed to leave project');
    }
  };

  // File Operations
  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      setSaving(true);
      toast.loading(`Uploading ${file.name}...`, { id: 'upload-file' });
      const res = await projectsAPI.uploadFile(id, file);
      setFiles(prev => [res.file, ...prev]);
      toast.success('File uploaded successfully.', { id: 'upload-file' });
    } catch (err) {
      toast.error(err.message || 'Upload failed', { id: 'upload-file' });
    } finally {
      setSaving(false);
    }
  };

  const handleShowPreview = async (file) => {
    try {
      const blob = await projectsAPI.getFileContent(id, file._id);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const extension = file.extension || file.originalName.split('.').pop()?.toLowerCase();
      const isText = file.isCode || textExtensions.has(extension);
      setPreview(file);
      setPreviewUrl(isText ? '' : URL.createObjectURL(blob));
      setPreviewText(isText ? await blob.text() : '');
      setFileExplanation('');
    } catch (err) {
      toast.error('Failed to preview file');
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const blob = await projectsAPI.getFileContent(id, file._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleExplainFile = async (file) => {
    try {
      setFileExplaining(file._id);
      const res = await projectsAPI.explainFile(id, file._id);
      setFileExplanation(res.message);
      toast.success('AI explanation generated!');
    } catch (err) {
      toast.error('Failed to generate explanation');
    } finally {
      setFileExplaining(null);
    }
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete ${file.originalName}?`)) return;
    try {
      await projectsAPI.deleteFile(id, file._id);
      setFiles(prev => prev.filter(item => item._id !== file._id));
      if (preview?._id === file._id) {
        setPreview(null);
        setPreviewText('');
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      toast.success('File deleted.');
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  // Documentation Operations
  const handleSaveDocumentation = async () => {
    try {
      setSavingDocs(true);
      const readmeBlob = new Blob([docsContent], { type: 'text/markdown' });
      const readmeFile = new File([readmeBlob], 'README.md', { type: 'text/markdown' });
      const res = await projectsAPI.uploadFile(id, readmeFile);
      setFiles(prev => [res.file, ...prev.filter(f => f.originalName.toLowerCase() !== 'readme.md')]);
      setDocsEditing(false);
      toast.success('Documentation saved as README.md');
    } catch (err) {
      toast.error('Failed to save documentation');
    } finally {
      setSavingDocs(false);
    }
  };

  const handleGenerateReadmeWithAi = async () => {
    try {
      setGeneratingDocs(true);
      toast.loading('AI is drafting a comprehensive README for your project...', { id: 'gen-docs' });
      const res = await projectsAPI.askAi(
        id,
        'Generate a complete, professional, comprehensive README.md in Markdown for this project. Include Overview, Key Features, Architecture & Folder Structure, Tech Stack, Prerequisites, Installation & Setup instructions, and API Endpoints overview. Do not include markdown code block backticks around the entire document.'
      );
      setDocsContent(res.answer || res.reply || docsContent);
      setDocsEditing(true);
      toast.success('README generated! Review and click Save.', { id: 'gen-docs' });
    } catch (err) {
      toast.error('Failed to generate README', { id: 'gen-docs' });
    } finally {
      setGeneratingDocs(false);
    }
  };

  // Filtered files
  const filteredFiles = useMemo(() => {
    const q = fileSearch.trim().toLowerCase();
    const safeFiles = Array.isArray(files) ? files : [];
    return safeFiles.filter(f => {
      if (!f) return false;
      const matchName = !q || (f.originalName || '').toLowerCase().includes(q);
      if (!matchName) return false;
      if (fileTypeFilter === 'CODE') return Boolean(f.isCode);
      if (fileTypeFilter === 'DOCS') return ['md', 'txt', 'pdf', 'doc'].includes(f.extension);
      if (fileTypeFilter === 'IMAGES') return ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(f.extension);
      return true;
    });
  }, [files, fileSearch, fileTypeFilter]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-black" />
        <p className="text-sm font-medium text-black/60">Loading project workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white">
        <HeaderNav activeTab="projects" />
        <div className="p-8 max-w-xl mx-auto text-center space-y-4 pt-16">
          <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-black">Workspace Unavailable</h2>
          <p className="text-sm text-black/60">{error || 'The requested project could not be found or you do not have permission to view it.'}</p>
          <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const overallScore = review?.overallScore ?? project.latestReview?.overallScore;
  const reviewStatus = project.latestReview?.status || (overallScore ? (overallScore >= 75 ? 'REVIEWED' : 'NEEDS_IMPROVEMENT') : 'NOT_REVIEWED');
  const completedTasks = (Array.isArray(roadmapTasks) ? roadmapTasks : []).filter(t => t?.status === 'COMPLETED').length;

  const importSourceType = typeof project.importSource === 'string'
    ? project.importSource
    : (project.importSource?.type || '');

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Top Universal Capsule Header Nav (Image 2 style) */}
      <HeaderNav activeTab="projects" />

      {/* Top Navigation Bar */}
      <div className="border-b border-black/10 bg-white sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/projects"
                className="p-2 rounded-xl border border-black/10 text-black/60 hover:text-black hover:bg-neutral-100 transition"
                title="Back to Projects"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight flex items-center gap-2">
                    {project.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-black/70">
                    {project.visibility === 'PUBLIC' ? <Globe2 className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-black/50" />}
                    {project.visibility}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black text-white text-[11px] font-semibold">
                    {roleLabel(currentRole)}
                  </span>
                  {importSourceType && importSourceType !== 'MANUAL' && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold uppercase tracking-wider">
                      {importSourceType.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-black/50 truncate max-w-xl mt-0.5">
                  {project.description || 'Developer collaboration workspace'}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/15 bg-white text-xs font-semibold text-black hover:bg-neutral-50 transition shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask AI</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResumeOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/15 bg-white text-xs font-semibold text-black hover:bg-neutral-50 transition shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resume Bullets</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeTab !== 'advisor') handleTabChange('advisor');
                  if (!review) handleAnalyzeProject('full');
                }}
                disabled={analyzing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{analyzing ? 'Analyzing...' : review ? 'AI Advisor' : 'Run AI Advisor'}</span>
              </button>
            </div>
          </div>

          {/* 9 Tabs Scrollable Strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-black/5 pt-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                    isActive
                      ? 'border-black text-black'
                      : 'border-transparent text-black/55 hover:text-black hover:border-black/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-black/40'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'files' && files.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold text-black/70">
                      {files.length}
                    </span>
                  )}
                  {tab.id === 'roadmap' && roadmapTasks.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-bold text-black/70">
                      {completedTasks}/{roadmapTasks.length}
                    </span>
                  )}
                  {tab.id === 'advisor' && overallScore !== undefined && overallScore !== null && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      overallScore >= 80 ? 'bg-emerald-100 text-emerald-800' : overallScore >= 60 ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {overallScore}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ===================== 1. OVERVIEW TAB ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Project Banner */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-black/50">
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-black font-semibold">
                      {project.category || 'General'}
                    </span>
                    <span>·</span>
                    <span>Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{files.length} Total Files</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-black">{project.name}</h2>
                  <p className="text-sm text-black/70 max-w-3xl leading-relaxed">
                    {project.description || 'No description provided. Click the Settings tab to update your project information.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(project.technologyStack || []).map(tech => (
                      <span key={tech} className="px-2.5 py-1 rounded-lg bg-neutral-100 text-xs font-semibold text-black/80 border border-black/5">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Gauge / CTA Card */}
                <div className="lg:w-80 shrink-0 rounded-xl border border-black/10 bg-neutral-50 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-black/50">AI Quality Score</span>
                      <span className="text-[11px] font-semibold text-black/40">
                        {review ? new Date(review.createdAt).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>

                    {overallScore !== undefined && overallScore !== null ? (
                      <div className="mt-3 flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-black/10 bg-white shadow-inner">
                          <span className="text-2xl font-black text-black">{overallScore}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">
                            {overallScore >= 85 ? 'Production Ready' : overallScore >= 70 ? 'Good Architecture' : 'Needs Optimization'}
                          </p>
                          <p className="text-xs text-black/60">
                            {review?.comparisonWithPrevious?.scoreDelta !== undefined ? (
                              <span className={review.comparisonWithPrevious.scoreDelta >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                                {review.comparisonWithPrevious.scoreDelta >= 0 ? `+${review.comparisonWithPrevious.scoreDelta}` : review.comparisonWithPrevious.scoreDelta} pts from last review
                              </span>
                            ) : (
                              'Based on 6 dimensions'
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <p className="text-sm font-bold text-black">Not Analyzed Yet</p>
                        <p className="text-xs text-black/60 mt-1">Run an AI review to get full 6-dimension scores and actionable improvements.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => {
                        handleTabChange('advisor');
                        if (!review) handleAnalyzeProject('full');
                      }}
                      disabled={analyzing}
                      className="w-full btn-primary py-2.5 text-xs inline-flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{analyzing ? 'Analyzing Project...' : review ? 'Open AI Project Advisor' : 'Run AI Project Advisor'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-black/50 mb-2">
                  <span className="text-xs font-semibold">Project Files</span>
                  <Code2 className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-black">{(Array.isArray(files) ? files : []).length}</p>
                <p className="text-xs text-black/50 mt-1">{(Array.isArray(files) ? files : []).filter(f => f?.isCode).length} code files</p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-black/50 mb-2">
                  <span className="text-xs font-semibold">Roadmap Progress</span>
                  <Map className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-black">
                  {roadmapTasks.length > 0 ? `${Math.round((completedTasks / roadmapTasks.length) * 100)}%` : '0%'}
                </p>
                <p className="text-xs text-black/50 mt-1">{completedTasks} of {roadmapTasks.length} tasks completed</p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-black/50 mb-2">
                  <span className="text-xs font-semibold">Collaborators</span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-black">{project.members?.length || 1}</p>
                <p className="text-xs text-black/50 mt-1">1 Owner · {(project.members?.length || 1) - 1} Members</p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-black/50 mb-2">
                  <span className="text-xs font-semibold">Feature Ideas</span>
                  <Lightbulb className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-black">{review?.featureIdeas?.length || 0}</p>
                <p className="text-xs text-black/50 mt-1">AI suggestions available</p>
              </div>
            </div>

            {/* 6 Dimension Mini Breakdown (if reviewed) */}
            {review && (
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-black">Architecture & Quality Breakdown</h3>
                    <p className="text-xs text-black/60">Automated multi-factor evaluation</p>
                  </div>
                  <button
                    onClick={() => handleTabChange('review')}
                    className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                  >
                    <span>Inspect details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'codeQuality', label: 'Code Quality', score: review.categories?.codeQuality || 75 },
                    { key: 'architecture', label: 'Architecture', score: review.categories?.architecture || 75 },
                    { key: 'uiUx', label: 'UI / UX Design', score: review.categories?.uiUx || 70 },
                    { key: 'performance', label: 'Performance', score: review.categories?.performance || 80 },
                    { key: 'security', label: 'Security & Auth', score: review.categories?.security || 70 },
                    { key: 'maintainability', label: 'Maintainability', score: review.categories?.maintainability || 75 }
                  ].map(dim => (
                    <div key={dim.key} className="rounded-xl border border-black/5 bg-neutral-50/70 p-3.5">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-black/70">{dim.label}</span>
                        <span className={`font-bold ${dim.score >= 80 ? 'text-emerald-700' : dim.score >= 60 ? 'text-amber-700' : 'text-red-600'}`}>
                          {dim.score}/100
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${dim.score >= 80 ? 'bg-emerald-600' : dim.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {review.summary && (
                  <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-black/5 text-xs text-black/80 leading-relaxed">
                    <span className="font-bold text-black">AI Assessment: </span>
                    {review.summary}
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Navigation Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div
                onClick={() => handleTabChange('ideas')}
                className="group rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:border-black/30 hover:shadow-md transition cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-amber-50 text-amber-700 w-fit mb-4 group-hover:scale-105 transition">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-black">AI Feature Generator</h4>
                <p className="text-xs text-black/60 mt-1">Discover high-impact features, architecture upgrades, and add them directly to your project roadmap.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-black group-hover:underline">
                  Generate Ideas <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => handleTabChange('roadmap')}
                className="group rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:border-black/30 hover:shadow-md transition cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 w-fit mb-4 group-hover:scale-105 transition">
                  <Map className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-black">Interactive 6-Phase Roadmap</h4>
                <p className="text-xs text-black/60 mt-1">Track issues, improvements, and feature rollouts from Critical Fixes to Testing & Deployment.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-black group-hover:underline">
                  View Roadmap <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div
                onClick={() => setIsResumeOpen(true)}
                className="group rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:border-black/30 hover:shadow-md transition cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 w-fit mb-4 group-hover:scale-105 transition">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-black">Resume-Ready Bullets</h4>
                <p className="text-xs text-black/60 mt-1">Get verified bullet points formatted for tech recruiters highlighting your real architecture contributions.</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-black group-hover:underline">
                  View Bullets <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 2. FILES TAB ===================== */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
                <div>
                  <h2 className="text-xl font-bold text-black">Project Files & Codebase</h2>
                  <p className="text-xs text-black/50 mt-0.5">Uploaded code is strictly parsed for analysis and never executed in an untrusted runtime.</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      className="hidden"
                      accept={fileAccept}
                      onChange={handleUploadFile}
                    />
                  </label>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                <input
                  type="text"
                  placeholder="Search files by name..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="input-field text-xs py-2 max-w-sm"
                />

                <div className="flex items-center gap-1.5">
                  {['ALL', 'CODE', 'DOCS', 'IMAGES'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFileTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        fileTypeFilter === type
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-black/60 hover:bg-neutral-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Files Table / List */}
              {filteredFiles.length === 0 ? (
                <div className="py-12 text-center text-sm text-black/50">
                  {files.length === 0 ? 'No files uploaded yet. Click Upload File above to add source code or project documentation.' : 'No files matching the search query.'}
                </div>
              ) : (
                <div className="divide-y divide-black/5 border border-black/10 rounded-xl overflow-hidden">
                  {filteredFiles.map(file => (
                    <div
                      key={file._id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-neutral-50/70 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                          {file.isCode ? <Code2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-black truncate">{file.originalName}</p>
                          <p className="text-[11px] text-black/50">
                            {(file.extension || 'file').toUpperCase()} · {(file.size / 1024).toFixed(1)} KB · Uploaded {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleShowPreview(file)}
                          className="px-2.5 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-semibold text-black hover:bg-neutral-100 transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        {file.isCode && (
                          <button
                            type="button"
                            onClick={() => handleExplainFile(file)}
                            disabled={fileExplaining === file._id}
                            className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{fileExplaining === file._id ? 'Analyzing...' : 'Explain Code'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file)}
                          className="px-2.5 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-semibold text-black hover:bg-neutral-100 transition inline-flex items-center gap-1"
                          title="Download File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Code / File Preview Drawer */}
              {preview && (
                <div className="mt-6 border-t border-black/10 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-black flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-indigo-600" />
                        <span>Viewing: {preview.originalName}</span>
                      </h3>
                      <p className="text-xs text-black/50">{(preview.size / 1024).toFixed(1)} KB · Read-only inspector</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setPreviewText('');
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl('');
                        setFileExplanation('');
                      }}
                      className="text-xs font-semibold text-black/60 hover:text-black"
                    >
                      Close Preview
                    </button>
                  </div>

                  {fileExplanation && (
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed whitespace-pre-wrap">
                      <p className="font-bold mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Code Analysis
                      </p>
                      {fileExplanation}
                    </div>
                  )}

                  {textExtensions.has(preview.extension) || preview.isCode ? (
                    <pre className="w-full max-h-[480px] overflow-auto rounded-xl border border-black/15 bg-neutral-950 text-neutral-100 p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {previewText}
                    </pre>
                  ) : previewUrl ? (
                    <div className="p-4 rounded-xl border border-black/10 bg-neutral-50 flex items-center justify-center">
                      <img src={previewUrl} alt={preview.originalName} className="max-h-96 max-w-full rounded-lg shadow-sm" />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== 3. AI ADVISOR TAB ===================== */}
        {(activeTab === 'advisor' || activeTab === 'review') && (
          <AIProjectAdvisorView
            project={project}
            files={files}
            review={review}
            onAnalyze={handleAnalyzeProject}
            analyzing={analyzing}
            onAddToRoadmap={handleAddTaskToRoadmap}
            onSelectFile={(fileName) => {
              handleTabChange('files');
              setFileSearch(fileName);
              const match = files.find(f => f.originalName === fileName || f.originalName.endsWith(fileName));
              if (match) handleShowPreview(match);
            }}
          />
        )}

        {/* ===================== 4. AI IDEAS TAB ===================== */}
        {activeTab === 'ideas' && (
          <ProjectIdeasView
            project={project}
            featureIdeas={review?.featureIdeas || []}
            onRefreshIdeas={handleRefreshIdeas}
            loadingIdeas={loadingIdeas}
            onAddToRoadmap={handleAddTaskToRoadmap}
          />
        )}

        {/* ===================== 5. ROADMAP TAB ===================== */}
        {activeTab === 'roadmap' && (
          <ProjectRoadmapView
            project={project}
            roadmapTasks={roadmapTasks}
            onUpdateStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTaskToRoadmap}
            onDeleteTask={handleDeleteRoadmapTask}
            onViewPlan={(item) => setSelectedPlanItem(item)}
          />
        )}

        {/* ===================== 6. DOCUMENTATION TAB ===================== */}
        {activeTab === 'docs' && (
          <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
              <div>
                <h2 className="text-xl font-bold text-black">Project Documentation & README</h2>
                <p className="text-xs text-black/50 mt-0.5">Maintain up-to-date documentation, setup guides, and architecture specs.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateReadmeWithAi}
                  disabled={generatingDocs}
                  className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generatingDocs ? 'Drafting README...' : 'Generate with AI'}</span>
                </button>

                {docsEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveDocumentation}
                    disabled={savingDocs}
                    className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingDocs ? 'Saving...' : 'Save README'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDocsEditing(true)}
                    className="btn-secondary py-2 px-4 text-xs"
                  >
                    Edit Markdown
                  </button>
                )}
              </div>
            </div>

            {docsEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-black/50">
                  <span>Markdown Editor</span>
                  <button
                    type="button"
                    onClick={() => setDocsEditing(false)}
                    className="text-black font-semibold hover:underline"
                  >
                    Switch to Preview
                  </button>
                </div>
                <textarea
                  value={docsContent}
                  onChange={(e) => setDocsContent(e.target.value)}
                  className="w-full min-h-[420px] font-mono text-xs p-4 rounded-xl border border-black/15 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 leading-relaxed"
                  placeholder="Enter project documentation in Markdown..."
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none p-6 rounded-xl border border-black/10 bg-neutral-50/50">
                <ReactMarkdown>{docsContent}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* ===================== 7. MEMBERS TAB ===================== */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-5 border-b border-black/10">
                <div>
                  <h2 className="text-xl font-bold text-black">Team & Collaborators</h2>
                  <p className="text-xs text-black/50 mt-0.5">Control role-based permissions and workspace access.</p>
                </div>
                <Users className="w-5 h-5 text-black" />
              </div>

              {/* Add Member Form */}
              {canManage && (
                <form onSubmit={handleAddMember} className="mt-6 flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter registered user's email..."
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    required
                    className="input-field text-xs py-2.5 flex-1"
                  />
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="input-field text-xs py-2.5 sm:w-36"
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{roleLabel(r)}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary py-2.5 px-4 text-xs inline-flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite</span>
                  </button>
                </form>
              )}

              {/* Members List */}
              <div className="mt-6 space-y-3">
                {/* Owner */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-black/10 bg-neutral-50">
                  <div>
                    <p className="font-bold text-sm text-black">{project.ownerId?.name || 'Project Owner'}</p>
                    <p className="text-xs text-black/50">{project.ownerId?.email}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-black text-white text-[11px] font-bold">
                    OWNER
                  </span>
                </div>

                {/* Additional Members */}
                {project.members
                  ?.filter(m => String(m.userId?._id || m.userId) !== String(project.ownerId?._id || project.ownerId))
                  .map(member => (
                    <div
                      key={member.userId?._id || member.userId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-black/10 bg-white gap-3"
                    >
                      <div>
                        <p className="font-bold text-sm text-black">{member.userId?.name || 'Collaborator'}</p>
                        <p className="text-xs text-black/50">{member.userId?.email}</p>
                        <p className="text-[10px] text-black/40 mt-0.5">
                          Joined {new Date(member.joinedAt || project.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {canManage ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.userId?._id || member.userId, e.target.value)}
                            className="input-field py-1.5 px-3 text-xs w-28"
                          >
                            {roles.map(r => (
                              <option key={r} value={r}>{roleLabel(r)}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-semibold text-black/60">{roleLabel(member.role)}</span>
                        )}

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.userId?._id || member.userId)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Remove Member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== 8. ACTIVITY & HISTORY TAB ===================== */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <div>
                  <h2 className="text-xl font-bold text-black">AI Review History & Activity Log</h2>
                  <p className="text-xs text-black/50 mt-0.5">Track quality score improvements, architectural changes, and workspace audits.</p>
                </div>
                <Clock className="w-5 h-5 text-black" />
              </div>

              {(Array.isArray(reviewHistory) ? reviewHistory : []).length === 0 ? (
                <div className="py-12 text-center text-sm text-black/50">
                  No review runs recorded yet. Run an AI review to begin tracking score progressions!
                </div>
              ) : (
                <div className="relative border-l border-black/10 ml-4 space-y-6 pl-6">
                  {(Array.isArray(reviewHistory) ? reviewHistory : []).map((hist, idx) => (
                    <div key={hist._id || idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-white" />

                      <div className="rounded-xl border border-black/10 bg-neutral-50/70 p-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-black">
                              Review Run #{reviewHistory.length - idx}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              hist.overallScore >= 80 ? 'bg-emerald-100 text-emerald-800' : hist.overallScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {hist.overallScore}/100
                            </span>
                            {hist.comparisonWithPrevious?.scoreDelta !== undefined && (
                              <span className={`text-xs font-bold ${hist.comparisonWithPrevious.scoreDelta >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                ({hist.comparisonWithPrevious.scoreDelta >= 0 ? '+' : ''}{hist.comparisonWithPrevious.scoreDelta} pts)
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-black/40">
                            {new Date(hist.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-black/70 leading-relaxed">
                          {hist.summary || 'Comprehensive code, architecture, and security evaluation.'}
                        </p>

                        {Array.isArray(hist.comparisonWithPrevious?.improvementsMade) && hist.comparisonWithPrevious.improvementsMade.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-black/5">
                            <p className="text-[11px] font-bold text-emerald-800">Verified Improvements:</p>
                            <ul className="text-[11px] text-black/70 list-disc list-inside mt-0.5">
                              {hist.comparisonWithPrevious.improvementsMade.map((imp, i) => (
                                <li key={i}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== 9. SETTINGS TAB ===================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-black mb-1">Project Settings</h2>
              <p className="text-xs text-black/50 mb-6">Manage project metadata, visibility, and workspace lifecycle.</p>

              {form && (
                <form onSubmit={handleSaveProject} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Project Name</label>
                    <input
                      disabled={!canManage}
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input-field text-xs py-2.5"
                      placeholder="e.g. AI Workflow Platform"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Description</label>
                    <textarea
                      disabled={!canManage}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="input-field text-xs py-2.5 min-h-24"
                      placeholder="Explain the project scope and purpose..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Technology Stack (Comma separated)</label>
                    <input
                      disabled={!canManage}
                      value={form.technologyStack}
                      onChange={e => setForm({ ...form, technologyStack: e.target.value })}
                      className="input-field text-xs py-2.5"
                      placeholder="React, Node.js, Express, MongoDB, TailwindCSS"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Category</label>
                      <input
                        disabled={!canManage}
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="input-field text-xs py-2.5"
                        placeholder="e.g. Web Development"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Visibility</label>
                      <select
                        disabled={!canManage}
                        value={form.visibility}
                        onChange={e => setForm({ ...form, visibility: e.target.value })}
                        className="input-field text-xs py-2.5"
                      >
                        <option value="PRIVATE">Private (Only Members)</option>
                        <option value="PUBLIC">Public (Visible to All)</option>
                      </select>
                    </div>
                  </div>

                  {canManage && (
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary py-2.5 px-5 text-xs inline-flex items-center gap-2"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Danger Zone */}
              <div className="border-t border-red-100 mt-8 pt-6">
                <h3 className="text-sm font-bold text-red-600 mb-1">Danger Zone</h3>
                <p className="text-xs text-black/50 mb-4">Irreversible workspace actions.</p>

                {isOwner ? (
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Project Permanently</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLeaveProject}
                    className="px-4 py-2 rounded-xl bg-neutral-100 border border-black/10 text-xs font-bold text-black/70 hover:bg-neutral-200 transition inline-flex items-center gap-2"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Leave Workspace</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Sticky "Ask AI" Action Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-black px-4 py-3 text-xs font-semibold text-white shadow-xl hover:bg-neutral-800 transition hover:scale-105"
      >
        <MessageSquare className="w-4 h-4 text-indigo-400" />
        <span>Ask Project AI</span>
      </button>

      {/* Slide-over Chat Drawer */}
      <ProjectChatDrawer
        project={project}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Resume Suggestions Modal */}
      <ProjectResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        project={project}
        review={review}
      />

      {/* Implementation Plan Modal */}
      <ImplementationPlanModal
        isOpen={!!selectedPlanItem}
        onClose={() => setSelectedPlanItem(null)}
        project={project}
        item={selectedPlanItem}
        onAddToRoadmap={handleAddTaskToRoadmap}
      />
    </div>
  );
};

export default ProjectWorkspace;
