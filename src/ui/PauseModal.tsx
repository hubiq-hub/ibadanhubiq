import React, { useState } from 'react';
import { SoundSettings } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface PauseModalProps {
  onResume: () => void;
  onSave: () => void;
  onUnstuck: () => void;
  onMainMenu: () => void;
  soundSettings: SoundSettings;
  onUpdateSoundSettings: (settings: SoundSettings) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onSave,
  onUnstuck,
  onMainMenu,
  soundSettings,
  onUpdateSoundSettings,
}) => {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = () => {
    onSave();
    setSaveMessage('Game progress saved to browser storage!');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const handleVolumeChange = (type: keyof SoundSettings, val: number) => {
    const updated = { ...soundSettings, [type]: val };
    onUpdateSoundSettings(updated);
    soundEngine.setVolumes(updated.masterVolume, updated.sfxVolume, updated.ambientVolume);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl p-5 sm:p-6 text-white flex flex-col gap-4">
        {/* Title */}
        <div className="text-center border-b border-slate-700/80 pb-3">
          <h2 className="text-2xl font-black text-emerald-400 tracking-wider">GAME PAUSED</h2>
          <p className="text-xs text-slate-400 mt-1">Hubiq Life • Ibadan, Nigeria</p>
        </div>

        {saveMessage && (
          <div className="py-2 px-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center text-xs font-bold text-emerald-300">
            ✓ {saveMessage}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm shadow-lg border border-emerald-400 transition-all cursor-pointer"
          >
            ▶ Resume Game
          </button>

          <button
            onClick={handleSave}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            💾 Save Progress
          </button>

          <button
            onClick={onUnstuck}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-semibold text-sm border border-amber-700/50 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            🔄 Unstuck Player (Teleport to Safe Road)
          </button>
        </div>

        {/* Sound Controls */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Audio Volume</h3>
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Master Sound</span>
              <span>{Math.round(soundSettings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundSettings.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Controls Quick Reference */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">Quick Controls:</p>
          <p>• Move: <span className="text-slate-200 font-semibold">WASD / Arrow Keys / Touch Joystick</span></p>
          <p>• Sprint: <span className="text-slate-200 font-semibold">Shift Key / RUN Button</span></p>
          <p>• Interact / Ride: <span className="text-slate-200 font-semibold">E Key / ACTION Button</span></p>
          <p>• Exit Vehicle: <span className="text-slate-200 font-semibold">F Key / EXIT Button</span></p>
          <p>• Horn: <span className="text-slate-200 font-semibold">H Key / HORN Button</span></p>
        </div>

        {/* Return to Main Menu */}
        <div className="border-t border-slate-700/80 pt-3 flex justify-between gap-3">
          <button
            onClick={onMainMenu}
            className="w-full py-2 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/50 transition-colors cursor-pointer"
          >
            Exit to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
