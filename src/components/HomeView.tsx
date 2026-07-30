import { Button, Card } from '@gv-tech/ui-web';
import { ArrowRight, History, Play, Plus, Sparkles, Trophy, Users } from 'lucide-react';
import React from 'react';
import { audio } from '../services/audio';
import { GAME_PRESETS, GamePreset, GameSession } from '../types/game';

interface HomeViewProps {
  activeGame: GameSession | null;
  onResumeActiveGame: () => void;
  onSelectPreset: (preset: GamePreset) => void;
  onStartCustomGame: () => void;
  onOpenHistory: () => void;
  recentGames: GameSession[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  activeGame,
  onResumeActiveGame,
  onSelectPreset,
  onStartCustomGame,
  onOpenHistory,
  recentGames,
}) => {
  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-10 px-4 py-8">
      {/* Active Game Hero Banner */}
      {activeGame && activeGame.status === 'ACTIVE' && (
        <div className="relative overflow-hidden rounded-2xl border border-[#2C302E] bg-gradient-to-r from-[#2C302E] to-[#3B5998] p-6 text-[#FDFBF7] shadow-xl sm:p-8">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-[#E5A93C] backdrop-blur-md">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#E5A93C]" />
                Active Match In Progress
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{activeGame.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-300 sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#6A9C78]" />
                  {activeGame.players.length} Players ({activeGame.players.map((p) => p.name).join(', ')})
                </span>
                <span>•</span>
                <span>Round {activeGame.rounds.length}</span>
                {activeGame.targetScore && (
                  <>
                    <span>•</span>
                    <span>Target: {activeGame.targetScore} pts</span>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                audio.playKeypadTap();
                onResumeActiveGame();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5A93C] px-6 py-3.5 text-sm font-black text-[#2C302E] shadow-lg transition-all hover:scale-[1.02] hover:bg-[#D4982B] active:scale-95 sm:w-auto"
            >
              <Play className="h-5 w-5 fill-current" />
              Resume Scorepad
            </Button>
          </div>
          {/* Subtle paper grid background overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        </div>
      )}

      {/* Main Action Header */}
      <div className="space-y-3 py-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-[#EFEAE1] px-3.5 py-1.5 text-xs font-extrabold tracking-wide text-[#5A605C] uppercase">
          <Sparkles className="h-4 w-4 text-[#E5A93C]" />
          Instant Setup • Zero Mental Math
        </div>
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#2C302E] sm:text-4xl">
          What are we playing tonight?
        </h2>
        <p className="mx-auto max-w-lg text-sm font-medium text-[#5A605C] sm:text-base">
          Select a quick game preset optimized with rules and target scores, or start a custom match in under 10
          seconds.
        </p>
      </div>

      {/* Game Presets Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_PRESETS.map((preset) => (
          <Card
            key={preset.id}
            onClick={() => {
              audio.playKeypadTap();
              onSelectPreset(preset);
            }}
            className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-5 transition-all duration-200 hover:border-[#2C302E] hover:bg-white hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="rounded-xl bg-[#EFEAE1] p-2 text-3xl transition-colors group-hover:bg-[#E5A93C]/20">
                  {preset.icon}
                </span>
                <span className="rounded-full border border-[#E5E0D8] bg-[#2C302E]/5 px-2.5 py-1 text-[11px] font-extrabold text-[#5A605C]">
                  {preset.badgeText}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#2C302E] transition-colors group-hover:text-[#2C302E]">
                  {preset.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs font-medium text-[#5A605C]">{preset.description}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#E5E0D8]/60 pt-3 text-xs font-bold text-[#5A605C] group-hover:text-[#2C302E]">
              <span>Quick Start</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Game Button */}
      <div className="pt-2 text-center">
        <Button
          onClick={() => {
            audio.playKeypadTap();
            onStartCustomGame();
          }}
          className="mx-auto flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#2C302E]/30 bg-[#F7F4EE] px-8 py-3.5 text-sm font-bold text-[#2C302E] shadow-sm transition-all hover:border-[#2C302E] hover:bg-[#EFEAE1] sm:w-auto"
        >
          <Plus className="h-5 w-5 text-[#C84B31]" />
          Create Custom Game Rules
        </Button>
      </div>

      {/* Recent Match History Section */}
      {recentGames.length > 0 && (
        <div className="space-y-4 border-t border-[#E5E0D8] pt-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#2C302E]">
              <History className="h-5 w-5 text-[#5A605C]" />
              Recent Game Night Memories
            </h3>
            <button
              onClick={() => {
                audio.playKeypadTap();
                onOpenHistory();
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#3B5998] hover:underline"
            >
              View All Match History
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recentGames.slice(0, 4).map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between rounded-xl border border-[#E5E0D8] bg-[#F7F4EE] p-4 transition-colors hover:border-[#2C302E]"
              >
                <div>
                  <div className="text-sm font-extrabold text-[#2C302E]">{game.name}</div>
                  <div className="mt-0.5 text-xs text-[#5A605C]">
                    {new Date(game.updatedAt).toLocaleDateString()} • {game.players.length} players
                  </div>
                </div>

                {game.winnerId && (
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 rounded-md bg-[#6A9C78]/20 px-2 py-0.5 text-xs font-extrabold text-[#6A9C78]">
                      <Trophy className="h-3 w-3" />
                      {game.players.find((p) => p.id === game.winnerId)?.name || 'Winner'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
