import * as THREE from 'three';

export interface InteriorScene {
  group: THREE.Group;
  type: string;
}

export class InteriorBuilder {
  /**
   * Builds distinct 3D interior props and lighting for entered locations.
   */
  public static buildInterior(type: string, position: { x: number; y: number; z: number }): THREE.Group {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    // Warm ambient point light inside
    const roomLight = new THREE.PointLight(0xffedd5, 1.5, 12, 1);
    roomLight.position.set(0, 2.5, 0);
    group.add(roomLight);

    switch (type) {
      case 'home':
        this.populateHome(group);
        break;
      case 'buka':
        this.populateBuka(group);
        break;
      case 'provisions':
        this.populateProvisions(group);
        break;
      case 'mechanic':
        this.populateMechanic(group);
        break;
      case 'chemist':
        this.populateChemist(group);
        break;
      case 'tech':
        this.populateTech(group);
        break;
    }

    return group;
  }

  private static populateHome(group: THREE.Group) {
    // Bed frame and Ankara patterned mattress
    const bedWood = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x582f14, roughness: 0.7 })
    );
    bedWood.position.set(-2.5, 0.2, 0);
    group.add(bedWood);

    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.25, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
    );
    mattress.position.set(-2.5, 0.45, 0);
    group.add(mattress);

    // Pillow
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.15, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    pillow.position.set(-3.2, 0.65, 0);
    group.add(pillow);

    // Study Desk & Chair
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
    );
    desk.position.set(2.2, 0.4, -1.0);
    group.add(desk);

    // Vintage transistor radio on desk
    const radio = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.2, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.4 })
    );
    radio.position.set(2.2, 0.9, -1.0);
    group.add(radio);

    // Living room floor rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.02, 0);
    group.add(rug);
  }

  private static populateBuka(group: THREE.Group) {
    // Stainless steel counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 1.0, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
    );
    counter.position.set(0, 0.5, -1.5);
    group.add(counter);

    // Steaming aluminum pots for Amala, Ewedu & Goat Meat
    [-1.2, 0, 1.2].forEach((px) => {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 })
      );
      pot.position.set(px, 1.2, -1.5);
      group.add(pot);
    });

    // Dining tables & chairs
    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
    );
    table.position.set(0, 0.4, 1.5);
    group.add(table);
  }

  private static populateProvisions(group: THREE.Group) {
    // Glass display counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 1.0, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 })
    );
    counter.position.set(0, 0.5, -1.2);
    group.add(counter);

    // Snack shelves along back wall
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 2.2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
    );
    shelf.position.set(0, 1.1, -2.8);
    group.add(shelf);

    // Indomie instant noodle cartons on shelf
    [-1.2, 0, 1.2].forEach((sx) => {
      const carton = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xef4444 }) // red indomie box
      );
      carton.position.set(sx, 1.2, -2.7);
      group.add(carton);
    });
  }

  private static populateMechanic(group: THREE.Group) {
    // Heavy wooden workbench
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.9, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 })
    );
    bench.position.set(0, 0.45, -2.0);
    group.add(bench);

    // Engine block on bench
    const engineBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 })
    );
    engineBlock.position.set(0, 1.2, -2.0);
    group.add(engineBlock);

    // Oil drum
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 1.0, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.4 })
    );
    drum.position.set(2.2, 0.5, -1.5);
    group.add(drum);
  }

  private static populateChemist(group: THREE.Group) {
    // Pharmacy dispensary counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.0, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 })
    );
    counter.position.set(0, 0.5, -1.2);
    group.add(counter);

    // White medicine medicine shelves
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.2, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    shelf.position.set(0, 1.1, -2.4);
    group.add(shelf);
  }

  private static populateTech(group: THREE.Group) {
    // Repair counter with soldering tools
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.95, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4 })
    );
    counter.position.set(0, 0.475, -1.2);
    group.add(counter);

    // Smartphone screen display & chargers
    const accessoryBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 2.0, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 })
    );
    accessoryBoard.position.set(0, 1.6, -2.2);
    group.add(accessoryBoard);
  }
}
