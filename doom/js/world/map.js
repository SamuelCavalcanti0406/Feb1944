/**
 * Definição do Mapa e Nível 1: Monte Castello - A Linha Gótica (FEB 1944)
 * Gerenciamento de portas, paredes secretas e interações de cenário.
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
    EXIT_WALL: 9
};

export class GameMap {
    constructor() {
        this.width = 24;
        this.height = 24;
        
        // Matriz da fase 1
        // 1=Trincheira, 2=Bunker, 3=Pedra, 4=Comando, 5=Porta, 6=Porta Ferro, 7=Porta Ouro, 8=Secreta, 9=Saída
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

        // Controle de animação de portas e paredes secretas
        this.doors = {};
        this.initDoors();

        // Posição inicial do jogador
        this.playerSpawn = { x: 2.5, y: 2.5, angle: 0 };

        // Spawns de Inimigos e Itens
        this.enemySpawns = [
            // Soldados da Wehrmacht (Trincheiras)
            { type: 'soldier', x: 6.5, y: 2.5 },
            { type: 'soldier', x: 2.5, y: 7.5 },
            { type: 'soldier', x: 6.5, y: 9.5 },
            { type: 'soldier', x: 8.5, y: 6.5 },
            // Soldados & Oficiais no Bunker
            { type: 'soldier', x: 12.5, y: 2.5 },
            { type: 'officer', x: 16.5, y: 2.5 },
            { type: 'soldier', x: 18.5, y: 7.5 },
            { type: 'soldier', x: 16.5, y: 9.5 },
            // Posto de Comando do General / Chefe
            { type: 'officer', x: 18.5, y: 9.5 },
            { type: 'officer', x: 17.5, y: 11.5 },
            // Guardas da saída e ruínas
            { type: 'soldier', x: 5.5, y: 16.5 },
            { type: 'soldier', x: 12.5, y: 16.5 },
            { type: 'officer', x: 18.5, y: 15.5 },
            { type: 'officer', x: 20.5, y: 20.5 }
        ];

        this.pickupSpawns = [
            // Área inicial (Munição e Ração)
            { type: 'ammo_revolver', x: 1.5, y: 1.5 },
            { type: 'ration', x: 3.5, y: 1.5 },
            { type: 'helmet', x: 1.5, y: 3.5 },

            // Trincheira aberta
            { type: 'ammo_revolver', x: 7.5, y: 1.5 },
            { type: 'coffee', x: 8.5, y: 3.5 }, // Café da FEB (Speed boost + Vida)

            // Sala Secreta 1 (atrás da parede secreta da Cobra: Thompson + Munição!)
            { type: 'weapon_thompson', x: 12.5, y: 7.5 },
            { type: 'ammo_smg', x: 13.5, y: 7.5 },
            { type: 'ammo_smg', x: 11.5, y: 7.5 },
            { type: 'coffee', x: 12.5, y: 8.5 },

            // Chave de Ferro (Na sala de rádio italiana)
            { type: 'key_iron', x: 5.5, y: 17.5 },
            { type: 'ration', x: 4.5, y: 17.5 },
            { type: 'ammo_rifle', x: 3.5, y: 16.5 },
            { type: 'weapon_garand', x: 4.5, y: 15.5 }, // M1 Garand histórico

            // Chave de Ouro (No posto de comando após os Oficiais)
            { type: 'key_gold', x: 18.5, y: 10.5 },
            { type: 'helmet', x: 19.5, y: 10.5 },
            { type: 'ammo_smg', x: 17.5, y: 10.5 },
            { type: 'ammo_rifle', x: 18.5, y: 11.5 },

            // Sala de abastecimento antes do elevador
            { type: 'ration', x: 13.5, y: 16.5 },
            { type: 'coffee', x: 14.5, y: 16.5 },
            { type: 'ammo_smg', x: 18.5, y: 19.5 },
            { type: 'ammo_rifle', x: 20.5, y: 19.5 }
        ];
    }

    initDoors() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.grid[y][x];
                if (tile === TILE_TYPES.DOOR_NORMAL || tile === TILE_TYPES.DOOR_IRON || 
                    tile === TILE_TYPES.DOOR_GOLD || tile === TILE_TYPES.SECRET_WALL) {
                    this.doors[`${x},${y}`] = {
                        x, y,
                        type: tile,
                        offset: 0, // 0 = fechada, 1 = totalmente aberta
                        state: 'closed', // 'closed', 'opening', 'open', 'closing'
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
            return TILE_TYPES.BUNKER_WALL;
        }
        return this.grid[mapY][mapX];
    }

    isSolid(x, y) {
        const tile = this.getTile(x, y);
        if (tile === TILE_TYPES.EMPTY) return false;
        
        // Verifica se é porta aberta
        const door = this.doors[`${Math.floor(x)},${Math.floor(y)}`];
        if (door) {
            return door.offset < 0.7; // Permite passar se estiver quase toda aberta
        }
        return true;
    }

    // Interação do jogador (tecla 'E' ou Espaço)
    tryInteract(playerX, playerY, dirX, dirY, inventory, soundFX, hud) {
        // Checa à frente do jogador
        const checkDist = 1.2;
        const targetX = Math.floor(playerX + dirX * checkDist);
        const targetY = Math.floor(playerY + dirY * checkDist);
        const key = `${targetX},${targetY}`;
        const door = this.doors[key];

        if (!door) return false;

        if (door.type === TILE_TYPES.DOOR_NORMAL) {
            this.toggleDoor(door, soundFX);
            return true;
        } else if (door.type === TILE_TYPES.DOOR_IRON) {
            if (inventory.hasIronKey) {
                hud.addMessage('Porta de Ferro destrancada com a Chave de Ferro!');
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
                hud.addMessage('Posto de Comando destrancado com a Chave de Ouro!');
                door.type = TILE_TYPES.DOOR_NORMAL;
                this.grid[targetY][targetX] = TILE_TYPES.DOOR_NORMAL;
                this.toggleDoor(door, soundFX);
            } else {
                hud.addMessage('Trancada! Exige a Chave Dourada do Oficial.');
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
        const speed = 2.0; // Velocidade de abertura
        for (const key in this.doors) {
            const door = this.doors[key];
            if (door.state === 'opening') {
                door.offset += speed * dt;
                if (door.offset >= 1.0) {
                    door.offset = 1.0;
                    door.state = 'open';
                    door.timer = 5.0; // Fica aberta por 5 segundos antes de fechar
                }
            } else if (door.state === 'open') {
                // Paredes secretas não fecham automaticamente
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
