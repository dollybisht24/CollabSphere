import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle2, 
  Circle,
  Trash2,
  Calendar,
  Clock,
  Flag,
  X,
  Edit2,
  Filter,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { tasksAPI } from '../utils/api';
import { TaskSkeleton } from '../components/SkeletonLoader';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';

const TaskSchedule = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, title
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    priority: 'Medium',
    category: ''
  });

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    High: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
    Medium: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    Low: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', dot: 'bg-green-500' },
  };

  const toggleTask = async (id) => {
    try {
      const updatedTask = await tasksAPI.toggle(id);
      const task = tasks.find(t => t._id === id);
      
      setTasks(tasks.map(task => 
        task._id === id ? updatedTask.task : task
      ));

      // Show confetti if task was completed
      if (!task.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('🎉 Task completed! Great job!', {
          duration: 3000,
          position: 'top-center',
        });
      } else {
        toast.success('Task reopened', {
          duration: 2000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(tasks.filter(task => task._id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const addTask = async () => {
    if (!newTask.title || !newTask.dueDate || !newTask.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await tasksAPI.create(newTask);
      setTasks([...tasks, response.task]);
      setNewTask({ title: '', dueDate: '', priority: 'Medium', category: '' });
      setShowAddModal(false);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('Failed to add task');
    }
  };

  const updateTask = async () => {
    if (!editingTask.title || !editingTask.dueDate || !editingTask.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await tasksAPI.update(editingTask._id, editingTask);
      setTasks(tasks.map(task => 
        task._id === editingTask._id ? response.task : task
      ));
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'priority') {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending', value: tasks.filter(t => !t.completed).length, color: 'from-orange-500 to-red-500' },
    { label: 'Completed', value: tasks.filter(t => t.completed).length, color: 'from-green-500 to-emerald-500' },
    { label: 'Completion Rate', value: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%`, color: 'from-purple-500 to-pink-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <TaskSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Schedule</h1>
          <p className="text-gray-600">Manage your learning tasks and deadlines</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -4, scale: 1.02 }}
            className="card"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
              <span className="text-xl font-bold text-white">{stat.value.toString().substring(0, stat.value.toString().includes('%') ? 3 : 2)}</span>
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          {['all', 'active', 'completed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === filterOption
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
        </select>
      </motion.div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pending Tasks</h2>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
              {pendingTasks.length}
            </span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No pending tasks</p>
              <p className="text-sm text-gray-400">Click "Add Task" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingTasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className={`border ${priorityColors[task.priority].border} rounded-xl p-4 hover:shadow-elevation-1 transition-all duration-200 bg-white`}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task._id)}
                          className="mt-0.5 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                              <Flag className="w-3 h-3" />
                              <span className="text-xs font-medium">{task.priority}</span>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">{task.category}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Completed Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Completed Tasks</h2>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
              {completedTasks.length}
            </span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No completed tasks yet</p>
              <p className="text-sm text-gray-400">Complete tasks to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {completedTasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-elevation-1 transition-all duration-200 bg-gray-50/50">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task._id)}
                          className="mt-0.5 text-green-500 hover:text-gray-400 transition-colors"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-500 line-through mb-2">{task.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-lg">{task.category}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Add New Task</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="e.g., Programming"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Priority
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Low', 'Medium', 'High'].map((priority) => (
                        <button
                          key={priority}
                          onClick={() => setNewTask({ ...newTask, priority })}
                          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                            newTask.priority === priority
                              ? `${priorityColors[priority].bg} ${priorityColors[priority].text} border-2 ${priorityColors[priority].border} shadow-md`
                              : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addTask}
                      className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors shadow-lg"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Edit Task</h2>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={editingTask.category}
                        onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="e.g., Programming"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Priority
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Low', 'Medium', 'High'].map((priority) => (
                        <button
                          key={priority}
                          onClick={() => setEditingTask({ ...editingTask, priority })}
                          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                            editingTask.priority === priority
                              ? `${priorityColors[priority].bg} ${priorityColors[priority].text} border-2 ${priorityColors[priority].border} shadow-md`
                              : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setEditingTask(null)}
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateTask}
                      className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-colors shadow-lg"
                    >
                      Update Task
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskSchedule;
