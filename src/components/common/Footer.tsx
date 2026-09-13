import React from 'react';
import { Heart, ShieldCheck, Brain } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-[#EFE5D2] border-t-2 border-[#DBC9A8] pt-14 pb-16 text-[#422C1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 pb-12 border-b border-[#DBC9A8]">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg wood-texture flex items-center justify-center text-[#FFFDF9] shadow-sm">
                <Brain className="w-6 h-6 text-[#FFF8EB] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] stroke-[2.2]" />
              </div>
              <span className="font-serif-title text-2xl font-bold text-[#2D1B0D]">
                wiseMind
              </span>
            </div>
            <p className="text-lg text-[#5A3F2A] leading-relaxed">
              Wholesome, tactile brain exercises designed to bring a few minutes of calm enjoyment, memory practice, and mental delight to your daily routine.
            </p>
            <div className="flex items-center gap-2 text-base text-[#705035] pt-2">
              <Heart className="w-5 h-5 text-[#A64B2A]" />
              <span>Crafted with patience for older adults & families</span>
            </div>
          </div>

          {/* Transparent Non-Medical Trust Statement */}
          <div className="space-y-4 bg-[#FAF5EB] p-6 rounded-2xl border border-[#D9C6A3] shadow-sm">
            <div className="flex items-center gap-2 text-[#634326]">
              <ShieldCheck className="w-6 h-6 text-[#8B5829] shrink-0" />
              <h4 className="font-serif-title text-lg font-bold text-[#2E1C0F]">
                Our Gentle Promise
              </h4>
            </div>
            <p className="text-base text-[#5A402B] leading-relaxed">
              wiseMind is dedicated to lighthearted fun, memory play, and enjoyable cognitive engagement. It is <strong>not</strong> a medical diagnostic tool or therapeutic treatment, and makes no health cure claims. Just pure, wholesome tabletop fun.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-base text-[#6B513C]">
          <p>© {new Date().getFullYear()} wiseMind. Inspired by classic wooden tabletop puzzles.</p>
          <div className="flex items-center gap-6">
            <span>High Contrast & Accessible</span>
            <span>•</span>
            <span>No Timers or Stress</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
