import * as THREE from 'three';
import { TextureGenerator } from './textures';

export interface Collider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name: string;
}

export interface EnterableZone {
  name: string;
  type: 'home' | 'buka' | 'provisions' | 'mechanic' | 'chemist' | 'tech';
  triggerBox: { minX: number; maxX: number; minZ: number; maxZ: number };
  interiorSpawn: { x: number; y: number; z: number };
  exteriorSpawn: { x: number; y: number; z: number };
}

export interface CityWorld {
  rootGroup: THREE.Group;
  colliders: Collider[];
  enterableZones: EnterableZone[];
  streetlights: THREE.PointLight[];
  spawnPoints: {
    player: { x: number; y: number; z: number };
    okada: { x: number; y: number; z: number };
    micra: { x: number; y: number; z: number };
    keke: { x: number; y: number; z: number };
  };
}

export class CityBuilder {
  public static buildCity(): CityWorld {
    const root = new THREE.Group();
    const colliders: Collider[] = [];
    const enterableZones: EnterableZone[] = [];
    const streetlights: THREE.PointLight[] = [];

    // 1. TERRAIN & GROUND
    // Broad terrain base (Laterite Red Soil)
    const lateriteTex = TextureGenerator.getLateriteSoilTexture();
    lateriteTex.repeat.set(24, 24);
    const terrainGeo = new THREE.PlaneGeometry(300, 300);
    const terrainMat = new THREE.MeshStandardMaterial({
      map: lateriteTex,
      roughness: 0.9,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    root.add(terrain);

    // 2. MAIN ASPHALT BOULEVARD (Dugbe Avenue)
    // Running East-West from X = -120 to +120, width 14m (Z from -7 to +7)
    const asphaltTex = TextureGenerator.getAsphaltRoadTexture();
    asphaltTex.repeat.set(12, 1);
    const roadGeo = new THREE.PlaneGeometry(240, 14);
    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.8,
      metalness: 0.1,
    });
    const mainRoad = new THREE.Mesh(roadGeo, roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.02, 0); // slightly above laterite to avoid z-fighting
    mainRoad.receiveShadow = true;
    root.add(mainRoad);

    // Connecting Cross Road (North-South, towards Bodija Residential)
    // X from -6 to +6, Z from 7 to 100
    const crossRoadGeo = new THREE.PlaneGeometry(12, 90);
    const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.02, 52);
    crossRoad.receiveShadow = true;
    root.add(crossRoad);

    // Concrete Sidewalks & Curbs
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.85,
    });
    // South sidewalk along main road
    const southCurbGeo = new THREE.BoxGeometry(240, 0.25, 2.5);
    const southCurb = new THREE.Mesh(southCurbGeo, concreteMat);
    southCurb.position.set(0, 0.125, -8.25);
    southCurb.receiveShadow = true;
    root.add(southCurb);

    // North sidewalks (broken by cross road)
    const northCurbLeft = new THREE.Mesh(new THREE.BoxGeometry(110, 0.25, 2.5), concreteMat);
    northCurbLeft.position.set(-61, 0.125, 8.25);
    root.add(northCurbLeft);

    const northCurbRight = new THREE.Mesh(new THREE.BoxGeometry(110, 0.25, 2.5), concreteMat);
    northCurbRight.position.set(61, 0.125, 8.25);
    root.add(northCurbRight);

    // 3. ROADSIDE DRAINAGE GUTTERS (Open concrete gutters with crossing slabs)
    const gutterMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.9 });
    const gutterSouth = new THREE.Mesh(new THREE.BoxGeometry(240, 0.35, 1.0), gutterMat);
    gutterSouth.position.set(0, 0.05, -10);
    root.add(gutterSouth);

    // Gutter crossing slabs for pedestrian entrances
    const slabGeo = new THREE.BoxGeometry(3.5, 0.15, 1.4);
    const slabMat = new THREE.MeshStandardMaterial({ color: 0xc4b5fd, roughness: 0.8 });
    [-60, -25, 20, 65].forEach((x) => {
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(x, 0.2, -10);
      root.add(slab);
    });

    // 4. CENTRAL ROUNDABOUT MONUMENT
    const roundaboutMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }); // grassy green center
    const roundaboutCenter = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.4, 24), roundaboutMat);
    roundaboutCenter.position.set(0, 0.2, 0);
    root.add(roundaboutCenter);

    // Commemorative Monument Obelisk in center
    const obeliskMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.2 });
    const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 5.0, 4), obeliskMat);
    obelisk.position.set(0, 2.7, 0);
    obelisk.castShadow = true;
    root.add(obelisk);

    colliders.push({ minX: -3.5, maxX: 3.5, minZ: -3.5, maxZ: 3.5, name: 'Roundabout Monument' });

    // 5. BUILDINGS - COMMERCIAL STRIP (South side of Dugbe Avenue, Z < -12)

    // A. IYA MORIA AMALA BUKA & FOOD POINT (X: -60, Z: -22)
    this.buildAmalaBuka(root, colliders, enterableZones, -60, -22);

    // B. MAMA SHADE PROVISIONS & POS (X: -25, Z: -22)
    this.buildProvisionStore(root, colliders, enterableZones, -25, -22);

    // C. DUGBE TECH & PHONE REPAIRS (X: 20, Z: -22)
    this.buildTechStore(root, colliders, enterableZones, 20, -22);

    // D. HEALTHFIRST PHARMACY & CHEMIST (X: 55, Z: -22)
    this.buildPharmacy(root, colliders, enterableZones, 55, -22);

    // E. ADE MECHANIC WORKSHOP & AUTO DEALERSHIP (X: 95, Z: -24)
    this.buildMechanicWorkshop(root, colliders, enterableZones, 95, -24);

    // F. BOVAS / HUBIQ FILLING STATION (X: -95, Z: -24)
    this.buildFillingStation(root, colliders, -95, -24);

    // 6. RESIDENTIAL NEIGHBORHOOD (North of Cross Road, Z > 25)

    // A. PLAYER'S STARTING COMPOUND & BUNGALOW (X: -25, Z: 50)
    this.buildPlayerResidence(root, colliders, enterableZones, -25, 50);

    // B. ELDER ADELEKE'S FAMILY COMPOUND (X: 30, Z: 50)
    this.buildFamilyCompound(root, colliders, 30, 50, "Elder Adeleke's Compound");

    // C. MODERN MULTI-STOREY RESIDENCE (X: 30, Z: 85)
    this.buildModernResidence(root, colliders, 30, 85);

    // D. MODEST COMPOUND HOUSES (X: -25, Z: 85)
    this.buildModestCompound(root, colliders, -25, 85);

    // 7. STREETLIGHTS & NEPA ELECTRIC POLES
    this.buildStreetlightsAndPoles(root, colliders, streetlights);

    // 8. TROPICAL VEGETATION (Palm trees, mango trees, and shrubs)
    this.buildVegetation(root, colliders);

    return {
      rootGroup: root,
      colliders,
      enterableZones,
      streetlights,
      spawnPoints: {
        player: { x: -25, y: 0, z: 42 }, // Outside starting residence gate
        okada: { x: -28, y: 0, z: 40 }, // Parked right outside compound
        micra: { x: 10, y: 0, z: -4 }, // Parked along Dugbe Avenue curb
        keke: { x: -15, y: 0, z: 4 }, // Parked at commercial junction
      },
    };
  }

  // --- BUILDING CONSTRUCTORS ---

  private static buildAmalaBuka(
    root: THREE.Group,
    colliders: Collider[],
    enterables: EnterableZone[],
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Wall texture and roof texture
    const wallTex = TextureGenerator.getSandcreteWallTexture('#fde047'); // vibrant yellow paint
    const roofTex = TextureGenerator.getCorrugatedRoofTexture();
    roofTex.repeat.set(4, 3);

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.85 });

    // Main building structure (14m wide x 10m deep x 4.2m high)
    const buildingGeo = new THREE.BoxGeometry(14, 4.2, 10);
    const buildingMesh = new THREE.Mesh(buildingGeo, wallMat);
    buildingMesh.position.set(0, 2.1, 0);
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    group.add(buildingMesh);

    // Corrugated Gable Roof
    const roofGeo = new THREE.ConeGeometry(9.5, 2.5, 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, 5.2, 0);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    group.add(roofMesh);

    // Signboard
    const signTex = TextureGenerator.getSignboardTexture(
      'IYA MORIA AMALA BUKA',
      'Hot Amala, Ewedu, Gbegiri & Ogunfe',
      '#78350f',
      '#ffffff',
      '#facc15'
    );
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(8, 2.0, 0.2),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 })
    );
    sign.position.set(0, 3.8, 5.15);
    group.add(sign);

    // Doorway opening (dark recessed entrance)
    const doorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
    );
    doorMesh.position.set(0, 1.5, 5.02);
    group.add(doorMesh);

    // Outdoor veranda canopy & dining tables
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 4), canopyMat);
    canopy.position.set(0, 3.2, 7.2);
    group.add(canopy);

    // Canopy support posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.5 });
    [-5.5, 5.5].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), postMat);
      post.position.set(px, 1.6, 9.0);
      group.add(post);
    });

    // Outdoor plastic chairs and tables
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // blue plastic table
    [-3, 3].forEach((tx) => {
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.9, 12), tableMat);
      table.position.set(tx, 0.45, 7.2);
      group.add(table);
    });

    root.add(group);

    // Register solid collider
    colliders.push({
      minX: x - 7.2,
      maxX: x + 7.2,
      minZ: z - 5.2,
      maxZ: z + 5.2,
      name: 'Iya Moria Amala Buka',
    });

    // Register enterable interior zone
    enterables.push({
      name: 'Iya Moria Amala Buka',
      type: 'buka',
      triggerBox: { minX: x - 2.5, maxX: x + 2.5, minZ: z + 4.5, maxZ: z + 8.5 },
      interiorSpawn: { x: x, y: 0.2, z: z + 2 },
      exteriorSpawn: { x: x, y: 0.1, z: z + 6.5 },
    });
  }

  private static buildProvisionStore(
    root: THREE.Group,
    colliders: Collider[],
    enterables: EnterableZone[],
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const wallTex = TextureGenerator.getSandcreteWallTexture('#e0e7ff'); // light blue
    const roofTex = TextureGenerator.getCorrugatedRoofTexture();
    roofTex.repeat.set(3, 2.5);

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.85 });

    const building = new THREE.Mesh(new THREE.BoxGeometry(11, 3.8, 8.5), wallMat);
    building.position.set(0, 1.9, 0);
    building.castShadow = true;
    group.add(building);

    // Slanted shed roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 9.5), roofMat);
    roof.position.set(0, 4.0, 0);
    roof.rotation.x = 0.12;
    group.add(roof);

    // Store signboard
    const signTex = TextureGenerator.getSignboardTexture(
      'MAMA SHADE PROVISIONS & POS',
      'Cold Drinks, Golden Morn, Bread & Recharge Cards',
      '#1e3a8a',
      '#ffffff',
      '#f59e0b'
    );
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(7, 1.8, 0.2),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 })
    );
    sign.position.set(0, 3.4, 4.38);
    group.add(sign);

    // Yellow POS umbrella & kiosk stand outside
    const umbrellaPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af })
    );
    umbrellaPole.position.set(3.8, 1.2, 5.5);
    group.add(umbrellaPole);

    const umbrellaCanopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 0.7, 8),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 })
    );
    umbrellaCanopy.position.set(3.8, 2.5, 5.5);
    group.add(umbrellaCanopy);

    root.add(group);

    colliders.push({
      minX: x - 5.8,
      maxX: x + 5.8,
      minZ: z - 4.5,
      maxZ: z + 4.5,
      name: 'Mama Shade Provisions',
    });

    enterables.push({
      name: 'Mama Shade Provisions & POS',
      type: 'provisions',
      triggerBox: { minX: x - 2.5, maxX: x + 2.5, minZ: z + 3.8, maxZ: z + 6.8 },
      interiorSpawn: { x: x, y: 0.2, z: z + 1.5 },
      exteriorSpawn: { x: x, y: 0.1, z: z + 5.5 },
    });
  }

  private static buildTechStore(
    root: THREE.Group,
    colliders: Collider[],
    enterables: EnterableZone[],
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.7 });
    const building = new THREE.Mesh(new THREE.BoxGeometry(10, 4.0, 8), wallMat);
    building.position.set(0, 2.0, 0);
    group.add(building);

    const signTex = TextureGenerator.getSignboardTexture(
      'DUGBE TECH & ELECTRONICS',
      'Fast Phone Charging, Power Banks & Screen Repairs',
      '#042f2e',
      '#ffffff',
      '#2dd4bf'
    );
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 1.6, 0.2),
      new THREE.MeshStandardMaterial({ map: signTex })
    );
    sign.position.set(0, 3.4, 4.12);
    group.add(sign);

    root.add(group);

    colliders.push({ minX: x - 5.2, maxX: x + 5.2, minZ: z - 4.2, maxZ: z + 4.2, name: 'Dugbe Tech' });

    enterables.push({
      name: 'Dugbe Tech & Electronics',
      type: 'tech',
      triggerBox: { minX: x - 2.2, maxX: x + 2.2, minZ: z + 3.6, maxZ: z + 6.0 },
      interiorSpawn: { x: x, y: 0.2, z: z + 1 },
      exteriorSpawn: { x: x, y: 0.1, z: z + 5.0 },
    });
  }

  private static buildPharmacy(
    root: THREE.Group,
    colliders: Collider[],
    enterables: EnterableZone[],
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const building = new THREE.Mesh(new THREE.BoxGeometry(10, 4.0, 8), wallMat);
    building.position.set(0, 2.0, 0);
    group.add(building);

    const signTex = TextureGenerator.getSignboardTexture(
      'HEALTHFIRST CHEMIST',
      'Registered Pharmacist - First Aid & Prescriptions',
      '#065f46',
      '#ffffff',
      '#34d399'
    );
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 1.6, 0.2),
      new THREE.MeshStandardMaterial({ map: signTex })
    );
    sign.position.set(0, 3.4, 4.12);
    group.add(sign);

    root.add(group);

    colliders.push({ minX: x - 5.2, maxX: x + 5.2, minZ: z - 4.2, maxZ: z + 4.2, name: 'HealthFirst Chemist' });

    enterables.push({
      name: 'HealthFirst Pharmacy & Chemist',
      type: 'chemist',
      triggerBox: { minX: x - 2.2, maxX: x + 2.2, minZ: z + 3.6, maxZ: z + 6.0 },
      interiorSpawn: { x: x, y: 0.2, z: z + 1 },
      exteriorSpawn: { x: x, y: 0.1, z: z + 5.0 },
    });
  }

  private static buildMechanicWorkshop(
    root: THREE.Group,
    colliders: Collider[],
    enterables: EnterableZone[],
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Workshop hangar & repair garage
    const roofTex = TextureGenerator.getCorrugatedRoofTexture();
    roofTex.repeat.set(5, 4);

    const workshop = new THREE.Mesh(
      new THREE.BoxGeometry(18, 5.0, 12),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 })
    );
    workshop.position.set(0, 2.5, 0);
    group.add(workshop);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(12, 3.0, 4),
      new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.85 })
    );
    roof.position.set(0, 6.2, 0);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Dealership & Repair sign
    const signTex = TextureGenerator.getSignboardTexture(
      'ADE AUTO WORKS & DEALERSHIP',
      'Okada, Micra Cabs & Spare Parts Sales & Service',
      '#991b1b',
      '#ffffff',
      '#facc15'
    );
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(10, 2.2, 0.2),
      new THREE.MeshStandardMaterial({ map: signTex })
    );
    sign.position.set(0, 4.4, 6.15);
    group.add(sign);

    // Tire stacks outside workshop
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    [-7, -6].forEach((tx) => {
      for (let ty = 0; ty < 3; ty++) {
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.16, 8, 16), tireMat);
        tire.rotation.x = Math.PI / 2;
        tire.position.set(tx, 0.18 + ty * 0.32, 7.5);
        group.add(tire);
      }
    });

    root.add(group);

    colliders.push({
      minX: x - 9.5,
      maxX: x + 9.5,
      minZ: z - 6.2,
      maxZ: z + 6.2,
      name: 'Ade Mechanic Workshop',
    });

    enterables.push({
      name: 'Ade Mechanic Workshop & Dealership',
      type: 'mechanic',
      triggerBox: { minX: x - 4.0, maxX: x + 4.0, minZ: z + 5.5, maxZ: z + 9.0 },
      interiorSpawn: { x: x, y: 0.2, z: z + 2 },
      exteriorSpawn: { x: x, y: 0.1, z: z + 7.5 },
    });
  }

  private static buildFillingStation(root: THREE.Group, colliders: Collider[], x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Canopy (16m wide x 10m deep)
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }); // Nigerian green
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 10), canopyMat);
    canopy.position.set(0, 4.8, 0);
    group.add(canopy);

    // Overhead brand fascia
    const signTex = TextureGenerator.getSignboardTexture('BOVAS / HUBIQ ENERGY', 'Quality Fuel & Kerosene', '#166534', '#ffffff', '#eab308');
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 0.2), new THREE.MeshStandardMaterial({ map: signTex }));
    fascia.position.set(0, 4.8, 5.1);
    group.add(fascia);

    // Support pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    [-6, 6].forEach((px) => {
      [-3, 3].forEach((pz) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.8, 12), pillarMat);
        pillar.position.set(px, 2.4, pz);
        group.add(pillar);
      });
    });

    // Dual Fuel Pump Islands
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    [-3, 3].forEach((px) => {
      // Concrete island base
      const island = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 4.5), pillarMat);
      island.position.set(px, 0.125, 0);
      group.add(island);

      // Pump box
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 1.2), pumpMat);
      pump.position.set(px, 1.0, 0);
      group.add(pump);
    });

    root.add(group);

    colliders.push({ minX: x - 8.5, maxX: x + 8.5, minZ: z - 5.5, maxZ: z + 5.5, name: 'Bovas Filling Station' });
  }

  private static buildPlayerResidence(
    root: THREE.Group,
    colliders: Collider[],
    enterables: EnterableZone[],
    x: number,
    z: number
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Perimeter compound fence (Sandcrete block wall + black metal gate)
    const wallTex = TextureGenerator.getSandcreteWallTexture('#e2e8f0');
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85 });
    const roofTex = TextureGenerator.getCorrugatedRoofTexture();
    roofTex.repeat.set(3, 3);

    // Bungalow House structure (10m x 8m x 3.6m)
    const bungalow = new THREE.Mesh(new THREE.BoxGeometry(10, 3.6, 8), wallMat);
    bungalow.position.set(0, 1.8, 4);
    bungalow.castShadow = true;
    group.add(bungalow);

    // Corrugated Hip Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(7.5, 2.2, 4),
      new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.85 })
    );
    roof.position.set(0, 4.4, 4);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Black GeePee Water Tank on Steel Stand at back of compound
    const standMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.6 });
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 }); // iconic black plastic tank
    const tankStand = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.8, 6), standMat);
    tankStand.position.set(5.5, 1.4, 7);
    group.add(tankStand);

    const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.6, 16), tankMat);
    waterTank.position.set(5.5, 3.5, 7);
    group.add(waterTank);

    // Rooftop Satellite TV Dish
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.7 });
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.2, 16), dishMat);
    dish.position.set(-3.5, 4.5, 4);
    dish.rotation.x = 0.5;
    group.add(dish);

    // Compound front wall with gate opening
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 0.3), wallMat);
    frontWallLeft.position.set(-4.5, 1.1, -3);
    group.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 0.3), wallMat);
    frontWallRight.position.set(4.5, 1.1, -3);
    group.add(frontWallRight);

    // Black metal swing gate (ajar for easy access)
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const gateLeft = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 0.1), gateMat);
    gateLeft.position.set(-1.2, 1.0, -2.6);
    gateLeft.rotation.y = -0.4;
    group.add(gateLeft);

    root.add(group);

    colliders.push({
      minX: x - 5.5,
      maxX: x + 5.5,
      minZ: z - 0.2,
      maxZ: z + 8.5,
      name: "Player's House",
    });

    enterables.push({
      name: "Your Home Bungalow",
      type: 'home',
      triggerBox: { minX: x - 2.5, maxX: x + 2.5, minZ: z - 1.0, maxZ: z + 2.5 },
      interiorSpawn: { x: x, y: 0.2, z: z + 3 },
      exteriorSpawn: { x: x, y: 0.1, z: z - 2.5 },
    });
  }

  private static buildFamilyCompound(
    root: THREE.Group,
    colliders: Collider[],
    x: number,
    z: number,
    title: string
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const wallTex = TextureGenerator.getSandcreteWallTexture('#fef3c7'); // warm cream
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85 });
    const roofTex = TextureGenerator.getCorrugatedRoofTexture();
    roofTex.repeat.set(4, 3);

    const house = new THREE.Mesh(new THREE.BoxGeometry(14, 4.0, 9), wallMat);
    house.position.set(0, 2.0, 3);
    group.add(house);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(9.5, 2.4, 4),
      new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.85 })
    );
    roof.position.set(0, 4.8, 3);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Front veranda with pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    [-5, 0, 5].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), pillarMat);
      pillar.position.set(px, 1.6, -1.8);
      group.add(pillar);
    });

    root.add(group);

    colliders.push({
      minX: x - 7.5,
      maxX: x + 7.5,
      minZ: z - 2.2,
      maxZ: z + 8.0,
      name: title,
    });
  }

  private static buildModernResidence(root: THREE.Group, colliders: Collider[], x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
    });

    // 2-storey modern duplex (12m x 7.5m x 10m)
    const base = new THREE.Mesh(new THREE.BoxGeometry(12, 7.5, 10), wallMat);
    base.position.set(0, 3.75, 0);
    group.add(base);

    // Balcony window glazing
    const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.8), glassMat);
    windowMesh.position.set(0, 5.0, 5.02);
    group.add(windowMesh);

    root.add(group);

    colliders.push({ minX: x - 6.5, maxX: x + 6.5, minZ: z - 5.5, maxZ: z + 5.5, name: 'Modern Duplex' });
  }

  private static buildModestCompound(root: THREE.Group, colliders: Collider[], x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const wallTex = TextureGenerator.getSandcreteWallTexture('#e7e5e4');
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
    const roofTex = TextureGenerator.getCorrugatedRoofTexture();
    roofTex.repeat.set(3, 2.5);

    const house = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 8), wallMat);
    house.position.set(0, 1.6, 0);
    group.add(house);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(7.5, 1.8, 4),
      new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.9 })
    );
    roof.position.set(0, 3.8, 0);
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    root.add(group);

    colliders.push({ minX: x - 6.0, maxX: x + 6.0, minZ: z - 4.5, maxZ: z + 4.5, name: 'Bodija Bungalow' });
  }

  private static buildStreetlightsAndPoles(
    root: THREE.Group,
    colliders: Collider[],
    streetlights: THREE.PointLight[]
  ) {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.8 });

    // Along Dugbe Avenue (North side Z = 9, South side Z = -9)
    [-80, -40, 0, 40, 80].forEach((px) => {
      // South streetlight
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.5, 8), poleMat);
      pole.position.set(px, 3.25, -9.5);
      root.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.8), poleMat);
      arm.position.set(px, 6.4, -8.6);
      root.add(arm);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), lampMat);
      lamp.position.set(px, 6.3, -7.8);
      root.add(lamp);

      // Pointlight for night illumination
      const light = new THREE.PointLight(0xfef08a, 1.2, 18, 1.2);
      light.position.set(px, 6.2, -7.8);
      root.add(light);
      streetlights.push(light);

      colliders.push({ minX: px - 0.4, maxX: px + 0.4, minZ: -9.8, maxZ: -9.2, name: 'Streetlight Pole' });
    });

    // NEPA Electric Poles with crossarms (authentic Nigerian wooden / concrete power poles)
    const nepaMat = new THREE.MeshStandardMaterial({ color: 0x573926, roughness: 0.95 });
    [-100, -50, 50, 100].forEach((nx) => {
      const nepaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 8.5, 8), nepaMat);
      nepaPole.position.set(nx, 4.25, 11);
      root.add(nepaPole);

      // Crossbars
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), nepaMat);
      crossbar.position.set(nx, 7.8, 11);
      root.add(crossbar);

      colliders.push({ minX: nx - 0.4, maxX: nx + 0.4, minZ: 10.6, maxZ: 11.4, name: 'NEPA Electric Pole' });
    });
  }

  private static buildVegetation(root: THREE.Group, colliders: Collider[]) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

    const treePositions = [
      { x: -75, z: 16 },
      { x: -35, z: 18 },
      { x: 35, z: 18 },
      { x: 75, z: 16 },
      { x: -12, z: 35 },
      { x: 12, z: 35 },
      { x: -45, z: 65 },
      { x: 55, z: 65 },
    ];

    treePositions.forEach((pos) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.8, 8), trunkMat);
      trunk.position.set(pos.x, 1.9, pos.z);
      trunk.castShadow = true;
      root.add(trunk);

      // Tropical mango / neem tree foliage canopies
      const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), foliageMat);
      foliage1.position.set(pos.x, 4.6, pos.z);
      foliage1.castShadow = true;
      root.add(foliage1);

      const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), foliageMat);
      foliage2.position.set(pos.x + 0.4, 5.8, pos.z + 0.2);
      root.add(foliage2);

      colliders.push({
        minX: pos.x - 0.5,
        maxX: pos.x + 0.5,
        minZ: pos.z - 0.5,
        maxZ: pos.z + 0.5,
        name: 'Tree Trunk',
      });
    });
  }
}
