export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface BlockData {
    id: number;
    name: string;
    texture: string;
    breakable: boolean;
    transparent: boolean;
    hardness: number;
}

export enum BlockType {
    AIR = 0,
    STONE = 1,
    DIRT = 2,
    GRASS = 3,
    COBBLESTONE = 4,
    OAK_LOG = 5,
    OAK_LEAVES = 6,
    SAND = 7,
    GRAVEL = 8,
    GOLD_ORE = 9,
    IRON_ORE = 10,
    COAL_ORE = 11,
    DIAMOND_ORE = 12,
    GLASS = 13,
    WATER = 14,
    LAVA = 15,
}

export interface Chunk {
    position: Vector3;
    blocks: number[][][];
    mesh: THREE.Mesh | null;
    isDirty: boolean;
    isLoaded: boolean;
}

export interface PlayerState {
    position: Vector3;
    velocity: Vector3;
    rotation: Vector3;
    isJumping: boolean;
    isSprinting: boolean;
    selectedHotbarSlot: number;
}

export interface InventoryItem {
    type: BlockType | number;
    count: number;
}

export interface EntityType {
    id: number;
    name: string;
    position: Vector3;
    rotation: Vector3;
    health: number;
    maxHealth: number;
    velocity: Vector3;
}
