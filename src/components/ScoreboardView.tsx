import { Badge, Button, Card, CardContent } from '@gv-tech/ui-web';
import React from 'react';
import { soundEffects } from '../services/audio';
import { GameSession, Player } from '../types/game';

interface ScoreboardViewProps {
  game: GameSession;
  onOpenScoreKeypad: (player: Player) => void;
  onOpenRoundHistory: () => void;
  onFlipToPlayMode: () => void;
  onEndMatch: () => void;
  onReorderPlayers: (updatedPlayers: Player[]) => void;
}

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
  game,
  onOpenScoreKeypad,
  onOpenRoundHistory,
  onFlipToPlayMode,
  onEndMatch,
  onReorderPlayers,
}) => {
  // Compute totals
  const totals: Record<string, number> = {};
  game.players.forEach((p) => {
    totals[p.id] = 0;
  });

  game.rounds.forEach((round) => {
    Object.values(round.scores).forEach((s) => {
      const net = s.points + (s.bonusPoints || 0) - (s.penaltyPoints || 0);
      totals[s.playerId] = (totals[s.playerId] || 0) + net;
    });
  });

  // Active round state
  const currentRounds = game.rounds || [];
  const activeRoundIndex = currentRounds.length > 0 ? currentRounds.length - 1 : 0;
  const activeRound = currentRounds[activeRoundIndex] || { roundNumber: 1, scores: {} };

  // Leaderboard sorting based on scoring mode
  const sortedPlayers = [...game.players].sort((a, b) => {
    const scoreA = totals[a.id] || 0;
    const scoreB = totals[b.id] || 0;
    if (game.scoringMode === 'RACE_LOW') {
      return scoreA - scoreB;
    }
    return scoreB - scoreA;
  });

  const leaderScore = totals[sortedPlayers[0]?.id] || 0;

  const handleMoveOrder = (index: number, direction: 'UP' | 'DOWN') => {
    soundEffects.playPenClick();
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= game.players.length) {
      return;
    }
    const updated = [...game.players];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onReorderPlayers(updated);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Game Match Banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-5 shadow-sm md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#2C302E]">{game.name}</h1>
            {game.targetScore && (
              <Badge variant="outline" className="border-[#E5E0D8] text-xs">
                Target: {game.targetScore} pts
              </Badge>
            )}
            {game.targetRounds && (
              <Badge variant="outline" className="border-[#E5E0D8] text-xs">
                Limit: {game.targetRounds} rounds
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#5A605C]">
            Round {game.rounds.length > 0 ? game.rounds.length : 1} in progress • {game.players.length} Players at the
            table
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Hero Play Mode Button */}
          <Button
            onClick={() => {
              soundEffects.playPaperRustle();
              onFlipToPlayMode();
            }}
            className="bg-[#C84B31] px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-[#b03f28]"
          >
            🎮 Enter Play Mode →
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRoundHistory}
            className="border-[#E5E0D8] bg-white text-[#2C302E] hover:bg-[#FDFBF7]"
          >
            📜 Score Sheet Log ({game.rounds.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onEndMatch}
            className="bg-[#2C302E] font-bold text-white hover:bg-black"
          >
            🏆 End Match
          </Button>
        </div>
      </div>

      {/* Leaderboard Player Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {game.players.map((player, idx) => {
          const totalScore = totals[player.id] || 0;
          const isLeader = player.id === sortedPlayers[0]?.id && game.rounds.length > 0;
          const diffFromLeader = totalScore - leaderScore;

          // Check if player has completed turn in active round
          const hasLoggedCurrentRound = Boolean(activeRound.scores[player.id]);

          // Find seating turn order index
          const seatingIndex = game.players.findIndex((p) => p.id === player.id);

          return (
            <Card
              key={player.id}
              className={`relative overflow-hidden border-[#E5E0D8] shadow-xs transition-all ${
                hasLoggedCurrentRound ? 'bg-[#EFEAE1]/70 opacity-80' : 'bg-[#F7F4EE]'
              }`}
            >
              {/* Color top strip */}
              <div className="h-1.5 w-full" style={{ backgroundColor: player.color }} />

              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.initials}
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-[#2C302E]">{player.name}</span>
                      <span className="text-[10px] text-[#5A605C]">Seat #{seatingIndex + 1}</span>
                    </div>
                  </div>

                  {isLeader && (
                    <Badge className="bg-[#E5A93C] px-2 py-0.5 text-[10px] font-extrabold text-black">
                      👑 1st Place
                    </Badge>
                  )}
                </div>

                {/* Score Number Display */}
                <div>
                  <div className="score-num text-3xl font-black text-[#2C302E]">{totalScore}</div>

                  {/* Standing indicator */}
                  <span className="block text-xs text-[#5A605C]">
                    {isLeader
                      ? 'Currently Leading'
                      : `${diffFromLeader > 0 ? `+${diffFromLeader}` : diffFromLeader} pts from 1st`}
                  </span>
                </div>

                {/* Target Progress Bar */}
                {game.targetScore && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E0D8]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, (totalScore / game.targetScore) * 100))}%`,
                          backgroundColor: player.color,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Card Action / Done Indicator */}
                <div className="flex items-center justify-between border-t border-[#E5E0D8] pt-2">
                  {hasLoggedCurrentRound ? (
                    <div className="flex w-full items-center justify-between text-xs font-bold text-[#6A9C78]">
                      <span>✓ Done (Round {activeRound.roundNumber || 1})</span>
                      <button
                        onClick={() => onOpenScoreKeypad(player)}
                        className="text-[11px] text-[#5A605C] underline hover:text-[#2C302E]"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenScoreKeypad(player)}
                      className="w-full border-[#E5E0D8] bg-white text-xs font-bold hover:bg-[#FDFBF7]"
                    >
                      + Add Score
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seating Turn Order Bar */}
      <div className="flex items-center justify-between rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3 text-xs">
        <span className="font-bold text-[#5A605C]">Seating & Turn Sequence:</span>
        <div className="flex items-center gap-2 overflow-x-auto">
          {game.players.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-1 rounded-md border border-[#E5E0D8] bg-white px-2 py-1">
              <span className="font-mono font-bold text-[#5A605C]">#{idx + 1}</span>
              <span className="font-semibold text-[#2C302E]">{p.name}</span>
              <button
                onClick={() => handleMoveOrder(idx, 'UP')}
                disabled={idx === 0}
                className="px-0.5 text-[10px] font-bold hover:text-black disabled:opacity-20"
              >
                ←
              </button>
              <button
                onClick={() => handleMoveOrder(idx, 'DOWN')}
                disabled={idx === game.players.length - 1}
                className="px-0.5 text-[10px] font-bold hover:text-black disabled:opacity-20"
              >
                →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Official Score Sheet Pad */}
      <div className="paper-sheet space-y-4 rounded-2xl border border-[#E5E0D8] p-6 shadow-md">
        <div className="flex items-center justify-between border-b border-[#2C302E]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg font-bold text-[#2C302E]">Official Score Sheet Pad</h2>
          </div>

          <span className="font-mono text-xs text-[#5A605C]">{game.rounds.length} Rounds Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-[#2C302E]">
                <th className="w-20 px-3 py-2 font-mono text-xs text-[#5A605C] uppercase">Round</th>
                {game.players.map((p) => (
                  <th key={p.id} className="px-3 py-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#2C302E]">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initials}
                      </span>
                      <span>{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {game.rounds.length === 0 ? (
                <tr>
                  <td colSpan={game.players.length + 1} className="py-8 text-center text-xs text-[#5A605C] italic">
                    No rounds logged yet. Tap "Enter Play Mode" above to log scores turn-by-turn!
                  </td>
                </tr>
              ) : (
                game.rounds.map((round) => (
                  <tr key={round.roundNumber} className="border-b border-[#E5E0D8] hover:bg-[#EFEAE1]/50">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#5A605C]">R{round.roundNumber}</td>

                    {game.players.map((p) => {
                      const score = round.scores[p.id];
                      return (
                        <td key={p.id} className="score-num px-3 py-2 font-mono text-sm">
                          {score ? (
                            <div>
                              <span className="font-bold text-[#2C302E]">{score.points}</span>
                              {score.bonusPoints ? (
                                <span className="ml-1 text-xs text-green-600">+{score.bonusPoints}</span>
                              ) : null}
                              {score.penaltyPoints ? (
                                <span className="ml-1 text-xs text-red-600">-{score.penaltyPoints}</span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-[#5A605C] italic opacity-40">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
