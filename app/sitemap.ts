import type { MetadataRoute } from "next";

import { getAllContentEntries } from "@/services/content-loader";

const BASE_URL = "https://ospreyexterior.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getAllContentEntries();
  return entries.map((entry) => {
    const slugPath = entry.slug.join("/");
    const url = slugPath.length > 0 ? `${BASE_URL}/${slugPath}` : BASE_URL;
    return {
      url,
      lastModified: entry.updatedAt.toISOString(),
    };
  });
}
