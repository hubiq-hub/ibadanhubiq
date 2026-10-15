import React from 'react';
import { NPCData } from '../types/game';

interface DialogueModalProps {
  npc: NPCData;
  onClose: () => void;
  onOpenShop: (shopType: string) => void;
  onAcceptMission: (missionId: string) => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  onClose,
  onOpenShop,
  onAcceptMission,
}) => {
  const [currentText, setCurrentText] = React.useState(npc.dialogue.text);

  const handleOptionClick = (option: {
    label: string;
    action?: 'open_shop' | 'accept_mission' | 'talk' | 'close' | 'dealership';
    nextDialogue?: string;
    missionId?: string;
  }) => {
    if (option.nextDialogue) {
      setCurrentText(option.nextDialogue);
    }

    if (option.action === 'close') {
      onClose();
    } else if (option.action === 'open_shop') {
      onClose();
      onOpenShop(npc.shopType || 'provisions');
    } else if (option.action === 'accept_mission' && option.missionId) {
      onAcceptMission(option.missionId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-slate-900/95 border-2 border-emerald-500 rounded-2xl shadow-2xl p-5 text-white flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-700/80 pb-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-2xl shadow-inner border border-emerald-400">
            {npc.shopType === 'buka' ? '🍲' : npc.shopType === 'dealership' ? '🔧' : '👤'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">{npc.name}</h2>
            <p className="text-xs text-emerald-400/80 font-medium">{npc.role}</p>
          </div>
        </div>

        {/* Dialogue Body */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-slate-100 text-sm sm:text-base leading-relaxed min-h-20">
          <p className="text-amber-300 text-xs italic mb-1">"{npc.greeting}"</p>
          <p>{currentText}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2 pt-1">
          {npc.dialogue.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-800/60 hover:bg-emerald-600 active:bg-emerald-500 text-white text-sm font-semibold border border-emerald-600/70 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <span>{opt.label}</span>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ))}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium text-center transition-colors mt-1 cursor-pointer"
          >
            Leave conversation
          </button>
        </div>
      </div>
    </div>
  );
};
