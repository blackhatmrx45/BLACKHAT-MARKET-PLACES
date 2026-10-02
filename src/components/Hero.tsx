import React from 'react';
import { ArrowRight, Send, ShieldCheck, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import { TELEGRAM_BASE_URL } from '../utils/telegram';
import blackHatLogoImg from '../assets/images/bhodt_black_hat_logo_1790928314687.jpg';

interface HeroProps {
  theme: 'dark' | 'light';
  onExploreClick: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  theme,
  onExploreClick,
  onContactClick,
}) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28">
      {/* Premium vibrant cyber team neon green, blue and red ambient background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Neon Cyan-Blue Ambient Orb */}
        <div 
          className="absolute -top-[15%] left-[8%] w-[600px] h-[600px] rounded-full blur-[130px] opacity-30 transition-opacity animate-pulse"
          style={{ background: 'radial-gradient(circle, #00E5FF 0%, transparent 65%)' }}
        />
        {/* Neon Red Ambient Orb */}
        <div 
          className="absolute top-[20%] -right-[8%] w-[550px] h-[550px] rounded-full blur-[140px] opacity-30 transition-opacity"
          style={{ background: 'radial-gradient(circle, #FF1744 0%, transparent 65%)' }}
        />
        {/* Fine background grid line texture */}
        <div 
          className={`absolute inset-0 opacity-[0.04] ${
            theme === 'dark' ? 'invert-0' : 'invert'
          }`}
          style={{
            backgroundImage: `radial-gradient(rgba(0, 229, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Black Hat Logo Centerpiece */}
          <div className="flex justify-center mb-2">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-[#FF1744] via-[#00E5FF] to-[#00FF66] shadow-[0_0_35px_rgba(0,229,255,0.4),0_0_50px_rgba(255,23,68,0.3)] transform group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={blackHatLogoImg}
                    alt="BHODT Black Hat Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
              {/* Subtle pulsing cyber ring */}
              <div className="absolute -inset-1 rounded-2xl border border-[#00E5FF]/40 animate-ping opacity-30 pointer-events-none" />
            </div>
          </div>

          {/* Brand Kicker with Neon Border */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/5 shadow-[0_0_15px_rgba(0,229,255,0.2)] text-xs font-semibold tracking-wider uppercase transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-ping" />
            <span className={theme === 'dark' ? 'text-neutral-200' : 'text-neutral-800'}>
              BHODT TOOLS · <span className="text-[#00E5FF] font-bold">BLACK HAT OFFICIAL DEVELOPING TEAM</span>
            </span>
          </div>

          {/* Primary Headline with Neon Green, Blue & Red highlights */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-balance">
            POWERFUL DIGITAL TOOLS.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00FF66] to-[#FF1744] drop-shadow-[0_0_25px_rgba(0,229,255,0.4)]">
              BUILT BY BHODT.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className={`text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
          }`}>
            Discover useful digital tools, software utilities and development solutions created by the BHODT team.
          </p>

          {/* CTA Buttons with Neon Glow */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg text-sm font-extrabold bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_25px_rgba(0,255,102,0.45)] hover:shadow-[0_0_35px_rgba(0,255,102,0.7)] flex items-center justify-center gap-2 cursor-pointer border border-[#00FF66]"
            >
              <span>EXPLORE TOOLS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={TELEGRAM_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full sm:w-auto px-7 py-3.5 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'border-[#FF1744]/60 bg-neutral-900/80 hover:bg-neutral-800 text-white shadow-[0_0_20px_rgba(255,23,68,0.25)] hover:shadow-[0_0_30px_rgba(255,23,68,0.5)] hover:border-[#FF1744]'
                  : 'border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 hover:border-[#FF1744]'
              }`}
            >
              <Send className="w-4 h-4 text-[#FF1744] drop-shadow-[0_0_6px_#FF1744]" />
              <span>CONTACT BHODT</span>
            </a>
          </div>

          {/* Trust Attributes Row */}
          <div className="pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
              <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}>
                100% Legitimate Utilities
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Terminal className="w-4 h-4 text-[#00FF66]" />
              <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}>
                Direct Developer Source
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4 text-[#FF1744]" />
              <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}>
                Telegram @blackhatmrx
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
              <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}>
                Transparent LKR Pricing
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
