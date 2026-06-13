export class Input {
    private keys: Record<string, boolean> = {};
    private mouseButtons: Record<number, boolean> = {};
    private mouseX = 0;
    private mouseY = 0;
    private deltaMouseX = 0;
    private deltaMouseY = 0;
    private isLocked = false;

    public init(): void {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        console.log('✅ Input initialized');
    }

    private onKeyDown(event: KeyboardEvent): void {
        this.keys[event.key.toLowerCase()] = true;
    }

    private onKeyUp(event: KeyboardEvent): void {
        this.keys[event.key.toLowerCase()] = false;
    }

    private onMouseDown(event: MouseEvent): void {
        this.mouseButtons[event.button] = true;

        // Request pointer lock on any click
        if (!this.isLocked) {
            document.documentElement.requestPointerLock();
        }
    }

    private onMouseUp(event: MouseEvent): void {
        this.mouseButtons[event.button] = false;
    }

    private onMouseMove(event: MouseEvent): void {
        if (this.isLocked) {
            this.deltaMouseX = event.movementX;
            this.deltaMouseY = event.movementY;
        }
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    private onPointerLockChange(): void {
        this.isLocked = document.pointerLockElement === document.documentElement;
    }

    public getKey(key: string): boolean {
        return this.keys[key.toLowerCase()] || false;
    }

    public getMouseButton(button: number): boolean {
        return this.mouseButtons[button] || false;
    }

    public getMouseDelta(): { x: number; y: number } {
        const delta = { x: this.deltaMouseX, y: this.deltaMouseY };
        this.deltaMouseX = 0;
        this.deltaMouseY = 0;
        return delta;
    }

    public isPointerLocked(): boolean {
        return this.isLocked;
    }

    public releasePointerLock(): void {
        if (this.isLocked) {
            document.exitPointerLock();
        }
    }
}
