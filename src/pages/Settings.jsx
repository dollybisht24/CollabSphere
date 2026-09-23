import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Lock,
  Palette,
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';

const Settings = ({ defaultTab = 'profile' }) => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    timezone: '',
    language: 'English'
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await userAPI.getProfile();
        setProfileData({
          name: profile.name || '',
          email: profile.email || '',
          bio: profile.bio || '',
          location: profile.location || '',
          timezone: profile.timezone || '',
          language: profile.language || 'English'
        });
        setUser(profile);
      } catch (error) {
        toast.error(error.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setUser]);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    weeklyReport: false,
    taskReminders: true,
    achievementAlerts: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await userAPI.updateProfile(profileData);
      setUser(response.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const response = await userAPI.uploadAvatar(file);
      setUser(response.user);
      toast.success('Profile image updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Unable to upload profile image');
    } finally {
      setSaving(false);
      event.target.value = '';
    }
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
          <div className="card space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
          <div className="card-lg">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading profile...
              </div>
            ) : activeTab === 'profile' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileData.name || 'User')}
                      alt={profileData.name || 'User'}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-gray-700" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profileData.name || 'Your Profile'}</h2>
                    <p className="text-gray-600">{profileData.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <input
                      type="text"
                      value={profileData.timezone}
                      onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                  <select
                    value={profileData.language}
                    onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            ) : activeTab === 'notifications' ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
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
                        className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveNotifications} className="btn-primary flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Preferences
                </button>
              </div>
            ) : activeTab === 'security' ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} className="input-field pr-11" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input type="password" className="input-field" placeholder="Enter a new password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input type="password" className="input-field" placeholder="Confirm your new password" />
                  </div>
                  <button type="submit" className="btn-primary">Update Password</button>
                </form>
              </div>
            ) : activeTab === 'appearance' ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Appearance</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['light', 'dark'].map((theme) => (
                      <button
                        key={theme}
                        className={`p-6 rounded-xl border-2 transition-all capitalize ${
                          true ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-24 rounded-lg mb-3 ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-900'}`} />
                        {theme} Mode
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => toast.success('Appearance settings saved!')} className="btn-primary flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Appearance
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Privacy & Data</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">Profile Visibility</h3>
                    <p className="text-sm text-gray-600 mb-3">Control who can see your profile information</p>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2">Data Sharing</h3>
                    <p className="text-sm text-gray-600 mb-3">Share anonymous usage data to improve the platform</p>
                    <button className="w-full btn-secondary">Manage Data Sharing</button>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <h3 className="font-bold text-red-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 mb-3">Permanently delete your account and all associated data</p>
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
