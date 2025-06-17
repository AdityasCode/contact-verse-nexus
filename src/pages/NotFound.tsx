
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSupabaseConfig } from "@/hooks/useSupabaseConfig";

const NotFound = () => {
  const location = useLocation();
  const { getText, getSetting } = useSupabaseConfig();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {getText('404_title', 'Page Not Found')}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {getText('404_body', 'The page you are looking for does not exist.')}
        </p>
        <Link to={getSetting('not_found_redirect', '/')}>
          <Button size="lg">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
