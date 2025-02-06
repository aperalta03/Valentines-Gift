'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import styles from './Collage.module.css';

export default function Collage({ onImagesLoaded }) {
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [noClicks, setNoClicks] = useState(0);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/images');
        const data = await res.json();
        if (data && data.images) {
          setImages(data.images);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length > 0 && loadedCount === images.length) {
      if (onImagesLoaded) {
        onImagesLoaded();
      }
    }
  }, [loadedCount, images, onImagesLoaded]);

  useEffect(() => {
    const items = document.querySelectorAll(`.${styles.imageItem}`);
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    items.forEach((item) => observer.observe(item));
    return () => {
      items.forEach((item) => observer.unobserve(item));
    };
  }, [images]);

  const triggerConfetti = () => {
    const scalar = 4; 
    const heart = confetti.shapeFromText({ text: '❤️', scalar });
    confetti({
      particleCount: 200,      
      angle: 180,              
      spread: 1000,            
      origin: { x: 0.5, y: 0 }, 
      shapes: [heart],
      scalar: scalar,
      startVelocity: 30,     
      ticks: 300,            
    });
  };

  const handleYesClick = () => {
    triggerConfetti();
  };

  const handleNoClick = () => {
    setNoClicks((prev) => {
      const newCount = prev + 1;
      if (newCount >= 2) {
        triggerConfetti();
        return 0;
      }
      return newCount;
    });
  };

  return (
    <div className={styles.collageWrapper}>
      <h1 className={styles.title}>My Beautiful Girlfriend</h1>
      <div className={styles.collageContainer}>
        {images.map((file, index) => (
          <img
            key={index}
            src={`/MY_BABY/${file}`}
            alt={`Image ${index}`}
            className={styles.imageItem}
            onLoad={() => setLoadedCount((prev) => prev + 1)}
          />
        ))}
      </div>
      <div className={styles.subscriptionSection}>
        <p className={styles.subscriptionText}>
          Do you want to be my Valentine and my baby for another year? Renew subscription.
        </p>
        <div className={styles.buttonContainer}>
          <button className={styles.yesButton} onClick={handleYesClick}>
            Yes
          </button>
          <button className={styles.noButton} onClick={handleNoClick}></button>
        </div>
      </div>
    </div>
  );
}
