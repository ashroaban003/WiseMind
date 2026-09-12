import React from 'react';
import { motion } from 'motion/react';
import { PlacedArrow } from './logic';
import { ArrowDirection } from './config';

interface ArrowFieldProps {
  arrows: PlacedArrow[];
  roundKey: number;
}

const ROTATION_CLASSES: Record<ArrowDirection, string> = {
  up: 'rotate-0',
  right: 'rotate-90',
  down: 'rotate-180',
  left: '-rotate-90',
};

export const ArrowField: React.FC<ArrowFieldProps> = ({ arrows, roundKey }) => {
  return (
    <div
      id="arrow-play-area"
      aria-label="Scattered arrows play area"
      className="relative w-full max-w-xl mx-auto h-[210px] sm:h-[240px] md:h-[260px] bg-[#FBF6ED] border-3 sm:border-4 border-[#D9C4A2] rounded-2xl sm:rounded-3xl shadow-[inset_0_3px_12px_rgba(100,70,30,0.06)] overflow-hidden select-none pointer-events-none"
    >
      {/* Subtle warm tabletop frame effect */}
      <div className="absolute inset-0 pointer-events-none border border-[#EADBBE] rounded-[18px] m-1" />

      {/* Render each scattered arrow */}
      {arrows.map((arrow, idx) => (
        <motion.div
          key={`${roundKey}-${arrow.id}`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.22,
            delay: Math.min(0.2, idx * 0.008),
            ease: 'easeOut',
          }}
          style={{
            left: `${arrow.xPercent}%`,
            top: `${arrow.yPercent}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          {/* Uniform bold black / dark charcoal arrow */}
          <svg
            viewBox="0 0 32 32"
            className={`w-7 h-7 sm:w-8 sm:h-8 text-[#181512] transition-transform ${ROTATION_CLASSES[arrow.direction]}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Bold shaft */}
            <path d="M16 26V6" />
            {/* Wide, easily readable arrowhead */}
            <path d="M7.5 14.5L16 6L24.5 14.5" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
