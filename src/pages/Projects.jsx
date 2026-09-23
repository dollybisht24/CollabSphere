import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, UploadCloud, Search, X, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../utils/api';
import ProjectCard from '../components/projects/ProjectCard';
import ImportProjectModal from '../components/projects/ImportProjectModal';

const emptyForm = { name: '', description: '', technologyStack: '', category: 'Full Stack', visibility: 'PRIVATE' };

const filterOptions = [
  { id: 'ALL', label: 'All Projects' },
  { id: 'OWNED', label: 'My Projects' },
  { id: 'PUBLIC', label: 'Public' },
  { id: 'PRIVATE', label: 'Private' },
  { id: 'REVIEWED', label: 'AI Reviewed' },
  { id: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement' }
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadProjects = () => {
    setLoading(true);
    projectsAPI.getAll()
      .then(setProjects)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

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

  const createProject = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Project name is required');
    try {
      setSaving(true);
      const payload = {
        ...form,
        technologyStack: form.technologyStack.split(',').map(item => item.trim()).filter(Boolean)
      };
      const { project } = await projectsAPI.create(payload);
      setForm(emptyForm);
      setShowCreate(false);
      toast.success('Workspace created successfully!');
      navigate(`/projects/${project._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenProject = (project) => {
    if (!project) return;
    const projectId = project._id || project.id;
    if (!projectId) {
      toast.error('Unable to open workspace: Missing project ID.');
      return;
    }
    navigate(`/projects/${projectId}`);
  };

  const handleOpenAiReview = (project) => {
    if (!project) return;
    const projectId = project._id || project.id;
    if (!projectId) {
      toast.error('Unable to open AI review: Missing project ID.');
      return;
    }
    navigate(`/projects/${projectId}/ai-review`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-black/60 mb-2">
            <FolderKanban className="w-3.5 h-3.5" /> Collaboration
          </div>
          <h1 className="text-3xl font-bold text-black tracking-tight">Projects & Workspaces</h1>
          <p className="text-sm text-black/60 mt-1">Build, analyze, improve, and collaborate on your projects with AI.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-black hover:bg-neutral-50 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" /> Import Project
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 shadow-sm"
          >
            <Plus className="w-4 h-4" /> + Create Project
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-black placeholder:text-black/35"
            placeholder="Search projects by name, description, or stack..."
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {filterOptions.map(item => (
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
          {[1, 2, 3, 4, 5, 6].map(i => (
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
            <FolderKanban className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-black">
            {projects.length ? 'No matching projects found' : 'No workspaces created yet'}
          </h2>
          <p className="text-sm text-black/60 mt-1 max-w-sm mx-auto">
            {projects.length ? 'Try another search term or filter tag.' : 'Create or import your first developer workspace to start collaborating.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-50"
            >
              <UploadCloud className="w-4 h-4" /> Import ZIP / Git
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <Plus className="w-4 h-4" /> Create Workspace
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleProjects.map(project => (
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
          loadProjects();
          if (newProject?._id) {
            navigate(`/projects/${newProject._id}`);
          }
        }}
        existingProjects={projects}
      />

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={createProject} className="bg-white rounded-3xl shadow-2xl border border-black/10 w-full max-w-xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-black">Create Workspace</h2>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} aria-label="Close" className="rounded-full p-2 text-black/40 hover:bg-neutral-100 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">Workspace Name</label>
              <input
                autoFocus
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-black focus:bg-white"
                placeholder="e.g. NextGen Distributed Platform"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2 text-sm outline-none focus:border-black focus:bg-white resize-none"
                placeholder="Project overview and architectural scope..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">Technology Stack</label>
              <input
                value={form.technologyStack}
                onChange={e => setForm({ ...form, technologyStack: e.target.value })}
                className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-black focus:bg-white"
                placeholder="React, TypeScript, Node.js, Express, MongoDB"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-black focus:bg-white"
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
                <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">Visibility</label>
                <select
                  value={form.visibility}
                  onChange={e => setForm({ ...form, visibility: e.target.value })}
                  className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-black focus:bg-white"
                >
                  <option value="PRIVATE">Private (Restricted)</option>
                  <option value="PUBLIC">Public (Shareable)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
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
                className="rounded-xl bg-black px-6 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Projects;
