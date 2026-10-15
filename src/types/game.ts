export type GameState = 'menu' | 'character_select' | 'intro' | 'playing' | 'paused';

export type CharacterGender = 'male' | 'female';
export type CharacterOutfit = 'traditional' | 'casual' | 'rider';

export interface CharacterConfig {
  name: string;
  gender: CharacterGender;
  outfit: CharacterOutfit;
  skinTone: string;
  clothingColor: string;
  headwear: boolean;
}

export interface PlayerStats {
  money: number; // in Nigerian Naira (₦)
  hunger: number; // 0 to 100
  energy: number; // 0 to 100
  distanceTraveled: number;
  missionsCompleted: number;
  deliveriesCompleted: number;
  itemsBought: number;
}

export type PlayerLocomotionState = 'onFoot' | 'ridingOkada' | 'drivingCar';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'food' | 'drink' | 'clothing' | 'tech' | 'quest' | 'vehicle';
  description: string;
  price: number; // in ₦
  hungerRestore?: number;
  energyRestore?: number;
  quantity: number;
  usable: boolean;
  icon: string;
}

export type MissionStatus = 'available' | 'active' | 'completed';

export interface MissionStep {
  text: string;
  targetLocation?: { x: number; z: number; name: string };
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  giver: string;
  rewardMoney: number;
  status: MissionStatus;
  currentStepIndex: number;
  steps: MissionStep[];
  isRepeatable?: boolean;
}

export interface NPCData {
  id: string;
  name: string;
  role: string;
  location: { x: number; y: number; z: number };
  greeting: string;
  dialogue: {
    text: string;
    options: {
      label: string;
      action?: 'open_shop' | 'accept_mission' | 'talk' | 'close' | 'dealership';
      nextDialogue?: string;
      missionId?: string;
    }[];
  };
  shopType?: 'buka' | 'provisions' | 'tech' | 'chemist' | 'dealership';
}

export interface VehicleData {
  id: string;
  type: 'okada' | 'micra' | 'keke';
  name: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  isPlayerOwned: boolean;
  isOccupied: boolean;
}

export interface SaveGameData {
  version: number;
  timestamp: number;
  character: CharacterConfig;
  position: { x: number; y: number; z: number };
  rotationY: number;
  stats: PlayerStats;
  inventory: InventoryItem[];
  activeMissionId: string | null;
  completedMissionIds: string[];
  ownedVehicles: string[];
}

export interface SoundSettings {
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
}
