import { InventoryItem } from '../types/game';

export interface ShopCatalog {
  buka: InventoryItem[];
  provisions: InventoryItem[];
  chemist: InventoryItem[];
  tech: InventoryItem[];
  dealership: InventoryItem[];
}

export class EconomySystem {
  public static getShopCatalog(): ShopCatalog {
    return {
      buka: [
        {
          id: 'food_amala_goat',
          name: 'Hot Amala & Goat Meat',
          category: 'food',
          description: 'Authentic piping hot Oyo Amala with fresh Ewedu, Gbegiri, and tender goat meat.',
          price: 1200,
          hungerRestore: 45,
          energyRestore: 25,
          quantity: 1,
          usable: true,
          icon: '🍲',
        },
        {
          id: 'food_jollof_dodo',
          name: 'Party Jollof & Dodo',
          category: 'food',
          description: 'Smoky firewood Ibadan party jollof with sweet fried plantain.',
          price: 1000,
          hungerRestore: 40,
          energyRestore: 20,
          quantity: 1,
          usable: true,
          icon: '🍛',
        },
        {
          id: 'food_eba_egusi',
          name: 'Eba & Egusi with Assorted',
          category: 'food',
          description: 'Yellow garri eba served with rich egusi melon soup and assorted beef.',
          price: 1100,
          hungerRestore: 50,
          energyRestore: 15,
          quantity: 1,
          usable: true,
          icon: '🥘',
        },
      ],
      provisions: [
        {
          id: 'drink_malta',
          name: 'Cold Malta Guinness',
          category: 'drink',
          description: 'Ice-cold nutritious malt beverage to restore stamina under the sun.',
          price: 400,
          hungerRestore: 15,
          energyRestore: 35,
          quantity: 1,
          usable: true,
          icon: '🥤',
        },
        {
          id: 'drink_zobo',
          name: 'Chilled Zobo Drink',
          category: 'drink',
          description: 'Refreshing hibiscus beverage infused with ginger and cloves.',
          price: 250,
          hungerRestore: 10,
          energyRestore: 25,
          quantity: 1,
          usable: true,
          icon: '🧃',
        },
        {
          id: 'snack_gala',
          name: 'Gala Sausage Roll',
          category: 'food',
          description: 'Classic Nigerian roadside snack for quick hunger relief.',
          price: 250,
          hungerRestore: 18,
          energyRestore: 10,
          quantity: 1,
          usable: true,
          icon: '🌭',
        },
        {
          id: 'snack_indomie',
          name: 'Indomie Onion Chicken Pack',
          category: 'food',
          description: 'Quick instant noodles pack.',
          price: 350,
          hungerRestore: 25,
          energyRestore: 10,
          quantity: 1,
          usable: true,
          icon: '🍜',
        },
      ],
      chemist: [
        {
          id: 'med_paracetamol',
          name: 'Paracetamol & Vitamin C',
          category: 'tech',
          description: 'Quick relief from fatigue and headache to restore physical energy.',
          price: 500,
          hungerRestore: 0,
          energyRestore: 40,
          quantity: 1,
          usable: true,
          icon: '💊',
        },
        {
          id: 'med_glucose',
          name: 'Instant Glucose Energy Pack',
          category: 'drink',
          description: 'Fast-absorbing energy booster to immediately replenish stamina.',
          price: 600,
          hungerRestore: 5,
          energyRestore: 55,
          quantity: 1,
          usable: true,
          icon: '⚡',
        },
      ],
      tech: [
        {
          id: 'tech_powerbank',
          name: '20,000mAh Fast Power Bank',
          category: 'tech',
          description: 'High-capacity backup battery for non-stop city navigation and courier work.',
          price: 8500,
          quantity: 1,
          usable: false,
          icon: '🔋',
        },
      ],
      dealership: [
        {
          id: 'vehicle_okada',
          name: 'Bajaj Boxer 100 Okada',
          category: 'vehicle',
          description: 'Rugged commercial motorcycle. Perfect for navigating Ibadan alleys and swift deliveries.',
          price: 35000,
          quantity: 1,
          usable: true,
          icon: '🏍️',
        },
        {
          id: 'vehicle_micra',
          name: 'Nissan Micra Ibadan Taxi',
          category: 'vehicle',
          description: 'Official blue & yellow Ibadan city cab. Reliable four-door transport.',
          price: 120000,
          quantity: 1,
          usable: true,
          icon: '🚕',
        },
      ],
    };
  }

  public static buyItem(
    currentMoney: number,
    inventory: InventoryItem[],
    item: InventoryItem
  ): { success: boolean; newMoney: number; newInventory: InventoryItem[]; message: string } {
    if (currentMoney < item.price) {
      return {
        success: false,
        newMoney: currentMoney,
        newInventory: inventory,
        message: `Insufficient funds! You need ₦${item.price.toLocaleString()} but only have ₦${currentMoney.toLocaleString()}.`,
      };
    }

    const newMoney = currentMoney - item.price;
    const existingIndex = inventory.findIndex((i) => i.id === item.id);
    const newInventory = [...inventory];

    if (existingIndex >= 0) {
      newInventory[existingIndex] = {
        ...newInventory[existingIndex],
        quantity: newInventory[existingIndex].quantity + 1,
      };
    } else {
      newInventory.push({ ...item, quantity: 1 });
    }

    return {
      success: true,
      newMoney,
      newInventory,
      message: `Purchased ${item.name} for ₦${item.price.toLocaleString()}!`,
    };
  }
}
