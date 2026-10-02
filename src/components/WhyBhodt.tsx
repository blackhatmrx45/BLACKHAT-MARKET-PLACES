import React from 'react';
import { Award, Headphones, RefreshCw, BadgePercent } from 'lucide-react';

interface WhyBhodtProps {
  theme: 'dark' | 'light';
}

export const WhyBhodt: React.FC<WhyBhodtProps> = ({ theme }) => {
  const pillars = [
    {
      title: 'QUALITY',
      description: 'Useful products built with attention to functionality, reliability, and usability.',
      icon: <Award className="w-5 h-5 text-[#00FF66]" />,
    },
    {
      title: 'SUPPORT',
      description: 'Contact the BHODT team directly through Telegram for prompt product assistance and onboarding.',
      icon: <Headphones className="w-5 h-5 text-[#00FF66]" />,
    },
    {
      title: 'UPDATES',
      description: 'Products receive regular improvements, patches, and version enhancements to ensure ongoing compatibility.',
      icon: <RefreshCw className="w-5 h-5 text-[#00FF66]" />,
    },
    {
      title: 'AFFORDABLE',
      description: 'High-utility digital solutions and developer tools offered at transparent and accessible prices in Sri Lankan Rupees.',
      icon: <BadgePercent className="w-5 h-5 text-[#FF1744]" />,
    },
  ];

  return (
    <section id="why-bhodt-section" className={`py-16 sm:py-20 border-t ${
      theme === 'dark' ? 'border-white/5 bg-[#0a0a0a]' : 'border-neutral-200 bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00FF66]">
            CORE ADVANTAGES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            WHY CHOOSE BHODT?
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Crafting software utilities and developer tooling focused strictly on real-world utility and high performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                theme === 'dark'
                  ? 'bg-[#111111] border-white/10 hover:border-[#00FF66]/30 hover:shadow-lg hover:shadow-[#00FF66]/5'
                  : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 shadow-sm'
              }`}
            >
              <div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
                }`}>
                  {item.icon}
                </div>
                <h3 className="font-display text-base font-bold tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
                }`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
