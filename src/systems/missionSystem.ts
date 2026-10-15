import { Mission } from '../types/game';

export class MissionSystem {
  public static getInitialMissions(): Mission[] {
    return [
      {
        id: 'first_steps',
        title: 'First Steps in Ibadan',
        description: 'Explore your new neighborhood, find Iya Moria’s Buka at Dugbe Avenue, and return to Elder Adeleke.',
        giver: 'Elder Adeleke',
        rewardMoney: 2000,
        status: 'available',
        currentStepIndex: 0,
        steps: [
          {
            text: 'Head south along the road to Dugbe Avenue commercial strip.',
            targetLocation: { x: 0, z: 0, name: 'Dugbe Roundabout' },
            completed: false,
          },
          {
            text: 'Visit Iya Moria Amala Buka (West on Dugbe Avenue).',
            targetLocation: { x: -60, z: -16, name: 'Iya Moria Buka' },
            completed: false,
          },
          {
            text: 'Return to Elder Adeleke at the family compound for your welcoming reward.',
            targetLocation: { x: 30, z: 46, name: "Elder Adeleke's Compound" },
            completed: false,
          },
        ],
      },
      {
        id: 'amala_delivery',
        title: 'The Hot Amala Run',
        description: 'Collect a fresh food parcel from Iya Moria and rush it across town to Ade the Mechanic before it gets cold.',
        giver: 'Iya Moria',
        rewardMoney: 2500,
        status: 'available',
        currentStepIndex: 0,
        steps: [
          {
            text: 'Collect the steaming Amala parcel from Iya Moria.',
            targetLocation: { x: -60, z: -16, name: 'Iya Moria Buka' },
            completed: false,
          },
          {
            text: 'Ride or drive East along Dugbe Avenue to Ade Mechanic Workshop.',
            targetLocation: { x: 95, z: -16, name: 'Ade Mechanic Workshop' },
            completed: false,
          },
          {
            text: 'Hand over the food packet to Ade Segun.',
            targetLocation: { x: 95, z: -16, name: 'Ade Segun' },
            completed: false,
          },
        ],
      },
      {
        id: 'commercial_dispatch',
        title: 'Commercial Dispatch Express',
        description: 'Courier an important business consignment from Dugbe Dispatch agent to the Modern Residence in Bodija.',
        giver: 'Mr. Balogun',
        rewardMoney: 3500,
        status: 'available',
        currentStepIndex: 0,
        steps: [
          {
            text: 'Collect the sealed dispatch envelope from Mr. Balogun.',
            targetLocation: { x: 12, z: -8, name: 'Dugbe Dispatch Agent' },
            completed: false,
          },
          {
            text: 'Travel North to the Modern Villa compound in Bodija.',
            targetLocation: { x: 30, z: 85, name: 'Modern Villa' },
            completed: false,
          },
          {
            text: 'Complete the delivery at the gate.',
            targetLocation: { x: 30, z: 85, name: 'Modern Villa Gate' },
            completed: false,
          },
        ],
      },
    ];
  }

  public static generateFreelanceMission(): Mission {
    const locations = [
      { x: -95, z: -24, name: 'Bovas Filling Station' },
      { x: -60, z: -16, name: 'Iya Moria Buka' },
      { x: -25, z: -16, name: 'Mama Shade Provisions' },
      { x: 20, z: -16, name: 'Dugbe Tech' },
      { x: 55, z: -16, name: 'HealthFirst Chemist' },
      { x: 95, z: -16, name: 'Ade Auto Works' },
      { x: -25, z: 85, name: 'Bodija Bungalow' },
      { x: 30, z: 85, name: 'Modern Villa' },
    ];

    const origin = locations[Math.floor(Math.random() * locations.length)];
    let destination = locations[Math.floor(Math.random() * locations.length)];
    while (destination.name === origin.name) {
      destination = locations[Math.floor(Math.random() * locations.length)];
    }

    const reward = 1800 + Math.floor(Math.random() * 5) * 300;

    return {
      id: `freelance_${Date.now()}`,
      title: `Express Dispatch to ${destination.name}`,
      description: `Pick up urgent goods at ${origin.name} and deliver swiftly to ${destination.name}.`,
      giver: 'Mr. Balogun',
      rewardMoney: reward,
      status: 'active',
      currentStepIndex: 0,
      isRepeatable: true,
      steps: [
        {
          text: `Collect package from ${origin.name}.`,
          targetLocation: origin,
          completed: false,
        },
        {
          text: `Deliver package to ${destination.name}.`,
          targetLocation: destination,
          completed: false,
        },
      ],
    };
  }

  /**
   * Checks if player is within waypoint radius (typically 4.5 meters)
   */
  public static checkStepProgress(
    mission: Mission,
    playerX: number,
    playerZ: number
  ): { updated: boolean; completed: boolean } {
    if (mission.status !== 'active') return { updated: false, completed: false };

    const currentStep = mission.steps[mission.currentStepIndex];
    if (!currentStep || !currentStep.targetLocation) return { updated: false, completed: false };

    const dx = playerX - currentStep.targetLocation.x;
    const dz = playerZ - currentStep.targetLocation.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 5.0) {
      currentStep.completed = true;
      if (mission.currentStepIndex + 1 < mission.steps.length) {
        mission.currentStepIndex++;
        return { updated: true, completed: false };
      } else {
        mission.status = 'completed';
        return { updated: true, completed: true };
      }
    }

    return { updated: false, completed: false };
  }
}
