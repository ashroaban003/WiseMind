import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Trophy,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ImpulseRoundSummary } from './logic';
import { Button } from '../../components/common/Button';

interface ResultPhaseProps {
  summary: ImpulseRoundSummary;
  sessionScore: number;
  consecutiveWins: number;
  bestAllTimeScore: number;
  onNextRound: () => void;
}

export const ResultPhase: React.FC<ResultPhaseProps> = ({
  summary,
  sessionScore,
  consecutiveWins,
  bestAllTimeScore,
  onNextRound,
}) => {
  const isGreatRound = summary.accuracy >= 75;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-200">
      {/* Round Header Announcement */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EFE3CE] text-[#634327] font-semibold text-sm sm:text-base border border-[#DECDB3]">
          {summary.isPerfect ? (
            <>
              <Sparkles className="w-4 h-4 text-[#D9822B]" />
              <span>Perfect Round! Outstanding Memory</span>
            </>
          ) : isGreatRound ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#2E6B20]" />
              <span>Great Job! Quick Reflexes</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-[#8B5829]" />
              <span>Round Complete</span>
            </>
          )}
        </div>

        <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#2E1A0C]">
          {summary.correctCount} / {summary.totalPrompts} Correct
        </h2>

        <p className="text-lg sm:text-xl font-medium text-[#654A32]">
          Accuracy: <strong className="text-[#2E1A0C]">{summary.accuracy}%</strong>
        </p>
      </div>

      {/* Main Metrics Card */}
      <div className="rounded-3xl bg-[#FFFDF9] border-2 border-[#DCC7AD] p-5 sm:p-7 shadow-[0_6px_20px_rgba(70,40,15,0.06)] space-y-5">
        {/* 3-Column Breakdown: Correct / Wrong / Missed */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Correct */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#F0F8EE] border border-[#BFDFB8]">
            <CheckCircle2 className="w-5 h-5 text-[#2E6B20] mb-1" />
            <span className="text-2xl sm:text-3xl font-bold text-[#1E5F1E]">
              {summary.correctCount}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#4A7240]">
              Correct
            </span>
          </div>

          {/* Wrong */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#FFF3F0] border border-[#F5C7BE]">
            <XCircle className="w-5 h-5 text-[#C62828] mb-1" />
            <span className="text-2xl sm:text-3xl font-bold text-[#C62828]">
              {summary.wrongCount}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#9A4242]">
              Wrong
            </span>
          </div>

          {/* Missed */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#F5F5F7] border border-[#D5D5DB]">
            <Clock className="w-5 h-5 text-[#64748B] mb-1" />
            <span className="text-2xl sm:text-3xl font-bold text-[#475569]">
              {summary.missedCount}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#64748B]">
              Missed
            </span>
          </div>
        </div>

        {/* Points & Session Summary Strip */}
        <div className="pt-4 border-t border-[#EAE0D0] flex items-center justify-between gap-3 text-sm sm:text-base">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-[#7D5E43] font-medium">Points Earned</span>
            <span className="text-xl sm:text-2xl font-bold text-[#2E6B20]">
              +{summary.pointsEarned} pts
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-xs sm:text-sm text-[#7D5E43] font-medium">Session Score</span>
            <span className="text-xl sm:text-2xl font-bold text-[#352110]">
              {sessionScore} pts
            </span>
          </div>
        </div>

        {/* Streak & Best Score pill */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#FAF3E6] border border-[#E8D9C0] text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-[#8B501B]">
            <Flame className="w-4 h-4 text-[#D9531E] fill-current" />
            Active Streak: {consecutiveWins} {consecutiveWins === 1 ? 'round' : 'rounds'}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#5B3E25]">
            <Trophy className="w-4 h-4 text-[#D9822B]" />
            Personal Best: {bestAllTimeScore} pts
          </span>
        </div>
      </div>

      {/* Primary Call to Action */}
      <div className="flex justify-center pt-2">
        <Button
          variant="wood"
          size="xl"
          onClick={onNextRound}
          icon={<RotateCcw className="w-6 h-6" />}
          className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 text-xl font-bold shadow-md cursor-pointer"
        >
          Next Round
        </Button>
      </div>
    </div>
  );
};
