import { Button } from '@gv-tech/ui-web';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { audio } from '../services/audio';
import { GameSession, Round } from '../types/game';

interface RoundHistoryModalProps {
  game: GameSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRounds: (updatedRounds: Round[]) => void;
}

export const RoundHistoryModal: React.FC<RoundHistoryModalProps> = ({ game, isOpen, onClose, onUpdateRounds }) => {
  if (!isOpen) {
    return null;
  }

  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [editScoreMap, setEditScoreMap] = useState<Record<string, number>>({});

  const handleStartEdit = (index: number, round: Round) => {
    audio.playKeypadTap();
    setEditingRoundIndex(index);
    const map: Record<string, number> = {};
    game.players.forEach((p) => {
      map[p.id] = round.scores[p.id]?.points || 0;
    });
    setEditScoreMap(map);
  };

  const handleSaveEdit = (index: number) => {
    audio.playRoundSubmit();
    const updated = [...game.rounds];
    const targetRound = { ...updated[index] };

    const newScores = { ...targetRound.scores };
    Object.entries(editScoreMap).forEach(([playerId, pts]) => {
      newScores[playerId] = {
        ...(newScores[playerId] || { playerId }),
        points: Number(pts) || 0,
      };
    });

    targetRound.scores = newScores;
    updated[index] = targetRound;

    onUpdateRounds(updated);
    setEditingRoundIndex(null);
  };

  const handleDeleteRound = (index: number) => {
    audio.playUndo();
    const updated = game.rounds.filter((_, idx) => idx !== index);
    // Renumber remaining rounds
    const renumbered = updated.map((r, i) => ({ ...r, roundNumber: i + 1 }));
    onUpdateRounds(renumbered);
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#2C302E]/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E0D8] bg-[#F7F4EE] px-6 py-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#2C302E]">Round History & Edit Log</h3>
            <p className="text-xs font-semibold text-[#5A605C]">Fix mistaken entries or adjust past round scores</p>
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

        {/* Content Sheet */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {game.rounds.length === 0 ? (
            <div className="py-12 text-center text-sm font-semibold text-[#5A605C]">
              No rounds recorded yet. Log your first round on the main score pad!
            </div>
          ) : (
            game.rounds.map((round, idx) => {
              const isEditing = editingRoundIndex === idx;

              return (
                <div key={round.roundNumber} className="space-y-3 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-4">
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
                    <span className="text-xs font-black text-[#2C302E] uppercase">Round {round.roundNumber}</span>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="flex items-center gap-1 rounded-lg bg-[#6A9C78] px-3 py-1 text-xs font-bold text-white hover:bg-[#588564]"
                        >
                          <Check className="h-3.5 w-3.5" /> Save Edits
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(idx, round)}
                          className="flex items-center gap-1 rounded-lg p-1.5 text-xs font-bold text-[#5A605C] transition-colors hover:bg-[#EFEAE1] hover:text-[#2C302E]"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRound(idx)}
                        className="rounded-lg p-1.5 text-[#5A605C] transition-colors hover:bg-[#C84B31]/10 hover:text-[#C84B31]"
                        title="Delete Round"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Player Scores Row */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {game.players.map((p) => {
                      const score = round.scores[p.id];
                      const pts = score?.points || 0;

                      return (
                        <div key={p.id} className="space-y-1">
                          <div className="truncate text-[11px] font-extrabold text-[#5A605C]">{p.name}</div>

                          {isEditing ? (
                            <input
                              type="number"
                              value={editScoreMap[p.id] ?? pts}
                              onChange={(e) =>
                                setEditScoreMap({
                                  ...editScoreMap,
                                  [p.id]: Number(e.target.value),
                                })
                              }
                              className="score-num w-full rounded-lg border border-[#E5E0D8] bg-white px-2 py-1 text-sm font-black text-[#2C302E]"
                            />
                          ) : (
                            <div className="score-num text-base font-black text-[#2C302E]">{pts}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#E5E0D8] bg-[#F7F4EE] p-4">
          <Button
            onClick={() => {
              audio.playKeypadTap();
              onClose();
            }}
            className="rounded-xl bg-[#2C302E] px-6 py-2.5 text-xs font-extrabold text-white"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
