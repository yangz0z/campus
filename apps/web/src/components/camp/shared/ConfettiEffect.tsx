'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#16a34a', '#22c55e', '#f59e0b', '#fbbf24', '#4ade80', '#fcd34d'];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  size: number;
  duration: number;
}

export default function ConfettiEffect() {
  const [visible, setVisible] = useState(true);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 500,
      y: Math.random() * 400 + 200,
      rotate: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      duration: Math.random() * 1 + 1.2,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: '50vw',
            y: '-10px',
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: `calc(50vw + ${p.x}px)`,
            y: p.y,
            rotate: p.rotate,
            opacity: 0,
          }}
          transition={{
            duration: p.duration,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
