'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import styles from './Collage.module.css';

const SWIPE_THRESHOLD = 80;
const ROTATION_FACTOR = 0.15;
const FLY_OFF_DISTANCE = 1200;

function shuffleArray(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function Collage({ onImagesLoaded }) {
  const [images, setImages] = useState([]);
  const [imageVersion, setImageVersion] = useState('V1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [exitDirection, setExitDirection] = useState(null); // 'left' | 'right' | null
  const [noButtonClicked, setNoButtonClicked] = useState(false);
  const offsetRef = useRef(0);
  const cardRef = useRef(null);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/images');
        const data = await res.json();
        if (data && data.images) {
          setImages(shuffleArray(data.images));
          if (data.version) setImageVersion(data.version);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    }
    fetchImages();
  }, []);

  // Preload all images so swiping never shows a loading state
  useEffect(() => {
    if (!images.length || !imageVersion) return;
    let loaded = 0;
    const total = images.length;
    const onLoad = () => {
      loaded += 1;
      if (loaded === total && onImagesLoaded) onImagesLoaded();
    };
    images.forEach((file) => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = `/MY_BABY/${imageVersion}/${file}`;
    });
  }, [images, imageVersion, onImagesLoaded]);

  offsetRef.current = offset;

  const handleStart = (clientX) => {
    if (isAnimatingOut) return;
    setIsDragging(true);
    setStartX(clientX);
    setOffset(0);
    setExitDirection(null);
  };

  const handleMove = (clientX) => {
    if (!isDragging || isAnimatingOut) return;
    const diff = clientX - startX;
    setOffset(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    const diff = offsetRef.current;
    const idx = currentIndexRef.current;
    const goNext = diff < -SWIPE_THRESHOLD && idx < images.length - 1;
    const goPrev = diff > SWIPE_THRESHOLD && idx > 0;

    if (goNext || goPrev) {
      const direction = goNext ? 'left' : 'right';
      setExitDirection(direction);
      setIsAnimatingOut(true);
      setIsDragging(false);
      setOffset(0);
      return;
    }
    setIsDragging(false);
    setOffset(0);
  };

  const handleTransitionEnd = () => {
    if (!isAnimatingOut || !exitDirection) return;
    setCurrentIndex((prev) => prev + (exitDirection === 'left' ? 1 : -1));
    setIsAnimatingOut(false);
    setExitDirection(null);
  };

  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };
  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    handleEnd();
  };
  const handleMouseDown = (e) => {
    handleStart(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
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
      scalar,
      startVelocity: 30,
      ticks: 300,
    });
  };

  const handleYesClick = () => triggerConfetti();
  const handleNoClick = () => {
    setNoButtonClicked(true);
    triggerConfetti();
  };

  // Card transform: tilt + translate while dragging, or fly-off when releasing
  const getCardTransform = () => {
    if (isAnimatingOut && exitDirection) {
      const x = exitDirection === 'left' ? -FLY_OFF_DISTANCE : FLY_OFF_DISTANCE;
      const rot = exitDirection === 'left' ? -25 : 25;
      return `translateX(${x}px) rotate(${rot}deg)`;
    }
    const rot = offset * ROTATION_FACTOR;
    return `translateX(${offset}px) rotate(${rot}deg)`;
  };

  const showBackCard = isDragging || isAnimatingOut;
  const backIndex =
    showBackCard
      ? exitDirection === 'left'
        ? currentIndex + 1
        : exitDirection === 'right'
          ? currentIndex - 1
          : offset < 0
            ? currentIndex + 1
            : currentIndex - 1
      : currentIndex + 1;

  const canShowBack =
    (exitDirection === 'left' && currentIndex < images.length - 1) ||
    (exitDirection === 'right' && currentIndex > 0) ||
    (isDragging && ((offset < 0 && currentIndex < images.length - 1) || (offset > 0 && currentIndex > 0)));

  return (
    <div className={styles.collageWrapper}>
      <div
        className={styles.cardStack}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Back card (next/prev peek) */}
        {images.length > 0 && canShowBack && backIndex >= 0 && backIndex < images.length && (
          <div className={styles.cardBase} aria-hidden>
            <img
              src={`/MY_BABY/${imageVersion}/${images[backIndex]}`}
              alt=""
              className={styles.cardImage}
              draggable={false}
            />
          </div>
        )}

        {/* Front card (current, swipable) */}
        {images.length > 0 && (
          <div
            ref={cardRef}
            className={`${styles.cardFront} ${isDragging ? styles.noTransition : ''} ${isAnimatingOut ? styles.flyOff : ''}`}
            style={{ transform: getCardTransform() }}
            onTransitionEnd={handleTransitionEnd}
          >
            <img
              src={`/MY_BABY/${imageVersion}/${images[currentIndex]}`}
              alt={`Slide ${currentIndex + 1}`}
              className={styles.cardImage}
              draggable={false}
            />
          </div>
        )}

        {/* Dots - over the card area but above the overlay bar */}
        {images.length > 1 && (
          <div className={styles.dotsOverlay}>
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Overlay: message + Yes/No on top of images */}
      <div className={styles.overlay}>
        <p className={styles.messageText}>Will you be my Valentine 2026?</p>
        <div className={styles.buttonContainer}>
          <button type="button" className={styles.yesButton} onClick={handleYesClick}>
            Yes
          </button>
          <button
            type="button"
            className={`${styles.noButton} ${noButtonClicked ? styles.noButtonClicked : ''}`}
            onClick={handleNoClick}
          >
            {noButtonClicked ? 'Yes! ❤️' : 'No'}
          </button>
        </div>
      </div>
    </div>
  );
}
