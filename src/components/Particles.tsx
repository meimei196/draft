import { useState } from 'react';

export interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  swayDuration: number;
  opacity: number;
}

interface ParticlesProps {
  density?: 'normal' | 'dense' | 'portal';
  className?: string;
}

function generateParticleList(density: 'normal' | 'dense' | 'portal'): Particle[] {
  let count = 20;
  if (density === 'portal') {
    count = 26;
  } else if (density === 'dense') {
    count = 24;
  }

  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // Delicately sized starlight 7px - 13px (prevents clutter & mobile lag)
    const size = Math.random() * 6 + 7;
    const duration = Math.random() * 5 + 7.5; // 7.5s - 12.5s gentle float
    const delay = -(Math.random() * duration);

    list.push({
      id: i,
      x: Math.random() * 100, // 0% - 100% width
      size,
      duration,
      delay,
      swayDuration: Math.random() * 2 + 2.5,
      opacity: Math.random() * 0.3 + 0.45, // Soft elegant glow
    });
  }
  return list;
}

export function Particles({ density = 'normal', className = '' }: ParticlesProps) {
  // Synchronous initialization so particles render on very first frame with no delay
  const [particles] = useState<Particle[]>(() => generateParticleList(density));

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-[80] ${className}`} 
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none will-change-transform"
          style={{
            left: `${p.x}%`,
            top: '-25px',
            animation: `sparkleFall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <span
            className="inline-block text-white leading-none font-sans select-none pointer-events-none"
            style={{
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 6px rgba(244, 114, 182, 0.6))',
              animation: `sparkleDrift ${p.swayDuration}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay * 0.4}s`,
            }}
          >
            ✦
          </span>
        </div>
      ))}
    </div>
  );
}
