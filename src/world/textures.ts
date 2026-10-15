import * as THREE from 'three';

/**
 * Procedural canvas-based texture generator for Hubiq Life.
 * 100% procedural, no external image assets required, fully offline capable.
 */

export class TextureGenerator {
  // Cache to prevent duplicate canvas creations
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Ibadan Iconic "Brown Roof" - Corrugated rusty zinc sheets
   */
  public static getCorrugatedRoofTexture(): THREE.CanvasTexture {
    const key = 'roof_corrugated_brown';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#7a3818';
      ctx.fillRect(0, 0, 512, 512);

      const ridgeCount = 32;
      const ridgeWidth = 512 / ridgeCount;
      for (let i = 0; i < ridgeCount; i++) {
        const x = i * ridgeWidth;
        const grad = ctx.createLinearGradient(x, 0, x + ridgeWidth, 0);
        grad.addColorStop(0, '#59260e');
        grad.addColorStop(0.3, '#9c4d23');
        grad.addColorStop(0.6, '#b05929');
        grad.addColorStop(1, '#471c08');
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, ridgeWidth, 512);
      }

      for (let p = 0; p < 80; p++) {
        const px = Math.random() * 512;
        const py = Math.random() * 512;
        const radius = 6 + Math.random() * 28;
        const rustGrad = ctx.createRadialGradient(px, py, 2, px, py, radius);
        rustGrad.addColorStop(0, 'rgba(84, 32, 10, 0.7)');
        rustGrad.addColorStop(0.6, 'rgba(128, 56, 18, 0.45)');
        rustGrad.addColorStop(1, 'rgba(128, 56, 18, 0)');
        ctx.fillStyle = rustGrad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Nigerian Laterite red-earth roadside soil
   */
  public static getLateriteSoilTexture(): THREE.CanvasTexture {
    const key = 'laterite_soil';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#a64a2b';
      ctx.fillRect(0, 0, 256, 256);

      for (let i = 0; i < 600; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const col = Math.random() > 0.5 ? '#82371d' : '#c9643d';
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Asphalt Road with white/yellow center markings
   */
  public static getAsphaltRoadTexture(): THREE.CanvasTexture {
    const key = 'asphalt_road';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#2d3134';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.5 ? '#1f2224' : '#3d4145';
        ctx.fillRect(x, y, 2, 2);
      }

      ctx.fillStyle = '#eab308'; // Amber road marking
      const dashH = 48;
      const gap = 32;
      for (let y = 0; y < 512; y += dashH + gap) {
        ctx.fillRect(250, y, 12, dashH);
      }

      ctx.fillStyle = 'rgba(230, 230, 230, 0.7)';
      ctx.fillRect(20, 0, 8, 512);
      ctx.fillRect(484, 0, 8, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Sandcrete block wall with mortar seams
   */
  public static getSandcreteWallTexture(tint: string = '#d1c7bd'): THREE.CanvasTexture {
    const key = `sandcrete_wall_${tint}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = 'rgba(80, 75, 70, 0.4)';
      ctx.lineWidth = 3;
      const blockH = 32;
      const blockW = 64;

      for (let row = 0; row < 8; row++) {
        const y = row * blockH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();

        const offset = (row % 2) * (blockW / 2);
        for (let x = offset; x < 256; x += blockW) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + blockH);
          ctx.stroke();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Authentic Nigerian Commercial Signboards
   */
  public static getSignboardTexture(
    title: string,
    subtitle: string,
    bgColor: string,
    textColor: string = '#ffffff',
    accentColor: string = '#facc15'
  ): THREE.CanvasTexture {
    const key = `sign_${title}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 512, 160);

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 148);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, 256, 60);

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(subtitle, 256, 110);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Ankara fabric texture for Nigerian outfits
   */
  public static getAnkaraPattern(primaryColor: string = '#047857', secondaryColor: string = '#f59e0b'): THREE.CanvasTexture {
    const key = `ankara_${primaryColor}_${secondaryColor}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, 256, 256);

      // Micro fabric weave
      for (let i = 0; i < 256; i += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(i, 0, 2, 256);
        ctx.fillRect(0, i, 256, 2);
      }

      // Traditional floral / geometric motifs
      ctx.fillStyle = secondaryColor;
      for (let x = 32; x < 256; x += 64) {
        for (let y = 32; y < 256; y += 64) {
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = secondaryColor;
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Nigerian Vehicle License Plate
   */
  public static getLicensePlateTexture(numberStr: string = 'IBD - 482 - AG'): THREE.CanvasTexture {
    const key = `plate_${numberStr}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // White plate with green border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 96);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 250, 90);

      // Top state header
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OYO STATE • PACE SETTER', 128, 24);

      // Main plate number
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 32px monospace';
      ctx.fillText(numberStr, 128, 62);

      // Mini Nigerian Flag in corner
      ctx.fillStyle = '#15803d';
      ctx.fillRect(16, 42, 6, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(22, 42, 6, 24);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(28, 42, 6, 24);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Motorcycle Fuel Tank Graphic (Boxer 100 style)
   */
  public static getMotorcycleTankTexture(baseColor: string = '#dc2626'): THREE.CanvasTexture {
    const key = `tank_${baseColor}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 256, 128);

      // Silver racing pinstripes
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(30, 35);
      ctx.lineTo(230, 25);
      ctx.lineTo(235, 42);
      ctx.lineTo(40, 52);
      ctx.closePath();
      ctx.fill();

      // Black accent stripe
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(40, 55);
      ctx.lineTo(235, 45);
      ctx.lineTo(240, 62);
      ctx.lineTo(50, 72);
      ctx.closePath();
      ctx.fill();

      // Brand badge text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BOXER 100', 140, 100);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Vehicle Instrument Speedometer & Gauges
   */
  public static getGaugeTexture(): THREE.CanvasTexture {
    const key = 'gauge_dial';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 128, 128);

      // Dial circle
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0.8 * Math.PI, 2.2 * Math.PI);
      ctx.stroke();

      // Ticks
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let a = 0.8 * Math.PI; a <= 2.2 * Math.PI; a += 0.2 * Math.PI) {
        const x1 = 64 + Math.cos(a) * 44;
        const y1 = 64 + Math.sin(a) * 44;
        const x2 = 64 + Math.cos(a) * 52;
        const y2 = 64 + Math.sin(a) * 52;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Needle in orange
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(64, 64);
      ctx.lineTo(64 + Math.cos(1.4 * Math.PI) * 42, 64 + Math.sin(1.4 * Math.PI) * 42);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('km/h', 64, 90);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Headlight Reflector textured pattern
   */
  public static getHeadlightLensTexture(): THREE.CanvasTexture {
    const key = 'headlight_lens';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#fef08a');
      grad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      // Fluted glass lines
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      for (let x = 8; x < 128; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 128);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }
}
