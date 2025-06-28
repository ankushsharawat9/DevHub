import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SocialLoginRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, []);

  return <p>Logging in via Google...</p>;
}
