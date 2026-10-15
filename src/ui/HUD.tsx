import React from 'react';
import { Mission, PlayerLocomotionState, PlayerStats } from '../types/game';
import { Minimap } from './Minimap';
import { VirtualJoystick } from './VirtualJoystick';

interface HUDProps {
  stats: PlayerStats;
  characterName: string;
  locomotionState: PlayerLocomotionState;
  activeMission: Mission | null;
  interactionPrompt: string | null;
  playerX: number;
  playerZ: number;
  playerRotY: number;
  toastMessage: string | null;
  onInteract: () => void;
  onExitVehicle: () => void;
  onHonkHorn: () => void;
  onJump: () => void;
  onToggleRun: () => void;
  isRunning: boolean;
  onOpenInventory: () => void;
  onPause: () => void;
  onJoystickMove: (input: { x: number; y: number }) => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  characterName,
  locomotionState,
  activeMission,
  interactionPrompt,
  playerX,
  playerZ,
  playerRotY,
  toastMessage,
  onInteract,
  onExitVehicle,
  onHonkHorn,
  onJump,
  onToggleRun,
  isRunning,
  onOpenInventory,
  onPause,
  onJoystickMove,
}) => {
  const isInVehicle = locomotionState !== 'onFoot';

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-slate-900/95 border-2 border-emerald-400 text-emerald-300 font-bold px-4 py-2 rounded-2xl shadow-2xl text-xs sm:text-sm animate-bounce text-center">
          {toastMessage}
        </div>
      )}

      {/* TOP ROW: Stats (Left), Active Quest (Center), Minimap Radar (Right) */}
      <div className="flex items-start justify-between gap-2">
        {/* Player Stats Panel */}
        <div className="pointer-events-auto bg-slate-900/85 border border-emerald-500/80 rounded-2xl p-2.5 sm:p-3.5 shadow-xl backdrop-blur-xs flex flex-col gap-2 min-w-36 sm:min-w-48">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wide truncate max-w-28 sm:max-w-36">
              {characterName}
            </span>
            <button
              onClick={onPause}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-600 cursor-pointer"
            >
              PAUSE
            </button>
          </div>

          {/* Naira Wallet */}
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-extrabold text-sm sm:text-base">₦</span>
            <span className="text-amber-300 font-black text-sm sm:text-lg tracking-tight">
              {stats.money.toLocaleString()}
            </span>
          </div>

          {/* Hunger Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 font-semibold mb-0.5">
              <span>Hunger</span>
              <span>{Math.round(stats.hunger)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  stats.hunger > 35 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${stats.hunger}%` }}
              />
            </div>
          </div>

          {/* Energy Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 font-semibold mb-0.5">
              <span>Energy</span>
              <span>{Math.round(stats.energy)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  stats.energy > 35 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${stats.energy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Mission HUD Card (Center) */}
        {activeMission && activeMission.status === 'active' && (
          <div className="pointer-events-auto bg-slate-900/90 border border-amber-500/80 rounded-2xl p-2 sm:p-3 shadow-xl backdrop-blur-xs flex flex-col max-w-xs text-left mx-1">
            <div className="flex items-center justify-between gap-1.5 border-b border-slate-700/80 pb-1 mb-1">
              <span className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <span>🎯</span>
                <span className="truncate max-w-[120px] sm:max-w-[180px]">{activeMission.title}</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700/60 shrink-0">
                +₦{activeMission.rewardMoney.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-2">
              {activeMission.steps[activeMission.currentStepIndex]?.text || 'Complete objective'}
            </p>
          </div>
        )}

        {/* Minimap Radar (Right) */}
        <div className="pointer-events-auto">
          <Minimap
            playerX={playerX}
            playerZ={playerZ}
            playerRotY={playerRotY}
            activeMission={activeMission}
          />
        </div>
      </div>

      {/* MIDDLE: Contextual Action Prompt Banner */}
      {interactionPrompt && (
        <div className="self-center pointer-events-auto bg-emerald-950/90 border-2 border-emerald-400 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xs flex items-center gap-3 animate-pulse">
          <span className="bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-lg text-xs">
            ACTION
          </span>
          <span className="text-xs sm:text-sm font-bold text-emerald-200">
            {interactionPrompt}
          </span>
        </div>
      )}

      {/* BOTTOM ROW: Mobile Virtual Joystick (Left) and Action Buttons (Right) */}
      <div className="flex items-end justify-between w-full">
        {/* Left Side: Virtual Joystick */}
        <div className="pointer-events-auto p-1">
          <VirtualJoystick onMove={onJoystickMove} />
        </div>

        {/* Right Side: Action Buttons */}
        <div className="pointer-events-auto flex flex-col items-end gap-2.5">
          {/* Upper Utility Row (Inventory, Horn) */}
          <div className="flex gap-2">
            {isInVehicle && (
              <button
                onClick={onHonkHorn}
                className="w-12 h-12 rounded-2xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-extrabold text-xs shadow-xl border-2 border-amber-300 flex items-center justify-center cursor-pointer"
                title="Honk Horn (H)"
              >
                📯
              </button>
            )}

            <button
              onClick={onOpenInventory}
              className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-extrabold text-xs shadow-xl border-2 border-slate-600 flex items-center justify-center cursor-pointer"
              title="Open Inventory (I)"
            >
              🎒
            </button>
          </div>

          {/* Lower Core Actions (Run, Jump, Action / Exit) */}
          <div className="flex items-center gap-2">
            {!isInVehicle ? (
              <>
                <button
                  onClick={onToggleRun}
                  className={`w-14 h-14 rounded-2xl font-black text-xs shadow-xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer ${
                    isRunning
                      ? 'bg-amber-500 text-slate-950 border-amber-300'
                      : 'bg-slate-800 text-slate-200 border-slate-600'
                  }`}
                >
                  <span>⚡</span>
                  <span>RUN</span>
                </button>

                <button
                  onClick={onJump}
                  className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-black text-xs shadow-xl border-2 border-slate-600 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>⬆️</span>
                  <span>JUMP</span>
                </button>

                {interactionPrompt && (
                  <button
                    onClick={onInteract}
                    className="w-16 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-2xl border-2 border-emerald-300 flex flex-col items-center justify-center cursor-pointer animate-pulse"
                  >
                    <span>👉</span>
                    <span>ACTION</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onExitVehicle}
                className="w-16 h-16 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs shadow-2xl border-2 border-red-300 flex flex-col items-center justify-center cursor-pointer"
              >
                <span>🚪</span>
                <span>EXIT</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
