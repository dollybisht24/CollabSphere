import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, UploadCloud, GitBranch, Copy, AlertCircle, CheckCircle2,
  FolderArchive, Globe, Lock, Sparkles, ArrowRight, FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsAPI } from '../../utils/api';

const ImportProjectModal = ({ isOpen, onClose, onSuccess, existingProjects = [] }) => {
  const [tab, setTab] = useState('upload'); // 'upload' | 'git' | 'workspace'
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Full Stack');
  const [visibility, setVisibility] = useState('PRIVATE');

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Git state
  const [gitUrl, setGitUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');

  // Workspace copy state
  const [sourceProjectId, setSourceProjectId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('Please select a .zip archive file.');
        return;
      }
      setSelectedFile(file);
      setError('');
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('Please select a .zip archive file.');
        return;
      }
      setSelectedFile(file);
      setError('');
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'upload' && !selectedFile) {
      setError('Please choose a ZIP project file to upload.');
      return;
    }

    if (tab === 'git') {
      if (!gitUrl.trim()) {
        setError('Please enter a Git repository URL.');
        return;
      }
      if (!/^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(gitUrl.trim())) {
        setError('Please enter a valid HTTPS Git repository URL (e.g. https://github.com/owner/repo)');
        return;
      }
    }

    if (tab === 'workspace' && !sourceProjectId) {
      setError('Please select an existing workspace to import from.');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (tab === 'upload') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (name.trim()) formData.append('name', name.trim());
        if (description.trim()) formData.append('description', description.trim());
        formData.append('category', category);
        formData.append('visibility', visibility);

        response = await projectsAPI.importProject(formData);
      } else if (tab === 'git') {
        response = await projectsAPI.importProject({
          gitUrl: gitUrl.trim(),
          gitBranch: gitBranch.trim(),
          name: name.trim(),
          description: description.trim(),
          category,
          visibility
        });
      } else {
        response = await projectsAPI.importProject({
          sourceProjectId,
          name: name.trim(),
          description: description.trim(),
          category,
          visibility
        });
      }

      toast.success(response.message || 'Project imported successfully!');
      if (onSuccess && response.project) {
        onSuccess(response.project);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-black/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-semibold text-black/60 uppercase tracking-wider mb-1.5">
              <Sparkles className="h-3 w-3" /> Professional Workspace Import
            </div>
            <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
              Import Project to Workspace
            </h2>
            <p className="mt-1 text-xs text-black/55 sm:text-sm">
              Upload source code, connect a Git repository, or clone an existing workspace.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-black/40 hover:bg-neutral-100 hover:text-black transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-5 grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-neutral-100/70 border border-black/5">
          <button
            type="button"
            onClick={() => { setTab('upload'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              tab === 'upload'
                ? 'bg-white text-black shadow-sm'
                : 'text-black/60 hover:text-black hover:bg-white/50'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload ZIP</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('git'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              tab === 'git'
                ? 'bg-white text-black shadow-sm'
                : 'text-black/60 hover:text-black hover:bg-white/50'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span>Git Repo</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('workspace'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
              tab === 'workspace'
                ? 'bg-white text-black shadow-sm'
                : 'text-black/60 hover:text-black hover:bg-white/50'
            }`}
          >
            <Copy className="h-4 w-4" />
            <span>Workspace</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* TAB 1: Upload Project */}
          {tab === 'upload' && (
            <div>
              <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-2">
                Project ZIP Archive
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                  isDragging
                    ? 'border-black bg-neutral-50'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-50/20'
                    : 'border-black/15 bg-neutral-50/50 hover:border-black/30'
                }`}
              >
                <input
                  type="file"
                  id="project-zip-input"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <FolderArchive className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-black">{selectedFile.name}</p>
                    <p className="text-xs text-black/50">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to inspect</p>
                    <label
                      htmlFor="project-zip-input"
                      className="inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer pt-1"
                    >
                      Change ZIP File
                    </label>
                  </div>
                ) : (
                  <label htmlFor="project-zip-input" className="cursor-pointer space-y-2 block">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-black/60">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-black">
                      Click to choose ZIP archive or drag and drop
                    </p>
                    <p className="text-xs text-black/45">
                      Supports React, Node.js, Next.js, Python, full-stack repos (Max 50MB)
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-black/65">
                        <FileCode className="h-3 w-3" /> Auto-extracts code, README, and dependencies
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Git Repository */}
          {tab === 'git' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                  Git Repository HTTPS URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                  <input
                    type="url"
                    value={gitUrl}
                    onChange={(e) => {
                      setGitUrl(e.target.value);
                      if (!name) {
                        const m = e.target.value.match(/\/([^/]+?)(?:\.git)?$/);
                        if (m) setName(m[1].replace(/[-_]/g, ' '));
                      }
                    }}
                    placeholder="https://github.com/username/repository.git"
                    className="w-full rounded-xl border border-black/10 bg-neutral-50/50 pl-10 pr-4 py-2.5 text-sm text-black placeholder:text-black/35 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
                  />
                </div>
                <p className="mt-1 text-[11px] text-black/45">
                  HTTPS clones only. Secrets and API keys are automatically masked before inspection.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                  Branch (Optional)
                </label>
                <div className="relative">
                  <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    placeholder="main or master"
                    className="w-full rounded-xl border border-black/10 bg-neutral-50/50 pl-10 pr-4 py-2.5 text-sm text-black placeholder:text-black/35 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Existing Workspace */}
          {tab === 'workspace' && (
            <div>
              <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                Select Existing Workspace to Clone
              </label>
              {existingProjects.length === 0 ? (
                <div className="rounded-xl border border-black/10 bg-neutral-50 p-4 text-center text-xs text-black/50">
                  No existing workspaces found. Use Upload ZIP or Git Repo to import.
                </div>
              ) : (
                <select
                  value={sourceProjectId}
                  onChange={(e) => {
                    setSourceProjectId(e.target.value);
                    const selected = existingProjects.find(p => p._id === e.target.value);
                    if (selected && !name) {
                      setName(`${selected.name} (Copy)`);
                    }
                  }}
                  className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white"
                >
                  <option value="">Select a workspace...</option>
                  {existingProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.category || 'General'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Common Project Metadata Fields */}
          <div className="pt-2 border-t border-black/5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Learning Path Platform"
                className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-black placeholder:text-black/35 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                Project Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of project goals, features, or architecture..."
                rows={2}
                className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2 text-sm text-black placeholder:text-black/35 outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-black outline-none focus:border-black focus:bg-white"
                >
                  <option value="PRIVATE">Private (Workspace members only)</option>
                  <option value="PUBLIC">Public (Shareable showcase)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold text-black/70 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Importing & Inspecting...</span>
                </>
              ) : (
                <>
                  <span>Import Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ImportProjectModal;
