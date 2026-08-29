/**
 * Câmera e Efeitos de Movimento (Head Bobbing & Weapon Sway)
 */

export class Camera {
    constructor() {
        this.fov = Math.PI / 3;
        this.bobTimer = 0;
        this.bobX = 0;
        this.bobY = 0;
    }

    update(dt, isMoving, speedMultiplier = 1.0) {
        if (isMoving) {
            this.bobTimer += dt * 10 * speedMultiplier;
            this.bobX = Math.cos(this.bobTimer * 0.5) * 6;
            this.bobY = Math.abs(Math.sin(this.bobTimer)) * 6;
        } else {
            this.bobTimer = 0;
            this.bobX *= Math.max(0, 1 - dt * 10);
            this.bobY *= Math.max(0, 1 - dt * 10);
        }
    }
}
