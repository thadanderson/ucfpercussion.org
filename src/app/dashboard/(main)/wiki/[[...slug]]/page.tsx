import { getWikiPage } from "@/lib/wiki";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function WikiPage({ params }: Props) {
  const { slug } = await params;
  const page = await getWikiPage(slug ?? []);

  if (!page) notFound();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <article>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
        <div
          className="wiki-body"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}
