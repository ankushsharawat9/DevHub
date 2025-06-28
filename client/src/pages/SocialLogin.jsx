import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SocialLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Google login failed. Please use email/password.');
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      toast.success('🎉 Logged in via Google!');
      navigate('/dashboard');
    }
  }, [navigate]);

  return <div className="text-center mt-10 text-gray-700 dark:text-white">Logging you in...</div>;
}
