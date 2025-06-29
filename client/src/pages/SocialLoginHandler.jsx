import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import toast from 'react-hot-toast';

const SocialLoginHandler = () => { // Renamed component
  const [searchParams] = useSearchParams(); // Using useSearchParams
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google login failed.');
      // Keep redirect delay for toast visibility, as per previous logic.
      setTimeout(() => navigate('/login'), 2000); 
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      toast.success('✅ Logged in with Google!');
      // Keep redirect delay for toast visibility.
      setTimeout(() => navigate('/dashboard'), 2000); 
    } else {
      // This 'else' condition handles cases where neither token nor error is present.
      toast.error('Invalid login redirect.');
      setTimeout(() => navigate('/login'), 2000); 
    }
  }, [searchParams, navigate]);

  // This component acts as a handler and does not render any UI.
  return null;
};

export default SocialLoginHandler; // Exporting the renamed component
