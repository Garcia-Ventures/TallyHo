export type ScoringMode = 'RACE_HIGH' | 'RACE_LOW' | 'FIXED_ROUNDS';

export interface GamePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  scoringMode: ScoringMode;
  defaultTargetScore?: number;
  defaultTargetRounds?: number;
  badgeText: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  initials: string;
}

export interface RoundScore {
  playerId: string;
  points: number;
  bonusPoints?: number;
  penaltyPoints?: number;
  note?: string;
}

export interface Round {
  roundNumber: number;
  timestamp: string;
  scores: Record<string, RoundScore>; // Keyed by playerId
}

export interface GameSession {
  id: string;
  name: string;
  presetId?: string;
  scoringMode: ScoringMode;
  targetScore?: number;
  targetRounds?: number;
  players: Player[];
  rounds: Round[];
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  winnerId?: string;
}

export interface GameHighlight {
  title: string;
  playerName: string;
  playerColor: string;
  description: string;
  badge: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  paperGridTexture: boolean;
}

export const PLAYER_COLORS = [
  { name: 'Mustard', hex: '#E5A93C', bg: 'bg-[#E5A93C]', text: 'text-[#E5A93C]' },
  { name: 'Sage', hex: '#6A9C78', bg: 'bg-[#6A9C78]', text: 'text-[#6A9C78]' },
  { name: 'Terracotta', hex: '#D96B43', bg: 'bg-[#D96B43]', text: 'text-[#D96B43]' },
  { name: 'Navy', hex: '#3B5998', bg: 'bg-[#3B5998]', text: 'text-[#3B5998]' },
  { name: 'Purple', hex: '#8B6B9C', bg: 'bg-[#8B6B9C]', text: 'text-[#8B6B9C]' },
  { name: 'Rose', hex: '#C97A8B', bg: 'bg-[#C97A8B]', text: 'text-[#C97A8B]' },
];

export const GAME_PRESETS: GamePreset[] = [
  {
    id: 'rummy',
    name: 'Rummy 500',
    description: 'First to reach 500 points across melds & tricks.',
    icon: '🃏',
    scoringMode: 'RACE_HIGH',
    defaultTargetScore: 500,
    badgeText: 'First to 500',
  },
  {
    id: 'uno',
    name: 'Uno',
    description: 'Keep totals low! Game ends when someone reaches 500.',
    icon: '🎴',
    scoringMode: 'RACE_LOW',
    defaultTargetScore: 500,
    badgeText: 'Lowest Score Wins',
  },
  {
    id: 'pigs',
    name: 'Pass the Pigs',
    description: 'Push your luck! Race to 100 pig-position points.',
    icon: '🐖',
    scoringMode: 'RACE_HIGH',
    defaultTargetScore: 100,
    badgeText: 'Race to 100',
  },
  {
    id: 'qwirkle',
    name: 'Qwirkle',
    description: 'Match colors and shapes for high score runs.',
    icon: '🟧',
    scoringMode: 'RACE_HIGH',
    defaultTargetScore: 300,
    badgeText: 'Target 300',
  },
  {
    id: 'hearts',
    name: 'Hearts',
    description: 'Avoid penalty hearts & Queen of Spades. Lowest score wins.',
    icon: '♥️',
    scoringMode: 'RACE_LOW',
    defaultTargetScore: 100,
    badgeText: 'Lowest Score Wins',
  },
  {
    id: 'custom',
    name: 'Custom Game',
    description: 'Configure your own target score, rounds, or win conditions.',
    icon: '✏️',
    scoringMode: 'RACE_HIGH',
    defaultTargetScore: 100,
    badgeText: 'Flexible Rules',
  },
];
