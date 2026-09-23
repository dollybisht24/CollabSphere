import { motion } from 'framer-motion';
import { 
  Inbox, 
  ListChecks, 
  CalendarX, 
  FileX, 
  Search,
  TrendingUp,
  BookOpen,
  Target,
  Award
} from 'lucide-react';

const emptyStates = {
  tasks: {
    icon: ListChecks,
    title: 'No tasks yet',
    description: 'Create your first task to start organizing the work',
    color: 'text-black',
    bgColor: 'bg-neutral-50'
  },
  courses: {
    icon: BookOpen,
    title: 'No courses found',
    description: 'Start enrolling in courses to track your progress',
    color: 'text-black',
    bgColor: 'bg-neutral-50'
  },
  calendar: {
    icon: CalendarX,
    title: 'No events scheduled',
    description: 'Add events to your calendar to stay organized',
    color: 'text-black',
    bgColor: 'bg-neutral-50'
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  },
  analytics: {
    icon: TrendingUp,
    title: 'No data available',
    description: 'Start learning to see your analytics',
    color: 'text-black',
    bgColor: 'bg-neutral-50'
  },
  achievements: {
    icon: Award,
    title: 'No achievements yet',
    description: 'Complete tasks and courses to earn badges',
    color: 'text-black',
    bgColor: 'bg-neutral-50'
  },
  goals: {
    icon: Target,
    title: 'No goals set',
    description: 'Set learning goals to track your progress',
    color: 'text-black',
    bgColor: 'bg-neutral-50'
  },
  generic: {
    icon: Inbox,
    title: 'Nothing here yet',
    description: 'This section will show content once you add some',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  }
};

const EmptyState = ({ type = 'generic', actionLabel, onAction, className = '' }) => {
  const state = emptyStates[type] || emptyStates.generic;
  const Icon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className={`w-20 h-20 rounded-2xl ${state.bgColor} ${state.color} flex items-center justify-center mb-6 shadow-lg`}
      >
        <Icon className="w-10 h-10" />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-black mb-2"
      >
        {state.title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-black/60 text-center max-w-md mb-6"
      >
        {state.description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onAction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 ${state.bgColor} ${state.color} font-semibold rounded-xl hover:shadow-lg transition-all`}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
