import { GameDefinition } from '../types';

export const gameRegistry: GameDefinition[] = [
  {
    id: 'grid-memory',
    title: 'Grid Memory',
    description: 'Watch the wooden blocks flip to ivory, remember their positions, and tap the ones you recall.',
    category: 'Memory',
    available: true,
    path: '/games/grid-memory',
    iconName: 'Grid3X3',
    estimatedMinutes: 3,
    highlightText: 'Spatial Memory',
  },
  {
    id: 'sequence-memory',
    title: 'Sequence Memory',
    description: 'Watch the wooden blocks flip one-by-one in sequence, then tap them in the exact same order.',
    category: 'Attention',
    available: true,
    path: '/games/sequence-memory',
    iconName: 'ListOrdered',
    estimatedMinutes: 3,
    highlightText: 'New Game',
  },
  {
    id: 'arrow-finder',
    title: 'Arrow Finder',
    description: 'Scan a scattered field of arrows pointing in four directions to find which direction appears the most.',
    category: 'Visual',
    available: true,
    path: '/games/arrow-finder',
    iconName: 'Compass',
    estimatedMinutes: 3,
    highlightText: 'Visual Game',
  },
  {
    id: 'memory-locker',
    title: 'Memory Locker',
    description: 'Watch the safe combination appear one number at a time, then re-enter the secret code on the dial keypad.',
    category: 'Memory',
    available: true,
    path: '/games/memory-locker',
    iconName: 'KeyRound',
    estimatedMinutes: 3,
    highlightText: 'New Memory Game',
  },
  {
    id: 'impulse-match',
    title: 'Impulse Match',
    description: 'Memorize which side each nostalgic item belongs to, then quickly sort incoming objects Left or Right.',
    category: 'Attention',
    available: true,
    path: '/games/impulse-match',
    iconName: 'ArrowLeftRight',
    estimatedMinutes: 3,
    highlightText: 'New Impulse Game',
  },
];

export function getGameById(id: string): GameDefinition | undefined {
  return gameRegistry.find((game) => game.id === id);
}

export function getAvailableGames(): GameDefinition[] {
  return gameRegistry.filter((game) => game.available);
}
