import { Difficulty, DifficultyConfig } from '../../types';

export const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  easy: {
    size: 3,
    minHighlights: 2,
    maxHighlights: 3,
    previewTime: 3000,
    label: 'Easy (3 × 3)',
    description: '3×3 grid • 2–3 tiles • 3s preview',
  },
  medium: {
    size: 4,
    minHighlights: 4,
    maxHighlights: 6,
    previewTime: 4000,
    label: 'Medium (4 × 4)',
    description: '4×4 grid • 4–6 tiles • 4s preview',
  },
  hard: {
    size: 5,
    minHighlights: 6,
    maxHighlights: 9,
    previewTime: 4000,
    label: 'Hard (5 × 5)',
    description: '5×5 grid • 6–9 tiles • 4s preview',
  },
};
