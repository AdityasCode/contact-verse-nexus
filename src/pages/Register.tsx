
// This file is no longer needed as we've combined login and signup into the Login page
// Redirecting to Login page
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return null;
};

export default Register;
