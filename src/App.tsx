import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { HowItWorks } from './components/HowItWorks';
import { WhyBhodt } from './components/WhyBhodt';
import { TrustSection } from './components/TrustSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { FloatingTelegram } from './components/FloatingTelegram';
import { CyberBackgroundVideo } from './components/CyberBackgroundVideo';
import { AiAssistant } from './components/AiAssistant';
import { products } from './data/products';
import { Product } from './types/product';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('bhodt_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync theme with localStorage and body classes
  useEffect(() => {
    localStorage.setItem('bhodt_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0A0A0A';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FAFAFA';
      document.body.style.color = '#111111';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const scrollToMarketplace = () => {
    setActiveTab('tools');
    const el = document.getElementById('marketplace-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    setActiveTab('contact');
    const el = document.getElementById('contact-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'tools') {
      const el = document.getElementById('marketplace-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'how-it-works') {
      const el = document.getElementById('how-it-works-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'why-bhodt') {
      const el = document.getElementById('why-bhodt-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'about') {
      const el = document.getElementById('about-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'contact') {
      const el = document.getElementById('contact-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 relative ${
      theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-neutral-900'
    }`}>
      {/* Cyber Team Neon Red & Blue Animated Background Video */}
      <CyberBackgroundVideo theme={theme} />

      {/* Primary Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          theme={theme}
          onExploreClick={scrollToMarketplace}
          onContactClick={scrollToContact}
        />

        {/* Tool Marketplace Section */}
        <Marketplace
          products={products}
          theme={theme}
          onViewDetails={handleViewDetails}
        />

        {/* How It Works (3 Steps) */}
        <HowItWorks theme={theme} />

        {/* Why Choose BHODT? */}
        <WhyBhodt theme={theme} />

        {/* Trust & Information Policy */}
        <TrustSection theme={theme} />

        {/* About BHODT */}
        <AboutSection theme={theme} onExploreClick={scrollToMarketplace} />

        {/* Contact BHODT */}
        <ContactSection theme={theme} />
      </main>

      {/* Global Footer */}
      <Footer theme={theme} onSelectTab={handleSelectTab} />

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        theme={theme}
        onClose={handleCloseModal}
      />

      {/* Global Floating Telegram Contact Button */}
      <FloatingTelegram theme={theme} />

      {/* 24/7 BHODT AI Voice & Chat Assistant */}
      <AiAssistant
        theme={theme}
        currentProduct={selectedProduct}
        activeTab={activeTab}
        onOpenProductModal={handleViewDetails}
        onNavigateSection={(sectionId) => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
