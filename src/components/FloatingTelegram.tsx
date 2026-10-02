import React from 'react';
import { Send } from 'lucide-react';
import { TELEGRAM_BASE_URL, TELEGRAM_USERNAME } from '../utils/telegram';

interface FloatingTelegramProps {
  theme: 'dark' | 'light';
}

export const FloatingTelegram: React.FC<FloatingTelegramProps> = ({ theme }) => {
  return (
    <aside 
      aria-label="Telegram Quick Contact"
      className="fixed bottom-22 right-6 z-40 hidden sm:block"
    >
      <a
        href={TELEGRAM_BASE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contact BHODT on Telegram @${TELEGRAM_USERNAME}`}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full font-black text-xs bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-all duration-300 shadow-[0_0_25px_rgba(0,255,102,0.5)] hover:shadow-[0_0_40px_rgba(0,255,102,0.85)] hover:-translate-y-1 active:translate-y-0 border-2 border-[#00FF66] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF66]"
      >
        <div className="w-5 h-5 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#00FF66] shrink-0 shadow-[0_0_8px_#00FF66]">
          <Send className="w-3 h-3 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="tracking-wider uppercase font-black whitespace-nowrap">
          CONTACT BHODT
        </span>
        <span className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_8px_#FF1744] animate-pulse" />
      </a>
    </aside>
  );
};
