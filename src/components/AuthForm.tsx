
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthFormProps {
  isLogin: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { authError } = useAuth();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Check if online first
    if (!isOnline) {
      setFormError('You are offline. Please check your internet connection and try again.');
      return;
    }
    
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await onSubmit(email, password);
    } catch (error: any) {
      // Error handling is now done in AuthContext
      // This try/catch is just a fallback
    }
  };

  const displayError = formError || authError;

  return (
    <div className="flex justify-center items-center w-full animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl border-0 glass-panel form-shine">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-medium text-center">
            {isLogin ? 'Sign in to CloudVault' : 'Create a CloudVault account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Fill in your details to create your account'}
          </CardDescription>
          
          {!isOnline && (
            <Alert variant="destructive" className="mt-4 bg-destructive/10 border-destructive">
              <WifiOff className="h-4 w-4 mr-2" />
              <AlertDescription>
                You are currently offline. Please check your internet connection.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-cloud"
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-cloud"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {displayError && (
                <Alert variant="destructive" className="mt-2 py-2 bg-destructive/10 border-destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription className="text-sm">{displayError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-cloud hover:bg-cloud-light transition-all duration-300 font-medium"
              disabled={loading || !isOnline}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 mr-2 opacity-75" />
                  ) : (
                    <WifiOff className="h-4 w-4 mr-2 opacity-75" />
                  )}
                  <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 px-8">
          <p className="text-sm text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              to={isLogin ? "/register" : "/login"}
              className="text-cloud hover:text-cloud-dark font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
