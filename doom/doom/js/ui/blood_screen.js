/**
 * Gerenciador de Screen Shake (Trauma Decay), Impacto de Dano e Gotas de Sangue no Visor
 */

export class BloodScreen {
    constructor() {
        this.trauma = 0;
        this.maxTrauma = 1.0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.violentShakeTimer = 0;
    }

    addShake(amount) {
        this.trauma = Math.min(this.maxTrauma, this.trauma + amount);
    }

    addViolentShake(amount = 0.8) {
        this.trauma = Math.min(this.maxTrauma, this.trauma + amount);
        this.violentShakeTimer = 0.12;
    }

    update(dt) {
        if (this.violentShakeTimer > 0) {
            this.violentShakeTimer -= dt;
            this.shakeX = (Math.random() * 2 - 1) * 22;
            this.shakeY = (Math.random() * 2 - 1) * 22;
            return;
        }

        if (this.trauma > 0) {
            this.trauma = Math.max(0, this.trauma - dt * 2.5);
            const shake = this.trauma * this.trauma * 18;
            this.shakeX = (Math.random() * 2 - 1) * shake;
            this.shakeY = (Math.random() * 2 - 1) * shake;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    renderCornerBloodOverlay(ctx, width, height, bloodTimer) {
        if (bloodTimer <= 0) return;

        const alpha = Math.min(1.0, bloodTimer / 2.0);
        ctx.save();

        this.renderCornerSplatter(ctx, 0, 0, 1, 1, alpha);
        this.renderCornerSplatter(ctx, width, 0, -1, 1, alpha);
        this.renderCornerSplatter(ctx, 0, height, 1, -1, alpha);
        this.renderCornerSplatter(ctx, width, height, -1, -1, alpha);

        ctx.restore();
    }

    renderCornerSplatter(ctx, originX, originY, scaleX, scaleY, alpha) {
        ctx.save();
        ctx.translate(originX, originY);
        ctx.scale(scaleX, scaleY);

        ctx.fillStyle = `rgba(160, 0, 0, ${alpha * 0.75})`;

        ctx.beginPath();
        ctx.arc(10, 10, 42, 0, Math.PI * 2);
        ctx.fill();

        const drops = [
            { x: 35, y: 15, r: 8 },
            { x: 55, y: 10, r: 5 },
            { x: 20, y: 38, r: 9 },
            { x: 12, y: 60, r: 6 },
            { x: 45, y: 45, r: 7 },
            { x: 70, y: 25, r: 4 },
            { x: 28, y: 75, r: 5 },
            { x: 60, y: 55, r: 4 }
        ];

        for (const drop of drops) {
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(110, 0, 0, ${alpha * 0.65})`;
            ctx.fillRect(drop.x - 2, drop.y, 4, drop.r * 1.8);
            ctx.fillStyle = `rgba(160, 0, 0, ${alpha * 0.75})`;
        }

        ctx.fillStyle = `rgba(255, 60, 60, ${alpha * 0.5})`;
        ctx.fillRect(15, 15, 6, 6);
        ctx.fillRect(42, 42, 3, 3);

        ctx.restore();
    }
}
