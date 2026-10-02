import React, { useState } from 'react';
import { Send, Copy, Check, MessageSquare, ShieldCheck, Clock, HelpCircle } from 'lucide-react';
import { TELEGRAM_BASE_URL, TELEGRAM_USERNAME, getContactTelegramUrl } from '../utils/telegram';

interface ContactSectionProps {
  theme: 'dark' | 'light';
}

export const ContactSection: React.FC<ContactSectionProps> = ({ theme }) => {
  const [inquiryTopic, setInquiryTopic] = useState('Tool Purchase & Delivery');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  const topics = [
    'Tool Purchase & Delivery',
    'Custom Tool Development',
    'Technical Support & Updates',
    'Commercial / Academic Licensing',
    'Defensive Security Assessment Inquiry'
  ];

  const formattedMessage = `Hello BHODT,

I would like to contact you regarding: ${inquiryTopic}
${customNote ? `\nDetails: ${customNote}` : ''}

Thank you.`;

  const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(formattedMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact-section" className={`py-16 sm:py-20 border-t ${
      theme === 'dark' ? 'border-white/5 bg-[#0d0d0d]' : 'border-neutral-200 bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#00FF66]">
            OFFICIAL COMMUNICATIONS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            CONTACT BHODT
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Connect directly with the Black Har Official Developing Team for product inquiries, license issuance, and swift software delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Left: Contact Info & FAQ */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 rounded-2xl border space-y-4 ${
              theme === 'dark' ? 'bg-[#111111] border-white/10' : 'bg-neutral-50 border-neutral-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-neutral-400 block uppercase">Official Telegram</span>
                  <a
                    href={TELEGRAM_BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-lg font-bold text-current hover:text-[#00FF66] transition-colors"
                  >
                    @{TELEGRAM_USERNAME}
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="w-4 h-4 text-[#00FF66]" />
                  <span>Response Time: Typically within 1–4 hours</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
                  <span>Secure, end-to-end direct developer chat</span>
                </div>
              </div>
            </div>

            {/* Delivery FAQ */}
            <div className={`p-6 rounded-2xl border space-y-3 ${
              theme === 'dark' ? 'bg-[#111111] border-white/10' : 'bg-neutral-50 border-neutral-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#00FF66]">
                <HelpCircle className="w-4 h-4" />
                <span>How Delivery Works</span>
              </div>
              <p className={`text-xs leading-relaxed ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                Once you confirm your tool order on Telegram, BHODT provides direct download credentials, license verification keys, and setup documentation immediately.
              </p>
            </div>
          </div>

          {/* Right: Interactive Message Builder */}
          <div className={`lg:col-span-7 p-6 sm:p-8 rounded-2xl border space-y-5 ${
            theme === 'dark' ? 'bg-[#111111] border-white/10' : 'bg-white border-neutral-200 shadow-sm'
          }`}>
            <h3 className="font-display text-lg font-bold">Compose Telegram Message</h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase font-semibold text-neutral-400 mb-1.5">
                  Select Topic
                </label>
                <select
                  value={inquiryTopic}
                  onChange={(e) => setInquiryTopic(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    theme === 'dark'
                      ? 'bg-[#181818] border-white/10 text-white'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900'
                  }`}
                >
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase font-semibold text-neutral-400 mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Specify tool names, version questions, or platform needs..."
                  className={`w-full p-2.5 rounded-lg border text-xs transition-colors outline-none resize-none ${
                    theme === 'dark'
                      ? 'bg-[#181818] border-white/10 text-white placeholder-neutral-500 focus:border-[#00FF66]'
                      : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-[#00FF66]'
                  }`}
                />
              </div>

              {/* Preview Box */}
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400 mb-1">
                  <span>PREVIEW PRE-FILLED TELEGRAM MESSAGE:</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[#00FF66] hover:underline cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className={`p-3 rounded-lg border font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-all ${
                  theme === 'dark' ? 'bg-black border-white/10 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                }`}>
                  {formattedMessage}
                </div>
              </div>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#00FF66]/20"
              >
                <Send className="w-4 h-4" />
                <span>OPEN TELEGRAM WITH THIS MESSAGE (@{TELEGRAM_USERNAME})</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
