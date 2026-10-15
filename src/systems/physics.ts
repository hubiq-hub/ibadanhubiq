import { Collider } from '../world/cityBuilder';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export class PhysicsSystem {
  /**
   * Tests if a sphere/point with radius collides with any registered box colliders.
   */
  public static checkCollision(
    x: number,
    z: number,
    radius: number,
    colliders: Collider[]
  ): Collider | null {
    for (const c of colliders) {
      if (
        x + radius > c.minX &&
        x - radius < c.maxX &&
        z + radius > c.minZ &&
        z - radius < c.maxZ
      ) {
        return c;
      }
    }
    return null;
  }

  /**
   * Resolves player movement with sliding along obstacle walls
   */
  public static moveWithCollision(
    current: Position3D,
    dx: number,
    dz: number,
    radius: number,
    colliders: Collider[]
  ): Position3D {
    let newX = current.x + dx;
    let newZ = current.z + dz;

    // Boundary clamp (-135 to 135)
    newX = Math.max(-135, Math.min(135, newX));
    newZ = Math.max(-135, Math.min(135, newZ));

    // Test both axes together
    if (!this.checkCollision(newX, newZ, radius, colliders)) {
      return { x: newX, y: current.y, z: newZ };
    }

    // Try sliding on X axis only
    if (!this.checkCollision(newX, current.z, radius, colliders)) {
      return { x: newX, y: current.y, z: current.z };
    }

    // Try sliding on Z axis only
    if (!this.checkCollision(current.x, newZ, radius, colliders)) {
      return { x: current.x, y: current.y, z: newZ };
    }

    // Blocked on both axes
    return { x: current.x, y: current.y, z: current.z };
  }

  /**
   * Vehicle movement with acceleration, turning, friction, and collision
   */
  public static updateVehiclePhysics(
    pos: Position3D,
    rotY: number,
    speed: number,
    throttle: number, // -1 (reverse) to +1 (forward)
    steer: number, // -1 (left) to +1 (right)
    dt: number,
    maxSpeed: number,
    accelRate: number,
    radius: number,
    colliders: Collider[]
  ): { newPos: Position3D; newRotY: number; newSpeed: number } {
    let newSpeed = speed;

    if (throttle !== 0) {
      newSpeed += throttle * accelRate * dt;
      newSpeed = Math.max(-maxSpeed * 0.4, Math.min(maxSpeed, newSpeed));
    } else {
      // Natural deceleration / friction
      const friction = 14 * dt;
      if (newSpeed > 0) {
        newSpeed = Math.max(0, newSpeed - friction);
      } else if (newSpeed < 0) {
        newSpeed = Math.min(0, newSpeed + friction);
      }
    }

    // Steering only takes effect when moving
    let newRotY = rotY;
    if (Math.abs(newSpeed) > 0.1) {
      const turnMultiplier = newSpeed > 0 ? 1 : -1;
      newRotY -= steer * 1.8 * dt * turnMultiplier;
    }

    // Forward displacement vector
    const dx = Math.sin(newRotY) * newSpeed * dt;
    const dz = Math.cos(newRotY) * newSpeed * dt;

    const resolved = this.moveWithCollision(pos, dx, dz, radius, colliders);

    // If vehicle collided and stopped, damp speed
    if (resolved.x === pos.x && resolved.z === pos.z && Math.abs(newSpeed) > 2) {
      newSpeed = -newSpeed * 0.2; // slight rebound
    }

    return {
      newPos: resolved,
      newRotY,
      newSpeed,
    };
  }
}
