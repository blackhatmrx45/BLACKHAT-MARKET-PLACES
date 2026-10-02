import React from 'react';
import blackHatLogoImg from '../assets/images/bhodt_black_hat_logo_1790928314687.jpg';

interface BhodtLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BhodtLogo: React.FC<BhodtLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Black Hat Silhouette Emblem with Neon Red & Cyan-Blue Aura */}
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-xl overflow-hidden border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.4),0_0_30px_rgba(255,23,68,0.25)] group-hover:border-[#00FF66] transition-all`}>
        <img
          src={blackHatLogoImg}
          alt="BHODT Black Hat Official Developing Team Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
        />
        {/* Subtle Neon Scanline Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-[#00E5FF]/15 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00FF66] to-[#FF1744] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
              BHODT
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-[#00E5FF] uppercase font-bold mt-0.5">
            BLACK HAT TEAM
          </span>
        </div>
      )}
    </div>
  );
};
