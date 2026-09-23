import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, Bot, CheckCircle2, ChevronRight, Code2,
  FileCode2, FileText, LockKeyhole, ShieldCheck, Sparkles,
  UploadCloud, Users, Zap, Eye, Database, Terminal
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Project-Aware AI Assistant',
    subtitle: 'Intelligent answers grounded in your actual code and files.',
    description: 'Ask questions about authorized project files, architecture patterns, dependencies, and functions. CollabSphere AI understands project context rather than giving generic answers.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&h=560&fit=crop&q=82',
    tags: ['Gemini API', 'Code Understanding', 'Context-Aware']
  },
  {
    icon: Users,
    title: 'Team Workspaces & Roles',
    subtitle: 'Granular permissions for owners, admins, members, and viewers.',
    description: 'Invite collaborators to dedicated workspaces with role-based access control. Ensure private repositories and intellectual property remain protected while enabling friction-free team work.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=560&fit=crop&q=82',
    tags: ['RBAC', 'Team Sharing', 'Access Control']
  },
  {
    icon: FileCode2,
    title: 'Multi-Format Code & File Viewer',
    subtitle: 'Inspect code, scripts, markdown, and images in one tab.',
    description: 'Upload source files in JS, TS, Python, Go, HTML, CSS, JSON, and CSV. Preview files with syntax formatting and immediate download options.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&h=560&fit=crop&q=82',
    tags: ['15+ Languages', 'Instant Preview', 'Drag & Drop']
  },
  {
    icon: FileText,
    title: 'Living Documentation',
    subtitle: 'Keep notes, architecture decisions, and READMEs close to the code.',
    description: 'Eliminate out-of-date wikis. Maintain real-time Markdown notes and architectural decision records right alongside your team’s codebase.',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&h=560&fit=crop&q=82',
    tags: ['Markdown', 'Architecture Notes', 'Versioned']
  },
  {
    icon: Activity,
    title: 'Real-Time Activity Trail',
    subtitle: 'Auditable timeline of updates, uploads, and AI queries.',
    description: 'Track exactly what changed, when files were uploaded, and when teammates joined the workspace. Stay aligned without endless status meetings.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=560&fit=crop&q=82',
    tags: ['Audit Log', 'Event Stream', 'Team Visibility']
  },
  {
    icon: ShieldCheck,
    title: 'Private & Secure by Default',
    subtitle: 'End-to-end token verification and scoped database queries.',
    description: 'All workspaces and sensitive files are shielded behind JWT authentication. Choose between private workspaces for internal teams or public projects for open-source sharing.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&h=560&fit=crop&q=82',
    tags: ['JWT Auth', 'Scoped Access', 'Zero-Leak Policy']
  }
];

const interactivePreviews = {
  files: {
    title: 'Files & Code Viewer',
    desc: 'Syntax-highlighted preview of project source code with instant AI explanations.',
    content: (
      <div className="rounded-xl border border-black/10 bg-neutral-900 p-4 text-xs font-mono text-neutral-200 space-y-1">
        <div className="text-neutral-500">// server/middleware/auth.js</div>
        <div><span className="text-purple-400">export const</span> <span className="text-blue-400">authMiddleware</span> = (<span className="text-orange-300">req</span>, <span className="text-orange-300">res</span>, <span className="text-orange-300">next</span>) =&gt; &#123;</div>
        <div className="pl-4"><span className="text-purple-400">const</span> token = req.headers.authorization?.split(<span className="text-green-300">' '</span>)[1];</div>
        <div className="pl-4"><span className="text-purple-400">if</span> (!token) <span className="text-purple-400">return</span> res.status(401).json(&#123; error: <span className="text-green-300">'Access denied'</span> &#125;);</div>
        <div className="pl-4"><span className="text-purple-400">const</span> decoded = jwt.verify(token, process.env.JWT_SECRET);</div>
        <div className="pl-4">req.userId = decoded.userId;</div>
        <div className="pl-4">next();</div>
        <div>&#125;;</div>
      </div>
    )
  },
  ai: {
    title: 'Project-Aware AI Query',
    desc: 'The assistant identifies functions and summarizes security implications in seconds.',
    content: (
      <div className="rounded-xl border border-black/10 bg-white p-4 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-black/50 font-semibold">
          <Bot className="h-4 w-4 text-black" /> CollabSphere AI Analysis
        </div>
        <div className="rounded-lg bg-neutral-50 p-3 text-black/80 leading-relaxed border border-black/5">
          "The auth middleware verifies Bearer tokens from the request headers using JWT secrets. It attaches <code>req.userId</code> to the request object, ensuring subsequent route handlers have authenticated context."
        </div>
      </div>
    )
  },
  team: {
    title: 'Team Permissions & RBAC',
    desc: 'Assign granular roles to keep sensitive project workspaces protected.',
    content: (
      <div className="rounded-xl border border-black/10 bg-white p-4 space-y-2 text-xs">
        {[
          { name: 'Alex Rivers', email: 'alex@company.com', role: 'Owner' },
          { name: 'Sarah Chen', email: 'sarah@company.com', role: 'Admin' },
          { name: 'Devin Patel', email: 'devin@company.com', role: 'Member' }
        ].map(m => (
          <div key={m.name} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-black/5">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-black text-white grid place-items-center font-bold text-[10px]">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-black">{m.name}</p>
                <p className="text-[10px] text-black/45">{m.email}</p>
              </div>
            </div>
            <span className="rounded-md bg-black text-white px-2 py-0.5 text-[10px] font-semibold">
              {m.role}
            </span>
          </div>
        ))}
      </div>
    )
  },
  activity: {
    title: 'Real-Time Activity Stream',
    desc: 'A transparent audit trail for all workspace modifications and member actions.',
    content: (
      <div className="rounded-xl border border-black/10 bg-white p-4 space-y-3 text-xs">
        {[
          { text: 'Sarah uploaded README.md', time: '10 minutes ago' },
          { text: 'Devin ran AI explanation on auth.js', time: '35 minutes ago' },
          { text: 'New member invited: Taylor Brooks', time: '2 hours ago' }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-black shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-black/80 font-medium">{item.text}</span>
              <span className="text-[10px] text-black/40">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
};

const HomeFeaturesView = ({ onNavigate }) => {
  const [activePreview, setActivePreview] = useState('files');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 space-y-16"
    >
      {/* Header section styled like Home */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-black/10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-black/60 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Capabilities & Value
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Everything your project needs, connected.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60 sm:text-base">
            CollabSphere brings code files, team members, documentation, and project-aware AI into a single cohesive workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            Explore Projects <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 6 Core Feature Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, subtitle, description, image, tags }) => (
          <article
            key={title}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-black/10 bg-white transition duration-200 hover:-translate-y-1 hover:border-black/30 hover:shadow-[0_14px_38px_rgba(0,0,0,.06)]"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 grid h-10 w-10 place-items-center rounded-xl border border-white/30 bg-white text-black shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold tracking-tight text-black">{title}</h3>
                <p className="mt-1 text-xs font-semibold text-black/50">{subtitle}</p>
                <p className="mt-3 text-xs leading-5 text-black/65">{description}</p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-black/5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-black/70">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Interactive Feature Sandbox */}
      <div className="rounded-3xl border border-black/10 bg-neutral-50 p-6 sm:p-10 shadow-[0_14px_46px_rgba(0,0,0,.04)]">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-black/50">Interactive Sandbox</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl">
            See the workspace in action
          </h2>
          <p className="mt-2 text-sm text-black/60">
            Click across components to simulate real workflows inside CollabSphere.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
          <div className="space-y-2">
            {[
              ['files', 'Code & File Viewer', FileCode2],
              ['ai', 'Project-Aware AI', Bot],
              ['team', 'Permissions & RBAC', Users],
              ['activity', 'Activity Stream', Activity]
            ].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setActivePreview(id)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition ${
                  activePreview === id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white border border-black/10 text-black/70 hover:border-black/30 hover:text-black'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Icon className="h-4 w-4" /> {label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm min-h-[260px] flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-black">{interactivePreviews[activePreview].title}</h3>
              <p className="mt-1 text-xs text-black/55 mb-4">{interactivePreviews[activePreview].desc}</p>
              {interactivePreviews[activePreview].content}
            </div>
            <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
              <span className="text-[11px] text-black/45">Simulated live component</span>
              <button
                onClick={() => onNavigate(activePreview === 'ai' ? 'ai' : 'projects')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:underline"
              >
                Try this feature <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-10">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-black/50">Why CollabSphere</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Built to replace disconnected tools
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Unified Workspace', 'Everything lives in one project tab: code, docs, members, and AI context.'],
            ['Contextual AI', 'Answers are informed by your authorized project repository rather than isolated chats.'],
            ['Living Documentation', 'Markdown notes stay directly alongside the code they describe.'],
            ['Role-Based Security', 'Granular control over who can edit, upload, or view sensitive repositories.'],
            ['Instant Previews', 'Inspect JavaScript, Python, Go, and JSON files without needing external tools.'],
            ['Frictionless Team Sharing', 'Share public or private project workspaces with zero setup required.']
          ].map(([heading, detail]) => (
            <div key={heading} className="rounded-2xl border border-black/10 bg-neutral-50/60 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-black" />
                <h4 className="text-sm font-bold text-black">{heading}</h4>
              </div>
              <p className="text-xs leading-5 text-black/60">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="rounded-3xl bg-black p-8 text-white sm:p-12">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Ready to streamline your workflow?</h2>
            <p className="mt-2 max-w-xl text-xs sm:text-sm text-white/60">
              Create a project workspace in seconds, invite your team, and leverage project-aware AI.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-black transition hover:bg-neutral-100"
            >
              Start in Projects <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('ai')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open AI Assistant
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeFeaturesView;
