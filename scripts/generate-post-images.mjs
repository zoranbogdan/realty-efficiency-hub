import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const WIDTH = 1600;
const HEIGHT = 900;
const MANIFEST_PATH = 'docs/post-image-manifest.json';

const args = process.argv.slice(2);
const slugArg = args.find((arg) => arg.startsWith('--slug='));
const slugFilter = slugArg ? slugArg.split('=')[1]?.trim() : null;
const missingOnly = args.includes('--missing-only');

const clamp = (n) => Math.max(0, Math.min(255, n));

const hexToRgb = (hex) => {
  const cleaned = hex.replace('#', '').trim();
  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ];
};

const hashText = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const pickPalette = (post) => {
  if (post.pillar === 'AI Prompts') {
    return [hexToRgb('#4338CA'), hexToRgb('#1D4ED8')];
  }

  if (post.content_type === 'Comparison Article') {
    return [hexToRgb('#1E40AF'), hexToRgb('#0F766E')];
  }

  return [hexToRgb('#1D4ED8'), hexToRgb('#0F766E')];
};

function drawImage(accent, altAccent, seed) {
  const data = Buffer.alloc(WIDTH * HEIGHT * 3);
  const variant = (seed % 5) + 1;

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const t = x / WIDTH;
      let r = 238 + 10 * t;
      let g = 244 + 8 * t;
      let b = 252 - 3 * t;

      const dx = x - WIDTH * (0.78 + (variant - 3) * 0.01);
      const dy = y - HEIGHT * (0.18 + (variant - 3) * 0.01);
      const d = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - d / (500 + variant * 24));

      r += accent[0] * 0.23 * glow;
      g += accent[1] * 0.23 * glow;
      b += accent[2] * 0.23 * glow;

      const id = (y * WIDTH + x) * 3;
      data[id] = clamp(r);
      data[id + 1] = clamp(g);
      data[id + 2] = clamp(b);
    }
  }

  const panelX = 86;
  const panelY = 84;
  const panelW = WIDTH - 172;
  const panelH = HEIGHT - 168;

  for (let y = panelY; y < panelY + panelH; y += 1) {
    for (let x = panelX; x < panelX + panelW; x += 1) {
      const id = (y * WIDTH + x) * 3;
      data[id] = 252;
      data[id + 1] = 253;
      data[id + 2] = 255;
    }
  }

  for (let y = panelY + 34; y < panelY + 50; y += 1) {
    for (let x = panelX + 44; x < panelX + panelW - 44; x += 1) {
      const id = (y * WIDTH + x) * 3;
      data[id] = accent[0];
      data[id + 1] = accent[1];
      data[id + 2] = accent[2];
    }
  }

  const stripeY = [250, 330, 410, 490];
  const stripeW = [930, 760, 840, 690];
  const widthOffset = (seed % 120) - 60;

  for (let i = 0; i < stripeY.length; i += 1) {
    for (let y = stripeY[i]; y < stripeY[i] + 28; y += 1) {
      for (let x = panelX + 44; x < panelX + 44 + stripeW[i] + widthOffset * (i % 2 ? 1 : -1); x += 1) {
        const id = (y * WIDTH + x) * 3;
        data[id] = 30;
        data[id + 1] = 41;
        data[id + 2] = 59;
      }
    }
  }

  const rightX0 = WIDTH - 500;
  const rightX1 = WIDTH - 220;

  for (let y = 250; y < 620; y += 1) {
    for (let x = rightX0; x < rightX1; x += 1) {
      const id = (y * WIDTH + x) * 3;
      const mix = ((x + y + seed) % 84) / 84;
      data[id] = clamp(accent[0] * (0.45 + mix * 0.3));
      data[id + 1] = clamp(accent[1] * (0.45 + mix * 0.3));
      data[id + 2] = clamp(accent[2] * (0.45 + mix * 0.3));
    }
  }

  for (let y = 620; y < 760; y += 1) {
    for (let x = rightX0; x < rightX1; x += 1) {
      const id = (y * WIDTH + x) * 3;
      data[id] = altAccent[0];
      data[id + 1] = altAccent[1];
      data[id + 2] = altAccent[2];
    }
  }

  return data;
}

if (!existsSync(MANIFEST_PATH)) {
  console.error(`Missing manifest: ${MANIFEST_PATH}`);
  process.exit(1);
}

if (!existsSync('/opt/homebrew/bin/cwebp') && !existsSync('/usr/bin/cwebp')) {
  try {
    execSync('command -v cwebp', { stdio: 'ignore' });
  } catch {
    console.error('cwebp is required but not found in PATH.');
    process.exit(1);
  }
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const posts = Array.isArray(manifest.posts) ? manifest.posts : [];

const selectedPosts = slugFilter
  ? posts.filter((post) => post.slug === slugFilter)
  : posts;

if (slugFilter && selectedPosts.length === 0) {
  console.error(`No post found in manifest with slug: ${slugFilter}`);
  process.exit(1);
}

mkdirSync('/tmp/post-images', { recursive: true });

let generated = 0;
let skipped = 0;

for (const post of selectedPosts) {
  const [accent, altAccent] = pickPalette(post);
  const images = Array.isArray(post.images) ? post.images : [];

  for (const image of images) {
    const outputFile = image.file;
    if (!outputFile || !outputFile.endsWith('.webp')) continue;

    if (missingOnly && existsSync(outputFile)) {
      skipped += 1;
      continue;
    }

    mkdirSync(dirname(outputFile), { recursive: true });

    const seed = hashText(`${post.slug}:${image.kind || 'cover'}:${image.short_title || ''}`);
    const rgb = drawImage(accent, altAccent, seed);

    const tempFile = join('/tmp/post-images', `${post.slug}-${image.kind || 'cover'}.ppm`);
    const header = Buffer.from(`P6\n${WIDTH} ${HEIGHT}\n255\n`, 'ascii');
    writeFileSync(tempFile, Buffer.concat([header, rgb]));

    execSync(`cwebp -quiet -q 84 "${tempFile}" -o "${outputFile}"`);
    generated += 1;
    console.log(`generated ${outputFile}`);
  }
}

console.log(`done: generated=${generated}, skipped=${skipped}`);
