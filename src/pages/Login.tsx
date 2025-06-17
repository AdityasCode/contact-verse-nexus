
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { useSupabaseConfig } from "../hooks/useSupabaseConfig";
import { useValidation } from "../hooks/useValidation";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const { theme, toggleTheme } = useTheme();
  const { session, signIn, signUp } = useAuth();
  const { getText, getSetting, loading: configLoading } = useSupabaseConfig();
  const { validateForm } = useValidation();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && !configLoading) {
      navigate(getSetting('default_landing', '/'));
    }
  }, [session, configLoading, navigate, getSetting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const validation = validateForm({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }

      if (result.success) {
        toast({
          title: isSignUp ? "Account created!" : "Welcome back!",
          description: isSignUp 
            ? "Please check your email to verify your account."
            : getText('login_subtitle', 'Welcome back to Contact Manager.'),
        });
        
        if (!isSignUp) {
          navigate(getSetting('default_landing', '/'));
        }
      } else {
        toast({
          title: isSignUp ? "Sign up failed" : "Login failed",
          description: result.error || getText('auth_error', 'Authentication failed. Please try again.'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getText('auth_error', 'An unexpected error occurred.'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getText(isSignUp ? 'signup_title' : 'login_title', isSignUp ? 'Create Account' : 'Welcome Back')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {getText(isSignUp ? 'signup_subtitle' : 'login_subtitle', 
              isSignUp ? 'Join Contact Manager to organize your contacts' : 'Sign in to your Contact Manager account')}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{isSignUp ? getText('signup_button', 'Create Account') : getText('signin_button', 'Sign In')}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Create your Contact Manager account' : 'Enter your credentials to access your contacts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{getText('email_label', 'Email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email[0]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{getText('password_label', 'Password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password[0]}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? (isSignUp ? "Creating Account..." : "Signing In...") 
                  : (isSignUp ? getText('signup_button', 'Create Account') : getText('signin_button', 'Sign In'))
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-500 font-medium underline"
                >
                  {isSignUp ? "Sign in here" : "Create one here"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
