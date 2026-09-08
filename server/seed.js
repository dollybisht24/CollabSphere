import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Task from './models/Task.js';
import Analytics from './models/Analytics.js';

dotenv.config();

const sampleCourses = [
  {
    title: 'Advanced React Patterns',
    instructor: 'John Smith',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    progress: 75,
    category: 'Programming',
    color: 'primary',
    description: 'Learn advanced React patterns and best practices',
    totalHours: 40,
    completedHours: 30
  },
  {
    title: 'UI/UX Design Mastery',
    instructor: 'Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    progress: 45,
    category: 'Design',
    color: 'pink-500',
    description: 'Master the art of user interface and experience design',
    totalHours: 35,
    completedHours: 15
  },
  {
    title: 'Data Science Fundamentals',
    instructor: 'Mike Chen',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    progress: 60,
    category: 'Data Science',
    color: 'green-500',
    description: 'Introduction to data science and analytics',
    totalHours: 50,
    completedHours: 30
  }
];

const sampleTasks = [
  {
    title: 'Complete React Advanced Patterns Module',
    dueDate: new Date('2026-02-25'),
    priority: 'High',
    category: 'Programming',
    completed: false
  },
  {
    title: 'Submit UI/UX Design Assignment',
    dueDate: new Date('2026-02-23'),
    priority: 'High',
    category: 'Design',
    completed: false
  },
  {
    title: 'Watch Data Science Video Lectures',
    dueDate: new Date('2026-02-27'),
    priority: 'Medium',
    category: 'Data Science',
    completed: false
  }
];

const generateAnalytics = () => {
  const analytics = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    analytics.push({
      date: date,
      hours: Math.random() * 5 + 1, // Random hours between 1-6
      coursesCompleted: Math.floor(Math.random() * 2),
      quizzesTaken: Math.floor(Math.random() * 4),
      averageScore: Math.floor(Math.random() * 20) + 70 // Score between 70-90
    });
  }
  
  return analytics;
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Task.deleteMany({});
    await Analytics.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create a demo user
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@edupro.com',
      password: 'demo123' // Will be hashed automatically
    });
    await demoUser.save();
    console.log('✓ Created demo user (email: demo@edupro.com, password: demo123)');

    // Create courses for demo user
    const courses = sampleCourses.map(course => ({
      ...course,
      userId: demoUser._id
    }));
    await Course.insertMany(courses);
    console.log(`✓ Created ${courses.length} sample courses`);

    // Create tasks for demo user
    const tasks = sampleTasks.map(task => ({
      ...task,
      userId: demoUser._id
    }));
    await Task.insertMany(tasks);
    console.log(`✓ Created ${tasks.length} sample tasks`);

    // Create analytics data for demo user
    const analytics = generateAnalytics().map(data => ({
      ...data,
      userId: demoUser._id
    }));
    await Analytics.insertMany(analytics);
    console.log(`✓ Created ${analytics.length} days of analytics data`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: demo@edupro.com');
    console.log('Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
