import * as THREE from 'three';
import { CHUNK_SIZE, CHUNK_HEIGHT, BLOCK_SIZE } from '../constants';

export class Chunk {
    public position: { x: number; z: number };
    public blocks: number[][][] = [];
    public mesh: THREE.Mesh | null = null;
    public isDirty = true;

    constructor(x: number, z: number) {
        this.position = { x, z };
        this.initializeBlocks();
    }

    private initializeBlocks(): void {
        this.blocks = [];
        for (let x = 0; x < CHUNK_SIZE; x++) {
            this.blocks[x] = [];
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                this.blocks[x][y] = [];
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    this.blocks[x][y][z] = 0; // Air
                }
            }
        }
    }

    public getBlock(x: number, y: number, z: number): number {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return 0;
        }
        return this.blocks[x][y][z];
    }

    public setBlock(x: number, y: number, z: number, blockType: number): void {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        this.blocks[x][y][z] = blockType;
    }

    public updateMesh(): void {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            (this.mesh.material as THREE.Material).dispose();
        }

        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const colors: number[] = [];

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockType = this.blocks[x][y][z];
                    if (blockType !== 0) {
                        this.addBlockMesh(
                            x, y, z, blockType,
                            vertices, normals, uvs, colors
                        );
                    }
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
            });

            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(
                this.position.x * CHUNK_SIZE * BLOCK_SIZE,
                0,
                this.position.z * CHUNK_SIZE * BLOCK_SIZE
            );
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }
    }

    private addBlockMesh(
        x: number, y: number, z: number, blockType: number,
        vertices: number[], normals: number[], uvs: number[], colors: number[]
    ): void {
        const neighbors = [
            this.getBlock(x + 1, y, z) === 0,
            this.getBlock(x - 1, y, z) === 0,
            this.getBlock(x, y + 1, z) === 0,
            this.getBlock(x, y - 1, z) === 0,
            this.getBlock(x, y, z + 1) === 0,
            this.getBlock(x, y, z - 1) === 0,
        ];

        const blockX = x * BLOCK_SIZE;
        const blockY = y * BLOCK_SIZE;
        const blockZ = z * BLOCK_SIZE;

        // Get color based on block type
        const color = this.getBlockColor(blockType);

        // Right face (+X)
        if (neighbors[0]) {
            vertices.push(blockX + 1, blockY, blockZ, blockX + 1, blockY + 1, blockZ, blockX + 1, blockY + 1, blockZ + 1, blockX + 1, blockY, blockZ + 1);
            for (let i = 0; i < 4; i++) normals.push(1, 0, 0);
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
            for (let i = 0; i < 4; i++) colors.push(color.r, color.g, color.b);
        }

        // Left face (-X)
        if (neighbors[1]) {
            vertices.push(blockX, blockY, blockZ, blockX, blockY + 1, blockZ + 1, blockX, blockY + 1, blockZ, blockX, blockY, blockZ + 1);
            for (let i = 0; i < 4; i++) normals.push(-1, 0, 0);
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
            for (let i = 0; i < 4; i++) colors.push(color.r, color.g, color.b);
        }

        // Top face (+Y)
        if (neighbors[2]) {
            vertices.push(blockX, blockY + 1, blockZ, blockX, blockY + 1, blockZ + 1, blockX + 1, blockY + 1, blockZ + 1, blockX + 1, blockY + 1, blockZ);
            for (let i = 0; i < 4; i++) normals.push(0, 1, 0);
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
            for (let i = 0; i < 4; i++) colors.push(color.r, color.g, color.b);
        }

        // Bottom face (-Y)
        if (neighbors[3]) {
            vertices.push(blockX, blockY, blockZ, blockX + 1, blockY, blockZ + 1, blockX + 1, blockY, blockZ, blockX, blockY, blockZ + 1);
            for (let i = 0; i < 4; i++) normals.push(0, -1, 0);
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
            for (let i = 0; i < 4; i++) colors.push(color.r, color.g, color.b);
        }

        // Front face (+Z)
        if (neighbors[4]) {
            vertices.push(blockX, blockY, blockZ + 1, blockX, blockY + 1, blockZ + 1, blockX + 1, blockY + 1, blockZ + 1, blockX + 1, blockY, blockZ + 1);
            for (let i = 0; i < 4; i++) normals.push(0, 0, 1);
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
            for (let i = 0; i < 4; i++) colors.push(color.r, color.g, color.b);
        }

        // Back face (-Z)
        if (neighbors[5]) {
            vertices.push(blockX, blockY, blockZ, blockX + 1, blockY + 1, blockZ, blockX, blockY + 1, blockZ, blockX + 1, blockY, blockZ);
            for (let i = 0; i < 4; i++) normals.push(0, 0, -1);
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
            for (let i = 0; i < 4; i++) colors.push(color.r, color.g, color.b);
        }
    }

    private getBlockColor(blockType: number): { r: number; g: number; b: number } {
        switch (blockType) {
            case 1: return { r: 0.5, g: 0.5, b: 0.5 }; // Stone
            case 2: return { r: 0.6, g: 0.4, b: 0.2 }; // Dirt
            case 3: return { r: 0.2, g: 0.8, b: 0.2 }; // Grass
            case 4: return { r: 0.4, g: 0.4, b: 0.4 }; // Cobblestone
            case 5: return { r: 0.5, g: 0.3, b: 0.1 }; // Oak Log
            case 6: return { r: 0.2, g: 0.7, b: 0.1 }; // Oak Leaves
            case 7: return { r: 0.9, g: 0.8, b: 0.3 }; // Sand
            case 8: return { r: 0.6, g: 0.6, b: 0.5 }; // Gravel
            case 9: return { r: 1, g: 0.8, b: 0.1 }; // Gold Ore
            case 10: return { r: 0.7, g: 0.7, b: 0.7 }; // Iron Ore
            case 11: return { r: 0.2, g: 0.2, b: 0.2 }; // Coal Ore
            case 12: return { r: 0.1, g: 0.8, b: 0.8 }; // Diamond Ore
            case 13: return { r: 0.7, g: 0.9, b: 1 }; // Glass
            default: return { r: 1, g: 1, b: 1 };
        }
    }
}
