import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any previous errors when component mounts
    setAuthError(null);

    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Initial session fetch
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error fetching initial session:", error);
        setAuthError("Failed to connect to authentication service. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      console.log("Attempting to sign up with:", email);
      
      // Check internet connection before proceeding
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network and try again.");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signup error:", error);
        throw error;
      }
      
      console.log("Signup response:", data);
      
      if (!data.user) {
        toast.error("Failed to create account. Please try again.");
        return;
      }
      
      if (data.user?.identities?.length === 0) {
        // User already exists
        toast.error("This email is already registered. Please log in instead.");
        navigate('/login');
        return;
      }

      // User bucket creation is no longer needed - we use prefixes in a single bucket

      if (data.user && !data.session) {
        // Email confirmation required
        toast.success("Registration successful! Please check your email to confirm your account.");
        navigate('/login');
      } else if (data.user && data.session) {
        // Auto-login (if email confirmation is disabled in Supabase)
        toast.success("Registration successful! You are now logged in.");
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "An error occurred during sign up";
      
      // Handle network errors with more specific messages
      if (error.message === 'Failed to fetch' || error.code === 20 || error.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      console.log("Attempting to sign in with:", email);
      
      // Check internet connection before proceeding
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network and try again.");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signin error:", error);
        throw error;
      }
      
      console.log("Signin response:", data);
      
      toast.success("Signed in successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Invalid login credentials";
      
      // Handle network errors with more specific messages
      if (error.message === 'Failed to fetch' || error.code === 20 || error.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Check internet connection before proceeding
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network and try again.");
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate('/');
    } catch (error: any) {
      let errorMessage = "Error signing out";
      
      if (error.message === 'Failed to fetch' || error.code === 20 || error.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
