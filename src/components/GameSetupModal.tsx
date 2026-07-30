import { Button, Input } from '@gv-tech/ui-web';
import { Check, Flag, Plus, Sparkles, Trash2, Trophy, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { audio } from '../services/audio';
import { storage } from '../services/storage';
import { GamePreset, GameSession, Player, PLAYER_COLORS, ScoringMode } from '../types/game';

interface GameSetupModalProps {
  initialPreset?: GamePreset | null;
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (game: GameSession) => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({ initialPreset, isOpen, onClose, onStartGame }) => {
  if (!isOpen) {
    return null;
  }

  const savedLibrary = storage.getPlayerLibrary();

  const [gameName, setGameName] = useState<string>(initialPreset ? initialPreset.name : 'Game Night Match');
  const [scoringMode, setScoringMode] = useState<ScoringMode>(initialPreset ? initialPreset.scoringMode : 'RACE_HIGH');
  const [targetScore, setTargetScore] = useState<number>(initialPreset?.defaultTargetScore || 500);
  const [targetRounds, setTargetRounds] = useState<number>(10);

  // Selected players
  const [players, setPlayers] = useState<Player[]>([
    savedLibrary[0] || { id: 'p1', name: 'Alex', color: '#E5A93C', initials: 'AL' },
    savedLibrary[1] || { id: 'p2', name: 'Jordan', color: '#6A9C78', initials: 'JO' },
  ]);

  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [selectedColorHex, setSelectedColorHex] = useState<string>(PLAYER_COLORS[2].hex);

  // Quick add saved player
  const handleToggleSavedPlayer = (savedP: Player) => {
    audio.playKeypadTap();
    if (players.some((p) => p.name.toLowerCase() === savedP.name.toLowerCase())) {
      setPlayers(players.filter((p) => p.name.toLowerCase() !== savedP.name.toLowerCase()));
    } else {
      setPlayers([...players, savedP]);
    }
  };

  // Add custom player name
  const handleAddCustomPlayer = () => {
    if (!newPlayerName.trim()) {
      return;
    }
    audio.playKeypadTap();

    const name = newPlayerName.trim();
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newP: Player = {
      id: 'player_' + Date.now() + Math.random().toString(36).substring(2, 5),
      name,
      color: selectedColorHex,
      initials: initials || name.substring(0, 2).toUpperCase(),
    };

    setPlayers([...players, newP]);
    storage.savePlayerToLibrary(newP);
    setNewPlayerName('');
  };

  // Remove player
  const handleRemovePlayer = (id: string) => {
    audio.playKeypadTap();
    if (players.length <= 1) {
      return;
    }
    setPlayers(players.filter((p) => p.id !== id));
  };

  // Submit and start
  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.length === 0) {
      return;
    }

    audio.playRoundSubmit();

    const newGame: GameSession = {
      id: 'game_' + Date.now(),
      name: gameName.trim() || 'Game Night Match',
      presetId: initialPreset?.id,
      scoringMode,
      targetScore: scoringMode !== 'FIXED_ROUNDS' ? Number(targetScore) || 500 : undefined,
      targetRounds: scoringMode === 'FIXED_ROUNDS' ? Number(targetRounds) || 10 : undefined,
      players,
      rounds: [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onStartGame(newGame);
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#2C302E]/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E0D8] bg-[#F7F4EE] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{initialPreset?.icon || '✏️'}</span>
            <div>
              <h3 className="text-xl font-extrabold text-[#2C302E]">
                {initialPreset ? `Setup ${initialPreset.name}` : 'New Game Setup'}
              </h3>
              <p className="text-xs font-semibold text-[#5A605C]">Configure players & target score rule</p>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playKeypadTap();
              onClose();
            }}
            className="rounded-lg p-1.5 text-[#5A605C] transition-colors hover:bg-[#EFEAE1] hover:text-[#2C302E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleCreateGame} className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Game Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold tracking-wide text-[#2C302E] uppercase">Match Title</label>
            <Input
              value={gameName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGameName(e.target.value)}
              placeholder="e.g. Friday Rummy Battle"
              className="w-full rounded-xl border-[#E5E0D8] bg-[#F7F4EE] px-4 py-2.5 text-sm font-bold focus:border-[#2C302E]"
            />
          </div>

          {/* Scoring Mode & Winning Rules */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold tracking-wide text-[#2C302E] uppercase">Winning Condition</label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  audio.playKeypadTap();
                  setScoringMode('RACE_HIGH');
                }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  scoringMode === 'RACE_HIGH'
                    ? 'border-[#2C302E] bg-[#2C302E] text-white shadow-sm'
                    : 'border-[#E5E0D8] bg-[#F7F4EE] text-[#2C302E] hover:border-[#2C302E]/50'
                }`}
              >
                <Trophy className="mb-1 h-4 w-4 text-[#E5A93C]" />
                <div className="text-xs font-extrabold">Race to Target</div>
                <div className="text-[10px] font-medium opacity-80">Highest score wins</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playKeypadTap();
                  setScoringMode('RACE_LOW');
                }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  scoringMode === 'RACE_LOW'
                    ? 'border-[#2C302E] bg-[#2C302E] text-white shadow-sm'
                    : 'border-[#E5E0D8] bg-[#F7F4EE] text-[#2C302E] hover:border-[#2C302E]/50'
                }`}
              >
                <Flag className="mb-1 h-4 w-4 text-[#6A9C78]" />
                <div className="text-xs font-extrabold">Low Score Wins</div>
                <div className="text-[10px] font-medium opacity-80">Lowest score wins (Uno)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playKeypadTap();
                  setScoringMode('FIXED_ROUNDS');
                }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  scoringMode === 'FIXED_ROUNDS'
                    ? 'border-[#2C302E] bg-[#2C302E] text-white shadow-sm'
                    : 'border-[#E5E0D8] bg-[#F7F4EE] text-[#2C302E] hover:border-[#2C302E]/50'
                }`}
              >
                <Sparkles className="mb-1 h-4 w-4 text-[#D96B43]" />
                <div className="text-xs font-extrabold">Fixed Rounds</div>
                <div className="text-[10px] font-medium opacity-80">Ends after N rounds</div>
              </button>
            </div>

            {/* Target Value Input */}
            {scoringMode !== 'FIXED_ROUNDS' ? (
              <div className="flex items-center gap-3 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                <span className="text-xs font-extrabold text-[#5A605C]">Target Threshold:</span>
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetScore(Number(e.target.value))}
                  className="score-num w-28 rounded-lg border border-[#E5E0D8] bg-white px-3 py-1 text-sm font-extrabold text-[#2C302E] focus:border-[#2C302E] focus:outline-none"
                />
                <span className="text-xs font-semibold text-[#5A605C]">points</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                <span className="text-xs font-extrabold text-[#5A605C]">Total Rounds:</span>
                <input
                  type="number"
                  value={targetRounds}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetRounds(Number(e.target.value))}
                  className="score-num w-24 rounded-lg border border-[#E5E0D8] bg-white px-3 py-1 text-sm font-extrabold text-[#2C302E] focus:border-[#2C302E] focus:outline-none"
                />
                <span className="text-xs font-semibold text-[#5A605C]">rounds</span>
              </div>
            )}
          </div>

          {/* Players Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#2C302E] uppercase">
                <Users className="h-4 w-4 text-[#5A605C]" />
                Player Roster ({players.length})
              </label>
              <span className="text-[11px] font-semibold text-[#5A605C]">Min 1 player</span>
            </div>

            {/* Selected Players Chips */}
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {players.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold text-white shadow-sm"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.initials}
                    </div>
                    <span className="text-sm font-extrabold text-[#2C302E]">{p.name}</span>
                    <span className="rounded-md bg-[#EFEAE1] px-2 py-0.5 text-[10px] font-bold text-[#5A605C]">
                      Seat {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePlayer(p.id)}
                    disabled={players.length <= 1}
                    className="rounded-md p-1 text-[#5A605C] transition-colors hover:bg-[#EFEAE1] hover:text-[#C84B31] disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add from Saved Family/Friends Library */}
            {savedLibrary.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold text-[#5A605C] uppercase">Quick Select Saved Players:</div>
                <div className="flex flex-wrap gap-1.5">
                  {savedLibrary.map((sp) => {
                    const isSelected = players.some((p) => p.name.toLowerCase() === sp.name.toLowerCase());
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleToggleSavedPlayer(sp)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-[#2C302E] bg-[#2C302E] text-white'
                            : 'border-[#E5E0D8] bg-[#F7F4EE] text-[#5A605C] hover:border-[#2C302E]'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[#E5A93C]" />}
                        <span>{sp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom New Player Form */}
            <div className="flex items-center gap-2 pt-2">
              <Input
                value={newPlayerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlayerName(e.target.value)}
                placeholder="Add new player name..."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomPlayer();
                  }
                }}
                className="flex-1 rounded-xl border-[#E5E0D8] bg-[#F7F4EE] px-3 py-2 text-xs font-bold focus:border-[#2C302E]"
              />

              {/* Color Swatch Picker */}
              <div className="flex items-center gap-1 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-1">
                {PLAYER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColorHex(c.hex)}
                    className={`h-5 w-5 rounded-full border-2 transition-transform ${
                      selectedColorHex === c.hex
                        ? 'scale-110 border-[#2C302E]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddCustomPlayer}
                className="rounded-xl bg-[#2C302E] p-2 text-white transition-colors hover:bg-[#1E2120]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E5E0D8] pt-4">
            <button
              type="button"
              onClick={() => {
                audio.playKeypadTap();
                onClose();
              }}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#5A605C] transition-colors hover:bg-[#EFEAE1]"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#2C302E] px-6 py-2.5 text-sm font-black text-[#FDFBF7] shadow-md transition-all hover:bg-[#1E2120]"
            >
              <Trophy className="h-4 w-4 text-[#E5A93C]" />
              Start Match Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
