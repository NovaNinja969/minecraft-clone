import * as THREE from 'three';
import { World } from '../world/world';
import { Input } from '../core/input';
import { Vector3 } from '../types';
import {
    PLAYER_HEIGHT,
    PLAYER_SPEED,
    PLAYER_SPRINT_SPEED,
    PLAYER_JUMP_FORCE,
    GRAVITY,
    BLOCK_SIZE,
} from '../constants';

export class Player {
    private camera: THREE.PerspectiveCamera;
    private position: Vector3 = { x: 0, y: 100, z: 0 };
    private velocity: Vector3 = { x: 0, y: 0, z: 0 };
    private rotation: Vector3 = { x: 0, y: 0, z: 0 };
    private isJumping = false;
    private isSprinting = false;
    private world: World;
    private selectedHotbarSlot = 0;
    private inventory: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    constructor(world: World) {
        this.world = world;
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
    }

    public init(): void {
        this.camera.position.set(this.position.x, this.position.y, this.position.z);
        console.log('✅ Player initialized');
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public getPosition(): Vector3 {
        return this.position;
    }

    public update(input: Input, deltaTime: number): void {
        this.handleMovement(input, deltaTime);
        this.handleLook(input);
        this.handleInteraction(input);
        this.updateCamera();
    }

    private handleMovement(input: Input, deltaTime: number): void {
        const speed = input.getKey('shift') ? PLAYER_SPRINT_SPEED : PLAYER_SPEED;
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

        if (input.getKey('w')) {
            this.velocity.x += forward.x * speed;
            this.velocity.z += forward.z * speed;
        }
        if (input.getKey('s')) {
            this.velocity.x -= forward.x * speed;
            this.velocity.z -= forward.z * speed;
        }
        if (input.getKey('a')) {
            this.velocity.x -= right.x * speed;
            this.velocity.z -= right.z * speed;
        }
        if (input.getKey('d')) {
            this.velocity.x += right.x * speed;
            this.velocity.z += right.z * speed;
        }

        // Jumping
        if (input.getKey(' ') && !this.isJumping) {
            this.velocity.y = PLAYER_JUMP_FORCE;
            this.isJumping = true;
        }

        // Apply gravity
        this.velocity.y -= GRAVITY;

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        // Collision with ground
        const footY = this.position.y - PLAYER_HEIGHT / 2;
        const blockBelowY = Math.floor(footY);
        const blockAtFeet = this.world.getBlock(
            Math.floor(this.position.x),
            blockBelowY,
            Math.floor(this.position.z)
        );

        if (blockAtFeet !== 0 && footY <= blockBelowY + BLOCK_SIZE) {
            this.position.y = blockBelowY + BLOCK_SIZE + PLAYER_HEIGHT / 2;
            this.velocity.y = 0;
            this.isJumping = false;
        }

        // Apply friction
        this.velocity.x *= 0.9;
        this.velocity.z *= 0.9;
    }

    private handleLook(input: Input): void {
        const mouseDelta = input.getMouseDelta();
        const sensitivity = 0.003;

        this.rotation.y -= mouseDelta.x * sensitivity;
        this.rotation.x -= mouseDelta.y * sensitivity;

        // Clamp pitch
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    }

    private handleInteraction(input: Input): void {
        if (input.getMouseButton(0)) {
            this.breakBlock();
        }
        if (input.getMouseButton(2)) {
            this.placeBlock();
        }

        // Hotbar selection
        for (let i = 1; i <= 9; i++) {
            if (input.getKey(i.toString())) {
                this.selectedHotbarSlot = i - 1;
                this.updateHotbarUI();
            }
        }
    }

    private breakBlock(): void {
        const rayOrigin = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        const rayDirection = new THREE.Vector3(0, 0, -1)
            .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.rotation.x)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

        for (let i = 0; i < 100; i++) {
            const checkX = Math.floor(rayOrigin.x + rayDirection.x * i);
            const checkY = Math.floor(rayOrigin.y + rayDirection.y * i);
            const checkZ = Math.floor(rayOrigin.z + rayDirection.z * i);

            const block = this.world.getBlock(checkX, checkY, checkZ);
            if (block !== 0) {
                this.world.setBlock(checkX, checkY, checkZ, 0);
                return;
            }
        }
    }

    private placeBlock(): void {
        const rayOrigin = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        const rayDirection = new THREE.Vector3(0, 0, -1)
            .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.rotation.x)
            .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

        for (let i = 0; i < 100; i++) {
            const checkX = Math.floor(rayOrigin.x + rayDirection.x * i);
            const checkY = Math.floor(rayOrigin.y + rayDirection.y * i);
            const checkZ = Math.floor(rayOrigin.z + rayDirection.z * i);

            const block = this.world.getBlock(checkX, checkY, checkZ);
            if (block !== 0) {
                const blockType = this.inventory[this.selectedHotbarSlot] || 1;
                // Place block adjacent to found block
                const blockToPlace = new THREE.Vector3(
                    checkX + rayDirection.x * 0.5,
                    checkY + rayDirection.y * 0.5,
                    checkZ + rayDirection.z * 0.5
                );
                this.world.setBlock(
                    Math.floor(blockToPlace.x),
                    Math.floor(blockToPlace.y),
                    Math.floor(blockToPlace.z),
                    blockType
                );
                return;
            }
        }
    }

    private updateCamera(): void {
        this.camera.position.copy(this.position as any);
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.rotation.y;
        this.camera.rotation.x = this.rotation.x;
    }

    private updateHotbarUI(): void {
        document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
            if (index === this.selectedHotbarSlot) {
                slot.classList.add('selected');
            } else {
                slot.classList.remove('selected');
            }
        });
    }
}
