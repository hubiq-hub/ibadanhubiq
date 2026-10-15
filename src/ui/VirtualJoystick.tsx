import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (input: { x: number; y: number }) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const radius = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (touchIdRef.current === null || !containerRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist > radius) {
          dx = (dx / dist) * radius;
          dy = (dy / dist) * radius;
        }

        setKnobPos({ x: dx, y: dy });
        onMove({ x: dx / radius, y: -dy / radius }); // invert Y so up is positive forward
        break;
      }
    }
  }, [onMove, radius]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        break;
      }
    }
  }, [onMove]);

  useEffect(() => {
    const onWindowTouchMove = (e: TouchEvent) => {
      if (active) handleTouchMove(e);
    };
    const onWindowTouchEnd = (e: TouchEvent) => {
      if (active) handleTouchEnd(e);
    };

    window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
    window.addEventListener('touchend', onWindowTouchEnd);
    window.addEventListener('touchcancel', onWindowTouchEnd);

    return () => {
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
      window.removeEventListener('touchcancel', onWindowTouchEnd);
    };
  }, [active, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      className={`relative w-28 h-28 rounded-full border-2 ${
        active ? 'border-emerald-400 bg-emerald-950/40' : 'border-white/30 bg-black/30'
      } select-none touch-none backdrop-blur-sm flex items-center justify-center`}
    >
      <div
        className="w-12 h-12 rounded-full bg-emerald-500/80 border-2 border-emerald-300 shadow-lg pointer-events-none transition-transform duration-75"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      />
    </div>
  );
};
