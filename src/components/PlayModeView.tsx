import { Badge, Button, Card, CardContent } from '@gv-tech/ui-web';
import React, { useEffect, useState } from 'react';
import { soundEffects } from '../services/audio';
import { GameSession, Player, RoundScore } from '../types/game';

interface PlayModeViewProps {
  game: GameSession;
  onScoreSubmitted: (score: RoundScore) => void;
  onFlipToDashboard: () => void;
  onEndMatch: () => void;
}

export const PlayModeView: React.FC<PlayModeViewProps> = ({
  game,
  onScoreSubmitted,
  onFlipToDashboard,
  onEndMatch,
}) => {
  const isSingleWinner = game.roundScoringType === 'SINGLE_WINNER';

  const currentRounds = game.rounds || [];
  const activeRoundIndex = currentRounds.length > 0 ? currentRounds.length - 1 : 0;
  const activeRound = currentRounds[activeRoundIndex] || { roundNumber: 1, scores: {} };

  // For EVERY_PLAYER: find first player in turn order who hasn't submitted a score
  const turnOrder = game.players;
  let defaultTurnIdx = turnOrder.findIndex((p) => !activeRound.scores[p.id]);
  if (defaultTurnIdx < 0) {
    defaultTurnIdx = 0;
  }

  const [selectedPlayer, setSelectedPlayer] = useState<Player>(turnOrder[defaultTurnIdx] || turnOrder[0]);

  useEffect(() => {
    let nextIdx = turnOrder.findIndex((p) => !activeRound.scores[p.id]);
    if (nextIdx < 0) {
      nextIdx = 0;
    }
    if (turnOrder[nextIdx]) {
      setSelectedPlayer(turnOrder[nextIdx]);
    }
  }, [game.rounds]);

  // Keypad score state
  const [pointsInput, setPointsInput] = useState<string>('0');
  const [isNegative, setIsNegative] = useState<boolean>(false);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [penaltyPoints, setPenaltyPoints] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [showSubInputs, setShowSubInputs] = useState<boolean>(false);

  // Calculate current totals
  const totals: Record<string, number> = {};
  game.players.forEach((p) => {
    totals[p.id] = 0;
  });
  game.rounds.forEach((r) => {
    Object.values(r.scores).forEach((s) => {
      const net = s.points + (s.bonusPoints || 0) - (s.penaltyPoints || 0);
      totals[s.playerId] = (totals[s.playerId] || 0) + net;
    });
  });

  const currentTotal = totals[selectedPlayer?.id] || 0;

  // Keypad Handlers
  const handleDigit = (digit: string) => {
    soundEffects.playPenClick();
    if (pointsInput === '0') {
      setPointsInput(digit);
    } else {
      if (pointsInput.length < 5) {
        setPointsInput(pointsInput + digit);
      }
    }
  };

  const handleBackspace = () => {
    soundEffects.playPenClick();
    if (pointsInput.length <= 1) {
      setPointsInput('0');
    } else {
      setPointsInput(pointsInput.slice(0, -1));
    }
  };

  const handleClear = () => {
    soundEffects.playPaperRustle();
    setPointsInput('0');
    setIsNegative(false);
    setBonusPoints(0);
    setPenaltyPoints(0);
    setNote('');
  };

  const handleToggleSign = () => {
    soundEffects.playPenClick();
    setIsNegative(!isNegative);
  };

  const handleQuickAdd = (amount: number) => {
    soundEffects.playPenClick();
    const currentVal = parseInt(pointsInput) || 0;
    const newVal = currentVal + amount;
    if (newVal < 0) {
      setIsNegative(true);
      setPointsInput(Math.abs(newVal).toString());
    } else {
      setIsNegative(false);
      setPointsInput(newVal.toString());
    }
  };

  const handleSubmitScore = () => {
    if (!selectedPlayer) {
      return;
    }

    soundEffects.playPenClick();
    const rawVal = parseInt(pointsInput) || 0;
    const finalPoints = isNegative ? -Math.abs(rawVal) : Math.abs(rawVal);

    onScoreSubmitted({
      playerId: selectedPlayer.id,
      points: finalPoints,
      bonusPoints: bonusPoints > 0 ? bonusPoints : undefined,
      penaltyPoints: penaltyPoints > 0 ? penaltyPoints : undefined,
      note: note.trim() || undefined,
    });

    setPointsInput('0');
    setIsNegative(false);
    setBonusPoints(0);
    setPenaltyPoints(0);
    setNote('');
    setShowSubInputs(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-2">
      {/* Play Mode Header Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-[#2C302E] font-mono text-xs text-white">
            Round {activeRound.roundNumber || 1}
          </Badge>
          <span className="text-xs font-semibold text-[#5A605C]">
            {isSingleWinner ? '🏆 Single Winner Round' : `Turn ${defaultTurnIdx + 1} of ${turnOrder.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFlipToDashboard}
            className="border-[#E5E0D8] bg-white text-xs text-[#2C302E] hover:bg-[#FDFBF7]"
          >
            🔄 Dashboard View
          </Button>

          <Button variant="ghost" size="sm" onClick={onEndMatch} className="text-xs text-[#C84B31] hover:bg-[#F7F4EE]">
            End Match
          </Button>
        </div>
      </div>

      {/* Single Winner Player Selector */}
      {isSingleWinner && (
        <div className="space-y-1.5 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
          <span className="block text-xs font-bold text-[#5A605C] uppercase">Select Round Winner / Scorer:</span>
          <div className="flex flex-wrap gap-2">
            {game.players.map((p) => {
              const isSelected = p.id === selectedPlayer.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playPenClick();
                    setSelectedPlayer(p);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-[#2C302E] bg-[#2C302E] text-white shadow-sm'
                      : 'border-[#E5E0D8] bg-white text-[#2C302E] hover:border-[#2C302E]'
                  }`}
                >
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Turn Player Hero Card */}
      {selectedPlayer && (
        <Card className="relative overflow-hidden border-[#E5E0D8] bg-[#F7F4EE] shadow-md">
          <div className="absolute top-0 left-0 h-2 w-full" style={{ backgroundColor: selectedPlayer.color }} />

          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white text-xl font-extrabold text-white shadow-md"
                  style={{ backgroundColor: selectedPlayer.color }}
                >
                  {selectedPlayer.initials}
                </div>

                <div>
                  <span className="block text-xs font-bold tracking-wider text-[#C84B31] uppercase">
                    {isSingleWinner ? 'Selected Round Winner' : 'Current Turn'}
                  </span>
                  <h2 className="text-2xl font-black text-[#2C302E]">
                    {isSingleWinner ? `${selectedPlayer.name} Scores` : `It's ${selectedPlayer.name}'s Turn!`}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-xs font-semibold text-[#5A605C]">Current Total</span>
                <span className="score-num text-3xl font-black text-[#2C302E]">{currentTotal}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Touch Keypad */}
      <Card className="space-y-4 border-[#E5E0D8] bg-[#F7F4EE] p-4 shadow-sm">
        {/* Score Display Box */}
        <div className="relative rounded-xl border-2 border-[#2C302E] bg-white p-4 text-center shadow-inner">
          <span className="mb-1 block text-xs tracking-wider text-[#5A605C] uppercase">Points Earned This Round</span>
          <div className="flex items-center justify-center gap-1">
            {isNegative && <span className="text-3xl font-extrabold text-[#C84B31]">-</span>}
            <span className="score-num text-5xl font-black text-[#2C302E]">{pointsInput}</span>
          </div>

          {pointsInput !== '0' && (
            <button
              onClick={handleClear}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded border border-[#E5E0D8] bg-[#F7F4EE] px-2 py-1 text-xs text-[#5A605C] hover:text-[#C84B31]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Increment Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[-10, 5, 10, 50].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAdd(val)}
              className="rounded-lg border border-[#E5E0D8] bg-white py-2 font-mono text-sm font-bold text-[#2C302E] shadow-2xs hover:border-[#2C302E] hover:bg-[#FDFBF7]"
            >
              {val > 0 ? `+${val}` : val}
            </button>
          ))}
        </div>

        {/* 3x4 Touch Numpad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="rounded-xl border border-[#E5E0D8] bg-white py-3 text-xl font-bold text-[#2C302E] shadow-2xs hover:border-[#2C302E] active:scale-98"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleToggleSign}
            className="rounded-xl border border-[#E5E0D8] bg-[#FDFBF7] py-3 text-lg font-bold text-[#2C302E] hover:border-[#2C302E]"
          >
            {isNegative ? '+ Positive' : '- Negative'}
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="rounded-xl border border-[#E5E0D8] bg-white py-3 text-xl font-bold text-[#2C302E] shadow-2xs hover:border-[#2C302E]"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="rounded-xl border border-[#E5E0D8] bg-[#FDFBF7] py-3 text-lg font-bold text-[#5A605C] hover:border-[#2C302E]"
          >
            ⌫
          </button>
        </div>

        {/* Bonus / Penalty Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowSubInputs(!showSubInputs)}
            className="mx-auto flex items-center gap-1 text-xs font-semibold text-[#5A605C] hover:text-[#2C302E]"
          >
            {showSubInputs ? '▲ Hide Bonus / Note' : '▼ Add Bonus, Penalty or Note'}
          </button>

          {showSubInputs && (
            <div className="mt-3 space-y-3 rounded-xl border border-[#E5E0D8] bg-white p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#5A605C]">Bonus (+)</label>
                  <input
                    type="number"
                    value={bonusPoints || ''}
                    onChange={(e) => setBonusPoints(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded border border-[#E5E0D8] bg-[#F7F4EE] px-2 py-1 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#5A605C]">Penalty (-)</label>
                  <input
                    type="number"
                    value={penaltyPoints || ''}
                    onChange={(e) => setPenaltyPoints(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded border border-[#E5E0D8] bg-[#F7F4EE] px-2 py-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#5A605C]">
                  Note (e.g. "Uno Win!", "Wild Qwirkle!")
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional round note..."
                  className="w-full rounded border border-[#E5E0D8] bg-[#F7F4EE] px-2 py-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <Button
            onClick={handleSubmitScore}
            className="w-full rounded-xl bg-[#C84B31] py-4 text-base font-bold text-white shadow-md hover:bg-[#b03f28]"
          >
            {isSingleWinner
              ? `Submit Score for ${selectedPlayer.name} & End Round →`
              : `Submit & Next Turn (${defaultTurnIdx + 1}/${turnOrder.length}) →`}
          </Button>
        </div>
      </Card>
    </div>
  );
};
