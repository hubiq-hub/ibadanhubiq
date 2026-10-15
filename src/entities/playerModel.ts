import * as THREE from 'three';
import { CharacterConfig } from '../types/game';
import { TextureGenerator } from '../world/textures';

export interface PlayerRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftCalf: THREE.Group;
  rightCalf: THREE.Group;
  filaCap?: THREE.Mesh;
  animTime: number;
}

export class PlayerModelFactory {
  public static createPlayer(config: CharacterConfig): PlayerRig {
    const root = new THREE.Group();

    // 1. SKIN & MATERIALS
    const skinColor = config.skinTone || '#45220c';
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor),
      roughness: 0.62,
      metalness: 0.04,
    });

    const isTraditional = config.outfit === 'traditional';
    const isRider = config.outfit === 'rider';

    // Clothing fabrics
    const ankaraTex = isTraditional
      ? TextureGenerator.getAnkaraPattern(config.clothingColor || '#047857', '#f59e0b')
      : null;

    const clothesMat = new THREE.MeshStandardMaterial({
      color: isTraditional ? 0xffffff : new THREE.Color(config.clothingColor || (isRider ? '#1e293b' : '#1d4ed8')),
      map: ankaraTex || undefined,
      roughness: isRider ? 0.35 : 0.78,
      metalness: isRider ? 0.25 : 0.05,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: isTraditional ? new THREE.Color(config.clothingColor || '#047857') : (isRider ? 0x0f172a : 0x1e293b),
      roughness: 0.8,
    });

    const shoeSoleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const shoeUpperMat = new THREE.MeshStandardMaterial({ color: isRider ? 0x991b1b : 0x111827, roughness: 0.6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 });

    // 2. ROOT & HIPS
    const hips = new THREE.Group();
    hips.position.set(0, 0.96, 0);
    root.add(hips);

    // Pelvis / Belt
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.22, 0.2, 16),
      pantsMat
    );
    pelvis.position.set(0, 0, 0);
    pelvis.castShadow = true;
    hips.add(pelvis);

    // Belt & Buckle
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16), shoeUpperMat);
    belt.position.set(0, 0.08, 0);
    hips.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.03), goldMat);
    buckle.position.set(0, 0.08, 0.25);
    hips.add(buckle);

    // 3. TORSO (Spine & Chest)
    const torso = new THREE.Group();
    torso.position.set(0, 0.12, 0);
    hips.add(torso);

    // Sculpted Upper Body (Chest & Waist)
    // Abdomen
    const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.25, 16), clothesMat);
    abdomen.position.set(0, 0.125, 0);
    abdomen.castShadow = true;
    torso.add(abdomen);

    // Upper Chest with pectoral contour
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.32, 16), clothesMat);
    chest.position.set(0, 0.38, 0);
    chest.castShadow = true;
    torso.add(chest);

    // Collar / Neckline embroidery
    if (isTraditional) {
      const embroidery = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.035, 8, 16),
        goldMat
      );
      embroidery.rotation.x = Math.PI / 2;
      embroidery.position.set(0, 0.52, 0.02);
      torso.add(embroidery);
    } else {
      // Shirt collar
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.16, 0.06, 12),
        clothesMat
      );
      collar.position.set(0, 0.54, 0);
      torso.add(collar);
    }

    // 4. NECK & HEAD
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0);
    torso.add(headGroup);

    // Contoured Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 12), skinMat);
    neck.position.set(0, 0.06, 0);
    headGroup.add(neck);

    // Cranium / Head (Spherical anatomical contour)
    const cranium = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      skinMat
    );
    cranium.scale.set(1.0, 1.25, 1.05);
    cranium.position.set(0, 0.26, 0);
    cranium.castShadow = true;
    headGroup.add(cranium);

    // Jaw / Chin definition
    const jaw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.08, 0.14, 12),
      skinMat
    );
    jaw.position.set(0, 0.15, 0.05);
    headGroup.add(jaw);

    // Nose
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.035, 0.07, 8),
      skinMat
    );
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.25, 0.19);
    headGroup.add(nose);

    // Realistic Eyes (Sclera + Iris + Pupil)
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x2e1a0d });
    [-0.065, 0.065].forEach((ex) => {
      // Eyeball
      const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), eyeWhiteMat);
      eyeball.position.set(ex, 0.28, 0.16);
      headGroup.add(eyeball);

      // Iris & pupil
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.015, 8), eyeIrisMat);
      iris.position.set(ex, 0.28, 0.184);
      headGroup.add(iris);

      // Eyebrow
      const brow = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.012, 0.01),
        new THREE.MeshBasicMaterial({ color: 0x0f172a })
      );
      brow.position.set(ex, 0.32, 0.17);
      headGroup.add(brow);
    });

    // Lips
    const lipMat = new THREE.MeshStandardMaterial({ color: 0x5c2b18, roughness: 0.5 });
    const lips = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.02, 0.025), lipMat);
    lips.position.set(0, 0.18, 0.175);
    headGroup.add(lips);

    // Ears
    [-0.18, 0.18].forEach((earX) => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.07, 8), skinMat);
      ear.position.set(earX, 0.26, 0);
      ear.rotation.z = earX > 0 ? -0.2 : 0.2;
      headGroup.add(ear);
    });

    // Hair: Textured Afro Crop / Fade
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hairMat
    );
    hair.scale.set(1.02, 1.22, 1.05);
    hair.position.set(0, 0.28, -0.02);
    headGroup.add(hair);

    // Traditional Yoruba Fila Hat (if enabled or traditional outfit)
    let filaCap: THREE.Mesh | undefined;
    if (config.headwear || isTraditional) {
      const filaMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.7,
      });
      // Classic angled fold Fila
      filaCap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.18, 16), filaMat);
      filaCap.position.set(0, 0.44, -0.02);
      filaCap.rotation.z = -0.24; // signature Yoruba tilted crease
      filaCap.scale.set(1.0, 1.0, 1.15);
      headGroup.add(filaCap);
    }

    // 5. ARMS & HANDS
    // LEFT ARM
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.32, 0.48, 0);
    torso.add(leftArm);

    // Shoulder Deltoid
    const lDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), clothesMat);
    leftArm.add(lDeltoid);

    // Upper arm (Bicep/Tricep)
    const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.26, 12), clothesMat);
    lBicep.position.set(0, -0.14, 0);
    leftArm.add(lBicep);

    // Left Forearm
    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.27, 0);
    leftArm.add(leftForearm);

    const lForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.25, 12), skinMat);
    lForearmMesh.position.set(0, -0.12, 0);
    leftForearm.add(lForearmMesh);

    // Left Hand (Palm + Thumb + Fingers)
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.08, 0.04), skinMat);
    lHand.position.set(0, -0.27, 0);
    leftForearm.add(lHand);

    // Gold Watch on Left Wrist
    const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 12), goldMat);
    watch.position.set(0, -0.22, 0);
    leftForearm.add(watch);

    // RIGHT ARM
    const rightArm = new THREE.Group();
    rightArm.position.set(0.32, 0.48, 0);
    torso.add(rightArm);

    const rDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), clothesMat);
    rightArm.add(rDeltoid);

    const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.26, 12), clothesMat);
    rBicep.position.set(0, -0.14, 0);
    rightArm.add(rBicep);

    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.27, 0);
    rightArm.add(rightForearm);

    const rForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.25, 12), skinMat);
    rForearmMesh.position.set(0, -0.12, 0);
    rightForearm.add(rForearmMesh);

    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.08, 0.04), skinMat);
    rHand.position.set(0, -0.27, 0);
    rightForearm.add(rHand);

    // 6. LEGS & REALISTIC SHOES
    // LEFT LEG
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.13, -0.05, 0);
    hips.add(leftLeg);

    // Thigh with Quadriceps shape
    const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.095, 0.44, 14), pantsMat);
    lThigh.position.set(0, -0.22, 0);
    lThigh.castShadow = true;
    leftLeg.add(lThigh);

    // Left Knee & Calf
    const leftCalf = new THREE.Group();
    leftCalf.position.set(0, -0.44, 0);
    leftLeg.add(leftCalf);

    const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), pantsMat);
    leftCalf.add(lKnee);

    const lCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.07, 0.42, 14), pantsMat);
    lCalfMesh.position.set(0, -0.21, 0);
    lCalfMesh.castShadow = true;
    leftCalf.add(lCalfMesh);

    // Left Shoe: Realistic Sneaker / Loafer
    const lShoeGroup = new THREE.Group();
    lShoeGroup.position.set(0, -0.44, 0.06);
    leftCalf.add(lShoeGroup);

    // White Midsole
    const lSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.045, 0.26), shoeSoleMat);
    lShoeGroup.add(lSole);

    // Upper Shoe with Tongue
    const lUpper = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.08, 0.25), shoeUpperMat);
    lUpper.position.set(0, 0.055, 0);
    lShoeGroup.add(lUpper);

    // RIGHT LEG
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.13, -0.05, 0);
    hips.add(rightLeg);

    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.095, 0.44, 14), pantsMat);
    rThigh.position.set(0, -0.22, 0);
    rThigh.castShadow = true;
    rightLeg.add(rThigh);

    const rightCalf = new THREE.Group();
    rightCalf.position.set(0, -0.44, 0);
    rightLeg.add(rightCalf);

    const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), pantsMat);
    rightCalf.add(rKnee);

    const rCalfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.07, 0.42, 14), pantsMat);
    rCalfMesh.position.set(0, -0.21, 0);
    rCalfMesh.castShadow = true;
    rightCalf.add(rCalfMesh);

    const rShoeGroup = new THREE.Group();
    rShoeGroup.position.set(0, -0.44, 0.06);
    rightCalf.add(rShoeGroup);

    const rSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.045, 0.26), shoeSoleMat);
    rShoeGroup.add(rSole);

    const rUpper = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.08, 0.25), shoeUpperMat);
    rUpper.position.set(0, 0.055, 0);
    rShoeGroup.add(rUpper);

    return {
      root,
      hips,
      torso,
      head: headGroup,
      leftArm,
      rightArm,
      leftForearm,
      rightForearm,
      leftLeg,
      rightLeg,
      leftCalf,
      rightCalf,
      filaCap,
      animTime: 0,
    };
  }

  /**
   * Updates skeletal animation kinematics with anatomical joint articulation
   */
  public static updateAnimation(
    rig: PlayerRig,
    dt: number,
    state: 'idle' | 'walk' | 'run' | 'jump' | 'riding'
  ) {
    rig.animTime += dt;
    const t = rig.animTime;

    if (state === 'riding') {
      // Realistic seated motorcycle riding posture
      rig.hips.position.y = 0.82; // seated on bike saddle
      rig.torso.rotation.x = 0.38; // aggressive aerodynamic forward torso lean
      rig.torso.position.y = 0.08;

      // Arms reaching forward gripping handlebars
      rig.leftArm.rotation.x = -0.85;
      rig.leftArm.rotation.y = 0.18;
      rig.leftArm.rotation.z = -0.15;
      rig.leftForearm.rotation.x = -0.35;

      rig.rightArm.rotation.x = -0.85;
      rig.rightArm.rotation.y = -0.18;
      rig.rightArm.rotation.z = 0.15;
      rig.rightForearm.rotation.x = -0.35;

      // Legs bent backward onto footpegs
      rig.leftLeg.rotation.x = -1.25;
      rig.leftLeg.rotation.y = -0.15;
      rig.leftCalf.rotation.x = 1.35;

      rig.rightLeg.rotation.x = -1.25;
      rig.rightLeg.rotation.y = 0.15;
      rig.rightCalf.rotation.x = 1.35;

      // Head tilted up looking at road ahead
      rig.head.rotation.x = -0.35;
      return;
    }

    if (state === 'jump') {
      // Airborne pose with knees tucked
      rig.hips.position.y = 0.96;
      rig.torso.rotation.x = -0.1;
      rig.leftArm.rotation.x = -1.4;
      rig.rightArm.rotation.x = -1.4;
      rig.leftForearm.rotation.x = -0.4;
      rig.rightForearm.rotation.x = -0.4;

      rig.leftLeg.rotation.x = -0.6;
      rig.leftCalf.rotation.x = 0.9;
      rig.rightLeg.rotation.x = -0.85;
      rig.rightCalf.rotation.x = 1.2;
      return;
    }

    if (state === 'idle') {
      // Natural organic idle breathing with subtle weight shifting
      const breath = Math.sin(t * 2.2) * 0.02;
      rig.hips.position.y = 0.96 + breath;
      rig.torso.rotation.x = 0;
      rig.torso.rotation.z = Math.sin(t * 1.1) * 0.015;
      rig.head.rotation.x = Math.sin(t * 1.8) * 0.02;

      rig.leftArm.rotation.x = Math.sin(t * 1.5) * 0.05;
      rig.rightArm.rotation.x = -Math.sin(t * 1.5) * 0.05;
      rig.leftArm.rotation.z = 0.08;
      rig.rightArm.rotation.z = -0.08;
      rig.leftForearm.rotation.x = -0.1;
      rig.rightForearm.rotation.x = -0.1;

      rig.leftLeg.rotation.x = 0;
      rig.leftCalf.rotation.x = 0;
      rig.rightLeg.rotation.x = 0;
      rig.rightCalf.rotation.x = 0;
      return;
    }

    // Walking / Running Kinematics
    const isRunning = state === 'run';
    const freq = isRunning ? 12 : 6.8;
    const legAmp = isRunning ? 0.95 : 0.58;
    const armAmp = isRunning ? 0.85 : 0.48;

    const cycle = Math.sin(t * freq);
    const cosCycle = Math.cos(t * freq);

    // Natural hips bounce & sway
    const bounce = Math.abs(cosCycle) * (isRunning ? 0.09 : 0.045);
    rig.hips.position.y = 0.96 + bounce;
    rig.hips.rotation.y = Math.sin(t * freq) * (isRunning ? 0.12 : 0.06);

    // Torso forward sprint lean
    rig.torso.rotation.x = isRunning ? 0.22 : 0.06;

    // Opposite leg pendulums with active knee flex
    rig.leftLeg.rotation.x = cycle * legAmp;
    rig.rightLeg.rotation.x = -cycle * legAmp;

    // Knee bends when kicking backward, straightens when reaching forward
    rig.leftCalf.rotation.x = cycle < 0 ? Math.abs(cycle) * (isRunning ? 1.4 : 0.85) : 0.05;
    rig.rightCalf.rotation.x = cycle > 0 ? Math.abs(cycle) * (isRunning ? 1.4 : 0.85) : 0.05;

    // Arms swing opposite to legs with natural elbow bend
    rig.leftArm.rotation.x = -cycle * armAmp;
    rig.rightArm.rotation.x = cycle * armAmp;
    rig.leftForearm.rotation.x = -0.35 + Math.max(0, -cycle) * (isRunning ? 0.6 : 0.3);
    rig.rightForearm.rotation.x = -0.35 + Math.max(0, cycle) * (isRunning ? 0.6 : 0.3);
  }
}
