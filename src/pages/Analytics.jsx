import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Award, Clock, Target } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  // Sample data
  const monthlyProgress = [
    { month: 'Aug', hours: 32, courses: 2, quizzes: 8 },
    { month: 'Sep', hours: 45, courses: 3, quizzes: 12 },
    { month: 'Oct', hours: 52, courses: 4, quizzes: 15 },
    { month: 'Nov', hours: 48, courses: 3, quizzes: 11 },
    { month: 'Dec', hours: 58, courses: 5, quizzes: 18 },
    { month: 'Jan', hours: 64, courses: 6, quizzes: 22 },
    { month: 'Feb', hours: 47, courses: 4, quizzes: 14 },
  ];

  const skillsData = [
    { skill: 'Programming', score: 85 },
    { skill: 'Design', score: 72 },
    { skill: 'Marketing', score: 65 },
    { skill: 'Business', score: 78 },
    { skill: 'Data Science', score: 80 },
  ];

  const categoryPerformance = [
    { category: 'React', completed: 12, inProgress: 3, notStarted: 2 },
    { category: 'UI/UX', completed: 8, inProgress: 4, notStarted: 3 },
    { category: 'Python', completed: 10, inProgress: 2, notStarted: 1 },
    { category: 'Marketing', completed: 6, inProgress: 3, notStarted: 4 },
    { category: 'Business', completed: 5, inProgress: 2, notStarted: 2 },
  ];

  const stats = [
    {
      icon: Clock,
      label: 'Total Study Hours',
      value: '346',
      change: '+12%',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Award,
      label: 'Achievements',
      value: '24',
      change: '+3',
      trend: 'up',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      label: 'Completion Rate',
      value: '87%',
      change: '+5%',
      trend: 'up',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Activity,
      label: 'Avg. Score',
      value: '78%',
      change: '-2%',
      trend: 'down',
      color: 'from-orange-500 to-red-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
        <p className="text-gray-600">Detailed insights into your learning performance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600';
          
          return (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-elevation-1`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Study Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyProgress}>
              <defs>
                <linearGradient id="colorHours2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
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
                fill="url(#colorHours2)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skills Radar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Skills Assessment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="skill" stroke="#6B7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
              <Radar 
                name="Score" 
                dataKey="score" 
                stroke="#6366F1" 
                fill="#6366F1" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Activities Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="courses" 
                stroke="#6366F1" 
                strokeWidth={3}
                name="Courses" 
                dot={{ fill: '#6366F1', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="quizzes" 
                stroke="#EC4899" 
                strokeWidth={3}
                name="Quizzes" 
                dot={{ fill: '#EC4899', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Category Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" name="In Progress" radius={[0, 0, 0, 0]} />
              <Bar dataKey="notStarted" stackId="a" fill="#EF4444" name="Not Started" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Insights Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Top Performer</h4>
              <p className="text-sm text-gray-600 mb-2">
                You're in the top <span className="font-bold text-blue-600">15%</span> of learners this month!
              </p>
              <p className="text-xs text-gray-500">Keep up the great work! 🎉</p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Goal Progress</h4>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-bold text-purple-600">87%</span> towards your monthly goal
              </p>
              <p className="text-xs text-gray-500">Only 8 hours to go! 💪</p>
            </div>
          </div>
        </div>

        <div className="card-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Next Achievement</h4>
              <p className="text-sm text-gray-600 mb-2">
                Complete <span className="font-bold text-green-600">2 more courses</span>
              </p>
              <p className="text-xs text-gray-500">Unlock "Learning Master" badge! 🏆</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
