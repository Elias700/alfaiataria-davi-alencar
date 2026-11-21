// Gera as imagens otimizadas do site a partir dos originais em assets-src/.
// Uso: npm run images
// Saída: public/images/<nome>-<largura>.webp, ícones/favicons e og-image em public/.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SRC = 'assets-src';
const OUT = 'public/images';
const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];
const NAVY = '#040b25';

/** Fotos de conteúdo: nome de saída → arquivo original. */
const PHOTOS = {
  'davi-terno-azul-marinho-atelie': 'davi-terno-azul-marinho-atelie.jpg',
  'davi-terno-cinza-tesoura': 'davi-terno-cinza-tesoura.jpg',
  'camisa-azul-marinho-etiqueta': 'camisa-azul-marinho-etiqueta.webp',
  'camisa-listrada-azul-etiqueta': 'camisa-listrada-azul-etiqueta.webp',
  // Ensaio fotográfico (originais 4016×6016).
  'davi-terno-azul-xadrez-atelie': 'davi-terno-azul-xadrez-atelie.jpg',
  'davi-terno-cinza-colete-trespassado-atelie': 'davi-terno-cinza-colete-trespassado-atelie.jpg',
  'terno-cinza-colete-trespassado-detalhe': 'terno-cinza-colete-trespassado-detalhe.jpg',
  'davi-terno-cinza-fita-metrica': 'davi-terno-cinza-fita-metrica.jpg',
  'davi-terno-cinza-fita-metrica-sorrindo': 'davi-terno-cinza-fita-metrica-sorrindo.jpg',
  'davi-polo-azul-marinho': 'davi-polo-azul-marinho.jpg',
  'davi-polo-verde': 'davi-polo-verde.jpg',
  // Imagens de ambientação do ateliê (still life).
  'atelie-paleto-azul-marinho-dobrado': 'atelie-paleto-azul-marinho-dobrado.png',
  'atelie-botoes-dourados': 'atelie-botoes-dourados.png',
  'atelie-tecidos-e-ferramentas': 'atelie-tecidos-e-ferramentas.png',
};

/**
 * Recortes feitos direto dos originais em alta resolução (em vez de zoom via CSS, que estica pixels).
 * cx/cy: centro do recorte (fração do original) · w: largura (fração) · aspect: largura/altura.
 */
const CROPS = {
  // Janela em tela cheia da seção "A camisa": colarinho, gravata e fita métrica.
  'camisa-branca-colarinho-panoramica': {
    file: 'davi-terno-cinza-fita-metrica-sorrindo.jpg',
    cx: 0.5,
    cy: 0.62,
    w: 1,
    aspect: 1.6,
  },
  // Texturas da seção "O toque vem primeiro" (quadro 4:5).
  'textura-xadrez-azul': {
    file: 'davi-terno-azul-xadrez-atelie.jpg',
    cx: 0.5,
    cy: 0.74,
    w: 0.34,
    aspect: 0.8,
  },
  'textura-cinza-lapela': {
    file: 'terno-cinza-colete-trespassado-detalhe.jpg',
    cx: 0.2,
    cy: 0.22,
    w: 0.34,
    aspect: 0.8,
  },
  'textura-camisa-branca-gravata': {
    file: 'davi-terno-cinza-fita-metrica.jpg',
    cx: 0.5,
    cy: 0.56,
    w: 0.36,
    aspect: 0.8,
  },
};

/** Gera todas as larguras: quando o original é menor, o arquivo da largura maior recebe o
 * original sem ampliar, para o loader (app.config.ts) nunca apontar para um arquivo inexistente. */
async function writeWidths(name, makeInput) {
  for (const w of WIDTHS) {
    await (await makeInput())
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6, smartSubsample: true })
      .toFile(`${OUT}/${name}-${w}.webp`);
  }
  console.log('foto', name);
}

async function photos() {
  for (const [name, file] of Object.entries(PHOTOS)) {
    await writeWidths(name, () => sharp(`${SRC}/${file}`).rotate());
  }
  for (const [name, c] of Object.entries(CROPS)) {
    const input = `${SRC}/${c.file}`;
    const { width: W = 0, height: H = 0 } = await sharp(input).metadata();
    const width = Math.round(W * c.w);
    const height = Math.round(width / c.aspect);
    const left = Math.max(0, Math.min(W - width, Math.round(W * c.cx - width / 2)));
    const top = Math.max(0, Math.min(H - height, Math.round(H * c.cy - height / 2)));
    // Extrai para buffer antes de redimensionar (sharp aplica extract/resize numa ordem fixa).
    const cropped = await sharp(input).rotate().extract({ left, top, width, height }).toBuffer();
    await writeWidths(name, () => sharp(cropped));
  }
}

/** Monograma branco com transparência, recortado nas bordas. Usado como máscara CSS. */
async function monogram() {
  const trimmed = await sharp(`${SRC}/monograma-da.png`).trim().png().toBuffer();
  for (const w of [256, 768]) {
    await sharp(trimmed)
      .resize({ width: w, height: w, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90, alphaQuality: 90 })
      .toFile(`${OUT}/monograma-da-${w}.webp`);
  }
  console.log('monograma');
  return trimmed;
}

/** Monograma branco centralizado num quadrado azul-marinho (opcionalmente circular). */
async function iconPng(trimmed, size, { circle = false, padding = 0.2 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const mono = await sharp(trimmed)
    .resize({
      width: inner,
      height: inner,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const bg = circle
    ? Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${NAVY}"/></svg>`,
      )
    : { create: { width: size, height: size, channels: 4, background: NAVY } };
  const base = Buffer.isBuffer(bg) ? sharp(bg) : sharp(bg);
  return base
    .composite([{ input: mono, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO com PNGs embutidos (formato aceito por todos os navegadores atuais). */
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

async function icons(trimmed) {
  const p16 = await iconPng(trimmed, 16, { circle: true, padding: 0.12 });
  const p32 = await iconPng(trimmed, 32, { circle: true, padding: 0.14 });
  const p48 = await iconPng(trimmed, 48, { circle: true, padding: 0.16 });
  await writeFile(
    'public/favicon.ico',
    toIco([
      { size: 16, data: p16 },
      { size: 32, data: p32 },
      { size: 48, data: p48 },
    ]),
  );
  await writeFile('public/apple-touch-icon.png', await iconPng(trimmed, 180, { padding: 0.18 }));
  await writeFile('public/icon-192.png', await iconPng(trimmed, 192, { padding: 0.2 }));
  await writeFile('public/icon-512.png', await iconPng(trimmed, 512, { padding: 0.2 }));
  await writeFile('public/icon-maskable-512.png', await iconPng(trimmed, 512, { padding: 0.28 }));

  // favicon.svg: não temos o monograma em vetor; o SVG embute um PNG pequeno sobre um círculo vetorial.
  const mono64 = await sharp(trimmed)
    .resize({ width: 64, height: 64, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${NAVY}"/><image x="16" y="16" width="68" height="68" href="data:image/png;base64,${mono64.toString('base64')}"/></svg>`;
  await writeFile('public/favicon.svg', svg);
  console.log('ícones');
}

/** Imagem de compartilhamento 1200×630: fundo marinho, monograma dourado à esquerda e foto do hero à direita. */
async function ogImage(trimmed) {
  const W = 1200;
  const H = 630;
  const photo = await sharp(`${SRC}/davi-terno-azul-xadrez-atelie.jpg`)
    .resize({ width: 560, height: H, fit: 'cover', position: 'attention' })
    .toBuffer();
  const monoMask = await sharp(trimmed)
    .resize({ width: 300, height: 300, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const gold = await sharp({
    create: { width: 300, height: 300, channels: 4, background: '#bca360' },
  })
    .composite([{ input: monoMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: NAVY } })
    .composite([
      { input: gold, left: 170, top: 165 },
      { input: photo, left: W - 560, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile('public/og-image.jpg');
  console.log('og-image');
}

if (!existsSync(SRC)) throw new Error('Pasta assets-src/ não encontrada');
await mkdir(OUT, { recursive: true });
await photos();
const trimmed = await monogram();
await icons(trimmed);
await ogImage(trimmed);
