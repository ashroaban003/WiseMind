import { Difficulty } from '../../types';

import radioImg from '../../assets/objects/radio.webp';
import rotaryPhoneImg from '../../assets/objects/rotary_phone.webp';
import chairImg from '../../assets/objects/chair.webp';
import cassetteImg from '../../assets/objects/cassette.webp';
import clockImg from '../../assets/objects/clock.webp';
import teacupImg from '../../assets/objects/teacup.webp';
import bicycleImg from '../../assets/objects/bicycle.webp';
import lampImg from '../../assets/objects/lamp.webp';
import typewriterImg from '../../assets/objects/typewriter.webp';

export interface NostalgicObject {
  id: string;
  name: string;
  image: string;
  /** Conflict group identifier: objects in the same group are never picked together in the same round */
  conflictGroup?: string;
  altText: string;
}

export const NOSTALGIC_OBJECTS: NostalgicObject[] = [
  {
    id: 'radio',
    name: 'Radio',
    image: radioImg,
    conflictGroup: 'audio_electronics',
    altText: 'Vintage tabletop wooden radio with dial and speaker grille',
  },
  {
    id: 'rotary_phone',
    name: 'Rotary Phone',
    image: rotaryPhoneImg,
    conflictGroup: 'phone_typewriter',
    altText: 'Classic green rotary telephone with handset and circular dial',
  },
  {
    id: 'chair',
    name: 'Rocking Chair',
    image: chairImg,
    altText: 'Classic wooden rocking armchair with spindles',
  },
  {
    id: 'cassette',
    name: 'Cassette Tape',
    image: cassetteImg,
    conflictGroup: 'audio_electronics', // Avoid radio + cassette together
    altText: 'Retro audio cassette tape with spool reels',
  },
  {
    id: 'clock',
    name: 'Alarm Clock',
    image: clockImg,
    altText: 'Vintage twin-bell alarm clock with brass bells',
  },
  {
    id: 'teacup',
    name: 'Teacup',
    image: teacupImg,
    altText: 'Porcelain teacup and saucer with gentle steam',
  },
  {
    id: 'bicycle',
    name: 'Bicycle',
    image: bicycleImg,
    altText: 'Classic cruiser bicycle with basket and spoke wheels',
  },
  {
    id: 'lamp',
    name: 'Desk Lamp',
    image: lampImg,
    altText: 'Vintage banker lamp with emerald green glass shade',
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    image: typewriterImg,
    conflictGroup: 'phone_typewriter',
    altText: 'Vintage mechanical typewriter with paper and round keys',
  },
];

export interface ImpulseDifficultyConfig {
  objectsPerSide: number;
  label: string;
  sublabel: string;
  description: string;
  basePointsPerPrompt: number;
  fastBonusPoints: number;
  fastBonusThresholdMs: number;
  promptDisplayMs: number;
  gracePeriodMs: number;
}

export const impulseDifficultyConfig: Record<Difficulty, ImpulseDifficultyConfig> = {
  easy: {
    objectsPerSide: 1,
    label: 'Easy',
    sublabel: '1 object per side',
    description: '1 item on Left, 1 item on Right (2 items total)',
    basePointsPerPrompt: 20,
    fastBonusPoints: 5,
    fastBonusThresholdMs: 600,
    promptDisplayMs: 1000,
    gracePeriodMs: 400,
  },
  medium: {
    objectsPerSide: 2,
    label: 'Medium',
    sublabel: '2 objects per side',
    description: '2 items on Left, 2 items on Right (4 items total)',
    basePointsPerPrompt: 25,
    fastBonusPoints: 5,
    fastBonusThresholdMs: 600,
    promptDisplayMs: 1000,
    gracePeriodMs: 350,
  },
  hard: {
    objectsPerSide: 3,
    label: 'Hard',
    sublabel: '3 objects per side',
    description: '3 items on Left, 3 items on Right (6 items total)',
    basePointsPerPrompt: 30,
    fastBonusPoints: 5,
    fastBonusThresholdMs: 600,
    promptDisplayMs: 1000,
    gracePeriodMs: 300,
  },
};

export const PROMPTS_PER_ROUND = 12;
