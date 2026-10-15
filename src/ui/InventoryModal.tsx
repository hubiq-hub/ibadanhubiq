import React from 'react';
import { InventoryItem } from '../types/game';

interface InventoryModalProps {
  inventory: InventoryItem[];
  onUseItem: (item: InventoryItem) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  onUseItem,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 sm:p-6 text-white flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <h2 className="text-xl font-bold text-emerald-300">Personal Inventory</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {inventory.length} item{inventory.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Item Grid / List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {inventory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <span className="text-4xl opacity-40">🛍️</span>
              <p className="text-sm">Your pockets are empty.</p>
              <p className="text-xs text-slate-500">Visit Iya Moria or Mama Shade on Dugbe Avenue to buy food and goods.</p>
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2 bg-slate-800 rounded-lg shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">{item.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        x{item.quantity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xs">{item.description}</p>
                    <div className="flex gap-2 mt-1">
                      {item.hungerRestore && item.hungerRestore > 0 ? (
                        <span className="text-[10px] font-semibold text-orange-400">
                          🍖 +{item.hungerRestore}% Hunger
                        </span>
                      ) : null}
                      {item.energyRestore && item.energyRestore > 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-400">
                          ⚡ +{item.energyRestore}% Energy
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {item.usable && (
                  <button
                    onClick={() => onUseItem(item)}
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    {item.category === 'food' || item.category === 'drink' ? 'Consume' : 'Use'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            Close Bag
          </button>
        </div>
      </div>
    </div>
  );
};
