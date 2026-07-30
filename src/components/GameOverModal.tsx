import { Button } from '@gv-tech/ui-web';
import confetti from 'canvas-confetti';
import { Home, RotateCcw, Sparkles, Star, Zap } from 'lucide-react';
import React, { useEffect } from 'react';
import { audio } from '../services/audio';
import { GameSession } from '../types/game';

interface GameOverModalProps {
  game: GameSession;
  isOpen: boolean;
  onRematch: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ game, isOpen, onRematch, onReturnHome }) => {
  if (!isOpen) {
    return null;
  }

  // Trigger celebration & audio on open
  useEffect(() => {
    audio.playVictoryFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E5A93C', '#6A9C78', '#D96B43', '#3B5998', '#C84B31'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  // Compute final totals & standings
  const playerTotals: Record<string, number> = {};
  game.players.forEach((p) => {
    playerTotals[p.id] = 0;
  });

  let maxSingleRoundScore = 0;
  let maxSingleRoundPlayerId = '';

  game.rounds.forEach((r) => {
    Object.entries(r.scores).forEach(([pId, scoreObj]) => {
      if (playerTotals[pId] !== undefined && scoreObj) {
        const pts = (scoreObj.points || 0) + (scoreObj.bonusPoints || 0) - (scoreObj.penaltyPoints || 0);
        playerTotals[pId] += pts;

        if (pts > maxSingleRoundScore) {
          maxSingleRoundScore = pts;
          maxSingleRoundPlayerId = pId;
        }
      }
    });
  });

  const sortedPlayers = [...game.players].sort((a, b) => {
    const totalA = playerTotals[a.id] || 0;
    const totalB = playerTotals[b.id] || 0;
    if (game.scoringMode === 'RACE_LOW') {
      return totalA - totalB;
    }
    return totalB - totalA;
  });

  const winner = sortedPlayers[0];
  const secondPlace = sortedPlayers[1];
  const thirdPlace = sortedPlayers[2];

  const maxRoundPlayer = game.players.find((p) => p.id === maxSingleRoundPlayerId);

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[#2C302E]/70 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl">
        {/* Victory Header */}
        <div className="relative space-y-3 overflow-hidden bg-gradient-to-b from-[#2C302E] to-[#1E2120] p-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl bg-[#E5A93C] text-3xl text-[#2C302E] shadow-lg">
            👑
          </div>

          <div>
            <div className="text-xs font-black tracking-widest text-[#E5A93C] uppercase">Game Night Champion</div>
            <h2 className="mt-1 text-3xl font-black text-white">
              {winner ? `${winner.name} Wins!` : 'Match Complete!'}
            </h2>
            <p className="mt-1 text-xs font-semibold text-gray-300">
              {game.name} • {game.rounds.length} Rounds Logged
            </p>
          </div>
        </div>

        {/* Podium Standings */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 items-end gap-3 pt-2 text-center">
            {/* 2nd Place */}
            {secondPlace && (
              <div className="space-y-1 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#3B5998] text-xs font-black text-white">
                  2
                </div>
                <div className="truncate text-xs font-extrabold text-[#2C302E]">{secondPlace.name}</div>
                <div className="score-num text-lg font-black text-[#2C302E]">{playerTotals[secondPlace.id]}</div>
                <div className="text-[10px] font-bold text-[#5A605C]">2nd Place</div>
              </div>
            )}

            {/* 1st Place Champion */}
            {winner && (
              <div className="scale-105 transform space-y-1 rounded-2xl border-2 border-[#E5A93C] bg-[#E5A93C]/15 p-4 shadow-md">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E5A93C] text-base font-black text-[#2C302E] shadow">
                  1
                </div>
                <div className="truncate text-sm font-black text-[#2C302E]">{winner.name}</div>
                <div className="score-num text-2xl font-black text-[#2C302E]">{playerTotals[winner.id]}</div>
                <div className="text-[10px] font-black tracking-wider text-[#E5A93C] uppercase">🏆 Champion</div>
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <div className="space-y-1 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#D96B43] text-xs font-black text-white">
                  3
                </div>
                <div className="truncate text-xs font-extrabold text-[#2C302E]">{thirdPlace.name}</div>
                <div className="score-num text-lg font-black text-[#2C302E]">{playerTotals[thirdPlace.id]}</div>
                <div className="text-[10px] font-bold text-[#5A605C]">3rd Place</div>
              </div>
            )}
          </div>

          {/* Highlights Reel */}
          <div className="space-y-3 pt-2">
            <h4 className="flex items-center gap-1.5 text-xs font-black tracking-wider text-[#5A605C] uppercase">
              <Sparkles className="h-4 w-4 text-[#E5A93C]" />
              Match Highlight Reel
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Highlight 1: Highest Single Round */}
              {maxRoundPlayer && (
                <div className="flex items-center gap-3 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6A9C78]/20 text-[#6A9C78]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-[#5A605C]">Highest Single Round</div>
                    <div className="text-xs font-black text-[#2C302E]">
                      {maxRoundPlayer.name} ({maxSingleRoundScore} pts)
                    </div>
                  </div>
                </div>
              )}

              {/* Highlight 2: Victory Margin */}
              {winner && secondPlace && (
                <div className="flex items-center gap-3 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B5998]/20 text-[#3B5998]">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-[#5A605C]">Winning Margin</div>
                    <div className="text-xs font-black text-[#2C302E]">
                      +{Math.abs(playerTotals[winner.id] - playerTotals[secondPlace.id])} pts over 2nd
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3 border-t border-[#E5E0D8] bg-[#F7F4EE] p-6 sm:flex-row">
          <Button
            onClick={() => {
              audio.playKeypadTap();
              onRematch();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2C302E] py-3 text-sm font-extrabold text-white shadow hover:bg-[#1E2120] sm:flex-1"
          >
            <RotateCcw className="h-4 w-4 text-[#E5A93C]" />
            Rematch Same Players
          </Button>

          <button
            onClick={() => {
              audio.playKeypadTap();
              onReturnHome();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E0D8] bg-[#EFEAE1] px-6 py-3 text-sm font-bold text-[#2C302E] transition-colors hover:bg-[#E5E0D8] sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Home View
          </button>
        </div>
      </div>
    </div>
  );
};
