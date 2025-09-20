import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CheckAuth = ({ isAuthenticated, user, isLoading, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; 

    const path = location.pathname;

    const getHomePath = () => {
      if (!user) return '/';
      return user.role === 'admin' ? '/admin/dashboard' : '/user/home';
    };

    if (!isAuthenticated && (path.startsWith('/user') || path.startsWith('/admin'))) {
      navigate('/auth/login');
      return;
    }

    if (isAuthenticated && user) {
      if (path.startsWith('/admin') && user.role !== 'admin') {
        toast.error("You don't have access to this page");
        navigate('/user/home');
        return;
      }
      if (path.startsWith('/user') && user.role === 'admin') {
        toast.error("You don't have access to this page");
        navigate('/admin/dashboard');
        return;
      }
    }

    if (path === '/') {
      navigate(isAuthenticated ? getHomePath() : '/');
      return;
    }

    if (
      isAuthenticated &&
      (path === '/auth/login' || path === '/auth/register')
    ) {
      navigate(getHomePath());
      return;
    }

    if (
      isAuthenticated &&
      user &&
      user.authProvider === 'google' &&
      (path === '/user/set-new-password' || path === '/admin/set-new-password')
    ) {
      toast.error('Password change is not available for Google authenticated accounts');
      navigate(getHomePath());
      return;
    }
  }, [location.pathname, isAuthenticated, user, isLoading, navigate]);

  return children;
};

export default CheckAuth;
