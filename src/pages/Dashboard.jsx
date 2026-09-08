import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Video,
  FileText,
  CheckCircle,
  Target,
  Plus,
  PlayCircle,
  Calendar,
  Zap,
  Star,
  Trophy
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { coursesAPI, analyticsAPI } from '../utils/api';
import { StatCardSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesData, summaryData] = await Promise.all([
        coursesAPI.getAll(),
        analyticsAPI.getSummary()
      ]);
      
      setCourses(coursesData.slice(0, 3)); // Get first 3 courses
      setStats(summaryData);
      
      // Format weekly data for chart
      const formattedWeeklyData = summaryData.weeklyData?.map(day => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: day.hours
      })) || [];
      
      setWeeklyData(formattedWeeklyData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts (fallback if no data)
  const learningProgressData = weeklyData.length > 0 ? weeklyData : [
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ];

  const courseDistribution = [
    { name: 'Programming', value: 35, color: '#6366F1' },
    { name: 'Design', value: 25, color: '#EC4899' },
    { name: 'Marketing', value: 20, color: '#10B981' },
    { name: 'Business', value: 20, color: '#F59E0B' },
  ];

  const recentCourses = courses.map(course => ({
    id: course._id,
    title: course.title,
    progress: course.progress,
    instructor: course.instructor,
    thumbnail: course.thumbnail,
    color: course.color || 'primary'
  }));

  const dashboardStats = [
    {
      icon: BookOpen,
      label: 'Active Courses',
      value: stats?.courses?.total || '0',
      change: `${stats?.courses?.completed || 0} completed`,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Clock,
      label: 'Study Hours',
      value: stats?.learning?.weeklyHours?.toFixed(1) || '0',
      change: `${stats?.learning?.totalHours?.toFixed(1) || 0} total`,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Award,
      label: 'Quizzes Taken',
      value: stats?.learning?.totalQuizzes || '0',
      change: `${stats?.learning?.avgScore || 0}% avg score`,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Target,
      label: 'Avg. Progress',
      value: `${stats?.courses?.avgProgress || 0}%`,
      change: `${stats?.tasks?.completionRate || 0}% tasks done`,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: PlayCircle, label: 'Start Learning', color: 'from-blue-500 to-cyan-500', action: () => navigate('/dashboard') },
    { icon: Plus, label: 'Add Task', color: 'from-purple-500 to-pink-500', action: () => navigate('/tasks') },
    { icon: Calendar, label: 'View Calendar', color: 'from-green-500 to-emerald-500', action: () => navigate('/calendar') },
    { icon: TrendingUp, label: 'Analytics', color: 'from-orange-500 to-red-500', action: () => navigate('/analytics') }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your learning progress and achievements</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"
                >
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12%
                </motion.div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.change}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className={`card text-center group overflow-hidden relative`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-sm font-semibold text-gray-900">{action.label}</div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Study Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={learningProgressData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#6366F1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHours)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Course Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {courseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Continue Learning</h3>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:text-primary-dark font-medium text-sm"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-card border border-gray-100 overflow-hidden hover:shadow-elevation-2 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                  {course.progress}%
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{course.instructor}</p>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`bg-${course.color} h-2 rounded-full`}
                      style={{ backgroundColor: course.color === 'primary' ? '#6366F1' : undefined }}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full btn-secondary py-2"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div 
          onClick={() => navigate('/calendar')}
          className="card hover:shadow-elevation-2 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Live Classes</div>
              <div className="text-sm text-gray-600">3 upcoming</div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/tasks')}
          className="card hover:shadow-elevation-2 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Assignments</div>
              <div className="text-sm text-gray-600">5 pending</div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/achievements')}
          className="card hover:shadow-elevation-2 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Completed</div>
              <div className="text-sm text-gray-600">24 courses</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
