import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckSquare,
  Video,
  FileText,
  Plus
} from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 10)); // February 10, 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 10));
  const [showEventSidebar, setShowEventSidebar] = useState(true);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'task',
    time: '',
    date: '',
    color: 'blue'
  });

  // Sample events
  const events = {
    '2026-02-10': [
      { id: 1, type: 'class', title: 'React Advanced Patterns', time: '10:00 AM', participants: ['John Smith', 'Sarah Lee'], icon: Video, color: 'blue' },
      { id: 2, type: 'task', title: 'Submit UI Design Assignment', time: '5:00 PM', icon: FileText, color: 'purple' },
    ],
    '2026-02-12': [
      { id: 3, type: 'class', title: 'Data Science Workshop', time: '2:00 PM', participants: ['Mike Chen', 'Emma Wilson'], icon: Video, color: 'green' },
    ],
    '2026-02-14': [
      { id: 4, type: 'task', title: 'Complete JavaScript Module', time: '11:00 AM', icon: CheckSquare, color: 'orange' },
      { id: 5, type: 'class', title: 'Marketing Fundamentals', time: '3:00 PM', participants: ['Lisa Brown'], icon: Video, color: 'pink' },
    ],
    '2026-02-16': [
      { id: 6, type: 'task', title: 'Review Python Basics', time: '9:00 AM', icon: CheckSquare, color: 'indigo' },
    ],
    '2026-02-20': [
      { id: 7, type: 'class', title: 'UI/UX Design Review', time: '1:00 PM', participants: ['Sarah Johnson', 'David Kim'], icon: Video, color: 'cyan' },
    ],
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (date) => {
    const dateKey = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    return events[dateKey] || [];
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const hasEvents = (day) => {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events[dateKey] && events[dateKey].length > 0;
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setShowEventSidebar(true);
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and upcoming events</p>
        </div>
        <button 
          onClick={() => {
            setShowAddEventModal(true);
            setNewEvent({
              ...newEvent,
              date: formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 card-lg"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className="text-center py-3 text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {[...Array(startingDayOfWeek)].map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Calendar Days */}
            {[...Array(daysInMonth)].map((_, index) => {
              const day = index + 1;
              const hasEvent = hasEvents(day);
              const today = isToday(day);
              const selected = isSelected(day);

              return (
                <motion.button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative
                    transition-all duration-200 font-medium
                    ${today ? 'bg-primary text-white shadow-elevation-1' : ''}
                    ${selected && !today ? 'bg-primary/10 text-primary ring-2 ring-primary' : ''}
                    ${!today && !selected ? 'hover:bg-gray-100 text-gray-700' : ''}
                  `}
                >
                  <span className={`text-sm ${today ? 'font-bold' : ''}`}>{day}</span>
                  {hasEvent && (
                    <div className="flex gap-0.5 mt-1">
                      {getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                        .slice(0, 3)
                        .map((event, idx) => (
                          <div
                            key={idx}
                            className={`w-1 h-1 rounded-full ${
                              today ? 'bg-white' : selected ? 'bg-primary' : 'bg-primary/60'
                            }`}
                          />
                        ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Event Sidebar */}
        <AnimatePresence>
          {showEventSidebar && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.2 }}
              className="card-lg"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDateEvents.length > 0 
                    ? `${selectedDateEvents.length} Event${selectedDateEvents.length > 1 ? 's' : ''}`
                    : 'No Events'}
                </h3>
              </div>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event, index) => {
                    const Icon = event.icon;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`group relative overflow-hidden rounded-xl border-l-4 ${
                          event.color === 'blue' ? 'border-blue-500' :
                          event.color === 'purple' ? 'border-purple-500' :
                          event.color === 'green' ? 'border-green-500' :
                          event.color === 'orange' ? 'border-orange-500' :
                          event.color === 'pink' ? 'border-pink-500' :
                          event.color === 'indigo' ? 'border-indigo-500' :
                          'border-cyan-500'
                        } bg-gray-50 hover:bg-white transition-colors p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl ${colorClasses[event.color]} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${
                              event.color === 'blue' ? 'text-blue-500' :
                              event.color === 'purple' ? 'text-purple-500' :
                              event.color === 'green' ? 'text-green-500' :
                              event.color === 'orange' ? 'text-orange-500' :
                              event.color === 'pink' ? 'text-pink-500' :
                              event.color === 'indigo' ? 'text-indigo-500' :
                              'text-cyan-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                              <Clock className="w-4 h-4" />
                              <span>{event.time}</span>
                            </div>
                            {event.participants && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <div className="flex -space-x-2">
                                  {event.participants.slice(0, 3).map((participant, idx) => (
                                    <div
                                      key={idx}
                                      className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-white flex items-center justify-center"
                                      title={participant}
                                    >
                                      <span className="text-xs text-white font-medium">
                                        {participant.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {event.participants.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{event.participants.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No events scheduled</p>
                  <p className="text-sm text-gray-400">Click "Add Event" to create one</p>
                </div>
              )}

              {selectedDateEvents.length > 0 && (
                <button 
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  className="w-full mt-6 btn-secondary"
                >
                  View All Events
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEventModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add New Event</h3>
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600 rotate-45" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // In a real app, this would submit to the backend
                  alert('Event added! This would save to the database in production.');
                  setShowAddEventModal(false);
                  setNewEvent({ title: '', type: 'task', time: '', date: '', color: 'blue' });
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['task', 'class'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, type })}
                        className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                          newEvent.type === type
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    required
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['blue', 'purple', 'green', 'orange', 'pink', 'indigo', 'cyan'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, color })}
                        className={`h-10 rounded-xl ${colorClasses[color]} ${
                          newEvent.color === color ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming This Week</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(events)
            .slice(0, 4)
            .map(([date, dateEvents], index) => {
              const eventDate = new Date(date);
              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-elevation-1 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedDate(eventDate);
                    setCurrentDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
                  }}
                >
                  <div className="text-center mb-3">
                    <div className="text-3xl font-bold text-primary">{eventDate.getDate()}</div>
                    <div className="text-sm text-gray-600">
                      {monthNames[eventDate.getMonth()].substring(0, 3)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dateEvents.map((event) => (
                      <div key={event.id} className="text-xs">
                        <div className={`inline-block w-2 h-2 rounded-full ${colorClasses[event.color]} mr-2`} />
                        <span className="text-gray-700 font-medium">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
};

export default Calendar;
