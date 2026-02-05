"use client";

import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Collage from './components/Collage';
import FloatingHearts from './components/FloatingHearts';

export default function HomePage() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [collageLoaded, setCollageLoaded] = useState(false);

  return (
    <>
      <FloatingHearts />
      <Collage onImagesLoaded={() => setCollageLoaded(true)} />
      {(!loadingComplete || !collageLoaded) && (
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      )}
    </>
  );
}