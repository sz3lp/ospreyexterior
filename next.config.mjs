import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function collectHtmlFiles(currentDir, relative = '') {
  const directory = path.join(currentDir, relative);
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    if (entry.isDirectory()) {
      return collectHtmlFiles(currentDir, path.join(relative, entry.name));
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      return [path.join(relative, entry.name)];
    }

    return [];
  });
}

function toSourceRoute(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  if (normalized === 'index.html') {
    return '/';
  }

  if (normalized.endsWith('/index.html')) {
    const base = normalized.slice(0, -'/index.html'.length);
    return `/${base}`;
  }

  return `/${normalized.slice(0, -'.html'.length)}`;
}

const htmlFiles = collectHtmlFiles(PUBLIC_DIR);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const seenSources = new Set();

    return htmlFiles
      .map((file) => {
        const source = toSourceRoute(file);
        if (seenSources.has(source)) {
          return null;
        }
        seenSources.add(source);
        return {
          source,
          destination: `/${file.replace(/\\/g, '/')}`,
        };
      })
      .filter(Boolean);
  },
};

export default nextConfig;
