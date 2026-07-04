import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Mark */}
      <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* N Shape (White for dark theme) */}
          <path 
            d="M 22 85 L 22 30 C 22 20, 32 18, 40 28 L 74 72 C 82 82, 90 78, 90 65 L 90 40" 
            stroke="white" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Bottom Left Horizontal Line for N */}
          <path 
            d="M 12 85 L 32 85" 
            stroke="white" 
            strokeWidth="10" 
            strokeLinecap="round"
          />
          {/* Bottom right horizontal Line for N */}
          <path 
            d="M 80 40 L 100 40" 
            stroke="white" 
            strokeWidth="10" 
            strokeLinecap="round"
          />
          {/* Cyan Arrow crossing the N */}
          <path 
            d="M 15 65 L 75 15 M 50 15 L 75 15 L 75 40" 
            stroke="#22d3ee" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Cyan Star top right */}
          <path 
            d="M 85 -5 Q 85 8, 98 8 Q 85 8, 85 21 Q 85 8, 72 8 Q 85 8, 85 -5" 
            fill="#22d3ee" 
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col justify-center pt-0.5">
          <span className="text-[19px] font-black tracking-widest text-white leading-none mb-1">
            NOVATECH
          </span>
          <span className="text-[10px] font-bold tracking-[0.27em] text-[#22d3ee] leading-none">
            SOLUTIONS
          </span>
        </div>
      )}
    </div>
  );
}
