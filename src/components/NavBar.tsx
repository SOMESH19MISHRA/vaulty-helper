
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NavBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "py-4 bg-white/80 backdrop-blur-lg shadow-sm" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cloud to-cloud-light">
              CloudVault
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-colors ${
                location.pathname === "/"
                  ? "text-cloud font-medium"
                  : "text-gray-600 hover:text-cloud"
              }`}
            >
              Home
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === "/dashboard"
                    ? "text-cloud font-medium"
                    : "text-gray-600 hover:text-cloud"
                }`}
              >
                Dashboard
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="border-cloud text-cloud hover:bg-cloud hover:text-white transition-all rounded-lg"
              >
                Sign Out
              </Button>
            ) : (
              <>
                {location.pathname !== "/login" && (
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="border-cloud text-cloud hover:bg-cloud hover:text-white transition-all rounded-lg"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
                {location.pathname !== "/register" && (
                  <Link to="/register">
                    <Button className="bg-cloud hover:bg-cloud-light text-white font-medium transition-all rounded-lg">
                      Sign Up
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
