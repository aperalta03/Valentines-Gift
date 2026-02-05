'use client';

import React, { useEffect, useRef } from 'react';
import styles from './FloatingHearts.module.css';

export default function FloatingHearts() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hearts = ['❤️', '💕', '💖', '💗', '💓', '💝'];
    const createHeart = () => {
      const heart = document.createElement('div');
      heart.className = styles.heart;
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      
      const startX = Math.random() * 100;
      const duration = 15 + Math.random() * 10; // 15-25 seconds
      const delay = Math.random() * 5;
      const drift = (Math.random() - 0.5) * 100; // -50 to 50px drift
      
      heart.style.left = `${startX}%`;
      heart.style.animationDuration = `${duration}s`;
      heart.style.animationDelay = `${delay}s`;
      heart.style.opacity = String(0.3 + Math.random() * 0.4); // 0.3-0.7 opacity
      heart.style.setProperty('--drift', drift);
      
      container.appendChild(heart);
      
      // Remove heart after animation completes
      setTimeout(() => {
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
        }
      }, (duration + delay) * 1000);
    };

    // Create initial hearts
    for (let i = 0; i < 10; i++) {
      setTimeout(() => createHeart(), i * 500);
    }

    // Create new hearts periodically
    const interval = setInterval(() => {
      createHeart();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div ref={containerRef} className={styles.container} />;
}
