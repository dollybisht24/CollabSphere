import { motion } from 'framer-motion';

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-elevation-1 p-6 space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    <div className="space-y-2">
      <div className="h-2 bg-gray-200 rounded"></div>
      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-elevation-1 p-6 animate-pulse"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
  </motion.div>
);

export const TaskSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-xl p-4 mb-3 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-gray-200"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="flex gap-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-elevation-1 p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-100 rounded-xl"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl shadow-elevation-1 overflow-hidden">
    <div className="p-4 border-b border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  CardSkeleton,
  StatCardSkeleton,
  TaskSkeleton,
  ChartSkeleton,
  TableSkeleton
};
