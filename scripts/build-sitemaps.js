#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const BASE_URL = process.env.SITE_BASE_URL || 'https://ospreyexterior.com';
const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules']);
const LOCATION_SEGMENTS = ['service-areas', 'pages', 'holiday-lighting'];

const formatDate = (date) => date.toISOString().split('T')[0];

function isIndexFile(filePath) {
  return filePath.endsWith('index.html');
}

function toWebPath(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  if (isIndexFile(normalized)) {
    const withoutIndex = normalized.slice(0, -'index.html'.length);
    return withoutIndex === '' ? '/' : `/${withoutIndex}`;
  }
  return `/${normalized}`;
}

function classifyPath(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  return LOCATION_SEGMENTS.some((segment) => normalized.startsWith(`${segment}/`))
    ? 'location'
    : 'main';
}

async function getLastModifiedDate(filePath) {
  const stats = await fs.promises.stat(filePath);
  return formatDate(stats.mtime);
}

async function collectHtmlFiles(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      const relativePath = path.relative(REPO_ROOT, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

function buildSitemapContent(urls) {
  const entries = urls
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildSitemapIndex(sitemaps) {
  const entries = sitemaps
    .sort((a, b) => a.loc.localeCompare(b.loc))
    .map(
      ({ loc, lastmod }) =>
        `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

async function writeFile(targetPath, contents) {
  await fs.promises.writeFile(targetPath, contents, 'utf8');
  return getLastModifiedDate(targetPath);
}

async function main() {
  const htmlFiles = await collectHtmlFiles(REPO_ROOT);

  const mainUrls = [];
  const locationUrls = [];

  for (const htmlPath of htmlFiles) {
    const target = classifyPath(htmlPath) === 'location' ? locationUrls : mainUrls;
    const loc = `${BASE_URL}${toWebPath(htmlPath)}`;
    const lastmod = await getLastModifiedDate(path.join(REPO_ROOT, htmlPath));
    target.push({ loc, lastmod });
  }

  const mainLastmod = await writeFile(
    path.join(REPO_ROOT, 'sitemap-main.xml'),
    buildSitemapContent(mainUrls)
  );

  const locationLastmod = await writeFile(
    path.join(REPO_ROOT, 'sitemap-locations.xml'),
    buildSitemapContent(locationUrls)
  );

  const sitemapEntries = [
    { loc: `${BASE_URL}/sitemap-locations.xml`, lastmod: locationLastmod },
    { loc: `${BASE_URL}/sitemap-main.xml`, lastmod: mainLastmod },
  ];

  const blogPath = path.join(REPO_ROOT, 'sitemap-blog.xml');
  if (fs.existsSync(blogPath)) {
    const blogLastmod = await getLastModifiedDate(blogPath);
    sitemapEntries.push({ loc: `${BASE_URL}/sitemap-blog.xml`, lastmod: blogLastmod });
  }

  await writeFile(path.join(REPO_ROOT, 'sitemap.xml'), buildSitemapIndex(sitemapEntries));
}

main().catch((error) => {
  console.error('Failed to build sitemaps:', error);
  process.exitCode = 1;
});
