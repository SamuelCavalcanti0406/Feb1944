/**
 * Sistema de Partículas: Sangue 3D, Faíscas, Fumaça e Respingos na Lente
 */

export class Particle {
    constructor(x, y, z, vx, vy, vz, color, size, life, type = 'blood') {
        this.x = x;
        this.y = y;
        this.z = z; // 0 = chão, 0.5 = nível dos olhos, 1.0 = teto
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.type = type;
        this.gravity = type === 'blood' ? 2.5 : (type === 'smoke' ? -0.4 : 1.5);
    }

    update(dt) {
        this.life -= dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;
        this.vz -= this.gravity * dt;

        // Limite no chão
        if (this.z < 0) {
            this.z = 0;
            this.vx *= 0.5;
            this.vy *= 0.5;
            this.vz = 0;
        }

        if (this.type === 'smoke') {
            this.size += dt * 4; // Fumaça expande
        }
    }
}

export class ParticleManager {
    constructor() {
        this.particles = [];
        this.screenBloodDrops = [];
    }

    update(dt) {
        // Atualiza partículas 3D do mundo
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Atualiza sangue na tela (escorrendo)
        for (let i = this.screenBloodDrops.length - 1; i >= 0; i--) {
            const drop = this.screenBloodDrops[i];
            drop.life -= dt;
            drop.y += drop.dripSpeed * dt;
            drop.alpha = Math.max(0, drop.life / drop.maxLife);
            if (drop.life <= 0) {
                this.screenBloodDrops.splice(i, 1);
            }
        }
    }

    // Explosão de sangue quando o inimigo é atingido
    spawnBlood(x, y, z = 0.5, amount = 14, isGib = false) {
        const count = isGib ? amount * 2.5 : amount;
        const colors = ['#8a0303', '#b30000', '#630000', '#e60000'];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = isGib ? (1.5 + Math.random() * 3.5) : (0.8 + Math.random() * 1.8);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const vz = (Math.random() - 0.2) * (isGib ? 3.0 : 1.5);
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = isGib ? (3 + Math.random() * 4) : (1.5 + Math.random() * 2.5);
            const life = 0.8 + Math.random() * 1.2;

            this.particles.push(new Particle(x, y, z, vx, vy, vz, color, size, life, 'blood'));
        }
    }

    // Faíscas de tiro atingindo concreto / metal
    spawnSparks(x, y, z = 0.5, amount = 6) {
        const colors = ['#fffb00', '#ff9900', '#ffffff'];
        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 2.0;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const vz = (Math.random() - 0.3) * 2.0;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 1.5;
            const life = 0.2 + Math.random() * 0.2;

            this.particles.push(new Particle(x, y, z, vx, vy, vz, color, size, life, 'spark'));
        }
    }

    // Fumaça de cano de arma / explosão
    spawnSmoke(x, y, z = 0.5, amount = 4) {
        for (let i = 0; i < amount; i++) {
            const vx = (Math.random() - 0.5) * 0.4;
            const vy = (Math.random() - 0.5) * 0.4;
            const vz = 0.2 + Math.random() * 0.4;
            const color = 'rgba(180, 180, 180, 0.4)';
            const size = 2 + Math.random() * 3;
            const life = 0.4 + Math.random() * 0.4;

            this.particles.push(new Particle(x, y, z, vx, vy, vz, color, size, life, 'smoke'));
        }
    }

    // Gotas de sangue espirradas diretamente na tela/visor do jogador
    addScreenBlood(amount = 4) {
        for (let i = 0; i < amount; i++) {
            this.screenBloodDrops.push({
                x: Math.random(),
                y: Math.random() * 0.7,
                radius: 12 + Math.random() * 28,
                dripSpeed: 0.02 + Math.random() * 0.04,
                life: 3.5 + Math.random() * 2.0,
                maxLife: 5.5,
                alpha: 1.0
            });
        }
    }

    // Renderiza o sangue na tela (Overlay do visor)
    renderScreenBlood(ctx, width, height) {
        if (this.screenBloodDrops.length === 0) return;

        ctx.save();
        for (const drop of this.screenBloodDrops) {
            const screenX = drop.x * width;
            const screenY = drop.y * height;

            ctx.fillStyle = `rgba(130, 0, 0, ${drop.alpha * 0.75})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, drop.radius, 0, Math.PI * 2);
            ctx.fill();

            // Rastro escorrendo
            ctx.fillStyle = `rgba(90, 0, 0, ${drop.alpha * 0.6})`;
            ctx.fillRect(screenX - drop.radius * 0.3, screenY, drop.radius * 0.6, drop.radius * 1.6);

            // Brilho do sangue fresco
            ctx.fillStyle = `rgba(220, 20, 20, ${drop.alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(screenX - drop.radius * 0.3, screenY - drop.radius * 0.3, drop.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
