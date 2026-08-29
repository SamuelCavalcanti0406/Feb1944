/**
 * Sistema de Armas Históricas da FEB 1944
 * Viewmodel em primeira pessoa com mãos do Pracinha (pele morena/parda autêntica da FEB),
 * recuo visual dinâmico, animações de disparo, estalos e muzzle flashes.
 */

export const WEAPON_IDS = {
    KNIFE: 0,
    REVOLVER: 1,
    THOMPSON: 2,
    GARAND: 3
};

const SKIN_TONES = {
    base: '#8c5938',       // Tom de pele morena/parda
    highlight: '#a66e47',  // Luz nos nós dos dedos e antebraço
    shadow: '#663c20',     // Sombra entre dedos e contornos
    sleeve: '#3c4d2d',     // Manga enrolada da farda Verde-Oliva da FEB
    sleeveShadow: '#25331a'
};

export class WeaponSystem {
    constructor() {
        this.weapons = [
            {
                id: WEAPON_IDS.KNIFE,
                name: 'Faca de Trincheira',
                ammoType: null,
                ammoPerShot: 0,
                damage: 40,
                fireRate: 0.3,
                range: 2.0,
                unlocked: true,
                auto: false,
                spread: 0,
                recoilTrauma: 0.08,
                cameraKickY: 8,
                cameraKickZ: 4
            },
            {
                id: WEAPON_IDS.REVOLVER,
                name: 'Revólver M1917 .45',
                ammoType: 'revolver',
                ammoPerShot: 1,
                damage: 50,
                fireRate: 0.38,
                range: 22,
                unlocked: true,
                auto: false,
                spread: 0.025,
                recoilTrauma: 0.35,
                cameraKickY: 18,
                cameraKickZ: 10
            },
            {
                id: WEAPON_IDS.THOMPSON,
                name: 'Thompson .45 M1A1',
                ammoType: 'smg',
                ammoPerShot: 1,
                damage: 32,
                fireRate: 0.095,
                range: 20,
                unlocked: false,
                auto: true,
                spread: 0.07,
                recoilTrauma: 0.22,
                cameraKickY: 12,
                cameraKickZ: 6
            },
            {
                id: WEAPON_IDS.GARAND,
                name: 'Fuzil M1 Garand .30-06',
                ammoType: 'rifle',
                ammoPerShot: 1,
                damage: 95,
                fireRate: 0.48,
                range: 35,
                unlocked: false,
                auto: false,
                spread: 0.012,
                recoilTrauma: 0.55,
                cameraKickY: 26,
                cameraKickZ: 16,
                clipSize: 8,
                clipRemaining: 8
            }
        ];

        this.currentWeaponIndex = WEAPON_IDS.REVOLVER;
        this.cooldown = 0;
        this.animTimer = 0;
        this.recoilOffsetY = 0;
        this.recoilOffsetX = 0;
        this.recoilRot = 0;
        this.cameraKickY = 0;
        this.cameraKickZ = 0;
        this.isFiring = false;
        this.muzzleFlash = false;
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }

    selectWeapon(index) {
        if (index >= 0 && index < this.weapons.length && this.weapons[index].unlocked) {
            this.currentWeaponIndex = index;
            this.cooldown = 0.12;
            this.animTimer = 0;
            return true;
        }
        return false;
    }

    unlockWeapon(id) {
        if (this.weapons[id]) {
            this.weapons[id].unlocked = true;
            this.currentWeaponIndex = id;
        }
    }

    update(dt) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }
        if (this.animTimer > 0) {
            this.animTimer -= dt;
            if (this.animTimer <= 0) {
                this.isFiring = false;
                this.muzzleFlash = false;
            }
        }

        this.recoilOffsetY = Math.max(0, this.recoilOffsetY - dt * 420);
        this.recoilOffsetX = this.recoilOffsetX * Math.max(0, 1 - dt * 25);
        this.recoilRot = this.recoilRot * Math.max(0, 1 - dt * 25);

        this.cameraKickY = Math.max(0, this.cameraKickY - dt * 120);
        this.cameraKickZ = Math.max(0, this.cameraKickZ - dt * 80);
    }

    shoot(player, soundFX, bloodScreen, particleManager) {
        if (this.cooldown > 0) return null;

        const weapon = this.getCurrentWeapon();

        if (weapon.ammoType) {
            const currentAmmo = player.ammo[weapon.ammoType];
            if (currentAmmo < weapon.ammoPerShot) {
                soundFX.playDoorLocked();
                this.cooldown = 0.25;
                return null;
            }
            player.ammo[weapon.ammoType] -= weapon.ammoPerShot;
        }

        this.cooldown = weapon.fireRate;
        this.animTimer = 0.16;
        this.isFiring = true;
        this.muzzleFlash = weapon.id !== WEAPON_IDS.KNIFE;

        this.recoilOffsetY = weapon.id === WEAPON_IDS.GARAND ? 68 : (weapon.id === WEAPON_IDS.REVOLVER ? 52 : (weapon.id === WEAPON_IDS.THOMPSON ? 30 : 20));
        this.recoilOffsetX = (Math.random() - 0.5) * 16;
        this.recoilRot = (Math.random() - 0.5) * 0.12;

        this.cameraKickY = weapon.cameraKickY;
        this.cameraKickZ = weapon.cameraKickZ;

        bloodScreen.addShake(weapon.recoilTrauma);

        switch (weapon.id) {
            case WEAPON_IDS.KNIFE:
                soundFX.playKnifeSlash();
                break;
            case WEAPON_IDS.REVOLVER:
                soundFX.playRevolverShot();
                break;
            case WEAPON_IDS.THOMPSON:
                soundFX.playThompsonShot();
                break;
            case WEAPON_IDS.GARAND:
                soundFX.playGarandShot();
                weapon.clipRemaining--;
                if (weapon.clipRemaining <= 0) {
                    weapon.clipRemaining = weapon.clipSize;
                    setTimeout(() => soundFX.playGarandPing(), 200);
                }
                break;
        }

        return {
            weapon,
            damage: weapon.damage,
            range: weapon.range,
            spread: weapon.spread,
            isMelee: weapon.id === WEAPON_IDS.KNIFE
        };
    }

    render(ctx, width, height, bobbingOffset) {
        const weapon = this.getCurrentWeapon();
        const centerX = width / 2 + this.recoilOffsetX + bobbingOffset.x;
        const baseY = height - 76 + this.recoilOffsetY + bobbingOffset.y;

        ctx.save();
        ctx.translate(centerX, baseY);
        ctx.rotate(this.recoilRot);

        switch (weapon.id) {
            case WEAPON_IDS.KNIFE:
                this.renderKnife(ctx);
                break;
            case WEAPON_IDS.REVOLVER:
                this.renderRevolver(ctx);
                break;
            case WEAPON_IDS.THOMPSON:
                this.renderThompson(ctx);
                break;
            case WEAPON_IDS.GARAND:
                this.renderGarand(ctx);
                break;
        }

        if (this.muzzleFlash) {
            this.renderMuzzleFlash(ctx, weapon.id);
        }

        ctx.restore();
    }

    renderKnife(ctx) {
        ctx.save();
        ctx.translate(35, 10);
        if (this.isFiring) {
            ctx.rotate(-0.6 + (0.16 - this.animTimer) * 4.5);
        }

        ctx.fillStyle = '#c5ccd3';
        ctx.beginPath();
        ctx.moveTo(-16, -115);
        ctx.lineTo(16, -42);
        ctx.lineTo(8, 0);
        ctx.lineTo(-22, -32);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-16, -115);
        ctx.lineTo(8, -42);
        ctx.lineTo(0, -42);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#b8860b';
        ctx.fillRect(-28, 0, 48, 10);

        ctx.fillStyle = '#5c3317';
        ctx.fillRect(-18, 10, 28, 55);
        ctx.fillStyle = '#301808';
        for (let i = 15; i < 60; i += 9) {
            ctx.fillRect(-18, i, 28, 3);
        }

        this.renderHand(ctx, -4, 42, 28, true);

        ctx.fillStyle = SKIN_TONES.base;
        ctx.fillRect(-24, 70, 40, 50);
        ctx.fillStyle = SKIN_TONES.highlight;
        ctx.fillRect(-18, 70, 12, 50);

        ctx.fillStyle = SKIN_TONES.sleeve;
        ctx.fillRect(-28, 105, 48, 25);
        ctx.fillStyle = SKIN_TONES.sleeveShadow;
        ctx.fillRect(-28, 105, 48, 5);

        ctx.restore();
    }

    renderRevolver(ctx) {
        ctx.save();

        ctx.fillStyle = '#2a2e33';
        ctx.fillRect(-10, -95, 20, 75);
        ctx.fillStyle = '#181a1c';
        ctx.fillRect(-4, -102, 8, 8);

        ctx.fillStyle = '#393f45';
        ctx.fillRect(-18, -28, 36, 42);
        ctx.fillStyle = '#1b1d20';
        ctx.fillRect(-14, -22, 6, 32);
        ctx.fillRect(8, -22, 6, 32);

        ctx.fillStyle = '#181a1c';
        ctx.fillRect(-6, -42, 12, 16);

        ctx.fillStyle = '#2a2e33';
        ctx.fillRect(-12, 12, 24, 30);

        ctx.fillStyle = '#5a2e12';
        ctx.beginPath();
        ctx.moveTo(-12, 36);
        ctx.lineTo(16, 36);
        ctx.lineTo(24, 90);
        ctx.lineTo(-8, 90);
        ctx.closePath();
        ctx.fill();

        this.renderHand(ctx, -18, 58, 24, false);
        this.renderHand(ctx, 16, 62, 22, true);

        ctx.fillStyle = SKIN_TONES.base;
        ctx.fillRect(-48, 80, 36, 60);
        ctx.fillRect(14, 84, 36, 60);

        ctx.fillStyle = SKIN_TONES.sleeve;
        ctx.fillRect(-56, 120, 48, 30);
        ctx.fillRect(10, 124, 48, 30);

        ctx.restore();
    }

    renderThompson(ctx) {
        ctx.save();
        ctx.translate(22, 8);

        ctx.fillStyle = '#1e2124';
        ctx.fillRect(-16, -115, 14, 90);
        ctx.fillStyle = '#373d43';
        for (let cy = -95; cy < -35; cy += 6) {
            ctx.fillRect(-18, cy, 18, 2);
        }

        ctx.fillStyle = '#2f343a';
        ctx.fillRect(-22, -30, 44, 46);

        ctx.fillStyle = '#17191b';
        ctx.fillRect(-18, 16, 16, 52);

        ctx.fillStyle = '#653b1b';
        ctx.fillRect(-28, -62, 20, 32);

        ctx.fillStyle = '#583013';
        ctx.fillRect(8, 22, 28, 62);

        this.renderHand(ctx, -24, -48, 20, false);
        this.renderHand(ctx, 16, 52, 25, true);

        ctx.fillStyle = SKIN_TONES.base;
        ctx.fillRect(-62, -20, 38, 70);
        ctx.fillStyle = SKIN_TONES.sleeve;
        ctx.fillRect(-72, 35, 48, 30);

        ctx.fillStyle = SKIN_TONES.base;
        ctx.fillRect(14, 75, 40, 60);
        ctx.fillStyle = SKIN_TONES.sleeve;
        ctx.fillRect(10, 115, 48, 30);

        ctx.restore();
    }

    renderGarand(ctx) {
        ctx.save();
        ctx.translate(14, 0);

        ctx.fillStyle = '#202326';
        ctx.fillRect(-8, -140, 12, 105);
        ctx.fillStyle = '#121416';
        ctx.fillRect(-10, -145, 16, 8);

        ctx.fillStyle = '#6e3c1a';
        ctx.fillRect(-14, -85, 24, 115);
        ctx.fillStyle = '#2c3136';
        ctx.fillRect(-16, -75, 28, 6);
        ctx.fillRect(-16, -24, 28, 6);

        ctx.fillStyle = '#17191b';
        ctx.fillRect(-6, 0, 14, 26);

        this.renderHand(ctx, -18, -48, 21, false);
        this.renderHand(ctx, 14, 52, 26, true);

        ctx.fillStyle = SKIN_TONES.base;
        ctx.fillRect(-58, -25, 40, 80);
        ctx.fillStyle = SKIN_TONES.sleeve;
        ctx.fillRect(-68, 35, 48, 30);

        ctx.fillStyle = SKIN_TONES.base;
        ctx.fillRect(12, 75, 40, 60);
        ctx.fillStyle = SKIN_TONES.sleeve;
        ctx.fillRect(8, 115, 48, 30);

        ctx.restore();
    }

    renderHand(ctx, x, y, radius, isRight = true) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = SKIN_TONES.shadow;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = SKIN_TONES.base;
        ctx.beginPath();
        ctx.arc(isRight ? -2 : 2, -1, radius - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = SKIN_TONES.highlight;
        ctx.beginPath();
        ctx.arc(isRight ? -4 : 4, -4, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = SKIN_TONES.shadow;
        for (let i = -1; i <= 1; i++) {
            ctx.fillRect(i * 6 - 2, radius * 0.3, 4, 3);
        }

        ctx.restore();
    }

    renderMuzzleFlash(ctx, weaponId) {
        const flashY = weaponId === WEAPON_IDS.GARAND ? -150 : (weaponId === WEAPON_IDS.THOMPSON ? -120 : -108);
        const flashX = weaponId === WEAPON_IDS.THOMPSON ? -4 : (weaponId === WEAPON_IDS.GARAND ? -2 : 0);

        ctx.save();
        ctx.fillStyle = '#fff4a3';
        ctx.beginPath();
        ctx.arc(flashX, flashY, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff8800';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
            const dist = 38 + Math.random() * 22;
            ctx.beginPath();
            ctx.moveTo(flashX, flashY);
            ctx.lineTo(flashX + Math.cos(angle - 0.2) * (dist * 0.6), flashY + Math.sin(angle - 0.2) * (dist * 0.6));
            ctx.lineTo(flashX + Math.cos(angle) * dist, flashY + Math.sin(angle) * dist);
            ctx.lineTo(flashX + Math.cos(angle + 0.2) * (dist * 0.6), flashY + Math.sin(angle + 0.2) * (dist * 0.6));
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(flashX, flashY, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
