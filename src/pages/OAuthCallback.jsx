import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        console.error('OAuth error:', errorParam);
        navigate('/login?error=Authentication failed. Please try again.');
        return;
      }

      if (token) {
        try {
          // Store token with consistent key
          localStorage.setItem('edupro_token', token);

          // Fetch user profile
          const userData = await userAPI.getProfile();
          
          // Store user data
          localStorage.setItem('edupro_user', JSON.stringify(userData));
          
          // Redirect to home - the AuthContext will pick up the user on next render
          window.location.href = '/';
        } catch (err) {
          console.error('Callback error:', err);
          setError('Authentication failed. Redirecting...');
          setTimeout(() => {
            navigate('/login?error=Authentication failed. Please try again.');
          }, 2000);
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-900 text-lg font-semibold mb-2">
          {error ? 'Authentication Failed' : 'Completing authentication...'}
        </p>
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
