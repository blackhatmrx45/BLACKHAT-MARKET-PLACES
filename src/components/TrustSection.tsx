import React from 'react';
import { ShieldCheck, Info, CheckCircle2, Lock } from 'lucide-react';
import { TELEGRAM_USERNAME } from '../utils/telegram';

interface TrustSectionProps {
  theme: 'dark' | 'light';
}

export const TrustSection: React.FC<TrustSectionProps> = ({ theme }) => {
  return (
    <section className={`py-16 sm:py-20 border-t ${
      theme === 'dark' ? 'border-white/5 bg-[#0d0d0d]' : 'border-neutral-200 bg-neutral-50/70'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`p-8 sm:p-10 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-[#111111] border-white/10'
            : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="max-w-3xl mx-auto text-center space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>TRANSPARENCY & VERIFICATION</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              BUY WITH CONFIDENCE
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${
              theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
            }`}>
              All products listed on this website are developed or distributed by BHODT. Product information, availability, pricing and licensing terms should be confirmed with BHODT before purchase.
            </p>

            <div className={`mt-8 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-6 text-left ${
              theme === 'dark' ? 'border-white/5' : 'border-neutral-100'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                  <span>DIRECT FROM DEVELOPERS</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Every product is maintained directly by the BHODT team without intermediary markups.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
                  <span>LEGITIMATE USE ONLY</span>
                </div>
                <p className="text-xs text-neutral-400">
                  All security and audit utilities are engineered strictly for authorized defense, educational analysis, and lawful testing.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                  <Lock className="w-4 h-4 text-[#FF1744]" />
                  <span>AUTHENTIC TELEGRAM</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Official inquiries and deliveries happen solely through verified Telegram @{TELEGRAM_USERNAME}.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
