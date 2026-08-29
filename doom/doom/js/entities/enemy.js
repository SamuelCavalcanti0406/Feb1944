/**
 * Entidades Inimigas do Eixo (Wehrmacht, Oficiais SS e Sub-Chefe Artilheiro MG42)
 * Renderização procedural de alta fidelidade em Pixel Art:
 * - Soldado Wehrmacht: Uniforme Feldgrau, Stahlhelm M35/M40, Y-straps, Kar98k (70 HP).
 * - Oficial SS: Túnica preta, Schirmmütze com Totenkopf, braçadeira com suástica e MP40 (120 HP).
 * - Artilheiro MG42 (HeavyGunner): Sub-chefe robusto com sobretudo longo, Stahlhelm reforçado, MG42 com fita de munição (280 HP, rajadas de 5-8 tiros e drop da Chave do Oficial).
 */

export class Enemy {
    constructor(type = 'soldier', x = 0, y = 0, dropItem = null) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.dropItem = dropItem;

        if (type === 'heavy_gunner') {
            this.maxHealth = 280; // 4x a vida de um soldado comum (70 * 4)
            this.speed = 0.7;     // Movimento lento, quase uma torreta humana
            this.damage = 9;
            this.fireCooldown = 1.3;
            this.attackRange = 16;
            this.radius = 0.45;   // Modelo mais robusto
            this.colorSuit = '#354035'; // Sobretudo longo militar pesado
            this.colorPants = '#283128';
            this.colorCap = '#202820';
            
            // Controle de Rajada da MG42 (5 a 8 projéteis em rápida sucessão)
            this.burstShotsTotal = 7;
            this.burstShotsRemaining = 0;
            this.burstIntervalTimer = 0;
        } else if (type === 'officer') {
            this.maxHealth = 120;
            this.speed = 2.4;
            this.damage = 12;
            this.fireCooldown = 0.22;
            this.attackRange = 11;
            this.radius = 0.35;
            this.colorSuit = '#1a1d20';
            this.colorPants = '#151719';
            this.colorCap = '#202428';
        } else {
            this.maxHealth = 70;
            this.speed = 1.7;
            this.damage = 20;
            this.fireCooldown = 1.0;
            this.attackRange = 13;
            this.radius = 0.35;
            this.colorSuit = '#485848';
            this.colorPants = '#3d4b3d';
            this.colorCap = '#2e3a2e';
        }

        this.health = this.maxHealth;
        this.state = 'idle'; // 'idle', 'chase', 'attack', 'pain', 'dead', 'gib'
        this.stateTimer = 0;
        this.walkAnimTimer = Math.random() * 10;
        this.shootTimer = 0;
        this.isDead = false;
        this.onDeathCallback = null;
    }

    takeDamage(amount, soundFX, particleManager, hud) {
        if (this.isDead) return;

        this.health -= amount;
        this.state = 'pain';
        this.stateTimer = this.type === 'heavy_gunner' ? 0.1 : 0.18;

        const isHeavy = this.type === 'heavy_gunner';
        const isGib = this.health <= (isHeavy ? -40 : -25);
        
        // Sangue extra no Artilheiro MG42
        const bloodAmount = isHeavy ? (isGib ? 80 : 35) : (isGib ? 35 : 14);
        particleManager.spawnBlood(this.x, this.y, 0.5, bloodAmount, isGib);

        if (this.health <= 0) {
            this.isDead = true;
            this.state = isGib ? 'gib' : 'dead';
            this.stateTimer = 0;
            soundFX.playEnemyDeath();

            if (isHeavy) {
                // Sangue duplo extra espalhado no chão e paredes
                particleManager.spawnBlood(this.x, this.y, 0.5, 50, true);
                particleManager.spawnSparks(this.x, this.y, 0.5, 12);
                hud.addScore(800);
            } else {
                hud.addScore(this.type === 'officer' ? 300 : 120);
            }

            // Dispara evento de drop de item (ex: Chave do Oficial)
            if (this.onDeathCallback) {
                this.onDeathCallback(this);
            }
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
            if ((hasLoS && dist < 16) || dist < 3.0) {
                this.state = 'chase';
            }
        } else if (this.state === 'chase') {
            this.walkAnimTimer += dt * (this.type === 'heavy_gunner' ? 4 : 7);

            if (hasLoS && dist <= this.attackRange) {
                this.state = 'attack';
                this.shootTimer = this.type === 'heavy_gunner' ? 0.3 : 0.35;
                if (this.type === 'heavy_gunner') {
                    this.burstShotsRemaining = 0;
                }
            } else {
                // Perseguição em velocidade ajustada
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
            if (this.type === 'heavy_gunner') {
                this.updateHeavyGunnerAttack(dt, player, hasLoS, dist, soundFX, bloodScreen, particleManager, hud);
            } else {
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
    }

    // IA Especial do Artilheiro MG42: Rajadas sustained de 5 a 8 tiros em rápida sucessão
    updateHeavyGunnerAttack(dt, player, hasLoS, dist, soundFX, bloodScreen, particleManager, hud) {
        if (this.burstShotsRemaining > 0) {
            this.burstIntervalTimer -= dt;
            if (this.burstIntervalTimer <= 0) {
                this.burstIntervalTimer = 0.07; // Intervalo curto entre tiros da rajada (MG42 Buzzsaw)
                this.burstShotsRemaining--;

                // Disparo com dispersão angular para forçar o jogador a dar strafe
                this.shootMG42Round(player, soundFX, bloodScreen, particleManager, hud);

                if (this.burstShotsRemaining <= 0) {
                    this.shootTimer = this.fireCooldown; // Pausa após a rajada para refrigeração
                }
            }
        } else {
            this.shootTimer -= dt;
            if (this.shootTimer <= 0) {
                // Inicia nova rajada de 6 a 8 tiros
                this.burstShotsTotal = 5 + Math.floor(Math.random() * 4);
                this.burstShotsRemaining = this.burstShotsTotal;
                this.burstIntervalTimer = 0;

                if (!hasLoS || dist > this.attackRange + 2) {
                    this.state = 'chase';
                }
            }
        }
    }

    shootMG42Round(player, soundFX, bloodScreen, particleManager, hud) {
        soundFX.playMG42Shot();
        particleManager.spawnSparks(this.x, this.y, 0.5, 4);

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Variação de ângulo (Bullet Hell / Spread)
        // Se o jogador estiver em movimento lateral contínuo (strafe), reduz chance de acerto!
        const hitChance = Math.max(0.18, 0.72 - dist * 0.035);
        if (Math.random() < hitChance) {
            player.takeDamage(this.damage, soundFX, bloodScreen);
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
        } else if (this.type === 'heavy_gunner') {
            this.renderHeavyGunner(ctx, s);
        } else {
            this.renderLivingNazi(ctx, s);
        }

        ctx.restore();
    }

    // 1. RENDERIZAÇÃO DO SUB-CHEFE ARTILHEIRO MG42 (HEAVY GUNNER)
    renderHeavyGunner(ctx, s) {
        // Sombra larga
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, 28 * s, 26 * s, 8 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Pernas e Botas Pesadas
        const legSwing = this.state === 'chase' ? Math.sin(this.walkAnimTimer) * 5 * s : 0;
        ctx.fillStyle = this.colorPants;
        ctx.fillRect(-14 * s + legSwing, 12 * s, 11 * s, 10 * s);
        ctx.fillRect(3 * s - legSwing, 12 * s, 11 * s, 10 * s);

        ctx.fillStyle = '#101214'; // Botas pesadas
        ctx.fillRect(-15 * s + legSwing, 20 * s, 12 * s, 9 * s);
        ctx.fillRect(3 * s - legSwing, 20 * s, 12 * s, 9 * s);

        // 2. Sobretudo Longo Militar Pesado (Mantel)
        ctx.fillStyle = this.colorSuit;
        ctx.fillRect(-18 * s, -16 * s, 36 * s, 32 * s);

        // Aba do sobretudo cobrindo até os joelhos
        ctx.fillStyle = '#2b352b';
        ctx.fillRect(-17 * s, 8 * s, 34 * s, 10 * s);

        // Cinto duplo de couro e canastras de munição MG42
        ctx.fillStyle = '#151718';
        ctx.fillRect(-18 * s, 4 * s, 36 * s, 6 * s);
        ctx.fillStyle = '#9e8140'; // Fivela militar reforçada
        ctx.fillRect(-4 * s, 4 * s, 8 * s, 6 * s);

        // 3. Fita de Munição 7.92mm (Cinto de Balas de Latão Cruzando o Peito)
        ctx.fillStyle = '#c9933b'; // Balas de latão dourado
        for (let i = -14; i <= 14; i += 4) {
            ctx.fillRect(i * s, (-10 + (i + 14) * 0.6) * s, 3 * s, 6 * s);
            ctx.fillStyle = '#5c451b'; // Elos do cinto
            ctx.fillRect((i + 2.5) * s, (-9 + (i + 14) * 0.6) * s, 1.5 * s, 4 * s);
            ctx.fillStyle = '#c9933b';
        }

        // 4. Cabeça e Capacete Stahlhelm com Óculos de Proteção
        ctx.fillStyle = '#cfa076';
        ctx.fillRect(-7 * s, -26 * s, 14 * s, 12 * s);

        // Máscara / Lenço tático cobrindo a boca
        ctx.fillStyle = '#1d241d';
        ctx.fillRect(-7 * s, -18 * s, 14 * s, 6 * s);

        // Capacete Stahlhelm Pesado
        ctx.fillStyle = this.colorCap;
        ctx.beginPath();
        ctx.arc(0, -25 * s, 13 * s, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-14 * s, -26 * s, 28 * s, 5 * s);

        // Óculos de proteção de artilheiro (Goggles no capacete)
        ctx.fillStyle = '#111';
        ctx.fillRect(-11 * s, -28 * s, 22 * s, 4 * s);
        ctx.fillStyle = '#52b788'; // Lentes verdes reflexivas
        ctx.fillRect(-9 * s, -27 * s, 7 * s, 2.5 * s);
        ctx.fillRect(2 * s, -27 * s, 7 * s, 2.5 * s);

        // 5. A METRALHADORA PESADA MG42 COM CANO LONGO E BIPÉ
        const isShootingMG = this.state === 'attack' && this.burstShotsRemaining > 0;

        ctx.fillStyle = '#1c1e22'; // Corpo de aço da MG42
        ctx.fillRect(-8 * s, -6 * s, 16 * s, 12 * s);
        // Cano perfurado longo da MG42
        ctx.fillStyle = '#2d333b';
        ctx.fillRect(-3 * s, -18 * s, 6 * s, 14 * s);
        // Furos de ventilação no cano
        ctx.fillStyle = '#111';
        for (let py = -16; py < -6; py += 3) {
            ctx.fillRect(-2 * s, py * s, 4 * s, 1.5 * s);
        }

        // Bipé dobrado na ponta
        ctx.fillStyle = '#181a1c';
        ctx.fillRect(-5 * s, -20 * s, 10 * s, 2 * s);

        // Tambor de munição de 50 tiros (Gurttrommel) na lateral
        ctx.fillStyle = '#3a443a';
        ctx.beginPath();
        ctx.arc(-11 * s, -2 * s, 6 * s, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle Flash Massivo da MG42
        if (isShootingMG) {
            ctx.fillStyle = '#ffe066';
            ctx.beginPath();
            ctx.arc(0, -22 * s, 14 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ff5400';
            for (let a = 0; a < 6; a++) {
                const ang = (a / 6) * Math.PI * 2 + Math.random() * 0.3;
                const len = 20 * s;
                ctx.beginPath();
                ctx.moveTo(0, -22 * s);
                ctx.lineTo(Math.cos(ang) * len, -22 * s + Math.sin(ang) * len);
                ctx.stroke();
            }

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -22 * s, 6 * s, 0, Math.PI * 2);
            ctx.fill();
        }

        // Flash de Dor
        if (this.state === 'pain') {
            ctx.fillStyle = 'rgba(230, 0, 0, 0.5)';
            ctx.fillRect(-20 * s, -35 * s, 40 * s, 70 * s);
        }
    }

    renderLivingNazi(ctx, s) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 27 * s, 18 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        const legSwing = this.state === 'chase' ? Math.sin(this.walkAnimTimer) * 7 * s : 0;
        ctx.fillStyle = this.colorPants;
        ctx.fillRect(-11 * s + legSwing, 10 * s, 9 * s, 10 * s);
        ctx.fillRect(2 * s - legSwing, 10 * s, 9 * s, 10 * s);

        ctx.fillStyle = '#141618';
        ctx.fillRect(-12 * s + legSwing, 18 * s, 10 * s, 10 * s);
        ctx.fillRect(2 * s - legSwing, 18 * s, 10 * s, 10 * s);
        ctx.fillStyle = '#262a2e';
        ctx.fillRect(-14 * s + legSwing, 24 * s, 12 * s, 4 * s);
        ctx.fillRect(2 * s - legSwing, 24 * s, 12 * s, 4 * s);

        ctx.fillStyle = this.colorSuit;
        ctx.fillRect(-13 * s, -14 * s, 26 * s, 25 * s);

        ctx.fillStyle = '#1e241e';
        ctx.fillRect(-8 * s, -14 * s, 16 * s, 4 * s);

        if (this.type === 'officer') {
            ctx.fillStyle = '#d6dbe0';
            ctx.fillRect(-11 * s, -14 * s, 3 * s, 4 * s);
            ctx.fillRect(8 * s, -14 * s, 3 * s, 4 * s);

            ctx.fillStyle = '#c91818';
            ctx.fillRect(-16 * s, -8 * s, 4 * s, 9 * s);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-14 * s, -4 * s, 2.2 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111111';
            ctx.fillRect(-15 * s, -4.5 * s, 2 * s, 1 * s);
            ctx.fillRect(-14.5 * s, -5 * s, 1 * s, 2 * s);

            ctx.fillStyle = '#0f1112';
            ctx.fillRect(-3 * s, -10 * s, 6 * s, 12 * s);
        } else {
            ctx.fillStyle = '#181a1c';
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(-10 * s, -14 * s); ctx.lineTo(-3 * s, 5 * s);
            ctx.moveTo(10 * s, -14 * s);  ctx.lineTo(3 * s, 5 * s);
            ctx.stroke();

            ctx.fillStyle = '#c0c8c0';
            ctx.fillRect(3 * s, -9 * s, 6 * s, 2 * s);
        }

        ctx.fillStyle = '#121415';
        ctx.fillRect(-13 * s, 6 * s, 26 * s, 5 * s);
        ctx.fillStyle = this.type === 'officer' ? '#d6dbe0' : '#8a958a';
        ctx.fillRect(-3 * s, 6 * s, 6 * s, 5 * s);

        ctx.fillStyle = '#22160e';
        ctx.fillRect(-12 * s, 6 * s, 6 * s, 6 * s);
        ctx.fillRect(6 * s, 6 * s, 6 * s, 6 * s);

        ctx.fillStyle = '#deb887';
        ctx.fillRect(-6 * s, -24 * s, 12 * s, 11 * s);

        ctx.fillStyle = '#111';
        ctx.fillRect(-4 * s, -20 * s, 2 * s, 2 * s);
        ctx.fillRect(2 * s, -20 * s, 2 * s, 2 * s);

        if (this.type === 'officer') {
            ctx.fillStyle = this.colorCap;
            ctx.fillRect(-10 * s, -31 * s, 20 * s, 9 * s);
            ctx.fillStyle = '#111';
            ctx.fillRect(-11 * s, -24 * s, 22 * s, 3 * s);
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(-8 * s, -24 * s, 16 * s, 1.5 * s);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-3 * s, -29 * s, 6 * s, 2 * s);
            ctx.fillRect(-2 * s, -26 * s, 4 * s, 2 * s);
        } else {
            ctx.fillStyle = this.colorCap;
            ctx.beginPath();
            ctx.arc(0, -23 * s, 10 * s, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(-11 * s, -24 * s, 22 * s, 5 * s);
            ctx.fillRect(-12 * s, -22 * s, 24 * s, 3 * s);

            ctx.fillStyle = '#c91818';
            ctx.fillRect(8 * s, -24 * s, 2 * s, 3 * s);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(7 * s, -24 * s, 1 * s, 3 * s);
            ctx.fillStyle = '#111111';
            ctx.fillRect(6 * s, -24 * s, 1 * s, 3 * s);

            ctx.fillStyle = '#22160e';
            ctx.fillRect(-6 * s, -14 * s, 12 * s, 1.5 * s);
        }

        if (this.state === 'attack') {
            ctx.fillStyle = '#181a1c';
            ctx.fillRect(-4 * s, -6 * s, 8 * s, 8 * s);
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(0, -6 * s, 9 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -6 * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();
        } else {
            if (this.type === 'officer') {
                ctx.fillStyle = '#22252a';
                ctx.fillRect(8 * s, -6 * s, 6 * s, 18 * s);
                ctx.fillStyle = '#111';
                ctx.fillRect(6 * s, 0, 4 * s, 12 * s);
            } else {
                ctx.fillStyle = '#5a3014';
                ctx.fillRect(9 * s, -12 * s, 4 * s, 24 * s);
                ctx.fillStyle = '#22252a';
                ctx.fillRect(10 * s, -22 * s, 2 * s, 12 * s);
            }
        }

        if (this.state === 'pain') {
            ctx.fillStyle = 'rgba(230, 0, 0, 0.55)';
            ctx.fillRect(-15 * s, -33 * s, 30 * s, 65 * s);
        }
    }

    renderCorpse(ctx, s) {
        ctx.fillStyle = '#7a0505';
        ctx.beginPath();
        ctx.ellipse(0, 22 * s, 25 * s, 10 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colorSuit;
        ctx.fillRect(-20 * s, 12 * s, 40 * s, 12 * s);
        ctx.fillStyle = '#141618';
        ctx.fillRect(-24 * s, 14 * s, 6 * s, 10 * s);

        ctx.fillStyle = this.colorCap;
        ctx.beginPath();
        ctx.arc(18 * s, 16 * s, 7 * s, 0, Math.PI * 2);
        ctx.fill();
    }

    renderGibs(ctx, s) {
        ctx.fillStyle = '#8f0000';
        ctx.beginPath();
        ctx.ellipse(0, 20 * s, 30 * s, 13 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a0000';
        ctx.fillRect(-14 * s, 14 * s, 9 * s, 6 * s);
        ctx.fillRect(8 * s, 16 * s, 11 * s, 5 * s);
        ctx.fillRect(-4 * s, 22 * s, 8 * s, 4 * s);

        ctx.fillStyle = this.colorSuit;
        ctx.fillRect(-18 * s, 18 * s, 7 * s, 7 * s);
        ctx.fillRect(16 * s, 14 * s, 6 * s, 6 * s);
    }
}
