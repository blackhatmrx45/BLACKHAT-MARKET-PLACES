import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, Send, ShieldCheck, User, LogIn, LayoutDashboard, Shield } from 'lucide-react';
import { TELEGRAM_BASE_URL } from '../utils/telegram';
import { BhodtLogo } from './BhodtLogo';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check cached user
    const saved = localStorage.getItem('bhodt_auth_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }

    // Verify session with backend
    const token = localStorage.getItem('bhodt_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.user) {
            setCurrentUser(data.user);
            localStorage.setItem('bhodt_auth_user', JSON.stringify(data.user));
          } else {
            setCurrentUser(null);
            localStorage.removeItem('bhodt_auth_user');
            localStorage.removeItem('bhodt_auth_token');
          }
        })
        .catch(() => {});
    }
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'tools', label: 'Tools' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'why-bhodt', label: 'Why BHODT' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
      theme === 'dark'
        ? 'bg-[#0A0A0A]/90 border-white/10 text-white backdrop-blur-md'
        : 'bg-white/95 border-neutral-200 text-neutral-900 backdrop-blur-md shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Zone 1: Black Hat Brand Wordmark with Emblem */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF66] cursor-pointer"
            >
              <BhodtLogo size="md" showText={true} />
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links with neon underline */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-all py-1 cursor-pointer ${
                  activeTab === link.id
                    ? theme === 'dark'
                      ? 'text-[#00FF66] font-bold border-b-2 border-[#00FF66] shadow-[0_2px_10px_rgba(0,255,102,0.4)]'
                      : 'text-[#008f39] font-bold border-b-2 border-[#008f39]'
                    : theme === 'dark'
                    ? 'text-neutral-300 hover:text-[#00FF66] hover:drop-shadow-[0_0_6px_rgba(0,255,102,0.5)]'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                theme === 'dark'
                  ? 'border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-800'
                  : 'border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
            </button>

            {/* Authentication Link: Login or Dashboard */}
            {currentUser ? (
              <a
                href={currentUser.role === 'admin' ? '/admin/dashboard.html' : '/dashboard.html'}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.25)] transition-all cursor-pointer"
                title={`Signed in as ${currentUser.username}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentUser.role === 'admin' ? 'Admin Hub' : 'Dashboard'}</span>
              </a>
            ) : (
              <a
                href="/login.html"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#00E5FF]/40 text-neutral-200 hover:text-white hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-all cursor-pointer shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Log In</span>
              </a>
            )}

            {/* Telegram CTA with Neon Glow */}
            <a
              href={TELEGRAM_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_15px_rgba(0,255,102,0.45)] hover:shadow-[0_0_25px_rgba(0,255,102,0.7)] border border-[#00FF66]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@blackhatmrx</span>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className={`md:hidden p-2 rounded-lg border ${
                theme === 'dark'
                  ? 'border-white/10 text-neutral-300 hover:bg-neutral-800'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-4 pt-3 pb-5 space-y-2 ${
          theme === 'dark'
            ? 'bg-[#0f0f0f] border-white/10'
            : 'bg-white border-neutral-200 shadow-lg'
        }`}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === link.id
                  ? theme === 'dark'
                    ? 'bg-[#00FF66]/10 text-[#00FF66]'
                    : 'bg-neutral-100 text-neutral-900 font-semibold'
                  : theme === 'dark'
                  ? 'text-neutral-300 hover:bg-neutral-800'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 space-y-2">
            {currentUser ? (
              <a
                href={currentUser.role === 'admin' ? '/admin/dashboard.html' : '/dashboard.html'}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-[#00E5FF]/25 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{currentUser.role === 'admin' ? 'Open Admin Portal' : 'Open User Dashboard'}</span>
              </a>
            ) : (
              <a
                href="/login.html"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-[#00E5FF]/25 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In / Create Account</span>
              </a>
            )}

            <a
              href={TELEGRAM_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Contact BHODT (@blackhatmrx)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
