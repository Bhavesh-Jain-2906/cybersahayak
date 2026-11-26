'use client';

import React, { useEffect, useRef } from 'react';
import styles from './BlackHoleBackground.module.css';

/**
 * Purple Noir animated black-hole video backdrop rendered behind the main AI chat UI in dark mode.
 */
export default function BlackHoleBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || typeof window === 'undefined' || !window.matchMedia) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
      if (motionQuery.matches) {
        videoEl.pause();
      } else {
        videoEl.play().catch(() => {});
      }
    };

    syncPlayback();
    motionQuery.addEventListener?.('change', syncPlayback);
    return () => {
      motionQuery.removeEventListener?.('change', syncPlayback);
    };
  }, []);

  return (
    <div className={`hidden dark:block ${styles.root}`} aria-hidden="true">
      <video
        ref={videoRef}
        className={styles.videoEl}
        src="/videos/black-hole-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className={styles.purpleGrade} />
      <div className={styles.ambientGlow} />
      <div className={styles.scrim} />
    </div>
  );
}
