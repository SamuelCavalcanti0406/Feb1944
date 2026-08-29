/**
 * Gerenciador de Fases e Mapas (Fase 1: Monte Castello / Fase 2: Bunker Alemão Subterrâneo)
 * Suporte a transição entre fases, portas de ferro/ouro/oficial, passagens secretas e emboscadas.
 */

export const TILE_TYPES = {
    EMPTY: 0,
    TRENCH_WALL: 1,
    BUNKER_WALL: 2,
    STONE_WALL: 3,
    COMMAND_WALL: 4,
    DOOR_NORMAL: 5,
    DOOR_IRON: 6,
    DOOR_GOLD: 7,
    SECRET_WALL: 8,
    EXIT_WALL: 9,
    DIRTY_CONCRETE: 10,
    WAR_ROOM_MAP: 11,
    NAZI_BANNER: 12,
    ARMORED_DOOR: 13,
    DOOR_OFFICER: 14
};

export class GameMap {
    constructor(level = 1) {
        this.currentLevel = level;
        this.loadLevel(level);
    }

    loadLevel(level) {
        this.currentLevel = level;
        this.doors = {};

        if (level === 2) {
            this.initLevel2();
        } else {
            this.initLevel1();
        }

        this.initDoors();
    }

    // FASE 1: MONTE CASTELLO - TRINCHEIRAS & BUNKERS
    initLevel1() {
        this.levelName = 'FASE 1: MONTE CASTELLO - A LINHA GÓTICA';
        this.fogDensity = 13.0; // Neblina atmosférica externa/trincheira
        this.floorType = 'floor_trench';
        this.ceilType = 'ceil_sky';
        this.width = 24;
        this.height = 24;

        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 1],
            [1, 0, 0, 0, 5, 0, 0, 0, 0, 5, 2, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 2, 1],
            [1, 1, 5, 1, 1, 0, 0, 0, 0, 1, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 1],
            [1, 0, 0, 0, 1, 1, 1, 5, 1, 1, 2, 2, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 4, 4, 4, 4, 0, 0, 2, 1],
            [1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 2, 2, 2, 0, 2, 0, 4, 0, 0, 4, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 1, 2, 2, 0, 2, 0, 2, 0, 4, 0, 0, 4, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 0, 5, 0, 7, 0, 4, 0, 0, 4, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 1, 2, 2, 0, 2, 0, 2, 0, 4, 4, 5, 4, 0, 0, 2, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 5, 2, 2, 2, 2, 1],
            [1, 0, 3, 3, 3, 3, 3, 3, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 0, 3, 0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 0, 3, 0, 0, 0, 0, 5, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 2, 0, 0, 2, 1],
            [1, 0, 3, 0, 0, 0, 0, 3, 0, 0, 5, 0, 0, 0, 5, 0, 0, 2, 9, 2, 0, 0, 2, 1],
            [1, 0, 3, 3, 5, 3, 3, 3, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 2, 0, 0, 2, 1],
            [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 2, 0, 0, 0, 2, 2, 2, 2, 0, 2, 2, 2, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        this.playerSpawn = { x: 2.5, y: 2.5, angle: 0 };

        this.enemySpawns = [
            { type: 'soldier', x: 6.5, y: 2.5 },
            { type: 'soldier', x: 2.5, y: 7.5 },
            { type: 'soldier', x: 6.5, y: 9.5 },
            { type: 'soldier', x: 8.5, y: 6.5 },
            { type: 'soldier', x: 12.5, y: 2.5 },
            { type: 'officer', x: 16.5, y: 2.5 },
            { type: 'soldier', x: 18.5, y: 7.5 },
            { type: 'soldier', x: 16.5, y: 9.5 },
            { type: 'officer', x: 18.5, y: 9.5 },
            { type: 'officer', x: 17.5, y: 11.5 },
            { type: 'soldier', x: 5.5, y: 16.5 },
            { type: 'soldier', x: 12.5, y: 16.5 },
            { type: 'officer', x: 18.5, y: 15.5 },
            { type: 'officer', x: 20.5, y: 20.5 }
        ];

        this.pickupSpawns = [
            { type: 'ammo_revolver', x: 1.5, y: 1.5 },
            { type: 'ration', x: 3.5, y: 1.5 },
            { type: 'helmet', x: 1.5, y: 3.5 },
            { type: 'ammo_revolver', x: 7.5, y: 1.5 },
            { type: 'coffee', x: 8.5, y: 3.5 },
            { type: 'weapon_thompson', x: 12.5, y: 7.5 },
            { type: 'ammo_smg', x: 13.5, y: 7.5 },
            { type: 'ammo_smg', x: 11.5, y: 7.5 },
            { type: 'coffee', x: 12.5, y: 8.5 },
            { type: 'key_iron', x: 5.5, y: 17.5 },
            { type: 'ration', x: 4.5, y: 17.5 },
            { type: 'ammo_rifle', x: 3.5, y: 16.5 },
            { type: 'weapon_garand', x: 4.5, y: 15.5 },
            { type: 'key_gold', x: 18.5, y: 10.5 },
            { type: 'helmet', x: 19.5, y: 10.5 },
            { type: 'ammo_smg', x: 17.5, y: 10.5 },
            { type: 'ammo_rifle', x: 18.5, y: 11.5 },
            { type: 'ration', x: 13.5, y: 16.5 },
            { type: 'coffee', x: 14.5, y: 16.5 },
            { type: 'ammo_smg', x: 18.5, y: 19.5 },
            { type: 'ammo_rifle', x: 20.5, y: 19.5 }
        ];
    }

    // FASE 2: BUNKER SUBTERRÂNEO ALEMÃO (Labirinto, Corredores Estreitos de 90°, Sombras & Emboscadas)
    initLevel2() {
        this.levelName = 'FASE 2: BUNKER SUBTERRÂNEO - COMPLEXO DE COMANDO';
        this.fogDensity = 8.5; // Sombreamento denso e escuro de bunker subterrâneo
        this.floorType = 'floor_steel';
        this.ceilType = 'ceil_pipes';
        this.width = 24;
        this.height = 24;

        // 10=Dirty Concrete, 11=War Room Map, 12=Nazi Banner, 13=Armored Blast Door, 14=Officer Key Door, 8=Secret, 9=Exit
        this.grid = [
            [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
            [10,  0,  0,  0, 10,  0,  0,  0, 10, 11, 11, 11, 10,  0,  0,  0, 10, 12, 12, 12, 12, 12, 10, 10],
            [10,  0, 10,  0, 13,  0, 10,  0, 13,  0,  0,  0, 13,  0, 10,  0, 13,  0,  0,  0,  0,  0, 10, 10],
            [10,  0, 10,  0, 10, 10, 10,  0, 10,  0, 10,  0, 10,  0, 10,  0, 10,  0, 12,  0, 12,  0, 10, 10],
            [10,  0, 10,  0,  0,  0, 10,  0, 10, 11, 11, 11, 10,  0, 10,  0, 10,  0,  0,  0,  0,  0, 10, 10],
            [10,  0, 10, 10, 10,  0, 10,  0, 10, 10, 10, 10, 10,  0, 10, 10, 10, 10, 10, 14, 10, 10, 10, 10],
            [10,  0,  0,  0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10,  0,  0,  0,  9, 10],
            [10, 10, 10,  0, 10, 10, 10, 10, 10, 13, 10, 10, 10, 10, 10,  0, 10,  0, 10,  0, 10, 10, 10, 10],
            [10,  0,  0,  0,  0,  0,  0,  0, 10,  0,  0,  0,  0,  0, 10,  0, 10,  0, 10,  0, 10,  0,  0, 10],
            [10,  0, 10, 10, 10, 10, 10,  0, 10,  0, 10, 10, 10,  0, 10,  0, 10,  0, 10,  0, 10,  0, 10, 10],
            [10,  0, 10, 11, 11, 11, 10,  0, 13,  0, 10,  8, 10,  0, 13,  0, 10,  0, 13,  0, 10,  0, 10, 10],
            [10,  0, 10,  0,  0,  0, 10,  0, 10,  0, 10,  0, 10,  0, 10,  0, 10,  0, 10,  0, 10,  0, 10, 10],
            [10,  0, 10,  0, 10,  0, 10,  0, 10, 10, 10,  0, 10, 10, 10,  0, 10,  0, 10,  0, 10,  0, 10, 10],
            [10,  0, 13,  0, 10,  0, 13,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10,  0, 10,  0,  0,  0, 10, 10],
            [10,  0, 10, 10, 10,  0, 10, 10, 10, 10, 10,  0, 10, 10, 10, 10, 10,  0, 10, 10, 10, 10, 10, 10],
            [10,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10,  0, 10,  0,  0,  0,  0,  0,  0,  0,  0,  0, 10, 10],
            [10, 10, 10, 10, 10, 10, 10, 10, 10,  0, 10,  0, 10,  0, 10, 10, 10, 10, 10, 10, 10,  0, 10, 10],
            [10, 12, 12, 12, 12, 12, 12, 12, 10,  0, 13,  0, 13,  0, 10, 12, 12, 12, 12, 12, 10,  0, 10, 10],
            [10, 12,  0,  0,  0,  0,  0, 12, 10,  0, 10,  0, 10,  0, 10, 12,  0,  0,  0, 12, 10,  0, 10, 10],
            [10, 12,  0, 10, 10, 10,  0, 12, 10,  0, 10,  0, 10,  0, 10, 12,  0, 10,  0, 12, 10,  0, 10, 10],
            [10, 12,  0, 10,  0, 10,  0, 13,  0,  0, 10,  0, 10,  0,  0, 13,  0, 10,  0, 12, 10,  0, 10, 10],
            [10, 12,  0,  0,  0,  0,  0, 12, 10, 10, 10,  0, 10, 10, 10, 12,  0,  0,  0, 12, 10,  0, 10, 10],
            [10, 12, 12, 12, 12, 12, 12, 12, 10,  0,  0,  0,  0,  0, 10, 12, 12, 12, 12, 12, 10,  0,  0, 10],
            [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
        ];

        this.playerSpawn = { x: 1.5, y: 1.5, angle: 0 };

        // EMBOSCADAS NAZISTAS EM ESQUINAS DE 90° E ATRÁS DE PORTAS BLINDADAS
        this.enemySpawns = [
            // Corredor inicial estreito e esquinas
            { type: 'soldier', x: 3.5, y: 1.5 },
            { type: 'soldier', x: 1.5, y: 4.5 },
            { type: 'soldier', x: 5.5, y: 3.5 },

            // Emboscada na Sala de Comunicações 1 (atrás da porta blindada)
            { type: 'officer', x: 10.5, y: 2.5 },
            { type: 'soldier', x: 11.5, y: 4.5 },

            // Esquinas cegas do labirinto
            { type: 'soldier', x: 7.5, y: 6.5 },
            { type: 'soldier', x: 13.5, y: 6.5 },
            { type: 'officer', x: 17.5, y: 6.5 },

            // Guarda da passagem leste
            { type: 'soldier', x: 1.5, y: 8.5 },
            { type: 'soldier', x: 5.5, y: 10.5 },
            { type: 'officer', x: 3.5, y: 12.5 },

            // Emboscada pesada no depósito e corredor central
            { type: 'soldier', x: 9.5, y: 13.5 },
            { type: 'soldier', x: 13.5, y: 13.5 },
            { type: 'officer', x: 11.5, y: 15.5 },

            // Sala do General / Comandante da SS
            { type: 'officer', x: 4.5, y: 19.5 },
            { type: 'officer', x: 5.5, y: 20.5 },
            { type: 'soldier', x: 2.5, y: 21.5 },
            { type: 'soldier', x: 6.5, y: 21.5 },

            // Sala de Munição / Cofre Direito
            { type: 'officer', x: 18.5, y: 19.5 },
            { type: 'soldier', x: 19.5, y: 21.5 },

            // Guardas da passagem
            { type: 'soldier', x: 21.5, y: 10.5 },
            { type: 'officer', x: 21.5, y: 14.5 },

            // ★ SUB-CHEFE: ARTILHEIRO MG42 (HEAVY GUNNER) BLOQUEANDO A SAÍDA DO BUNKER ★
            // Carrega e derruba a CHAVE DO OFICIAL ao ser derrotado
            { type: 'heavy_gunner', x: 19.5, y: 3.5, dropItem: 'key_officer' }
        ];

        this.pickupSpawns = [
            { type: 'ammo_revolver', x: 2.5, y: 1.5 },
            { type: 'ration', x: 1.5, y: 3.5 },
            { type: 'helmet', x: 3.5, y: 3.5 },

            // Sala de Rádio e Mapa
            { type: 'ammo_smg', x: 9.5, y: 1.5 },
            { type: 'coffee', x: 11.5, y: 1.5 },

            // Armaria Secreta (atrás da parede com a Cobra Fumando no centro)
            { type: 'weapon_garand', x: 11.5, y: 11.5 },
            { type: 'ammo_rifle', x: 11.5, y: 12.5 },
            { type: 'helmet', x: 11.5, y: 10.5 },
            { type: 'coffee', x: 11.5, y: 9.5 },

            // Ração e munições nos corredores
            { type: 'ration', x: 1.5, y: 15.5 },
            { type: 'ammo_smg', x: 7.5, y: 15.5 },
            { type: 'ammo_rifle', x: 15.5, y: 15.5 },

            // Sala do Alto Comando SS (Armamentos e munições pesadas)
            { type: 'weapon_thompson', x: 3.5, y: 20.5 },
            { type: 'ammo_smg', x: 2.5, y: 18.5 },
            { type: 'ammo_rifle', x: 6.5, y: 18.5 },
            { type: 'helmet', x: 5.5, y: 18.5 },

            // Cofre de suprimentos
            { type: 'coffee', x: 18.5, y: 20.5 },
            { type: 'ration', x: 17.5, y: 21.5 },
            { type: 'ammo_smg', x: 19.5, y: 18.5 },

            // Suprimentos finais antes do portão de extração
            { type: 'ration', x: 21.5, y: 2.5 },
            { type: 'ammo_rifle', x: 21.5, y: 4.5 }
        ];
    }

    initDoors() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.grid[y][x];
                if (tile === TILE_TYPES.DOOR_NORMAL || tile === TILE_TYPES.DOOR_IRON || 
                    tile === TILE_TYPES.DOOR_GOLD || tile === TILE_TYPES.ARMORED_DOOR ||
                    tile === TILE_TYPES.DOOR_OFFICER || tile === TILE_TYPES.SECRET_WALL) {
                    this.doors[`${x},${y}`] = {
                        x, y,
                        type: tile,
                        offset: 0,
                        state: 'closed',
                        timer: 0
                    };
                }
            }
        }
    }

    getTile(x, y) {
        const mapX = Math.floor(x);
        const mapY = Math.floor(y);
        if (mapX < 0 || mapX >= this.width || mapY < 0 || mapY >= this.height) {
            return TILE_TYPES.DIRTY_CONCRETE;
        }
        return this.grid[mapY][mapX];
    }

    isSolid(x, y) {
        const tile = this.getTile(x, y);
        if (tile === TILE_TYPES.EMPTY) return false;
        
        const door = this.doors[`${Math.floor(x)},${Math.floor(y)}`];
        if (door) {
            return door.offset < 0.7;
        }
        return true;
    }

    tryInteract(playerX, playerY, dirX, dirY, inventory, soundFX, hud) {
        const checkDist = 1.25;
        const targetX = Math.floor(playerX + dirX * checkDist);
        const targetY = Math.floor(playerY + dirY * checkDist);
        const key = `${targetX},${targetY}`;
        const door = this.doors[key];

        if (!door) return false;

        if (door.type === TILE_TYPES.DOOR_NORMAL || door.type === TILE_TYPES.ARMORED_DOOR) {
            this.toggleDoor(door, soundFX);
            return true;
        } else if (door.type === TILE_TYPES.DOOR_IRON) {
            if (inventory.hasIronKey) {
                hud.addMessage('Porta de Ferro aberta com a Chave de Ferro!');
                door.type = TILE_TYPES.DOOR_NORMAL;
                this.grid[targetY][targetX] = TILE_TYPES.DOOR_NORMAL;
                this.toggleDoor(door, soundFX);
            } else {
                hud.addMessage('Trancada! Você precisa da Chave de Ferro.');
                soundFX.playDoorLocked();
            }
            return true;
        } else if (door.type === TILE_TYPES.DOOR_GOLD) {
            if (inventory.hasGoldKey) {
                hud.addMessage('Porta Dourada aberta com a Chave de Ouro!');
                door.type = TILE_TYPES.DOOR_NORMAL;
                this.grid[targetY][targetX] = TILE_TYPES.DOOR_NORMAL;
                this.toggleDoor(door, soundFX);
            } else {
                hud.addMessage('Trancada! Exige a Chave Dourada.');
                soundFX.playDoorLocked();
            }
            return true;
        } else if (door.type === TILE_TYPES.DOOR_OFFICER) {
            if (inventory.hasOfficerKey) {
                hud.addMessage('★ PORTÃO DE EXTRAÇÃO ABERTO COM A CHAVE DO OFICIAL! ★');
                door.type = TILE_TYPES.ARMORED_DOOR;
                this.grid[targetY][targetX] = TILE_TYPES.ARMORED_DOOR;
                this.toggleDoor(door, soundFX);
            } else {
                hud.addMessage('★ TRANCADO! Exige a CHAVE DO OFICIAL da SS ★');
                soundFX.playDoorLocked();
            }
            return true;
        } else if (door.type === TILE_TYPES.SECRET_WALL) {
            hud.addMessage('★ PASSAGEM SECRETA DA FEB REVELADA! ★');
            this.toggleDoor(door, soundFX);
            return true;
        }

        return false;
    }

    toggleDoor(door, soundFX) {
        if (door.state === 'closed' || door.state === 'closing') {
            door.state = 'opening';
            soundFX.playDoorOpen();
        } else if (door.state === 'open') {
            door.state = 'closing';
            soundFX.playDoorOpen();
        }
    }

    update(dt) {
        const speed = 2.2;
        for (const key in this.doors) {
            const door = this.doors[key];
            if (door.state === 'opening') {
                door.offset += speed * dt;
                if (door.offset >= 1.0) {
                    door.offset = 1.0;
                    door.state = 'open';
                    door.timer = 5.0;
                }
            } else if (door.state === 'open') {
                if (door.type !== TILE_TYPES.SECRET_WALL) {
                    door.timer -= dt;
                    if (door.timer <= 0) {
                        door.state = 'closing';
                    }
                }
            } else if (door.state === 'closing') {
                door.offset -= speed * dt;
                if (door.offset <= 0) {
                    door.offset = 0;
                    door.state = 'closed';
                }
            }
        }
    }
}
