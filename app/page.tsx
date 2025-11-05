import type { Metadata } from "next";

import LegacyContent from "@/components/LegacyContent";
import { loadPageContent } from "@/services/content-loader";

export const revalidate = 3600;

export default async function HomePage(): Promise<JSX.Element> {
  const page = await loadPageContent([]);
  return <LegacyContent page={page} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadPageContent([]);
  const { metadata } = page;
  const canonical = metadata.canonical ?? "https://ospreyexterior.com/";
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: canonical,
      images: metadata.image ? [{ url: metadata.image }] : undefined,
    },
  };
}
