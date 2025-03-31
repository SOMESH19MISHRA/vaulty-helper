import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import Logo from '@/components/Logo';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="mb-6">
            <Logo size="lg" withText={false} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto animate-fade-up">
            Secure Cloud Storage for <span className="bg-clip-text text-transparent bg-gradient-to-r from-cloud to-cloud-light">Everything You Value</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Store, share, and access your files from anywhere with enterprise-grade security and intuitive design.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-cloud hover:bg-cloud-light text-white font-medium rounded-xl px-8 py-6 h-auto transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-cloud hover:bg-cloud-light text-white font-medium rounded-xl px-8 py-6 h-auto transition-all">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-cloud text-cloud hover:bg-cloud hover:text-white font-medium rounded-xl px-8 py-6 h-auto transition-all">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Why Choose CloudVault?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Uncompromising Security",
                  description: "End-to-end encryption ensures your data stays private and secure at all times."
                },
                {
                  title: "Seamless Experience",
                  description: "Intuitive design across all devices for effortless file management."
                },
                {
                  title: "Unlimited Access",
                  description: "Your files are always available, wherever and whenever you need them."
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center p-6 rounded-2xl glass-panel animate-fade-up"
                  style={{ animationDelay: `${index * 100 + 300}ms` }}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    <div className="w-8 h-8 rounded-full bg-cloud animate-pulse-soft" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cloud to-cloud-light">
              CloudVault
            </span>
            <p className="text-gray-500 mt-2 text-sm">Secure cloud storage for everyone</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-cloud transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-cloud transition-colors">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-cloud transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
