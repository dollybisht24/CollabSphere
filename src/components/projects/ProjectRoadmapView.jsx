import React, { useState } from 'react';
import {
  CheckCircle2, Circle, Clock, Plus, Trash2, ArrowRight,
  ChevronDown, ChevronUp, AlertCircle, FileText, Check, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const PHASES = [
  'Phase 1: Fix Critical Issues',
  'Phase 2: Improve Architecture',
  'Phase 3: Improve UI/UX',
  'Phase 4: Add AI Features',
  'Phase 5: Performance Optimization',
  'Phase 6: Testing & Deployment'
];

const priorityStyles = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  LOW: 'bg-neutral-100 text-neutral-700 border-neutral-200'
};

const difficultyStyles = {
  EASY: 'text-emerald-700',
  MEDIUM: 'text-amber-700',
  HARD: 'text-red-700'
};

const ProjectRoadmapView = ({
  project,
  roadmapTasks = [],
  onUpdateStatus,
  onAddTask,
  onDeleteTask,
  onViewPlan
}) => {
  const [activePhaseFilter, setActivePhaseFilter] = useState('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const [newTask, setNewTask] = useState({
    phase: PHASES[0],
    title: '',
    description: '',
    priority: 'MEDIUM',
    difficulty: 'MEDIUM',
    estimatedEffort: '2-4 hours'
  });

  const filteredTasks = roadmapTasks.filter(task => {
    const phaseMatch = activePhaseFilter === 'ALL' || task.phase === activePhaseFilter;
    const statusMatch = activeStatusFilter === 'ALL' || task.status === activeStatusFilter;
    return phaseMatch && statusMatch;
  });

  const totalTasks = roadmapTasks.length;
  const completedTasks = roadmapTasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (onAddTask) {
      await onAddTask(newTask);
      setShowAddModal(false);
      setNewTask({
        phase: PHASES[0],
        title: '',
        description: '',
        priority: 'MEDIUM',
        difficulty: 'MEDIUM',
        estimatedEffort: '2-4 hours'
      });
      toast.success('Roadmap task created');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Overall Roadmap Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
            AI Project Roadmap
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-black/60">
            Phased development milestones from critical security and architecture fixes to AI features and deployment.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-black/60">
            Roadmap Execution Progress
          </span>
          <span className="font-bold text-black">
            {completedTasks} of {totalTasks} Tasks Completed ({progressPercent}%)
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-black transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-black/45 mr-1">Phase:</span>
          {['ALL', ...PHASES].map(phase => (
            <button
              key={phase}
              onClick={() => setActivePhaseFilter(phase)}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                activePhaseFilter === phase
                  ? 'bg-black text-white shadow-sm'
                  : 'border border-black/10 bg-white text-black/60 hover:text-black'
              }`}
            >
              {phase === 'ALL' ? 'All Phases' : phase.split(':')[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-black/45 mr-1">Status:</span>
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setActiveStatusFilter(status)}
              className={`rounded-full px-2.5 py-1 font-semibold transition ${
                activeStatusFilter === status
                  ? 'bg-black text-white shadow-sm'
                  : 'border border-black/10 bg-white text-black/60 hover:text-black'
              }`}
            >
              {status === 'ALL' ? 'All' : status === 'TODO' ? 'Todo' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap Phase Groups */}
      {PHASES.map(phaseName => {
        if (activePhaseFilter !== 'ALL' && activePhaseFilter !== phaseName) return null;

        const tasksInPhase = filteredTasks.filter(t => t.phase === phaseName);
        if (tasksInPhase.length === 0 && activePhaseFilter !== 'ALL') {
          return null;
        }

        return (
          <div key={phaseName} className="space-y-3">
            <div className="flex items-center gap-2 pt-2">
              <span className="h-2 w-2 rounded-full bg-black" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                {phaseName}
              </h3>
              <span className="text-xs text-black/45">
                ({tasksInPhase.length} {tasksInPhase.length === 1 ? 'task' : 'tasks'})
              </span>
            </div>

            {tasksInPhase.length === 0 ? (
              <div className="rounded-xl border border-dashed border-black/10 bg-neutral-50/50 p-4 text-xs text-black/40 text-center">
                No tasks assigned to this phase yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {tasksInPhase.map(task => {
                  const isDone = task.status === 'COMPLETED';
                  const isInProgress = task.status === 'IN_PROGRESS';
                  const isExpanded = expandedTaskId === task._id;

                  return (
                    <div
                      key={task._id}
                      className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm transition space-y-3 ${
                        isDone ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Quick Status Toggle Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = isDone ? 'TODO' : isInProgress ? 'COMPLETED' : 'IN_PROGRESS';
                              onUpdateStatus(task._id, nextStatus);
                            }}
                            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                              isDone
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : isInProgress
                                ? 'border-amber-500 bg-amber-50 text-amber-600'
                                : 'border-black/20 text-transparent hover:border-black/60'
                            }`}
                            title="Toggle status (Todo → In Progress → Completed)"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </button>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyles[task.priority] || priorityStyles.MEDIUM}`}>
                                {task.priority}
                              </span>
                              <span className={`text-[11px] font-semibold ${difficultyStyles[task.difficulty] || difficultyStyles.MEDIUM}`}>
                                {task.difficulty} Complexity
                              </span>
                              <span className="text-[11px] text-black/45">
                                · {task.estimatedEffort || '2-4 hours'}
                              </span>
                              <span className="text-[10px] rounded bg-neutral-100 px-1.5 py-0.2 text-black/60 font-medium">
                                {task.source === 'FEATURE_IDEA' ? '✨ Feature Idea' : task.source === 'AI_REVIEW' ? 'AI Review' : 'Manual'}
                              </span>
                            </div>

                            <h4 className={`mt-1.5 text-sm sm:text-base font-bold text-black ${isDone ? 'line-through text-black/50' : ''}`}>
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="mt-1 text-xs text-black/60 whitespace-pre-wrap line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions & Status Pill */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          <select
                            value={task.status}
                            onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition ${
                              isDone
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : isInProgress
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : 'border-black/15 bg-neutral-50 text-black/70'
                            }`}
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>

                          {(task.implementationPlan || task.featureSpec) && (
                            <button
                              onClick={() => setExpandedTaskId(isExpanded ? null : task._id)}
                              className="rounded-lg border border-black/15 bg-white p-1.5 text-black/60 hover:text-black"
                              title="Toggle Implementation Plan"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          )}

                          {onDeleteTask && (
                            <button
                              onClick={() => onDeleteTask(task._id)}
                              className="rounded-lg p-1.5 text-black/30 hover:text-red-600 transition"
                              title="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Implementation Plan */}
                      {isExpanded && (task.implementationPlan || task.featureSpec) && (
                        <div className="mt-3 pt-3 border-t border-black/10 text-xs space-y-2.5 bg-neutral-50/70 p-3.5 rounded-xl">
                          <p className="font-bold text-black uppercase tracking-wider text-[11px]">
                            Attached Implementation Specification
                          </p>

                          {task.featureSpec && (
                            <div className="space-y-1">
                              <p className="font-semibold text-black">Feature Purpose:</p>
                              <p className="text-black/65">{task.featureSpec.purpose}</p>
                              {task.featureSpec.implementationSteps?.length > 0 && (
                                <ul className="list-decimal list-inside space-y-0.5 text-black/70 pt-1">
                                  {task.featureSpec.implementationSteps.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {task.implementationPlan && (
                            <div className="space-y-1">
                              {task.implementationPlan.filesToCreate?.length > 0 && (
                                <p className="text-black/70"><strong>Files to Create:</strong> {task.implementationPlan.filesToCreate.join(', ')}</p>
                              )}
                              {task.implementationPlan.filesToModify?.length > 0 && (
                                <p className="text-black/70"><strong>Files to Modify:</strong> {task.implementationPlan.filesToModify.join(', ')}</p>
                              )}
                              {task.implementationPlan.implementationSteps?.length > 0 && (
                                <ol className="list-decimal list-inside space-y-0.5 text-black/70 pt-1">
                                  {task.implementationPlan.implementationSteps.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-black">Add Roadmap Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-black/70 uppercase mb-1">Roadmap Phase</label>
                <select
                  value={newTask.phase}
                  onChange={e => setNewTask({ ...newTask, phase: e.target.value })}
                  className="w-full rounded-xl border border-black/15 p-2.5 text-xs text-black"
                >
                  {PHASES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-black/70 uppercase mb-1">Task Title</label>
                <input
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Implement refresh token rotation"
                  className="w-full rounded-xl border border-black/15 p-2.5 text-xs text-black"
                />
              </div>

              <div>
                <label className="block font-semibold text-black/70 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task details and deliverables..."
                  className="w-full rounded-xl border border-black/15 p-2.5 text-xs text-black resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-black/70 uppercase mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full rounded-xl border border-black/15 p-2 text-xs"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-black/70 uppercase mb-1">Estimated Effort</label>
                  <input
                    value={newTask.estimatedEffort}
                    onChange={e => setNewTask({ ...newTask, estimatedEffort: e.target.value })}
                    placeholder="e.g. 2-4 hours"
                    className="w-full rounded-xl border border-black/15 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-black/15 px-4 py-2 font-semibold text-black/70 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-black px-5 py-2 font-semibold text-white hover:bg-neutral-800"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRoadmapView;
