
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading } = useAuth();
  const { getText, getSetting } = useSupabaseConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      toast({
        title: "Session Expired",
        description: getText('session_expired', 'Your session has expired. Please log in again.'),
        variant: "destructive",
      });
      navigate(getSetting('login_url', '/login'));
    }
  }, [session, loading, navigate, getText, getSetting]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
