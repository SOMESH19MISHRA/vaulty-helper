
import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Helmet } from 'react-helmet';

const Register = () => {
  const { signUp, user, loading } = useAuth();

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Helmet>
        <title>Create Account | CloudVault</title>
        <meta name="description" content="Sign up for CloudVault - Your secure cloud storage solution" />
      </Helmet>
      <NavBar />
      <div className="flex-1 flex flex-col justify-center items-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md mb-8 text-center animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">Join CloudVault for secure cloud storage</p>
        </div>
        <AuthForm isLogin={false} onSubmit={signUp} loading={loading} />
      </div>
    </div>
  );
};

export default Register;
