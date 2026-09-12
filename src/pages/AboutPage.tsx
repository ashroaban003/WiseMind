import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = () => {
  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-16">
      {/* Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAE0CA] text-[#543820] text-base font-semibold border border-[#D5C2A4]">
          <Heart className="w-5 h-5 text-[#8B5829]" />
          <span>Our Story & Craft</span>
        </div>

        <h1 className="font-serif-title text-4xl sm:text-5xl font-bold text-[#2C190B] tracking-tight">
          About Daily Mind Games
        </h1>

        <p className="text-xl sm:text-2xl text-[#5E432C] leading-relaxed">
          Inspired by the timeless pleasure of handcrafted wooden tabletop puzzles and parlor games.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="space-y-8 text-xl text-[#523720] leading-relaxed">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF4E6] border-2 border-[#DBC6A3] space-y-6 shadow-sm">
          <h2 className="font-serif-title text-3xl font-bold text-[#2E1A0C]">
            A Nostalgic, Calmer Way to Play
          </h2>
          <p>
            Many digital apps today are loud, flashing, competitive, or filled with countdown alarms. We wanted something different—an experience reminiscent of opening a cedar game box on a Sunday afternoon, laying polished wooden blocks on a warm dining table, and quietly challenging yourself with family.
          </p>
          <p>
            Every texture, shadow, and transition in Daily Mind Games is tuned to evoke that comforting warmth. There are no frantic timers, no penalty buzzers, and no confusing menus.
          </p>
        </div>

        {/* Clear Non-Medical Commitment */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#F4ECDD] border-2 border-[#D6A86E] space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-[#2E1A0C]">
            <ShieldCheck className="w-8 h-8 text-[#8B5829] shrink-0" />
            <h3 className="font-serif-title text-2xl sm:text-3xl font-bold">
              Our Non-Medical Commitment
            </h3>
          </div>
          <p>
            We believe in honest, straightforward communication. Daily Mind Games is <strong>not</strong> a medical diagnostic tool or therapeutic treatment, and we make zero clinical claims such as "preventing dementia" or guaranteed cognitive cures.
          </p>
          <p>
            Instead, we position our activities around what they truly are: <strong>enjoyable, mentally active daily pastimes, small pleasant memory challenges, and simple good fun.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
