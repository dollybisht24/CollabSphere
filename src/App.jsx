import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import Projects from './pages/Projects';
import ProjectWorkspace from './pages/ProjectWorkspace';
import PublicProject from './pages/PublicProject';
import AIAssistant from './pages/AIAssistant';
import InterviewPage from './pages/InterviewPage';
import EnglishLearning from './pages/EnglishLearning';
import TalkWithAI from './pages/TalkWithAI';
import CertificateVerificationPage from './pages/CertificateVerificationPage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const ProjectRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/projects/${id}`} replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/share/:slug" element={<PublicProject />} />

      {/* Primary Home Pages with Top Navigation (Image 2 style) */}
      <Route path="/" element={<Home defaultTab="home" />} />
      <Route path="/projects" element={<Home defaultTab="projects" />} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
      <Route path="/workspace/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
      <Route path="/projects/:id/ai-review" element={<ProtectedRoute><ProjectWorkspace defaultTab="advisor" /></ProtectedRoute>} />
      <Route path="/workspace/:id/ai-review" element={<ProtectedRoute><ProjectWorkspace defaultTab="advisor" /></ProtectedRoute>} />
      <Route path="/ai" element={<Home defaultTab="ai" />} />
      <Route path="/features" element={<Home defaultTab="features" />} />
      <Route path="/interview" element={<Home defaultTab="interview" />} />
      <Route path="/english" element={<ProtectedRoute><EnglishLearning /></ProtectedRoute>} />
      <Route path="/english/talk" element={<ProtectedRoute><TalkWithAI /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/verify/certificate/:certificateId" element={<CertificateVerificationPage />} />
      <Route path="/certificate/:certificateId" element={<CertificateVerificationPage />} />

      {/* Redirect all legacy /app and sidebar routes directly to the clean Home-style pages */}
      <Route path="/app/projects/:id" element={<ProjectRedirect />} />
      <Route path="/app/projects" element={<Navigate to="/projects" replace />} />
      <Route path="/app/ai" element={<Navigate to="/ai" replace />} />
      <Route path="/app/interview" element={<Navigate to="/interview" replace />} />
      <Route path="/app/settings" element={<Navigate to="/settings" replace />} />
      <Route path="/app/profile" element={<Navigate to="/settings" replace />} />
      <Route path="/app/achievements" element={<Navigate to="/achievements" replace />} />
      <Route path="/app/*" element={<Navigate to="/" replace />} />
      <Route path="/app" element={<Navigate to="/" replace />} />

      <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
      <Route path="/tasks" element={<Navigate to="/projects" replace />} />
      <Route path="/analytics" element={<Navigate to="/projects" replace />} />
      <Route path="/calendar" element={<Navigate to="/projects" replace />} />
      <Route path="/profile" element={<Navigate to="/settings" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
