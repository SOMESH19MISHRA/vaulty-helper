import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

import Dashboard from './pages/Dashboard';
import SharedFile from './pages/SharedFile'; // Add this import

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={createBrowserRouter([
        {
          path: '/',
          element: <Index />
        },
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',
          element: <Register />
        },
        {
          path: '/dashboard',
          element: <Dashboard />
        },
        {
          path: '/share/:token',
          element: <SharedFile />
        },
        {
          path: '*',
          element: <NotFound />
        }
      ])} />
      <Toaster />
    </AuthProvider>
  );
};

export default App;
