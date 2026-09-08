import express from 'express';
import { auth } from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, dueDate, priority, category } = req.body;

    if (!title || !dueDate || !category) {
      return res.status(400).json({ error: 'Please provide title, due date, and category' });
    }

    const task = new Task({
      title,
      dueDate,
      priority: priority || 'Medium',
      category,
      userId: req.userId
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, dueDate, priority, category, completed } = req.body;

    if (title) task.title = title;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (category) task.category = category;
    if (completed !== undefined) task.completed = completed;

    await task.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completed status
// @access  Private
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();

    res.json({
      message: 'Task status updated',
      task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
