"use client";

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  direction?: 'up' | 'down' | 'none';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.15,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              const timer = setTimeout(() => setIsVisible(true), delayMs);
              observer.unobserve(entry.target);
              return () => clearTimeout(timer);
            } else {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [delayMs, threshold]);

  const getDirectionClasses = () => {
    if (direction === 'none') return '';
    if (direction === 'down') return isVisible ? 'translate-y-0' : '-translate-y-6';
    return isVisible ? 'translate-y-0' : 'translate-y-6';
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) will-change-transform ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
};
