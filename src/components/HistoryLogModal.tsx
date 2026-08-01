import { Button } from '@gv-tech/ui-web';
import { Calendar, Trash2, Trophy, Users, X } from 'lucide-react';
import React from 'react';
import { audio } from '../services/audio';
import { GameSession } from '../types/game';

interface HistoryLogModalProps {
  history: GameSession[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteMatch?: (id: string) => void;
  onClearHistory?: () => void;
}

export const HistoryLogModal: React.FC<HistoryLogModalProps> = ({
  history,
  isOpen,
  onClose,
  onDeleteMatch,
  onClearHistory,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleDelete = (id: string) => {
    if (onDeleteMatch) {
      onDeleteMatch(id);
    } else if (onClearHistory) {
      onClearHistory();
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#2C302E]/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E0D8] bg-[#F7F4EE] px-6 py-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#2C302E]">Match History Archive</h3>
            <p className="text-xs font-semibold text-[#5A605C]">Digital ledger of past game night victories & stats</p>
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

        {/* Content list */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="py-12 text-center text-sm font-semibold text-[#5A605C]">
              No archived games yet. Completed matches will be logged here automatically!
            </div>
          ) : (
            history.map((game) => {
              // Calculate winner
              const playerTotals: Record<string, number> = {};
              game.players.forEach((p) => (playerTotals[p.id] = 0));
              game.rounds.forEach((r) => {
                Object.entries(r.scores).forEach(([pId, obj]) => {
                  if (playerTotals[pId] !== undefined && obj) {
                    playerTotals[pId] += (obj.points || 0) + (obj.bonusPoints || 0) - (obj.penaltyPoints || 0);
                  }
                });
              });

              const sorted = [...game.players].sort((a, b) =>
                game.scoringMode === 'RACE_LOW'
                  ? playerTotals[a.id] - playerTotals[b.id]
                  : playerTotals[b.id] - playerTotals[a.id],
              );

              const winner = sorted[0];

              return (
                <div
                  key={game.id}
                  className="space-y-3 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-4 transition-colors hover:border-[#2C302E]/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-[#2C302E]">{game.name}</h4>
                        <span className="rounded-md border border-[#E5E0D8] bg-[#2C302E]/5 px-2 py-0.5 text-[10px] font-extrabold text-[#5A605C]">
                          {game.status === 'COMPLETED' ? 'Finished' : 'In Progress'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-[#5A605C]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(game.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {game.players.length} Players
                        </span>
                        <span>{game.rounds.length} Rounds</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        audio.playUndo();
                        handleDelete(game.id);
                      }}
                      className="rounded-lg p-1.5 text-[#5A605C] transition-colors hover:bg-[#C84B31]/10 hover:text-[#C84B31]"
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Winner Banner & Player Scores */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E0D8] pt-2 text-xs">
                    {winner && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5A93C]/40 bg-[#E5A93C]/20 px-2.5 py-1 font-black text-[#2C302E]">
                        <Trophy className="h-3.5 w-3.5 text-[#E5A93C]" />
                        Winner: {winner.name} ({playerTotals[winner.id]} pts)
                      </div>
                    )}

                    <div className="score-num flex flex-wrap gap-2 font-extrabold text-[#5A605C]">
                      {sorted.map((p) => (
                        <span key={p.id} className="rounded border border-[#E5E0D8] bg-white px-2 py-0.5">
                          {p.name}: {playerTotals[p.id]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E0D8] bg-[#F7F4EE] p-4">
          {onClearHistory && history.length > 0 && (
            <button
              onClick={() => {
                audio.playUndo();
                onClearHistory();
              }}
              className="text-xs font-bold text-[#C84B31] hover:underline"
            >
              Clear All Archive
            </button>
          )}
          <Button
            onClick={() => {
              audio.playKeypadTap();
              onClose();
            }}
            className="ml-auto rounded-xl bg-[#2C302E] px-6 py-2 text-xs font-extrabold text-white"
          >
            Close Archive
          </Button>
        </div>
      </div>
    </div>
  );
};
