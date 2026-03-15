import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const manifestPath = 'docs/post-image-manifest.json';
if (!existsSync(manifestPath)) {
  console.error(`Missing manifest: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const posts = Array.isArray(manifest.posts) ? manifest.posts : [];

for (const post of posts) {
  const slug = post.slug;
  const file = `src/content/blog/${slug}.md`;
  if (!existsSync(file)) {
    console.warn(`skip missing markdown: ${file}`);
    continue;
  }

  const cover = (post.images || []).find((img) => img.kind === 'cover');
  if (!cover || !cover.file) continue;

  const imageUrl = `/${cover.file.replace(/^public\//, '')}`;
  const alt = `${post.title} cover image`;

  const original = readFileSync(file, 'utf8');
  const match = original.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    console.warn(`skip invalid frontmatter: ${file}`);
    continue;
  }

  let frontmatter = match[1];
  let body = match[2];

  if (!/^coverImage:/m.test(frontmatter)) {
    if (/^contentType:/m.test(frontmatter)) {
      frontmatter = frontmatter.replace(/^contentType:\s*.*$/m, (line) => `${line}\ncoverImage: "${imageUrl}"`);
    } else {
      frontmatter += `\ncoverImage: "${imageUrl}"`;
    }
  } else {
    frontmatter = frontmatter.replace(/^coverImage:\s*.*$/m, `coverImage: "${imageUrl}"`);
  }

  if (!body.includes(`(${imageUrl})`)) {
    const imageMarkdown = `![${alt}](${imageUrl})\n\n`;
    const dividerIndex = body.indexOf('\n---\n');
    if (dividerIndex !== -1) {
      body = body.slice(0, dividerIndex + 1) + imageMarkdown + body.slice(dividerIndex + 1);
    } else {
      body = `${imageMarkdown}${body}`;
    }
  }

  const next = `---\n${frontmatter}\n---\n${body}`;
  if (next !== original) {
    writeFileSync(file, next, 'utf8');
    console.log(`updated ${file}`);
  }
}
