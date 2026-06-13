import * as THREE from 'three';

export class Renderer {
    private renderer: THREE.WebGLRenderer | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private scene: THREE.Scene | null = null;

    public init(): void {
        const canvas = document.createElement('canvas');
        document.getElementById('app')?.appendChild(canvas);

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x87ceeb); // Sky blue
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 500, 1000);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 200, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        this.scene.add(directionalLight);

        window.addEventListener('resize', () => this.onWindowResize());
        console.log('✅ Renderer initialized');
    }

    public getScene(): THREE.Scene {
        if (!this.scene) throw new Error('Scene not initialized');
        return this.scene;
    }

    public getRenderer(): THREE.WebGLRenderer {
        if (!this.renderer) throw new Error('Renderer not initialized');
        return this.renderer;
    }

    public render(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
        if (!this.renderer) return;
        this.renderer.render(scene, camera);
    }

    private onWindowResize(): void {
        if (!this.renderer) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);

        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }
}
