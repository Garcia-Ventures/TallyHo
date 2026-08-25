import { GameHighlight, GameSession, Player, RoundScore } from '../types/game';

/**
 * Calculates the total net points for each player in a game session.
 * Net points for a round = points + bonusPoints - penaltyPoints.
 */
export function calculatePlayerTotals(game: GameSession): Record<string, number> {
  const totals: Record<string, number> = {};

  const playersLength = game.players.length;
  for (let i = 0; i < playersLength; i++) {
    totals[game.players[i].id] = 0;
  }

  const roundsLength = game.rounds.length;
  for (let i = 0; i < roundsLength; i++) {
    const scores = game.rounds[i].scores;
    for (const key in scores) {
      const score = scores[key];
      if (score && totals[score.playerId] !== undefined) {
        const net = (score.points || 0) + (score.bonusPoints || 0) - (score.penaltyPoints || 0);
        totals[score.playerId] += net;
      }
    }
  }

  return totals;
}

/**
 * Sorts players according to the game's scoring mode (RACE_LOW -> ascending, otherwise descending).
 */
export function getSortedPlayers(game: GameSession, totals?: Record<string, number>): Player[] {
  const playerTotals = totals || calculatePlayerTotals(game);
  return [...game.players].sort((a, b) => {
    const scoreA = playerTotals[a.id] || 0;
    const scoreB = playerTotals[b.id] || 0;
    if (game.scoringMode === 'RACE_LOW') {
      return scoreA - scoreB;
    }
    return scoreB - scoreA;
  });
}

/**
 * Determines if a win condition has been met for the game session.
 */
export function checkWinCondition(game: GameSession): { hasWinner: boolean; winnerId: string } {
  const totals = calculatePlayerTotals(game);

  if (game.targetScore) {
    if (game.scoringMode === 'RACE_HIGH') {
      const leader = game.players.find((p) => (totals[p.id] || 0) >= game.targetScore!);
      if (leader) {
        return { hasWinner: true, winnerId: leader.id };
      }
    } else if (game.scoringMode === 'RACE_LOW') {
      const exceeded = game.players.some((p) => (totals[p.id] || 0) >= game.targetScore!);
      if (exceeded) {
        const sorted = getSortedPlayers(game, totals);
        return { hasWinner: true, winnerId: sorted[0]?.id || '' };
      }
    }
  } else if (game.targetRounds) {
    const completedRounds = game.rounds.filter((r) => Object.keys(r.scores).length > 0);
    if (completedRounds.length >= game.targetRounds) {
      const sorted = getSortedPlayers(game, totals);
      return { hasWinner: true, winnerId: sorted[0]?.id || '' };
    }
  }

  return { hasWinner: false, winnerId: '' };
}

/**
 * Determines whether to advance to the next round after submitting a score.
 */
export function shouldAdvanceRound(game: GameSession, updatedScores: Record<string, RoundScore>): boolean {
  const isSingleWinner = game.roundScoringType === 'SINGLE_WINNER';
  return isSingleWinner || game.players.every((p) => Boolean(updatedScores[p.id]));
}

/**
 * Generates match highlights for the victory screen.
 */
export function calculateGameHighlights(game: GameSession): {
  maxSingleRoundScore: number;
  maxSingleRoundPlayer: Player | undefined;
  winningMargin: number;
  highlights: GameHighlight[];
} {
  const totals = calculatePlayerTotals(game);
  let maxSingleRoundScore = 0;
  let maxSingleRoundPlayerId = '';

  game.rounds.forEach((round) => {
    Object.entries(round.scores).forEach(([pId, scoreObj]) => {
      if (scoreObj) {
        const pts = (scoreObj.points || 0) + (scoreObj.bonusPoints || 0) - (scoreObj.penaltyPoints || 0);
        if (pts > maxSingleRoundScore) {
          maxSingleRoundScore = pts;
          maxSingleRoundPlayerId = pId;
        }
      }
    });
  });

  const sortedPlayers = getSortedPlayers(game, totals);
  const winner = sortedPlayers[0];
  const secondPlace = sortedPlayers[1];
  const maxSingleRoundPlayer = game.players.find((p) => p.id === maxSingleRoundPlayerId);
  const winningMargin = winner && secondPlace ? Math.abs((totals[winner.id] || 0) - (totals[secondPlace.id] || 0)) : 0;

  const highlights: GameHighlight[] = [];

  if (maxSingleRoundPlayer && maxSingleRoundScore > 0) {
    highlights.push({
      title: 'Highest Single Round',
      playerName: maxSingleRoundPlayer.name,
      playerColor: maxSingleRoundPlayer.color,
      description: `${maxSingleRoundScore} pts in a single round`,
      badge: '⚡ Hot Streak',
    });
  }

  if (winner && secondPlace) {
    highlights.push({
      title: 'Winning Margin',
      playerName: winner.name,
      playerColor: winner.color,
      description: `+${winningMargin} pts lead over ${secondPlace.name}`,
      badge: '⭐ Dominant Performance',
    });
  }

  return {
    maxSingleRoundScore,
    maxSingleRoundPlayer,
    winningMargin,
    highlights,
  };
}
