import React from 'react';
import { MousePointerClick, Send, Layers } from 'lucide-react';
import { TELEGRAM_USERNAME } from '../utils/telegram';

interface HowItWorksProps {
  theme: 'dark' | 'light';
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ theme }) => {
  const steps = [
    {
      step: '01',
      title: 'CHOOSE A TOOL',
      description: 'Browse the available BHODT tools, inspect technical specifications, system compatibility, and feature lists.',
      icon: <Layers className="w-5 h-5 text-[#00FF66]" />,
    },
    {
      step: '02',
      title: 'CLICK BUY NOW',
      description: 'Select the product you want. Our system automatically formats the exact tool name, version, platform, and price.',
      icon: <MousePointerClick className="w-5 h-5 text-[#00FF66]" />,
    },
    {
      step: '03',
      title: 'CONTACT BHODT',
      description: `Telegram opens directly with your product information pre-filled and sent to @${TELEGRAM_USERNAME} for swift delivery.`,
      icon: <Send className="w-5 h-5 text-[#FF1744]" />,
    },
  ];

  return (
    <section id="how-it-works-section" className={`py-16 sm:py-20 border-t ${
      theme === 'dark' ? 'border-white/5 bg-[#0a0a0a]' : 'border-neutral-200 bg-neutral-50/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00FF66]">
            STREAMLINED ACQUISITION FLOW
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            HOW IT WORKS
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Simple, transparent, zero-friction process directly connected to the BHODT engineering team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 relative group ${
                theme === 'dark'
                  ? 'bg-[#111111] border-white/10 hover:border-[#00FF66]/40 hover:shadow-lg hover:shadow-[#00FF66]/5'
                  : 'bg-white border-neutral-200 hover:border-neutral-400 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Step Number */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-3xl font-extrabold text-[#00FF66]/90 tracking-tight">
                  {item.step}
                </span>
                <div className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-neutral-100 border-neutral-200'
                }`}>
                  {item.icon}
                </div>
              </div>

              <h3 className="font-display text-lg font-bold tracking-tight mb-2">
                {item.title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
