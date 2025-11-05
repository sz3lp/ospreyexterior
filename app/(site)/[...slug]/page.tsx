import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import LegacyContent from "@/components/LegacyContent";
import { logError } from "@/lib/logger";
import { getAllContentEntries, loadPageContent } from "@/services/content-loader";

export const revalidate = 3600;
export const dynamicParams = false;

interface PageProps {
  readonly params: {
    readonly slug?: string[];
  };
}

type LoadedPage = Awaited<ReturnType<typeof loadPageContent>>;

export async function generateStaticParams(): Promise<Array<{ slug: string[] }>> {
  const entries = await getAllContentEntries();
  return entries
    .filter((entry) => entry.slug.length > 0)
    .map((entry) => ({ slug: entry.slug as string[] }));
}

async function fetchPage(slug: string[]): Promise<LoadedPage> {
  try {
    return await loadPageContent(slug);
  } catch (error) {
    const headerList = headers();
    logError("page_lookup_failed", {
      slug,
      requestId: headerList.get("x-request-id") ?? undefined,
      traceId: headerList.get("x-trace-id") ?? undefined,
      remediation: "Create a matching HTML file under content/html or update routes.",
      error: error instanceof Error ? error.message : String(error),
    });
    notFound();
    throw error instanceof Error ? error : new Error("Page missing");
  }
}

export default async function CatchAllPage({ params }: PageProps): Promise<JSX.Element> {
  const slug = params.slug ?? [];
  if (slug.length === 0) {
    notFound();
  }
  const page = await fetchPage(slug);
  return <LegacyContent page={page} />;
}

export async function generateMetadata(
  { params }: PageProps,
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = params.slug ?? [];
  if (slug.length === 0) {
    return {};
  }
  const page = await fetchPage(slug);
  const { metadata } = page;
  const slugPath = slug.join("/");
  const fallbackCanonical = slugPath.length > 0 ? `https://ospreyexterior.com/${slugPath}` : "https://ospreyexterior.com/";
  const canonical = metadata.canonical ?? fallbackCanonical;
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
