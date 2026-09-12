import React from 'react';
import { Sparkles, Trophy, ArrowRight, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Difficulty } from '../../types';
import { getNextDifficulty } from '../../games/grid-memory/logic';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: Difficulty;
  consecutiveWins: number;
  onAcceptLevelUp: () => void;
  onStayAtCurrent: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
  consecutiveWins,
  onAcceptLevelUp,
  onStayAtCurrent,
}) => {
  const nextDifficulty = getNextDifficulty(currentDifficulty);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={nextDifficulty ? "You're Doing Wonderfully!" : 'Master of the Grid!'}
      maxWidth="lg"
    >
      <div className="space-y-6 text-center sm:text-left">
        {/* Celebration Icon Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#F6EEDF] border border-[#DFCBAA]">
          <div className="w-16 h-16 rounded-2xl wood-texture flex items-center justify-center text-[#FFF8EB] shadow-md shrink-0">
            {nextDifficulty ? (
              <Sparkles className="w-9 h-9 text-[#FFEAA7]" />
            ) : (
              <Trophy className="w-9 h-9 text-[#FFEAA7]" />
            )}
          </div>
          <div>
            <h3 className="font-serif-title text-2xl font-bold text-[#321F10]">
              {consecutiveWins} Perfect Games in a Row
            </h3>
            <p className="text-lg text-[#61452D] mt-1">
              {nextDifficulty
                ? `You've mastered ${currentDifficulty.toUpperCase()} level with flying colors.`
                : `You've conquered 6 consecutive games on the highest level!`}
            </p>
          </div>
        </div>

        {/* Friendly Prompt */}
        <div className="space-y-2 text-lg sm:text-xl text-[#452D1A] leading-relaxed">
          {nextDifficulty ? (
            <p>
              Would you like to try <strong>{nextDifficulty.toUpperCase()}</strong> difficulty for your next puzzle? There's zero pressure—you can always stay right here if you prefer this rhythm.
            </p>
          ) : (
            <p>
              Your memory and focus are truly in top form today! Feel free to keep enjoying more puzzles at your own leisure.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#E5D5BC]">
          <Button
            variant="secondary"
            size="lg"
            onClick={onStayAtCurrent}
          >
            {nextDifficulty ? 'Keep Playing Here' : 'Keep Playing'}
          </Button>

          {nextDifficulty && (
            <Button
              variant="wood"
              size="lg"
              onClick={onAcceptLevelUp}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Yes, Try {nextDifficulty.toUpperCase()}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
