import React, { useState } from 'react';
import { Product } from '../types/product';
import { formatPrice, buyTool } from '../utils/telegram';
import { 
  Terminal, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  Workflow, 
  BookOpen, 
  Wrench, 
  ArrowUpRight,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  theme: 'dark' | 'light';
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  theme,
  onViewDetails,
}) => {
  const [imageError, setImageError] = useState(false);

  // Category Icon helper
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'Web Tools':
        return <Globe className="w-4 h-4 text-[#00FF66]" />;
      case 'Developer Tools':
        return <Terminal className="w-4 h-4 text-[#00FF66]" />;
      case 'AI Tools':
        return <Cpu className="w-4 h-4 text-[#00FF66]" />;
      case 'Security Tools':
        return <ShieldCheck className="w-4 h-4 text-[#FF1744]" />;
      case 'Productivity':
        return <Workflow className="w-4 h-4 text-[#00FF66]" />;
      case 'Educational Tools':
        return <BookOpen className="w-4 h-4 text-[#00FF66]" />;
      case 'Utility Tools':
      default:
        return <Wrench className="w-4 h-4 text-[#00FF66]" />;
    }
  };

  const isPurchasable = product.status === 'AVAILABLE' || product.status === 'UPDATING';

  // Status Styling
  const getStatusBadge = () => {
    switch (product.status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.6)]">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse" />
            AVAILABLE
          </span>
        );
      case 'UPDATING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            UPDATING
          </span>
        );
      case 'COMING SOON':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            COMING SOON
          </span>
        );
      case 'SOLD OUT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF1744] drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]">
            <span className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_8px_#FF1744]" />
            SOLD OUT
          </span>
        );
    }
  };

  return (
    <article
      className={`group relative rounded-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 ${
        theme === 'dark'
          ? 'bg-[#111111] border-white/10 hover:border-[#00FF66] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)]'
          : 'bg-white border-neutral-200 hover:border-[#00FF66] hover:shadow-[0_0_25px_rgba(0,255,102,0.2)] shadow-sm'
      }`}
    >
      {/* Card Header Media */}
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* Resilient styled fallback container */
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                {getCategoryIcon()}
              </div>
              <span className="text-xs font-mono text-neutral-400">{product.name}</span>
            </div>
          )}

          {/* Scrim Gradient for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Top Overlays */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
            {/* Status indicator on image */}
            <div className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10">
              {getStatusBadge()}
            </div>

            {/* DEMO Tag */}
            {product.isDemo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
                DEMO
              </span>
            )}
          </div>

          {/* Bottom Overlay Info on Media */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span className="font-mono text-neutral-300">{product.platform}</span>
            <span className="font-mono text-neutral-400">v{product.version}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Category & Icon */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            {getCategoryIcon()}
            <span className="font-medium">{product.category}</span>
          </div>

          {/* Tool Name */}
          <h3 className="font-display text-lg font-bold tracking-tight line-clamp-1 group-hover:text-[#00FF66] transition-colors">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            {product.description}
          </p>

          {/* Unboxed Metadata Line with typographic separators */}
          <div className={`text-xs font-mono pt-1 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            <span>{product.category}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>v{product.version}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="truncate">{product.platform}</span>
          </div>
        </div>
      </div>

      {/* Card Footer with Price and Actions */}
      <div className={`p-5 pt-0 border-t ${
        theme === 'dark' ? 'border-white/5' : 'border-neutral-100'
      }`}>
        <div className="flex items-baseline justify-between py-3">
          <span className={`text-xs uppercase font-mono tracking-wider ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
          }`}>
            Price
          </span>
          <span className="font-display font-extrabold text-lg tabular-nums text-current">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onViewDetails(product)}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              theme === 'dark'
                ? 'border-white/15 bg-neutral-900/60 hover:bg-neutral-800 text-white'
                : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VIEW DETAILS</span>
          </button>

          {isPurchasable ? (
            <button
              onClick={() => buyTool(product)}
              className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.35)] hover:shadow-[0_0_25px_rgba(0,255,102,0.65)] active:translate-y-0.5 border border-[#00FF66]"
            >
              <span>BUY NOW</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              disabled
              title={`${product.status} - Not currently available for immediate order`}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold cursor-not-allowed opacity-60 flex items-center justify-center gap-1 border ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-white/5 text-neutral-400'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-500'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>NOT AVAILABLE</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
