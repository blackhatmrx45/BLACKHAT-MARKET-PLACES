import React from 'react';
import { Terminal, Shield, Cpu, Code2, Users, Send } from 'lucide-react';
import { TELEGRAM_BASE_URL, TELEGRAM_USERNAME } from '../utils/telegram';

interface AboutSectionProps {
  theme: 'dark' | 'light';
  onExploreClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ theme, onExploreClick }) => {
  return (
    <section id="about-section" className={`py-16 sm:py-20 border-t ${
      theme === 'dark' ? 'border-white/5 bg-[#0a0a0a]' : 'border-neutral-200 bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00FF66]">
            ABOUT THE DEVELOPERS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            BLACK_HAR_OFFICIAL_DEVELOPING_TEAM
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            BHODT is an independent software development and digital tools engineering team dedicated to creating high-performance, developer-first utilities, web tooling, educational simulators, and defensive security software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#111111] border-white/10' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5 text-[#00FF66]" />
            </div>
            <h3 className="font-display text-base font-bold mb-2">Modern Tooling Architecture</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              We design lightweight, dependency-free utilities crafted for high execution speed, zero telemetry, and complete local privacy.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#111111] border-white/10' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-[#FF1744]/10 border border-[#FF1744]/30 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-[#FF1744]" />
            </div>
            <h3 className="font-display text-base font-bold mb-2">Defensive & Ethical Standards</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              All security-related offerings are restricted strictly to authorized security auditing, defensive system hardening, and academic computer science research.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-[#111111] border-white/10' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="w-10 h-10 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#00FF66]" />
            </div>
            <h3 className="font-display text-base font-bold mb-2">Direct Developer Relationship</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              No anonymous ticketing portals or automated bots. Speak directly with BHODT engineers on Telegram for customization and technical queries.
            </p>
          </div>
        </div>

        <div className={`p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
          theme === 'dark' ? 'bg-[#0f0f0f] border-white/10' : 'bg-neutral-100 border-neutral-300'
        }`}>
          <div>
            <h4 className="font-display text-lg font-bold">Have custom tool requirements?</h4>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Contact the BHODT developing team via Telegram to discuss bespoke utilities, integrations, or enterprise licenses.
            </p>
          </div>
          <a
            href={TELEGRAM_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl text-xs font-bold bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Chat on Telegram (@{TELEGRAM_USERNAME})</span>
          </a>
        </div>

      </div>
    </section>
  );
};
