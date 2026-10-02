import React, { useState, useEffect } from 'react';
import { Product } from '../types/product';
import { formatPrice, buyTool, generatePurchaseMessage, getBuyToolWhatsAppUrl, TELEGRAM_BASE_URL, TELEGRAM_USERNAME, WHATSAPP_NUMBER } from '../utils/telegram';
import { 
  X, 
  Check, 
  Copy, 
  Send, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  HardDrive, 
  FileCode, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Bookmark
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  theme: 'dark' | 'light';
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  theme,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isPurchasable = product.status === 'AVAILABLE' || product.status === 'UPDATING';
  const purchaseMessage = generatePurchaseMessage(product);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(purchaseMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    switch (product.status) {
      case 'AVAILABLE':
        return 'text-[#00FF66] bg-[#00FF66]/10 border-[#00FF66]/30';
      case 'UPDATING':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'COMING SOON':
        return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'SOLD OUT':
      default:
        return 'text-[#FF1744] bg-[#FF1744]/10 border-[#FF1744]/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog with Neon Glow */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className={`relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-8 z-10 transition-all ${
          theme === 'dark'
            ? 'bg-[#111111] border-[#00FF66]/40 shadow-[0_0_40px_rgba(0,255,102,0.2)] text-white'
            : 'bg-white border-neutral-300 shadow-2xl text-neutral-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close product details modal"
          className={`absolute top-4 right-4 z-20 p-2 rounded-full border transition-colors ${
            theme === 'dark'
              ? 'bg-[#1a1a1a]/80 border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-800'
              : 'bg-white/80 border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 shadow-sm'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Media & Highlights */}
          <div className={`md:col-span-5 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r ${
            theme === 'dark' ? 'bg-[#0d0d0d] border-white/10' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="space-y-4">
              {/* Product Image */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shadow-inner">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    {product.platform}
                  </span>
                  <span className="font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    v{product.version}
                  </span>
                </div>
              </div>

              {/* Status & Demo Badges */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor()}`}>
                  {product.status}
                </span>
                {product.isDemo && (
                  <span className="px-2 py-1 rounded-md text-xs font-mono font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                    DEMO PRODUCT
                  </span>
                )}
              </div>

              {/* Price Callout */}
              <div className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-[#141414] border-white/10' : 'bg-white border-neutral-200 shadow-sm'
              }`}>
                <span className={`text-xs uppercase font-mono tracking-wider block ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  Current Price
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-3xl font-extrabold text-[#00FF66]">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    (Sri Lankan Rupees)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  No online payment gateway needed. Direct purchase via verified Telegram @blackhatmrx.
                </p>
              </div>

              {/* Quick Specs */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">File Type</span>
                  <span className="font-mono font-medium">{product.fileType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">License</span>
                  <span className="font-medium text-right truncate max-w-[200px]">{product.license}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">Last Updated</span>
                  <span className="font-mono">{product.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Support note */}
            <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00FF66] shrink-0" />
              <span>{product.supportInfo}</span>
            </div>
          </div>

          {/* Right Column: Full Details, Features & Purchase flow */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-[#00FF66]">
                {product.category}
              </span>
              <h2 id="product-modal-title" className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                {product.name}
              </h2>
              <p className={`mt-3 text-sm leading-relaxed ${
                theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                {product.description}
              </p>
            </div>

            {/* Features List with Checkmarks */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-400 mb-3">
                Key Features & Capabilities
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feature, idx) => (
                  <li 
                    key={idx} 
                    className={`flex items-start gap-2 p-2.5 rounded-lg text-xs border ${
                      theme === 'dark' 
                        ? 'bg-neutral-900/60 border-white/5 text-neutral-300' 
                        : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-[#00FF66] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Requirements */}
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'bg-[#0f0f0f] border-white/10' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                System Requirements
              </h4>
              <p className={`text-xs leading-relaxed ${
                theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                {product.requirements}
              </p>
            </div>

            {/* Purchase Action Box */}
            <div className="space-y-2.5 pt-2">
              {isPurchasable ? (
                <>
                  <button
                    onClick={() => buyTool(product)}
                    className="w-full py-3 px-5 rounded-xl font-extrabold text-sm bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:shadow-[0_0_30px_rgba(0,255,102,0.7)] active:translate-y-0.5 border border-[#00FF66]"
                  >
                    <Send className="w-4 h-4" />
                    <span>BUY VIA TELEGRAM (@{TELEGRAM_USERNAME})</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <a
                    href={getBuyToolWhatsAppUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-5 rounded-xl font-extrabold text-sm bg-[#00E5FF] text-[#0A0A0A] hover:bg-[#00c8e0] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.4)] active:translate-y-0.5 border border-[#00E5FF]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>BUY VIA WHATSAPP ({WHATSAPP_NUMBER})</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  {/* Save to Favorites Button */}
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('bhodt_auth_token');
                      if (!token) {
                        alert('Please log in to save favorite tools to your dashboard.');
                        window.location.href = '/login.html';
                        return;
                      }
                      try {
                        const res = await fetch('/api/user/favorites', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ product_id: product.id })
                        });
                        const data = await res.json();
                        alert(data.message || 'Saved to your dashboard favorites!');
                      } catch (e) {
                        alert('Saved to favorites!');
                      }
                    }}
                    className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Save to Dashboard Favorites</span>
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>NOT AVAILABLE ({product.status})</span>
                </button>
              )}

              {/* Message Generator Drawer / Toggle */}
              <div className="pt-2">
                <button
                  onClick={() => setShowMessagePreview(!showMessagePreview)}
                  className="text-xs text-neutral-400 hover:text-white underline cursor-pointer flex items-center gap-1.5"
                >
                  <span>{showMessagePreview ? 'Hide' : 'View'} pre-filled Telegram order message</span>
                </button>

                {showMessagePreview && (
                  <div className={`mt-3 p-3.5 rounded-lg border text-xs font-mono space-y-2.5 ${
                    theme === 'dark' ? 'bg-black border-white/10 text-neutral-300' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                  }`}>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-1 border-b border-white/10">
                      <span>AUTOMATICALLY GENERATED FOR @{TELEGRAM_USERNAME}:</span>
                      <button
                        onClick={handleCopyMessage}
                        className="inline-flex items-center gap-1 text-[#00FF66] hover:underline cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-[11px] leading-relaxed select-all">
                      {purchaseMessage}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
