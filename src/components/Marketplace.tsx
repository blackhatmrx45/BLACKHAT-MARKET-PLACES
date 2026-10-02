import React, { useState, useMemo } from 'react';
import { Product, FilterCategory, SortOption } from '../types/product';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';

interface MarketplaceProps {
  products: Product[];
  theme: 'dark' | 'light';
  onViewDetails: (product: Product) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  products,
  theme,
  onViewDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortOption>('NEWEST');

  const filterCategories: { id: FilterCategory; label: string }[] = [
    { id: 'ALL', label: 'ALL' },
    { id: 'WEB', label: 'WEB' },
    { id: 'DEVELOPER', label: 'DEVELOPER' },
    { id: 'AI', label: 'AI' },
    { id: 'SECURITY', label: 'SECURITY' },
    { id: 'PRODUCTIVITY', label: 'PRODUCTIVITY' },
    { id: 'EDUCATION', label: 'EDUCATION' },
    { id: 'UTILITY', label: 'UTILITY' },
  ];

  // Helper to map category to filter key
  const matchCategory = (categoryName: string, filterKey: FilterCategory): boolean => {
    if (filterKey === 'ALL') return true;
    switch (filterKey) {
      case 'WEB':
        return categoryName === 'Web Tools';
      case 'DEVELOPER':
        return categoryName === 'Developer Tools';
      case 'AI':
        return categoryName === 'AI Tools';
      case 'SECURITY':
        return categoryName === 'Security Tools';
      case 'PRODUCTIVITY':
        return categoryName === 'Productivity';
      case 'EDUCATION':
        return categoryName === 'Educational Tools';
      case 'UTILITY':
        return categoryName === 'Utility Tools';
      default:
        return true;
    }
  };

  // Filter and Sort computation
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((tool) => {
        // Category match
        const matchesCategory = matchCategory(tool.category, selectedCategory);
        if (!matchesCategory) return false;

        // Search match (name, category, description, version)
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
        return (
          tool.name.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.version.toLowerCase().includes(query) ||
          tool.platform.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        switch (selectedSort) {
          case 'PRICE_LOW_HIGH':
            return a.price - b.price;
          case 'PRICE_HIGH_LOW':
            return b.price - a.price;
          case 'NAME_A_Z':
            return a.name.localeCompare(b.name);
          case 'NEWEST':
          default:
            return b.lastUpdated.localeCompare(a.lastUpdated);
        }
      });
  }, [products, searchQuery, selectedCategory, selectedSort]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      ALL: products.length,
      WEB: 0,
      DEVELOPER: 0,
      AI: 0,
      SECURITY: 0,
      PRODUCTIVITY: 0,
      EDUCATION: 0,
      UTILITY: 0,
    };
    products.forEach((p) => {
      if (p.category === 'Web Tools') counts.WEB++;
      if (p.category === 'Developer Tools') counts.DEVELOPER++;
      if (p.category === 'AI Tools') counts.AI++;
      if (p.category === 'Security Tools') counts.SECURITY++;
      if (p.category === 'Productivity') counts.PRODUCTIVITY++;
      if (p.category === 'Educational Tools') counts.EDUCATION++;
      if (p.category === 'Utility Tools') counts.UTILITY++;
    });
    return counts;
  }, [products]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSort('NEWEST');
  };

  return (
    <section id="marketplace-section" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#00FF66] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MARKETPLACE CATALOG</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              OUR TOOLS
            </h2>
            <p className={`text-sm mt-1 max-w-xl ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Browse verified software utilities, developer tools, and digital solutions created by BHODT.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className={`text-xs font-mono uppercase tracking-wider ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              Sort by:
            </span>
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                aria-label="Sort tools"
                className={`py-2 pl-3 pr-8 rounded-lg text-xs font-semibold border cursor-pointer appearance-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#141414] border-white/10 text-white hover:border-[#00FF66]/50 focus:border-[#00FF66]'
                    : 'bg-white border-neutral-300 text-neutral-900 hover:border-neutral-400 shadow-sm'
                }`}
              >
                <option value="NEWEST">NEWEST</option>
                <option value="PRICE_LOW_HIGH">PRICE: LOW → HIGH</option>
                <option value="PRICE_HIGH_LOW">PRICE: HIGH → LOW</option>
                <option value="NAME_A_Z">NAME: A → Z</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Live Search and Category Filters */}
        <div className="space-y-4">
          {/* Search Input Bar */}
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name, category, description, or version..."
              className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm border transition-all outline-none ${
                theme === 'dark'
                  ? 'bg-[#141414] border-white/10 text-white placeholder-neutral-500 focus:border-[#00FF66] focus:shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-[#00FF66] focus:shadow-[0_0_15px_rgba(0,255,102,0.2)] shadow-sm'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs (Segmented Control Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {filterCategories.map((cat) => {
              const count = categoryCounts[cat.id];
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#00FF66] text-[#0A0A0A] border-[#00FF66] shadow-[0_0_16px_rgba(0,255,102,0.45)]'
                      : theme === 'dark'
                      ? 'bg-[#141414] text-neutral-400 border-white/10 hover:text-white hover:border-[#00FF66]/50 hover:bg-neutral-800'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected
                      ? 'bg-black/20 text-[#0A0A0A]'
                      : theme === 'dark'
                      ? 'bg-white/5 text-neutral-400'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                theme={theme}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          /* Live Empty State */
          <div className={`p-12 text-center rounded-2xl border ${
            theme === 'dark' ? 'bg-[#111111] border-white/10' : 'bg-neutral-50 border-neutral-200'
          }`}>
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-white/5 border border-white/10 text-neutral-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold">No tools found</h3>
              <p className={`text-xs sm:text-sm ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                We couldn't find any tools matching your current search or category filter. Try clearing keywords or exploring all categories.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-colors cursor-pointer"
              >
                Reset Filters & Search
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
