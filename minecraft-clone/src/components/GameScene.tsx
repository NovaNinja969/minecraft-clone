'use client';

import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Stats } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useThreeStore } from '../hooks/useThreeStore';
import { Blocks } from './Blocks';
import { Player } from './Player';

export function GameScene() {
  const { updatePosition, position } = useThreeStore();
  const controlsRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Update player physics
      updatePosition(delta);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [updatePosition]);

  return (
    <Canvas camera={{ position: [position[0], position[1], position[2]], fov: 75 }}>
      <Sky sunPosition={[100, 100, 20]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Player />
      <Blocks />
      
      <PointerLockControls ref={controlsRef} />
      <Stats />
    </Canvas>
  );
}
