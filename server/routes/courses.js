import express from 'express';
import { auth } from '../middleware/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, instructor, thumbnail, category, description, totalHours } = req.body;

    if (!title || !instructor || !category) {
      return res.status(400).json({ error: 'Please provide title, instructor, and category' });
    }

    const course = new Course({
      title,
      instructor,
      thumbnail,
      category,
      description,
      totalHours: totalHours || 0,
      userId: req.userId
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.userId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { title, instructor, thumbnail, category, description, progress, totalHours, completedHours } = req.body;

    if (title) course.title = title;
    if (instructor) course.instructor = instructor;
    if (thumbnail) course.thumbnail = thumbnail;
    if (category) course.category = category;
    if (description !== undefined) course.description = description;
    if (progress !== undefined) course.progress = progress;
    if (totalHours !== undefined) course.totalHours = totalHours;
    if (completedHours !== undefined) course.completedHours = completedHours;

    await course.save();

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/courses/stats
// @desc    Get course statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });
    
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress === 100).length;
    const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
    const totalHours = courses.reduce((sum, c) => sum + (c.completedHours || 0), 0);
    const avgProgress = courses.length > 0 
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;

    res.json({
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalHours,
      avgProgress
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
