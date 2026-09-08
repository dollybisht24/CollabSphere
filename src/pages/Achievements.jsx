import { motion } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Crown,
  BookOpen,
  Clock,
  CheckCircle,
  Flame,
  TrendingUp,
  Users,
  Lock
} from 'lucide-react';

const Achievements = () => {
  const achievements = [
    {
      id: 1,
      icon: Trophy,
      title: 'First Steps',
      description: 'Complete your first course',
      progress: 100,
      total: 1,
      unlocked: true,
      date: '2026-01-15',
      rarity: 'common',
      points: 10,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 2,
      icon: Flame,
      title: '7 Day Streak',
      description: 'Study for 7 consecutive days',
      progress: 100,
      total: 7,
      unlocked: true,
      date: '2026-01-22',
      rarity: 'rare',
      points: 25,
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 3,
      icon: BookOpen,
      title: 'Knowledge Seeker',
      description: 'Complete 5 courses',
      progress: 3,
      total: 5,
      unlocked: false,
      rarity: 'rare',
      points: 50,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 4,
      icon: Clock,
      title: 'Time Master',
      description: 'Study for 100 hours total',
      progress: 67,
      total: 100,
      unlocked: false,
      rarity: 'epic',
      points: 100,
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 5,
      icon: Target,
      title: 'Perfectionist',
      description: 'Score 100% on 3 quizzes',
      progress: 100,
      total: 3,
      unlocked: true,
      date: '2026-02-05',
      rarity: 'epic',
      points: 75,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 6,
      icon: Star,
      title: 'Rising Star',
      description: 'Earn 500 XP points',
      progress: 428,
      total: 500,
      unlocked: false,
      rarity: 'common',
      points: 30,
      color: 'from-yellow-400 to-amber-500'
    },
    {
      id: 7,
      icon: CheckCircle,
      title: 'Task Crusher',
      description: 'Complete 50 tasks',
      progress: 100,
      total: 50,
      unlocked: true,
      date: '2026-02-10',
      rarity: 'rare',
      points: 40,
      color: 'from-teal-400 to-cyan-500'
    },
    {
      id: 8,
      icon: Crown,
      title: 'Course Champion',
      description: 'Complete 10 courses with 90%+ score',
      progress: 0,
      total: 10,
      unlocked: false,
      rarity: 'legendary',
      points: 200,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const stats = {
    totalUnlocked: achievements.filter(a => a.unlocked).length,
    totalAchievements: achievements.length,
    totalPoints: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
    level: 12
  };

  const rarityColors = {
    common: 'text-gray-600 bg-gray-100',
    rare: 'text-blue-600 bg-blue-100',
    epic: 'text-purple-600 bg-purple-100',
    legendary: 'text-yellow-600 bg-yellow-100'
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">Track your progress and celebrate your accomplishments</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalUnlocked}/{stats.totalAchievements}
          </div>
          <div className="text-sm text-gray-600">Achievements Unlocked</div>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPoints}</div>
          <div className="text-sm text-gray-600">Achievement Points</div>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">Level {stats.level}</div>
          <div className="text-sm text-gray-600">Current Level</div>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {Math.round((stats.totalUnlocked / stats.totalAchievements) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </motion.div>

      {/* Achievement Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          const isUnlocked = achievement.unlocked;
          const progressPercent = (achievement.progress / achievement.total) * 100;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`card-lg relative overflow-hidden ${
                !isUnlocked ? 'opacity-60' : ''
              }`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-5`}
              />

              {/* Lock Overlay for Locked Achievements */}
              {!isUnlocked && (
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
              )}

              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg ${
                      !isUnlocked ? 'grayscale' : ''
                    }`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                        rarityColors[achievement.rarity]
                      }`}
                    >
                      {achievement.rarity}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      +{achievement.points} pts
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

                {/* Progress Bar */}
                {!isUnlocked && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`bg-gradient-to-r ${achievement.color} h-2 rounded-full`}
                      />
                    </div>
                  </div>
                )}

                {/* Unlock Date */}
                {isUnlocked && achievement.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      Unlocked on {new Date(achievement.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h3>
        <div className="space-y-4">
          {achievements
            .filter(a => a.unlocked)
            .slice(0, 3)
            .map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-primary">+{achievement.points}</div>
                    <div className="text-xs text-gray-500">
                      {achievement.date && new Date(achievement.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
};

export default Achievements;
