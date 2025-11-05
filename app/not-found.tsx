import LegacyContent from "@/components/LegacyContent";
import { loadPageContent } from "@/services/content-loader";

export default async function NotFoundPage(): Promise<JSX.Element> {
  const page = await loadPageContent(["404"]);
  return <LegacyContent page={page} />;
}
