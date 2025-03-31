
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "md", withText = true }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex items-center ${withText ? "space-x-2" : ""}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer cloud shape */}
        <div className="absolute inset-0 bg-gradient-to-br from-cloud-light to-cloud rounded-full transform translate-x-0.5 translate-y-0.5"></div>
        
        {/* Inner vault shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-white rounded-sm transform rotate-45"></div>
          <div className="absolute w-1/4 h-1/4 bg-cloud-dark rounded-full"></div>
        </div>
      </div>
      
      {withText && (
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cloud to-cloud-light">
          CloudVault
        </span>
      )}
    </div>
  );
};

export default Logo;
