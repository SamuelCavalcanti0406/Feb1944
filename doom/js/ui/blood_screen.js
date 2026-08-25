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

    // Tremor violento por 0.1s ao tomar dano
    addViolentShake(amount = 0.8) {
        this.trauma = Math.min(this.maxTrauma, this.trauma + amount);
        this.violentShakeTimer = 0.12;
    }

    update(dt) {
        if (this.violentShakeTimer > 0) {
            this.violentShakeTimer -= dt;
            // Tremor violento rápido de impacto
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

    // Renderiza a sobreposição (overlay) de respingos de sangue nos cantos da visão do jogador
    renderCornerBloodOverlay(ctx, width, height, bloodTimer) {
        if (bloodTimer <= 0) return;

        const alpha = Math.min(1.0, bloodTimer / 2.0);
        ctx.save();

        // 1. Respingos no Canto Superior Esquerdo
        this.renderCornerSplatter(ctx, 0, 0, 1, 1, alpha);

        // 2. Respingos no Canto Superior Direito
        this.renderCornerSplatter(ctx, width, 0, -1, 1, alpha);

        // 3. Respingos no Canto Inferior Esquerdo
        this.renderCornerSplatter(ctx, 0, height, 1, -1, alpha);

        // 4. Respingos no Canto Inferior Direito
        this.renderCornerSplatter(ctx, width, height, -1, -1, alpha);

        ctx.restore();
    }

    renderCornerSplatter(ctx, originX, originY, scaleX, scaleY, alpha) {
        ctx.save();
        ctx.translate(originX, originY);
        ctx.scale(scaleX, scaleY);

        ctx.fillStyle = `rgba(160, 0, 0, ${alpha * 0.75})`;

        // Mancha principal no canto
        ctx.beginPath();
        ctx.arc(10, 10, 42, 0, Math.PI * 2);
        ctx.fill();

        // Gotas e respingos pixelados em arco
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

            // Rastro escorrendo
            ctx.fillStyle = `rgba(110, 0, 0, ${alpha * 0.65})`;
            ctx.fillRect(drop.x - 2, drop.y, 4, drop.r * 1.8);
            ctx.fillStyle = `rgba(160, 0, 0, ${alpha * 0.75})`;
        }

        // Brilhos de sangue fresco
        ctx.fillStyle = `rgba(255, 60, 60, ${alpha * 0.5})`;
        ctx.fillRect(15, 15, 6, 6);
        ctx.fillRect(42, 42, 3, 3);

        ctx.restore();
    }
}
