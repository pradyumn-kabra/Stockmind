"use client";

import React from 'react';

interface Inventory3DAccentProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A lightweight, pure CSS 3D isometric inventory cube stack in warm brown & beige tokens.
 * Zero external 3D libraries required. Hardware-accelerated and respects prefers-reduced-motion.
 */
export const Inventory3DAccent: React.FC<Inventory3DAccentProps> = ({
  className = '',
  size = 'md',
}) => {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.0 : 0.8;

  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{
        width: `${120 * scale}px`,
        height: `${120 * scale}px`,
        perspective: '800px',
      }}
      aria-hidden="true"
    >
      {/* 3D Isometric Rotating Assembly */}
      <div
        className="w-full h-full relative animate-cube-3d flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Soft Ambient Ground Shadow */}
        <div
          className="absolute -bottom-4 w-20 h-10 bg-[#4E342E]/10 rounded-full blur-md"
          style={{ transform: 'rotateX(75deg) translateZ(-30px)' }}
        />

        {/* Isometric Cube Group */}
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Gradients for warm brown realistic shading */}
            {/* Cube 1: Dark Base Container */}
            <linearGradient id="cubeTop1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8D6E63" />
              <stop offset="100%" stopColor="#795548" />
            </linearGradient>
            <linearGradient id="cubeLeft1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="100%" stopColor="#4E342E" />
            </linearGradient>
            <linearGradient id="cubeRight1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4E342E" />
              <stop offset="100%" stopColor="#3E2723" />
            </linearGradient>

            {/* Cube 2: Warm Brown Secondary Box */}
            <linearGradient id="cubeTop2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A1887F" />
              <stop offset="100%" stopColor="#8D6E63" />
            </linearGradient>
            <linearGradient id="cubeLeft2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D4C41" />
              <stop offset="100%" stopColor="#5D4037" />
            </linearGradient>
            <linearGradient id="cubeRight2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="100%" stopColor="#4E342E" />
            </linearGradient>

            {/* Cube 3: Top Beige Parcel */}
            <linearGradient id="cubeTop3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5EBE1" />
              <stop offset="100%" stopColor="#EDE4D9" />
            </linearGradient>
            <linearGradient id="cubeLeft3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D7CCC8" />
              <stop offset="100%" stopColor="#C7A992" />
            </linearGradient>
            <linearGradient id="cubeRight3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C7A992" />
              <stop offset="100%" stopColor="#B08968" />
            </linearGradient>
          </defs>

          {/* === CUBE 1 (Bottom Left Base) === */}
          <g transform="translate(15, 60)">
            {/* Top Face */}
            <polygon points="40,0 80,22 40,44 0,22" fill="url(#cubeTop1)" />
            {/* Left Face */}
            <polygon points="0,22 40,44 40,84 0,62" fill="url(#cubeLeft1)" />
            {/* Right Face */}
            <polygon points="40,44 80,22 80,62 40,84" fill="url(#cubeRight1)" />
            {/* Fine Edge Seam */}
            <polyline points="0,22 40,44 80,22" fill="none" stroke="#A1887F" strokeWidth="0.8" opacity="0.6" />
            <line x1="40" y1="44" x2="40" y2="84" stroke="#3E2723" strokeWidth="0.8" opacity="0.8" />
          </g>

          {/* === CUBE 2 (Bottom Right Base) === */}
          <g transform="translate(65, 45)">
            {/* Top Face */}
            <polygon points="35,0 70,19 35,38 0,19" fill="url(#cubeTop2)" />
            {/* Left Face */}
            <polygon points="0,19 35,38 35,74 0,55" fill="url(#cubeLeft2)" />
            {/* Right Face */}
            <polygon points="35,38 70,19 70,55 35,74" fill="url(#cubeRight2)" />
            {/* Edge line */}
            <polyline points="0,19 35,38 70,19" fill="none" stroke="#D7CCC8" strokeWidth="0.7" opacity="0.5" />
          </g>

          {/* === CUBE 3 (Top Balanced Parcel) === */}
          <g transform="translate(42, 12)">
            {/* Top Face */}
            <polygon points="38,0 76,20 38,40 0,20" fill="url(#cubeTop3)" />
            {/* Packaging Seal Ribbon */}
            <polygon points="34,0 42,0 42,40 34,40" fill="#795548" opacity="0.35" />
            {/* Left Face */}
            <polygon points="0,20 38,40 38,76 0,56" fill="url(#cubeLeft3)" />
            {/* Right Face */}
            <polygon points="38,40 76,20 76,56 38,76" fill="url(#cubeRight3)" />
            {/* Edge Highlights */}
            <polyline points="0,20 38,40 76,20" fill="none" stroke="#FFFFFF" strokeWidth="0.9" opacity="0.7" />
            <line x1="38" y1="40" x2="38" y2="76" stroke="#8D6E63" strokeWidth="0.8" opacity="0.6" />
          </g>
        </svg>
      </div>
    </div>
  );
};
