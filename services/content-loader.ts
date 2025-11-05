import { promises as fs } from "node:fs";
import { join, relative, resolve } from "node:path";
import { cache } from "react";

import sanitizeHtml from "sanitize-html";
import { z } from "zod";

const CONTENT_ROOT = resolve(process.cwd(), "content/html");

export interface ContentMetadata {
  readonly title: string;
  readonly description?: string;
  readonly canonical?: string;
  readonly image?: string;
}

export interface ContentPage {
  readonly slug: readonly string[];
  readonly html: string;
  readonly metadata: ContentMetadata;
  readonly updatedAt: Date;
}

export interface ContentIndexEntry {
  readonly slug: readonly string[];
  readonly metadata: ContentMetadata;
  readonly updatedAt: Date;
}

const slugSegmentSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/i, "Only alphanumeric characters and dashes are allowed");

const slugSchema = z.array(slugSegmentSchema);

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "section",
    "article",
    "header",
    "footer",
    "figure",
    "figcaption",
    "picture",
    "source",
    "nav",
    "main",
    "aside",
    "select",
    "option",
    "label",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": [
      "class",
      "id",
      "role",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "data-track",
      "data-label",
      "data-service-type",
      "data-city",
      "data-year",
      "data-feed-source",
      "data-event",
      "data-supabase",
      "data-service",
      "data-geo",
      "data-cta",
      "data-sku",
      "itemprop",
      "itemscope",
      "itemtype",
      "data-utm",
      "data-lat",
      "data-lng",
      "style",
    ],
    a: [
      "href",
      "title",
      "target",
      "rel",
      "data-track",
      "data-label",
      "data-service-type",
      "data-city",
      "aria-label",
    ],
    img: [
      "src",
      "srcset",
      "sizes",
      "alt",
      "width",
      "height",
      "loading",
      "decoding",
      "data-track",
      "data-label",
      "data-service-type",
    ],
    source: ["srcset", "sizes", "media", "type"],
    form: ["method", "action", "class", "id", "data-supabase", "data-event"],
    input: [
      "type",
      "name",
      "value",
      "placeholder",
      "required",
      "min",
      "max",
      "step",
      "autocomplete",
      "data-track",
      "aria-label",
    ],
    textarea: ["name", "placeholder", "rows", "required", "aria-label"],
    button: [
      "type",
      "data-track",
      "data-label",
      "data-service-type",
      "data-city",
      "aria-label",
    ],
    iframe: ["src", "title", "loading", "allow", "referrerpolicy"],
  },
  allowedSchemesByTag: {
    ...sanitizeHtml.defaults.allowedSchemesByTag,
    img: ["data", "http", "https"],
    source: ["data", "http", "https"],
  },
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.href?.startsWith("javascript")) {
        return { tagName: "span", attribs: {} };
      }
      const normalizedHref = attribs.href ? normalizeInternalHref(attribs.href) : undefined;
      return { tagName, attribs: { ...attribs, href: normalizedHref } };
    },
  },
};

function normalizeInternalHref(href: string): string {
  if (!href) {
    return href;
  }
  const trimmed = href.trim();
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return trimmed;
  }
  if (trimmed.startsWith("#")) {
    return trimmed;
  }
  const [pathPart, hashPart] = trimmed.split("#", 2);
  const [pathWithoutQuery, queryPart] = pathPart.split("?", 2);
  let normalizedPath = pathWithoutQuery.replace(/\.html$/i, "");
  normalizedPath = normalizedPath.replace(/\/?index$/i, "");
  if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }
  if (normalizedPath.length === 0) {
    normalizedPath = "/";
  }
  const query = queryPart ? `?${queryPart}` : "";
  const hash = hashPart ? `#${hashPart}` : "";
  return `${normalizedPath}${query}${hash}`;
}

async function readHtmlFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, { encoding: "utf8" });
}

function extractBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  return sanitizeHtml(bodyContent, sanitizeOptions);
}

function extractMetadata(html: string): ContentMetadata {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  return {
    title: titleMatch ? titleMatch[1].trim() : "Osprey Exterior",
    description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
    canonical: canonicalMatch ? canonicalMatch[1].trim() : undefined,
    image: imageMatch ? imageMatch[1].trim() : undefined,
  };
}

function resolveHtmlPathCandidates(slug: readonly string[]): string[] {
  const safeSlug = slugSchema.parse(slug);
  if (safeSlug.length === 0) {
    return [join(CONTENT_ROOT, "index.html")];
  }
  const directPath = join(CONTENT_ROOT, ...safeSlug) + ".html";
  const indexPath = join(CONTENT_ROOT, ...safeSlug, "index.html");
  return [directPath, indexPath];
}

async function findExistingPath(candidates: readonly string[]): Promise<string> {
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Continue searching other candidates
    }
  }
  const [first] = candidates;
  throw new Error(`Content file not found for path ${relative(CONTENT_ROOT, first)}`);
}

async function loadPageContentInternal(slug: readonly string[]): Promise<ContentPage> {
  const candidates = resolveHtmlPathCandidates(slug);
  const resolvedPath = await findExistingPath(candidates);
  const [rawHtml, stats] = await Promise.all([
    readHtmlFile(resolvedPath),
    fs.stat(resolvedPath),
  ]);
  return {
    slug,
    html: extractBody(rawHtml),
    metadata: extractMetadata(rawHtml),
    updatedAt: stats.mtime,
  };
}

export const loadPageContent = cache(loadPageContentInternal);

async function walkDirectory(currentPath: string, segments: string[]): Promise<ContentIndexEntry[]> {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const results: ContentIndexEntry[] = [];

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith(".")) {
        return;
      }
      if (entry.isDirectory()) {
        const childResults = await walkDirectory(join(currentPath, entry.name), [...segments, entry.name]);
        results.push(...childResults);
        return;
      }
      if (!entry.name.endsWith(".html")) {
        return;
      }
      const baseName = entry.name.replace(/\.html$/, "");
      const slugPath = baseName === "index" ? segments : [...segments, baseName];
      const filePath = join(currentPath, entry.name);
      const [html, stats] = await Promise.all([readHtmlFile(filePath), fs.stat(filePath)]);
      results.push({
        slug: slugPath,
        metadata: extractMetadata(html),
        updatedAt: stats.mtime,
      });
    }),
  );

  return results;
}

export async function getAllContentEntries(): Promise<ContentIndexEntry[]> {
  const entries = await walkDirectory(CONTENT_ROOT, []);
  return entries.map((entry) => ({
    slug: entry.slug,
    metadata: entry.metadata,
    updatedAt: entry.updatedAt,
  }));
}
