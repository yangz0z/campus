'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function TypewriterText({ text, speed = 40, onComplete }: TypewriterTextProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= text.length) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [count, text.length, speed, onComplete]);

  return (
    <span>
      {text.slice(0, count)}
      {count < text.length && (
        <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-gray-400" />
      )}
    </span>
  );
}
