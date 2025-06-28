import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const SocialLoginHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google login failed.');
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      toast.success('✅ Logged in with Google!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid login redirect.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return null;
};

export default SocialLoginHandler;
