/**
 * Ponto de Entrada Principal: Game Loop, Gerenciador de Estados e Inicialização
 * Projeto: "A Cobra Vai Fumar" (FEB 1944)
 */

import { SoundFX } from './audio/sound_fx.js';
import { TextureManager } from './world/textures.js';
import { GameMap, TILE_TYPES } from './world/map.js';
import { Camera } from './engine/camera.js';
import { InputManager } from './engine/input.js';
import { Raycaster } from './engine/raycaster.js';
import { Player } from './entities/player.js';
import { Enemy } from './entities/enemy.js';
import { Pickup } from './entities/pickup.js';
import { ParticleManager } from './entities/particle.js';
import { WeaponSystem } from './weapons/weapons.js';
import { HUD } from './ui/hud.js';
import { BloodScreen } from './ui/blood_screen.js';

export const GAME_STATES = {
    TITLE: 'title',
    PLAYING: 'playing',
    VICTORY: 'victory',
    GAMEOVER: 'gameover'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GAME_STATES.TITLE;

        // Configuração de Resolução Interna
        this.canvas.width = 640;
        this.canvas.height = 400;

        // Sistemas
        this.soundFX = new SoundFX();
        this.textureManager = new TextureManager();
        this.textureManager.init();

        this.gameMap = new GameMap();
        this.player = new Player(this.gameMap.playerSpawn.x, this.gameMap.playerSpawn.y, this.gameMap.playerSpawn.angle);
        this.camera = new Camera();
        this.input = new InputManager(this.canvas);
        this.raycaster = new Raycaster(this.canvas, this.textureManager);
        this.weaponSystem = new WeaponSystem();
        this.particleManager = new ParticleManager();
        this.bloodScreen = new BloodScreen();
        this.hud = new HUD();

        this.enemies = [];
        this.pickups = [];

        this.lastTime = 0;
        this.initEntities();
        this.setupInputHandlers();

        // Loop
        requestAnimationFrame(this.loop.bind(this));
    }

    initEntities() {
        this.enemies = this.gameMap.enemySpawns.map(s => new Enemy(s.type, s.x, s.y));
        this.pickups = this.gameMap.pickupSpawns.map(s => new Pickup(s.type, s.x, s.y));
    }

    resetGame() {
        this.gameMap = new GameMap();
        this.player.reset(this.gameMap.playerSpawn);
        this.weaponSystem = new WeaponSystem();
        this.particleManager = new ParticleManager();
        this.initEntities();
        this.state = GAME_STATES.PLAYING;
        this.hud.addMessage('★ MISSÃO INICIADA: AVANCE PELAS TRINCHEIRAS! ★');
        this.soundFX.startMusic();
    }

    setupInputHandlers() {
        this.input.onInteract = () => {
            if (this.state === GAME_STATES.PLAYING) {
                const dirX = Math.cos(this.player.angle);
                const dirY = Math.sin(this.player.angle);
                this.gameMap.tryInteract(this.player.x, this.player.y, dirX, dirY, this.player, this.soundFX, this.hud);
            } else if (this.state === GAME_STATES.TITLE || this.state === GAME_STATES.GAMEOVER || this.state === GAME_STATES.VICTORY) {
                this.soundFX.init();
                this.resetGame();
            }
        };

        this.input.onWeaponSelect = (index) => {
            if (this.state === GAME_STATES.PLAYING) {
                this.weaponSystem.selectWeapon(index);
            }
        };

        this.input.onWeaponWheel = (dir) => {
            if (this.state === GAME_STATES.PLAYING) {
                let next = this.weaponSystem.currentWeaponIndex + dir;
                if (next < 0) next = this.weaponSystem.weapons.length - 1;
                if (next >= this.weaponSystem.weapons.length) next = 0;
                while (!this.weaponSystem.weapons[next].unlocked) {
                    next = (next + dir + this.weaponSystem.weapons.length) % this.weaponSystem.weapons.length;
                }
                this.weaponSystem.selectWeapon(next);
            }
        };

        this.input.onShoot = () => {
            if (this.state === GAME_STATES.TITLE || this.state === GAME_STATES.GAMEOVER || this.state === GAME_STATES.VICTORY) {
                this.soundFX.init();
                this.resetGame();
            } else if (this.state === GAME_STATES.PLAYING) {
                this.executeShoot();
            }
        };
    }

    executeShoot() {
        const shootResult = this.weaponSystem.shoot(this.player, this.soundFX, this.bloodScreen, this.particleManager);
        if (shootResult) {
            this.player.faceState = 'firing';
            this.player.faceTimer = 0.25;

            const hitResult = this.raycaster.performHitscan(
                this.player,
                shootResult,
                this.enemies,
                this.gameMap,
                this.soundFX,
                this.particleManager,
                this.hud
            );

            if (hitResult.hit && hitResult.target.isDead) {
                this.player.kills++;
                // Se o abate foi a curta distância (< 4m) ou explodiu o inimigo, espirra sangue no rosto e visor
                if (hitResult.distance < 4.2 || hitResult.target.state === 'gib') {
                    this.player.triggerCloseKillBlood();
                    this.particleManager.addScreenBlood(3);
                } else {
                    this.player.triggerGrin();
                }
            }
        }
    }

    loop(currentTime) {
        if (!this.lastTime) this.lastTime = currentTime;
        const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        this.update(dt);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        if (this.state === GAME_STATES.PLAYING) {
            // Disparo contínuo para armas automáticas (Thompson)
            if (this.input.isMouseDown && this.weaponSystem.getCurrentWeapon().auto) {
                this.executeShoot();
            }

            // Atualiza Jogador
            const isMoving = this.input.keys['KeyW'] || this.input.keys['KeyS'] || 
                             this.input.keys['KeyA'] || this.input.keys['KeyD'] ||
                             this.input.keys['ArrowUp'] || this.input.keys['ArrowDown'];
            const speedBoost = this.player.coffeeTimer > 0 ? 1.6 : 1.0;

            this.player.update(dt, this.input, this.gameMap, this.hud);
            this.camera.update(dt, isMoving, speedBoost);
            this.weaponSystem.update(dt);
            this.gameMap.update(dt);
            this.bloodScreen.update(dt);
            this.particleManager.update(dt);
            this.hud.update(dt);

            // Atualiza Inimigos
            for (const enemy of this.enemies) {
                enemy.update(dt, this.player, this.gameMap, this.soundFX, this.bloodScreen, this.particleManager, this.hud);
            }

            // Atualiza Coletáveis
            for (const pickup of this.pickups) {
                pickup.update(dt, this.player, this.weaponSystem, this.soundFX, this.hud);
            }

            // Checagem de Vitória (Chegar na saída do posto de comando)
            const currentTile = this.gameMap.getTile(this.player.x, this.player.y);
            if (currentTile === TILE_TYPES.EXIT_WALL || (Math.floor(this.player.x) === 18 && Math.floor(this.player.y) === 18)) {
                this.state = GAME_STATES.VICTORY;
                this.soundFX.stopMusic();
            }

            // Checagem de Game Over
            if (this.player.health <= 0) {
                this.state = GAME_STATES.GAMEOVER;
                this.soundFX.stopMusic();
            }
        }
    }

    render() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        if (this.state === GAME_STATES.TITLE) {
            this.renderTitleScreen(ctx, width, height);
            return;
        }

        // Renderiza Mundo 2.5D com recuo de câmera (Kick) e iluminação
        const isMuzzleFlash = this.weaponSystem.muzzleFlash;
        this.raycaster.render(
            this.player,
            this.gameMap,
            this.enemies,
            this.pickups,
            this.particleManager,
            this.camera,
            this.bloodScreen,
            isMuzzleFlash,
            this.weaponSystem
        );

        // Renderiza Sangue no Visor do Pracinha e Overlays nos cantos da visão
        this.particleManager.renderScreenBlood(ctx, width, height - 74);
        this.bloodScreen.renderCornerBloodOverlay(ctx, width, height - 74, this.player.bloodOnFaceTimer);

        // Renderiza Mira Central Retrô
        this.renderCrosshair(ctx, width, height - 74);

        // Renderiza Arma e Braços Morenos da FEB em Primeira Pessoa
        const bobOffset = { x: this.camera.bobX, y: this.camera.bobY };
        this.weaponSystem.render(ctx, width, height, bobOffset);

        // Renderiza HUD estilo DOOM
        this.hud.render(ctx, width, height, this.player, this.weaponSystem, this.gameMap);

        // Telas de Fim de Jogo
        if (this.state === GAME_STATES.VICTORY) {
            this.renderVictoryScreen(ctx, width, height);
        } else if (this.state === GAME_STATES.GAMEOVER) {
            this.renderGameOverScreen(ctx, width, height);
        }
    }

    renderCrosshair(ctx, width, worldHeight) {
        const cx = width / 2 + this.bloodScreen.shakeX;
        const cy = worldHeight / 2 + this.camera.bobY + this.bloodScreen.shakeY;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.5;

        // Ponto central e traços cruzados
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy); ctx.lineTo(cx - 2, cy);
        ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 7, cy);
        ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy - 2);
        ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy + 7);
        ctx.stroke();

        ctx.fillStyle = '#ff0055';
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
    }

    renderTitleScreen(ctx, width, height) {
        // Fundo militar escuro com camuflagem
        ctx.fillStyle = '#141a14';
        ctx.fillRect(0, 0, width, height);

        // Faixas verdes e amarelas sutis
        ctx.fillStyle = '#223322';
        ctx.fillRect(0, 40, width, 8);
        ctx.fillRect(0, height - 48, width, 8);

        // Título Principal
        ctx.fillStyle = '#e9c46a';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('A COBRA VAI FUMAR!', width / 2, 90);

        // Subtítulo
        ctx.fillStyle = '#52b788';
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.fillText('FORÇA EXPEDICIONÁRIA BRASILEIRA - ITÁLIA 1944', width / 2, 125);

        // Emblema da Cobra Fumando estilizado
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.arc(width / 2, 195, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#e76f51';
        ctx.font = 'bold 38px monospace';
        ctx.fillText('🐍💨', width / 2, 208);

        // Instruções
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('★ CLIQUE NA TELA PARA JOGAR ★', width / 2, 275);

        ctx.fillStyle = '#a8dadc';
        ctx.font = '13px monospace';
        ctx.fillText('W, A, S, D ou Setas: Mover & Strafe | MOUSE: Olhar & Atirar', width / 2, 315);
        ctx.fillText('1, 2, 3, 4: Armas | E / ESPAÇO: Abrir Portas e Segredos', width / 2, 340);
        ctx.fillText('Pegue o Café da FEB para super velocidade!', width / 2, 365);
    }

    renderVictoryScreen(ctx, width, height) {
        ctx.fillStyle = 'rgba(10, 35, 15, 0.85)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 34px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('★ VITÓRIA DA FEB! ★', width / 2, 110);

        ctx.fillStyle = '#e8f5e9';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('MONTE CASTELLO FOI CONQUISTADO!', width / 2, 155);

        ctx.fillStyle = '#95d5b2';
        ctx.font = '15px monospace';
        ctx.fillText(`Inimigos Eliminados: ${this.player.kills} / ${this.enemies.length}`, width / 2, 205);
        ctx.fillText(`Pontuação de Honra: ${this.hud.score} pts`, width / 2, 235);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('CLIQUE PARA JOGAR NOVAMENTE', width / 2, 300);
    }

    renderGameOverScreen(ctx, width, height) {
        ctx.fillStyle = 'rgba(40, 5, 5, 0.88)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#e63946';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VOCÊ TOMBOU EM COMBATE', width / 2, 130);

        ctx.fillStyle = '#f1faee';
        ctx.font = '16px monospace';
        ctx.fillText('A bravura dos Pracinhas jamais será esquecida.', width / 2, 180);

        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 17px monospace';
        ctx.fillText('★ CLIQUE PARA TENTAR NOVAMENTE ★', width / 2, 260);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
