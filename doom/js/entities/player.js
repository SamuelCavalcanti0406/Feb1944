/**
 * Entidade do Jogador (O "Pracinha" da FEB)
 * Movimentação ágil e fluida com foco em Strafe, controle de vida, armadura, dano e timers de sangue.
 */

export class Player {
    constructor(spawnX = 2.5, spawnY = 2.5, spawnAngle = 0) {
        this.x = spawnX;
        this.y = spawnY;
        this.angle = spawnAngle;
        this.radius = 0.3;

        // Atributos de Sobrevivência
        this.health = 100;
        this.maxHealth = 100;
        this.armor = 25;
        this.maxArmor = 100;

        // Munição
        this.ammo = {
            revolver: 24,
            smg: 60,
            rifle: 16
        };
        this.maxAmmo = {
            revolver: 60,
            smg: 200,
            rifle: 50
        };

        // Chaves
        this.hasIronKey = false;
        this.hasGoldKey = false;

        // Timers de Efeitos Visuais
        this.coffeeTimer = 0;
        this.damageFlashTimer = 0;
        this.bloodOnFaceTimer = 0; // Sangue respingado no rosto e cantos da tela
        this.faceState = 'normal'; // 'normal', 'firing', 'hurt', 'grin', 'dead'
        this.faceTimer = 0;

        // Estatísticas
        this.kills = 0;
        this.secretsFound = 0;
    }

    reset(spawn) {
        this.x = spawn.x;
        this.y = spawn.y;
        this.angle = spawn.angle;
        this.health = 100;
        this.armor = 25;
        this.ammo = { revolver: 24, smg: 60, rifle: 16 };
        this.hasIronKey = false;
        this.hasGoldKey = false;
        this.coffeeTimer = 0;
        this.damageFlashTimer = 0;
        this.bloodOnFaceTimer = 0;
        this.faceState = 'normal';
        this.faceTimer = 0;
        this.kills = 0;
    }

    // Impacto de dano com flash vermelho e tremor violento imediato
    takeDamage(amount, soundFX, bloodScreen) {
        if (this.health <= 0) return;

        if (this.armor > 0) {
            const armorAbsorb = Math.min(this.armor, amount * 0.5);
            this.armor -= armorAbsorb;
            amount -= armorAbsorb;
        }

        this.health = Math.max(0, this.health - amount);
        this.damageFlashTimer = 0.15; // Flash vermelho rápido e agressivo
        this.faceState = 'hurt';
        this.faceTimer = 0.6;

        soundFX.playPlayerHurt();
        bloodScreen.addViolentShake(0.85); // Tremor violento por 0.1s

        if (this.health <= 0) {
            this.faceState = 'dead';
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addArmor(amount) {
        this.armor = Math.min(this.maxArmor, this.armor + amount);
    }

    addAmmo(type, amount) {
        if (this.ammo[type] !== undefined) {
            this.ammo[type] = Math.min(this.maxAmmo[type], this.ammo[type] + amount);
        }
    }

    triggerGrin() {
        this.faceState = 'grin';
        this.faceTimer = 1.2;
    }

    triggerCloseKillBlood() {
        this.bloodOnFaceTimer = 2.0; // Gotas de sangue no rosto e visor desvanecem em 2 segundos
        this.triggerGrin();
    }

    update(dt, input, gameMap, hud) {
        if (this.coffeeTimer > 0) {
            this.coffeeTimer -= dt;
        }
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
        }
        if (this.bloodOnFaceTimer > 0) {
            this.bloodOnFaceTimer -= dt;
        }
        if (this.faceTimer > 0) {
            this.faceTimer -= dt;
            if (this.faceTimer <= 0 && this.health > 0) {
                this.faceState = 'normal';
            }
        }

        if (this.health <= 0) return;

        // Rotação rápida e precisa da câmera
        const rotSpeed = 2.6;
        if (input.keys['ArrowLeft'] || input.keys['KeyQ']) {
            this.angle -= rotSpeed * dt;
        }
        if (input.keys['ArrowRight'] || input.keys['KeyE']) {
            this.angle += rotSpeed * dt;
        }
        if (input.mouseDeltaX !== 0) {
            this.angle += input.mouseDeltaX * 0.0028;
            input.mouseDeltaX = 0;
        }

        this.angle = (this.angle + Math.PI * 2) % (Math.PI * 2);

        // Movimentação Rápida & Responsiva focada em Strafe (DOOM Combat Dance)
        const speedBoost = this.coffeeTimer > 0 ? 1.6 : 1.0;
        const baseSpeed = 4.4 * speedBoost;
        const strafeSpeed = 4.6 * speedBoost; // Strafe lateral ligeiramente mais rápido

        let moveForward = 0;
        let moveStrafe = 0;

        const forwardX = Math.cos(this.angle);
        const forwardY = Math.sin(this.angle);
        const strafeX = -Math.sin(this.angle);
        const strafeY = Math.cos(this.angle);

        if (input.keys['KeyW'] || input.keys['ArrowUp']) moveForward += 1;
        if (input.keys['KeyS'] || input.keys['ArrowDown']) moveForward -= 1;
        if (input.keys['KeyD']) moveStrafe += 1;
        if (input.keys['KeyA']) moveStrafe -= 1;

        let totalDx = (forwardX * moveForward * baseSpeed) + (strafeX * moveStrafe * strafeSpeed);
        let totalDy = (forwardY * moveForward * baseSpeed) + (strafeY * moveStrafe * strafeSpeed);

        if (moveForward !== 0 && moveStrafe !== 0) {
            totalDx *= 0.78;
            totalDy *= 0.78;
        }

        if (totalDx !== 0 || totalDy !== 0) {
            const dx = totalDx * dt;
            const dy = totalDy * dt;

            // Deslizamento suave em paredes (Slide collision)
            const newX = this.x + dx;
            const rX = dx > 0 ? this.radius : -this.radius;
            if (!gameMap.isSolid(newX + rX, this.y)) {
                this.x = newX;
            }

            const newY = this.y + dy;
            const rY = dy > 0 ? this.radius : -this.radius;
            if (!gameMap.isSolid(this.x, newY + rY)) {
                this.y = newY;
            }
        }
    }
}
