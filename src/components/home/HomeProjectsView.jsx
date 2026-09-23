import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Plus, UploadCloud, Search, X, Sparkles,
  ArrowRight, AlertCircle, CheckCircle2, SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI } from '../../utils/api';
import ProjectCard from '../projects/ProjectCard';
import ImportProjectModal from '../projects/ImportProjectModal';

const sampleGuestProjects = [
  {
    _id: 'guest-1',
    name: 'CollabSphere Core Platform',
    description: 'Developer workspace with project context, multi-format file preview, markdown documentation, and Gemini AI assistant.',
    technologyStack: ['React.js', 'Node.js', 'Express', 'MongoDB'],
    category: 'Full Stack',
    visibility: 'PUBLIC',
    role: 'OWNER',
    memberCount: 6,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    latestReview: {
      overallScore: 84,
      status: 'REVIEWED'
    },
    isSample: true
  },
  {
    _id: 'guest-2',
    name: 'AI Code Review Agent',
    description: 'Automated pull request reviewer and security scanner using LLM embeddings and static code analysis.',
    technologyStack: ['Python', 'FastAPI', 'LangChain', 'Docker'],
    category: 'AI / ML',
    visibility: 'PUBLIC',
    role: 'VIEWER',
    memberCount: 4,
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    latestReview: {
      overallScore: 88,
      status: 'REVIEWED'
    },
    isSample: true
  },
  {
    _id: 'guest-3',
    name: 'Interactive Learning Platform',
    description: 'Student course platform with video player, note-taking canvas, and practice quizzes.',
    technologyStack: ['React.js', 'HTML', 'CSS', 'Node.js'],
    category: 'Frontend',
    visibility: 'PRIVATE',
    role: 'OWNER',
    memberCount: 2,
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    latestReview: {
      overallScore: 68,
      status: 'NEEDS_IMPROVEMENT'
    },
    isSample: true
  },
  {
    _id: 'guest-4',
    name: 'Distributed Real-Time Sync Engine',
    description: 'Low-latency event streaming engine using WebSockets, Redis Pub/Sub, and CRDT conflict-free resolution.',
    technologyStack: ['TypeScript', 'Redis', 'WebSockets', 'Node.js'],
    category: 'Backend / API',
    visibility: 'PUBLIC',
    role: 'VIEWER',
    memberCount: 5,
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    latestReview: {
      overallScore: null,
      status: 'NOT_REVIEWED'
    },
    isSample: true
  }
];

const emptyForm = { name: '', description: '', technologyStack: '', category: 'Full Stack', visibility: 'PRIVATE' };

const filterOptions = [
  { id: 'ALL', label: 'All Projects' },
  { id: 'OWNED', label: 'My Projects' },
  { id: 'PUBLIC', label: 'Public' },
  { id: 'PRIVATE', label: 'Private' },
  { id: 'REVIEWED', label: 'AI Reviewed' },
  { id: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement' }
];

const HomeProjectsView = ({ onNavigate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = () => {
    if (user) {
      setLoading(true);
      projectsAPI.getAll()
        .then((data) => {
          setProjects(data || []);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load projects');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setProjects(sampleGuestProjects);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter(project => {
      const textMatch = !query || `${project.name} ${project.description} ${(project.technologyStack || []).join(' ')}`.toLowerCase().includes(query);

      let filterMatch = true;
      if (filter === 'ALL') filterMatch = true;
      else if (filter === 'OWNED') filterMatch = project.role === 'OWNER';
      else if (filter === 'PUBLIC') filterMatch = project.visibility === 'PUBLIC';
      else if (filter === 'PRIVATE') filterMatch = project.visibility === 'PRIVATE';
      else if (filter === 'REVIEWED') {
        filterMatch = project.latestReview?.status === 'REVIEWED' || (project.latestReview?.overallScore && project.latestReview?.overallScore >= 75);
      } else if (filter === 'NEEDS_IMPROVEMENT') {
        filterMatch = project.latestReview?.status === 'NEEDS_IMPROVEMENT' || (project.latestReview?.overallScore && project.latestReview?.overallScore < 75);
      }

      return textMatch && filterMatch;
    });
  }, [projects, search, filter]);

  const handleOpenProject = (project) => {
    if (!project) return;
    if (project.isSample) {
      if (!user) {
        navigate('/signup');
      } else {
        toast('This is an interactive preview sample project.');
      }
      return;
    }
    const projectId = project._id || project.id;
    if (!projectId) {
      toast.error('Unable to open workspace: Missing project ID.');
      return;
    }
    navigate(`/projects/${projectId}`);
  };

  const handleOpenAiReview = (project) => {
    if (!project) return;
    if (project.isSample) {
      if (!user) {
        navigate('/signup');
      } else {
        toast('Create or import your own project to analyze with AI.');
      }
      return;
    }
    const projectId = project._id || project.id;
    if (!projectId) {
      toast.error('Unable to open AI review: Missing project ID.');
      return;
    }
    navigate(`/projects/${projectId}/ai-review`);
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Project name is required.');
      return;
    }

    if (!user) {
      navigate('/signup');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        technologyStack: form.technologyStack.split(',').map(s => s.trim()).filter(Boolean)
      };
      const result = await projectsAPI.create(payload);
      setShowCreate(false);
      setForm(emptyForm);
      toast.success('Workspace created successfully!');
      if (result.project?._id) {
        navigate(`/projects/${result.project._id}`);
      } else {
        fetchProjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 space-y-8"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Modern Redesigned Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-black/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-black/60 mb-2.5">
            <FolderKanban className="h-3.5 w-3.5" /> Collaboration Workspaces
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Projects & Workspaces
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60 sm:text-base">
            Build, analyze, improve, and collaborate on your projects with AI.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (!user) { navigate('/signup'); return; }
              setShowImport(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-black shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import Project</span>
          </button>

          <button
            onClick={() => {
              if (!user) { navigate('/signup'); return; }
              setShowCreate(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Project</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Explanatory Notice */}
      {!user && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-5 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Exploring in Guest Mode</p>
              <p className="text-xs text-black/60">
                Sign in to import real ZIP archives or Git repos, generate AI architecture reviews, track roadmaps, and review code.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-100"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Start Free
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black placeholder:text-black/35"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Project Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {filterOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === item.id
                  ? 'bg-black text-white shadow-sm'
                  : 'border border-black/10 bg-white text-black/60 hover:border-black/25 hover:text-black'
              }`}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-1 text-xs font-medium text-black/45">
            {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-black/10 bg-neutral-50 p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-neutral-200" />
              <div className="h-5 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
              <div className="h-10 w-full rounded-xl bg-neutral-200 pt-4" />
            </div>
          ))}
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/20 bg-neutral-50/50 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-black text-white mb-4">
            <FolderKanban className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-black">
            {projects.length ? 'No matching projects found' : 'No projects created yet'}
          </h3>
          <p className="mt-1 text-sm text-black/55 max-w-sm mx-auto">
            {projects.length
              ? 'Try adjusting your search terms or clearing the active filter.'
              : 'Create or import your first developer workspace to start analyzing architecture and tracking roadmaps.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (!user) { navigate('/signup'); return; }
                setShowImport(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-50"
            >
              <UploadCloud className="h-4 w-4" /> Import ZIP / Git
            </button>
            <button
              onClick={() => {
                if (!user) { navigate('/signup'); return; }
                setShowCreate(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" /> Create project now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpen={handleOpenProject}
              onOpenAiReview={handleOpenAiReview}
              onShare={() => {
                const url = `${window.location.origin}/share/${project.publicSlug || project._id}`;
                navigator.clipboard.writeText(url);
                toast.success('Workspace link copied to clipboard!');
              }}
            />
          ))}
        </div>
      )}

      {/* Import Project Modal */}
      <ImportProjectModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={(newProject) => {
          fetchProjects();
          if (newProject?._id) {
            navigate(`/projects/${newProject._id}`);
          }
        }}
        existingProjects={projects.filter(p => !p.isSample)}
      />

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl sm:p-8 z-10"
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-black">Create Workspace</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-full p-2 text-black/40 hover:bg-neutral-100 hover:text-black transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. NextGen Microservices Platform"
                    className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the project purpose and architectural scope..."
                    className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2 text-sm text-black outline-none focus:border-black focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                    Technology Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.technologyStack}
                    onChange={(e) => setForm({ ...form, technologyStack: e.target.value })}
                    placeholder="React, TypeScript, Express, MongoDB, Tailwind"
                    className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white"
                    >
                      <option value="Full Stack">Full Stack</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend / API">Backend / API</option>
                      <option value="AI / Machine Learning">AI / Machine Learning</option>
                      <option value="DevOps & Cloud">DevOps & Cloud</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                      Visibility
                    </label>
                    <select
                      value={form.visibility}
                      onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                      className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white"
                    >
                      <option value="PRIVATE">Private (Restricted)</option>
                      <option value="PUBLIC">Public (Shareable)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold text-black/70 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomeProjectsView;
