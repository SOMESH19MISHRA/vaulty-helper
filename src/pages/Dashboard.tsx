
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="h-10 w-10 border-4 border-cloud border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <NavBar />
      <div className="pt-24 pb-16 px-4 sm:px-6 md:px-8 flex flex-col flex-1">
        <div className="max-w-7xl mx-auto w-full">
          <div className="animate-fade-up">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to your Dashboard</h1>
            <p className="text-muted-foreground mb-8">Manage your secure files and settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 glass-panel">
              <CardHeader>
                <CardTitle>Your Files</CardTitle>
                <CardDescription>Access and manage your secure files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-blue-50 rounded-lg">
                  <p className="text-muted-foreground">No files uploaded yet</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 glass-panel">
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>View and update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="truncate">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
                    <p>{new Date(user.last_sign_in_at || Date.now()).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 glass-panel">
              <CardHeader>
                <CardTitle>Storage</CardTitle>
                <CardDescription>Monitor your storage usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cloud">0%</p>
                    <p className="text-muted-foreground">of storage used</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
