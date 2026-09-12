import React, { useState } from 'react';
import { Sparkles, Menu, X, Play } from 'lucide-react';
import { Button } from './Button';
import { getAvailableGames } from '../../games/registry';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Games', path: '/games' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayToday = () => {
    const available = getAvailableGames();
    if (available.length === 0) {
      handleNavClick('/games');
      return;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    handleNavClick(available[randomIndex].path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#E8DCBF] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo / Product Name */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3.5 group text-left cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B8814D] rounded-xl p-1.5 transition-transform"
            aria-label="Daily Mind Games Home"
          >
            {/* Wooden Block Logo Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl wood-texture flex items-center justify-center text-[#FFFDF9] shadow-[0_3px_8px_rgba(80,45,15,0.3)] border border-[#E8C293]/40 group-hover:scale-105 transition-transform">
              <span className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FFF8EB] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                M
              </span>
            </div>
            <div>
              <span className="font-serif-title text-2xl sm:text-3xl font-bold text-[#352110] tracking-tight block leading-tight">
                Daily Mind Games
              </span>
              <span className="text-sm sm:text-base text-[#7A5B3D] font-medium block">
                Warm Tabletop Brain Activities
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`min-h-[48px] px-4 lg:px-5 py-2.5 rounded-xl text-lg font-medium transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B8814D] ${
                    isActive
                      ? 'bg-[#EAE0CA] text-[#2E1A0C] font-semibold shadow-inner'
                      : 'text-[#5A3F28] hover:bg-[#F2EADA] hover:text-[#2E1A0C]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Primary CTA */}
          <div className="hidden md:flex items-center">
            <Button
              variant="wood"
              size="md"
              onClick={handlePlayToday}
              icon={<Play className="w-5 h-5 fill-current" />}
              className="shadow-md"
            >
              Play Today's Game
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[48px] min-w-[48px] p-2.5 rounded-xl bg-[#EFE5D1] text-[#3D2614] border border-[#D9C8A8] flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B8814D]"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5D7BF] bg-[#F9F4E8] px-4 pt-4 pb-8 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`min-h-[52px] text-left px-5 py-3 rounded-xl text-xl font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#E5D6BA] text-[#2E1A0C] font-semibold'
                      : 'text-[#4A321E] hover:bg-[#EFE3CD]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#E8DCBF]">
            <Button
              variant="wood"
              size="lg"
              onClick={handlePlayToday}
              icon={<Sparkles className="w-6 h-6" />}
              className="w-full justify-center"
            >
              Play Today's Game
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
