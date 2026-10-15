import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterConfig } from '../types/game';
import { PlayerModelFactory, PlayerRig } from '../entities/playerModel';
import { SaveSystem } from '../systems/saveSystem';

interface MainMenuProps {
  onStartNewGame: (character: CharacterConfig) => void;
  onContinueGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
}) => {
  const [view, setView] = useState<'title' | 'character_select' | 'about'>('title');
  const [hasSave, setHasSave] = useState(false);

  // Character Select state
  const [name, setName] = useState('Babatunde');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [outfit, setOutfit] = useState<'traditional' | 'casual' | 'rider'>('traditional');
  const [skinTone, setSkinTone] = useState('#45220c');
  const [clothingColor, setClothingColor] = useState('#047857');
  const [headwear, setHeadwear] = useState(true);

  // 3D Preview Canvas ref
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewSceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    rig: PlayerRig;
    animId: number;
  } | null>(null);

  useEffect(() => {
    setHasSave(SaveSystem.hasSave());
  }, []);

  // Character preview setup
  useEffect(() => {
    if (view !== 'character_select' || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const width = 240;
    const height = 320;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 1.0, 0);

    // Warm Studio Key Light & Cool Fill
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x1e293b, 1.0);
    scene.add(hemiLight);

    // Initial character model
    let rig = PlayerModelFactory.createPlayer({
      name,
      gender,
      outfit,
      skinTone,
      clothingColor,
      headwear,
    });
    scene.add(rig.root);

    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // Gentle rotation for inspection
      rig.root.rotation.y += 0.8 * dt;

      // Idle breathing animation
      PlayerModelFactory.updateAnimation(rig, dt, 'idle');

      renderer.render(scene, camera);
    };

    animate();

    previewSceneRef.current = { renderer, scene, camera, rig, animId };

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      previewSceneRef.current = null;
    };
  }, [view]);

  // Update preview model when customization changes
  useEffect(() => {
    if (!previewSceneRef.current) return;
    const { scene, rig } = previewSceneRef.current;
    scene.remove(rig.root);

    const newRig = PlayerModelFactory.createPlayer({
      name,
      gender,
      outfit,
      skinTone,
      clothingColor,
      headwear,
    });
    scene.add(newRig.root);
    previewSceneRef.current.rig = newRig;
  }, [name, gender, outfit, skinTone, clothingColor, headwear]);

  const selectPreset = (presetName: string) => {
    if (presetName === 'Babatunde') {
      setName('Babatunde');
      setGender('male');
      setOutfit('traditional');
      setSkinTone('#45220c');
      setClothingColor('#047857');
      setHeadwear(true);
    } else if (presetName === 'Chuka') {
      setName('Chuka');
      setGender('male');
      setOutfit('casual');
      setSkinTone('#5c3014');
      setClothingColor('#1e3a8a');
      setHeadwear(false);
    } else if (presetName === 'Aisha') {
      setName('Aisha');
      setGender('female');
      setOutfit('traditional');
      setSkinTone('#3f1d0a');
      setClothingColor('#d97706');
      setHeadwear(false);
    } else if (presetName === 'Femi') {
      setName('Femi');
      setGender('male');
      setOutfit('rider');
      setSkinTone('#4d260e');
      setClothingColor('#dc2626');
      setHeadwear(false);
    }
  };

  const handleStartGame = () => {
    onStartNewGame({
      name: name.trim() || 'Babatunde',
      gender,
      outfit,
      skinTone,
      clothingColor,
      headwear,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-emerald-950 via-slate-950 to-black select-none text-white">
      {/* Background visual motif */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/25 via-transparent to-transparent pointer-events-none" />

      {view === 'title' && (
        <div className="relative w-full max-w-lg bg-slate-900/90 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-6 backdrop-blur-md">
          {/* Logo */}
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/80 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
              Oyo State • Nigeria
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              HUBIQ <span className="text-emerald-400">LIFE</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xs mx-auto">
              Third-Person 3D Open-World Life Simulation & Adventure in Ibadan
            </p>
          </div>

          {/* Action Menu */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => setView('character_select')}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-base shadow-xl border border-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⭐</span>
              <span>New Game</span>
            </button>

            <button
              disabled={!hasSave}
              onClick={onContinueGame}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 ${
                hasSave
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-600/80 cursor-pointer active:scale-98'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <span>💾</span>
              <span>{hasSave ? 'Continue Saved Game' : 'No Save Found'}</span>
            </button>

            <button
              onClick={() => setView('about')}
              className="w-full py-2.5 px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 font-semibold text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              About the Game & Controls
            </button>
          </div>

          {/* Cultural Footer */}
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Built with Three.js WebGL Engine</span>
            <span>•</span>
            <span>Zero Python</span>
            <span>•</span>
            <span>100% Browser Native</span>
          </div>
        </div>
      )}

      {view === 'character_select' && (
        <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-emerald-500 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 backdrop-blur-md max-h-[90vh] overflow-y-auto">
          <div className="border-b border-slate-700/80 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-emerald-300">Choose Your Character</h2>
              <p className="text-xs text-slate-400">Customize your avatar for the streets of Ibadan</p>
            </div>
            <button
              onClick={() => setView('title')}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 cursor-pointer"
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            {/* 3D Model Rotating Preview */}
            <div className="flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl border border-emerald-800/50 p-3 h-72 relative shadow-inner">
              <canvas ref={previewCanvasRef} className="w-full h-full object-contain" />
              <span className="absolute bottom-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Interactive 3D Preview
              </span>
            </div>

            {/* Customization Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Character Name
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white font-bold text-sm outline-none"
                  placeholder="Enter name..."
                />
              </div>

              {/* Presets */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Popular Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Babatunde', 'Chuka', 'Aisha', 'Femi'].map((p) => (
                    <button
                      key={p}
                      onClick={() => selectPreset(p)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        name === p
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outfit Style */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Clothing Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['traditional', 'casual', 'rider'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setOutfit(style)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize border transition-colors cursor-pointer ${
                        outfit === style
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headwear Toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-medium text-slate-300">Wear Yoruba Fila Cap</span>
                <input
                  type="checkbox"
                  checked={headwear}
                  onChange={(e) => setHeadwear(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/80 pt-4 flex justify-end">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-base shadow-xl border border-emerald-400 transition-all cursor-pointer"
            >
              Enter Ibadan City →
            </button>
          </div>
        </div>
      )}

      {view === 'about' && (
        <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
          <div className="border-b border-slate-700/80 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-emerald-300">About Hubiq Life</h2>
            <button
              onClick={() => setView('title')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
            >
              Back
            </button>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              <strong className="text-emerald-400">Hubiq Life</strong> is an immersive third-person 3D open-world life simulator set in the historic city of Ibadan, Oyo State, Nigeria.
            </p>
            <p>
              Experience the bustling energy of Dugbe Avenue, the warmth of neighborhood compounds in Bodija, savor hot Amala and Ewedu at Iya Moria’s Buka, ride commercial Bajaj Boxer Okadas, cruise in deep blue Ibadan Micra taxis, and build your wealth in Nigerian Naira.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <p className="font-bold text-emerald-300">🎮 Desktop Controls:</p>
              <p>• Move: <span className="text-white">W, A, S, D / Arrow Keys</span></p>
              <p>• Sprint: <span className="text-white">Shift</span></p>
              <p>• Jump: <span className="text-white">Space</span></p>
              <p>• Interact / Ride: <span className="text-white">E Key</span></p>
              <p>• Exit Vehicle: <span className="text-white">F Key</span></p>
              <p>• Vehicle Horn: <span className="text-white">H Key</span></p>
              <p>• Inventory: <span className="text-white">I Key</span></p>
              <p>• Pause: <span className="text-white">Esc</span></p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <p className="font-bold text-emerald-300">📱 Mobile Android Controls:</p>
              <p>• Virtual joystick on bottom-left for directional movement.</p>
              <p>• Swipe/drag screen for 360° camera orbit.</p>
              <p>• Touch action buttons for RUN, JUMP, ACTION/INTERACT, EXIT, and HORN.</p>
            </div>
          </div>

          <button
            onClick={() => setView('title')}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      )}
    </div>
  );
};
