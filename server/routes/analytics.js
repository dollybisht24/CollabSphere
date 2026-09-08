import express from 'express';
import { auth } from '../middleware/auth.js';
import Analytics from '../models/Analytics.js';
import Course from '../models/Course.js';
import Task from '../models/Task.js';

const router = express.Router();

// @route   GET /api/analytics
// @desc    Get analytics data for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const analytics = await Analytics.find(query).sort({ date: 1 });
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/analytics
// @desc    Add analytics entry
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { date, hours, coursesCompleted, quizzesTaken, averageScore } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Check if entry already exists for this date
    let analytics = await Analytics.findOne({
      userId: req.userId,
      date: new Date(date)
    });

    if (analytics) {
      // Update existing entry
      if (hours !== undefined) analytics.hours = hours;
      if (coursesCompleted !== undefined) analytics.coursesCompleted = coursesCompleted;
      if (quizzesTaken !== undefined) analytics.quizzesTaken = quizzesTaken;
      if (averageScore !== undefined) analytics.averageScore = averageScore;
      
      await analytics.save();
    } else {
      // Create new entry
      analytics = new Analytics({
        userId: req.userId,
        date: new Date(date),
        hours: hours || 0,
        coursesCompleted: coursesCompleted || 0,
        quizzesTaken: quizzesTaken || 0,
        averageScore: averageScore || 0
      });
      
      await analytics.save();
    }

    res.json({
      message: 'Analytics entry saved successfully',
      analytics
    });
  } catch (error) {
    console.error('Create analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/summary
// @desc    Get summary statistics
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });
    const tasks = await Task.find({ userId: req.userId });
    const analytics = await Analytics.find({ userId: req.userId });

    // Course stats
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.progress === 100).length;
    const avgProgress = courses.length > 0 
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;

    // Task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Analytics stats
    const totalHours = analytics.reduce((sum, a) => sum + a.hours, 0);
    const totalQuizzes = analytics.reduce((sum, a) => sum + a.quizzesTaken, 0);
    const avgScore = analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + a.averageScore, 0) / analytics.length)
      : 0;

    // Get last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyAnalytics = await Analytics.find({
      userId: req.userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    const weeklyHours = weeklyAnalytics.reduce((sum, a) => sum + a.hours, 0);

    res.json({
      courses: {
        total: totalCourses,
        completed: completedCourses,
        avgProgress
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate
      },
      learning: {
        totalHours: Math.round(totalHours * 10) / 10,
        weeklyHours: Math.round(weeklyHours * 10) / 10,
        totalQuizzes,
        avgScore
      },
      weeklyData: weeklyAnalytics
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
