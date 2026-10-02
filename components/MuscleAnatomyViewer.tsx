import React, { useState } from 'react';
import { MuscleGroup } from '../types';

interface MuscleAnatomyViewerProps {
  muscleGroup: MuscleGroup;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  defaultView?: 'front' | 'back';
  className?: string;
}

export const MuscleAnatomyViewer: React.FC<MuscleAnatomyViewerProps> = ({
  muscleGroup,
  primaryMuscles = [],
  secondaryMuscles = [],
  defaultView = 'front',
  className = '',
}) => {
  const [view, setView] = useState<'front' | 'back'>(defaultView);

  // Determine which muscle groups are active in Front and Back views
  const isChestActive = muscleGroup === 'chest' && view === 'front';
  const isAbsActive = muscleGroup === 'core' && view === 'front';
  const isQuadsActive = muscleGroup === 'legs' && view === 'front';
  const isBicepsActive = muscleGroup === 'arms' && view === 'front';
  const isFrontDeltsActive = (muscleGroup === 'shoulders' || muscleGroup === 'chest') && view === 'front';

  const isLatsActive = muscleGroup === 'back' && view === 'back';
  const isUpperBackActive = (muscleGroup === 'back' || muscleGroup === 'shoulders') && view === 'back';
  const isGlutesActive = muscleGroup === 'legs' && view === 'back';
  const isHamstringsActive = muscleGroup === 'legs' && view === 'back';
  const isTricepsActive = (muscleGroup === 'arms' || muscleGroup === 'chest') && view === 'back';
  const isCalvesActive = muscleGroup === 'legs' && view === 'back';

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden select-none ${className}`}>
      {/* Background glow radial */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />

      {/* View Switcher Controls */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800/80 mb-3 z-10">
        <button
          type="button"
          onClick={() => setView('front')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all ${
            view === 'front'
              ? 'bg-gradient-to-r from-emerald-500 to-brand-500 text-white shadow-md shadow-brand-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Fronte
        </button>
        <button
          type="button"
          onClick={() => setView('back')}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all ${
            view === 'back'
              ? 'bg-gradient-to-r from-emerald-500 to-brand-500 text-white shadow-md shadow-brand-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Retro
        </button>
      </div>

      {/* Anatomical Model Graphic */}
      <div className="relative w-44 h-64 flex items-center justify-center">
        <svg
          viewBox="0 0 200 320"
          className="w-full h-full drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="activeMuscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Neutral Body Silhouette Wireframe */}
          {/* Head & Neck */}
          <ellipse cx="100" cy="30" rx="14" ry="18" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <path d="M94 47 C94 54 106 54 106 47" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

          {/* FRONT VIEW */}
          {view === 'front' && (
            <g id="front-anatomy">
              {/* Shoulders / Deltoids (Left & Right) */}
              <path
                d="M68 62 C64 68 63 80 67 88 C72 84 76 74 76 65 Z"
                fill={isFrontDeltsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isFrontDeltsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isFrontDeltsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M132 62 C136 68 137 80 133 88 C128 84 124 74 124 65 Z"
                fill={isFrontDeltsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isFrontDeltsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isFrontDeltsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Chest / Pectorals */}
              <path
                d="M77 65 C85 64 96 68 98 84 C88 88 78 84 75 75 Z"
                fill={isChestActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isChestActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isChestActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M123 65 C115 64 104 68 102 84 C112 88 122 84 125 75 Z"
                fill={isChestActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isChestActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isChestActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Biceps (Arms) */}
              <path
                d="M64 88 C59 95 60 112 65 118 C68 114 70 102 67 90 Z"
                fill={isBicepsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isBicepsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isBicepsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M136 88 C141 95 140 112 135 118 C132 114 130 102 133 90 Z"
                fill={isBicepsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isBicepsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isBicepsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Forearms */}
              <path d="M62 122 C56 130 55 148 60 155 C64 150 67 138 65 125 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <path d="M138 122 C144 130 145 148 140 155 C136 150 133 138 135 125 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

              {/* Abs / Core */}
              <g
                fill={isAbsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isAbsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isAbsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              >
                {/* 6-pack grid */}
                <rect x="88" y="88" width="10" height="9" rx="2" />
                <rect x="102" y="88" width="10" height="9" rx="2" />
                <rect x="88" y="100" width="10" height="9" rx="2" />
                <rect x="102" y="100" width="10" height="9" rx="2" />
                <rect x="88" y="112" width="10" height="11" rx="2" />
                <rect x="102" y="112" width="10" height="11" rx="2" />
              </g>

              {/* Pelvis */}
              <path d="M83 126 L117 126 L108 145 L92 145 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

              {/* Quadriceps (Thighs) */}
              <path
                d="M80 148 C75 160 74 195 81 212 C88 210 93 190 94 150 Z"
                fill={isQuadsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isQuadsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isQuadsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M120 148 C125 160 126 195 119 212 C112 210 107 190 106 150 Z"
                fill={isQuadsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isQuadsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isQuadsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Knees */}
              <circle cx="85" cy="218" r="4.5" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <circle cx="115" cy="218" r="4.5" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

              {/* Tibia & Calves (Lower Leg) */}
              <path d="M82 225 C80 240 81 275 84 285 C87 282 89 265 89 225 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <path d="M118 225 C120 240 119 275 116 285 C113 282 111 265 111 225 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

              {/* Feet */}
              <ellipse cx="84" cy="292" rx="6" ry="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <ellipse cx="116" cy="292" rx="6" ry="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            </g>
          )}

          {/* BACK VIEW */}
          {view === 'back' && (
            <g id="back-anatomy">
              {/* Trapezius / Upper Back */}
              <path
                d="M87 49 L113 49 L126 62 L100 88 L74 62 Z"
                fill={isUpperBackActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isUpperBackActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isUpperBackActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Latissimus Dorsi (Lats) */}
              <path
                d="M73 66 C70 82 72 105 84 122 C92 115 97 95 98 88 Z"
                fill={isLatsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isLatsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isLatsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M127 66 C130 82 128 105 116 122 C108 115 103 95 102 88 Z"
                fill={isLatsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isLatsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isLatsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Triceps (Back of arms) */}
              <path
                d="M65 88 C60 95 61 112 66 118 C69 114 71 102 68 90 Z"
                fill={isTricepsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isTricepsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isTricepsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M135 88 C140 95 139 112 134 118 C131 114 129 102 132 90 Z"
                fill={isTricepsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isTricepsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isTricepsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Glutes */}
              <path
                d="M80 126 C75 142 82 158 97 156 C98 140 96 130 88 126 Z"
                fill={isGlutesActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isGlutesActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isGlutesActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M120 126 C125 142 118 158 103 156 C102 140 104 130 112 126 Z"
                fill={isGlutesActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isGlutesActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isGlutesActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Hamstrings (Back of Thighs) */}
              <path
                d="M80 160 C76 175 75 198 82 212 C88 208 92 190 94 162 Z"
                fill={isHamstringsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isHamstringsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isHamstringsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M120 160 C124 175 125 198 118 212 C112 208 108 190 106 162 Z"
                fill={isHamstringsActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isHamstringsActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isHamstringsActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />

              {/* Calves (Gastrocnemius) */}
              <path
                d="M80 226 C76 238 78 265 83 275 C88 268 89 250 88 226 Z"
                fill={isCalvesActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isCalvesActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isCalvesActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
              <path
                d="M120 226 C124 238 122 265 117 275 C112 268 111 250 112 226 Z"
                fill={isCalvesActive ? "url(#activeMuscleGrad)" : "#1e293b"}
                stroke={isCalvesActive ? "#6ee7b7" : "#334155"}
                strokeWidth="1.5"
                filter={isCalvesActive ? "url(#emeraldGlow)" : undefined}
                className="transition-colors duration-300"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Muscle Focus Label Badges */}
      <div className="mt-3 flex flex-wrap gap-1.5 justify-center max-w-xs z-10">
        {primaryMuscles.map((muscle, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-400 shadow-sm"
          >
            ● {muscle}
          </span>
        ))}
        {secondaryMuscles.map((sec, idx) => (
          <span
            key={`sec-${idx}`}
            className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-semibold text-slate-400"
          >
            {sec}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MuscleAnatomyViewer;
