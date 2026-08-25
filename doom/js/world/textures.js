/**
 * Gerador Procedural de Texturas Pixel Art 64x64
 * Cria texturas retrô em alta performance sem necessidade de downloads de imagem.
 */
export class TextureManager {
    constructor() {
        this.textures = {};
        this.textureSize = 64;
    }

    init() {
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

    // Parede de Concreto de Bunker (Cinza escuro, rebites, rachaduras)
    createBunkerWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Base cinza concreto
        ctx.fillStyle = '#4a5056';
        ctx.fillRect(0, 0, size, size);

        // Ruído e granulação de concreto
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const noise = (Math.random() - 0.5) * 35;
                const c = Math.floor(75 + noise);
                ctx.fillStyle = `rgb(${c}, ${c + 4}, ${c + 8})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        // Placas de aço / juntas de concreto
        ctx.strokeStyle = '#2b3035';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
        ctx.strokeRect(0, 0, size, size / 2);

        // Rebites nas bordas
        ctx.fillStyle = '#1c2024';
        [4, size - 4].forEach(x => {
            [4, size / 2 - 4, size / 2 + 4, size - 4].forEach(y => {
                ctx.fillRect(x - 1, y - 1, 3, 3);
                ctx.fillStyle = '#838d96';
                ctx.fillRect(x, y, 1, 1);
                ctx.fillStyle = '#1c2024';
            });
        });

        // Rachaduras sutis
        ctx.strokeStyle = '#202428';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, 10);
        ctx.lineTo(24, 22);
        ctx.lineTo(20, 32);
        ctx.stroke();

        return this.getPixelData(ctx);
    }

    // Parede de Trincheira (Pranchas de madeira, lama e sacos de areia)
    createTrenchWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Base marrom madeira
        ctx.fillStyle = '#4a2f1b';
        ctx.fillRect(0, 0, size, size);

        // Pranchas horizontais de madeira
        const plankHeight = 16;
        for (let y = 0; y < size; y += plankHeight) {
            // Variação de cor da madeira
            const tone = (y / plankHeight) % 2 === 0 ? '#5a3d24' : '#452a16';
            ctx.fillStyle = tone;
            ctx.fillRect(0, y, size, plankHeight);

            // Veios da madeira
            for (let i = 0; i < 8; i++) {
                const grainY = y + Math.floor(Math.random() * plankHeight);
                ctx.fillStyle = 'rgba(25, 12, 5, 0.4)';
                ctx.fillRect(0, grainY, size, 1);
            }

            // Linha de sombra entre as pranchas
            ctx.fillStyle = '#1f0f05';
            ctx.fillRect(0, y, size, 2);
            ctx.fillStyle = 'rgba(255, 200, 150, 0.15)';
            ctx.fillRect(0, y + 2, size, 1);

            // Pregos de fixação
            [8, 32, 56].forEach(px => {
                ctx.fillStyle = '#111';
                ctx.fillRect(px, y + 6, 2, 2);
            });
        }

        // Lama respingada na parte inferior
        for (let x = 0; x < size; x++) {
            const mudHeight = 12 + Math.sin(x * 0.3) * 6;
            ctx.fillStyle = '#26170d';
            ctx.fillRect(x, size - mudHeight, 1, mudHeight);
        }

        return this.getPixelData(ctx);
    }

    // Parede de Pedra de Vila Italiana (Monte Castello / Linha Gótica)
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

                // Luz e sombra do tijolo
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

    // Parede do Posto de Comando Nazista (Painéis de madeira escura com estandarte vermelho)
    createCommandWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Fundo de painéis de madeira nobre de bunker / castelo
        ctx.fillStyle = '#3a2012';
        ctx.fillRect(0, 0, size, size);

        // Molduras e reentrâncias de madeira
        ctx.strokeStyle = '#221209';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        ctx.strokeRect(8, 8, size - 16, size - 16);

        // Estandarte vermelho militar central longo
        ctx.fillStyle = '#b81414';
        ctx.fillRect(14, 2, 36, 60);
        ctx.strokeStyle = '#5a0808';
        ctx.lineWidth = 1;
        ctx.strokeRect(14, 2, 36, 60);

        // Círculo branco central
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.arc(32, 28, 12, 0, Math.PI * 2);
        ctx.fill();

        // Suástica autêntica preta no centro do círculo
        ctx.fillStyle = '#0f1112';
        // Cruz central
        ctx.fillRect(30, 20, 4, 16);
        ctx.fillRect(24, 26, 16, 4);
        // Hastes angulares
        ctx.fillRect(34, 20, 6, 3);
        ctx.fillRect(24, 20, 3, 6);
        ctx.fillRect(24, 33, 6, 3);
        ctx.fillRect(37, 30, 3, 6);

        // Franjas douradas na base do estandarte
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(14, 60, 36, 3);

        return this.getPixelData(ctx);
    }

    // Porta de Bunker (Normal, Trancada Ferro, Trancada Ouro)
    createDoor(type = 'normal') {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Base de aço escovado pesado
        ctx.fillStyle = '#5c646b';
        ctx.fillRect(0, 0, size, size);

        // Moldura e painéis metálicos
        ctx.fillStyle = '#42484f';
        ctx.fillRect(6, 6, 52, 24);
        ctx.fillRect(6, 34, 52, 24);

        // Sombreamento nos painéis
        ctx.strokeStyle = '#272b30';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, 52, 24);
        ctx.strokeRect(6, 34, 52, 24);

        // Volante / Maçaneta de submarino/bunker
        ctx.fillStyle = '#8e98a2';
        ctx.beginPath();
        ctx.arc(48, 32, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#202326';
        ctx.fillRect(47, 31, 2, 2);

        // Tranca especial
        if (type === 'iron') {
            // Cadeado de Ferro com chaveiro azul/prata
            ctx.fillStyle = '#3a86ff';
            ctx.fillRect(24, 26, 16, 12);
            ctx.strokeStyle = '#202326';
            ctx.strokeRect(24, 26, 16, 12);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(30, 22, 4, 4); // Arco
            ctx.fillStyle = '#111';
            ctx.fillRect(31, 31, 2, 4); // Fechadura
        } else if (type === 'gold') {
            // Cadeado Dourado
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(24, 26, 16, 12);
            ctx.strokeStyle = '#b58300';
            ctx.strokeRect(24, 26, 16, 12);
            ctx.fillStyle = '#ffbe0b';
            ctx.fillRect(30, 22, 4, 4); // Arco dourado
            ctx.fillStyle = '#473200';
            ctx.fillRect(31, 31, 2, 4); // Fechadura
        }

        // Listras de advertência amarelas e pretas no topo
        for (let x = 0; x < size; x += 8) {
            ctx.fillStyle = (x / 8) % 2 === 0 ? '#e0a916' : '#222';
            ctx.fillRect(x, 0, 8, 4);
        }

        return this.getPixelData(ctx);
    }

    // Parede Secreta (Parece concreto comum, mas com marcação sutil da FEB - Fumaça de Cobra!)
    createSecretWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        // Base de bunker
        const bunkerData = this.createBunkerWall();
        ctx.putImageData(bunkerData, 0, 0);

        // Grafite sutil riscado na parede: Uma cobrinha fumando cachimbo
        ctx.strokeStyle = '#7c9a6f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Curva da cobra
        ctx.moveTo(28, 38);
        ctx.bezierCurveTo(34, 30, 26, 26, 32, 20);
        ctx.stroke();
        // Cachimbo e fumaça
        ctx.fillStyle = '#5a3d24';
        ctx.fillRect(33, 21, 4, 2);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.fillRect(37, 18, 2, 2);
        ctx.fillRect(39, 15, 2, 2);

        return this.getPixelData(ctx);
    }

    // Parede de Saída / Vitória (Elevador / Rádio de Comunicação Aliada)
    createExitWall() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#223022';
        ctx.fillRect(0, 0, size, size);

        // Grade de elevador militar
        ctx.strokeStyle = '#4e704e';
        ctx.lineWidth = 2;
        for (let x = 8; x < size; x += 8) {
            ctx.beginPath();
            ctx.moveTo(x, 4);
            ctx.lineTo(x, size - 4);
            ctx.stroke();
        }

        // Placa "OBJETIVO CUMPRIDO - FEB"
        ctx.fillStyle = '#1e4620';
        ctx.fillRect(10, 18, 44, 18);
        ctx.fillStyle = '#e8f5e9';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('SAÍDA / EXIT', 12, 30);

        return this.getPixelData(ctx);
    }

    // Chão de Trincheira (Lama e Neve)
    createFloorTrench() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#281a10';
        ctx.fillRect(0, 0, size, size);

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                const rand = Math.random();
                if (rand > 0.88) {
                    // Manchas de neve de inverno nos Apeninos
                    ctx.fillStyle = 'rgba(230, 238, 245, 0.75)';
                    ctx.fillRect(x, y, 1, 1);
                } else if (rand < 0.2) {
                    // Lama profunda
                    ctx.fillStyle = '#190e07';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        return this.getPixelData(ctx);
    }

    // Chão de Bunker (Ladrilhos industriais escuros)
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
                // Centro do ladrilho
                ctx.fillStyle = '#31353a';
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
            }
        }
        return this.getPixelData(ctx);
    }

    // Teto Aberto / Céu Nublado de Inverno na Itália
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

    // Teto de Bunker (Tubulações e vigas de ferro)
    createCeilingBunker() {
        const { canvas, ctx } = this.createCanvas();
        const size = this.textureSize;

        ctx.fillStyle = '#1e2124';
        ctx.fillRect(0, 0, size, size);

        // Vigas de ferro
        ctx.fillStyle = '#121416';
        ctx.fillRect(0, 14, size, 6);
        ctx.fillRect(0, 44, size, 6);

        // Tubulação de ventilação
        ctx.fillStyle = '#3a4047';
        ctx.fillRect(20, 0, 10, size);
        ctx.fillStyle = '#555e69';
        ctx.fillRect(22, 0, 2, size);

        return this.getPixelData(ctx);
    }
}
