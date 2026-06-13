export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 256;
export const RENDER_DISTANCE = 10;

export const BLOCK_SIZE = 1;

export const PLAYER_HEIGHT = 1.8;
export const PLAYER_WIDTH = 0.6;
export const PLAYER_SPEED = 0.1;
export const PLAYER_SPRINT_SPEED = 0.2;
export const PLAYER_JUMP_FORCE = 0.12;
export const GRAVITY = 0.008;

export const TICK_RATE = 20;
export const TICK_TIME = 1000 / TICK_RATE;

export const WORLD_SEED = 12345;

export const BLOCK_TEXTURES: Record<number, string> = {
    0: 'assets/textures/blocks/air.png',
    1: 'assets/textures/blocks/stone.png',
    2: 'assets/textures/blocks/dirt.png',
    3: 'assets/textures/blocks/grass.png',
    4: 'assets/textures/blocks/cobblestone.png',
    5: 'assets/textures/blocks/oak_log.png',
    6: 'assets/textures/blocks/oak_leaves.png',
    7: 'assets/textures/blocks/sand.png',
    8: 'assets/textures/blocks/gravel.png',
    9: 'assets/textures/blocks/gold_ore.png',
    10: 'assets/textures/blocks/iron_ore.png',
    11: 'assets/textures/blocks/coal_ore.png',
    12: 'assets/textures/blocks/diamond_ore.png',
    13: 'assets/textures/blocks/glass.png',
    14: 'assets/textures/blocks/water.png',
    15: 'assets/textures/blocks/lava.png',
};
