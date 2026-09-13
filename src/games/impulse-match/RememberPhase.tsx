import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { NostalgicObject } from './config';
import { Button } from '../../components/common/Button';

interface RememberPhaseProps {
  leftObjects: NostalgicObject[];
  rightObjects: NostalgicObject[];
  isAssetsLoaded: boolean;
  onReady: () => void;
}

export const RememberPhase: React.FC<RememberPhaseProps> = ({
  leftObjects,
  rightObjects,
  isAssetsLoaded,
  onReady,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-6 animate-in fade-in duration-200">
      {/* Instructions Banner */}
      <div className="text-center space-y-1 sm:space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-[#EFE3CE] text-[#634327] font-semibold text-xs sm:text-base border border-[#DECDB3]">
          <Sparkles className="w-3.5 h-3.5 text-[#D9822B]" />
          <span>Memorize the Sides</span>
        </div>
        <h2 className="font-serif-title text-lg sm:text-2xl lg:text-3xl font-bold text-[#2E1A0C]">
          Remember which side each object belongs to
        </h2>
        <p className="text-xs sm:text-base text-[#61452D] max-w-xl mx-auto">
          Take your time to memorize the sides. When you press <strong>I&apos;m Ready</strong>, objects will appear one by one.
        </p>
      </div>

      {/* Side-by-Side Assignments (Side by side on all screens for instant spatial recall) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-6">
        {/* Left Side Container */}
        <div className="flex flex-col rounded-2xl sm:rounded-3xl bg-[#F4F8FA] border-2 border-[#94B8C7] p-2.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-1.5 sm:pb-3 mb-2 sm:mb-4 border-b border-[#C8DFE8]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-[#2A657D] text-[#FFFDF9] shadow-sm">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
              </span>
              <span className="text-xs sm:text-xl font-bold text-[#194354] tracking-wide">
                LEFT SIDE
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 rounded-full bg-[#E0EFF5] text-[#22576C] border border-[#BBD7E4]">
              {leftObjects.length} {leftObjects.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-3 flex-1 justify-center">
            {leftObjects.map((obj) => (
              <div
                key={obj.id}
                className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-[#B9D8E6] shadow-[0_1px_4px_rgba(20,60,80,0.06)] hover:border-[#2A657D] transition-colors"
              >
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center p-1">
                  <img
                    src={obj.image}
                    alt={obj.altText}
                    referrerPolicy="no-referrer"
                    width={112}
                    height={112}
                    loading="eager"
                    className="max-w-full max-h-full object-contain drop-shadow-sm select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-0.5 sm:mt-1.5 text-xs sm:text-base font-bold text-[#194354] text-center truncate max-w-full px-1">
                  {obj.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Container */}
        <div className="flex flex-col rounded-2xl sm:rounded-3xl bg-[#FDF8F3] border-2 border-[#DFBA96] p-2.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-1.5 sm:pb-3 mb-2 sm:mb-4 border-b border-[#EED7C1]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-xl font-bold text-[#6D3814] tracking-wide">
                RIGHT SIDE
              </span>
              <span className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-[#9E4D1A] text-[#FFFDF9] shadow-sm">
                <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[2.5]" />
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 rounded-full bg-[#FCE8D8] text-[#8C3F14] border border-[#F3CDAE]">
              {rightObjects.length} {rightObjects.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-3 flex-1 justify-center">
            {rightObjects.map((obj) => (
              <div
                key={obj.id}
                className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FFFDF9] border border-[#E9CDB4] shadow-[0_1px_4px_rgba(100,50,20,0.06)] hover:border-[#9E4D1A] transition-colors"
              >
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center p-1">
                  <img
                    src={obj.image}
                    alt={obj.altText}
                    referrerPolicy="no-referrer"
                    width={112}
                    height={112}
                    loading="eager"
                    className="max-w-full max-h-full object-contain drop-shadow-sm select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-0.5 sm:mt-1.5 text-xs sm:text-base font-bold text-[#6D3814] text-center truncate max-w-full px-1">
                  {obj.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ready Action Section */}
      <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 pt-1 sm:pt-2">
        <Button
          variant="wood"
          size="lg"
          onClick={onReady}
          disabled={!isAssetsLoaded}
          icon={
            !isAssetsLoaded ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#FDF8F0]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#FDF8F0]" />
            )
          }
          className="w-full sm:w-auto min-w-[200px] sm:min-w-[240px] px-6 sm:px-8 py-2.5 sm:py-3.5 text-base sm:text-xl font-bold shadow-md cursor-pointer"
        >
          {isAssetsLoaded ? "I'm Ready" : 'Preparing Items...'}
        </Button>
        <span className="text-xs sm:text-sm text-[#7A5B3E]">
          {isAssetsLoaded
            ? 'Press whenever you feel comfortable to start the 12 items'
            : 'Loading high-contrast graphics...'}
        </span>
      </div>
    </div>
  );
};
