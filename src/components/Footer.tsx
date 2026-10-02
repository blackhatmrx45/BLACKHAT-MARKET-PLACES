import React from 'react';
import { Send, Shield } from 'lucide-react';
import { TELEGRAM_BASE_URL, TELEGRAM_USERNAME } from '../utils/telegram';
import { BhodtLogo } from './BhodtLogo';

interface FooterProps {
  theme: 'dark' | 'light';
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ theme, onSelectTab }) => {
  return (
    <footer className={`border-t transition-colors ${
      theme === 'dark'
        ? 'bg-[#080808] border-white/10 text-white'
        : 'bg-neutral-100 border-neutral-200 text-neutral-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info with Black Hat Logo */}
          <div className="md:col-span-5 space-y-4">
            <BhodtLogo size="md" showText={true} />

            <p className="text-xs font-mono font-bold tracking-wider text-[#00E5FF]">
              BLACK HAT OFFICIAL DEVELOPING TEAM
            </p>

            <p className={`text-sm italic leading-relaxed ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              "Digital tools built with creativity and technology."
            </p>

            <p className="text-xs text-neutral-500">
              Developing legitimate developer utilities, web productivity tools, and authorized defensive security scanners.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-400 block">
              Navigation
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onSelectTab('home')}
                  className="text-neutral-400 hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  HOME
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('tools')}
                  className="text-neutral-400 hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  TOOLS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('about')}
                  className="text-neutral-400 hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  ABOUT BHODT
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('contact')}
                  className="text-neutral-400 hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  CONTACT
                </button>
              </li>
            </ul>
          </div>

          {/* Telegram / Direct Contact */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-400 block">
              Official Telegram
            </span>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              All official orders, inquiries, license delivery, and technical assistance are managed directly via Telegram.
            </p>
            <a
              href={TELEGRAM_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#141414] hover:bg-[#1a1a1a] text-[#00FF66] border border-[#00FF66]/30 hover:border-[#00FF66] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@{TELEGRAM_USERNAME}</span>
            </a>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className={`mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${
          theme === 'dark' ? 'border-white/10 text-neutral-500' : 'border-neutral-200 text-neutral-500'
        }`}>
          <div>
            © 2026 BHODT. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>BLACK_HAR_OFFICIAL_DEVELOPING_TEAM</span>
            <span aria-hidden="true">·</span>
            <span>Sri Lanka (LKR)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
