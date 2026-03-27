import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const outputFile = path.join(distDir, "sitemap.xml");
const defaultSiteUrl = "https://realtyefficiencyhub.com";
const siteUrl = (process.env.SITE_URL || defaultSiteUrl).replace(/\/+$/, "");
const blogDir = path.resolve("src/content/blog");
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Amsterdam",
}).format(new Date());

function readFrontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : null;
}

function getBlogLastModMap() {
  if (!fs.existsSync(blogDir)) {
    return { lastModMap: new Map(), futurePaths: new Set() };
  }

  const entries = fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

  const lastModMap = new Map();
  const futurePaths = new Set();

  entries.forEach((entry) => {
    const source = fs.readFileSync(path.join(blogDir, entry.name), "utf8");
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? "";
    const slug = entry.name.replace(/\.md$/, "");
    const pubDate = readFrontmatterValue(frontmatter, "pubDate");
    const urlPath = `/blog/${slug}/`;

    if (pubDate && pubDate > today) {
      futurePaths.add(urlPath);
      return;
    }

    lastModMap.set(urlPath, pubDate ?? "");
  });

  return { lastModMap, futurePaths };
}

const { lastModMap: blogLastModMap, futurePaths: futureBlogPaths } =
  getBlogLastModMap();

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

function normalizeUrlPath(urlPath) {
  if (urlPath === "/") return urlPath;
  return urlPath.endsWith("/") ? urlPath : `${urlPath}/`;
}

if (!fs.existsSync(distDir)) {
  throw new Error("[sitemap] dist/ not found. Run the Astro build first.");
}

const htmlFiles = walkHtmlFiles(distDir)
  .filter((file) => !file.endsWith("/404.html"))
  .filter((file) => !futureBlogPaths.has(normalizeUrlPath(fileToUrlPath(file))))
  .sort((a, b) => a.localeCompare(b));

const urlEntries = htmlFiles.map((file) => {
  const urlPath = fileToUrlPath(file);
  const normalizedPath = normalizeUrlPath(urlPath);
  const lastMod = blogLastModMap.get(normalizedPath);

  const lastModTag = lastMod ? `\n    <lastmod>${lastMod}</lastmod>` : "";

  return `  <url>\n    <loc>${escapeXml(`${siteUrl}${urlPath}`)}</loc>${lastModTag}\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>\n`;

fs.writeFileSync(outputFile, xml, "utf8");
console.log(`[sitemap] Wrote ${outputFile} with ${urlEntries.length} URLs.`);
