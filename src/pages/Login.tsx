
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';

const Login = () => {
  const { signIn, user, loading } = useAuth();

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col justify-center items-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md mb-8 text-center animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your secure vault</p>
        </div>
        <AuthForm isLogin={true} onSubmit={signIn} loading={loading} />
      </div>
    </div>
  );
};

export default Login;
