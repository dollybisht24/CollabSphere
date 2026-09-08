import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette,
  Shield,
  Mail,
  Phone,
  Camera,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Dolly',
    email: 'dollybisht408@gmail.com',
    phone: '+1 234 567 8900',
    bio: 'Passionate learner and technology enthusiast',
    location: 'San Francisco, CA',
    timezone: 'Pacific Time (PT)',
    language: 'English'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    weeklyReport: false,
    taskReminders: true,
    achievementAlerts: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    primaryColor: 'blue',
    fontSize: 'medium'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    toast.success('Password changed successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="card-lg">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <Camera className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                    <p className="text-gray-600">{profileData.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {key.includes('email') && 'Receive notifications via email'}
                          {key.includes('push') && 'Receive push notifications'}
                          {key.includes('course') && 'Get updates about your courses'}
                          {key.includes('weekly') && 'Weekly summary of your progress'}
                          {key.includes('task') && 'Reminders for upcoming tasks'}
                          {key.includes('achievement') && 'Celebrate your achievements'}
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [key]: !value })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveNotifications}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Preferences
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Change Password
                  </button>
                </form>

                <div className="border-t pt-6">
                  <h3 className="font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <p className="text-gray-600 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="btn-secondary">
                   
                   </button>
                </div>
              </div>
            )} 

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Appearance</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['light', 'dark'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setAppearance({ ...appearance, theme })}
                        className={`p-6 rounded-xl border-2 transition-all capitalize ${
                          appearance.theme === theme
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-24 rounded-lg mb-3 ${
                          theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-900'
                        }`} />
                        {theme} Mode
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Primary Color
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['blue', 'purple', 'green', 'orange'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setAppearance({ ...appearance, primaryColor: color })}
                        className={`h-16 rounded-xl transition-all capitalize ${
                          appearance.primaryColor === color ? 'ring-4 ring-offset-2 ring-gray-900' : ''
                        } ${
                          color === 'blue' ? 'bg-blue-500' :
                          color === 'purple' ? 'bg-purple-500' :
                          color === 'green' ? 'bg-green-500' :
                          'bg-orange-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Appearance settings saved!')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Appearance
                </button>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Privacy & Data</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">Profile Visibility</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Control who can see your profile information
                    </p>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">Data Sharing</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Share anonymous usage data to improve the platform
                    </p>
                    <button className="w-full btn-secondary">
                      Manage Data Sharing
                    </button>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <h3 className="font-bold text-red-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 mb-3">
                      Permanently delete your account and all associated data
                    </p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
