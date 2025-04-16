
import React, { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Layout and core components (not lazy loaded)
import AppLayout from './layouts/AppLayout';
import Index from './pages/Index';

// Auth pages (not lazy loaded as they're entry points)
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Lazy loaded feature pages (load on demand)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FileExplorer = lazy(() => import('./pages/FileExplorer'));
const Profile = lazy(() => import('./pages/Profile'));
const SharedFiles = lazy(() => import('./pages/SharedFiles'));

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

// Auth guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // This would typically check your auth context
  const isAuthenticated = true; // Replace with actual auth check
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'files',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <FileExplorer />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'shared',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SharedFiles />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
