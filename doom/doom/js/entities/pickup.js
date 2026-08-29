/**
 * Itens Coletáveis: Ração, Café da FEB, Blindagens, Munições, Armas e Chaves (Ferro, Ouro, Oficial).
 */
import { WEAPON_IDS } from '../weapons/weapons.js';

export class Pickup {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.collected = false;
        this.radius = 0.4;
        this.bobTimer = Math.random() * Math.PI;
    }

    update(dt, player, weaponSystem, soundFX, hud) {
        if (this.collected) return;

        this.bobTimer += dt * 3;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < this.radius + player.radius) {
            this.collect(player, weaponSystem, soundFX, hud);
        }
    }

    collect(player, weaponSystem, soundFX, hud) {
        let picked = false;

        switch (this.type) {
            case 'ration':
                if (player.health < player.maxHealth) {
                    player.heal(25);
                    soundFX.playPickup('health');
                    hud.addMessage('Ração de Combate coletada (+25 Vida)');
                    picked = true;
                }
                break;

            case 'coffee':
                player.heal(15);
                player.coffeeTimer = 14.0;
                player.triggerGrin();
                soundFX.playPickup('coffee');
                hud.addMessage('★ CAFÉ FORTE DA FEB! (+15 Vida & VELOCIDADE MÁXIMA!) ★');
                picked = true;
                break;

            case 'helmet':
                if (player.armor < player.maxArmor) {
                    player.addArmor(35);
                    soundFX.playPickup('armor');
                    hud.addMessage('Capacete de Aço coletado (+35 Blindagem)');
                    picked = true;
                }
                break;

            case 'ammo_revolver':
                player.addAmmo('revolver', 12);
                soundFX.playPickup('ammo');
                hud.addMessage('Munição .45 M1917 (+12)');
                picked = true;
                break;

            case 'ammo_smg':
                player.addAmmo('smg', 40);
                soundFX.playPickup('ammo');
                hud.addMessage('Munição .45 ACP Thompson (+40)');
                picked = true;
                break;

            case 'ammo_rifle':
                player.addAmmo('rifle', 16);
                soundFX.playPickup('ammo');
                hud.addMessage('Munição .30-06 Garand (+16)');
                picked = true;
                break;

            case 'key_iron':
                player.hasIronKey = true;
                player.triggerGrin();
                soundFX.playPickup('key');
                hud.addMessage('★ CHAVE DE FERRO ENCONTRADA! ★');
                picked = true;
                break;

            case 'key_gold':
                player.hasGoldKey = true;
                player.triggerGrin();
                soundFX.playPickup('key');
                hud.addMessage('★ CHAVE DE OURO DO COMANDO ENCONTRADA! ★');
                picked = true;
                break;

            case 'key_officer':
                player.hasOfficerKey = true;
                player.triggerGrin();
                soundFX.playPickup('key');
                hud.addMessage('★ CHAVE DO OFICIAL DA SS ENCONTRADA! ★');
                picked = true;
                break;

            case 'weapon_thompson':
                weaponSystem.unlockWeapon(WEAPON_IDS.THOMPSON);
                player.addAmmo('smg', 60);
                player.triggerGrin();
                soundFX.playPickup('weapon');
                hud.addMessage('★ METRALHADORA THOMPSON .45 DESBLOQUEADA! ★');
                picked = true;
                break;

            case 'weapon_garand':
                weaponSystem.unlockWeapon(WEAPON_IDS.GARAND);
                player.addAmmo('rifle', 24);
                player.triggerGrin();
                soundFX.playPickup('weapon');
                hud.addMessage('★ FUZIL M1 GARAND .30-06 DESBLOQUEADO! ★');
                picked = true;
                break;
        }

        if (picked) {
            this.collected = true;
        }
    }

    render(ctx, screenX, screenY, size) {
        if (this.collected) return;

        ctx.save();
        const floatY = Math.sin(this.bobTimer) * 4;
        ctx.translate(screenX, screenY + floatY);

        const s = size / 64;

        // Sombra no chão
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 18 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        switch (this.type) {
            case 'ration':
                this.renderRation(ctx, s);
                break;
            case 'coffee':
                this.renderCoffee(ctx, s);
                break;
            case 'helmet':
                this.renderHelmet(ctx, s);
                break;
            case 'ammo_revolver':
            case 'ammo_smg':
            case 'ammo_rifle':
                this.renderAmmoBox(ctx, s, this.type);
                break;
            case 'key_iron':
                this.renderKey(ctx, s, '#8ecae6');
                break;
            case 'key_gold':
                this.renderKey(ctx, s, '#ffd166');
                break;
            case 'key_officer':
                this.renderOfficerKey(ctx, s);
                break;
            case 'weapon_thompson':
            case 'weapon_garand':
                this.renderWeaponPickup(ctx, s, this.type);
                break;
        }

        ctx.restore();
    }

    renderRation(ctx, s) {
        ctx.fillStyle = '#606c38';
        ctx.fillRect(-10 * s, -8 * s, 20 * s, 22 * s);
        ctx.fillStyle = '#fefae0';
        ctx.fillRect(-2 * s, -2 * s, 4 * s, 10 * s);
        ctx.fillRect(-5 * s, 1 * s, 10 * s, 4 * s);
    }

    renderCoffee(ctx, s) {
        ctx.fillStyle = '#283618';
        ctx.fillRect(-8 * s, -6 * s, 16 * s, 18 * s);
        ctx.strokeStyle = '#283618';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.arc(10 * s, 2 * s, 5 * s, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-2 * s, -12 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(3 * s, -16 * s, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
    }

    renderHelmet(ctx, s) {
        ctx.fillStyle = '#3a5a40';
        ctx.beginPath();
        ctx.arc(0, 0, 14 * s, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-16 * s, 0, 32 * s, 4 * s);
        ctx.fillStyle = '#e9c46a';
        ctx.fillRect(-3 * s, -8 * s, 6 * s, 5 * s);
    }

    renderAmmoBox(ctx, s, type) {
        ctx.fillStyle = '#4a4e2d';
        ctx.fillRect(-12 * s, -4 * s, 24 * s, 18 * s);
        ctx.strokeStyle = '#1e2012';
        ctx.lineWidth = 1.5 * s;
        ctx.strokeRect(-12 * s, -4 * s, 24 * s, 18 * s);
        ctx.fillStyle = '#dda15e';
        ctx.fillRect(-6 * s, -8 * s, 3 * s, 6 * s);
        ctx.fillRect(3 * s, -8 * s, 3 * s, 6 * s);
    }

    renderKey(ctx, s, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -6 * s, 7 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(0, -6 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.fillRect(-2 * s, 0, 4 * s, 16 * s);
        ctx.fillRect(2 * s, 4 * s, 5 * s, 3 * s);
        ctx.fillRect(2 * s, 10 * s, 5 * s, 3 * s);
    }

    // CHAVE DO OFICIAL DA SS (Vermelha com Caveira Prateada)
    renderOfficerKey(ctx, s) {
        // Cabeça da chave com formato de cruz militar / caveira
        ctx.fillStyle = '#b81414'; // Vermelho sangue
        ctx.beginPath();
        ctx.arc(0, -8 * s, 8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3a0505';
        ctx.lineWidth = 1.5 * s;
        ctx.stroke();

        // Caveira prateada no topo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3 * s, -11 * s, 6 * s, 5 * s);
        ctx.fillStyle = '#111';
        ctx.fillRect(-2 * s, -10 * s, 1.5 * s, 1.5 * s);
        ctx.fillRect(0.5 * s, -10 * s, 1.5 * s, 1.5 * s);

        // Haste de aço escuro
        ctx.fillStyle = '#d6dbe0';
        ctx.fillRect(-2.5 * s, 0, 5 * s, 18 * s);
        // Dentes de segredo duplo
        ctx.fillRect(2.5 * s, 5 * s, 5 * s, 3 * s);
        ctx.fillRect(2.5 * s, 11 * s, 6 * s, 3 * s);
    }

    renderWeaponPickup(ctx, s, type) {
        ctx.fillStyle = '#222';
        ctx.fillRect(-18 * s, 0, 36 * s, 8 * s);
        ctx.fillStyle = '#603813';
        ctx.fillRect(-14 * s, 4 * s, 10 * s, 8 * s);
    }
}
