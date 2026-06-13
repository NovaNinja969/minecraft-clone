import { Chunk } from '../chunk';
import { CHUNK_SIZE, CHUNK_HEIGHT, WORLD_SEED } from '../../constants';
import SimplexNoise from 'simplex-noise';

export class TerrainGenerator {
    private noise: SimplexNoise;

    constructor() {
        this.noise = new SimplexNoise(() => {
            // Seeded random based on WORLD_SEED
            return (Math.sin(WORLD_SEED) * 10000 - Math.floor(Math.sin(WORLD_SEED) * 10000)) || Math.random();
        });
    }

    public generate(chunk: Chunk): void {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunk.position.x * CHUNK_SIZE + x;
                const worldZ = chunk.position.z * CHUNK_SIZE + z;

                // Get height at this position
                const height = this.getHeight(worldX, worldZ);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    if (y === 0) {
                        // Bedrock at bottom
                        chunk.setBlock(x, y, z, 1); // Stone
                    } else if (y < height - 4) {
                        // Stone
                        chunk.setBlock(x, y, z, this.getOreType(x, y, z, worldX, worldZ));
                    } else if (y < height - 1) {
                        // Dirt
                        chunk.setBlock(x, y, z, 2);
                    } else if (y === height - 1) {
                        // Grass
                        chunk.setBlock(x, y, z, 3);
                    } else if (y < height + 2) {
                        // Water/Air
                        chunk.setBlock(x, y, z, 0);
                    }
                }
            }
        }
    }

    private getHeight(x: number, z: number): number {
        const scale1 = this.noise.noise2D(x * 0.01, z * 0.01) * 40;
        const scale2 = this.noise.noise2D(x * 0.05, z * 0.05) * 20;
        const scale3 = this.noise.noise2D(x * 0.1, z * 0.1) * 10;

        return Math.floor(64 + scale1 + scale2 + scale3);
    }

    private getOreType(x: number, y: number, z: number, worldX: number, worldZ: number): number {
        const rand = Math.abs(Math.sin(worldX * 73 + worldZ * 97 + y * 37)) % 1;

        if (y < 20) {
            if (rand < 0.05) return 12; // Diamond
        }
        if (y < 40) {
            if (rand < 0.08) return 9; // Gold
        }
        if (y < 60) {
            if (rand < 0.1) return 10; // Iron
        }
        if (y < 80) {
            if (rand < 0.15) return 11; // Coal
        }

        return 1; // Stone
    }
}
