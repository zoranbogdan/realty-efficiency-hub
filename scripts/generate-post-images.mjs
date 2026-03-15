import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const WIDTH = 1600;
const HEIGHT = 900;

const specs = [
  {
    slug: 'open-house-lead-automation-cover',
    accent: [29, 78, 216],
    altAccent: [14, 116, 144],
  },
  {
    slug: 'open-house-lead-automation-kpi',
    accent: [15, 118, 110],
    altAccent: [30, 58, 138],
  },
  {
    slug: 'real-estate-listing-description-prompts-cover',
    accent: [67, 56, 202],
    altAccent: [29, 78, 216],
  },
];

const clamp = (n) => Math.max(0, Math.min(255, n));

function drawImage(accent, altAccent) {
  const data = Buffer.alloc(WIDTH * HEIGHT * 3);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const t = x / WIDTH;
      const v = y / HEIGHT;

      let r = 238 + 10 * t;
      let g = 244 + 8 * t;
      let b = 252 - 3 * t;

      const dx = x - WIDTH * 0.82;
      const dy = y - HEIGHT * 0.16;
      const d = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 1 - d / 520);

      r += accent[0] * 0.24 * glow;
      g += accent[1] * 0.24 * glow;
      b += accent[2] * 0.24 * glow;

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

  // top accent bar
  for (let y = panelY + 34; y < panelY + 50; y += 1) {
    for (let x = panelX + 44; x < panelX + panelW - 44; x += 1) {
      const id = (y * WIDTH + x) * 3;
      data[id] = accent[0];
      data[id + 1] = accent[1];
      data[id + 2] = accent[2];
    }
  }

  // content stripes
  const stripeY = [250, 330, 410, 490];
  const stripeW = [930, 760, 840, 690];
  for (let i = 0; i < stripeY.length; i += 1) {
    for (let y = stripeY[i]; y < stripeY[i] + 28; y += 1) {
      for (let x = panelX + 44; x < panelX + 44 + stripeW[i]; x += 1) {
        const id = (y * WIDTH + x) * 3;
        data[id] = 30;
        data[id + 1] = 41;
        data[id + 2] = 59;
      }
    }
  }

  // right decorative blocks
  for (let y = 250; y < 620; y += 1) {
    for (let x = WIDTH - 500; x < WIDTH - 220; x += 1) {
      const id = (y * WIDTH + x) * 3;
      const mix = ((x + y) % 80) / 80;
      data[id] = clamp(accent[0] * (0.45 + mix * 0.3));
      data[id + 1] = clamp(accent[1] * (0.45 + mix * 0.3));
      data[id + 2] = clamp(accent[2] * (0.45 + mix * 0.3));
    }
  }

  for (let y = 620; y < 760; y += 1) {
    for (let x = WIDTH - 500; x < WIDTH - 220; x += 1) {
      const id = (y * WIDTH + x) * 3;
      data[id] = altAccent[0];
      data[id + 1] = altAccent[1];
      data[id + 2] = altAccent[2];
    }
  }

  return data;
}

mkdirSync('public/images/posts', { recursive: true });
mkdirSync('/tmp/post-images', { recursive: true });

for (const spec of specs) {
  const ppm = join('/tmp/post-images', `${spec.slug}.ppm`);
  const webp = join('public/images/posts', `${spec.slug}.webp`);

  const rgb = drawImage(spec.accent, spec.altAccent);
  const header = Buffer.from(`P6\n${WIDTH} ${HEIGHT}\n255\n`, 'ascii');
  writeFileSync(ppm, Buffer.concat([header, rgb]));

  execSync(`cwebp -quiet -q 84 "${ppm}" -o "${webp}"`);
  console.log(`generated ${webp}`);
}
