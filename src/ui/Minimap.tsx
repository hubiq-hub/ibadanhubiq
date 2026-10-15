import React, { useRef, useEffect } from 'react';
import { Mission } from '../types/game';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerRotY: number;
  activeMission: Mission | null;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  playerRotY,
  activeMission,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef(0);

  useEffect(() => {
    let pulseTime = 0;
    let animId = 0;

    const render = () => {
      pulseTime += 0.05;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 180;
      const center = size / 2;
      const radarRadius = center - 8;
      const scale = 0.95; // 1 meter = 0.95 pixels

      // Clear
      ctx.clearRect(0, 0, size, size);

      // Save and clip to circular radar
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
      ctx.clip();

      // Background laterite earth
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, size, size);

      // Rotate map with player heading so "Up" is where player is looking
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(playerRotY);

      const toMapX = (worldX: number) => (worldX - playerX) * scale;
      const toMapY = (worldZ: number) => (worldZ - playerZ) * scale;

      // 1. Dugbe Avenue (East-West at Z=0, width 14m)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(toMapX(-140), toMapY(-7), 280 * scale, 14 * scale);

      // Road dividing markings
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(toMapX(-140), toMapY(0));
      ctx.lineTo(toMapX(140), toMapY(0));
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Cross Road (North-South at X=0, width 12m)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(toMapX(-6), toMapY(7), 12 * scale, 95 * scale);

      // 3. Central Roundabout at (0, 0)
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(toMapX(0), toMapY(0), 7 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 4. Landmarks with labels
      const landmarks = [
        { x: -60, z: -16, label: '🍲 Buka', color: '#f59e0b' },
        { x: -25, z: -16, label: '🛒 Shop', color: '#3b82f6' },
        { x: 95, z: -16, label: '🔧 Garage', color: '#ef4444' },
        { x: 55, z: -16, label: '💊 Chemist', color: '#10b981' },
        { x: -95, z: -24, label: '⛽ Fuel', color: '#16a34a' },
        { x: -25, z: 50, label: '🏠 Home', color: '#eab308' },
        { x: 30, z: 46, label: '👑 Elder', color: '#a855f7' },
      ];

      landmarks.forEach((lm) => {
        const lx = toMapX(lm.x);
        const ly = toMapY(lm.z);
        ctx.fillStyle = lm.color;
        ctx.beginPath();
        ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 5. Active Mission Waypoint Route Line & In-Map Beacon
      let objectiveInScreen = false;
      let targetScreenX = 0;
      let targetScreenY = 0;
      let targetDistMeters = 0;
      let targetName = '';

      if (activeMission && activeMission.status === 'active') {
        const currentStep = activeMission.steps[activeMission.currentStepIndex];
        if (currentStep && currentStep.targetLocation) {
          targetName = currentStep.targetLocation.name;
          const dx = currentStep.targetLocation.x - playerX;
          const dz = currentStep.targetLocation.z - playerZ;
          targetDistMeters = Math.round(Math.hypot(dx, dz));

          const wx = toMapX(currentStep.targetLocation.x);
          const wy = toMapY(currentStep.targetLocation.z);
          targetScreenX = wx;
          targetScreenY = wy;

          const distFromCenter = Math.hypot(wx, wy);

          // Glowing Navigation Path line from player to destination
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(wx, wy);
          ctx.stroke();
          ctx.setLineDash([]);

          if (distFromCenter <= radarRadius - 10) {
            objectiveInScreen = true;
            // Pulsing target beacon wave
            const pulseRadius = 8 + (Math.sin(pulseTime * 4) + 1) * 6;
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wx, wy, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Diamond jewel
            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(wx, wy - 9);
            ctx.lineTo(wx + 8, wy);
            ctx.lineTo(wx, wy + 9);
            ctx.lineTo(wx - 8, wy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Text pill label next to waypoint
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(wx + 10, wy - 10, 85, 18);
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 1;
            ctx.strokeRect(wx + 10, wy - 10, 85, 18);
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`🎯 ${targetName}`, wx + 14, wy - 1);
          }
        }
      }

      ctx.restore(); // restore map rotation

      // 6. Draw Player Marker at Center (always pointing UP)
      ctx.fillStyle = '#22c55e'; // Nigerian Green
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(center, center - 10);
      ctx.lineTo(center + 7, center + 8);
      ctx.lineTo(center, center + 4);
      ctx.lineTo(center - 7, center + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 7. Off-Screen Objective Edge Pointer
      // If the destination is outside the radar circle, draw an illuminated arrow on the edge pointing directly to it!
      if (!objectiveInScreen && activeMission && activeMission.status === 'active') {
        const currentStep = activeMission.steps[activeMission.currentStepIndex];
        if (currentStep && currentStep.targetLocation) {
          // Angle in screen space
          const dx = currentStep.targetLocation.x - playerX;
          const dz = currentStep.targetLocation.z - playerZ;
          const worldAngle = Math.atan2(dx, dz);
          const screenAngle = worldAngle + playerRotY;

          const edgeDist = radarRadius - 14;
          const ex = center + Math.sin(screenAngle) * edgeDist;
          const ey = center + Math.cos(screenAngle) * edgeDist;

          // Glowing beacon pointer
          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(-screenAngle + Math.PI / 2);

          // Pointer Triangle
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(-6, -8);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-6, 8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.restore();

          // Distance Pill
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(ex - 22, ey - 7, 44, 14);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1;
          ctx.strokeRect(ex - 22, ey - 7, 44, 14);
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${targetDistMeters}m`, ex, ey);
        }
      }

      ctx.restore(); // restore circular clipping

      // Outer Radar Rim
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal 'N' Compass Marker on Rim
      const northAngle = -playerRotY - Math.PI / 2;
      const nx = center + Math.cos(northAngle) * (radarRadius - 9);
      const ny = center + Math.sin(northAngle) * (radarRadius - 9);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', nx, ny);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    animFrameRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playerX, playerZ, playerRotY, activeMission]);

  // Compute distance and target name for HUD badge
  let objectiveDistance: number | null = null;
  let targetLocationName: string = '';
  if (activeMission && activeMission.status === 'active') {
    const step = activeMission.steps[activeMission.currentStepIndex];
    if (step && step.targetLocation) {
      targetLocationName = step.targetLocation.name;
      objectiveDistance = Math.round(
        Math.hypot(step.targetLocation.x - playerX, step.targetLocation.z - playerZ)
      );
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-44 h-44 rounded-full shadow-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500">
        <canvas ref={canvasRef} width={180} height={180} className="w-full h-full" />
      </div>
      {objectiveDistance !== null && (
        <div className="mt-1.5 px-3 py-1 rounded-xl bg-slate-900/95 border-2 border-amber-400 text-amber-300 text-xs font-black shadow-xl flex items-center gap-1.5 animate-pulse">
          <span>🎯</span>
          <span>{targetLocationName}: {objectiveDistance}m</span>
        </div>
      )}
    </div>
  );
};
