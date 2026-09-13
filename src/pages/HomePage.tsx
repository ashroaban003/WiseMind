import React from 'react';
import {
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Compass,
  Heart,
} from 'lucide-react';
import seniorsPlayingImg from '../assets/images/seniors_playing_tablet.webp';
import { gameRegistry, getAvailableGames } from '../games/registry';
import { GameCard } from '../components/games/GameCard';
import { Button } from '../components/common/Button';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const handleStartPlaying = () => {
    const available = getAvailableGames();
    if (available.length === 0) {
      onNavigate('/games');
      return;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    onNavigate(available[randomIndex].path);
  };
  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-10 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFE3CE] text-[#634327] font-semibold text-base sm:text-lg border border-[#DAC8AC]">
                <Heart className="w-5 h-5 text-[#B84D29]" />
                <span>Thoughtfully Designed for Older Adults</span>
              </div>

              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C190B] tracking-tight leading-[1.18]">
                Simple Brain Games{' '}
                <span className="block text-[#8B5829]">Made for Older Adults</span>
              </h1>

              <p className="text-xl sm:text-2xl text-[#593E27] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Enjoy a few minutes of simple memory and thinking activities designed to be relaxing, easy to use, and fun.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  variant="wood"
                  size="xl"
                  onClick={handleStartPlaying}
                  icon={<Play className="w-6 h-6 fill-current" />}
                  className="w-full sm:w-auto shadow-lg"
                >
                  Start Playing
                </Button>

                <Button
                  variant="secondary"
                  size="xl"
                  onClick={() => onNavigate('/games')}
                  icon={<Compass className="w-6 h-6" />}
                  className="w-full sm:w-auto"
                >
                  Explore Games
                </Button>
              </div>
            </div>

            {/* Right Visual: Warm illustration of older adults comfortably enjoying tablet game */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[480px] rounded-3xl overflow-hidden p-3.5 bg-gradient-to-b from-[#EFE5D2] to-[#E2D2B5] border-4 border-[#C9A67B] shadow-[0_20px_40px_rgba(70,40,15,0.18)]">
                <img
                  src={seniorsPlayingImg}
                  alt="Smiling older adults comfortably enjoying a simple brain game together on a tablet at home"
                  referrerPolicy="no-referrer"
                  width={800}
                  height={600}
                  loading="eager"
                  className="w-full h-auto aspect-[4/3] object-cover rounded-2xl shadow-md border border-[#DFCBAA]"
                />
                <div className="pt-3 pb-1 text-center text-base sm:text-lg font-medium text-[#5C3F27]">
                  “A peaceful morning ritual — simple, fun, and easy on the eyes.”
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GAMES SECTION (Rendered dynamically from registry) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4" id="games-section">
        <div className="mb-10 pb-4 border-b border-[#E3D3B8]">
          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E1A0C] mb-2">
            Our Memory Activities
          </h2>
          <p className="text-xl sm:text-2xl text-[#63452B]">
            Handcrafted games inspired by beloved wooden puzzles.
          </p>
        </div>

        {/* Dynamic Game Registry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gameRegistry.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onSelectGame={onNavigate}
            />
          ))}
        </div>
      </section>

      {/* 4. PRODUCT EXPLANATION / HOW IT WORKS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="how-it-works-section">
        <div className="bg-[#F6EEE0] border-2 border-[#D8C4A3] rounded-3xl p-8 sm:p-14 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E1A0C] mb-4">
              How It Works
            </h2>
            <p className="text-xl sm:text-2xl text-[#63452B]">
              Designed from the ground up to be intuitive, calming, and effortless to enjoy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="text-5xl font-serif-title font-bold text-[#8B5829]">1.</div>
              <h3 className="font-serif-title text-2xl font-bold text-[#2E1A0C]">
                Choose Your Level
              </h3>
              <p className="text-lg sm:text-xl text-[#5C4129] leading-relaxed">
                Start on Easy and move up whenever you feel comfortable.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-5xl font-serif-title font-bold text-[#8B5829]">2.</div>
              <h3 className="font-serif-title text-2xl font-bold text-[#2E1A0C]">
                Observe &amp; Remember
              </h3>
              <p className="text-lg sm:text-xl text-[#5C4129] leading-relaxed">
                You may see block patterns, flashing paths, arrows, or combinations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-5xl font-serif-title font-bold text-[#8B5829]">3.</div>
              <h3 className="font-serif-title text-2xl font-bold text-[#2E1A0C]">
                Respond
              </h3>
              <p className="text-lg sm:text-xl text-[#5C4129] leading-relaxed">
                Click, tap, or enter what you remembered.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-5xl font-serif-title font-bold text-[#8B5829]">4.</div>
              <h3 className="font-serif-title text-2xl font-bold text-[#2E1A0C]">
                Improve Daily
              </h3>
              <p className="text-lg sm:text-xl text-[#5C4129] leading-relaxed">
                Train regularly to build focus, working memory, and consistency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GENTLE TRUST & ABOUT SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-[#EAE0CA] text-[#523821] font-semibold text-base">
          <ShieldCheck className="w-5 h-5 text-[#8B5829]" />
          <span>Our Approach & Philosophy</span>
        </div>

        <p className="text-xl text-[#5C4129] leading-relaxed max-w-3xl mx-auto">
          We believe mental wellness comes from pleasant routines, curiosity, and smiles. wiseMind is built with warm wooden aesthetics, forgiving controls, and large text so you can relax with a morning cup of coffee or tea and spend a few quiet, rewarding minutes exercising your recall.
        </p>
      </section>
    </div>
  );
};
