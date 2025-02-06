"use client";

import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Collage from './components/Collage';

export default function HomePage() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [collageLoaded, setCollageLoaded] = useState(false);

  return (
    <>
      <Collage onImagesLoaded={() => setCollageLoaded(true)} />
      {(!loadingComplete || !collageLoaded) && (
        <LoadingScreen onComplete={() => setLoadingComplete(true)} />
      )}
    </>
  );
}