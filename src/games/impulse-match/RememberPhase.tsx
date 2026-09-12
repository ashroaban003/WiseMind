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
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Instructions Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EFE3CE] text-[#634327] font-semibold text-sm sm:text-base border border-[#DECDB3]">
          <Sparkles className="w-4 h-4 text-[#D9822B]" />
          <span>Remember Phase</span>
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E1A0C]">
          Remember which side each object belongs to
        </h2>
        <p className="text-base sm:text-lg text-[#61452D] max-w-xl mx-auto">
          Take your time to memorize the sides. When you press <strong>I&apos;m Ready</strong>, the mapping will hide and objects will appear one by one.
        </p>
      </div>

      {/* Side-by-Side Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Side Container */}
        <div className="flex flex-col rounded-3xl bg-[#F4F8FA] border-2 border-[#94B8C7] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#C8DFE8]">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#2A657D] text-[#FFFDF9] shadow-sm">
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#194354] tracking-wide">
                LEFT SIDE
              </span>
            </div>
            <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full bg-[#E0EFF5] text-[#22576C] border border-[#BBD7E4]">
              {leftObjects.length} {leftObjects.length === 1 ? 'Object' : 'Objects'}
            </span>
          </div>

          <div className={`grid ${leftObjects.length === 1 ? 'grid-cols-1' : leftObjects.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 sm:gap-4 flex-1 items-stretch`}>
            {leftObjects.map((obj) => (
              <div
                key={obj.id}
                className="flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF9] border border-[#B9D8E6] shadow-[0_2px_8px_rgba(20,60,80,0.06)] hover:border-[#2A657D] transition-colors"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center p-2">
                  <img
                    src={obj.image}
                    alt={obj.altText}
                    referrerPolicy="no-referrer"
                    width={144}
                    height={144}
                    loading="eager"
                    className="max-w-full max-h-full object-contain drop-shadow-sm select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-2 text-base sm:text-lg font-bold text-[#194354] text-center">
                  {obj.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Container */}
        <div className="flex flex-col rounded-3xl bg-[#FDF8F3] border-2 border-[#DFBA96] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EED7C1]">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#6D3814] tracking-wide">
                RIGHT SIDE
              </span>
              <span className="p-2 rounded-xl bg-[#9E4D1A] text-[#FFFDF9] shadow-sm">
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </span>
            </div>
            <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full bg-[#FCE8D8] text-[#8C3F14] border border-[#F3CDAE]">
              {rightObjects.length} {rightObjects.length === 1 ? 'Object' : 'Objects'}
            </span>
          </div>

          <div className={`grid ${rightObjects.length === 1 ? 'grid-cols-1' : rightObjects.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 sm:gap-4 flex-1 items-stretch`}>
            {rightObjects.map((obj) => (
              <div
                key={obj.id}
                className="flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF9] border border-[#E9CDB4] shadow-[0_2px_8px_rgba(100,50,20,0.06)] hover:border-[#9E4D1A] transition-colors"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center p-2">
                  <img
                    src={obj.image}
                    alt={obj.altText}
                    referrerPolicy="no-referrer"
                    width={144}
                    height={144}
                    loading="eager"
                    className="max-w-full max-h-full object-contain drop-shadow-sm select-none"
                    draggable={false}
                  />
                </div>
                <span className="mt-2 text-base sm:text-lg font-bold text-[#6D3814] text-center">
                  {obj.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ready Action Section */}
      <div className="flex flex-col items-center justify-center gap-2 pt-2">
        <Button
          variant="wood"
          size="xl"
          onClick={onReady}
          disabled={!isAssetsLoaded}
          icon={
            !isAssetsLoaded ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#FDF8F0]" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-[#FDF8F0]" />
            )
          }
          className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 text-xl font-bold shadow-md cursor-pointer"
        >
          {isAssetsLoaded ? "I'm Ready" : 'Preparing Items...'}
        </Button>
        <span className="text-sm text-[#7A5B3E]">
          {isAssetsLoaded
            ? 'Press whenever you feel comfortable to start the 12 items'
            : 'Loading high-contrast graphics...'}
        </span>
      </div>
    </div>
  );
};
