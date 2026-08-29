/**
 * Gerador Procedural de Texturas Pixel Art 64x64
 * Suporte completo para a Fase 1 (Trincheiras & Monte Castello) e Fase 2 (Bunker Alemão Subterrâneo).
 */
export class TextureManager {
    constructor() {
        this.textures = {};
        this.textureSize = 64;
    }

    init() {
        // Texturas Fase 1
        this.textures['bunker'] = this.createBunkerWall();
        this.textures['trench'] = this.createTrenchWall();
        this.textures['stone'] = this.createStoneWall();
        this.textures['command'] = this.createCommandWall();
        this.textures['door_normal'] = this.createDoor('normal');
        this.textures['door_iron'] = this.createDoor('iron');
        this.textures['door_gold'] = this.createDoor('gold');
        this.textures['secret'] = this.createSecretWall();
        this.textures['exit'] = this.createExitWall();
        this.textures['floor_trench'] = this.createFloorTrench();
        this.textures['floor_bunker'] = this.createFloorBunker();
        this.textures['ceil_sky'] = this.createCeilingSky();
        this.textures['ceil_bunker'] = this.createCeilingBunker();

        // Novas Texturas Fase 2 (Bunker Alemão Subterrâneo)
        this.textures['dirty_concrete'] = this.createDirtyConcreteWall();
        this.textures['armored_door'] = this.createArmoredBlastDoor();
        this.textures['door_officer'] = this.createDoor('officer');
        this.textures['war_room_map'] = this.createWarRoomMapWall();
        this.textures['nazi_banner'] = this.createNaziBannerWall();
        this.textures['floor_steel'] = this.createFloorSteel();
        this.textures['ceil_pipes'] = this.createCeilingPipes();
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.textureSize;
        canvas.height = this.textureSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        return { canvas, ctx };
    }

    getPixelData(ctx) {
        return ctx.getImageData(0, 0, this.textureSize, this.textureSize);
    }

    // 1. CONCRETO ARMADO SUJO (Fase 2 - Manchas de umidade, ferrugem e rachaduras)
    createDirtyConcreteWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Base cinza escuro sujo
        ctx.fillStyle = '#31363a';
        ctx.fillRect(0, 0, size, size);

        // Granulação e ruído pesado
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const n = (Math.random() - 0.5) * 45;
                const c = Math.floor(48 + n);
                ctx.fillStyle = `rgb(${c}, ${c + 2}, ${c - 2})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        // Manchas verticais de infiltração / umidade e lodo verde escuro
        for (let x = 8; x < size; x += 14) {
            const stainW = 4 + Math.floor(Math.random() * 6);
            ctx.fillStyle = 'rgba(20, 30, 22, 0.45)';
            ctx.fillRect(x, 0, stainW, size);
            // Manchas de ferrugem
            ctx.fillStyle = 'rgba(100, 45, 15, 0.35)';
            ctx.fillRect(x + 1, 10, stainW - 2, 20 + Math.random() * 25);
        }

        // Blocos maciços de concreto armado com juntas profundas
        ctx.strokeStyle = '#181b1d';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
        ctx.strokeRect(0, 0, size, size / 2);

        // Rebites de ferro oxidados
        ctx.fillStyle = '#111315';
        [4, size - 4].forEach(px => {
            [4, 28, 36, size - 4].forEach(py => {
                ctx.fillRect(px - 1, py - 1, 3, 3);
                ctx.fillStyle = '#784421'; // Ferrugem no rebite
                ctx.fillRect(px, py, 1, 1);
                ctx.fillStyle = '#111315';
            });
        });

        // Rachadura de impacto estrutural
        ctx.strokeStyle = '#121416';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(14, 6);
        ctx.lineTo(26, 20);
        ctx.lineTo(22, 34);
        ctx.lineTo(34, 48);
        ctx.stroke();

        return this.getPixelData(ctx);
    }

    // 2. PORTA BLINDADA COM REBITES MACIÇOS E FAIXAS DE ADVERTÊNCIA (Fase 2)
    createArmoredBlastDoor() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Base de aço escovado escuro
        ctx.fillStyle = '#3a4047';
        ctx.fillRect(0, 0, size, size);

        // Painel reforçado central
        ctx.fillStyle = '#282d33';
        ctx.fillRect(6, 6, 52, 52);
        ctx.strokeStyle = '#151719';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, 52, 52);

        // Rebites pesados em toda a borda
        ctx.fillStyle = '#555e68';
        for (let i = 8; i < size - 6; i += 8) {
            ctx.fillRect(i, 8, 3, 3);
            ctx.fillRect(i, size - 11, 3, 3);
            ctx.fillRect(8, i, 3, 3);
            ctx.fillRect(size - 11, i, 3, 3);
        }

        // Volante central de travamento hermético de bunker
        ctx.fillStyle = '#181a1c';
        ctx.beginPath();
        ctx.arc(32, 32, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6f7985';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Raios do volante
        ctx.strokeStyle = '#6f7985';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(32, 20); ctx.lineTo(32, 44);
        ctx.moveTo(20, 32); ctx.lineTo(44, 32);
        ctx.stroke();

        // Faixas diagonais de perigo (Amarelo e Preto)
        for (let x = 0; x < size; x += 10) {
            ctx.fillStyle = (x / 10) % 2 === 0 ? '#d4a017' : '#1a1a1a';
            ctx.fillRect(x, 0, 10, 5);
            ctx.fillRect(x, size - 5, 10, 5);
        }

        return this.getPixelData(ctx);
    }

    // 3. MAPA ESTRATÉGICO MILITAR / SALA DE COMUNICAÇÕES (Fase 2)
    createWarRoomMapWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Parede de concreto sujo de fundo
        const dirtyData = this.createDirtyConcreteWall();
        ctx.putImageData(dirtyData, 0, 0);

        // Quadro de cortiça / prancheta com mapa de operações da Linha Gótica
        ctx.fillStyle = '#d8cbb5'; // Papel amarelado envelhecido
        ctx.fillRect(8, 8, 48, 48);
        ctx.strokeStyle = '#4a3219'; // Moldura de madeira
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 48, 48);

        // Contorno da península da Itália no mapa
        ctx.fillStyle = '#9cb08f';
        ctx.beginPath();
        ctx.moveTo(16, 14);
        ctx.lineTo(42, 14);
        ctx.lineTo(38, 28);
        ctx.lineTo(44, 38);
        ctx.lineTo(40, 50);
        ctx.lineTo(26, 44);
        ctx.lineTo(22, 28);
        ctx.closePath();
        ctx.fill();

        // Setas vermelhas de avanço tático e marcações de batalha
        ctx.strokeStyle = '#b81414';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(22, 42); ctx.lineTo(34, 28);
        ctx.moveTo(34, 28); ctx.lineTo(30, 24);
        ctx.stroke();

        // Alfinetes de marcação coloridos
        ctx.fillStyle = '#c91818';
        ctx.fillRect(33, 27, 3, 3);
        ctx.fillStyle = '#3a86ff';
        ctx.fillRect(24, 38, 3, 3);

        // Rádio de comunicações na base
        ctx.fillStyle = '#1c1f22';
        ctx.fillRect(10, 48, 20, 8);
        ctx.fillStyle = '#52b788'; // Luz verde do transmissor
        ctx.fillRect(12, 50, 2, 2);

        return this.getPixelData(ctx);
    }

    // 4. PAREDE COM FLÂMULAS E BANDEIRA NAZISTA (Fase 2)
    createNaziBannerWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Painel de madeira escura com guarnições
        ctx.fillStyle = '#2e180d';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#190c05';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        ctx.strokeRect(6, 6, size - 12, size - 12);

        // Estandarte vermelho militar central longo
        ctx.fillStyle = '#b81414';
        ctx.fillRect(14, 0, 36, 60);
        ctx.strokeStyle = '#5a0808';
        ctx.lineWidth = 1;
        ctx.strokeRect(14, 0, 36, 60);

        // Círculo branco central
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.arc(32, 28, 12, 0, Math.PI * 2);
        ctx.fill();

        // Suástica autêntica preta no centro do círculo
        ctx.fillStyle = '#0f1112';
        ctx.fillRect(30, 20, 4, 16);
        ctx.fillRect(24, 26, 16, 4);
        ctx.fillRect(34, 20, 6, 3);
        ctx.fillRect(24, 20, 3, 6);
        ctx.fillRect(24, 33, 6, 3);
        ctx.fillRect(37, 30, 3, 6);

        // Franjas douradas na base do estandarte
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(14, 60, 36, 3);

        return this.getPixelData(ctx);
    }

    // 5. CHÃO DE PLACAS DE AÇO DIAMANTADAS (Fase 2)
    createFloorSteel() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#1e2226';
        ctx.fillRect(0, 0, size, size);

        // Placas de metal xadrez / grade de aço
        const pSize = 16;
        for (let x = 0; x < size; x += pSize) {
            for (let y = 0; y < size; y += pSize) {
                ctx.strokeStyle = '#121416';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, pSize, pSize);

                // Relevo diamantado anti-derrapante
                ctx.fillStyle = '#2b3036';
                ctx.fillRect(x + 3, y + 3, 4, 2);
                ctx.fillRect(x + 9, y + 9, 4, 2);
            }
        }
        return this.getPixelData(ctx);
    }

    // 6. TETO COM TUBULAÇÕES E CABOS INDUSTRIAIS (Fase 2)
    createCeilingPipes() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#141618';
        ctx.fillRect(0, 0, size, size);

        // Tubulações industriais enferrujadas
        ctx.fillStyle = '#3c434d';
        ctx.fillRect(0, 10, size, 12);
        ctx.fillStyle = '#56606e';
        ctx.fillRect(0, 12, size, 3); // Luz no tubo

        ctx.fillStyle = '#5c3317'; // Tubo de vapor oxidado
        ctx.fillRect(18, 0, 10, size);

        // Cabos elétricos pretos suspensos
        ctx.strokeStyle = '#0a0a0a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 36); ctx.bezierCurveTo(20, 48, 44, 48, size, 36);
        ctx.stroke();

        return this.getPixelData(ctx);
    }

    // PORTAS (Normal, Ferro, Ouro, Oficial)
    createDoor(type = 'normal') {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#4c535a';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#353b42';
        ctx.fillRect(6, 6, 52, 24);
        ctx.fillRect(6, 34, 52, 24);
        ctx.strokeStyle = '#1e2226';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, 52, 24);
        ctx.strokeRect(6, 34, 52, 24);

        ctx.fillStyle = '#7a8591';
        ctx.beginPath();
        ctx.arc(48, 32, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1c1e';
        ctx.fillRect(47, 31, 2, 2);

        if (type === 'iron') {
            ctx.fillStyle = '#3a86ff';
            ctx.fillRect(24, 26, 16, 12);
            ctx.strokeStyle = '#181b1d';
            ctx.strokeRect(24, 26, 16, 12);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(30, 22, 4, 4);
            ctx.fillStyle = '#111';
            ctx.fillRect(31, 31, 2, 4);
        } else if (type === 'gold') {
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(24, 26, 16, 12);
            ctx.strokeStyle = '#b58300';
            ctx.strokeRect(24, 26, 16, 12);
            ctx.fillStyle = '#ffbe0b';
            ctx.fillRect(30, 22, 4, 4);
            ctx.fillStyle = '#473200';
            ctx.fillRect(31, 31, 2, 4);
        } else if (type === 'officer') {
            // Cadeado Vermelho Sangue / Caveira do Oficial SS
            ctx.fillStyle = '#b81414';
            ctx.fillRect(22, 24, 20, 16);
            ctx.strokeStyle = '#5a0808';
            ctx.strokeRect(22, 24, 20, 16);
            ctx.fillStyle = '#d6dbe0';
            ctx.fillRect(29, 19, 6, 5); // Arco de aço
            // Caveira prateada no cadeado
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(29, 27, 6, 5);
            ctx.fillStyle = '#111';
            ctx.fillRect(30, 28, 1, 1);
            ctx.fillRect(33, 28, 1, 1);
            ctx.fillRect(31, 32, 2, 3); // Fechadura
        }

        for (let x = 0; x < size; x += 8) {
            ctx.fillStyle = (x / 8) % 2 === 0 ? '#e0a916' : '#222';
            ctx.fillRect(x, 0, 8, 4);
        }

        return this.getPixelData(ctx);
    }

    createBunkerWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#4a5056';
        ctx.fillRect(0, 0, size, size);

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const noise = (Math.random() - 0.5) * 35;
                const c = Math.floor(75 + noise);
                ctx.fillStyle = `rgb(${c}, ${c + 4}, ${c + 8})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        ctx.strokeStyle = '#2b3035';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
        ctx.strokeRect(0, 0, size, size / 2);

        ctx.fillStyle = '#1c2024';
        [4, size - 4].forEach(x => {
            [4, size / 2 - 4, size / 2 + 4, size - 4].forEach(y => {
                ctx.fillRect(x - 1, y - 1, 3, 3);
                ctx.fillStyle = '#838d96';
                ctx.fillRect(x, y, 1, 1);
                ctx.fillStyle = '#1c2024';
            });
        });

        ctx.strokeStyle = '#202428';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, 10); ctx.lineTo(24, 22); ctx.lineTo(20, 32);
        ctx.stroke();

        return this.getPixelData(ctx);
    }

    createTrenchWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#4a2f1b';
        ctx.fillRect(0, 0, size, size);

        const plankHeight = 16;
        for (let y = 0; y < size; y += plankHeight) {
            const tone = (y / plankHeight) % 2 === 0 ? '#5a3d24' : '#452a16';
            ctx.fillStyle = tone;
            ctx.fillRect(0, y, size, plankHeight);

            for (let i = 0; i < 8; i++) {
                const grainY = y + Math.floor(Math.random() * plankHeight);
                ctx.fillStyle = 'rgba(25, 12, 5, 0.4)';
                ctx.fillRect(0, grainY, size, 1);
            }

            ctx.fillStyle = '#1f0f05';
            ctx.fillRect(0, y, size, 2);
            ctx.fillStyle = 'rgba(255, 200, 150, 0.15)';
            ctx.fillRect(0, y + 2, size, 1);

            [8, 32, 56].forEach(px => {
                ctx.fillStyle = '#111';
                ctx.fillRect(px, y + 6, 2, 2);
            });
        }

        for (let x = 0; x < size; x++) {
            const mudHeight = 12 + Math.sin(x * 0.3) * 6;
            ctx.fillStyle = '#26170d';
            ctx.fillRect(x, size - mudHeight, 1, mudHeight);
        }

        return this.getPixelData(ctx);
    }

    createStoneWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#2d2f33';
        ctx.fillRect(0, 0, size, size);

        const rows = 4;
        const h = size / rows;
        for (let r = 0; r < rows; r++) {
            const y = r * h;
            const cols = 2;
            const w = size / cols;
            const xOffset = (r % 2) * (w / 2);

            for (let c = -1; c <= cols; c++) {
                const x = c * w + xOffset;
                const stoneTone = 90 + Math.floor(Math.random() * 30);
                ctx.fillStyle = `rgb(${stoneTone}, ${stoneTone - 5}, ${stoneTone - 12})`;
                ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(x + 2, y + 2, w - 4, 2);
                ctx.fillRect(x + 2, y + 2, 2, h - 4);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(x + 2, y + h - 4, w - 4, 2);
                ctx.fillRect(x + w - 4, y + 2, 2, h - 4);
            }
        }
        return this.getPixelData(ctx);
    }

    createCommandWall() {
        return this.createNaziBannerWall();
    }

    createSecretWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        const bunkerData = this.createDirtyConcreteWall();
        ctx.putImageData(bunkerData, 0, 0);

        ctx.strokeStyle = '#7c9a6f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(28, 38);
        ctx.bezierCurveTo(34, 30, 26, 26, 32, 20);
        ctx.stroke();

        ctx.fillStyle = '#5a3d24';
        ctx.fillRect(33, 21, 4, 2);
        ctx.fillStyle = 'rgba(220, 220, 220, 0.7)';
        ctx.fillRect(37, 18, 2, 2);
        ctx.fillRect(39, 15, 2, 2);

        return this.getPixelData(ctx);
    }

    createExitWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#1e2b1e';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#4e704e';
        ctx.lineWidth = 2;
        for (let x = 8; x < size; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, 4); ctx.lineTo(x, size - 4);
            ctx.stroke();
        }

        ctx.fillStyle = '#1a401c';
        ctx.fillRect(8, 18, 48, 20);
        ctx.fillStyle = '#e8f5e9';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('SAÍDA / EXIT', 10, 31);

        return this.getPixelData(ctx);
    }

    createFloorTrench() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#281a10';
        ctx.fillRect(0, 0, size, size);

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const rand = Math.random();
                if (rand > 0.88) {
                    ctx.fillStyle = 'rgba(230, 238, 245, 0.75)';
                    ctx.fillRect(x, y, 1, 1);
                } else if (rand < 0.2) {
                    ctx.fillStyle = '#190e07';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        return this.getPixelData(ctx);
    }

    createFloorBunker() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#26292c';
        ctx.fillRect(0, 0, size, size);

        const tileSize = 16;
        for (let x = 0; x < size; x += tileSize) {
            for (let y = 0; y < size; y += tileSize) {
                ctx.strokeStyle = '#181a1c';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, tileSize, tileSize);
                ctx.fillStyle = '#31353a';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
            }
        }
        return this.getPixelData(ctx);
    }

    createCeilingSky() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#3e4652';
        ctx.fillRect(0, 0, size, size);

        for (let y = 0; y < size; y++) {
            const grad = y / size;
            ctx.fillStyle = `rgba(30, 36, 45, ${grad * 0.6})`;
            ctx.fillRect(0, y, size, 1);
        }
        return this.getPixelData(ctx);
    }

    createCeilingBunker() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#1e2124';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#121416';
        ctx.fillRect(0, 14, size, 6);
        ctx.fillRect(0, 44, size, 6);

        ctx.fillStyle = '#3a4047';
        ctx.fillRect(20, 0, 10, size);
        ctx.fillStyle = '#555e69';
        ctx.fillRect(22, 0, 2, size);

        return this.getPixelData(ctx);
    }
}
