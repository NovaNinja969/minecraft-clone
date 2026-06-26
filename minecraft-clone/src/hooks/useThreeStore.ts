import { create } from 'zustand';

interface ThreeState {
  // Player position and rotation
  position: [number, number, number];
  rotation: [number, number, number];
  
  // Movement state
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  velocity: [number, number, number];
  isJumping: boolean;
  
  // Block interaction
  selectedBlockType: string;
  blocks: BlockData[];
  
  // Actions
  setMoveForward: (value: boolean) => void;
  setMoveBackward: (value: boolean) => void;
  setMoveLeft: (value: boolean) => void;
  setMoveRight: (value: boolean) => void;
  jump: () => void;
  updatePosition: (delta: number) => void;
  setSelectedBlockType: (type: string) => void;
  addBlock: (x: number, y: number, z: number, type: string) => void;
  removeBlock: (x: number, y: number, z: number) => void;
}

interface BlockData {
  x: number;
  y: number;
  z: number;
  type: string;
}

export const useThreeStore = create<ThreeState>((set, get) => ({
  position: [0, 2, 0],
  rotation: [0, 0, 0],
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  velocity: [0, 0, 0],
  isJumping: false,
  selectedBlockType: 'grass',
  blocks: [],
  
  setMoveForward: (value) => set({ moveForward: value }),
  setMoveBackward: (value) => set({ moveBackward: value }),
  setMoveLeft: (value) => set({ moveLeft: value }),
  setMoveRight: (value) => set({ moveRight: value }),
  
  jump: () => {
    const { isJumping, velocity } = get();
    if (!isJumping) {
      set({ isJumping: true, velocity: [velocity[0], 10, velocity[2]] });
    }
  },
  
  updatePosition: (delta: number) => {
    const { 
      position, 
      moveForward, 
      moveBackward, 
      moveLeft, 
      moveRight, 
      velocity,
      isJumping 
    } = get();
    
    const speed = 5;
    const gravity = -30;
    
    let [x, y, z] = position;
    let [vx, vy, vz] = velocity;
    
    // Apply gravity
    vy += gravity * delta;
    
    // Movement
    if (moveForward) z -= speed * delta;
    if (moveBackward) z += speed * delta;
    if (moveLeft) x -= speed * delta;
    if (moveRight) x += speed * delta;
    
    // Update position
    y += vy * delta;
    
    // Ground collision
    if (y < 2) {
      y = 2;
      vy = 0;
      set({ isJumping: false });
    }
    
    set({ 
      position: [x, y, z], 
      velocity: [vx, vy, vz] 
    });
  },
  
  setSelectedBlockType: (type) => set({ selectedBlockType: type }),
  
  addBlock: (x, y, z, type) => {
    const { blocks } = get();
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    const roundedZ = Math.round(z);
    
    // Check if block already exists
    const exists = blocks.some(
      b => b.x === roundedX && b.y === roundedY && b.z === roundedZ
    );
    
    if (!exists) {
      set({ 
        blocks: [...blocks, { x: roundedX, y: roundedY, z: roundedZ, type }] 
      });
    }
  },
  
  removeBlock: (x, y, z) => {
    const { blocks } = get();
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    const roundedZ = Math.round(z);
    
    set({ 
      blocks: blocks.filter(
        b => !(b.x === roundedX && b.y === roundedY && b.z === roundedZ)
      ) 
    });
  },
}));
