import * as THREE from 'three';
import { NPCData } from '../types/game';
import { PlayerModelFactory, PlayerRig } from './playerModel';

export interface ActiveNPC {
  data: NPCData;
  rig: PlayerRig;
  isRoaming?: boolean;
  waypointIndex?: number;
  waypoints?: { x: number; z: number }[];
  waitTime?: number;
}

export class NPCManager {
  public static getStaticNPCs(): NPCData[] {
    return [
      {
        id: 'elder_adeleke',
        name: 'Elder Adeleke',
        role: 'Community Elder',
        location: { x: 30, y: 0, z: 46 },
        greeting: 'E kaabo! Welcome to Ibadan, my child. The ancient city of brown roofs and golden opportunities.',
        dialogue: {
          text: 'You have arrived safely in our neighborhood. Take your time to know your way around. Visit Iya Moria down at Dugbe Avenue for hot Amala, and meet our people. Life here rewards honest hustle.',
          options: [
            {
              label: 'Thank you Baba, how can I start making a living here?',
              action: 'accept_mission',
              missionId: 'first_steps',
            },
            {
              label: 'Where can I find food and groceries?',
              action: 'talk',
              nextDialogue: 'Down at Dugbe Avenue, you will find Iya Moria’s Buka for hot food, and Mama Shade’s shop for provisions and drinks.',
            },
            {
              label: 'I will explore now, sir. E se pupo!',
              action: 'close',
            },
          ],
        },
      },
      {
        id: 'iya_moria',
        name: 'Iya Moria',
        role: 'Buka Canteen Owner',
        location: { x: -60, y: 0, z: -16 },
        greeting: 'Bawo ni! Welcome to Iya Moria Amala Point! Steaming hot Amala, fresh Ewedu, and tender goat meat ready!',
        shopType: 'buka',
        dialogue: {
          text: 'What are you having today? Or are you looking to earn some extra Naira running deliveries for my canteen?',
          options: [
            {
              label: 'Let me see your food menu (Open Shop)',
              action: 'open_shop',
            },
            {
              label: 'Do you have any deliveries I can do for cash?',
              action: 'accept_mission',
              missionId: 'amala_delivery',
            },
            {
              label: 'Just passing by, ma. Good day!',
              action: 'close',
            },
          ],
        },
      },
      {
        id: 'mama_shade',
        name: 'Mama Shade',
        role: 'Provision Store & POS',
        location: { x: -25, y: 0, z: -16 },
        greeting: 'Good day o! Cold Malta, Zobo, biscuits, recharge cards, and instant cash withdrawal available here!',
        shopType: 'provisions',
        dialogue: {
          text: 'Welcome my friend! We have all household groceries and snacks. Everything fresh and affordable.',
          options: [
            {
              label: 'Check provision goods (Open Shop)',
              action: 'open_shop',
            },
            {
              label: 'How is business in Dugbe today?',
              action: 'talk',
              nextDialogue: 'Market is moving well! Once the Okada riders start moving in the afternoon, Dugbe gets very lively.',
            },
            {
              label: 'Catch you later, Mama!',
              action: 'close',
            },
          ],
        },
      },
      {
        id: 'mr_balogun',
        name: 'Mr. Balogun',
        role: 'Dugbe Dispatch Agent',
        location: { x: 12, y: 0, z: -8 },
        greeting: 'How far! Are you ready to make serious money today? Parcels and packages are waiting for fast dispatch!',
        dialogue: {
          text: 'I run the fastest courier dispatch on Dugbe Avenue. If you have an Okada or car, or even on foot, you can take a delivery run right now for instant payment in your wallet.',
          options: [
            {
              label: 'Accept Express Dispatch Delivery (₦3,500)',
              action: 'accept_mission',
              missionId: 'commercial_dispatch',
            },
            {
              label: 'Accept Quick Neighborhood Errand (₦1,800)',
              action: 'accept_mission',
              missionId: 'freelance_dispatch',
            },
            {
              label: 'I will come back when I am ready.',
              action: 'close',
            },
          ],
        },
      },
      {
        id: 'ade_segun',
        name: 'Ade Segun',
        role: 'Mechanic & Auto Dealership',
        location: { x: 95, y: 0, z: -16 },
        greeting: 'Oga mechanic in the building! You need an Okada, a Micra cab, or vehicle servicing?',
        shopType: 'dealership',
        dialogue: {
          text: 'Welcome to Ade Auto Works! We have durable Boxer 100 Okadas and fuel-efficient Ibadan Micra taxis for sale. With your own ride, you can rule the streets of Oyo State.',
          options: [
            {
              label: 'Inspect vehicles for sale (Dealership)',
              action: 'open_shop',
            },
            {
              label: 'How much does an Okada cost?',
              action: 'talk',
              nextDialogue: 'A solid Boxer Okada is ₦35,000. It pays for itself in just a few days of courier work!',
            },
            {
              label: 'Thanks, I will come back with the money.',
              action: 'close',
            },
          ],
        },
      },
    ];
  }

  public static spawnNPCs(scene: THREE.Scene): ActiveNPC[] {
    const active: ActiveNPC[] = [];

    // 1. Static Key Interactive NPCs
    const staticList = this.getStaticNPCs();
    staticList.forEach((data, index) => {
      const rig = PlayerModelFactory.createPlayer({
        name: data.name,
        gender: 'male',
        outfit: index === 0 ? 'traditional' : 'casual',
        skinTone: index % 2 === 0 ? '#45220c' : '#5a2e12',
        clothingColor: index === 0 ? '#047857' : index === 1 ? '#b91c1c' : '#1e3a8a',
        headwear: index === 0,
      });

      rig.root.position.set(data.location.x, data.location.y, data.location.z);
      // Face towards the road
      rig.root.rotation.y = data.location.z < 0 ? 0 : Math.PI;
      scene.add(rig.root);

      active.push({ data, rig });
    });

    // 2. Roaming Pedestrians
    const pedestrianConfigs = [
      {
        name: 'Tunde Pedestrian',
        startX: -30,
        startZ: 8.5,
        waypoints: [
          { x: -30, z: 8.5 },
          { x: -80, z: 8.5 },
          { x: -30, z: 8.5 },
          { x: 30, z: 8.5 },
        ],
      },
      {
        name: 'Bisi Pedestrian',
        startX: 40,
        startZ: -8.5,
        waypoints: [
          { x: 40, z: -8.5 },
          { x: 90, z: -8.5 },
          { x: 20, z: -8.5 },
        ],
      },
      {
        name: 'Kazeem Resident',
        startX: 0,
        startZ: 30,
        waypoints: [
          { x: 0, z: 30 },
          { x: 0, z: 75 },
          { x: 0, z: 30 },
        ],
      },
    ];

    pedestrianConfigs.forEach((p, idx) => {
      const rig = PlayerModelFactory.createPlayer({
        name: p.name,
        gender: idx % 2 === 0 ? 'male' : 'female',
        outfit: 'casual',
        skinTone: '#3f200d',
        clothingColor: idx === 0 ? '#d97706' : '#7c3aed',
        headwear: false,
      });

      rig.root.position.set(p.startX, 0, p.startZ);
      scene.add(rig.root);

      active.push({
        data: {
          id: `pedestrian_${idx}`,
          name: p.name,
          role: 'Resident',
          location: { x: p.startX, y: 0, z: p.startZ },
          greeting: 'Bawo ni! Enjoy your day in Ibadan.',
          dialogue: {
            text: 'Ibadan is a peaceful city. Just keep pushing your hustle!',
            options: [{ label: 'E se, take care!', action: 'close' }],
          },
        },
        rig,
        isRoaming: true,
        waypointIndex: 0,
        waypoints: p.waypoints,
        waitTime: 0,
      });
    });

    return active;
  }

  public static updateNPCs(npcs: ActiveNPC[], dt: number) {
    npcs.forEach((npc) => {
      if (!npc.isRoaming || !npc.waypoints || npc.waypoints.length === 0) {
        // Idle animation
        PlayerModelFactory.updateAnimation(npc.rig, dt, 'idle');
        return;
      }

      // Roaming logic
      if (npc.waitTime && npc.waitTime > 0) {
        npc.waitTime -= dt;
        PlayerModelFactory.updateAnimation(npc.rig, dt, 'idle');
        return;
      }

      const target = npc.waypoints[npc.waypointIndex || 0];
      const currentPos = npc.rig.root.position;
      const dx = target.x - currentPos.x;
      const dz = target.z - currentPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.5) {
        // Switch to next waypoint
        npc.waypointIndex = ((npc.waypointIndex || 0) + 1) % npc.waypoints.length;
        npc.waitTime = 2.0 + Math.random() * 2.5; // pause for 2-4 seconds
        PlayerModelFactory.updateAnimation(npc.rig, dt, 'idle');
      } else {
        // Walk towards target
        const speed = 1.6;
        const dirX = dx / dist;
        const dirZ = dz / dist;

        currentPos.x += dirX * speed * dt;
        currentPos.z += dirZ * speed * dt;

        npc.rig.root.rotation.y = Math.atan2(dirX, dirZ);
        PlayerModelFactory.updateAnimation(npc.rig, dt, 'walk');
      }
    });
  }
}
