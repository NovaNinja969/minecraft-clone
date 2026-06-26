'use client';

import { useRef, useEffect } from 'react';
import { useThreeStore } from '../hooks/useThreeStore';

const BLOCK_COLORS: Record<string, string> = {
  grass: '#4CAF50',
  dirt: '#795548',
  stone: '#9E9E9E',
  wood: '#8D6E63',
  sand: '#FDD835',
};

export function Blocks() {
  const { blocks, addBlock, removeBlock, selectedBlockType } = useThreeStore();
  const raycasterRef = useRef<THREE.Raycaster>();

  useEffect(() => {
    raycasterRef.current = new THREE.Raycaster();
  }, []);

  const handleBlockClick = (e: THREE.Event & { face: THREE.Face; point: THREE.Vector3 }) => {
    if (!raycasterRef.current) return;

    const face = e.face;
    const point = e.point;

    if (face && point) {
      // Left click (or shift+click) to remove block
      if (e.shiftKey || e.button === 2) {
        const { x, y, z } = face.object!.position;
        removeBlock(x, y, z);
      } else {
        // Right click to add block
        const normal = face.normal;
        const newX = Math.round(point.x + normal.x * 0.5);
        const newY = Math.round(point.y + normal.y * 0.5);
        const newZ = Math.round(point.z + normal.z * 0.5);
        addBlock(newX, newY, newZ, selectedBlockType);
      }
    }
  };

  return (
    <group>
      {blocks.map((block, index) => (
        <mesh
          key={`${block.x}-${block.y}-${block.z}-${index}`}
          position={[block.x, block.y, block.z]}
          onClick={handleBlockClick}
          onContextMenu={(e) => {
            e.stopPropagation();
            handleBlockClick(e as any);
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={BLOCK_COLORS[block.type] || '#FFFFFF'} />
        </mesh>
      ))}
      
      {/* Generate initial terrain */}
      {Array.from({ length: 20 }, (_, x) =>
        Array.from({ length: 20 }, (_, z) => {
          const posX = x - 10;
          const posZ = z - 10;
          return (
            <mesh
              key={`ground-${posX}-${posZ}`}
              position={[posX, 0, posZ]}
              onClick={handleBlockClick}
              onContextMenu={(e) => {
                e.stopPropagation();
                handleBlockClick(e as any);
              }}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#4CAF50" />
            </mesh>
          );
        })
      )}
    </group>
  );
}
