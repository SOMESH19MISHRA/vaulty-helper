
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { 
  Shield, 
  FileText, 
  Globe, 
  History, 
  LayoutDashboard, 
  Check, 
  X, 
  Star,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto animate-fade-up">
            Unlock Your Cloud Storage & Productivity with <span className="bg-clip-text text-transparent bg-gradient-to-r from-cloud to-cloud-light">CloudVault</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Seamless, secure, and efficient cloud storage with premium features designed for professionals, creators, and teams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-cloud hover:bg-cloud-light text-white font-medium rounded-xl px-8 py-6 h-auto transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="bg-cloud hover:bg-cloud-light text-white font-medium rounded-xl px-8 py-6 h-auto transition-all flex items-center gap-2">
                  Start for Free <ArrowRight size={18} />
                </Button>
              </Link>
            )}
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Why Choose CloudVault?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {[
                {
                  title: "Secure Storage",
                  description: "Store files with encryption and 99.9% uptime.",
                  icon: <Shield className="h-6 w-6 text-cloud" />
                },
                {
                  title: "Easy File Management",
                  description: "Upload, delete, rename, and track your files effortlessly.",
                  icon: <FileText className="h-6 w-6 text-cloud" />
                },
                {
                  title: "Seamless Access",
                  description: "Access your files from anywhere, anytime.",
                  icon: <Globe className="h-6 w-6 text-cloud" />
                },
                {
                  title: "File Versioning",
                  description: "Never lose important versions of your files.",
                  icon: <History className="h-6 w-6 text-cloud" />
                },
                {
                  title: "User-Friendly Dashboard",
                  description: "An intuitive interface for all your file management needs.",
                  icon: <LayoutDashboard className="h-6 w-6 text-cloud" />
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center p-6 rounded-2xl glass-panel animate-fade-up"
                  style={{ animationDelay: `${index * 100 + 300}ms` }}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">Choose the Plan That Works for You</h2>
            <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
              From free basic storage to enterprise-level solutions, we have you covered.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <Card className="border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-md">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-bold">₹0</span>
                    <span className="text-gray-500 mb-1">/month</span>
                  </div>
                  <p className="text-gray-600">2GB of free cloud storage</p>
                </div>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {[
                      "Basic file upload",
                      "Rename and delete options",
                      "Ads displayed"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block mt-6">
                    <Button className="w-full" variant="outline">Start for Free</Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Premium Plan */}
              <Card className="border-2 border-cloud rounded-2xl overflow-hidden shadow-lg transform scale-105 z-10">
                <div className="bg-gradient-to-r from-cloud to-cloud-light text-white p-6 border-b border-white/10">
                  <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                    POPULAR
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-bold">₹299</span>
                    <span className="text-white/80 mb-1">/month</span>
                  </div>
                  <p className="text-white/90">50GB of cloud storage</p>
                </div>
                <CardContent className="pt-6 bg-white">
                  <ul className="space-y-3">
                    {[
                      "50GB storage",
                      "No ads",
                      "Early access to features",
                      "Priority support"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-cloud shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6 bg-cloud hover:bg-cloud-light">
                    Get Started with Premium
                  </Button>
                </CardContent>
              </Card>
              
              {/* Enterprise Plan */}
              <Card className="border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-md">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-2xl font-bold mb-2">Enterprise Plan</h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-bold">Custom</span>
                  </div>
                  <p className="text-gray-600">Unlimited storage</p>
                </div>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {[
                      "Unlimited storage",
                      "Dedicated account manager",
                      "Advanced security features",
                      "Collaboration tools"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant="outline">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Add-Ons Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Boost Your CloudVault Experience</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Extra Storage",
                  price: "₹99",
                  description: "for an additional 10GB of storage"
                },
                {
                  title: "Priority Support",
                  price: "₹49",
                  description: "/month for 24/7 support with response times under 1 hour"
                },
                {
                  title: "File Backup",
                  price: "₹199",
                  description: "for automated backups every 7 days"
                },
                {
                  title: "Advanced Analytics",
                  price: "₹149",
                  description: "/month to unlock detailed file storage analytics"
                }
              ].map((addon, index) => (
                <Card key={index} className="border border-gray-200 rounded-xl overflow-hidden transition-transform hover:translate-y-[-5px]">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{addon.title}</h3>
                    <div className="flex items-end gap-1 mb-3">
                      <span className="text-2xl font-bold text-cloud">{addon.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{addon.description}</p>
                    <Button className="w-full mt-4" variant="outline">Add to Plan</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Ads Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50/70">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Free Plan with Ads</h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Enjoy CloudVault's free plan with minimal ad interruptions. Upgrade to Premium to enjoy an ad-free experience and unlock more features.
            </p>
            
            {/* Example Ad Banner */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white max-w-3xl mx-auto">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">Advertisement</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-6 flex gap-4 items-center">
                <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 font-semibold">Ad</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Upgrade to Premium</h4>
                  <p className="text-sm text-gray-500">Remove ads and get 50GB of storage for just ₹299/month</p>
                </div>
                <Button size="sm" className="shrink-0 bg-cloud hover:bg-cloud-light">Upgrade</Button>
              </div>
            </div>
            
            <p className="text-center text-gray-500 text-sm mt-8 italic">
              We value your experience—ads will never compromise our service.
            </p>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">What Our Users Are Saying</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Priya Sharma",
                  role: "Freelance Designer",
                  testimonial: "CloudVault has transformed how I manage and share design files with clients. The interface is clean and the security gives me peace of mind."
                },
                {
                  name: "Rohit Verma",
                  role: "Small Business Owner",
                  testimonial: "My team relies on CloudVault daily. The premium features are worth every rupee, especially the automated backups and enhanced storage."
                },
                {
                  name: "Anjali Patel",
                  role: "Content Creator",
                  testimonial: "I switched from another cloud service and haven't looked back. CloudVault's file versioning has saved my projects multiple times!"
                }
              ].map((testimonial, index) => (
                <Card key={index} className="p-6 border-none shadow-md rounded-2xl bg-gradient-to-b from-white to-blue-50">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="inline-block h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 flex-1 italic">"{testimonial.testimonial}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section before Footer */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cloud/90 to-cloud-light text-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Elevate Your Cloud Storage Experience?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users already enjoying CloudVault's secure and intuitive storage solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-cloud hover:bg-gray-100 font-medium px-8">
                  Start for Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200">
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cloud to-cloud-light">
                CloudVault
              </span>
              <p className="text-gray-500 mt-2 text-sm">Secure cloud storage for everyone</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Add-ons</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-cloud transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 CloudVault – All Rights Reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-cloud transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cloud transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cloud transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cloud transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
