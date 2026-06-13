import * as THREE from 'three';
import { Renderer } from './core/renderer';
import { Input } from './core/input';
import { World } from './world/world';
import { Player } from './player/player';
import { TICK_TIME } from './constants';

export class Game {
    private renderer: Renderer;
    private input: Input;
    private world: World;
    private player: Player;
    private isRunning = false;
    private lastTickTime = 0;

    constructor() {
        this.renderer = new Renderer();
        this.input = new Input();
        this.world = new World();
        this.player = new Player(this.world);
        window.game = this;
    }

    public init(): void {
        console.log('🎮 Initializing Minecraft Clone...');
        this.renderer.init();
        this.world.init();
        this.player.init();
        this.input.init();
        this.setupEventListeners();
        console.log('✅ Game initialized!');
    }

    public run(): void {
        this.isRunning = true;
        this.gameLoop();
    }

    private gameLoop = (): void => {
        if (!this.isRunning) return;

        const now = Date.now();
        const deltaTime = now - this.lastTickTime;

        if (deltaTime >= TICK_TIME) {
            this.update(deltaTime / 1000);
            this.lastTickTime = now;
        }

        this.render();
        requestAnimationFrame(this.gameLoop);
    };

    private update(deltaTime: number): void {
        this.player.update(this.input, deltaTime);
        this.world.update(this.player.getPosition());
    }

    private render(): void {
        this.renderer.render(
            this.world.getScene(),
            this.player.getCamera()
        );
        this.updateHUD();
    }

    private updateHUD(): void {
        const pos = this.player.getPosition();
        const coordsDiv = document.getElementById('coords');
        if (coordsDiv) {
            coordsDiv.textContent = `X: ${Math.floor(pos.x)} Y: ${Math.floor(pos.y)} Z: ${Math.floor(pos.z)}`;
        }
    }

    private setupEventListeners(): void {
        // Pause/Resume
        document.getElementById('resume-btn')?.addEventListener('click', () => this.resume());
        document.getElementById('pause-quit-btn')?.addEventListener('click', () => this.showMenu());
        document.getElementById('start-btn')?.addEventListener('click', () => this.hideMenu());

        // Keyboard escape for pause
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const menu = document.getElementById('menu');
                const pauseMenu = document.getElementById('pause-menu');
                if (menu?.classList.contains('hidden')) {
                    this.showPauseMenu();
                } else {
                    this.hideMenu();
                }
            }
        });
    }

    private showMenu(): void {
        document.getElementById('menu')?.classList.remove('hidden');
        document.getElementById('pause-menu')?.classList.add('hidden');
        this.isRunning = false;
    }

    private hideMenu(): void {
        document.getElementById('menu')?.classList.add('hidden');
        this.isRunning = true;
    }

    private showPauseMenu(): void {
        document.getElementById('pause-menu')?.classList.remove('hidden');
        this.isRunning = false;
    }

    private resume(): void {
        document.getElementById('pause-menu')?.classList.add('hidden');
        this.isRunning = true;
    }
}
