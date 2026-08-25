/**
 * Entidades Inimigas do Eixo (Wehrmacht & Oficiais SS) - Fidelidade Histórica 1944
 * Renderização procedural de alta fidelidade em Pixel Art:
 * - Soldado Wehrmacht: Uniforme Feldgrau, Stahlhelm M35/M40, Y-straps, botas Knobelbecher e Kar98k.
 * - Oficial SS: Túnica preta, Schirmmütze com Totenkopf/Águia, braçadeira com suástica e MP40.
 */

export class Enemy {
    constructor(type = 'soldier', x = 0, y = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 0.35;

        if (type === 'officer') {
            this.maxHealth = 120;
            this.speed = 2.4;
            this.damage = 12;
            this.fireCooldown = 0.22;
            this.attackRange = 11;
            this.colorSuit = '#1a1d20';       // Túnica preta SS
            this.colorPants = '#151719';
            this.colorCap = '#202428';
        } else {
            this.maxHealth = 70;
            this.speed = 1.7;
            this.damage = 20;
            this.fireCooldown = 1.0;
            this.attackRange = 13;
            this.colorSuit = '#485848';       // Feldgrau autêntico da Wehrmacht
            this.colorPants = '#3d4b3d';
            this.colorCap = '#2e3a2e';        // Stahlhelm M35/M40
        }

        this.health = this.maxHealth;
        this.state = 'idle'; // 'idle', 'chase', 'attack', 'pain', 'dead', 'gib'
        this.stateTimer = 0;
        this.walkAnimTimer = Math.random() * 10;
        this.shootTimer = 0;
        this.isDead = false;
    }

    takeDamage(amount, soundFX, particleManager, hud) {
        if (this.isDead) return;

        this.health -= amount;
        this.state = 'pain';
        this.stateTimer = 0.18;

        const isGib = this.health <= -25;
        particleManager.spawnBlood(this.x, this.y, 0.5, isGib ? 35 : 14, isGib);

        if (this.health <= 0) {
            this.isDead = true;
            this.state = isGib ? 'gib' : 'dead';
            this.stateTimer = 0;
            soundFX.playEnemyDeath();
            hud.addScore(this.type === 'officer' ? 300 : 120);
        } else {
            soundFX.playGoreSquish();
        }
    }

    update(dt, player, gameMap, soundFX, bloodScreen, particleManager, hud) {
        if (this.isDead) {
            this.stateTimer += dt;
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (this.state === 'pain') {
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.state = 'chase';
            }
            return;
        }

        const hasLoS = this.checkLineOfSight(player.x, player.y, gameMap);

        if (this.state === 'idle') {
            if (hasLoS && dist < 14) {
                this.state = 'chase';
            }
        } else if (this.state === 'chase') {
            this.walkAnimTimer += dt * 7;

            if (hasLoS && dist <= this.attackRange) {
                this.state = 'attack';
                this.shootTimer = 0.35;
            } else {
                const moveX = (dx / dist) * this.speed * dt;
                const moveY = (dy / dist) * this.speed * dt;

                if (!gameMap.isSolid(this.x + moveX + (moveX > 0 ? this.radius : -this.radius), this.y)) {
                    this.x += moveX;
                }
                if (!gameMap.isSolid(this.x, this.y + moveY + (moveY > 0 ? this.radius : -this.radius))) {
                    this.y += moveY;
                }
            }
        } else if (this.state === 'attack') {
            this.shootTimer -= dt;
            if (this.shootTimer <= 0) {
                this.shootAtPlayer(player, soundFX, bloodScreen, particleManager, hud);
                this.shootTimer = this.fireCooldown;
                if (!hasLoS || dist > this.attackRange + 2) {
                    this.state = 'chase';
                }
            }
        }
    }

    shootAtPlayer(player, soundFX, bloodScreen, particleManager, hud) {
        if (this.type === 'officer') {
            soundFX.playThompsonShot();
        } else {
            soundFX.playRevolverShot();
        }

        particleManager.spawnSparks(this.x, this.y, 0.5, 4);

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Chance de acerto com base na distância e movimento
        const hitChance = Math.max(0.25, 0.85 - dist * 0.045);
        if (Math.random() < hitChance) {
            player.takeDamage(this.damage, soundFX, bloodScreen);
        }
    }

    checkLineOfSight(targetX, targetY, gameMap) {
        const steps = 22;
        const dx = (targetX - this.x) / steps;
        const dy = (targetY - this.y) / steps;

        for (let i = 1; i < steps; i++) {
            const checkX = this.x + dx * i;
            const checkY = this.y + dy * i;
            if (gameMap.isSolid(checkX, checkY)) {
                return false;
            }
        }
        return true;
    }

    render(ctx, screenX, screenY, size) {
        ctx.save();
        ctx.translate(screenX, screenY);

        const s = size / 64;

        if (this.state === 'gib') {
            this.renderGibs(ctx, s);
        } else if (this.state === 'dead') {
            this.renderCorpse(ctx, s);
        } else {
            this.renderLivingNazi(ctx, s);
        }

        ctx.restore();
    }

    // RENDERIZAÇÃO DO SOLDADO WEHRMACHT / OFICIAL SS
    renderLivingNazi(ctx, s) {
        // Sombra no chão
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 27 * s, 18 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Pernas e Botas de Marcha (Knobelbecher)
        const legSwing = this.state === 'chase' ? Math.sin(this.walkAnimTimer) * 7 * s : 0;
        ctx.fillStyle = this.colorPants;
        ctx.fillRect(-11 * s + legSwing, 10 * s, 9 * s, 10 * s);
        ctx.fillRect(2 * s - legSwing, 10 * s, 9 * s, 10 * s);

        // Botas pretas de couro com cano alto
        ctx.fillStyle = '#141618';
        ctx.fillRect(-12 * s + legSwing, 18 * s, 10 * s, 10 * s);
        ctx.fillRect(2 * s - legSwing, 18 * s, 10 * s, 10 * s);
        ctx.fillStyle = '#262a2e'; // Salto / biqueira
        ctx.fillRect(-14 * s + legSwing, 24 * s, 12 * s, 4 * s);
        ctx.fillRect(2 * s - legSwing, 24 * s, 12 * s, 4 * s);

        // 2. Tronco / Túnica Militar (Feldgrau ou SS Negra)
        ctx.fillStyle = this.colorSuit;
        ctx.fillRect(-13 * s, -14 * s, 26 * s, 25 * s);

        // Gola da farda
        ctx.fillStyle = '#1e241e';
        ctx.fillRect(-8 * s, -14 * s, 16 * s, 4 * s);

        if (this.type === 'officer') {
            // Abas de colarinho prateadas (Kragenspiegel SS)
            ctx.fillStyle = '#d6dbe0';
            ctx.fillRect(-11 * s, -14 * s, 3 * s, 4 * s);
            ctx.fillRect(8 * s, -14 * s, 3 * s, 4 * s);

            // Braçadeira Vermelha com Suástica no braço esquerdo
            ctx.fillStyle = '#c91818';
            ctx.fillRect(-16 * s, -8 * s, 4 * s, 9 * s); // Faixa vermelha
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-14 * s, -4 * s, 2.2 * s, 0, Math.PI * 2); // Círculo branco
            ctx.fill();
            ctx.fillStyle = '#111111';
            ctx.fillRect(-15 * s, -4.5 * s, 2 * s, 1 * s); // Símbolo suástica
            ctx.fillRect(-14.5 * s, -5 * s, 1 * s, 2 * s);

            // Gravata preta e camisa
            ctx.fillStyle = '#0f1112';
            ctx.fillRect(-3 * s, -10 * s, 6 * s, 12 * s);
        } else {
            // Y-Straps (Suspensórios de couro de combate) cruzando o peito
            ctx.fillStyle = '#181a1c';
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(-10 * s, -14 * s); ctx.lineTo(-3 * s, 5 * s);
            ctx.moveTo(10 * s, -14 * s);  ctx.lineTo(3 * s, 5 * s);
            ctx.stroke();

            // Insígnia da Águia da Wehrmacht no peito direito
            ctx.fillStyle = '#c0c8c0';
            ctx.fillRect(3 * s, -9 * s, 6 * s, 2 * s);
        }

        // Cinto de couro preto com fivela militar
        ctx.fillStyle = '#121415';
        ctx.fillRect(-13 * s, 6 * s, 26 * s, 5 * s);
        ctx.fillStyle = this.type === 'officer' ? '#d6dbe0' : '#8a958a';
        ctx.fillRect(-3 * s, 6 * s, 6 * s, 5 * s); // Fivela

        // Cartucheiras de munição nos dois lados do cinto
        ctx.fillStyle = '#22160e'; // Couro marrom
        ctx.fillRect(-12 * s, 6 * s, 6 * s, 6 * s);
        ctx.fillRect(6 * s, 6 * s, 6 * s, 6 * s);

        // 3. Cabeça e Rosto
        ctx.fillStyle = '#deb887'; // Pele
        ctx.fillRect(-6 * s, -24 * s, 12 * s, 11 * s);

        // Olhos severos
        ctx.fillStyle = '#111';
        ctx.fillRect(-4 * s, -20 * s, 2 * s, 2 * s);
        ctx.fillRect(2 * s, -20 * s, 2 * s, 2 * s);

        // 4. Cobertura de Cabeça: Stahlhelm M35 ou Schirmmütze de Oficial
        if (this.type === 'officer') {
            // Quepe de Oficial SS (Schirmmütze) de coroa alta
            ctx.fillStyle = this.colorCap;
            ctx.fillRect(-10 * s, -31 * s, 20 * s, 9 * s); // Topo expandido
            ctx.fillStyle = '#111';
            ctx.fillRect(-11 * s, -24 * s, 22 * s, 3 * s); // Aba brilhante
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(-8 * s, -24 * s, 16 * s, 1.5 * s); // Cordão dourado

            // Águia imperial prateada e Totenkopf (Caveira)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-3 * s, -29 * s, 6 * s, 2 * s); // Águia
            ctx.fillRect(-2 * s, -26 * s, 4 * s, 2 * s); // Totenkopf
        } else {
            // Capacete Stahlhelm M35 de Aço Alemão
            ctx.fillStyle = this.colorCap;
            ctx.beginPath();
            ctx.arc(0, -23 * s, 10 * s, Math.PI, 0);
            ctx.fill();
            // Aba protetora e nuca
            ctx.fillRect(-11 * s, -24 * s, 22 * s, 5 * s);
            ctx.fillRect(-12 * s, -22 * s, 24 * s, 3 * s);

            // Escudo/Decalque tricolor na lateral do capacete
            ctx.fillStyle = '#c91818'; // Vermelho
            ctx.fillRect(8 * s, -24 * s, 2 * s, 3 * s);
            ctx.fillStyle = '#ffffff'; // Branco
            ctx.fillRect(7 * s, -24 * s, 1 * s, 3 * s);
            ctx.fillStyle = '#111111'; // Preto
            ctx.fillRect(6 * s, -24 * s, 1 * s, 3 * s);

            // Jugular de couro (queixeira)
            ctx.fillStyle = '#22160e';
            ctx.fillRect(-6 * s, -14 * s, 12 * s, 1.5 * s);
        }

        // 5. Armamento: Kar98k ou MP40
        if (this.state === 'attack') {
            // Postura de disparo frontal
            ctx.fillStyle = '#181a1c';
            ctx.fillRect(-4 * s, -6 * s, 8 * s, 8 * s);
            // Muzzle flash inimigo brilhante
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(0, -6 * s, 9 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -6 * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Arma empunhada
            if (this.type === 'officer') {
                // MP40 na mão
                ctx.fillStyle = '#22252a';
                ctx.fillRect(8 * s, -6 * s, 6 * s, 18 * s);
                ctx.fillStyle = '#111';
                ctx.fillRect(6 * s, 0, 4 * s, 12 * s); // Carregador
            } else {
                // Fuzil Kar98k com coronha de madeira
                ctx.fillStyle = '#5a3014'; // Madeira
                ctx.fillRect(9 * s, -12 * s, 4 * s, 24 * s);
                ctx.fillStyle = '#22252a'; // Cano
                ctx.fillRect(10 * s, -22 * s, 2 * s, 12 * s);
            }
        }

        // 6. Flash de Dor / Impacto de Sangue
        if (this.state === 'pain') {
            ctx.fillStyle = 'rgba(230, 0, 0, 0.55)';
            ctx.fillRect(-15 * s, -33 * s, 30 * s, 65 * s);
        }
    }

    // CADÁVER DE SOLDADO NAZISTA DERROTADO
    renderCorpse(ctx, s) {
        // Poça de sangue
        ctx.fillStyle = '#7a0505';
        ctx.beginPath();
        ctx.ellipse(0, 22 * s, 25 * s, 10 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo estirado no chão
        ctx.fillStyle = this.colorSuit;
        ctx.fillRect(-20 * s, 12 * s, 40 * s, 12 * s);
        ctx.fillStyle = '#141618'; // Botas
        ctx.fillRect(-24 * s, 14 * s, 6 * s, 10 * s);

        // Capacete ou Quepe caído ao lado
        ctx.fillStyle = this.colorCap;
        ctx.beginPath();
        ctx.arc(18 * s, 16 * s, 7 * s, 0, Math.PI * 2);
        ctx.fill();
    }

    // EXPLOSÃO DE GORE / DESTROÇOS (GIBS)
    renderGibs(ctx, s) {
        ctx.fillStyle = '#8f0000';
        ctx.beginPath();
        ctx.ellipse(0, 20 * s, 30 * s, 13 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a0000';
        ctx.fillRect(-14 * s, 14 * s, 9 * s, 6 * s);
        ctx.fillRect(8 * s, 16 * s, 11 * s, 5 * s);
        ctx.fillRect(-4 * s, 22 * s, 8 * s, 4 * s);

        // Pedaços da farda feldgrau/preta despedaçados
        ctx.fillStyle = this.colorSuit;
        ctx.fillRect(-18 * s, 18 * s, 7 * s, 7 * s);
        ctx.fillRect(16 * s, 14 * s, 6 * s, 6 * s);
    }
}
