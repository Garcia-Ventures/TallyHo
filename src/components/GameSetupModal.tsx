import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@gv-tech/ui-web';
import React, { useEffect, useState } from 'react';
import { soundEffects } from '../services/audio';
import { storage } from '../services/storage';
import { GAME_PRESETS, GamePreset, Player, PLAYER_COLORS, RoundScoringType, ScoringMode } from '../types/game';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: GamePreset | null;
  onStartGame: (setup: {
    name: string;
    presetId?: string;
    scoringMode: ScoringMode;
    roundScoringType: RoundScoringType;
    targetScore?: number;
    targetRounds?: number;
    players: Player[];
  }) => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({ isOpen, onClose, preset, onStartGame }) => {
  const [selectedPreset, setSelectedPreset] = useState<GamePreset | null>(preset);
  const [gameName, setGameName] = useState('');
  const [scoringMode, setScoringMode] = useState<ScoringMode>('RACE_HIGH');
  const [roundScoringType, setRoundScoringType] = useState<RoundScoringType>('EVERY_PLAYER');
  const [targetScore, setTargetScore] = useState<number>(100);
  const [targetRounds, setTargetRounds] = useState<number>(5);

  // Player builder
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0].hex);
  const [savedLibrary, setSavedLibrary] = useState<Player[]>([]);

  useEffect(() => {
    if (preset) {
      setSelectedPreset(preset);
      setGameName(preset.name === 'Custom Game' ? 'My Game Night' : preset.name);
      setScoringMode(preset.scoringMode);
      setRoundScoringType(preset.roundScoringType || 'EVERY_PLAYER');
      setTargetScore(preset.defaultTargetScore || 100);
      setTargetRounds(preset.defaultTargetRounds || 5);
    }
  }, [preset]);

  useEffect(() => {
    if (isOpen) {
      const library = storage.getPlayerLibrary();
      setSavedLibrary(library);
      if (players.length === 0 && library.length >= 2) {
        setPlayers(library.slice(0, 2));
      }
    }
  }, [isOpen]);

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!newPlayerName.trim()) {
      return;
    }

    soundEffects.playPenClick();
    const initials = newPlayerName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newPlayerName.trim(),
      color: selectedColor,
      initials,
    };

    setPlayers([...players, newPlayer]);
    storage.savePlayerToLibrary(newPlayer);
    setSavedLibrary(storage.getPlayerLibrary());

    setNewPlayerName('');
    const nextColorIdx = (PLAYER_COLORS.findIndex((c) => c.hex === selectedColor) + 1) % PLAYER_COLORS.length;
    setSelectedColor(PLAYER_COLORS[nextColorIdx].hex);
  };

  const handleToggleSavedPlayer = (savedPlayer: Player) => {
    soundEffects.playPaperRustle();
    const exists = players.some((p) => p.name.toLowerCase() === savedPlayer.name.toLowerCase());
    if (exists) {
      setPlayers(players.filter((p) => p.name.toLowerCase() !== savedPlayer.name.toLowerCase()));
    } else {
      setPlayers([...players, savedPlayer]);
    }
  };

  const handleDeleteSavedPlayer = (savedPlayerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPaperRustle();
    storage.deletePlayerFromLibrary(savedPlayerId);
    setSavedLibrary(storage.getPlayerLibrary());
    setPlayers(players.filter((p) => p.id !== savedPlayerId));
  };

  const handleRemovePlayer = (id: string) => {
    soundEffects.playPaperRustle();
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleMovePlayerOrder = (index: number, direction: 'UP' | 'DOWN') => {
    soundEffects.playPenClick();
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= players.length) {
      return;
    }
    const updated = [...players];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPlayers(updated);
  };

  const handleStart = () => {
    if (players.length < 1) {
      return;
    }
    soundEffects.playPenClick();
    onStartGame({
      name: gameName || 'Game Night',
      presetId: selectedPreset?.id,
      scoringMode,
      roundScoringType,
      targetScore: scoringMode !== 'FIXED_ROUNDS' ? targetScore : undefined,
      targetRounds: scoringMode === 'FIXED_ROUNDS' ? targetRounds : undefined,
      players,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border-[#E5E0D8] bg-[#FDFBF7] p-6 text-[#2C302E] shadow-2xl"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{selectedPreset?.icon || '✏️'}</span>
              <div>
                <DialogTitle className="text-xl font-bold text-[#2C302E]">
                  Setup Match: {selectedPreset?.name || 'Custom Game'}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#5A605C]">
                  Configure seating turn order and target rules in under 10 seconds.
                </DialogDescription>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg border border-[#E5E0D8] bg-[#F7F4EE] px-2.5 py-1 text-xs font-bold text-[#5A605C] hover:text-[#2C302E]"
            >
              ✕ Close
            </button>
          </div>
        </DialogHeader>

        <div className="my-4 space-y-6">
          {!preset && (
            <div>
              <label className="mb-2 block text-xs font-semibold tracking-wider text-[#5A605C] uppercase">
                Select Game Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GAME_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(p);
                      setGameName(p.name);
                      setScoringMode(p.scoringMode);
                      setRoundScoringType(p.roundScoringType);
                      if (p.defaultTargetScore) {
                        setTargetScore(p.defaultTargetScore);
                      }
                    }}
                    className={`rounded-lg border p-2 text-left text-xs transition-all ${
                      selectedPreset?.id === p.id
                        ? 'border-[#2C302E] bg-[#F7F4EE] shadow-xs'
                        : 'border-[#E5E0D8] hover:border-[#D5CEC2]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Match Title & Rules */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#5A605C] uppercase">
                Match Title
              </label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="e.g. Friday Night Showdown"
                className="w-full rounded-lg border border-[#E5E0D8] bg-[#F7F4EE] px-3 py-2 text-sm focus:border-[#2C302E] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#5A605C] uppercase">
                Win Threshold Rule
              </label>
              <select
                value={scoringMode}
                onChange={(e) => setScoringMode(e.target.value as ScoringMode)}
                className="w-full rounded-lg border border-[#E5E0D8] bg-[#F7F4EE] px-3 py-2 text-sm focus:border-[#2C302E] focus:outline-none"
              >
                <option value="RACE_HIGH">Race to High Score (Most Points Wins)</option>
                <option value="RACE_LOW">Race to Low Limit (Lowest Points Wins)</option>
                <option value="FIXED_ROUNDS">Fixed Rounds Limit</option>
              </select>
            </div>
          </div>

          {/* Round Scoring Type Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#5A605C] uppercase">
              Round Scoring Structure
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoundScoringType('EVERY_PLAYER')}
                className={`rounded-lg border p-3 text-left transition-all ${
                  roundScoringType === 'EVERY_PLAYER'
                    ? 'border-[#2C302E] bg-[#F7F4EE] ring-1 ring-[#2C302E]'
                    : 'border-[#E5E0D8] bg-white hover:border-[#D5CEC2]'
                }`}
              >
                <span className="block text-xs font-bold text-[#2C302E]">👥 Every Player Scores Each Round</span>
                <span className="text-[11px] text-[#5A605C]">
                  All players enter a score before round advances (e.g. Qwirkle, Rummy).
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRoundScoringType('SINGLE_WINNER')}
                className={`rounded-lg border p-3 text-left transition-all ${
                  roundScoringType === 'SINGLE_WINNER'
                    ? 'border-[#2C302E] bg-[#F7F4EE] ring-1 ring-[#2C302E]'
                    : 'border-[#E5E0D8] bg-white hover:border-[#D5CEC2]'
                }`}
              >
                <span className="block text-xs font-bold text-[#2C302E]">🏆 One Winner Scores Per Round</span>
                <span className="text-[11px] text-[#5A605C]">
                  Only one player scores per round, advancing round immediately (e.g. Uno).
                </span>
              </button>
            </div>
          </div>

          {/* Target Value input */}
          <div className="flex items-center justify-between rounded-lg border border-[#E5E0D8] bg-[#F7F4EE] p-3">
            <span className="text-sm font-semibold text-[#2C302E]">
              {scoringMode === 'FIXED_ROUNDS' ? 'Target Rounds Limit:' : 'Target Win Threshold:'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={scoringMode === 'FIXED_ROUNDS' ? targetRounds : targetScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (scoringMode === 'FIXED_ROUNDS') {
                    setTargetRounds(val);
                  } else {
                    setTargetScore(val);
                  }
                }}
                className="w-24 rounded border border-[#E5E0D8] bg-white px-3 py-1 text-right font-mono text-sm font-bold"
              />
              <span className="text-xs text-[#5A605C]">{scoringMode === 'FIXED_ROUNDS' ? 'Rounds' : 'Points'}</span>
            </div>
          </div>

          {/* Player Roster Builder */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wider text-[#5A605C] uppercase">
                Players & Seating Turn Order ({players.length})
              </label>
              <span className="text-xs text-[#5A605C]">Use ↑↓ to reorder turn sequence</span>
            </div>

            {savedLibrary.length > 0 && (
              <div className="mb-3">
                <span className="mb-1.5 block text-[11px] font-medium text-[#5A605C]">Quick Select Saved Players:</span>
                <div className="flex flex-wrap gap-1.5">
                  {savedLibrary.map((sp) => {
                    const isSelected = players.some((p) => p.name.toLowerCase() === sp.name.toLowerCase());
                    return (
                      <div
                        key={sp.id}
                        className={`group inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-[#2C302E] bg-[#2C302E] text-white'
                            : 'border-[#E5E0D8] bg-[#F7F4EE] text-[#2C302E] hover:border-[#2C302E]'
                        }`}
                        onClick={() => handleToggleSavedPlayer(sp)}
                      >
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sp.color }} />
                        <span>{sp.name}</span>
                        <button
                          type="button"
                          title="Delete player from saved library"
                          onClick={(e) => handleDeleteSavedPlayer(sp.id, e)}
                          className="ml-1 text-xs opacity-60 hover:text-red-400 hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleAddPlayer} className="mb-3 flex gap-2">
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter player name..."
                  className="flex-1 rounded-lg border border-[#E5E0D8] bg-[#F7F4EE] px-3 py-2 text-sm focus:border-[#2C302E] focus:outline-none"
                />

                <div className="flex items-center gap-1 rounded-lg border border-[#E5E0D8] bg-[#F7F4EE] px-2">
                  {PLAYER_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setSelectedColor(color.hex)}
                      className={`h-5 w-5 rounded-full transition-transform ${
                        selectedColor === color.hex ? 'scale-125 ring-2 ring-[#2C302E]' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" variant="secondary" size="sm" className="bg-[#2C302E] text-white hover:bg-black">
                + Add
              </Button>
            </form>

            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {players.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#E5E0D8] py-4 text-center text-xs text-[#5A605C]">
                  No players added yet. Select from saved library above or add new players.
                </div>
              ) : (
                players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-[#E5E0D8] bg-[#F7F4EE] p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-xs font-bold text-[#5A605C]">#{idx + 1}</span>
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initials}
                      </span>
                      <span className="text-sm font-semibold text-[#2C302E]">{p.name}</span>
                      {idx === 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          First Turn
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMovePlayerOrder(idx, 'UP')}
                        disabled={idx === 0}
                        className="rounded border bg-white px-1.5 py-0.5 text-xs hover:bg-gray-100 disabled:opacity-30"
                        title="Move Turn Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePlayerOrder(idx, 'DOWN')}
                        disabled={idx === players.length - 1}
                        className="rounded border bg-white px-1.5 py-0.5 text-xs hover:bg-gray-100 disabled:opacity-30"
                        title="Move Turn Down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(p.id)}
                        className="ml-1 p-1 text-xs font-bold text-[#5A605C] hover:text-[#C84B31]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-[#E5E0D8] pt-3">
          <Button variant="ghost" onClick={onClose} className="text-[#5A605C]">
            Cancel
          </Button>

          <Button
            onClick={handleStart}
            disabled={players.length < 1}
            className="bg-[#C84B31] px-6 font-bold text-white hover:bg-[#b03f28]"
          >
            Start Match ({players.length} Players) →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
