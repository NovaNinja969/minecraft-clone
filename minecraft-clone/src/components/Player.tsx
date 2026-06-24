'use client';

import { useEffect, useRef } from 'react';
import { useThreeStore } from '../hooks/useThreeStore';

export function Player() {
  const { position, rotation, moveForward, moveBackward, moveLeft, moveRight, jump } = useThreeStore();
  const playerRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          moveForward(true);
          break;
        case 'KeyS':
          moveBackward(true);
          break;
        case 'KeyA':
          moveLeft(true);
          break;
        case 'KeyD':
          moveRight(true);
          break;
        case 'Space':
          jump();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          moveForward(false);
          break;
        case 'KeyS':
          moveBackward(false);
          break;
        case 'KeyA':
          moveLeft(false);
          break;
        case 'KeyD':
          moveRight(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [moveForward, moveBackward, moveLeft, moveRight, jump]);

  return (
    <group ref={playerRef} position={position}>
      {/* Player body - simple cube for now */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      {/* Player head */}
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
    </group>
  );
}
