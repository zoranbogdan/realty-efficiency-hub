import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const outputFile = path.join(distDir, "sitemap.xml");
const defaultSiteUrl = "https://realtyefficiencyhub.com";
const siteUrl = (process.env.SITE_URL || defaultSiteUrl).replace(/\/+$/, "");

function walkHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    files.push(fullPath);
  }

  return files;
}

function fileToUrlPath(filePath) {
  const relative = path.relative(distDir, filePath).replace(/\\/g, "/");

  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"/index.html".length)}/`;
  }

  return `/${relative.replace(/\.html$/, "")}`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

if (!fs.existsSync(distDir)) {
  throw new Error("[sitemap] dist/ not found. Run the Astro build first.");
}

const htmlFiles = walkHtmlFiles(distDir)
  .filter((file) => !file.endsWith("/404.html"))
  .sort((a, b) => a.localeCompare(b));

const urlEntries = htmlFiles.map((file) => {
  const urlPath = fileToUrlPath(file);
  const stat = fs.statSync(file);
  const lastMod = stat.mtime.toISOString().slice(0, 10);

  return `  <url>\n    <loc>${escapeXml(`${siteUrl}${urlPath}`)}</loc>\n    <lastmod>${lastMod}</lastmod>\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>\n`;

fs.writeFileSync(outputFile, xml, "utf8");
console.log(`[sitemap] Wrote ${outputFile} with ${urlEntries.length} URLs.`);
