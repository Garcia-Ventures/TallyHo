import { Button } from '@gv-tech/ui-web';
import { History, PlusCircle, Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import { audio } from '../services/audio';
import { storage } from '../services/storage';
import { UserSettings } from '../types/game';

interface NavbarProps {
  hasActiveGame: boolean;
  onNewGame: () => void;
  onViewHistory: () => void;
  onReturnHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ hasActiveGame, onNewGame, onViewHistory, onReturnHome }) => {
  const [settings, setSettings] = React.useState<UserSettings>(storage.getSettings());

  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    storage.saveSettings(updated);
    audio.playKeypadTap();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E0D8] bg-[#FDFBF7]/90 px-4 py-3 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            audio.playKeypadTap();
            if (onReturnHome) {
              onReturnHome();
            }
          }}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 transform items-center justify-center rounded-xl bg-[#2C302E] text-xl font-black text-[#FDFBF7] shadow-md transition-transform group-hover:rotate-6">
            ✏️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-sans text-xl font-extrabold tracking-tight text-[#2C302E]">Tally Ho</h1>
              {hasActiveGame && (
                <span className="inline-flex items-center rounded-full border border-[#6A9C78]/30 bg-[#6A9C78]/20 px-2 py-0.5 text-xs font-bold text-[#6A9C78]">
                  <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-[#6A9C78]" />
                  Live Match
                </span>
              )}
            </div>
            <p className="hidden text-xs font-semibold text-[#5A605C] sm:block">
              Digital pencil & paper for game night
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={settings.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="rounded-lg p-2 text-[#5A605C] transition-colors hover:bg-[#EFEAE1] hover:text-[#2C302E]"
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-5 w-5 text-[#6A9C78]" />
            ) : (
              <VolumeX className="h-5 w-5 text-[#C84B31]" />
            )}
          </button>

          {/* History */}
          <button
            onClick={() => {
              audio.playKeypadTap();
              onViewHistory();
            }}
            className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-bold text-[#5A605C] transition-colors hover:bg-[#EFEAE1] hover:text-[#2C302E] sm:px-3 sm:py-2"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Start New Match Button */}
          <Button
            onClick={() => {
              audio.playKeypadTap();
              onNewGame();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#2C302E] px-3.5 py-2 text-xs font-bold text-[#FDFBF7] shadow-sm transition-all hover:bg-[#1E2120] hover:shadow sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Game</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
