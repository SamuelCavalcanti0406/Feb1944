/**
 * HUD Clássico estilo DOOM com o Rosto Animado do Pracinha da FEB
 * Rosto moreno/pardo autêntico, reatividade de combate, sangue dinâmico e gotas espirradas.
 */

export class HUD {
    constructor() {
        this.messages = [];
        this.score = 0;
        this.lookTimer = 0;
        this.lookDir = 0; // -1: esquerda, 0: centro, 1: direita
    }

    addMessage(text) {
        this.messages.push({
            text,
            time: 3.5
        });
        if (this.messages.length > 3) {
            this.messages.shift();
        }
    }

    addScore(points) {
        this.score += points;
    }

    update(dt) {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            this.messages[i].time -= dt;
            if (this.messages[i].time <= 0) {
                this.messages.splice(i, 1);
            }
        }

        this.lookTimer += dt;
        if (this.lookTimer > 2.2) {
            this.lookTimer = 0;
            const rand = Math.random();
            this.lookDir = rand < 0.33 ? -1 : (rand < 0.66 ? 1 : 0);
        }
    }

    render(ctx, width, height, player, weaponSystem, gameMap) {
        const hudHeight = 74;
        const hudY = height - hudHeight;

        ctx.save();

        // 1. Fundo do HUD Metálico Industrial
        ctx.fillStyle = '#17191c';
        ctx.fillRect(0, hudY, width, hudHeight);

        // Moldura chanfrada de aço escuro
        ctx.fillStyle = '#383f47';
        ctx.fillRect(0, hudY, width, 4);
        ctx.fillStyle = '#0e1012';
        ctx.fillRect(0, hudY + 4, width, 2);

        const sectionWidth = width / 5;

        // --- BLOCO 1: VIDA (HEALTH) ---
        this.renderStatusBox(ctx, 0, hudY + 6, sectionWidth, hudHeight - 6, 'VIDA', `${Math.ceil(player.health)}%`, '#e63946');

        // --- BLOCO 2: BLINDAGEM (ARMOR) ---
        this.renderStatusBox(ctx, sectionWidth, hudY + 6, sectionWidth, hudHeight - 6, 'BLINDAGEM', `${Math.ceil(player.armor)}%`, '#457b9d');

        // --- BLOCO 3 (CENTRAL): ROSTO DO PRACINHA MORENO / PARDO ---
        this.renderPracinhaFace(ctx, width / 2, hudY + hudHeight / 2 + 2, player);

        // --- BLOCO 4: MUNIÇÃO ---
        const currentWeapon = weaponSystem.getCurrentWeapon();
        let ammoText = '---';
        if (currentWeapon.ammoType) {
            ammoText = `${player.ammo[currentWeapon.ammoType]}/${player.maxAmmo[currentWeapon.ammoType]}`;
        }
        this.renderStatusBox(ctx, width - sectionWidth * 2, hudY + 6, sectionWidth, hudHeight - 6, 'MUNIÇÃO', ammoText, '#e9c46a');

        // --- BLOCO 5: ARMAS E CHAVES ---
        this.renderInventoryBox(ctx, width - sectionWidth, hudY + 6, sectionWidth, hudHeight - 6, player, weaponSystem);

        // 2. Mensagens do Topo
        this.renderMessages(ctx, width);

        // 3. Efeito de Flash Vermelho Intenso ao Tomar Dano
        if (player.damageFlashTimer > 0) {
            ctx.fillStyle = `rgba(230, 0, 0, ${Math.min(0.7, player.damageFlashTimer * 2.5)})`;
            ctx.fillRect(0, 0, width, height);
        }

        // 4. Efeito de Café da FEB (Velocidade)
        if (player.coffeeTimer > 0) {
            ctx.strokeStyle = `rgba(255, 190, 11, ${Math.sin(Date.now() * 0.012) * 0.3 + 0.4})`;
            ctx.lineWidth = 6;
            ctx.strokeRect(0, 0, width, hudY);
        }

        // 5. Minimapa tático
        this.renderMinimap(ctx, width, height, player, gameMap);

        ctx.restore();
    }

    renderStatusBox(ctx, x, y, w, h, label, value, color) {
        ctx.fillStyle = '#111315';
        ctx.fillRect(x + 4, y + 2, w - 8, h - 4);
        ctx.strokeStyle = '#282d33';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 2, w - 8, h - 4);

        ctx.fillStyle = '#8a95a5';
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + w / 2, y + 16);

        ctx.fillStyle = color;
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillText(value, x + w / 2, y + 44);
    }

    renderInventoryBox(ctx, x, y, w, h, player, weaponSystem) {
        ctx.fillStyle = '#111315';
        ctx.fillRect(x + 4, y + 2, w - 8, h - 4);
        ctx.strokeStyle = '#282d33';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 2, w - 8, h - 4);

        ctx.fillStyle = '#8a95a5';
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ARMAS / CHAVES', x + w / 2, y + 15);

        const weapons = weaponSystem.weapons;
        for (let i = 0; i < weapons.length; i++) {
            const isEquipped = weaponSystem.currentWeaponIndex === i;
            const isUnlocked = weapons[i].unlocked;
            const itemX = x + 14 + i * 16;
            const itemY = y + 24;

            ctx.fillStyle = isEquipped ? '#52b788' : (isUnlocked ? '#e9c46a' : '#495057');
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`${i + 1}`, itemX, itemY + 12);
        }

        // Chaves
        const keyY = y + 46;
        ctx.fillStyle = player.hasIronKey ? '#3a86ff' : '#333';
        ctx.fillRect(x + w / 2 - 20, keyY, 14, 8);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('FE', x + w / 2 - 13, keyY + 7);

        ctx.fillStyle = player.hasGoldKey ? '#ffd166' : '#333';
        ctx.fillRect(x + w / 2 + 6, keyY, 14, 8);
        ctx.fillStyle = '#111';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('AU', x + w / 2 + 13, keyY + 7);
    }

    // O ROSTO DO PRACINHA (Moreno / Pardo, Reativo estilo DOOM)
    renderPracinhaFace(ctx, centerX, centerY, player) {
        ctx.save();
        ctx.translate(centerX, centerY);

        // Moldura do Retrato
        ctx.fillStyle = '#0c0e10';
        ctx.fillRect(-28, -28, 56, 56);
        ctx.strokeStyle = '#383f47';
        ctx.lineWidth = 2;
        ctx.strokeRect(-28, -28, 56, 56);

        if (player.health <= 0) {
            // DERROTA / MORTE (Rosto moreno ensanguentado com olhos em X)
            ctx.fillStyle = '#61341c';
            ctx.fillRect(-18, -14, 36, 36);

            // Olhos fechados em X
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            [-9, 9].forEach(ex => {
                ctx.beginPath();
                ctx.moveTo(ex - 4, -4); ctx.lineTo(ex + 4, 4);
                ctx.moveTo(ex + 4, -4); ctx.lineTo(ex - 4, 4);
                ctx.stroke();
            });

            // Boca aberta de tombo em combate
            ctx.fillStyle = '#000';
            ctx.fillRect(-8, 12, 16, 6);
        } else {
            // PELE MORENA / PARDA DA FEB
            const skinBase = player.health > 50 ? '#8d5524' : (player.health > 25 ? '#7a451d' : '#693816');
            ctx.fillStyle = skinBase;
            ctx.fillRect(-18, -14, 36, 36);

            // Cabelo preto militar visível nas têmporas
            ctx.fillStyle = '#181410';
            ctx.fillRect(-18, -14, 4, 14);
            ctx.fillRect(14, -14, 4, 14);

            // Olhos castanho-escuros
            const eyeOffsetX = this.lookDir * 2;
            ctx.fillStyle = '#fff';
            ctx.fillRect(-12, -4, 8, 6);
            ctx.fillRect(4, -4, 8, 6);

            ctx.fillStyle = '#201309'; // Íris castanho-escura
            ctx.fillRect(-10 + eyeOffsetX, -3, 4, 4);
            ctx.fillRect(6 + eyeOffsetX, -3, 4, 4);

            // Sobrancelhas pretas grossas
            ctx.fillStyle = '#14100c';
            if (player.faceState === 'firing') {
                // Olhar extremamente agressivo focado no disparo
                ctx.fillRect(-13, -6, 9, 3);
                ctx.fillRect(4, -6, 9, 3);
            } else {
                ctx.fillRect(-13, -7, 9, 2);
                ctx.fillRect(4, -7, 9, 2);
            }

            // Nariz
            ctx.fillStyle = '#6e3c15';
            ctx.fillRect(-2, 0, 4, 7);

            // EXPRESSÕES DA BOCA
            if (player.faceState === 'grin') {
                // Sorriso sádico ao pegar arma / café (dentes à mostra)
                ctx.fillStyle = '#3a0a0a';
                ctx.beginPath();
                ctx.arc(0, 10, 8, 0, Math.PI);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.fillRect(-6, 10, 12, 3);
            } else if (player.faceState === 'hurt') {
                // Dor / Grito de fúria
                ctx.fillStyle = '#200505';
                ctx.fillRect(-7, 8, 14, 8);
                ctx.fillStyle = '#fff';
                ctx.fillRect(-5, 9, 10, 2);
            } else if (player.faceState === 'firing') {
                // Dentes cerrados atirando com vontade
                ctx.fillStyle = '#1c0808';
                ctx.fillRect(-8, 10, 16, 4);
                ctx.fillStyle = '#fff';
                ctx.fillRect(-6, 11, 12, 2);
            } else {
                // Foco determinado de combate
                ctx.fillStyle = '#4a250e';
                ctx.fillRect(-6, 12, 12, 2);
            }

            // Sangue / Hematomas de combate conforme a vida
            if (player.health < 65) {
                ctx.fillStyle = 'rgba(150, 10, 10, 0.75)';
                ctx.fillRect(-14, 2, 6, 6); // Corte na bochecha
            }
            if (player.health < 35) {
                ctx.fillStyle = 'rgba(150, 10, 10, 0.85)';
                ctx.fillRect(2, -10, 8, 5); // Sangue na testa
                ctx.fillRect(6, 10, 5, 8);  // Sangue no queixo
                ctx.fillStyle = '#2b1010';
                ctx.fillRect(4, -5, 8, 4);  // Olho direito roxo
            }
        }

        // SANGUE ESPIRRADO NO ROSTO (Sprite FX temporário ao abater inimigo a curta distância)
        if (player.bloodOnFaceTimer > 0) {
            const alpha = Math.min(1.0, player.bloodOnFaceTimer);
            ctx.fillStyle = `rgba(180, 0, 0, ${alpha * 0.95})`;

            // Gotas de sangue em pixel art no rosto
            ctx.fillRect(-8, -8, 4, 4);
            ctx.fillRect(-7, -4, 2, 6); // Gota escorrendo
            ctx.fillRect(6, -2, 5, 5);
            ctx.fillRect(7, 3, 3, 5);
            ctx.fillRect(-2, 6, 4, 3);
            ctx.fillRect(10, 12, 3, 4);

            // Brilho do sangue fresco
            ctx.fillStyle = `rgba(255, 60, 60, ${alpha * 0.8})`;
            ctx.fillRect(-8, -8, 2, 2);
            ctx.fillRect(6, -2, 2, 2);
        }

        // Capacete M1 da FEB com insígnia da Cobra Fumando
        ctx.fillStyle = '#384d28'; // Verde militar
        ctx.beginPath();
        ctx.arc(0, -12, 20, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-22, -14, 44, 4); // Aba do capacete

        // Insígnia da FEB (A Cobra Fumando - Verde e Amarelo)
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-4, -22, 8, 6);
        ctx.fillStyle = '#06d6a0';
        ctx.fillRect(-2, -20, 4, 4);

        ctx.restore();
    }

    renderMessages(ctx, width) {
        let currentY = 24;
        for (const msg of this.messages) {
            const alpha = Math.min(1.0, msg.time);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
            ctx.fillRect(width / 2 - 260, currentY - 16, 520, 22);

            ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`;
            ctx.font = 'bold 13px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(msg.text, width / 2, currentY);
            currentY += 26;
        }
    }

    renderMinimap(ctx, width, height, player, gameMap) {
        const mapSize = 90;
        const mapX = width - mapSize - 12;
        const mapY = 12;

        ctx.save();
        ctx.fillStyle = 'rgba(15, 20, 18, 0.75)';
        ctx.fillRect(mapX, mapY, mapSize, mapSize);
        ctx.strokeStyle = '#4e704e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mapX, mapY, mapSize, mapSize);

        const tileSize = mapSize / gameMap.width;

        for (let y = 0; y < gameMap.height; y++) {
            for (let x = 0; x < gameMap.width; x++) {
                const tile = gameMap.grid[y][x];
                if (tile > 0) {
                    ctx.fillStyle = tile === 5 || tile === 6 || tile === 7 ? '#d4a373' : (tile === 9 ? '#52b788' : '#708d81');
                    ctx.fillRect(mapX + x * tileSize, mapY + y * tileSize, tileSize, tileSize);
                }
            }
        }

        const pX = mapX + player.x * tileSize;
        const pY = mapY + player.y * tileSize;

        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(pX, pY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(pX + Math.cos(player.angle) * 7, pY + Math.sin(player.angle) * 7);
        ctx.stroke();

        ctx.restore();
    }
}
