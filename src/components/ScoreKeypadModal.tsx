import { Button } from '@gv-tech/ui-web';
import { Check, Delete, MessageSquare, Minus, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { audio } from '../services/audio';
import { Player, RoundScore } from '../types/game';

interface ScoreKeypadModalProps {
  player: Player | null;
  roundNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitScore: (score: RoundScore) => void;
}

export const ScoreKeypadModal: React.FC<ScoreKeypadModalProps> = ({
  player,
  roundNumber,
  isOpen,
  onClose,
  onSubmitScore,
}) => {
  if (!isOpen || !player) {
    return null;
  }

  const [inputVal, setInputVal] = useState<string>('0');
  const [bonusVal, setBonusVal] = useState<string>('');
  const [penaltyVal, setPenaltyVal] = useState<string>('');
  const [noteVal, setNoteVal] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Keypad actions
  const handleDigit = (digit: string) => {
    audio.playKeypadTap();
    if (inputVal === '0' || inputVal === '-0') {
      setInputVal(inputVal.startsWith('-') ? `-${digit}` : digit);
    } else {
      setInputVal(inputVal + digit);
    }
  };

  const handleToggleSign = () => {
    audio.playKeypadTap();
    if (inputVal.startsWith('-')) {
      setInputVal(inputVal.substring(1));
    } else if (inputVal !== '0') {
      setInputVal('-' + inputVal);
    }
  };

  const handleBackspace = () => {
    audio.playKeypadTap();
    if (inputVal.length <= 1 || (inputVal.length === 2 && inputVal.startsWith('-'))) {
      setInputVal('0');
    } else {
      setInputVal(inputVal.slice(0, -1));
    }
  };

  const handleClear = () => {
    audio.playUndo();
    setInputVal('0');
    setBonusVal('');
    setPenaltyVal('');
  };

  const handleQuickAdd = (amount: number) => {
    audio.playKeypadTap();
    const current = Number(inputVal) || 0;
    setInputVal(String(current + amount));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playRoundSubmit();

    const points = Number(inputVal) || 0;
    const bonus = Number(bonusVal) || 0;
    const penalty = Number(penaltyVal) || 0;

    onSubmitScore({
      playerId: player.id,
      points,
      bonusPoints: bonus > 0 ? bonus : undefined,
      penaltyPoints: penalty > 0 ? penalty : undefined,
      note: noteVal.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-[#2C302E]/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[#E5E0D8] bg-[#FDFBF7] shadow-2xl sm:rounded-2xl">
        {/* Header Bar with Player Identity */}
        <div
          className="flex items-center justify-between border-b border-[#E5E0D8] px-6 py-4 text-white"
          style={{ backgroundColor: player.color }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-sm font-extrabold backdrop-blur-md">
              {player.initials}
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-wider uppercase opacity-90">
                Round {roundNumber} Score
              </div>
              <h3 className="text-xl font-black">{player.name}</h3>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playKeypadTap();
              onClose();
            }}
            className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scoring Keypad Content */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-5">
          {/* Main Score Display Box */}
          <div className="relative space-y-1 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4 text-center">
            <div className="text-xs font-extrabold tracking-wide text-[#5A605C] uppercase">Points Entered</div>

            <div className="score-num py-1 text-5xl font-black tracking-tight text-[#2C302E]">{inputVal}</div>

            {/* Sub-breakdown if bonus or penalty added */}
            {(Number(bonusVal) > 0 || Number(penaltyVal) > 0) && (
              <div className="flex items-center justify-center gap-3 pt-1 text-xs font-bold">
                {Number(bonusVal) > 0 && <span className="text-[#6A9C78]">+ {bonusVal} Bonus</span>}
                {Number(penaltyVal) > 0 && <span className="text-[#C84B31]">- {penaltyVal} Penalty</span>}
                <span className="font-black text-[#2C302E]">
                  = Total {Number(inputVal) + (Number(bonusVal) || 0) - (Number(penaltyVal) || 0)}
                </span>
              </div>
            )}
          </div>

          {/* Quick Increment Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[+5, +10, +50, -10].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                className="score-num rounded-xl border border-[#E5E0D8] bg-[#EFEAE1] py-2 text-xs font-extrabold text-[#2C302E] transition-colors hover:bg-[#E5E0D8]"
              >
                {amt > 0 ? `+${amt}` : amt}
              </button>
            ))}
          </div>

          {/* Keypad Grid (3x4) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="score-num rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] py-3.5 text-2xl font-black text-[#2C302E] shadow-sm transition-all hover:bg-white active:scale-95 sm:py-4"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleToggleSign}
              className="flex items-center justify-center gap-0.5 rounded-2xl border border-[#E5E0D8] bg-[#EFEAE1] py-3.5 text-base font-extrabold text-[#2C302E] transition-all hover:bg-[#E5E0D8] sm:py-4"
            >
              <Plus className="h-4 w-4" />/<Minus className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="score-num rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] py-3.5 text-2xl font-black text-[#2C302E] shadow-sm transition-all hover:bg-white active:scale-95 sm:py-4"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="flex items-center justify-center rounded-2xl border border-[#E5E0D8] bg-[#EFEAE1] py-3.5 font-bold text-[#2C302E] text-[#C84B31] transition-all hover:bg-[#C84B31]/10 sm:py-4"
            >
              <Delete className="h-6 w-6" />
            </button>
          </div>

          {/* Advanced Bonus/Penalty/Note Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                audio.playKeypadTap();
                setShowAdvanced(!showAdvanced);
              }}
              className="mx-auto flex items-center gap-1.5 text-xs font-bold text-[#5A605C] hover:text-[#2C302E]"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {showAdvanced ? 'Hide Bonus & Notes' : '+ Add Bonus, Penalty, or Note'}
            </button>

            {showAdvanced && (
              <div className="animate-fade-in mt-3 space-y-3 rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-[#6A9C78] uppercase">Bonus Points</label>
                    <input
                      type="number"
                      value={bonusVal}
                      onChange={(e) => setBonusVal(e.target.value)}
                      placeholder="0"
                      className="score-num w-full rounded-lg border border-[#E5E0D8] bg-white px-2.5 py-1 text-xs font-bold text-[#2C302E]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-[#C84B31] uppercase">Penalty Points</label>
                    <input
                      type="number"
                      value={penaltyVal}
                      onChange={(e) => setPenaltyVal(e.target.value)}
                      placeholder="0"
                      className="score-num w-full rounded-lg border border-[#E5E0D8] bg-white px-2.5 py-1 text-xs font-bold text-[#2C302E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-[#5A605C] uppercase">Round Note Tag</label>
                  <input
                    type="text"
                    value={noteVal}
                    onChange={(e) => setNoteVal(e.target.value)}
                    placeholder="e.g. Went Out, Double Pig, Wild Meld"
                    className="w-full rounded-lg border border-[#E5E0D8] bg-white px-2.5 py-1 text-xs font-semibold text-[#2C302E]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 border-t border-[#E5E0D8] pt-3">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl px-4 py-3 text-xs font-extrabold text-[#5A605C] transition-colors hover:bg-[#EFEAE1]"
            >
              Clear
            </button>

            <Button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2C302E] py-3.5 text-sm font-black text-white shadow-lg transition-all hover:bg-[#1E2120] active:scale-95"
            >
              <Check className="h-5 w-5 text-[#E5A93C]" />
              Submit Round Score
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
