/**
 * Gerenciador de Controles (Teclado, Mouse Pointer Lock e Toque)
 */

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouseDeltaX = 0;
        this.isMouseDown = false;
        this.pointerLocked = false;
        this.onInteract = null;
        this.onWeaponSelect = null;
        this.onShoot = null;

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Teclas de Armas 1, 2, 3, 4
            if (e.code === 'Digit1' && this.onWeaponSelect) this.onWeaponSelect(0);
            if (e.code === 'Digit2' && this.onWeaponSelect) this.onWeaponSelect(1);
            if (e.code === 'Digit3' && this.onWeaponSelect) this.onWeaponSelect(2);
            if (e.code === 'Digit4' && this.onWeaponSelect) this.onWeaponSelect(3);

            // Interação (E ou Espaço)
            if ((e.code === 'KeyE' || e.code === 'Space') && this.onInteract) {
                this.onInteract();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse Pointer Lock
        this.canvas.addEventListener('click', () => {
            if (!this.pointerLocked && document.pointerLockElement !== this.canvas) {
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.pointerLocked) {
                this.mouseDeltaX += e.movementX;
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isMouseDown = true;
                if (this.onShoot) this.onShoot();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isMouseDown = false;
            }
        });

        // Troca de arma pela roda do mouse
        window.addEventListener('wheel', (e) => {
            if (this.onWeaponWheel) {
                this.onWeaponWheel(e.deltaY > 0 ? 1 : -1);
            }
        });
    }
}
