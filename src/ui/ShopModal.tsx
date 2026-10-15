import React from 'react';
import { InventoryItem } from '../types/game';
import { EconomySystem } from '../systems/economySystem';

interface ShopModalProps {
  shopType: string;
  playerMoney: number;
  onBuyItem: (item: InventoryItem) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  shopType,
  playerMoney,
  onBuyItem,
  onClose,
}) => {
  const catalog = EconomySystem.getShopCatalog();
  const items = catalog[shopType as keyof typeof catalog] || catalog.provisions;

  const shopTitles: Record<string, { title: string; subtitle: string; icon: string }> = {
    buka: { title: 'Iya Moria Amala Buka', subtitle: 'Authentic Ibadan Cuisine', icon: '🍲' },
    provisions: { title: 'Mama Shade Provisions & POS', subtitle: 'Daily Groceries & Cold Drinks', icon: '🛒' },
    chemist: { title: 'HealthFirst Chemist', subtitle: 'Vitamins, First Aid & Energy', icon: '💊' },
    tech: { title: 'Dugbe Tech & Electronics', subtitle: 'Phone Repairs & Power Banks', icon: '📱' },
    dealership: { title: 'Ade Auto Works & Dealership', subtitle: 'Okada & City Cab Sales', icon: '🔧' },
  };

  const info = shopTitles[shopType] || { title: 'Shop', subtitle: 'Local Store', icon: '🏬' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 sm:p-6 text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info.icon}</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-emerald-300">{info.title}</h2>
              <p className="text-xs text-slate-400">{info.subtitle}</p>
            </div>
          </div>
          {/* Player Wallet Badge */}
          <div className="bg-emerald-950/90 border border-emerald-500/70 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold text-xs uppercase">Wallet:</span>
            <span className="text-amber-300 font-extrabold text-sm sm:text-base">
              ₦{playerMoney.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {items.map((item) => {
            const canAfford = playerMoney >= item.price;
            return (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-700/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl sm:text-3xl p-2 bg-slate-800 rounded-lg shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-sm">{item.description}</p>
                    <div className="flex gap-2 mt-1">
                      {item.hungerRestore && item.hungerRestore > 0 ? (
                        <span className="text-[11px] font-semibold text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-800/40">
                          🍖 +{item.hungerRestore}% Hunger
                        </span>
                      ) : null}
                      {item.energyRestore && item.energyRestore > 0 ? (
                        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          ⚡ +{item.energyRestore}% Energy
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2">
                  <span className="text-base sm:text-lg font-bold text-amber-300">
                    ₦{item.price.toLocaleString()}
                  </span>
                  <button
                    disabled={!canAfford}
                    onClick={() => onBuyItem(item)}
                    className={`py-1.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
                      canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white border border-emerald-400'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {canAfford ? 'Buy' : 'Low Funds'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            Leave Shop
          </button>
        </div>
      </div>
    </div>
  );
};
