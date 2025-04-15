
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import FileListSupabase from '@/components/FileListSupabase';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Function to fetch file count and total size for the storage card
  const fetchFileDetails = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .storage
        .from('cloudvault')
        .list(user.id + '/');
      
      if (error) {
        console.error('Error fetching file count:', error);
        return;
      }
      
      const count = data?.length || 0;
      setFileCount(count);
      
      // Calculate total size of files
      let size = 0;
      data?.forEach(file => {
        size += file.metadata?.size || 0;
      });
      setTotalSize(size);
    } catch (error: any) {
      console.error('Error counting files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const toastId = toast.loading('Updating email...');
      
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) {
        toast.dismiss(toastId);
        toast.error(`Failed to update email: ${error.message}`);
        return;
      }
      
      toast.dismiss(toastId);
      toast.success('Email update initiated. Please check your new email for confirmation.');
      setIsUpdatingEmail(false);
      setNewEmail('');
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast.error(`Failed to update email: ${error.message}`);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Both current and new passwords are required');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      const toastId = toast.loading('Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast.dismiss(toastId);
        toast.error(`Failed to update password: ${error.message}`);
        return;
      }
      
      toast.dismiss(toastId);
      toast.success('Password updated successfully');
      setIsUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(`Failed to update password: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      const toastId = toast.loading('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.dismiss(toastId);
        toast.error(`Failed to sign out: ${error.message}`);
        return;
      }
      
      toast.dismiss(toastId);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Failed to sign out: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFileDetails();
    }
  }, [user]);

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

  const handleUploadSuccess = () => {
    fetchFileDetails();
    // Toast notification is handled in the FileUpload component
  };

  // Format size to human readable format
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
                <FileUpload userId={user.id} onUploadSuccess={handleUploadSuccess} />
                <div className="mt-4">
                  <FileListSupabase 
                    userId={user.id} 
                    onFileDeleted={fetchFileDetails} 
                    isLoading={isLoading} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 glass-panel">
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
                <CardDescription>View and update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <div className="flex justify-between items-center mt-1">
                      <p>{user.email}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsUpdatingEmail(!isUpdatingEmail);
                          setNewEmail('');
                        }}
                      >
                        {isUpdatingEmail ? 'Cancel' : 'Change'}
                      </Button>
                    </div>
                    
                    {isUpdatingEmail && (
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="new-email">New Email</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email"
                        />
                        <Button 
                          className="w-full mt-1" 
                          onClick={handleUpdateEmail}
                        >
                          Update Email
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Password</p>
                    <div className="flex justify-between items-center mt-1">
                      <p>••••••••</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsUpdatingPassword(!isUpdatingPassword);
                          setCurrentPassword('');
                          setNewPassword('');
                        }}
                      >
                        {isUpdatingPassword ? 'Cancel' : 'Change'}
                      </Button>
                    </div>
                    
                    {isUpdatingPassword && (
                      <div className="mt-3 space-y-2">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>
                        <Button 
                          className="w-full mt-1" 
                          onClick={handleUpdatePassword}
                        >
                          Update Password
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="truncate">{user.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
                    <p>{new Date(user.last_sign_in_at || Date.now()).toLocaleString()}</p>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full mt-2" 
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 glass-panel">
              <CardHeader>
                <CardTitle>Storage</CardTitle>
                <CardDescription>Monitor your storage usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex flex-col items-center justify-center bg-blue-50 rounded-lg">
                  <div className="text-center mb-2">
                    <p className="text-2xl font-bold text-cloud">{fileCount}</p>
                    <p className="text-muted-foreground">files uploaded</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cloud">{formatSize(totalSize)}</p>
                    <p className="text-muted-foreground">total storage used</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Powered by Supabase Storage
                  </p>
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
