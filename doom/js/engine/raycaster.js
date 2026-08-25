/**
 * Motor Raycaster 2.5D DDA (Digital Differential Analysis)
 * Renderização de paredes texturizadas, portas deslizantes, iluminação por distância e sprites 3D ordenados (Z-Buffer).
 */
import { TILE_TYPES } from '../world/map.js';

export class Raycaster {
    constructor(canvas, textureManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.textureManager = textureManager;
        this.zBuffer = [];
        this.cachedTextureCanvases = {};
        this.initTextureCanvases();
    }

    // Pré-cria canvases HTML para fatiamento ultrarrápido com drawImage
    initTextureCanvases() {
        const texs = this.textureManager.textures;
        for (const key in texs) {
            const imgData = texs[key];
            const c = document.createElement('canvas');
            c.width = imgData.width;
            c.height = imgData.height;
            const ctx = c.getContext('2d');
            ctx.putImageData(imgData, 0, 0);
            this.cachedTextureCanvases[key] = c;
        }
    }

    render(player, gameMap, enemies, pickups, particleManager, camera, bloodScreen, isMuzzleFlash, weaponSystem = null) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.imageSmoothingEnabled = false;

        // Limpa z-buffer
        if (this.zBuffer.length !== width) {
            this.zBuffer = new Float32Array(width);
        }

        // Recuo visual da câmera (Kick vertical e de profundidade ao disparar)
        const kickY = weaponSystem ? weaponSystem.cameraKickY : 0;
        const kickZ = weaponSystem ? weaponSystem.cameraKickZ : 0;

        // 1. Renderiza Teto e Chão com Gradiente Atmosférico
        this.renderCeilingAndFloor(ctx, width, height, player, isMuzzleFlash, kickY);

        // 2. Projeção de Câmera 2.5D (com leve expansão de FOV pelo kickZ)
        const fov = camera.fov + (kickZ * 0.003);
        const halfFov = fov / 2;
        const dirX = Math.cos(player.angle);
        const dirY = Math.sin(player.angle);
        // Plano da câmera perpendicular à direção
        const planeX = -dirY * Math.tan(halfFov);
        const planeY = dirX * Math.tan(halfFov);

        const shakeX = bloodScreen.shakeX;
        const shakeY = bloodScreen.shakeY - kickY; // Deslocamento da câmera para cima ao atirar

        // 3. Loop de Raycasting por Coluna
        for (let x = 0; x < width; x++) {
            // Coordenada no espaço de câmera [-1, 1]
            const cameraX = (2 * x) / width - 1;
            const rayDirX = dirX + planeX * cameraX;
            const rayDirY = dirY + planeY * cameraX;

            let mapX = Math.floor(player.x);
            let mapY = Math.floor(player.y);

            const deltaDistX = Math.abs(1 / (rayDirX === 0 ? 1e-10 : rayDirX));
            const deltaDistY = Math.abs(1 / (rayDirY === 0 ? 1e-10 : rayDirY));

            let stepX, stepY;
            let sideDistX, sideDistY;

            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (player.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
            }

            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (player.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
            }

            let hit = 0;
            let side = 0; // 0 = X, 1 = Y
            let hitDoor = null;
            let wallType = 0;
            let doorOffsetHit = 0;

            // Avanço no grid DDA
            while (hit === 0) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }

                wallType = gameMap.getTile(mapX, mapY);
                if (wallType > 0) {
                    const door = gameMap.doors[`${mapX},${mapY}`];
                    if (door) {
                        // Calcula ponto de impacto exato na porta deslizante
                        let hitDist;
                        if (side === 0) {
                            hitDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
                        } else {
                            hitDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
                        }
                        
                        let wallHitX;
                        if (side === 0) {
                            wallHitX = player.y + hitDist * rayDirY;
                        } else {
                            wallHitX = player.x + hitDist * rayDirX;
                        }
                        wallHitX -= Math.floor(wallHitX);

                        // Se a porta abriu o suficiente, o raio atravessa
                        if (wallHitX < door.offset) {
                            continue; // Atravessa o vão aberto
                        } else {
                            doorOffsetHit = door.offset;
                            hitDoor = door;
                            hit = 1;
                        }
                    } else {
                        hit = 1;
                    }
                }
            }

            // Distância perpendicular (remove o efeito olho de peixe)
            let perpWallDist;
            if (side === 0) {
                perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
            } else {
                perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
            }

            this.zBuffer[x] = perpWallDist;

            // Altura da fatia na tela
            const lineHeight = Math.floor(height / Math.max(0.001, perpWallDist));
            const drawStart = Math.floor(-lineHeight / 2 + height / 2 + camera.bobY + shakeY);
            const drawEnd = Math.floor(lineHeight / 2 + height / 2 + camera.bobY + shakeY);

            // Coordenada X na textura (0 a 63)
            let wallX;
            if (side === 0) {
                wallX = player.y + perpWallDist * rayDirY;
            } else {
                wallX = player.x + perpWallDist * rayDirX;
            }
            wallX -= Math.floor(wallX);

            let texX = Math.floor(wallX * 64);
            if (hitDoor) {
                texX = Math.floor((wallX - doorOffsetHit) * 64);
            }
            if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
                texX = 63 - texX;
            }
            texX = Math.max(0, Math.min(63, texX));

            // Seleciona a textura
            const texCanvas = this.getTextureCanvasForTile(wallType);

            // Renderiza a fatia vertical da parede
            ctx.drawImage(
                texCanvas,
                texX, 0, 1, 64,
                x + shakeX, drawStart, 1, drawEnd - drawStart
            );

            // Iluminação / Fog de distância (com reforço do muzzle flash)
            const flashBoost = isMuzzleFlash ? 0.35 : 0.0;
            const darkFactor = Math.max(0.0, Math.min(0.9, (perpWallDist / 13) - flashBoost + (side === 1 ? 0.15 : 0)));
            if (darkFactor > 0) {
                ctx.fillStyle = `rgba(15, 18, 20, ${darkFactor})`;
                ctx.fillRect(x + shakeX, drawStart, 1, drawEnd - drawStart);
            }
        }

        // 4. Renderização de Sprites (Inimigos, Pickups e Sangue 3D)
        this.renderSprites(ctx, width, height, player, dirX, dirY, planeX, planeY, enemies, pickups, particleManager, camera, shakeX, shakeY);
    }

    getTextureCanvasForTile(tileType) {
        switch (tileType) {
            case TILE_TYPES.TRENCH_WALL: return this.cachedTextureCanvases['trench'];
            case TILE_TYPES.BUNKER_WALL: return this.cachedTextureCanvases['bunker'];
            case TILE_TYPES.STONE_WALL: return this.cachedTextureCanvases['stone'];
            case TILE_TYPES.COMMAND_WALL: return this.cachedTextureCanvases['command'];
            case TILE_TYPES.DOOR_NORMAL: return this.cachedTextureCanvases['door_normal'];
            case TILE_TYPES.DOOR_IRON: return this.cachedTextureCanvases['door_iron'];
            case TILE_TYPES.DOOR_GOLD: return this.cachedTextureCanvases['door_gold'];
            case TILE_TYPES.SECRET_WALL: return this.cachedTextureCanvases['secret'];
            case TILE_TYPES.EXIT_WALL: return this.cachedTextureCanvases['exit'];
            default: return this.cachedTextureCanvases['bunker'];
        }
    }

    renderCeilingAndFloor(ctx, width, height, player, isMuzzleFlash, kickY = 0) {
        const halfH = height / 2 - kickY;

        // Céu / Teto (Gradiente escuro / tempestade na Itália)
        const ceilGrad = ctx.createLinearGradient(0, 0, 0, halfH);
        ceilGrad.addColorStop(0, '#101419');
        ceilGrad.addColorStop(1, '#2c333d');
        ctx.fillStyle = ceilGrad;
        ctx.fillRect(0, 0, width, halfH);

        // Chão / Trincheira (Gradiente terra e lama)
        const floorGrad = ctx.createLinearGradient(0, halfH, 0, height);
        floorGrad.addColorStop(0, '#221a14');
        floorGrad.addColorStop(1, '#130d09');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, halfH, width, height - halfH);
    }

    renderSprites(ctx, width, height, player, dirX, dirY, planeX, planeY, enemies, pickups, particleManager, camera, shakeX, shakeY) {
        // Coleta todos os sprites a serem renderizados
        const sprites = [];

        // Inimigos
        for (const e of enemies) {
            const dist = Math.hypot(player.x - e.x, player.y - e.y);
            sprites.push({ x: e.x, y: e.y, z: 0, dist, obj: e, type: 'enemy' });
        }

        // Pickups
        for (const p of pickups) {
            if (!p.collected) {
                const dist = Math.hypot(player.x - p.x, player.y - p.y);
                sprites.push({ x: p.x, y: p.y, z: 0, dist, obj: p, type: 'pickup' });
            }
        }

        // Partículas 3D (Sangue, faíscas)
        for (const pt of particleManager.particles) {
            const dist = Math.hypot(player.x - pt.x, player.y - pt.y);
            sprites.push({ x: pt.x, y: pt.y, z: pt.z, dist, obj: pt, type: 'particle' });
        }

        // Ordena sprites de trás para frente (Painter's Algorithm)
        sprites.sort((a, b) => b.dist - a.dist);

        // Projeta cada sprite na tela
        const invDet = 1.0 / (planeX * dirY - dirX * planeY);

        for (const sprite of sprites) {
            const spriteX = sprite.x - player.x;
            const spriteY = sprite.y - player.y;

            // Transformação com a matriz inversa de câmera
            const transformX = invDet * (dirY * spriteX - dirX * spriteY);
            const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

            if (transformY <= 0.1) continue; // Atrás da câmera

            const spriteScreenX = Math.floor((width / 2) * (1 + transformX / transformY));

            // Altura e largura do sprite na tela
            const spriteHeight = Math.abs(Math.floor(height / transformY));
            const spriteWidth = spriteHeight;

            const drawStartY = Math.floor(-spriteHeight / 2 + height / 2 + camera.bobY + shakeY - (sprite.z * spriteHeight * 0.8));
            const drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX + shakeX);

            // Checa se o centro do sprite está visível no z-buffer
            if (spriteScreenX >= -spriteWidth && spriteScreenX < width + spriteWidth) {
                // Checa amostragem no z-buffer
                const checkX = Math.max(0, Math.min(width - 1, spriteScreenX));
                if (transformY < this.zBuffer[checkX] + 0.2) {
                    if (sprite.type === 'enemy') {
                        sprite.obj.render(ctx, spriteScreenX + shakeX, height / 2 + camera.bobY + shakeY, spriteHeight);
                    } else if (sprite.type === 'pickup') {
                        sprite.obj.render(ctx, spriteScreenX + shakeX, height / 2 + camera.bobY + shakeY + spriteHeight * 0.15, spriteHeight);
                    } else if (sprite.type === 'particle') {
                        const pt = sprite.obj;
                        ctx.fillStyle = pt.color;
                        const pSize = Math.max(1, (pt.size * height) / (transformY * 64));
                        ctx.fillRect(spriteScreenX + shakeX - pSize / 2, drawStartY, pSize, pSize);
                    }
                }
            }
        }
    }

    // Sistema de Hitscan / Disparo de Arma contra Inimigos
    performHitscan(player, weaponData, enemies, gameMap, soundFX, particleManager, hud) {
        const spreadAngle = (Math.random() - 0.5) * weaponData.spread;
        const shootAngle = player.angle + spreadAngle;
        const dirX = Math.cos(shootAngle);
        const dirY = Math.sin(shootAngle);

        let closestEnemy = null;
        let closestDist = weaponData.range;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;

            const ex = enemy.x - player.x;
            const ey = enemy.y - player.y;
            const dist = Math.hypot(ex, ey);

            if (dist <= closestDist) {
                // Ângulo até o inimigo
                const enemyAngle = Math.atan2(ey, ex);
                let diffAngle = enemyAngle - shootAngle;
                while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
                while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

                // Margem angular de acerto (cone de mira)
                const hitThreshold = Math.atan2(enemy.radius, dist);
                if (Math.abs(diffAngle) < hitThreshold) {
                    // Verifica se há parede bloqueando a linha de tiro
                    if (enemy.checkLineOfSight(player.x, player.y, gameMap)) {
                        closestDist = dist;
                        closestEnemy = enemy;
                    }
                }
            }
        }

        if (closestEnemy) {
            closestEnemy.takeDamage(weaponData.damage, soundFX, particleManager, hud);
            return { hit: true, target: closestEnemy, distance: closestDist };
        } else {
            // Tiro atingiu parede ou nada
            const sparkDist = Math.min(weaponData.range, 8);
            particleManager.spawnSparks(player.x + dirX * sparkDist, player.y + dirY * sparkDist, 0.5, 3);
            return { hit: false };
        }
    }
}
