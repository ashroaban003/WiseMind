import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { GamesPage } from './pages/GamesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { GridMemoryGame } from './games/grid-memory/GridMemoryGame';
import { SequenceMemoryGame } from './games/sequence-memory/SequenceMemoryGame';
import { ArrowFinderGame } from './games/arrow-finder/ArrowFinderGame';
import { MemoryLockerGame } from './games/memory-locker/MemoryLockerGame';
import { ImpulseMatchGame } from './games/impulse-match/ImpulseMatchGame';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      return pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render current view according to route path
  const renderContent = () => {
    switch (currentPath) {
      case '/games/grid-memory':
        return <GridMemoryGame onBack={() => navigate('/games')} />;
      case '/games/sequence-memory':
        return <SequenceMemoryGame onBack={() => navigate('/games')} />;
      case '/games/arrow-finder':
        return <ArrowFinderGame onBack={() => navigate('/games')} />;
      case '/games/memory-locker':
        return <MemoryLockerGame onBack={() => navigate('/games')} />;
      case '/games/impulse-match':
        return <ImpulseMatchGame onBack={() => navigate('/games')} />;
      case '/games':
        return <GamesPage onNavigate={navigate} />;
      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigate} />;
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#2D2115]">
      {/* Skip to main content for accessibility screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[#8B5829] focus:text-[#FFFDF9] focus:rounded-xl focus:font-bold focus:shadow-xl"
      >
        Skip to main content
      </a>

      {/* Main Accessible Header */}
      <Header currentPath={currentPath} onNavigate={navigate} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 focus:outline-none">
        {renderContent()}
      </main>

      {/* Gentle Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
