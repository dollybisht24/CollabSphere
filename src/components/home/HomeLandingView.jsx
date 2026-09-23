import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, Bot, CheckCircle2, ChevronRight, FileCode2, FileText,
  LockKeyhole, Network, Settings, Sparkles, UploadCloud, Users
} from 'lucide-react';

const codeWorkspaceImage = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&h=1100&fit=crop&q=85';
const collaborationImage = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&h=900&fit=crop&q=82';
const heroBackgroundImage = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&h=1100&fit=crop&q=82';

const capabilities = [
  'Project workspaces',
  'Team collaboration',
  'File upload',
  'File preview',
  'Code organization',
  'AI assistant',
  'Documentation',
  'Activity tracking',
  'Member management',
  'Privacy and access control'
];

const workflow = [
  ['01', 'Create', 'Create a project workspace.'],
  ['02', 'Connect', 'Invite teammates, files, and project context.'],
  ['03', 'Understand', 'Use AI to explore and understand the project.'],
  ['04', 'Share', 'Keep documentation and project knowledge connected.']
];

const stack = ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Gemini API'];
const fileTree = ['src/', 'components/', 'pages/', 'utils/', 'server.js', 'package.json', 'README.md'];

const Logo = ({ dark = false }) => (
  <div className="flex items-center gap-3">
    <span className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-semibold ${dark ? 'border-white/15 bg-white text-black' : 'border-black/10 bg-black text-white'}`}>C</span>
    <span className="min-w-0">
      <span className={`block truncate text-sm font-semibold tracking-tight ${dark ? 'text-white' : 'text-black'}`}>CollabSphere</span>
      <span className={`block truncate text-[11px] font-medium ${dark ? 'text-white/45' : 'text-black/45'}`}>Developer collaboration workspace</span>
    </span>
  </div>
);

const Window = ({ children, className = '' }) => (
  <div className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_14px_46px_rgba(0,0,0,.07)] ${className}`}>
    <div className="flex items-center gap-2 border-b border-black/10 bg-neutral-50 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff6868]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#f6c85f]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#35c28f]" />
      <span className="ml-3 truncate text-[11px] font-semibold text-black/40">collabsphere / workspace</span>
    </div>
    {children}
  </div>
);

const DashboardPreview = ({ large = false }) => (
  <Window className={large ? 'w-full' : ''}>
    <div className="grid min-h-[520px] bg-white text-black md:grid-cols-[210px_1fr]">
      <aside className="hidden border-r border-black/10 bg-neutral-50 p-4 md:block">
        <Logo />
        <div className="mt-8 space-y-1">
          {[
            [FileText, 'Overview'],
            [FileCode2, 'Files'],
            [Users, 'Members'],
            [Bot, 'AI Assistant'],
            [FileText, 'Documentation'],
            [Activity, 'Activity'],
            [Settings, 'Settings']
          ].map(([Icon, label], index) => (
            <div key={label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${index === 0 ? 'bg-black text-white' : 'text-black/50 hover:bg-white hover:text-black'}`}>
              <Icon className="h-4 w-4" /> {label}
            </div>
          ))}
        </div>
      </aside>
      <main className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[.18em] text-black/40">Project summary</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">What CollabSphere does</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">A developer collaboration workspace where teams create projects, manage files, write documentation, track activity, and use AI to understand project context.</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/60"><LockKeyhole className="h-3.5 w-3.5" /> Private</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-medium text-white"><Sparkles className="h-3.5 w-3.5" /> AI ready</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Core workspace features</h4>
              <UploadCloud className="h-4 w-4 text-black/45" />
            </div>
            <div className="mt-4 space-y-2">
              {['Create private project workspaces', 'Upload and preview project files', 'Maintain notes and documentation', 'Track team activity and contributions'].map((feature) => (
                <div key={feature} className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-3 text-sm">
                  <span className="inline-flex min-w-0 items-center gap-2 font-medium text-black/70"><CheckCircle2 className="h-4 w-4 shrink-0 text-black/45" /><span className="truncate">{feature}</span></span>
                  <ChevronRight className="h-4 w-4 text-black/35" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-black p-4 text-white">
            <div className="flex items-center gap-2"><Bot className="h-4 w-4" /><h4 className="text-sm font-semibold">Project-aware AI</h4></div>
            <div className="mt-4 rounded-xl bg-white/10 p-3 text-sm text-white/70">Ask questions about uploaded files, code structure, documentation, and project context.</div>
            <div className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-black/70">CollabSphere helps developers understand how a project works without switching between scattered tools.</div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-black/10 bg-white p-4">
            <Users className="h-5 w-5 text-black/45" />
            <h4 className="mt-4 text-sm font-semibold">Team collaboration</h4>
            <p className="mt-1 text-sm text-black/50">Bring members into shared project spaces with controlled access.</p>
          </section>
          <section className="rounded-2xl border border-black/10 bg-white p-4">
            <FileText className="h-5 w-5 text-black/45" />
            <h4 className="mt-4 text-sm font-semibold">Living documentation</h4>
            <p className="mt-1 text-sm text-black/50">Store README notes, setup details, and project decisions.</p>
          </section>
          <section className="rounded-2xl border border-black/10 bg-white p-4">
            <Activity className="h-5 w-5 text-black/45" />
            <h4 className="mt-4 text-sm font-semibold">Activity tracking</h4>
            <p className="mt-1 text-sm text-black/50">Keep project updates visible for everyone on the team.</p>
          </section>
        </div>
      </main>
    </div>
  </Window>
);

const SectionIntro = ({ eyebrow, title, text, center = false }) => (
  <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
    <p className="text-xs font-semibold uppercase tracking-[.22em] text-black/40">{eyebrow}</p>
    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-5xl">{title}</h2>
    {text && <p className="mt-5 text-base leading-8 text-black/55 sm:text-lg">{text}</p>}
  </div>
);

const HomeLandingView = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-black/10 bg-black">
        <img
          src={heroBackgroundImage}
          alt="Minimal professional developer workspace background"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/88 via-black/72 to-black/64" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.12),transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[640px] max-w-7xl items-end px-4 pb-28 pt-24 sm:min-h-[720px] sm:px-6 sm:pb-32 lg:min-h-[780px] lg:px-10 lg:pb-36">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 text-xs font-semibold tracking-[.2em] text-black/70 shadow-[0_10px_30px_rgba(0,0,0,.22)]">
              <Sparkles className="h-4 w-4" /> PROJECT WORKSPACE FOR DEVELOPERS
            </div>
            <div>
              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.7)] sm:text-6xl lg:text-7xl">
                <span className="block">Build smarter projects with your team</span>
                <span className="block">and AI.</span>
              </h1>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              One connected workspace for projects, multi-format files, documentation, team roles, and project-aware AI assistance.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('projects')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-105"
              >
                Explore Projects <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate('interview')}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Sparkles className="h-4 w-4" /> AI Interview Practice
              </button>
              <button
                onClick={() => onNavigate('ai')}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3.5 text-sm font-medium text-white/70 hover:text-white"
              >
                <Bot className="h-4 w-4" /> AI Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Summary */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,.04)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[.22em] text-black/55">About this project</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black sm:text-4xl">CollabSphere in summary</h2>
              <p className="mt-5 text-base leading-8 text-black/75">
                CollabSphere is a developer collaboration workspace built to keep projects organized. Teams can create workspaces, manage members, upload and preview files, practice AI mock interviews, follow project activity, and use an AI assistant with project context.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('projects')}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-black/80"
                >
                  Go to Projects <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('interview')}
                  className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-100"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Practice Interviews
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Projects', 'Create and manage developer workspaces.', 'projects'],
                ['AI Interview', 'Adaptive technical & HR mock interviews.', 'interview'],
                ['Files & Code', 'Upload, preview, and organize project files.', 'features'],
                ['AI Assistant', 'Ask questions about project context and code.', 'ai']
              ].map(([title, text, navTarget]) => (
                <div
                  key={title}
                  onClick={() => onNavigate(navTarget)}
                  className="group cursor-pointer rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,.04)] transition hover:-translate-y-0.5 hover:border-black/30"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-black">{title}</h3>
                    <ChevronRight className="h-4 w-4 text-black/30 group-hover:text-black transition" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-black/70">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why CollabSphere */}
      <section className="border-y border-black/10 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-10 lg:py-32">
          <SectionIntro
            eyebrow="Why CollabSphere"
            title="Your project shouldn't be scattered across tools."
            text="Project knowledge often gets split across repositories, files, documentation, team conversations and updates. CollabSphere connects the pieces into one developer workspace."
          />
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,.05)]">
            <div className="grid gap-3">
              {[
                [FileCode2, 'Code', 'Source files and implementation details'],
                [FileText, 'Docs', 'README notes and project decisions'],
                [UploadCloud, 'Files', 'Uploads, previews, and shared assets'],
                [Users, 'Team', 'Members, roles, and collaboration'],
                [Activity, 'Activity', 'Updates that show project movement']
              ].map(([Icon, title, text], index) => (
                <div key={title} className="flex items-center gap-4 rounded-xl border border-black/10 bg-white p-4 transition hover:border-black/20 hover:bg-neutral-50">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black text-white"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-black/50">{text}</p>
                  </div>
                  <span className="hidden text-xs font-semibold text-black/25 sm:block">{String(index + 1).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
            <div className="my-5 flex items-center gap-3 px-2"><div className="h-px flex-1 bg-black/10" /><div className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><ArrowRight className="h-4 w-4" /></div><div className="h-px flex-1 bg-black/10" /></div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-black text-white">
              <div className="border-b border-white/10 p-5">
                <p className="text-xs font-medium uppercase tracking-[.2em] text-white/40">CollabSphere</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-black"><Network className="h-5 w-5" /></div>
                  <div>
                    <p className="text-lg font-semibold">One connected workspace</p>
                    <p className="mt-1 text-sm leading-6 text-white/60">Files, notes, members, AI context and activity stay tied to the project.</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 bg-white/[.04] p-5 sm:grid-cols-3">
                {['Project context', 'Shared knowledge', 'AI ready'].map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-xs font-semibold text-white/70">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Files + AI Section */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:px-10 lg:py-32">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-white/40">Files + AI</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Upload your code. Understand it with AI.</h2>
            <p className="mt-5 text-lg leading-8 text-white/60">Upload project files and use the AI assistant to understand code, documentation and project context.</p>
            <div className="mt-8 grid gap-3 text-sm font-medium text-white/70">
              {['Supported file upload', 'File preview', 'Project-aware AI', 'Code understanding'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-white" /> {item}</span>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => onNavigate('ai')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Open AI Assistant <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
            <img src={codeWorkspaceImage} alt="Dark code editor in a developer workspace" className="absolute inset-0 h-full w-full object-cover object-center opacity-35" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black/75 to-black/35" />
            <div className="relative ml-auto mt-6 max-w-2xl">
              <Window className="border-white/10 shadow-[0_20px_80px_rgba(0,0,0,.35)]">
                <div className="grid bg-white text-black md:grid-cols-[1fr_1.15fr]">
                  <aside className="relative min-h-[340px] overflow-hidden border-b border-black/10 bg-black p-5 text-white md:border-b-0 md:border-r">
                    <img src={codeWorkspaceImage} alt="Code editor and developer workspace" className="absolute inset-0 h-full w-full object-cover object-center opacity-55" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/42 to-black/15" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur">
                        <FileCode2 className="h-4 w-4" /> Code workspace
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">Project files, context, and AI in one view.</h3>
                        <p className="mt-2 text-xs leading-5 text-white/70">Preview uploaded files and ask project-aware questions without leaving the workspace.</p>
                      </div>
                    </div>
                  </aside>
                  <section className="p-5">
                    <div className="flex items-center justify-between"><p className="text-sm font-semibold">Files</p><UploadCloud className="h-4 w-4 text-black/45" /></div>
                    <div className="mt-4 space-y-2">
                      {fileTree.slice(0, 5).map((file, index) => (
                        <div key={file} className={`rounded-lg px-3 py-2 text-xs font-medium ${index === 4 ? 'bg-black text-white' : 'bg-neutral-100 text-black/55'}`}>{file}</div>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-lg bg-black text-white"><Bot className="h-4 w-4" /></div><div><h3 className="text-xs font-semibold">AI Assistant</h3><p className="text-[10px] text-black/45">Project context enabled</p></div></div>
                    <div className="mt-3 rounded-xl bg-neutral-100 p-3 text-xs font-medium text-black/70">Explain how authentication works in this project.</div>
                  </section>
                </div>
              </Window>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-32">
        <SectionIntro center eyebrow="Workflow" title="From idea to finished project." />
        <div className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-4">
          {workflow.map(([number, title, text], index) => (
            <div key={number} className="relative border-l border-black/10 pl-6 md:border-l-0 md:border-t md:pl-0 md:pt-6">
              <span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-black md:-top-[5px] md:left-0" />
              <span className="text-xs font-medium text-black/35">{number}</span>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/55">{text}</p>
              {index < workflow.length - 1 && <div className="absolute left-full top-0 hidden h-px w-4 bg-black/10 md:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* Projects Dashboard Preview Section */}
      <section className="border-y border-black/10 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-32">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <SectionIntro
              eyebrow="Workspaces"
              title="One workspace for your entire project."
              text="A polished project dashboard for files, members, documentation, AI context, and activity."
            />
            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shrink-0 hover:bg-black/80"
            >
              Open Projects View <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-10"><DashboardPreview large /></div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <SectionIntro
            eyebrow="Capabilities"
            title="Built around real project workflows."
            text="CollabSphere focuses on workspace functionality already represented in the product: projects, files, AI, documentation, activity, members, and access control."
          />
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {['Create project', 'Invite team', 'Upload files', 'Collaborate', 'Ask AI', 'Track activity'].map((item, index) => (
                <div key={item} className="relative rounded-xl border border-black/10 bg-neutral-50 p-4">
                  <span className="text-[11px] font-medium text-black/35">0{index + 1}</span>
                  <p className="mt-3 text-sm font-medium text-black/70">{item}</p>
                  {index < 5 && <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-black/10 sm:block" />}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {capabilities.map((item) => (
                <span key={item} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/45">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-32">
        <div className="rounded-2xl bg-black p-8 text-white sm:p-12">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Ready to build your next project?</h2>
              <p className="mt-4 max-w-xl text-white/60">Create a workspace, bring your team together, and keep your project knowledge connected.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('projects')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:-translate-y-1"
              >
                Go to Projects <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate('ai')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open AI Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-y border-black/10 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[.6fr_1.4fr] lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-black/40">Tech stack</p>
            <h2 className="mt-3 text-2xl font-semibold">Built with the project’s actual stack.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {stack.map((item) => (
              <span key={item} className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/65">{item}</span>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomeLandingView;
