'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import styles from './Collage.module.css';

export default function Collage({ onImagesLoaded }) {
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

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

  // Touch/Mouse handlers for swiping
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    setCurrentX(clientX);
    const diff = clientX - startX;
    setOffset(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    // Use offset directly since it's already calculated
    const diff = offset;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      setIsTransitioning(true);
      if (diff > 0 && currentIndex > 0) {
        // Swipe right - go to previous
        setCurrentIndex(currentIndex - 1);
      } else if (diff < 0 && currentIndex < images.length - 1) {
        // Swipe left - go to next
        setCurrentIndex(currentIndex + 1);
      }
      setTimeout(() => setIsTransitioning(false), 300);
    }
    
    setIsDragging(false);
    setOffset(0);
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMoveEvent = (e) => handleMove(e.clientX);
      const handleMouseUpEvent = () => handleEnd();
      
      document.addEventListener('mousemove', handleMouseMoveEvent);
      document.addEventListener('mouseup', handleMouseUpEvent);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveEvent);
        document.removeEventListener('mouseup', handleMouseUpEvent);
      };
    }
  }, [isDragging]);

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
    // No button can still trigger confetti after a few clicks if desired
    // For now, keeping it simple
  };

  const transformX = -currentIndex * 100 + (offset / (containerRef.current?.offsetWidth || 1)) * 100;

  return (
    <div className={styles.collageWrapper}>
      <div className={styles.carouselContainer}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div 
          className={`${styles.carouselTrack} ${isDragging ? styles.noTransition : ''}`}
          style={{ transform: `translateX(${transformX}%)` }}
        >
          {images.map((file, index) => (
            <div key={index} className={styles.card}>
              <img
                src={`/MY_BABY/${file}`}
                alt={`Image ${index + 1}`}
                className={styles.cardImage}
                onLoad={() => setLoadedCount((prev) => prev + 1)}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      {images.length > 1 && (
        <div className={styles.dotsContainer}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Message section */}
      <div className={styles.messageSection}>
        <p className={styles.messageText}>
          Will you be my Valentine 2026?
        </p>
        <div className={styles.buttonContainer}>
          <button className={styles.yesButton} onClick={handleYesClick}>
            Yes
          </button>
          <button className={styles.noButton} onClick={handleNoClick}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}
