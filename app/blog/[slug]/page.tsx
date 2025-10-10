import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { LeadForm } from '@/components/forms/LeadForm';
import { getPostBySlug, getPosts } from '@/lib/data';
import { buildArticleJsonLd, buildLocalBusinessJsonLd, buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export const generateMetadata = async ({ params }: { params: { slug: string } }): Promise<Metadata> => {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return buildMetadata({ title: 'Article Not Found' });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    canonical: `https://ospreyexterior.com/blog/${post.slug}`
  });
};

const BlogPostPage = async ({ params }: { params: { slug: string } }) => {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const publishedDate = post.published_at ? new Date(post.published_at).toLocaleDateString() : null;

  return (
    <article className="section">
      <JsonLd data={[buildLocalBusinessJsonLd(), buildArticleJsonLd(post)]} />
      <div className="container-default mx-auto max-w-3xl space-y-10">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{publishedDate}</p>
          <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-slate-600">{post.excerpt}</p>}
        </header>
        {post.content ? (
          <div className="prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        ) : (
          <p className="text-slate-600">Stay tuned for the full story on this project.</p>
        )}
        <LeadForm city={post.city_slug || undefined} />
      </div>
    </article>
  );
};

export default BlogPostPage;
