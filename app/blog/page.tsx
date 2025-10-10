import { Metadata } from 'next';
import { PostCard } from '@/components/cards/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { LeadForm } from '@/components/forms/LeadForm';
import { getPosts } from '@/lib/data';
import { buildLocalBusinessJsonLd, buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Project Journal & Resources',
  description: 'Browse the latest exterior remodeling projects, design inspiration, and maintenance guides from Osprey Exterior.',
  canonical: 'https://ospreyexterior.com/blog'
});

const BlogPage = async () => {
  const posts = await getPosts();

  return (
    <section className="section">
      <JsonLd data={buildLocalBusinessJsonLd()} />
      <div className="container-default space-y-10">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Project Journal</h1>
          <p className="text-lg text-slate-600">
            Discover recent projects, homeowner spotlights, and practical tips for keeping your exterior looking sharp year-round.
          </p>
        </div>
        {posts.length === 0 ? (
          <div className="card text-center text-sm text-slate-600">
            <p>No articles yet. Check back soon for updates from the field.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
        <LeadForm />
      </div>
    </section>
  );
};

export default BlogPage;
