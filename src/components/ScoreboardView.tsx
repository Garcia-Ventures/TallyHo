import { Button } from '@gv-tech/ui-web';
import { AlertTriangle, History, Plus, Trophy } from 'lucide-react';
import React from 'react';
import { audio } from '../services/audio';
import { GameSession, Player, RoundScore } from '../types/game';

interface ScoreboardViewProps {
  game: GameSession;
  onOpenKeypad: (player: Player) => void;
  onOpenRoundHistory: () => void;
  onEndGame: () => void;
}

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
  game,
  onOpenKeypad,
  onOpenRoundHistory,
  onEndGame,
}) => {
  // Compute totals per player
  const playerTotals: Record<string, number> = {};
  game.players.forEach((p) => {
    playerTotals[p.id] = 0;
  });

  game.rounds.forEach((r) => {
    Object.entries(r.scores).forEach(([pId, scoreObj]) => {
      if (playerTotals[pId] !== undefined && scoreObj) {
        const netPoints = (scoreObj.points || 0) + (scoreObj.bonusPoints || 0) - (scoreObj.penaltyPoints || 0);
        playerTotals[pId] += netPoints;
      }
    });
  });

  // Sort players by standings
  const sortedPlayers = [...game.players].sort((a, b) => {
    const totalA = playerTotals[a.id] || 0;
    const totalB = playerTotals[b.id] || 0;
    if (game.scoringMode === 'RACE_LOW') {
      return totalA - totalB; // Lowest wins
    }
    return totalB - totalA; // Highest wins
  });

  const leaderScore = playerTotals[sortedPlayers[0]?.id] || 0;

  // Check target threshold condition
  const hasLeaderReachedTarget = game.targetScore
    ? game.scoringMode === 'RACE_LOW'
      ? sortedPlayers.some((p) => (playerTotals[p.id] || 0) >= game.targetScore!)
      : leaderScore >= game.targetScore
    : false;

  const currentRoundNum = game.rounds.length + 1;

  return (
    <div className="animate-fade-in mx-auto max-w-5xl space-y-6 px-3 py-6 sm:px-4">
      {/* Header Match Controls */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#2C302E] sm:text-2xl">{game.name}</h2>
            <span className="rounded-full border border-[#E5E0D8] bg-[#2C302E]/5 px-2.5 py-0.5 text-xs font-bold text-[#5A605C]">
              {game.scoringMode === 'RACE_LOW'
                ? 'Low Score Wins'
                : game.scoringMode === 'FIXED_ROUNDS'
                  ? `Fixed ${game.targetRounds} Rounds`
                  : `Target: ${game.targetScore || 500} pts`}
            </span>
          </div>
          <p className="mt-0.5 text-xs font-semibold text-[#5A605C]">
            Round {game.rounds.length} completed • {game.players.length} Players at the table
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <button
            onClick={() => {
              audio.playKeypadTap();
              onOpenRoundHistory();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[#E5E0D8] bg-[#EFEAE1] px-3 py-2 text-xs font-bold text-[#2C302E] transition-colors hover:bg-[#E5E0D8]"
          >
            <History className="h-4 w-4 text-[#5A605C]" />
            Edit Past Rounds
          </button>

          <Button
            onClick={() => {
              audio.playKeypadTap();
              onEndGame();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-sm transition-all ${
              hasLeaderReachedTarget
                ? 'animate-bounce bg-[#C84B31] text-white hover:bg-[#B23E26]'
                : 'bg-[#2C302E] text-white hover:bg-[#1E2120]'
            }`}
          >
            <Trophy className="h-4 w-4 text-[#E5A93C]" />
            <span>{hasLeaderReachedTarget ? 'Finish Match!' : 'End Match'}</span>
          </Button>
        </div>
      </div>

      {/* Target Warning Banner */}
      {hasLeaderReachedTarget && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#C84B31]/30 bg-[#C84B31]/10 p-4 text-[#C84B31]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            <div>
              <div className="text-sm font-black">Target Threshold Reached!</div>
              <div className="text-xs font-semibold">
                {game.scoringMode === 'RACE_LOW'
                  ? 'A player has crossed the point limit! Review scores or finish match.'
                  : `${sortedPlayers[0]?.name} has crossed ${game.targetScore} points!`}
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              audio.playVictoryFanfare();
              onEndGame();
            }}
            className="rounded-xl bg-[#C84B31] px-4 py-2 text-xs font-extrabold whitespace-nowrap text-white hover:bg-[#B23E26]"
          >
            View Podium
          </Button>
        </div>
      )}

      {/* Dynamic Real-Time Leaderboard Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {sortedPlayers.map((player, idx) => {
          const total = playerTotals[player.id] || 0;
          const isLeader = idx === 0;
          const diffToLead = total - leaderScore;

          const percentToTarget = game.targetScore ? Math.min(100, Math.max(0, (total / game.targetScore) * 100)) : 0;

          return (
            <div
              key={player.id}
              onClick={() => {
                audio.playKeypadTap();
                onOpenKeypad(player);
              }}
              className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:shadow-lg ${
                isLeader
                  ? 'border-[#2C302E] bg-[#F7F4EE] ring-2 ring-[#2C302E]/10'
                  : 'border-[#E5E0D8] bg-[#FDFBF7] hover:border-[#2C302E]/50'
              }`}
            >
              {/* Leader Badge */}
              {isLeader && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#E5A93C] px-2 py-0.5 text-[10px] font-black tracking-wider text-[#2C302E] uppercase shadow-sm">
                  <Trophy className="h-3 w-3 fill-current" />
                  1st
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold text-white shadow-sm"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.initials}
                  </div>
                  <div className="truncate text-sm font-extrabold text-[#2C302E]">{player.name}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="score-num text-3xl font-black text-[#2C302E]">{total}</div>
                  <div className="text-[11px] font-bold text-[#5A605C]">
                    {isLeader ? 'Currently leading' : `${diffToLead > 0 ? '+' : ''}${diffToLead} pts from 1st`}
                  </div>
                </div>
              </div>

              {/* Progress bar to target */}
              {game.targetScore && (
                <div className="mt-3 space-y-1 border-t border-[#E5E0D8]/60 pt-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#5A605C]">
                    <span>Progress</span>
                    <span className="score-num">{Math.round(percentToTarget)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E0D8]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentToTarget}%`,
                        backgroundColor: player.color,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Tap Prompt */}
              <div className="mt-3 flex items-center justify-center gap-1 border-t border-[#E5E0D8]/40 pt-2 text-center text-[11px] font-extrabold text-[#3B5998] group-hover:text-[#2C302E]">
                <Plus className="h-3.5 w-3.5" />
                Add Score
              </div>
            </div>
          );
        })}
      </div>

      {/* Tactile Paper Score Pad Sheet */}
      <div className="paper-sheet overflow-hidden rounded-2xl border border-[#E5E0D8] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[#2C302E]/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h3 className="text-lg font-black tracking-tight text-[#2C302E]">Official Score Sheet</h3>
          </div>
          <div className="rounded-full bg-[#EFEAE1] px-3 py-1 text-xs font-bold text-[#5A605C]">
            {game.rounds.length} Rounds Logged
          </div>
        </div>

        {/* Paper Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-[#2C302E]">
                <th className="w-16 px-3 py-2.5 text-xs font-black tracking-wider text-[#5A605C] uppercase">Round</th>
                {game.players.map((p) => (
                  <th key={p.id} className="px-3 py-2.5">
                    <button
                      onClick={() => {
                        audio.playKeypadTap();
                        onOpenKeypad(p);
                      }}
                      className="group flex w-full items-center gap-2 text-left focus:outline-none"
                    >
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold text-white shadow-sm"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initials}
                      </div>
                      <span className="text-sm font-extrabold text-[#2C302E] group-hover:underline">{p.name}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E0D8]">
              {game.rounds.length === 0 ? (
                <tr>
                  <td
                    colSpan={game.players.length + 1}
                    className="py-12 text-center text-sm font-semibold text-[#5A605C]"
                  >
                    No rounds recorded yet. Tap any player card above or button below to add Round 1!
                  </td>
                </tr>
              ) : (
                game.rounds.map((round) => (
                  <tr key={round.roundNumber} className="transition-colors hover:bg-[#2C302E]/5">
                    <td className="score-num px-3 py-2.5 text-xs font-extrabold text-[#5A605C]">
                      R{round.roundNumber}
                    </td>

                    {game.players.map((p) => {
                      const scoreObj: RoundScore | undefined = round.scores[p.id];
                      const pts = scoreObj ? scoreObj.points || 0 : '-';
                      const bonus = scoreObj?.bonusPoints;
                      const penalty = scoreObj?.penaltyPoints;

                      return (
                        <td key={p.id} className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="score-num text-base font-extrabold text-[#2C302E]">{pts}</span>
                            {bonus ? (
                              <span className="rounded bg-[#6A9C78]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#6A9C78]">
                                +{bonus}
                              </span>
                            ) : null}
                            {penalty ? (
                              <span className="rounded bg-[#C84B31]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#C84B31]">
                                -{penalty}
                              </span>
                            ) : null}
                          </div>
                          {scoreObj?.note && (
                            <div className="max-w-[100px] truncate text-[10px] font-medium text-[#5A605C] italic">
                              {scoreObj.note}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Row */}
            <tfoot>
              <tr className="border-t-2 border-[#2C302E] bg-[#2C302E]/5">
                <td className="px-3 py-3 text-xs font-black text-[#2C302E] uppercase">Total</td>
                {game.players.map((p) => (
                  <td key={p.id} className="px-3 py-3">
                    <div className="score-num ink-underline inline-block text-lg font-black text-[#2C302E]">
                      {playerTotals[p.id] || 0}
                    </div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Quick Player Round Entry Row */}
      <div className="space-y-3 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4">
        <div className="text-xs font-extrabold tracking-wide text-[#5A605C] uppercase">
          Tap player to record Round {currentRoundNum} points:
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {game.players.map((player) => (
            <button
              key={player.id}
              onClick={() => {
                audio.playKeypadTap();
                onOpenKeypad(player);
              }}
              className="flex items-center justify-between rounded-xl border border-[#E5E0D8] bg-white p-3 text-left shadow-sm transition-all hover:border-[#2C302E] hover:bg-[#EFEAE1] active:scale-95"
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-extrabold text-white"
                  style={{ backgroundColor: player.color }}
                >
                  {player.initials}
                </div>
                <span className="truncate text-xs font-extrabold text-[#2C302E]">{player.name}</span>
              </div>
              <Plus className="h-4 w-4 text-[#3B5998]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
