'use client';

import React, { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

const messages = [
  "Loading the magic...",
  "Collecting memories...",
  "Loving you more...",
  "Almost there..."
];

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 1000);
    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    if (progress === 100 && !fadeOut) {
      const fadeTimeout = setTimeout(() => {
        setFadeOut(true);
      }, 300);
      return () => clearTimeout(fadeTimeout);
    }
  }, [progress, fadeOut]);

  useEffect(() => {
    if (fadeOut) {
      const completeTimeout = setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 600);
      return () => clearTimeout(completeTimeout);
    }
  }, [fadeOut, onComplete]);

  return (
    <div className={`${styles.loadingOverlay} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.loadingMessage}>{messages[messageIndex]}</div>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
