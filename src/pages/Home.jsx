import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Gem,
  CalendarDays,
  ListChecks,
  BarChart3,
  Brain,
  Sparkles,
  Trophy,
  CheckCircle2,
  Rocket,
  ArrowRight,
  Star,
  LineChart,
  Calendar,
  Activity,
  Target,
  Shield,
  TrendingUp
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const coreFeatures = [
    {
      icon: CalendarDays,
      title: 'Intelligent Scheduling',
      description: 'Our AI-powered calendar helps you plan study sessions with optimal time blocks. Never miss a deadline with smart reminders and automatic task prioritization based on due dates.',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Trophy,
      title: 'Gamified Progress',
      description: 'Stay motivated with achievement badges, learning streaks, and milestone rewards. Watch your study hours transform into tangible accomplishments and celebrate every victory.',
      image: 'https://images.unsplash.com/photo-1579547621869-0ddb5f237392?w=800&h=600&fit=crop',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Visualize your learning patterns with interactive charts and graphs. Track study hours, completion rates, and skill development to make data-driven improvements.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ListChecks,
      title: 'Smart Task Management',
      description: 'Organize assignments with priority levels, categories, and due dates. Our intelligent system helps you focus on what matters most with customizable workflows.',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Brain,
      title: 'AI Study Insights',
      description: 'Receive personalized recommendations based on your learning patterns. Our AI analyzes your performance to suggest optimal study times and break intervals.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and achieve your academic goals with precision. Monitor progress toward milestones and adjust your learning strategy based on real-time feedback.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop',
      color: 'from-pink-500 to-red-500'
    }
  ];

  const benefits = [
    { icon: Rocket, text: 'Boost Productivity by 3x with Smart Time Management' },
    { icon: Calendar, text: 'Stay Consistent with Automated Study Schedules' },
    { icon: LineChart, text: 'Visualize Growth with Comprehensive Analytics' },
    { icon: Shield, text: 'Reduce Stress with Organized Planning Tools' },
    { icon: Star, text: 'Achieve Goals Faster with AI-Powered Insights' },
    { icon: Activity, text: 'Build Lasting Study Habits Through Gamification' }
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 -m-4 lg:-m-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-300/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400/10 rounded-full -ml-48 blur-3xl"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/3 right-1/4 w-64 h-64 border border-white/10 rounded-full"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full text-white mb-8 border border-white/30 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide">AI-Powered Study Companion</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                EduFlow: Master Your Learning, Elevate Your Future.
              </h1>
              
              <p className="text-xl lg:text-2xl text-purple-50 mb-10 leading-relaxed font-light">
                Your AI-powered study companion to plan, track, and optimize every session for ultimate academic success.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="group bg-white text-primary hover:bg-gray-50 font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 flex items-center gap-3 border border-white/20"
                >
                  <span className="text-base">Launch Your Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                  className="bg-white/15 backdrop-blur-md text-white hover:bg-white/25 font-semibold px-10 py-5 rounded-2xl border-2 border-white/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg"
                >
                  Watch Demo
                </button>
              </div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-16 grid grid-cols-3 gap-8"
              >
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">50K+</div>
                  <div className="text-sm font-medium text-purple-100 tracking-wide">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">95%</div>
                  <div className="text-sm font-medium text-purple-100 tracking-wide">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">4.9★</div>
                  <div className="text-sm font-medium text-purple-100 tracking-wide">User Rating</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <img 
                    src="https://i.pinimg.com/1200x/1f/de/bd/1fdebdf3affc709315d8e5f9df8d3b7f.jpg"
                    alt="Student Learning"
                    className="rounded-3xl shadow-2xl w-full"
                  />
                </motion.div>
                
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Task Complete!</div>
                      <div className="text-xs font-medium text-gray-500">+50 XP Earned</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center shadow-inner">
                      <TrendingUp className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Progress Up!</div>
                      <div className="text-xs font-medium text-gray-500">85% Complete</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is EduFlow Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Gem className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Unlock Your Full Academic Potential</h2>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed font-light">
              EduFlow is more than just a study planner—it's your all-in-one intelligent workspace that combines 
              cutting-edge AI, powerful analytics, and intuitive design to revolutionize how you learn. Whether 
              you're a student aiming for top grades or a lifelong learner pursuing new skills, EduFlow adapts 
              to your unique needs, helping you stay organized, motivated, and on track to achieve your goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Discover How EduFlow Transforms Your Study
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 font-light">
              Powerful features designed to elevate every aspect of your learning journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -12 }}
                  className="group"
                >
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full border border-gray-100">
                    {/* Feature Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className={`absolute bottom-5 left-5 w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/30`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Feature Content */}
                    <div className="p-7">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed font-light">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose EduFlow Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
                Your Personalized Path to Mastery
              </h2>
              
              <p className="text-xl lg:text-2xl text-gray-600 mb-10 font-light leading-relaxed">
                Join thousands of students who have transformed their academic performance with EduFlow's 
                proven methodology and intelligent tools.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-5 bg-white p-5 rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-100/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-gray-700 font-semibold pt-2.5 leading-relaxed">{benefit.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                  alt="Students achieving goals"
                  className="rounded-3xl shadow-2xl"
                />
                
                {/* Overlay Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-7 shadow-2xl border border-gray-100"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-18 h-18 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-gray-900 tracking-tight">+175%</div>
                      <div className="text-sm font-semibold text-gray-600 tracking-wide">Productivity Increase</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white mb-8 border border-white/30 shadow-lg">
              <Star className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wide">Join 50,000+ Successful Students</span>
            </div>

            <h2 className="text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight">
              Ready to Elevate Your Study Experience?
            </h2>
            
            <p className="text-xl lg:text-2xl text-purple-50 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Start your journey to academic excellence today. Transform the way you learn with 
              intelligent tools designed for modern students.
            </p>

            <div className="flex flex-wrap justify-center gap-5">
              <button 
                onClick={() => navigate('/dashboard')}
                className="group bg-white text-primary hover:bg-gray-50 font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 flex items-center gap-3 border border-white/20"
              >
                <span className="text-base">Get Started Now</span>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="bg-white/15 backdrop-blur-md text-white hover:bg-white/25 font-semibold px-10 py-5 rounded-2xl border-2 border-white/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-lg">
                Schedule a Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-14 flex flex-wrap justify-center items-center gap-10 text-purple-50"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold tracking-wide">No credit card required</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold tracking-wide">Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
