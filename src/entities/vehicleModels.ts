import * as THREE from 'three';
import { TextureGenerator } from '../world/textures';

export interface VehicleMeshRig {
  root: THREE.Group;
  type: 'okada' | 'micra' | 'keke';
  wheels: THREE.Mesh[];
  headlight?: THREE.SpotLight;
}

export class VehicleModelFactory {
  /**
   * Realistic Okada Motorcycle (Bajaj Boxer 100 / TVS Star HLX style)
   * Scaled up to true life proportions (~2.15m length, 0.42m wheel radius).
   * Wheels are perfectly centered in the YZ plane with axle along X for 100% balanced, wobble-free rotation.
   */
  public static createOkada(color: string = '#dc2626'): VehicleMeshRig {
    const root = new THREE.Group();
    const wheels: THREE.Mesh[] = [];

    // Materials
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.08,
    });

    const blackSteelMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.8,
      roughness: 0.3,
    });

    const engineAlumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.22,
    });

    const tankTex = TextureGenerator.getMotorcycleTankTexture(color);
    const tankMat = new THREE.MeshStandardMaterial({
      map: tankTex,
      metalness: 0.45,
      roughness: 0.2,
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.92,
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
    });

    const lensTex = TextureGenerator.getHeadlightLensTexture();
    const headlightLensMat = new THREE.MeshStandardMaterial({
      map: lensTex,
      emissive: 0xfef08a,
      emissiveIntensity: 0.5,
      roughness: 0.1,
    });

    const dialTex = TextureGenerator.getGaugeTexture();
    const gaugeMat = new THREE.MeshBasicMaterial({ map: dialTex });

    const plateTex = TextureGenerator.getLicensePlateTexture('IBD - 482 - AG');
    const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });

    // 1. TUBULAR DOUBLE-CRADLE FRAME (Scaled up)
    const frame = new THREE.Group();
    // Spine
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.65, 8), blackSteelMat);
    spine.rotation.x = Math.PI / 2;
    spine.position.set(0, 0.85, 0);
    frame.add(spine);

    // Down tubes
    [-0.12, 0.12].forEach((dx) => {
      const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), blackSteelMat);
      downTube.position.set(dx, 0.52, 0.5);
      downTube.rotation.x = -0.38;
      frame.add(downTube);
    });

    // Rear Swingarm
    const swingarm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.95), blackSteelMat);
    swingarm.position.set(0, 0.45, -0.55);
    frame.add(swingarm);
    root.add(frame);

    // 2. DETAILED 100cc 4-STROKE ENGINE BLOCK
    const engineGroup = new THREE.Group();
    engineGroup.position.set(0, 0.48, 0.1);

    // Crankcase
    const crankcase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 16), engineAlumMat);
    crankcase.rotation.z = Math.PI / 2;
    crankcase.position.set(0, 0, 0);
    engineGroup.add(crankcase);

    // Cylinder with 7 cooling fins
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.28, 12), blackSteelMat);
    cylinder.position.set(0, 0.2, 0.05);
    cylinder.rotation.x = 0.2;
    engineGroup.add(cylinder);

    for (let f = 0; f < 7; f++) {
      const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 12), engineAlumMat);
      fin.position.set(0, 0.1 + f * 0.035, 0.05);
      fin.rotation.x = 0.2;
      engineGroup.add(fin);
    }

    // Carburetor & Air filter box
    const carb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), chromeMat);
    carb.position.set(0, 0.15, -0.15);
    engineGroup.add(carb);

    // Kickstarter lever
    const kickstarter = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 6), chromeMat);
    kickstarter.position.set(0.2, -0.02, -0.08);
    kickstarter.rotation.z = 0.4;
    engineGroup.add(kickstarter);

    root.add(engineGroup);

    // 3. EXHAUST & SILENCER WITH HEAT SHIELD
    const exhaustGroup = new THREE.Group();
    const header = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.65, 8), chromeMat);
    header.position.set(0.16, 0.36, 0.18);
    header.rotation.x = 0.6;
    exhaustGroup.add(header);

    // Long chrome silencer canister
    const silencer = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 1.05, 16), chromeMat);
    silencer.position.set(0.19, 0.38, -0.55);
    silencer.rotation.x = 1.62;
    exhaustGroup.add(silencer);

    // Perforated heat shield plate
    const heatShield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.078, 0.55, 12, 1, true, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.25 })
    );
    heatShield.position.set(0.19, 0.4, -0.52);
    heatShield.rotation.x = 1.62;
    heatShield.rotation.y = Math.PI / 2;
    exhaustGroup.add(heatShield);

    root.add(exhaustGroup);

    // 4. DUAL REAR COIL-SPRING SHOCK ABSORBERS
    [-0.16, 0.16].forEach((sx) => {
      const shockGroup = new THREE.Group();
      shockGroup.position.set(sx, 0.62, -0.7);
      shockGroup.rotation.x = -0.32;

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.44, 8), chromeMat);
      shockGroup.add(shaft);

      // Coiled Spring rings
      for (let c = -0.16; c <= 0.16; c += 0.04) {
        const coil = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 8, 16), chromeMat);
        coil.rotation.x = Math.PI / 2;
        coil.position.y = c;
        shockGroup.add(coil);
      }
      root.add(shockGroup);
    });

    // 5. SCULPTED FUEL TANK & COMFORT DOUBLE SADDLE
    // Teardrop Tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.26, 0.75, 16), tankMat);
    tank.rotation.x = Math.PI / 2;
    tank.scale.set(0.9, 1.0, 0.85);
    tank.position.set(0, 1.08, 0.22);
    tank.castShadow = true;
    root.add(tank);

    // Chrome Gas Cap
    const gasCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), chromeMat);
    gasCap.position.set(0, 1.24, 0.35);
    root.add(gasCap);

    // Elongated Comfort Double Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.95), seatMat);
    seat.position.set(0, 1.05, -0.42);
    seat.castShadow = true;
    root.add(seat);

    // Rear Heavy-Duty Steel Luggage Rack / Grab Rail
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.42), chromeMat);
    rack.position.set(0, 1.05, -0.98);
    root.add(rack);

    // 6. FRONT FORKS & STEERING ASSEMBLY
    const frontForkGroup = new THREE.Group();
    frontForkGroup.position.set(0, 0.78, 0.82);
    frontForkGroup.rotation.x = -0.22; // caster rake angle

    // Dual telescopic fork legs with rubber dust gaiters
    [-0.13, 0.13].forEach((fx) => {
      const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.78, 8), chromeMat);
      stanchion.position.set(fx, 0, 0);
      frontForkGroup.add(stanchion);

      for (let g = -0.08; g <= 0.1; g += 0.03) {
        const gaiter = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.011, 8, 16), blackSteelMat);
        gaiter.rotation.x = Math.PI / 2;
        gaiter.position.set(fx, g, 0);
        frontForkGroup.add(gaiter);
      }
    });

    // Handlebars with rubber waffle grips
    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.95, 8), chromeMat);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 0.52, 0);
    frontForkGroup.add(handlebar);

    [-0.42, 0.42].forEach((hx) => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.14, 8), blackSteelMat);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(hx, 0.52, 0);
      frontForkGroup.add(grip);

      const lever = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.018), chromeMat);
      lever.position.set(hx > 0 ? hx - 0.05 : hx + 0.05, 0.52, 0.05);
      frontForkGroup.add(lever);

      // Round Chrome Rearview Mirrors
      const mirrorStem = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.18, 6), chromeMat);
      mirrorStem.position.set(hx, 0.62, 0.02);
      mirrorStem.rotation.z = hx > 0 ? -0.25 : 0.25;
      frontForkGroup.add(mirrorStem);

      const mirrorHead = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 16), chromeMat);
      mirrorHead.position.set(hx > 0 ? hx + 0.04 : hx - 0.04, 0.72, 0.02);
      mirrorHead.rotation.x = Math.PI / 2;
      frontForkGroup.add(mirrorHead);
    });

    // Twin Circular Gauges
    [-0.08, 0.08].forEach((dx) => {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 16), blackSteelMat);
      dial.position.set(dx, 0.55, 0.04);
      dial.rotation.x = -0.5;
      frontForkGroup.add(dial);

      const face = new THREE.Mesh(new THREE.CircleGeometry(0.045, 16), gaugeMat);
      face.position.set(dx, 0.56, 0.058);
      face.rotation.x = -0.5;
      frontForkGroup.add(face);
    });

    // Round Chrome Halogen Headlight with fluted glass lens
    const headlightCasing = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), chromeMat);
    headlightCasing.position.set(0, 0.4, 0.14);
    frontForkGroup.add(headlightCasing);

    const headlightLens = new THREE.Mesh(new THREE.CircleGeometry(0.125, 16), headlightLensMat);
    headlightLens.position.set(0, 0.4, 0.278);
    frontForkGroup.add(headlightLens);

    // Front Mudguard
    const frontFender = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.44, 0.13, 16, 1, true, 0, Math.PI * 0.7),
      tankMat
    );
    frontFender.rotation.x = Math.PI / 2;
    frontFender.rotation.y = -0.6;
    frontFender.position.set(0, -0.06, 0.08);
    frontForkGroup.add(frontFender);

    root.add(frontForkGroup);

    // 7. REALISTIC BALANCED WIRE-SPOKE WHEELS WITH DRUM BRAKES
    // Perfectly centered on YZ plane so wheel rolls smoothly along the X axle!
    const createSpokeWheel = (): THREE.Mesh => {
      const wheelGroup = new THREE.Mesh();
      const wheelRadius = 0.42;

      // Rubber Tire: Torus oriented in YZ plane (rotation.y = PI / 2) so axle is X!
      const tire = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius, 0.085, 16, 32), tireMat);
      tire.rotation.y = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Chrome Rim Hoop (YZ plane)
      const rimHoop = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius - 0.035, 0.03, 10, 32), chromeMat);
      rimHoop.rotation.y = Math.PI / 2;
      wheelGroup.add(rimHoop);

      // Central Hub & Drum Brake (Cylinder axis along X)
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 16), engineAlumMat);
      hub.rotation.z = Math.PI / 2;
      wheelGroup.add(hub);

      // Radial Wire Spokes (in YZ plane)
      const spokeCount = 18;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, wheelRadius - 0.07, 6), chromeMat);
        spoke.position.set(0, Math.sin(angle) * (wheelRadius * 0.5), Math.cos(angle) * (wheelRadius * 0.5));
        spoke.rotation.x = angle + Math.PI / 2;
        wheelGroup.add(spoke);
      }

      return wheelGroup;
    };

    // Front Wheel (Z = 1.02, Y = 0.42)
    const frontWheel = createSpokeWheel();
    frontWheel.position.set(0, 0.42, 1.02);
    root.add(frontWheel);
    wheels.push(frontWheel);

    // Rear Wheel (Z = -0.9, Y = 0.42)
    const rearWheel = createSpokeWheel();
    rearWheel.position.set(0, 0.42, -0.9);
    root.add(rearWheel);
    wheels.push(rearWheel);

    // Rear License Plate Bracket
    const plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.1), plateMat);
    plateMesh.position.set(0, 0.62, -1.08);
    plateMesh.rotation.y = Math.PI;
    root.add(plateMesh);

    return { root, type: 'okada', wheels };
  }

  /**
   * Realistic Ibadan Micra Taxi (Nissan Micra K11 style)
   * Scaled up to full realistic car dimensions (1.88m width, 4.25m length, 1.62m height).
   * 4-wheel drive with precision disc brakes, alloy rims, taxi roof sign, and license plates.
   */
  public static createMicraTaxi(): VehicleMeshRig {
    const root = new THREE.Group();
    const wheels: THREE.Mesh[] = [];

    // Materials
    const bluePaintMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.5,
      roughness: 0.18,
    });

    const yellowStripeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.3,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      transmission: 0.88,
      transparent: true,
      roughness: 0.05,
      metalness: 0.1,
      ior: 1.5,
    });

    const trimBlackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    const alloyRimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.18 });
    const brakeDiscMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.28 });
    const redCaliperMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 });

    const lensTex = TextureGenerator.getHeadlightLensTexture();
    const headlightMat = new THREE.MeshStandardMaterial({
      map: lensTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
    });

    const plateTex = TextureGenerator.getLicensePlateTexture('IBD - 482 - AG');
    const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });

    // 1. SCULPTED CHASSIS LOWER BODY (Scaled to full real car size)
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.68, 4.25), bluePaintMat);
    mainBody.position.set(0, 0.68, 0);
    mainBody.castShadow = true;
    root.add(mainBody);

    // Front Hood & Bonnet with curve
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.26, 1.35), bluePaintMat);
    hood.position.set(0, 0.92, 1.25);
    hood.rotation.x = -0.12;
    hood.castShadow = true;
    root.add(hood);

    // Front Bumper & Lower Grille
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.36, 0.32), trimBlackMat);
    frontBumper.position.set(0, 0.52, 2.12);
    root.add(frontBumper);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.05), trimBlackMat);
    grille.position.set(0, 0.56, 2.28);
    root.add(grille);

    // Front License Plate
    const fPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.14), plateMat);
    fPlate.position.set(0, 0.44, 2.29);
    root.add(fPlate);

    // Dual Ibadan Yellow Horizontal Stripes along both sides
    [-0.95, 0.95].forEach((sx) => {
      const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 4.2), yellowStripeMat);
      stripe1.position.set(sx, 0.72, 0);
      root.add(stripe1);

      const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 4.2), yellowStripeMat);
      stripe2.position.set(sx, 0.54, 0);
      root.add(stripe2);
    });

    // 2. PASSENGER CABIN & ROOF
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.72, 2.28), bluePaintMat);
    cabin.position.set(0, 1.38, -0.18);
    cabin.castShadow = true;
    root.add(cabin);

    // Windshield (Front Glass)
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 0.75), glassMat);
    windshield.position.set(0, 1.38, 0.98);
    windshield.rotation.x = -0.42;
    root.add(windshield);

    // Dual Windshield Wipers
    [-0.36, 0.36].forEach((wx) => {
      const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.018), trimBlackMat);
      wiper.position.set(wx, 1.1, 0.96);
      wiper.rotation.z = -0.25;
      root.add(wiper);
    });

    // Rear Glass Window
    const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.68), glassMat);
    rearGlass.position.set(0, 1.38, -1.33);
    rearGlass.rotation.x = 0.38;
    root.add(rearGlass);

    // Side Windows
    [-0.87, 0.87].forEach((wx) => {
      const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 0.52), glassMat);
      sideGlass.rotation.y = wx > 0 ? Math.PI / 2 : -Math.PI / 2;
      sideGlass.position.set(wx, 1.38, -0.18);
      root.add(sideGlass);

      // Side Door Handles
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.14), trimBlackMat);
      handle.position.set(wx > 0 ? wx + 0.01 : wx - 0.01, 0.92, 0.22);
      root.add(handle);

      // Aerodynamic Side Mirrors
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), bluePaintMat);
      mirror.position.set(wx > 0 ? wx + 0.12 : wx - 0.12, 1.15, 0.84);
      root.add(mirror);
    });

    // 3. ILLUMINATED TAXI ROOF SIGN
    const taxiSignMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const taxiSign = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.95, 16), taxiSignMat);
    taxiSign.rotation.z = Math.PI / 2;
    taxiSign.position.set(0, 1.82, -0.18);
    root.add(taxiSign);

    // 4. LIGHTING & REAR BUMPER
    // Front Glass Headlights
    [-0.68, 0.68].forEach((hx) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.1), headlightMat);
      hl.position.set(hx, 0.76, 2.12);
      root.add(hl);
    });

    // Rear Bumper & License Plate
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.34, 0.28), trimBlackMat);
    rearBumper.position.set(0, 0.52, -2.12);
    root.add(rearBumper);

    const rPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.14), plateMat);
    rPlate.rotation.y = Math.PI;
    rPlate.position.set(0, 0.54, -2.27);
    root.add(rPlate);

    // Taillights
    [-0.72, 0.72].forEach((tx) => {
      const tail = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.32, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.45 })
      );
      tail.position.set(tx, 0.84, -2.13);
      root.add(tail);
    });

    // Chrome Exhaust Tip
    const carExhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 12), chromeMat);
    carExhaust.rotation.x = Math.PI / 2;
    carExhaust.position.set(0.62, 0.32, -2.16);
    root.add(carExhaust);

    // 5. FOUR REALISTIC ALLOY WHEELS WITH DISC BRAKES
    const wheelPositions = [
      { x: -0.98, z: 1.3 },
      { x: 0.98, z: 1.3 },
      { x: -0.98, z: -1.3 },
      { x: 0.98, z: -1.3 },
    ];

    wheelPositions.forEach((wp) => {
      const wheelGroup = new THREE.Mesh();
      wheelGroup.position.set(wp.x, 0.38, wp.z);

      // Radial Rubber Tire (YZ cylinder with axle along X)
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 24), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Alloy Rim Hub
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.26, 16), alloyRimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // 5-Spoke Alloy Pattern
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.045, 0.035), alloyRimMat);
        spoke.rotation.x = (s / 5) * Math.PI;
        spoke.position.x = wp.x > 0 ? 0.09 : -0.09;
        wheelGroup.add(spoke);
      }

      // Disc Brake & Red Caliper inside
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12), brakeDiscMat);
      disc.rotation.z = Math.PI / 2;
      wheelGroup.add(disc);

      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.09, 0.07), redCaliperMat);
      caliper.position.set(0, 0.11, 0);
      wheelGroup.add(caliper);

      root.add(wheelGroup);
      wheels.push(wheelGroup);
    });

    return { root, type: 'micra', wheels };
  }

  /**
   * Realistic Commercial Tricycle (Keke Marwa / Napep)
   * Scaled up to life proportions (1.55m width, 2.9m length, 1.92m height).
   */
  public static createKekeMarwa(): VehicleMeshRig {
    const root = new THREE.Group();
    const wheels: THREE.Mesh[] = [];

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35 });
    const blackRollCageMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.75, roughness: 0.35 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.92 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x67e8f9, transmission: 0.8, transparent: true, roughness: 0.1 });

    // Sculpted Front Cowl
    const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 1.05, 16), yellowMat);
    cowl.position.set(0, 0.72, 0.92);
    cowl.rotation.x = 0.25;
    root.add(cowl);

    // Main Cabin Tub
    const tub = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.55, 2.1), yellowMat);
    tub.position.set(0, 0.54, -0.25);
    tub.castShadow = true;
    root.add(tub);

    // Black Tubular Roll-Cage Canopy Frame
    [-0.72, 0.72].forEach((cx) => {
      const pillarF = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), blackRollCageMat);
      pillarF.position.set(cx, 1.35, 0.48);
      root.add(pillarF);

      const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), blackRollCageMat);
      pillarR.position.set(cx, 1.35, -1.1);
      root.add(pillarR);
    });

    // Ribbed Weather Canopy Roof
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.14, 2.15), canopyMat);
    canopy.position.set(0, 1.95, -0.26);
    canopy.castShadow = true;
    root.add(canopy);

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.6), glassMat);
    windshield.position.set(0, 1.45, 0.6);
    windshield.rotation.x = -0.22;
    root.add(windshield);

    // Seats
    const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.48), seatMat);
    driverSeat.position.set(0, 0.75, 0.18);
    root.add(driverSeat);

    const passengerBench = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.16, 0.65), seatMat);
    passengerBench.position.set(0, 0.75, -0.75);
    root.add(passengerBench);

    // Front Single Wheel & Fork
    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 16), tireMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.32, 1.32);
    frontWheel.castShadow = true;
    root.add(frontWheel);
    wheels.push(frontWheel);

    // Rear Dual Wheels
    [-0.78, 0.78].forEach((rx) => {
      const rWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 16), tireMat);
      rWheel.rotation.z = Math.PI / 2;
      rWheel.position.set(rx, 0.32, -0.9);
      rWheel.castShadow = true;
      root.add(rWheel);
      wheels.push(rWheel);
    });

    return { root, type: 'keke', wheels };
  }
}
