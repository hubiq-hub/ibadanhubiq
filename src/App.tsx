import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterConfig,
  GameState,
  InventoryItem,
  Mission,
  NPCData,
  PlayerLocomotionState,
  PlayerStats,
  SaveGameData,
  SoundSettings,
} from './types/game';
import { CityBuilder, CityWorld } from './world/cityBuilder';
import { InteriorBuilder } from './world/interiors';
import { PlayerModelFactory, PlayerRig } from './entities/playerModel';
import { VehicleModelFactory, VehicleMeshRig } from './entities/vehicleModels';
import { NPCManager, ActiveNPC } from './entities/npcManager';
import { PhysicsSystem, Position3D } from './systems/physics';
import { EconomySystem } from './systems/economySystem';
import { MissionSystem } from './systems/missionSystem';
import { SaveSystem } from './systems/saveSystem';
import { soundEngine } from './audio/soundEngine';

// UI components
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { DialogueModal } from './ui/DialogueModal';
import { ShopModal } from './ui/ShopModal';
import { InventoryModal } from './ui/InventoryModal';
import { PauseModal } from './ui/PauseModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Game UI & State
  const [gameState, setGameState] = useState<GameState>('menu');
  const [activeModal, setActiveModal] = useState<'dialogue' | 'shop' | 'inventory' | 'pause' | null>(null);
  const [activeNPC, setActiveNPC] = useState<NPCData | null>(null);
  const [activeShopType, setActiveShopType] = useState<string>('provisions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Character & Stats
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>({
    name: 'Babatunde',
    gender: 'male',
    outfit: 'traditional',
    skinTone: '#45220c',
    clothingColor: '#047857',
    headwear: true,
  });

  const [stats, setStats] = useState<PlayerStats>({
    money: 2500, // starting cash in Nigerian Naira (₦)
    hunger: 85,
    energy: 90,
    distanceTraveled: 0,
    missionsCompleted: 0,
    deliveriesCompleted: 0,
    itemsBought: 0,
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'food_jollof_starter',
      name: 'Ibadan Jollof Rice Pack',
      category: 'food',
      description: 'Generous pack of jollof rice prepared with local spices.',
      price: 1000,
      hungerRestore: 40,
      energyRestore: 20,
      quantity: 1,
      usable: true,
      icon: '🍛',
    },
    {
      id: 'drink_zobo_starter',
      name: 'Chilled Zobo Bottle',
      category: 'drink',
      description: 'Refreshing hibiscus cold drink.',
      price: 250,
      hungerRestore: 10,
      energyRestore: 25,
      quantity: 2,
      usable: true,
      icon: '🧃',
    },
  ]);

  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [locomotionState, setLocomotionState] = useState<PlayerLocomotionState>('onFoot');
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Sound settings
  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    ambientVolume: 0.5,
  });

  // Player position for minimap & HUD
  const [playerCoord, setPlayerCoord] = useState({ x: -25, z: 42, rotY: Math.PI });

  // Mutable Game Loop State in refs to prevent React re-renders from tearing down WebGL
  const gameLoopRef = useRef({
    playerPos: { x: -25, y: 0, z: 42 } as Position3D,
    playerRotY: Math.PI,
    playerVelY: 0,
    isGrounded: true,
    locomotion: 'onFoot' as PlayerLocomotionState,
    currentVehicleIndex: -1,
    cameraAngle: { yaw: Math.PI, pitch: 0.35, dist: 5.5 },
    input: { x: 0, y: 0, run: false, jump: false },
    vehicles: [] as {
      meshRig: VehicleMeshRig;
      pos: Position3D;
      rotY: number;
      speed: number;
      maxSpeed: number;
      accel: number;
      type: 'okada' | 'micra' | 'keke';
      isPlayerOwned: boolean;
      name: string;
      isTraffic?: boolean;
    }[],
    npcs: [] as ActiveNPC[],
    world: null as CityWorld | null,
    playerRig: null as PlayerRig | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    sunLight: null as THREE.DirectionalLight | null,
    dayTime: 10.0, // starts at 10:00 AM bright daylight
    lastFootstepTime: 0,
    isPointerDown: false,
    pointerStart: { x: 0, y: 0 },
  });

  // Display toast utility
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Initialize or resume initial mission
  useEffect(() => {
    if (!activeMission) {
      const initial = MissionSystem.getInitialMissions()[0];
      initial.status = 'active';
      setActiveMission(initial);
    }
  }, [activeMission]);

  // --- THREE.JS INITIALIZATION & GAME LOOP ---
  useEffect(() => {
    if (!canvasMountRef.current) return;
    const container = canvasMountRef.current;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Scene & Atmospheric Horizon Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x93c5fd); // warm Nigerian sky blue
    scene.fog = new THREE.Fog(0x93c5fd, 45, 145);

    // Realistic PBR reflections for vehicle chrome, paint, and glass
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 280);
    camera.position.set(-25, 3.5, 48);

    // 4. Lighting Rig
    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.6);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 160;
    const d = 40;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Cool ground/sky Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x78350f, 0.7);
    scene.add(hemiLight);

    // 5. Build Ibadan City
    const world = CityBuilder.buildCity();
    scene.add(world.rootGroup);

    // Populate building interiors with 3D props
    world.enterableZones.forEach((zone) => {
      const interiorGroup = InteriorBuilder.buildInterior(zone.type, zone.interiorSpawn);
      scene.add(interiorGroup);
    });

    // 6. Spawn Vehicles
    const vehicles: typeof gameLoopRef.current.vehicles = [];

    // Okada Motorcycle parked outside player's compound
    const okadaMesh = VehicleModelFactory.createOkada('#b91c1c');
    okadaMesh.root.position.set(world.spawnPoints.okada.x, 0, world.spawnPoints.okada.z);
    okadaMesh.root.rotation.y = -Math.PI / 4;
    scene.add(okadaMesh.root);
    vehicles.push({
      meshRig: okadaMesh,
      pos: { x: world.spawnPoints.okada.x, y: 0, z: world.spawnPoints.okada.z },
      rotY: -Math.PI / 4,
      speed: 0,
      maxSpeed: 21, // ~75 km/h
      accel: 16,
      type: 'okada',
      isPlayerOwned: true,
      name: 'Bajaj Boxer 100 Okada',
    });

    // Ibadan Micra Taxi parked along Dugbe Avenue curb
    const micraMesh = VehicleModelFactory.createMicraTaxi();
    micraMesh.root.position.set(world.spawnPoints.micra.x, 0, world.spawnPoints.micra.z);
    micraMesh.root.rotation.y = Math.PI / 2;
    scene.add(micraMesh.root);
    vehicles.push({
      meshRig: micraMesh,
      pos: { x: world.spawnPoints.micra.x, y: 0, z: world.spawnPoints.micra.z },
      rotY: Math.PI / 2,
      speed: 0,
      maxSpeed: 24, // ~86 km/h
      accel: 13,
      type: 'micra',
      isPlayerOwned: false,
      name: 'Ibadan Micra Taxi',
    });

    // Keke Marwa (AI traffic tricycle)
    const kekeMesh = VehicleModelFactory.createKekeMarwa();
    kekeMesh.root.position.set(world.spawnPoints.keke.x, 0, world.spawnPoints.keke.z);
    scene.add(kekeMesh.root);
    vehicles.push({
      meshRig: kekeMesh,
      pos: { x: world.spawnPoints.keke.x, y: 0, z: world.spawnPoints.keke.z },
      rotY: -Math.PI / 2,
      speed: 6.5,
      maxSpeed: 10,
      accel: 6,
      type: 'keke',
      isPlayerOwned: false,
      name: 'Keke Marwa Tricycle',
      isTraffic: true,
    });

    // 7. Spawn NPCs & Pedestrians
    const npcs = NPCManager.spawnNPCs(scene);

    // 8. Spawn Player Model
    const playerRig = PlayerModelFactory.createPlayer(characterConfig);
    playerRig.root.position.set(world.spawnPoints.player.x, 0, world.spawnPoints.player.z);
    scene.add(playerRig.root);

    // 9. 3D In-World Objective Waypoint Beacon (Glowing Golden Column of Light)
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;

    // Golden vertical pillar beam
    const beamGeo = new THREE.CylinderGeometry(0.45, 0.45, 18, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 9;
    beaconGroup.add(beam);

    // Floating 3D golden diamond jewel
    const diamondGeo = new THREE.OctahedronGeometry(0.85);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.85,
      roughness: 0.1,
      metalness: 0.9,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 3.8;
    beaconGroup.add(diamond);

    // Ground target ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.6, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    beaconGroup.add(ring);

    scene.add(beaconGroup);

    // Store refs
    gameLoopRef.current.scene = scene;
    gameLoopRef.current.camera = camera;
    gameLoopRef.current.renderer = renderer;
    gameLoopRef.current.world = world;
    gameLoopRef.current.vehicles = vehicles;
    gameLoopRef.current.npcs = npcs;
    gameLoopRef.current.playerRig = playerRig;
    gameLoopRef.current.sunLight = sunLight;
    gameLoopRef.current.playerPos = { ...world.spawnPoints.player };

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. ANIMATION LOOP
    let animId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.1);
      const state = gameLoopRef.current;

      // Update Day / Night Lighting Cycle
      state.dayTime += dt * 0.05; // 1 real second = ~3 game minutes
      const hour = (state.dayTime % 24);
      const sunAngle = ((hour - 6) / 24) * Math.PI * 2;
      const sunHeight = Math.sin(sunAngle);

      if (sunLight) {
        sunLight.position.x = Math.cos(sunAngle) * 60;
        sunLight.position.y = Math.max(10, sunHeight * 70);
        sunLight.position.z = Math.sin(sunAngle) * 50;
        sunLight.intensity = Math.max(0.1, sunHeight * 1.6);
      }

      // Sky & Streetlight toggle at night
      const isNight = hour < 6 || hour > 19;
      const skyColor = isNight ? 0x0f172a : sunHeight < 0.2 ? 0xf97316 : 0x93c5fd;
      scene.background = new THREE.Color(skyColor);
      if (scene.fog) scene.fog.color.setHex(skyColor);

      world.streetlights.forEach((sl) => {
        sl.intensity = isNight ? 1.5 : 0;
      });

      // Update AI Traffic & NPCs
      NPCManager.updateNPCs(npcs, dt);

      // AI Traffic Movement for Keke
      const trafficKeke = vehicles.find((v) => v.isTraffic);
      if (trafficKeke) {
        // Patrol along Dugbe Avenue between X: -100 and X: 100
        if (trafficKeke.pos.x > 95) trafficKeke.rotY = -Math.PI / 2;
        if (trafficKeke.pos.x < -95) trafficKeke.rotY = Math.PI / 2;
        trafficKeke.pos.x += Math.cos(trafficKeke.rotY) * trafficKeke.speed * dt;
        trafficKeke.meshRig.root.position.x = trafficKeke.pos.x;
        trafficKeke.meshRig.root.position.z = trafficKeke.pos.z;
        trafficKeke.meshRig.root.rotation.y = trafficKeke.rotY;

        // Spin wheels
        trafficKeke.meshRig.wheels.forEach((w) => {
          w.rotation.x += trafficKeke.speed * dt * 2.5;
        });
      }

      // Update In-World 3D Objective Beacon
      if (activeMission && activeMission.status === 'active') {
        const currentStep = activeMission.steps[activeMission.currentStepIndex];
        if (currentStep && currentStep.targetLocation) {
          beaconGroup.position.set(
            currentStep.targetLocation.x,
            0,
            currentStep.targetLocation.z
          );
          beaconGroup.visible = true;
          diamond.rotation.y += 2.0 * dt;
          diamond.position.y = 3.8 + Math.sin(clock.elapsedTime * 3.5) * 0.35;
          ring.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.18);
        } else {
          beaconGroup.visible = false;
        }
      } else {
        beaconGroup.visible = false;
      }

      // --- PLAYER & VEHICLE PHYSICS ---
      if (gameState === 'playing') {
        const inp = state.input;

        if (state.locomotion === 'onFoot') {
          // Walk / Run speed
          const baseSpeed = inp.run ? 7.2 : 3.8;
          const isMoving = Math.abs(inp.x) > 0.05 || Math.abs(inp.y) > 0.05;

          if (isMoving) {
            // Camera-relative movement (with -inp.x so joystick right moves right, joystick left moves left)
            const angle = Math.atan2(-inp.x, inp.y) + state.cameraAngle.yaw;
            state.playerRotY = angle;

            const dx = Math.sin(angle) * baseSpeed * dt;
            const dz = Math.cos(angle) * baseSpeed * dt;

            state.playerPos = PhysicsSystem.moveWithCollision(
              state.playerPos,
              dx,
              dz,
              0.45,
              world.colliders
            );

            // Footstep audio cadence
            if (clock.elapsedTime - state.lastFootstepTime > (inp.run ? 0.28 : 0.44)) {
              soundEngine.playFootstep(inp.run);
              state.lastFootstepTime = clock.elapsedTime;
            }

            // Animate walking / running
            PlayerModelFactory.updateAnimation(playerRig, dt, inp.run ? 'run' : 'walk');
          } else {
            PlayerModelFactory.updateAnimation(playerRig, dt, 'idle');
          }

          // Jump handling
          if (inp.jump && state.isGrounded) {
            state.playerVelY = 5.2;
            state.isGrounded = false;
            soundEngine.playJump();
          }

          if (!state.isGrounded) {
            state.playerVelY -= 15.0 * dt; // gravity
            state.playerPos.y += state.playerVelY * dt;
            if (state.playerPos.y <= 0) {
              state.playerPos.y = 0;
              state.playerVelY = 0;
              state.isGrounded = true;
            }
            PlayerModelFactory.updateAnimation(playerRig, dt, 'jump');
          }

          // Position player mesh
          playerRig.root.position.set(state.playerPos.x, state.playerPos.y, state.playerPos.z);
          playerRig.root.rotation.y = state.playerRotY;
          playerRig.root.visible = true;

          // Check proximity for interaction prompts
          let foundPrompt: string | null = null;

          // 1. Vehicles
          vehicles.forEach((v, idx) => {
            if (v.isTraffic) return;
            const dist = Math.hypot(v.pos.x - state.playerPos.x, v.pos.z - state.playerPos.z);
            if (dist < 2.5) {
              foundPrompt = `Press E to Ride ${v.name}`;
            }
          });

          // 2. NPCs
          if (!foundPrompt) {
            npcs.forEach((npc) => {
              const dist = Math.hypot(
                npc.rig.root.position.x - state.playerPos.x,
                npc.rig.root.position.z - state.playerPos.z
              );
              if (dist < 3.2) {
                foundPrompt = `Press E to Talk to ${npc.data.name}`;
              }
            });
          }

          // 3. Enterable Shop / Home Doors
          if (!foundPrompt) {
            world.enterableZones.forEach((zone) => {
              const tb = zone.triggerBox;
              if (
                state.playerPos.x >= tb.minX &&
                state.playerPos.x <= tb.maxX &&
                state.playerPos.z >= tb.minZ &&
                state.playerPos.z <= tb.maxZ
              ) {
                foundPrompt = `Press E to Enter ${zone.name}`;
              }
            });
          }

          setInteractionPrompt(foundPrompt);
        } else {
          // --- VEHICLE DRIVING CONTROLS ---
          const currentVehicle = vehicles[state.currentVehicleIndex];
          if (currentVehicle) {
            const throttle = inp.y; // +1 forward, -1 reverse
            const steer = inp.x; // -1 left, +1 right

            const updated = PhysicsSystem.updateVehiclePhysics(
              currentVehicle.pos,
              currentVehicle.rotY,
              currentVehicle.speed,
              throttle,
              steer,
              dt,
              currentVehicle.maxSpeed,
              currentVehicle.accel,
              currentVehicle.type === 'okada' ? 0.7 : 1.2,
              world.colliders
            );

            currentVehicle.pos = updated.newPos;
            currentVehicle.rotY = updated.newRotY;
            currentVehicle.speed = updated.newSpeed;

            // Update 3D mesh position
            currentVehicle.meshRig.root.position.set(
              currentVehicle.pos.x,
              currentVehicle.pos.y,
              currentVehicle.pos.z
            );
            currentVehicle.meshRig.root.rotation.y = currentVehicle.rotY;

            // Spin wheels
            currentVehicle.meshRig.wheels.forEach((w) => {
              w.rotation.x += currentVehicle.speed * dt * 2.5;
            });

            // Synchronize player position with vehicle
            state.playerPos = { ...currentVehicle.pos };
            state.playerRotY = currentVehicle.rotY;

            // Attach player rig to vehicle in riding posture
            if (currentVehicle.type === 'okada') {
              const okadaOffsetZ = -0.38;
              playerRig.root.position.set(
                currentVehicle.pos.x - Math.sin(currentVehicle.rotY) * okadaOffsetZ,
                currentVehicle.pos.y + 0.18,
                currentVehicle.pos.z - Math.cos(currentVehicle.rotY) * okadaOffsetZ
              );
              playerRig.root.rotation.y = currentVehicle.rotY;
              playerRig.root.visible = true;
              PlayerModelFactory.updateAnimation(playerRig, dt, 'riding');
            } else {
              // Inside car / tricycle cabin
              playerRig.root.visible = false;
            }

            // Vehicle engine sound updates
            soundEngine.updateVehicleEngine(Math.abs(currentVehicle.speed) / currentVehicle.maxSpeed);

            setInteractionPrompt('Press F to Exit Vehicle');
          }
        }

        // Check active mission objective completion
        if (activeMission && activeMission.status === 'active') {
          const res = MissionSystem.checkStepProgress(
            activeMission,
            state.playerPos.x,
            state.playerPos.z
          );
          if (res.updated) {
            if (res.completed) {
              soundEngine.playMissionComplete();
              soundEngine.playCoin();
              showToast(`Mission Completed: ${activeMission.title}! Earned ₦${activeMission.rewardMoney.toLocaleString()}`);
              setStats((prev) => ({
                ...prev,
                money: prev.money + activeMission.rewardMoney,
                missionsCompleted: prev.missionsCompleted + 1,
              }));
              // Offer next freelance dispatch
              setTimeout(() => {
                const nextM = MissionSystem.generateFreelanceMission();
                setActiveMission(nextM);
                showToast(`New Job Available: ${nextM.title}`);
              }, 4000);
            } else {
              soundEngine.playCoin();
              showToast(`Objective updated: ${activeMission.steps[activeMission.currentStepIndex].text}`);
            }
          }
        }

        // Hunger & Energy gradual depletion
        setStats((prev) => {
          const hungerDecay = (inp.run ? 0.012 : 0.005) * dt;
          const energyDecay = (inp.run ? 0.018 : 0.006) * dt;
          return {
            ...prev,
            hunger: Math.max(0, prev.hunger - hungerDecay),
            energy: Math.max(0, prev.energy - energyDecay),
            distanceTraveled: prev.distanceTraveled + (state.locomotion === 'onFoot' && (Math.abs(inp.x) > 0.1 || Math.abs(inp.y) > 0.1) ? dt * 4 : 0),
          };
        });

        // Update player coordinates for Minimap
        setPlayerCoord({
          x: state.playerPos.x,
          z: state.playerPos.z,
          rotY: state.cameraAngle.yaw,
        });

        // --- THIRD-PERSON CAMERA ORBIT & FOLLOW ---
        const targetDist = state.locomotion === 'onFoot' ? 5.8 : 8.8;
        const camYOffset = state.locomotion === 'onFoot' ? 2.0 : 2.5;

        const camX = state.playerPos.x - Math.sin(state.cameraAngle.yaw) * targetDist * Math.cos(state.cameraAngle.pitch);
        const camZ = state.playerPos.z - Math.cos(state.cameraAngle.yaw) * targetDist * Math.cos(state.cameraAngle.pitch);
        const camY = Math.max(0.6, state.playerPos.y + camYOffset + Math.sin(state.cameraAngle.pitch) * targetDist);

        // Smooth exponential damping
        camera.position.x += (camX - camera.position.x) * 0.12;
        camera.position.y += (camY - camera.position.y) * 0.12;
        camera.position.z += (camZ - camera.position.z) * 0.12;

        camera.lookAt(state.playerPos.x, state.playerPos.y + 1.2, state.playerPos.z);
      }

      renderer.render(scene, camera);
    };

    tick();

    // 10. INPUT LISTENERS (KEYBOARD & TOUCH CAMERA DRAG)
    const handleKeyDown = (e: KeyboardEvent) => {
      soundEngine.resumeContext();
      const input = gameLoopRef.current.input;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          input.y = 1;
          break;
        case 'KeyS':
        case 'ArrowDown':
          input.y = -1;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          input.x = -1;
          break;
        case 'KeyD':
        case 'ArrowRight':
          input.x = 1;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          input.run = true;
          setIsRunning(true);
          break;
        case 'Space':
          input.jump = true;
          break;
        case 'KeyE':
          handleInteractAction();
          break;
        case 'KeyF':
          handleExitVehicleAction();
          break;
        case 'KeyH':
          handleHornAction();
          break;
        case 'KeyI':
          setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
          break;
        case 'Escape':
          setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
          setActiveModal((prev) => (prev === 'pause' ? null : 'pause'));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const input = gameLoopRef.current.input;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'KeyS':
        case 'ArrowDown':
          input.y = 0;
          break;
        case 'KeyA':
        case 'ArrowLeft':
        case 'KeyD':
        case 'ArrowRight':
          input.x = 0;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          input.run = false;
          setIsRunning(false);
          break;
        case 'Space':
          input.jump = false;
          break;
      }
    };

    // Camera orbit touch / mouse drag
    const onMouseDown = (e: MouseEvent) => {
      gameLoopRef.current.isPointerDown = true;
      gameLoopRef.current.pointerStart = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!gameLoopRef.current.isPointerDown) return;
      const dx = e.clientX - gameLoopRef.current.pointerStart.x;
      const dy = e.clientY - gameLoopRef.current.pointerStart.y;
      gameLoopRef.current.pointerStart = { x: e.clientX, y: e.clientY };

      const cam = gameLoopRef.current.cameraAngle;
      cam.yaw -= dx * 0.005;
      cam.pitch = Math.max(0.05, Math.min(1.2, cam.pitch + dy * 0.005));
    };

    const onMouseUp = () => {
      gameLoopRef.current.isPointerDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [gameState, characterConfig]);

  // --- ACTIONS ---

  const handleInteractAction = useCallback(() => {
    soundEngine.resumeContext();
    const state = gameLoopRef.current;
    if (state.locomotion !== 'onFoot') return;

    // 1. Check vehicle mount proximity
    const vehicleIdx = state.vehicles.findIndex((v) => {
      if (v.isTraffic) return false;
      const dist = Math.hypot(v.pos.x - state.playerPos.x, v.pos.z - state.playerPos.z);
      return dist < 2.5;
    });

    if (vehicleIdx >= 0) {
      const v = state.vehicles[vehicleIdx];
      state.currentVehicleIndex = vehicleIdx;
      state.locomotion = v.type === 'okada' ? 'ridingOkada' : 'drivingCar';
      setLocomotionState(state.locomotion);
      soundEngine.startVehicleEngine(v.type === 'okada' ? 'okada' : 'micra');
      showToast(`Mounted ${v.name}! Use WASD/Joystick to drive, H to honk, F to exit.`);
      return;
    }

    // 2. Check NPC proximity
    const npc = state.npcs.find((n) => {
      const dist = Math.hypot(
        n.rig.root.position.x - state.playerPos.x,
        n.rig.root.position.z - state.playerPos.z
      );
      return dist < 3.2;
    });

    if (npc) {
      setActiveNPC(npc.data);
      setActiveModal('dialogue');
      return;
    }

    // 3. Check enterable door
    if (state.world) {
      const zone = state.world.enterableZones.find((z) => {
        const tb = z.triggerBox;
        return (
          state.playerPos.x >= tb.minX &&
          state.playerPos.x <= tb.maxX &&
          state.playerPos.z >= tb.minZ &&
          state.playerPos.z <= tb.maxZ
        );
      });

      if (zone) {
        soundEngine.playDoor();
        if (zone.type === 'home') {
          showToast(`Welcome home! Restored energy.`);
          setStats((prev) => ({ ...prev, energy: 100 }));
        } else {
          setActiveShopType(zone.type);
          setActiveModal('shop');
        }
      }
    }
  }, [showToast]);

  const handleExitVehicleAction = useCallback(() => {
    const state = gameLoopRef.current;
    if (state.locomotion === 'onFoot') return;

    const currentV = state.vehicles[state.currentVehicleIndex];
    if (currentV) {
      soundEngine.stopVehicleEngine();
      // Step off to the side of the vehicle
      state.playerPos.x += Math.cos(currentV.rotY) * 1.5;
      state.playerPos.z -= Math.sin(currentV.rotY) * 1.5;
      state.locomotion = 'onFoot';
      setLocomotionState('onFoot');
      if (state.playerRig) {
        state.playerRig.root.visible = true;
      }
      showToast(`Dismounted ${currentV.name}.`);
    }
  }, [showToast]);

  const handleHornAction = useCallback(() => {
    soundEngine.playHorn();
  }, []);

  const handleJumpAction = useCallback(() => {
    const state = gameLoopRef.current;
    if (state.locomotion === 'onFoot' && state.isGrounded) {
      state.playerVelY = 5.2;
      state.isGrounded = false;
      soundEngine.playJump();
    }
  }, []);

  const handleToggleRun = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      gameLoopRef.current.input.run = next;
      return next;
    });
  }, []);

  const handleJoystickMove = useCallback((inp: { x: number; y: number }) => {
    gameLoopRef.current.input.x = inp.x;
    gameLoopRef.current.input.y = inp.y;
  }, []);

  // Shop Buying
  const handleBuyItem = (item: InventoryItem) => {
    soundEngine.resumeContext();
    const result = EconomySystem.buyItem(stats.money, inventory, item);
    if (result.success) {
      soundEngine.playCoin();
      setStats((prev) => ({ ...prev, money: result.newMoney, itemsBought: prev.itemsBought + 1 }));
      setInventory(result.newInventory);
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  // Consume / Use inventory item
  const handleUseItem = (item: InventoryItem) => {
    soundEngine.resumeContext();
    if (!item.usable) return;

    soundEngine.playCoin();
    setStats((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + (item.hungerRestore || 0)),
      energy: Math.min(100, prev.energy + (item.energyRestore || 0)),
    }));

    setInventory((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx < 0) return prev;
      const copy = [...prev];
      if (copy[idx].quantity > 1) {
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity - 1 };
      } else {
        copy.splice(idx, 1);
      }
      return copy;
    });

    showToast(`Consumed ${item.name}! Replenished stats.`);
  };

  // Save Progress
  const handleSaveGame = () => {
    const state = gameLoopRef.current;
    const saveData: SaveGameData = {
      version: 1,
      timestamp: Date.now(),
      character: characterConfig,
      position: { ...state.playerPos },
      rotationY: state.playerRotY,
      stats,
      inventory,
      activeMissionId: activeMission?.id || null,
      completedMissionIds: [],
      ownedVehicles: ['okada_starter'],
    };
    SaveSystem.saveGame(saveData);
  };

  // Unstuck Safe Teleport
  const handleUnstuck = () => {
    const state = gameLoopRef.current;
    state.playerPos = { x: 0, y: 0, z: 20 }; // Safe spot on open road
    state.locomotion = 'onFoot';
    setLocomotionState('onFoot');
    soundEngine.stopVehicleEngine();
    showToast('Unstuck! Teleported safely to Bodija road.');
  };

  // Start New Game from Menu
  const handleStartNewGame = (char: CharacterConfig) => {
    soundEngine.resumeContext();
    setCharacterConfig(char);
    setGameState('playing');
    showToast(`Welcome to Ibadan, ${char.name}! Explore the city.`);
  };

  // Continue Saved Game
  const handleContinueGame = () => {
    soundEngine.resumeContext();
    const saved = SaveSystem.loadGame();
    if (saved) {
      setCharacterConfig(saved.character);
      setStats(saved.stats);
      setInventory(saved.inventory);
      const state = gameLoopRef.current;
      state.playerPos = { ...saved.position };
      state.playerRotY = saved.rotationY;
      setGameState('playing');
      showToast(`Welcome back, ${saved.character.name}! Game loaded.`);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 font-sans touch-none select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Main Menu Overlay */}
      {gameState === 'menu' && (
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
        />
      )}

      {/* Active In-Game HUD */}
      {gameState === 'playing' && (
        <HUD
          stats={stats}
          characterName={characterConfig.name}
          locomotionState={locomotionState}
          activeMission={activeMission}
          interactionPrompt={interactionPrompt}
          playerX={playerCoord.x}
          playerZ={playerCoord.z}
          playerRotY={playerCoord.rotY}
          toastMessage={toastMessage}
          onInteract={handleInteractAction}
          onExitVehicle={handleExitVehicleAction}
          onHonkHorn={handleHornAction}
          onJump={handleJumpAction}
          onToggleRun={handleToggleRun}
          isRunning={isRunning}
          onOpenInventory={() => setActiveModal('inventory')}
          onPause={() => setActiveModal('pause')}
          onJoystickMove={handleJoystickMove}
        />
      )}

      {/* Dialogue Modal */}
      {activeModal === 'dialogue' && activeNPC && (
        <DialogueModal
          npc={activeNPC}
          onClose={() => setActiveModal(null)}
          onOpenShop={(shopType) => {
            setActiveShopType(shopType);
            setActiveModal('shop');
          }}
          onAcceptMission={(missionId) => {
            const missions = MissionSystem.getInitialMissions();
            const found = missions.find((m) => m.id === missionId);
            if (found) {
              found.status = 'active';
              setActiveMission(found);
              soundEngine.playCoin();
              showToast(`Accepted Mission: ${found.title}!`);
            }
          }}
        />
      )}

      {/* Shop Modal */}
      {activeModal === 'shop' && (
        <ShopModal
          shopType={activeShopType}
          playerMoney={stats.money}
          onBuyItem={handleBuyItem}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Personal Inventory Modal */}
      {activeModal === 'inventory' && (
        <InventoryModal
          inventory={inventory}
          onUseItem={handleUseItem}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Pause Menu Modal */}
      {activeModal === 'pause' && (
        <PauseModal
          onResume={() => setActiveModal(null)}
          onSave={handleSaveGame}
          onUnstuck={() => {
            handleUnstuck();
            setActiveModal(null);
          }}
          onMainMenu={() => {
            setActiveModal(null);
            setGameState('menu');
          }}
          soundSettings={soundSettings}
          onUpdateSoundSettings={setSoundSettings}
        />
      )}
    </div>
  );
}
