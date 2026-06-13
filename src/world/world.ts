import * as THREE from 'three';
import { Chunk } from './chunk';
import { TerrainGenerator } from './terrain/generator';
import { Vector3 } from '../types';
import { CHUNK_SIZE, RENDER_DISTANCE } from '../constants';

export class World {
    private scene: THREE.Scene | null = null;
    private chunks: Map<string, Chunk> = new Map();
    private terrainGenerator: TerrainGenerator | null = null;
    private loadedChunks: Set<string> = new Set();

    public init(): void {
        this.scene = new THREE.Scene();
        this.terrainGenerator = new TerrainGenerator();
        console.log('✅ World initialized');
    }

    public getScene(): THREE.Scene {
        if (!this.scene) throw new Error('Scene not initialized');
        return this.scene;
    }

    public getChunk(x: number, z: number): Chunk | undefined {
        return this.chunks.get(this.getChunkKey(x, z));
    }

    public setBlock(x: number, y: number, z: number, blockType: number): void {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkZ);

        if (chunk) {
            const localX = x - chunkX * CHUNK_SIZE;
            const localZ = z - chunkZ * CHUNK_SIZE;
            chunk.setBlock(localX, y, localZ, blockType);
            chunk.isDirty = true;
        }
    }

    public getBlock(x: number, y: number, z: number): number {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const chunk = this.getChunk(chunkX, chunkZ);

        if (!chunk) return 0; // Air

        const localX = x - chunkX * CHUNK_SIZE;
        const localZ = z - chunkZ * CHUNK_SIZE;
        return chunk.getBlock(localX, y, localZ);
    }

    public update(playerPos: Vector3): void {
        const chunkX = Math.floor(playerPos.x / CHUNK_SIZE);
        const chunkZ = Math.floor(playerPos.z / CHUNK_SIZE);

        // Load nearby chunks
        for (let x = chunkX - RENDER_DISTANCE; x <= chunkX + RENDER_DISTANCE; x++) {
            for (let z = chunkZ - RENDER_DISTANCE; z <= chunkZ + RENDER_DISTANCE; z++) {
                const key = this.getChunkKey(x, z);
                if (!this.loadedChunks.has(key)) {
                    this.loadChunk(x, z);
                }
            }
        }

        // Unload far chunks
        const keysToRemove: string[] = [];
        this.loadedChunks.forEach((key) => {
            const [x, z] = key.split(',').map(Number);
            if (Math.abs(x - chunkX) > RENDER_DISTANCE || Math.abs(z - chunkZ) > RENDER_DISTANCE) {
                keysToRemove.push(key);
            }
        });

        keysToRemove.forEach((key) => {
            this.unloadChunk(key);
        });

        // Update dirty chunks
        this.chunks.forEach((chunk) => {
            if (chunk.isDirty) {
                chunk.updateMesh();
                chunk.isDirty = false;
            }
        });
    }

    private loadChunk(x: number, z: number): void {
        const key = this.getChunkKey(x, z);
        const chunk = new Chunk(x, z);

        if (!this.terrainGenerator) throw new Error('Terrain generator not initialized');
        this.terrainGenerator.generate(chunk);

        chunk.updateMesh();
        this.chunks.set(key, chunk);
        this.loadedChunks.add(key);

        if (chunk.mesh && this.scene) {
            this.scene.add(chunk.mesh);
        }
    }

    private unloadChunk(key: string): void {
        const chunk = this.chunks.get(key);
        if (chunk && chunk.mesh && this.scene) {
            this.scene.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
            (chunk.mesh.material as THREE.Material).dispose();
        }
        this.chunks.delete(key);
        this.loadedChunks.delete(key);
    }

    private getChunkKey(x: number, z: number): string {
        return `${x},${z}`;
    }
}
