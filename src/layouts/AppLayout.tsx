
import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import NavBar from '@/components/NavBar';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ErrorBoundary>
        <NavBar />
      </ErrorBoundary>
      
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      
      <footer className="py-4 px-8 bg-slate-50 border-t text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} CloudVault - Secure Cloud Storage</p>
      </footer>
    </div>
  );
};

export default AppLayout;
